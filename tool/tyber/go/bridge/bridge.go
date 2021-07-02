package bridge

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"path/filepath"
	"sync"

	"berty.tech/berty/tool/tyber/go/config"
	"berty.tech/berty/tool/tyber/go/logger"
	"berty.tech/berty/tool/tyber/go/parser"
	"github.com/asticode/go-astilectron"
)

type Bridge struct {
	logger          *logger.Logger
	parser          *parser.Parser
	config          *config.Config
	asti            *astilectron.Astilectron
	windows         []*astilectron.Window
	menu            *astilectron.Menu
	tray            *astilectron.Tray
	trayMenu        *astilectron.Menu
	devToolsOpened  bool
	devToolsLock    sync.Mutex
	initialized     bool
	initLock        sync.RWMutex
	websocketBridge WebsocketBridge
	receiver        *func(string, []byte) error
}

// WebsocketBridge ...
type WebsocketBridge interface {
	AddReceiver(*func(name string, payload []byte) error)
	RemoveReceiver(*func(name string, payload []byte) error)
	Send(name string, payload []byte) error
}

func New(ctx context.Context, goLogger *log.Logger, w WebsocketBridge) *Bridge {
	b := &Bridge{websocketBridge: w}

	baseLogger := logger.New(goLogger, b.ConsoleLog)

	b.logger = baseLogger.Named("bridge")

	b.config = config.New(ctx, baseLogger)
	b.parser = parser.New(baseLogger)
	receiver := b.HandleMessages
	b.receiver = &receiver

	if b.websocketBridge != nil {
		b.websocketBridge.AddReceiver(b.receiver)
	}

	return b
}

func (b *Bridge) Close() error {
	if b.websocketBridge != nil {
		b.websocketBridge.RemoveReceiver(b.receiver)
	}
	return nil
}

func (b *Bridge) Init(a *astilectron.Astilectron, ws []*astilectron.Window, m *astilectron.Menu, t *astilectron.Tray, tm *astilectron.Menu) error {
	b.asti = a
	b.windows = ws
	b.menu = m
	b.tray = t
	b.trayMenu = tm

	b.initLock.Lock()
	b.initialized = true
	b.initLock.Unlock()

	go func() {
		for event := range b.parser.EventChan {
			if b.websocketBridge != nil {
				eventBytes, err := json.Marshal(event)
				if err == nil {
					fmt.Println("sending", string(eventBytes))
					b.websocketBridge.Send(interfaceToEventKind(event).String(), eventBytes)
				}
			}
			b.UpdateFront(event)
		}
	}()

	b.logger.Info("initialization successful")

	return nil
}

func (b *Bridge) isInitialized() bool {
	b.initLock.RLock()
	defer b.initLock.RUnlock()
	return b.initialized
}

func (b *Bridge) DisplayNotification(title, body string) {
	if b.isInitialized() {
		enabled, _ := b.config.GetNotificationSetting()
		if enabled {
			icon := filepath.Join(b.asti.Paths().DataDirectory(), "bundler/resources/icons/icon.png")
			n := b.asti.NewNotification(&astilectron.NotificationOptions{
				Title: title,
				Body:  body,
				Icon:  icon,
			})
			n.Create()
			n.Show()
		}
	}
}

func (b *Bridge) ToggleDevTools(e astilectron.Event) bool {
	b.devToolsLock.Lock()
	defer b.devToolsLock.Unlock()

	if b.devToolsOpened {
		if err := b.windows[0].CloseDevTools(); err != nil {
			b.logger.Errorf("closing dev tools failed: %v", err)
			return false
		}
		b.devToolsOpened = false
	} else {
		if err := b.windows[0].OpenDevTools(); err != nil {
			b.logger.Errorf("opening dev tools failed: %v", err)
			return false
		}
		b.devToolsOpened = true
	}

	return false
}
