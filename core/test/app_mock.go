package test

import (
	"context"
	"fmt"
	"io"
	"io/ioutil"
	"net"
	"strings"

	"berty.tech/core/api/client"
	nodeapi "berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/keypair"
	"berty.tech/core/entity"
	"berty.tech/core/network"
	"berty.tech/core/network/netutil"
	"berty.tech/core/node"
	"berty.tech/core/sql"
	"berty.tech/core/sql/sqlcipher"
	"berty.tech/core/test/mock"
	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

type AppMockOption func(*AppMock) error

type AppMock struct {
	dbPath        string
	listener      net.Listener
	db            *gorm.DB
	node          *node.Node
	clientConn    *grpc.ClientConn
	client        *client.Client
	ctx           context.Context
	device        *entity.Device
	networkDriver network.Driver
	crypto        keypair.Interface
	eventStream   chan *p2p.Event
	cancel        func()
	options       []AppMockOption
}

func WithUnencryptedDb() AppMockOption {
	return func(a *AppMock) error {
		if err := a.db.Close(); err != nil {
			return err
		}

		entities := entity.AllEntities()
		entities = append(entities, &p2p.Event{})

		path, db, err := mock.GetMockedDb(entities...)

		if err != nil {
			return err
		}

		a.dbPath = path
		a.db = db

		return nil
	}
}

func NewAppMock(device *entity.Device, networkDriver network.Driver, options ...AppMockOption) (*AppMock, error) {
	tmpFile, err := ioutil.TempFile("", "sqlite")
	if err != nil {
		return nil, err
	}

	a := AppMock{
		dbPath:        tmpFile.Name(),
		device:        device,
		networkDriver: networkDriver,
		crypto:        &keypair.InsecureCrypto{},
		options:       options,
	}

	if err := a.Open(); err != nil {
		return nil, err
	}

	return &a, nil
}

func (a *AppMock) Open() error {
	var err error

	if a.db, err = sqlcipher.Open(a.dbPath+"?cache=shared&_txlock=deferred&_loc=auto&_mutex=full", []byte("s3cur3")); err != nil {
		return err
	}
	if a.db, err = sql.Init(a.db); err != nil {
		return errors.Wrap(err, "failed to initialize sql")
	}
	if err = sql.Migrate(a.db); err != nil {
		return errors.Wrap(err, "failed to apply sql migrations")
	}

	gs := grpc.NewServer()
	port, err := netutil.GetFreeTCPPort()
	if err != nil {
		return err
	}
	a.listener, err = net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		return err
	}

	for _, opt := range a.options {
		if err := opt(a); err != nil {
			return err
		}
	}

	a.ctx, a.cancel = context.WithCancel(context.Background())

	if a.node, err = node.New(
		a.ctx,
		node.WithSQL(a.db),
		node.WithP2PGrpcServer(gs),
		node.WithNodeGrpcServer(gs),
		node.WithDevice(a.device),
		node.WithNetworkDriver(a.networkDriver),
		node.WithInitConfig(),
		node.WithSoftwareCrypto(),
		node.WithConfig(),
	); err != nil {
		return err
	}

	go func() {
		if err := gs.Serve(a.listener); err != nil {
			// app.Close() generates this error
			if strings.Contains(err.Error(), "use of closed network connection") {
				return
			}
			logger().Error("grpc server error", zap.Error(err))
		}
	}()

	a.node.Start(a.ctx, false, false)

	a.clientConn, err = grpc.Dial(fmt.Sprintf(":%d", port), grpc.WithInsecure())
	if err != nil {
		return err
	}
	a.client = client.New(a.clientConn)

	return nil
}

func (a *AppMock) InitEventStream() error {
	a.eventStream = make(chan *p2p.Event, 100)
	stream, err := a.client.Node().EventStream(a.ctx, &nodeapi.EventStreamInput{})
	if err != nil {
		return err
	}
	go func() {
		for {
			data, err := stream.Recv()
			if err == io.EOF {
				logger().Warn("eventstream EOF", zap.Error(err))
				return
			}
			if err != nil {
				logger().Warn("failed to receive stream data", zap.Error(err))
				return
			}
			a.eventStream <- data
		}
	}()
	return nil
}

func (a *AppMock) Close() error {
	if err := a.db.Close(); err != nil {
		return err
	}
	if err := a.listener.Close(); err != nil {
		return err
	}
	if err := a.clientConn.Close(); err != nil {
		return err
	}
	a.node.Shutdown(a.ctx)
	a.cancel()
	return nil
}
