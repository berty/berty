package bertymessenger

import (
	"time"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"go.uber.org/zap"
)

func New(client bertyprotocol.ProtocolServiceClient, opts *Opts) MessengerServiceServer {
	svc := service{
		protocolClient:  client,
		logger:          opts.Logger,
		startedAt:       time.Now(),
		protocolService: opts.ProtocolService,
	}
	return &svc
}

type Opts struct {
	Logger          *zap.Logger
	ProtocolService bertyprotocol.Service
}

type service struct {
	logger          *zap.Logger
	protocolClient  bertyprotocol.ProtocolServiceClient
	startedAt       time.Time
	protocolService bertyprotocol.Service // optional, for debugging only
}

var _ MessengerServiceServer = (*service)(nil)
