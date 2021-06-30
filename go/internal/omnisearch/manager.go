package omnisearch

import (
	"context"
	"fmt"
	"reflect"

	ipfsCore "github.com/ipfs/go-ipfs/core"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/lifecycle"
	"berty.tech/berty/v2/go/internal/notification"
	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type provider struct {
	m *initutil.Manager
}

func NewManagerFromManager(m *initutil.Manager) Provider {
	return provider{m: m}
}

func NewManagerFromNothing(ctx context.Context) (Provider, error) {
	m, err := initutil.New(ctx, nil)
	if err != nil {
		return nil, err
	}
	return provider{m: m}, nil
}

var (
	lifecycleManagerType                     = reflect.TypeOf((*(*lifecycle.Manager))(nil)).Elem()
	ipfsutilExtendedCoreAPIType              = reflect.TypeOf((*(ipfsutil.ExtendedCoreAPI))(nil)).Elem()
	ipfsCoreIpfsNodeType                     = reflect.TypeOf((*(*ipfsCore.IpfsNode))(nil)).Elem()
	bertymessengerMessengerServiceServerType = reflect.TypeOf((*(messengertypes.MessengerServiceServer))(nil)).Elem()
	bertymessengerMessengerServiceClientType = reflect.TypeOf((*(messengertypes.MessengerServiceClient))(nil)).Elem()
	bertyprotocolServiceType                 = reflect.TypeOf((*(bertyprotocol.Service))(nil)).Elem()
	zapLoggerType                            = reflect.TypeOf((*(*zap.Logger))(nil)).Elem()
	notificationManager                      = reflect.TypeOf((*(notification.Manager))(nil)).Elem()
	bertyprotocolBertyOrbitDB                = reflect.TypeOf((*(*bertyprotocol.BertyOrbitDB))(nil)).Elem()
	protocoltypesProtocolServiceClient       = reflect.TypeOf((*(protocoltypes.ProtocolServiceClient))(nil)).Elem()
)

func (provider) Available() []reflect.Type {
	return []reflect.Type{
		lifecycleManagerType,
		ipfsutilExtendedCoreAPIType,
		ipfsCoreIpfsNodeType,
		bertymessengerMessengerServiceServerType,
		bertymessengerMessengerServiceClientType,
		bertyprotocolServiceType,
		zapLoggerType,
		notificationManager,
		bertyprotocolBertyOrbitDB,
		protocoltypesProtocolServiceClient,
	}
}

func (p provider) Make(t reflect.Type) (reflect.Value, error) {
	var r interface{}
	var err error
	switch t {
	case lifecycleManagerType:
		r = p.m.GetLifecycleManager()
	case ipfsutilExtendedCoreAPIType:
		r, _, err = p.m.GetLocalIPFS()
	case ipfsCoreIpfsNodeType:
		_, r, err = p.m.GetLocalIPFS()
	case bertymessengerMessengerServiceServerType:
		r, err = p.m.GetLocalMessengerServer()
	case bertymessengerMessengerServiceClientType:
		r, err = p.m.GetMessengerClient()
	case bertyprotocolServiceType:
		r, err = p.m.GetLocalProtocolServer()
	case zapLoggerType:
		r, err = p.m.GetLogger()
	case notificationManager:
		r, err = p.m.GetNotificationManager()
	case bertyprotocolBertyOrbitDB:
		r, err = p.m.GetOrbitDB()
	case protocoltypesProtocolServiceClient:
		r, err = p.m.GetProtocolClient()
	default:
		err = fmt.Errorf("type %s is not available", t.Name())
	}
	if err != nil {
		return reflect.Value{}, err
	}
	return reflect.ValueOf(r), nil
}

func (provider) Name() string {
	return "Berty's initutil Manager"
}

func (p provider) String() string {
	return p.Name()
}
