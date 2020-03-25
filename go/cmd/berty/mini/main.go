package mini

import (
	"context"
	"fmt"
	"strings"

	"berty.tech/berty/v2/go/internal/account"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/orbitutil"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"github.com/gdamore/tcell"
	"github.com/ipfs/go-datastore"
	sync_ds "github.com/ipfs/go-datastore/sync"
	ipfslogger "github.com/ipfs/go-log"
	"github.com/juju/fslock"
	"github.com/rivo/tview"
	"github.com/whyrusleeping/go-logging"
)

type Opts struct {
	GroupInvitation string
	Port            uint
	RootDS          datastore.Batching
}

func Main(opts *Opts) {
	ipfslogger.SetAllLoggers(logging.CRITICAL)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	var (
		swarmAddresses []string = nil
		lock           *fslock.Lock
	)

	if opts.Port != 0 {
		swarmAddresses = []string{
			fmt.Sprintf("/ip4/0.0.0.0/tcp/%d", opts.Port),
			fmt.Sprintf("/ip6/0.0.0.0/tcp/%d", opts.Port),
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

	mk := bertyprotocol.NewDatastoreMessageKeys(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("messages")))
	ks := ipfsutil.NewDatastoreKeystore(ipfsutil.NewNamespacedDatastore(rootDS, datastore.NewKey("account")))

	client, err := bertyprotocol.New(bertyprotocol.Opts{
		IpfsCoreAPI:   api,
		Account:       account.New(ks),
		RootContext:   ctx,
		RootDatastore: rootDS,
		MessageKeys:   mk,
		OrbitCache:    orbitutil.NewOrbitDatastoreCache(orbitdbDS),
		DBConstructor: orbitutil.NewBertyOrbitDB,
	})

	if err != nil {
		panic(err)
	}

	config, err := client.InstanceGetConfiguration(ctx, nil)
	if err != nil {
		panic(err)
	}

	defer node.Close()

	app := tview.NewApplication()

	accountGroup, err := client.GroupInfo(ctx, &bertyprotocol.GroupInfo_Request{
		GroupPK: config.AccountGroupPK,
	})
	if err != nil {
		panic(err)
	}

	tabbedView := newTabbedGroups(ctx, accountGroup, client, app)
	if len(opts.GroupInvitation) > 0 {
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
					return true
				}

				input.SetText(tabbedView.GetActiveViewGroup().inputHistory.Prev())

				return true
			},
			tcell.KeyDown: func() bool {
				if event.Modifiers() == tcell.ModAlt || event.Modifiers() == tcell.ModCtrl {
					tabbedView.NextGroup()
					return true
				}

				input.SetText(tabbedView.GetActiveViewGroup().inputHistory.Next())

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
