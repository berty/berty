package bertymessenger

import (
	"context"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/lifecycle"
)

const (
	StateActive lifecycle.State = iota
	StateInactive
)

func (s *service) monitorState(ctx context.Context) {
	var currentState lifecycle.State
	for {
		currentState = s.lcmanager.GetCurrentState()

		switch currentState {
		case StateActive:
			s.logger.Info("current state", zap.String("state", "Active State"))
		case StateInactive:
			s.logger.Info("current state", zap.String("state", "Inactive State"))
		}

		if !s.lcmanager.WaitForStateChange(ctx, currentState) {
			return
		}
	}
}
