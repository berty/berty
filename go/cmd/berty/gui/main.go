package gui

import (
	"context"
	"fmt"
	"sync"

	"fyne.io/fyne/v2"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/lifecycle"
	assets "berty.tech/berty/v2/go/pkg/assets"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

// Opts ...
type Opts struct {
	MessengerClient  messengertypes.MessengerServiceClient
	ProtocolClient   protocoltypes.ProtocolServiceClient
	Logger           *zap.Logger
	GroupInvitation  string
	DisplayName      string
	LifecycleManager *lifecycle.Manager
	AppChan          chan fyne.App
}

// Main ...
func Main(ctx context.Context, opts *Opts) error {
	assets.Noop() // embed assets

	if opts.MessengerClient == nil {
		return errcode.ErrMissingInput.Wrap(fmt.Errorf("missing messenger client"))
	}
	if opts.ProtocolClient == nil {
		return errcode.ErrMissingInput.Wrap(fmt.Errorf("missing protocol client"))
	}
	if opts.AppChan == nil {
		return errcode.ErrMissingInput.Wrap(fmt.Errorf("missing window chan"))
	}

	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	a := <-opts.AppChan

	w := a.NewWindow("bergy")

	wg := &sync.WaitGroup{}
	wg.Add(1)
	w.SetOnClosed(func() { wg.Done() })

	store, err := newMsgrStore(ctx, opts.MessengerClient, opts.Logger)
	if err != nil {
		return err
	}

	mc := msgrContext{
		ctx:            ctx,
		client:         opts.MessengerClient,
		protocolClient: opts.ProtocolClient,
		logger:         opts.Logger,
		store:          store,
		window:         w,
		app:            a,
	}

	wfr := newAppRootWidget(&mc)
	if wfr.err != nil {
		return wfr.err
	}

	w.SetContent(wfr.object)
	w.Resize(fyne.NewSize(600, 600))
	w.Show()
	w.SetMaster()

	wg.Wait()

	return wfr.clean()
}

// CONTEXT

type msgrContext struct {
	client         messengertypes.MessengerServiceClient
	protocolClient protocoltypes.ProtocolServiceClient
	logger         *zap.Logger
	ctx            context.Context
	store          *msgrStore
	window         fyne.Window
	app            fyne.App
}

// WIDGET FACTORY

type widgetFactoryReturn struct {
	object fyne.CanvasObject
	clean  func() error
	err    error
}

type wfr = widgetFactoryReturn

type widgetFactory = func(mc *msgrContext) wfr
