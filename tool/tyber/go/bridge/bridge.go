package bridge

import (
	"log"
	"path/filepath"
	"sync"

	"berty.tech/berty/tool/tyber/go/v2/config"
	"berty.tech/berty/tool/tyber/go/v2/logger"
	"berty.tech/berty/tool/tyber/go/v2/parser"
	"github.com/asticode/go-astilectron"
)

type Bridge struct {
	logger         *logger.Logger
	parser         *parser.Parser
	config         *config.Config
	asti           *astilectron.Astilectron
	windows        []*astilectron.Window
	menu           *astilectron.Menu
	tray           *astilectron.Tray
	trayMenu       *astilectron.Menu
	devToolsOpened bool
	devToolsLock   sync.Mutex
	initialized    bool
	initLock       sync.RWMutex
}

func New(goLogger *log.Logger) *Bridge {
	b := &Bridge{}

	baseLogger := logger.New(goLogger, b.ConsoleLog)

	b.logger = baseLogger.Named("bridge")
	b.config = config.New(baseLogger)
	b.parser = parser.New(baseLogger)

	return b
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
