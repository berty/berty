package bertybridge

import (
	"context"
	"sync"

	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/grpcutil"
)

type Service interface {
	BridgeServiceServer
	ServiceClientRegister

	Close() error
}

type Options struct {
	Logger *zap.Logger
}

type service struct {
	rootCtx    context.Context
	rootCancel context.CancelFunc

	logger *zap.Logger

	muCients sync.RWMutex
	clients  map[string]*client

	streams   map[string]*grpcutil.LazyStream
	muStreams sync.RWMutex
}

func (o *Options) applyDefault() {
	if o.Logger == nil {
		o.Logger = zap.NewNop()
	}
}

func NewService(opts *Options) Service {
	opts.applyDefault()
	ctx, cancel := context.WithCancel(context.Background())
	return &service{
		rootCtx:    ctx,
		rootCancel: cancel,
		logger:     opts.Logger,
		clients:    make(map[string]*client),
		streams:    make(map[string]*grpcutil.LazyStream),
	}
}

func (s *service) Close() error {
	s.rootCancel()
	return nil
}
