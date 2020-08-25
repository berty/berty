package bertybridge

import (
	"context"
	"fmt"
	"sync"
	"time"

	"berty.tech/berty/v2/go/internal/tracer"
	"go.opentelemetry.io/otel/api/kv"
	"go.opentelemetry.io/otel/api/trace"
	"go.uber.org/zap"
)

const (
	AppStateUnknow int = iota
	AppStateActive
	AppStateInactive
	AppStateBackground
)

type LifeCycleDriver interface {
	GetCurrentState() int
	RegisterHandler(handler LifeCycleHandler)
}

type LifeCycleHandler interface {
	HandleState(appstate int)
	HandleTask() LifeCycleBackgroundTask
	WillTerminnate()
}

type LifeCycleBackgroundTask interface {
	Execute() (success bool)
	Cancel()
}

var _ LifeCycleBackgroundTask = (*backgroundTask)(nil)

type backgroundTask struct {
	task   func(context.Context) error
	logger *zap.Logger

	finishOnce sync.Once
	finish     chan struct{}

	ctx    context.Context
	cancel context.CancelFunc
}

func NewBackgroundTask(logger *zap.Logger, task func(context.Context) error) LifeCycleBackgroundTask {
	ctx, cancel := context.WithCancel(context.Background())
	return &backgroundTask{
		finish: make(chan struct{}),
		logger: logger,
		task:   task,
		ctx:    ctx,
		cancel: cancel,
	}
}

// Execute should be only called once
func (bt *backgroundTask) Execute() bool {
	defer bt.finishOnce.Do(func() { close(bt.finish) })

	if err := bt.task(bt.ctx); err != nil {
		bt.logger.Error("background task failed", zap.Error(err))
		return false
	}
	return true
}

// Cancel background task
func (bt *backgroundTask) Cancel() {
	bt.cancel()

	// wait until task is done or expire
	select {
	case <-time.After(time.Second * 5):
	case <-bt.finish:
	}
}

// noop driver

var _ LifeCycleDriver = (*noopLifeCycleDriver)(nil)

type noopLifeCycleDriver struct{}

func (*noopLifeCycleDriver) GetCurrentState() int               { return AppStateUnknow }
func (*noopLifeCycleDriver) RegisterHandler(_ LifeCycleHandler) {}

func NewNoopLifeCycleDriver() LifeCycleDriver {
	return &noopLifeCycleDriver{}
}

var _ LifeCycleHandler = (*testHandlers)(nil)

// testHandlers used to test frequency of background,
// should be temporary enable to see how much background job is trigger
type testHandlers struct {
	currentState int
	muState      sync.Mutex

	logger *zap.Logger
}

func NewTestHandler(logger *zap.Logger) LifeCycleHandler {
	return &testHandlers{
		currentState: AppStateUnknow,
		logger:       logger,
	}
}

func (t *testHandlers) WillTerminnate() {
	t.logger.Info("app will now terminate")
}

func (t *testHandlers) HandleState(appstate int) {
	t.muState.Lock()
	defer t.muState.Unlock()
	if appstate != t.currentState {
		var state string
		switch appstate {
		case AppStateActive:
			state = "Active"
		case AppStateInactive:
			state = "Inactive"
		case AppStateBackground:
			state = "Background"
		default:
			state = "Unknow"
		}

		t.logger.Info("updating state", zap.String("App State", state))
		t.currentState = appstate
	}
}

func (t *testHandlers) HandleTask() LifeCycleBackgroundTask {
	return NewBackgroundTask(t.logger, func(ctx context.Context) error {
		tr := tracer.New("AppState")
		return tr.WithSpan(ctx, "BackgroundTask", func(ctx context.Context) error {
			t.logger.Info("starting background task")

			ctx, cancel := context.WithDeadline(ctx, time.Now().Add(time.Second*25))
			defer cancel()
			span := trace.SpanFromContext(ctx)
			count := 0
			for {
				select {
				case <-ctx.Done():
					t.logger.Info("ending background task")
					if ctx.Err() != context.DeadlineExceeded {
						span.AddEvent(ctx, "task has been canceled")
						return fmt.Errorf("task has been canceled")
					}

					return nil
				case <-time.After(time.Second):
					span.AddEvent(ctx, "tick", kv.Int("count", count))
					t.logger.Info("background task counting", zap.Int("count", count))
				}
				count++
			}
		}, trace.WithRecord(), trace.WithSpanKind(trace.SpanKindClient))
	})
}
