package mini

import (
	"context"
	"fmt"
	"io"
	"os"
	"strings"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/gdamore/tcell"
	"github.com/gdamore/tcell/terminfo"
	datastore "github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	p2plog "github.com/ipfs/go-log"
	"github.com/juju/fslock"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/rivo/tview"
	grpc_trace "go.opentelemetry.io/otel/plugin/grpctrace"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

type Opts struct {
	Bootstrap      []string
	RendezVousPeer *peer.AddrInfo

	RemoteAddr      string
	GroupInvitation string
	Port            uint
	RootDS          datastore.Batching
	Logger          *zap.Logger
	DisplayName     string
}

var globalLogger *zap.Logger

func newService(ctx context.Context, logger *zap.Logger, opts *Opts) (bertyprotocol.Service, func()) {
	var (
		swarmAddresses []string
		lock           *fslock.Lock
	)

	if opts.Port != 0 {
		swarmAddresses = []string{
			fmt.Sprintf("/ip4/0.0.0.0/tcp/%d", opts.Port),
			fmt.Sprintf("/ip6/0.0.0.0/tcp/%d", opts.Port),
			fmt.Sprintf("/ip4/0.0.0.0/udp/%d/quic", opts.Port+1),
			fmt.Sprintf("/ip6/0.0.0.0/udp/%d/quic", opts.Port+1),
		}
	} else {
		swarmAddresses = []string{
			"/ip4/0.0.0.0/tcp/0",
			"/ip6/0.0.0.0/tcp/0",
			"/ip4/0.0.0.0/udp/0/quic",
			"/ip6/0.0.0.0/udp/0/quic",
		}
	}

	if opts.RendezVousPeer == nil {
		opts.RendezVousPeer = &peer.AddrInfo{}
	}

	rdvaddrs, err := peer.AddrInfoToP2pAddrs(opts.RendezVousPeer)
	if err != nil {
		panicUnlockFS(err, lock)
	}

	for _, maddr := range rdvaddrs {
		opts.Bootstrap = append(opts.Bootstrap, maddr.String())
	}

	rootDS := sync_ds.MutexWrap(opts.RootDS)
	ipfsDS := ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("ipfs"))
	routingOpt, crouting := ipfsutil.NewTinderRouting(logger, opts.RendezVousPeer, false)
	api, node, err := ipfsutil.NewCoreAPIFromDatastore(ctx, ipfsDS, &ipfsutil.CoreAPIConfig{
		BootstrapAddrs: opts.Bootstrap,
		SwarmAddrs:     swarmAddresses,
		Routing:        routingOpt,
		Options:        []ipfsutil.CoreAPIOption{ipfsutil.OptionMDNSDiscovery},
	})
	if err != nil {
		panicUnlockFS(err, lock)
	}

	// wait to get routing
	routing := <-crouting

	mk := bertyprotocol.NewMessageKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("messages")))
	ks := ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("account")))
	orbitdbDS := ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("orbitdb"))
	service, err := bertyprotocol.New(bertyprotocol.Opts{
		TinderDriver:    routing,
		IpfsCoreAPI:     api,
		DeviceKeystore:  bertyprotocol.NewDeviceKeystore(ks),
		RootContext:     ctx,
		RootDatastore:   rootDS,
		MessageKeystore: mk,
		OrbitCache:      bertyprotocol.NewOrbitDatastoreCache(orbitdbDS),
	})

	if err != nil {
		panic(err)
	}

	return service, func() {
		node.Close()
		service.Close()
		routing.IpfsDHT.Close() // manually close dht since ipfs wont be able to that
	}
}

