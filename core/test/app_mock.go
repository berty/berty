package test

import (
	"context"
	"fmt"
	"io/ioutil"
	"net"
	"strings"

	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/core/api/client"
	"berty.tech/core/entity"
	"berty.tech/core/network"
	"berty.tech/core/network/netutil"
	"berty.tech/core/node"
	"berty.tech/core/sql"
	"berty.tech/core/sql/sqlcipher"
)

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
}

func NewAppMock(device *entity.Device, networkDriver network.Driver) (*AppMock, error) {
	tmpFile, err := ioutil.TempFile("", "sqlite")
	if err != nil {
		return nil, err
	}

	a := AppMock{
		dbPath:        tmpFile.Name(),
		device:        device,
		networkDriver: networkDriver,
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

	if a.node, err = node.New(
		node.WithSQL(a.db),
		node.WithP2PGrpcServer(gs),
		node.WithNodeGrpcServer(gs),
		node.WithDevice(a.device),
		node.WithNetworkDriver(a.networkDriver),
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

	go func() {
		if err := a.node.Start(); err != nil {
			logger().Error("node routine error", zap.Error(err))
		}
	}()

	a.clientConn, err = grpc.Dial(fmt.Sprintf(":%d", port), grpc.WithInsecure())
	if err != nil {
		return err
	}
	a.client = client.New(a.clientConn)

	a.ctx = context.Background()

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
	if err := a.node.Close(); err != nil {
		return err
	}
	return nil
}
