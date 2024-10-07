package mini

import (
	"github.com/gdamore/tcell"
	"github.com/rivo/tview"
)

type keyboardShortcut struct {
	modifier tcell.ModMask
	key      tcell.Key
}

type keyboardAction func(app *tview.Application, tabbedView *tabbedGroupsView, input *tview.InputField)

type keyboardCommand struct {
	shortcuts []keyboardShortcut
	help      string
	action    keyboardAction
}

func keyboardCommands() []*keyboardCommand {
	return []*keyboardCommand{
		{
			shortcuts: []keyboardShortcut{
				{key: tcell.KeyCtrlC},
				{key: tcell.KeyEsc},
			},
			help: "Quit the app",
			action: func(app *tview.Application, tabbedView *tabbedGroupsView, input *tview.InputField) { //nolint:revive
				app.Stop()
			},
		},
		{
			shortcuts: []keyboardShortcut{
				{key: tcell.KeyHome},
			},
			help: "View the beginning of the message list",
			action: func(app *tview.Application, tabbedView *tabbedGroupsView, input *tview.InputField) { //nolint:revive
				tabbedView.GetActiveViewGroup().messages.historyScroll.ScrollToBeginning()
			},
		},
		{
			shortcuts: []keyboardShortcut{
				{key: tcell.KeyEnd},
			},
			help: "View the end of the message list",
			action: func(app *tview.Application, tabbedView *tabbedGroupsView, input *tview.InputField) { //nolint:revive
				tabbedView.GetActiveViewGroup().messages.historyScroll.ScrollToEnd()
			},
		},
		{
			shortcuts: []keyboardShortcut{
				{key: tcell.KeyPgUp},
			},
			help: "View 10 previous messages in the list",
			action: func(app *tview.Application, tabbedView *tabbedGroupsView, input *tview.InputField) { //nolint:revive
				tabbedView.GetActiveViewGroup().ScrollToOffset(-10)
			},
		},
		{
			shortcuts: []keyboardShortcut{
				{key: tcell.KeyPgDn},
			},
			help: "View 10 next messages in the list",
			action: func(app *tview.Application, tabbedView *tabbedGroupsView, input *tview.InputField) { //nolint:revive
				tabbedView.GetActiveViewGroup().ScrollToOffset(+10)
			},
		},
		{
			shortcuts: []keyboardShortcut{
				{key: tcell.KeyCtrlP},
				{
					modifier: tcell.ModAlt,
					key:      tcell.KeyUp,
				},
				{
					modifier: tcell.ModCtrl,
					key:      tcell.KeyUp,
				},
			},
			help: "Go to the previous group displayed in the sidebar",
			action: func(app *tview.Application, tabbedView *tabbedGroupsView, input *tview.InputField) { //nolint:revive
				tabbedView.PrevGroup()
			},
		},
		{
			shortcuts: []keyboardShortcut{
				{key: tcell.KeyCtrlN},
				{
					modifier: tcell.ModAlt,
					key:      tcell.KeyDown,
				},
				{
					modifier: tcell.ModCtrl,
					key:      tcell.KeyDown,
				},
			},
			help: "Go to the next group displayed in the sidebar",
			action: func(app *tview.Application, tabbedView *tabbedGroupsView, input *tview.InputField) { //nolint:revive
				tabbedView.NextGroup()
			},
		},
		{
			shortcuts: []keyboardShortcut{
				{key: tcell.KeyUp},
			},
			help: "Restore the previous message sent in the input field",
			action: func(app *tview.Application, tabbedView *tabbedGroupsView, input *tview.InputField) { //nolint:revive
				input.SetText(tabbedView.GetActiveViewGroup().inputHistory.Prev())
			},
		},
		{
			shortcuts: []keyboardShortcut{
				{key: tcell.KeyDown},
			},
			help: "Restore the next message sent in the input field",
			action: func(app *tview.Application, tabbedView *tabbedGroupsView, input *tview.InputField) { //nolint:revive
				input.SetText(tabbedView.GetActiveViewGroup().inputHistory.Next())
			},
		},
	}
}

func buildKeyboardCommandMap() map[tcell.ModMask]map[tcell.Key]keyboardAction {
	mappedCommands := map[tcell.ModMask]map[tcell.Key]keyboardAction{}

	for _, command := range keyboardCommands() {
		for _, shortcut := range command.shortcuts {
			if _, ok := mappedCommands[shortcut.modifier]; !ok {
				mappedCommands[shortcut.modifier] = map[tcell.Key]keyboardAction{}
			}

			mappedCommands[shortcut.modifier][shortcut.key] = command.action
		}
	}

	return mappedCommands
}
