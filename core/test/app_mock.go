package test

import (
	"context"
	"fmt"
	"io/ioutil"
	"net"

	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"google.golang.org/grpc"

	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/client"
	"github.com/berty/berty/core/entity"
	"github.com/berty/berty/core/network/netutil"
	"github.com/berty/berty/core/node"
	"github.com/berty/berty/core/sql"
	"github.com/berty/berty/core/sql/sqlcipher"
)

type AppMock struct {
	dbPath     string
	listener   net.Listener
	db         *gorm.DB
	node       *node.Node
	clientConn *grpc.ClientConn
	client     *client.Client
	ctx        context.Context
	device     *entity.Device
}

func NewAppMock(device *entity.Device) (*AppMock, error) {
	tmpFile, err := ioutil.TempFile("", "sqlite")
	if err != nil {
		return nil, err
	}

	a := AppMock{
		dbPath: tmpFile.Name(),
		device: device,
	}

	if err := a.Open(); err != nil {
		return nil, err
	}

	return &a, nil
}

func (a *AppMock) Open() error {
	var err error

	if a.db, err = sqlcipher.Open(a.dbPath, []byte("s3cur3")); err != nil {
		return err
	}
	if a.db, err = sql.Init(a.db); err != nil {
		return errors.Wrap(err, "failed to initialize sql")
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
	); err != nil {
		return err
	}

	go func() {
		_ = gs.Serve(a.listener)
	}()

	a.clientConn, err = grpc.Dial(fmt.Sprintf(":%d", port), grpc.WithInsecure())
	if err != nil {
		return err
	}
	a.client = client.New(a.clientConn)

	a.ctx = p2p.SetSender(context.Background(), a.node.PeerID())

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
