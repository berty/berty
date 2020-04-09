package mini

import (
	"context"
	"fmt"
	"io"
	"strings"

	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/gdamore/tcell"
	"github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	p2plog "github.com/ipfs/go-log"
	"github.com/juju/fslock"
	"github.com/rivo/tview"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

type Opts struct {
	RemoteAddr      string
	GroupInvitation string
	Port            uint
	RootDS          datastore.Batching
	Logger          *zap.Logger
}

var globalLogger *zap.Logger

func newService(ctx context.Context, opts *Opts) (bertyprotocol.Service, func()) {
	var (
		swarmAddresses []string = nil
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

	rootDS := sync_ds.MutexWrap(opts.RootDS)

	ipfsDS := ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("ipfs"))
	cfg, err := ipfsutil.CreateBuildConfigWithDatastore(&ipfsutil.BuildOpts{
		SwarmAddresses: swarmAddresses,
	}, ipfsDS)
	if err != nil {
		panicUnlockFS(err, lock)
	}

	orbitdbDS := ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("orbitdb"))

	api, node, err := ipfsutil.NewConfigurableCoreAPI(ctx, cfg, ipfsutil.OptionMDNSDiscovery)
	if err != nil {
		panicUnlockFS(err, lock)
	}

	mk := bertyprotocol.NewMessageKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("messages")))
	ks := ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("account")))

	service, err := bertyprotocol.New(bertyprotocol.Opts{
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
	}
}

func Main(opts *Opts) {
	p2plog.SetAllLoggers(p2plog.LevelFatal)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var client bertyprotocol.ProtocolServiceClient
	if opts.RemoteAddr == "" {
		service, clean := newService(ctx, opts)
		defer clean()

		protocolClient, err := bertyprotocol.NewClient(service)
		if err != nil {
			panic(err)
		}

		defer protocolClient.Close()

		client = protocolClient
	} else {
		cc, err := grpc.Dial(opts.RemoteAddr, grpc.WithInsecure())
		if err != nil {
			panic(err)
		}

		client = bertyprotocol.NewProtocolServiceClient(cc)
	}

	config, err := client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		panic(err)
	}

	app := tview.NewApplication()

	accountGroup, err := client.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
		GroupPK: config.AccountGroupPK,
	})
	if err != nil {
		panic(err)
	}
	if opts.Logger != nil {
		globalLogger = opts.Logger.Named(pkAsShortID(accountGroup.Group.PublicKey))
	} else {
		globalLogger = zap.NewNop()
	}

	tabbedView := newTabbedGroups(ctx, accountGroup, client, app)
	if len(opts.GroupInvitation) > 0 {
		req := &bertytypes.GroupMetadataSubscribe_Request{GroupPK: accountGroup.Group.PublicKey}
		cl, err := tabbedView.client.GroupMetadataSubscribe(ctx, req)
		if err != nil {
			panic(err)
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
				panic(err)
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

	chat := tview.NewFlex().
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

	if err := app.SetRoot(chat, true).SetFocus(chat).Run(); err != nil {
		panic(err)
	}
}
