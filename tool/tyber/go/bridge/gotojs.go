package bridge

import (
	"fmt"
	"sync"

	"berty.tech/berty/v2/tool/tyber/go/logger"
	"berty.tech/berty/v2/tool/tyber/go/parser"
	"github.com/asticode/go-astilectron"
	bootstrap "github.com/asticode/go-astilectron-bootstrap"
)

func (b *Bridge) ConsoleLog(log *logger.Log) {
	if b.isInitialized() {
		if err := bootstrap.SendMessage(b.windows[0], "console_log", log, func(m *bootstrap.MessageIn) {}); err != nil {
			b.logger.Println("sending console_log event failed:", err)
		}
	}
}

func (b *Bridge) OpenFiles(e astilectron.Event) bool {
	if b.isInitialized() {
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
	if b.isInitialized() {
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
	var wg sync.WaitGroup

	if b.isInitialized() {
		switch e.(type) {
		case []parser.CreateSessionEvent:
			wg.Add(1)
			scse := e.([]parser.CreateSessionEvent)
			if err := bootstrap.SendMessage(b.windows[0], "list_sessions", scse, func(m *bootstrap.MessageIn) { wg.Done() }); err != nil {
				b.logger.Errorf("sending list_sessions event failed: %v", err)
				wg.Done()
			}
			wg.Wait()
		case parser.CreateSessionEvent:
			cse := e.(parser.CreateSessionEvent)
			if cse.SrcType == parser.NetworkType {
				b.DisplayNotification(
					fmt.Sprintf("New incoming connection %s", cse.SrcName),
					fmt.Sprintf("Started session %s from %s", cse.ID, cse.DisplayName),
				)
			}
			if err := bootstrap.SendMessage(b.windows[0], "create_session", cse, func(m *bootstrap.MessageIn) {}); err != nil {
				b.logger.Errorf("sending create_session event failed: %v", err)
			}
		case parser.UpdateSessionEvent:
			use := e.(parser.UpdateSessionEvent)
			if err := bootstrap.SendMessage(b.windows[0], "update_session", use, func(m *bootstrap.MessageIn) {}); err != nil {
				b.logger.Errorf("sending update_session event failed: %v", err)
			}
		// TODO
		case parser.DeleteSessionEvent:
			// 	dse := e.(parser.DeleteSessionEvent)
			// 	if err := bootstrap.SendMessage(b.windows[0], "delete_session", dse, func(m *bootstrap.MessageIn) {}); err != nil {
			// 		b.logger.Errorf("sending delete_session event failed: %v", err)
			// 	}
		case []parser.CreateTraceEvent:
			wg.Add(1)
			scte := e.([]parser.CreateTraceEvent)
			if err := bootstrap.SendMessage(b.windows[0], "list_traces", scte, func(m *bootstrap.MessageIn) { wg.Done() }); err != nil {
				b.logger.Errorf("sending list_traces event failed: %v", err)
				wg.Done()
			}
			wg.Wait()
		case parser.CreateTraceEvent:
			cte := e.(parser.CreateTraceEvent)
			if err := bootstrap.SendMessage(b.windows[0], "create_trace", cte, func(m *bootstrap.MessageIn) {}); err != nil {
				b.logger.Errorf("sending create_trace event failed: %v", err)
			}
		case parser.UpdateTraceEvent:
			ute := e.(parser.UpdateTraceEvent)
			if err := bootstrap.SendMessage(b.windows[0], "update_trace", ute, func(m *bootstrap.MessageIn) {}); err != nil {
				b.logger.Errorf("sending update_trace event failed: %v", err)
			}
		case parser.CreateStepEvent:
			cse := e.(parser.CreateStepEvent)
			if err := bootstrap.SendMessage(b.windows[0], "create_step", cse, func(m *bootstrap.MessageIn) {}); err != nil {
				b.logger.Errorf("sending create_step event failed: %v", err)
			}
		}
	}
}
