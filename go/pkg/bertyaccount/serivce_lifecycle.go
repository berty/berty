package bertyaccount

import (
	context "context"
	"time"

	"berty.tech/berty/v2/go/internal/lifecycle"
)

func (s *service) handleLifecycle(ctx context.Context) {
	var currentState lifecycle.State
	for {
		currentState = s.lifecycleManager.GetCurrentState()
		if !s.lifecycleManager.WaitForStateChange(ctx, currentState) {
			return
		}
	}
}

// WakeUp should be used for background task (or similar task)
func (s *service) WakeUp(ctx context.Context) error {
	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	s.logger.Info("starting wake up")

	<-ctx.Done()

	s.logger.Info("ending wake up")

	return nil
}
