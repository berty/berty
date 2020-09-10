package mini

import (
	"context"
	"fmt"
	"io"
	"os"
	"strings"

	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/gdamore/tcell"
	"github.com/gdamore/tcell/terminfo"
	"github.com/rivo/tview"
	"go.uber.org/zap"
)

type Opts struct {
	MessengerClient bertymessenger.MessengerServiceClient
	ProtocolClient  bertyprotocol.ProtocolServiceClient
	Logger          *zap.Logger
	GroupInvitation string
	DisplayName     string
}

var globalLogger *zap.Logger

func Main(ctx context.Context, opts *Opts) error {
	if opts.MessengerClient == nil {
		return errcode.ErrMissingInput.Wrap(fmt.Errorf("missing messenger client"))
	}
	if opts.ProtocolClient == nil {
		return errcode.ErrMissingInput.Wrap(fmt.Errorf("missing protocol client"))
	}
	_, err := terminfo.LookupTerminfo(os.Getenv("TERM"))
	if err != nil {
		return errcode.ErrCLINoTermcaps.Wrap(err)
	}
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	config, err := opts.ProtocolClient.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	app := tview.NewApplication()

	accountGroup, err := opts.ProtocolClient.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
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

	tabbedView := newTabbedGroups(ctx, accountGroup, opts.ProtocolClient, opts.MessengerClient, app, opts.DisplayName)
	if len(opts.GroupInvitation) > 0 {
		req := &bertytypes.GroupMetadataSubscribe_Request{GroupPK: accountGroup.Group.PublicKey}
		cl, err := tabbedView.protocol.GroupMetadataSubscribe(ctx, req)
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
