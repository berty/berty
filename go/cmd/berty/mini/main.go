package mini

import (
	"context"
	"strings"

	"github.com/gdamore/tcell"
	ipfslogger "github.com/ipfs/go-log"
	"github.com/rivo/tview"
	"github.com/whyrusleeping/go-logging"

	"berty.tech/berty/go/internal/orbitutil"
)

type Opts struct {
	GroupInvitation string
	Port            uint
	Path            string
}

func Main(opts *Opts) {
	ipfslogger.SetAllLoggers(logging.CRITICAL)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	odb, ds, node, lock := initOrbitDB(ctx, opts)
	defer unlockFS(lock)
	defer ds.Close()
	defer node.Close()

	cg, err := odb.OpenAccountGroup(ctx, nil)
	if err != nil {
		panic(err)
	}

	app := tview.NewApplication()

	tabbedView := newTabbedGroups(ctx, cg, odb, app)
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

	err = orbitutil.ActivateGroupContext(ctx, cg)
	if err != nil {
		panic(err)
	}

	app.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		handlers := map[tcell.Key]func() bool{
			tcell.KeyCtrlC: func() bool { app.Stop(); return true },
			tcell.KeyEsc:   func() bool { app.Stop(); return true },
			tcell.KeyHome:  func() bool { tabbedView.GetActiveViewGroup().messages.historyScroll.ScrollToBeginning(); return true },
			tcell.KeyEnd:   func() bool { tabbedView.GetActiveViewGroup().messages.historyScroll.ScrollToEnd(); return true },
			tcell.KeyPgUp:  func() bool { tabbedView.GetActiveViewGroup().ScrollToOffset(-10); return true },
			tcell.KeyPgDn:  func() bool { tabbedView.GetActiveViewGroup().ScrollToOffset(+10); return true },
			tcell.KeyUp: func() bool {
				if event.Modifiers() == tcell.ModAlt {
					tabbedView.PrevGroup()
					return true
				}

				input.SetText(tabbedView.GetActiveViewGroup().inputHistory.Prev())

				return true
			},
			tcell.KeyDown: func() bool {
				if event.Modifiers() == tcell.ModAlt {
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
