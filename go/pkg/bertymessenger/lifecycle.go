package bertymessenger

import (
	"context"

	"go.uber.org/zap"

	"berty.tech/weshnet/v2/pkg/lifecycle"
)

func (s *service) monitorState(ctx context.Context) {
	var currentState lifecycle.State
	for {
		currentState = s.lcmanager.GetCurrentState()

		switch currentState {
		case lifecycle.StateActive:
			s.logger.Info("current state", zap.String("state", "Active State"))
		case lifecycle.StateInactive:
			s.logger.Info("current state", zap.String("state", "Inactive State"))
		}

		if !s.lcmanager.WaitForStateChange(ctx, currentState) {
			return
		}
	}
}
