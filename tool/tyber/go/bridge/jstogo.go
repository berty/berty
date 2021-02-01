package bridge

import (
	"encoding/json"
	"fmt"

	"github.com/asticode/go-astilectron"
	bootstrap "github.com/asticode/go-astilectron-bootstrap"
)

func (b *Bridge) HandleMessages(w *astilectron.Window, m bootstrap.MessageIn) (interface{}, error) {
	switch m.Name {
	case "init_config":
		var path string
		if err := json.Unmarshal(m.Payload, &path); err != nil {
			wrappedErr := fmt.Sprintf("unmarshaling path payload failed: %v", err)
			b.logger.Error(wrappedErr)
			b.DisplayError("Config init error", wrappedErr, true)
			return nil, err
		}
		b.logger.Debugf("init_config payload is: %s", path)

		if err := b.config.Init(path); err != nil {
			b.logger.Errorf("config init error: %v", err)
			b.DisplayError("Config init error", err.Error(), true)
			return nil, err
		}

		port, err := b.config.GetPortSetting()
		if err != nil {
			b.logger.Errorf("config getting port failed: %v", err)
			b.DisplayError("Network port config error", err.Error(), false)
		}

		sessionPath, err := b.config.GetSessionsPath()
		if err != nil {
			b.logger.Errorf("config getting session path failed: %v", err)
			b.DisplayError("Network port config error", err.Error(), false)
		}

		if err = b.parser.Init(sessionPath); err != nil {
			b.logger.Errorf("parser init error: %v", err)
			b.DisplayError("Parser init error", err.Error(), true)
			return nil, err
		}

		if err := b.parser.NetworkListen(port); err != nil {
			b.logger.Errorf("parser network listening failed: %v", err)
			b.DisplayError("Parser listen network error", err.Error(), false)
		}

	case "open_files":
		var files []string
		if err := json.Unmarshal(m.Payload, &files); err != nil {
			b.logger.Errorf("unmarshaling files payload failed: %v", err)
			return nil, err
		}
		b.logger.Debugf("open_files payload is: %q", files)

		for _, file := range files {
			if err := b.parser.ParseFile(file); err != nil {
				b.logger.Errorf("opening file failed: %v", err)
				b.DisplayError("Opening file failed", err.Error(), false)
			}
		}

	case "open_session":
		var sessionID string
		if err := json.Unmarshal(m.Payload, &sessionID); err != nil {
			b.logger.Errorf("unmarshaling sessionID payload failed: %v", err)
			return nil, err
		}
		b.logger.Debugf("open_session payload is: %s", sessionID)

		if err := b.parser.OpenSession(sessionID); err != nil {
			b.logger.Errorf("opening session failed: %v", err)
			// TODO: Display error instead of trace list in UI?
		}

	case "clear_sessions":
		b.parser.DeleteAllSessions()

	case "toggle_devtools":
		b.ToggleDevTools(astilectron.Event{})

	case "open_preferences":
		b.OpenPreferences(astilectron.Event{})

	default:
		b.logger.Errorf("unknown message received from JS: %+v", m)
	}

	return nil, nil
}