func Main(ctx context.Context, opts *Opts) error {
	_, err := terminfo.LookupTerminfo(os.Getenv("TERM"))
	if err != nil {
		return errcode.ErrCLINoTermcaps.Wrap(err)
	}

	p2plog.SetAllLoggers(p2plog.LevelFatal)

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	trClient := tracer.New("grpc-client")
	clientOpts := []grpc.DialOption{
		grpc.WithUnaryInterceptor(grpc_trace.UnaryClientInterceptor(trClient)),
		grpc.WithStreamInterceptor(grpc_trace.StreamClientInterceptor(trClient)),
	}

	var client bertyprotocol.ProtocolServiceClient
	if opts.RemoteAddr == "" {
		trServer := tracer.New("grpc-server")

		service, clean := newService(ctx, opts.Logger, opts)
		defer clean()

		grpcServer := grpc.NewServer(
			grpc.UnaryInterceptor(grpc_trace.UnaryServerInterceptor(trServer)),
			grpc.StreamInterceptor(grpc_trace.StreamServerInterceptor(trServer)),
		)

		protocolClient, err := bertyprotocol.NewClientFromServer(grpcServer, service, clientOpts...)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		defer protocolClient.Close()

		client = protocolClient
	} else {
		cc, err := grpc.Dial(opts.RemoteAddr, append([]grpc.DialOption{grpc.WithInsecure()},
			clientOpts...,
		)...)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		client = bertyprotocol.NewProtocolServiceClient(cc)
	}

	messenger := bertymessenger.New(client, &bertymessenger.Opts{Logger: opts.Logger.Named("messenger")})

	config, err := client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	app := tview.NewApplication()

	accountGroup, err := client.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
		GroupPK: config.AccountGroupPK,
	})
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	if opts.Logger != nil {
		globalLogger = opts.Logger.Named(pkAsShortID(accountGroup.Group.PublicKey))
	} else {
		globalLogger = zap.NewNop()
	}

	tabbedView := newTabbedGroups(ctx, accountGroup, client, messenger, app, opts.DisplayName)
	if len(opts.GroupInvitation) > 0 {
		req := &bertytypes.GroupMetadataSubscribe_Request{GroupPK: accountGroup.Group.PublicKey}
		cl, err := tabbedView.client.GroupMetadataSubscribe(ctx, req)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		go func() {
			for {
				evt, err := cl.Recv()
				switch err {
				case io.EOF: // gracefully ended @TODO: log this
					return
				case nil: // ok
				default:
					panic(err)
				}

				if evt.Metadata.EventType != bertytypes.EventTypeAccountGroupJoined {
					continue
				}

				tabbedView.NextGroup()
			}
		}()

		for _, invit := range strings.Split(opts.GroupInvitation, ",") {
			if err := groupJoinCommand(ctx, tabbedView.accountGroupView, invit); err != nil {
				return errcode.TODO.Wrap(err)
			}
		}
	}

	input := tview.NewInputField().
		SetFieldTextColor(tcell.ColorWhite).
		SetFieldBackgroundColor(tcell.ColorBlack)

	input.SetDoneFunc(func(key tcell.Key) {
		if key == tcell.KeyEnter {
			msg := input.GetText()
			input.SetText("")

			tabbedView.GetActiveViewGroup().OnSubmit(ctx, msg)
		}
	})

	inputBox := tview.NewFlex().
		AddItem(tview.NewTextView().SetText(">> "), 3, 0, false).
		AddItem(input, 0, 1, true)

	mainUI := tview.NewFlex().
		AddItem(tabbedView.GetTabs(), 10, 0, false).
		AddItem(tview.NewFlex().SetDirection(tview.FlexRow).
			AddItem(tabbedView.GetHistory(), 0, 1, false).
			AddItem(inputBox, 1, 1, true), 0, 1, true)

	app.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		handlers := map[tcell.Key]func() bool{
			tcell.KeyCtrlC: func() bool { app.Stop(); return true },
			tcell.KeyEsc:   func() bool { app.Stop(); return true },
			tcell.KeyHome:  func() bool { tabbedView.GetActiveViewGroup().messages.historyScroll.ScrollToBeginning(); return true },
			tcell.KeyEnd:   func() bool { tabbedView.GetActiveViewGroup().messages.historyScroll.ScrollToEnd(); return true },
			tcell.KeyPgUp:  func() bool { tabbedView.GetActiveViewGroup().ScrollToOffset(-10); return true },
			tcell.KeyPgDn:  func() bool { tabbedView.GetActiveViewGroup().ScrollToOffset(+10); return true },
			tcell.KeyCtrlP: func() bool { tabbedView.PrevGroup(); return true },
			tcell.KeyCtrlN: func() bool { tabbedView.NextGroup(); return true },
			tcell.KeyUp: func() bool {
				if event.Modifiers() == tcell.ModAlt || event.Modifiers() == tcell.ModCtrl {
					tabbedView.PrevGroup()
				} else {
					input.SetText(tabbedView.GetActiveViewGroup().inputHistory.Prev())
				}
				return true
			},
			tcell.KeyDown: func() bool {
				if event.Modifiers() == tcell.ModAlt || event.Modifiers() == tcell.ModCtrl {
					tabbedView.NextGroup()
				} else {
					input.SetText(tabbedView.GetActiveViewGroup().inputHistory.Next())
				}
				return true
			},
		}

		if handler, ok := handlers[event.Key()]; ok {
			handler()
			return nil
		}

		return event
	})

	if err := app.SetRoot(mainUI, true).SetFocus(mainUI).Run(); err != nil {
		return errcode.TODO.Wrap(err)
	}

	return nil
}
