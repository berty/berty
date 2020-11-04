package bertyaccount

import (
	"context"
	"flag"
	fmt "fmt"

	"go.uber.org/zap"
	grpc "google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/initutil"
)

// OpenAccount, start berty node
func (s *service) OpenAccount(_ context.Context, req *OpenAccount_Request) (*OpenAccount_Reply, error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	args := req.GetArgs()
	if req.GetPersistence() {
		args = append(args, "--store.dir", s.rootdir)
	}

	// close previous initManager
	if s.initManager != nil {
		return nil, fmt.Errorf("an account is already opened, close it before open it again")
	}

	s.logger.Info("opening account",
		zap.Strings("args", req.GetArgs()),
		zap.Bool("persistence", req.GetPersistence()),
	)

	// create new `InitManager`
	var manager *initutil.Manager
	{
		var err error

		manager, err = s.newManager(args...)
		if err != nil {
			return nil, err
		}
	}

	// setup `InitManager`
	var ccServices *grpc.ClientConn
	{
		var err error

		// close and cleanup manager in case of failure
		defer func() {
			if err != nil {
				manager.Close()
			}
		}()

		// get logger
		if _, err = manager.GetLogger(); err != nil {
			return nil, err
		}

		// get local IPFS node
		if _, s.node, err = manager.GetLocalIPFS(); err != nil {
			return nil, err
		}

		// get gRPC server
		if _, _, err = manager.GetGRPCServer(); err != nil {
			return nil, err
		}

		if _, err = manager.GetLocalMessengerServer(); err != nil {
			return nil, err
		}

		if _, err = manager.GetNotificationManager(); err != nil {
			return nil, err
		}

		// get manager client conn
		ccServices, err = manager.GetGRPCClientConn()
		if err != nil {
			return nil, err
		}
	}
	s.servicesClient = grpcutil.NewLazyClient(ccServices)

	// assign the new manager
	s.initManager = manager
	return &OpenAccount_Reply{}, nil
}

func (s *service) CloseAccount(_ context.Context, req *CloseAccount_Request) (*CloseAccount_Reply, error) {
	s.muService.Lock()
	defer s.muService.Unlock()

	// close previous initManager
	if s.initManager != nil {
		if err := s.initManager.Close(); err != nil {
			s.logger.Warn("unable to close account", zap.Error(err))
			return nil, err
		}
		s.initManager = nil
		s.servicesClient = nil
	}

	return &CloseAccount_Reply{}, nil
}

func (s *service) newManager(args ...string) (*initutil.Manager, error) {
	manager := initutil.Manager{}

	// configure flagset options
	fs := flag.NewFlagSet("account", flag.ContinueOnError)
	manager.SetupLoggingFlags(fs)
	manager.SetupLocalMessengerServerFlags(fs)
	manager.SetupEmptyGRPCListenersFlags(fs)
	// manager.SetupMetricsFlags(fs)
	err := fs.Parse(args)
	if err != nil {
		return nil, err
	}
	if len(fs.Args()) > 0 {
		return nil, fmt.Errorf("invalid CLI args, should only have flags")
	}

	// minimal requirements
	{
		// here we can add various checks that return an error early if some settings are invalid or missing
	}

	manager.SetLogger(s.logger)
	s.logger.Info("init", zap.Any("manager", &manager))

	manager.SetNotificationManager(s.notifManager)
	return &manager, nil
}
