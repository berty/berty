package mini

import (
	"context"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/gdamore/tcell"
	"github.com/gdamore/tcell/terminfo"
	"github.com/rivo/tview"
	"go.uber.org/zap"

	assets "berty.tech/berty/v2/go/pkg/assets"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/weshnet/pkg/lifecycle"
	"berty.tech/weshnet/pkg/protocoltypes"
)

type Opts struct {
	MessengerClient  messengertypes.MessengerServiceClient
	ProtocolClient   protocoltypes.ProtocolServiceClient
	Logger           *zap.Logger
	GroupInvitation  string
	DisplayName      string
	LifecycleManager *lifecycle.Manager
}

var globalLogger *zap.Logger

func Main(ctx context.Context, opts *Opts) error {
	assets.Noop() // embed assets

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

	config, err := opts.ProtocolClient.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	app := tview.NewApplication()

	accountGroup, err := opts.ProtocolClient.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
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
		req := &protocoltypes.GroupMetadataList_Request{GroupPK: accountGroup.Group.PublicKey}
		cl, err := tabbedView.protocol.GroupMetadataList(ctx, req)
		if err != nil {
			return errcode.ErrEventListMetadata.Wrap(err)
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

				if evt.Metadata.EventType != protocoltypes.EventTypeAccountGroupJoined {
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

	// The inactive timer is disabled for now because it will cause group subs to be suspended
	// when going to inactive state
	// This will prevent desktop notification when inactive but they should not happen if subs
	// are suspended anyway

	/*
		const ShouldBecomeInactive = time.Second * 30
		inactiveTimer := time.AfterFunc(ShouldBecomeInactive, func() {
			opts.LifecycleManager.UpdateState(lifecycle.StateInactive)
		})
	*/

	keyboardCommandsMap := buildKeyboardCommandMap()

	app.SetInputCapture(func(event *tcell.EventKey) *tcell.EventKey {
		/*

			// reset timer
			if !inactiveTimer.Stop() {
				// AfterFunc timer should already have consume `inactiveTimer.C`
				opts.LifecycleManager.UpdateState(lifecycle.StateActive)
			}
			inactiveTimer.Reset(ShouldBecomeInactive)

		*/
		if _, ok := keyboardCommandsMap[event.Modifiers()]; ok {
			if action, ok := keyboardCommandsMap[event.Modifiers()][event.Key()]; ok {
				action(app, tabbedView, input)
				return nil
			}
		}

		return event
	})

	if err := app.SetRoot(mainUI, true).SetFocus(mainUI).Run(); err != nil {
		return errcode.TODO.Wrap(err)
	}

	return nil
}
