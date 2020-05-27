package bertychat

import (
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"go.uber.org/zap"
)

func New(client bertyprotocol.ProtocolServiceClient, opts *Opts) ChatServiceServer {
	svc := service{
		protocol: client,
		logger:   opts.Logger,
	}
	return &svc
}

type Opts struct {
	Logger *zap.Logger
}

type service struct {
	logger   *zap.Logger
	protocol bertyprotocol.ProtocolServiceClient
}

var _ ChatServiceServer = (*service)(nil)
