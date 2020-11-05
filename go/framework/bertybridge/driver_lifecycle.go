package bertybridge

import (
	"context"
	"sync"
	"time"

	"go.uber.org/zap"
)

const (
	AppStateUnknown int = iota
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
	WillTerminate()
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

func newBackgroundTask(logger *zap.Logger, task func(context.Context) error) LifeCycleBackgroundTask {
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

// var _ LifeCycleDriver = (*noopLifeCycleDriver)(nil)

// type noopLifeCycleDriver struct{}

// func (*noopLifeCycleDriver) GetCurrentState() int               { return AppStateUnknown }
// func (*noopLifeCycleDriver) RegisterHandler(_ LifeCycleHandler) {}
