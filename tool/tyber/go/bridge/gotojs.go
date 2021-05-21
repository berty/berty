package bridge

import (
	"fmt"
	"sync"

	"berty.tech/berty/tool/tyber/go/logger"
	"berty.tech/berty/tool/tyber/go/parser"
	"github.com/asticode/go-astilectron"
	bootstrap "github.com/asticode/go-astilectron-bootstrap"
)

func (b *Bridge) ConsoleLog(log *logger.Log) {
	if b.isInitialized() && len(b.windows) != 0 {
		if err := bootstrap.SendMessage(b.windows[0], "console_log", log, func(m *bootstrap.MessageIn) {}); err != nil {
			b.logger.Println("sending console_log event failed:", err)
		}
	}
}

func (b *Bridge) OpenFiles(e astilectron.Event) bool {
	if b.isInitialized() && len(b.windows) != 0 {
		if err := bootstrap.SendMessage(b.windows[0], "open_files", "", func(m *bootstrap.MessageIn) {}); err != nil {
			b.logger.Errorf("sending open_files event failed: %v", err)
		}
	}

	return false
}

func (b *Bridge) OpenPreferences(e astilectron.Event) bool {
	if b.isInitialized() {
		// TODO
		message := "Not implemented yet!\nYou can manually edit the settings file"
		if path, err := b.config.GetSettingsPath(); err == nil {
			message = fmt.Sprintf("%s located in:\n%s", message, path)
		}
		b.DisplayError("Preferences error", message, false)
	}

	return false
}

type VisualError struct {
	Title   string `json:"title"`
	Content string `json:"content"`
}

func (b *Bridge) DisplayError(title, content string, exit bool) {
	if b.isInitialized() && len(b.windows) != 0 {
		if err := bootstrap.SendMessage(b.windows[0], "display_error", VisualError{title, content}, func(m *bootstrap.MessageIn) {
			if exit {
				b.asti.Close()
			}
		}); err != nil {
			b.logger.Errorf("sending display_error event failed: %v", err)
			if exit {
				b.asti.Close()
			}
		}
	}
}

func (b *Bridge) UpdateFront(e interface{}) {
	if !b.isInitialized() || len(b.windows) == 0 {
		return
	}

	kind := interfaceToEventKind(e)
	eventName := kind.String()

	if kind == CreateSessionEventKind {
		cse := e.(parser.CreateSessionEvent)
		if cse.SrcType == parser.NetworkType {
			b.DisplayNotification(
				fmt.Sprintf("New incoming connection %s", cse.SrcName),
				fmt.Sprintf("Started session %s from %s", cse.ID, cse.DisplayName),
			)
		}
	}

	wg := sync.WaitGroup{}
	wg.Add(1)
	if err := bootstrap.SendMessage(b.windows[0], eventName, e, func(m *bootstrap.MessageIn) { wg.Done() }); err != nil {
		b.logger.Errorf("sending %s event failed: %v", eventName, err)
		wg.Done()
	}
	wg.Wait()
}
