package bertybridge

import (
	"context"

	"go.uber.org/zap"
	grpc "google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
)

// OpenAccount, start berty node
func (s *service) OpenAccount(_ context.Context, req *OpenAccount_Request) (*OpenAccount_Reply, error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	if s.initManager != nil {
		if err := s.initManager.Close(); err != nil {
			s.logger.Warn("unable to close account", zap.Error(err))
			return nil, err
		}
		s.initManager = nil
		s.servicesClient = nil
	}

	args := req.GetArgs()
	if s.rootdir != "" {
		args = append(args, "--store.dir", s.rootdir)
	}

	manager, err := s.newManager(args...)
	if err != nil {
		return nil, err
	}

	// close manager in case of failure
	var merr error
	defer func() {
		if merr != nil {
			manager.Close()
		}
	}()

	// get logger
	if _, merr = manager.GetLogger(); merr != nil {
		return nil, merr
	}

	// get local IPFS node
	if _, s.node, merr = manager.GetLocalIPFS(); err != nil {
		return nil, merr
	}

	// get gRPC server
	if _, _, merr = manager.GetGRPCServer(); err != nil {
		return nil, merr
	}

	if _, merr = manager.GetLocalMessengerServer(); err != nil {
		return nil, merr
	}

	if _, merr = manager.GetNotificationManager(); err != nil {
		return nil, merr
	}

	// get manager client conn
	var ccServices *grpc.ClientConn
	ccServices, merr = manager.GetGRPCClientConn()
	if merr != nil {
		return nil, merr
	}

	s.initManager = manager
	s.servicesClient = grpcutil.NewLazyClient(ccServices)

	// hook the lifecycle manager
	{
		// b.HandleState(config.lc.GetCurrentState())
		// config.lc.RegisterHandler(b)
	}

	return &OpenAccount_Reply{}, nil
}

// CloseAccount, close berty node
// func (s *service) CloseAccount(context.Context, *CloseAccount_Request) (*CloseAccount_Reply, error) {
// 	return &CloseAccount_Reply{}, nil
// }
