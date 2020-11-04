package bertyaccount

import (
	"go.uber.org/zap"
	grpc "google.golang.org/grpc"

	"berty.tech/berty/v2/go/internal/grpcutil"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/notification"
)

type Account struct {
	initManager *initutil.Manager
	// lifecycleDriver  LifeCycleDriver
	logger           *zap.Logger
	notification     notification.Manager
	lifecycleManager *lifecycle.Manager
	grpcServer       *grpc.Server
	client           *grpcutil.LazyClient
}

func NewAccount(manager *initutil.Manager) *Account {
	return &Account{
		initManager: manager,
	}
}

func (a *Account) Close() error {
	return a.initManager.Close()
}
