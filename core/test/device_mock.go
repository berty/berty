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
	"github.com/berty/berty/core/network/netutil"
	"github.com/berty/berty/core/node"
	"github.com/berty/berty/core/sql"
	"github.com/berty/berty/core/sql/sqlcipher"
)

type DeviceMock struct {
	name       string
	dbPath     string
	listener   net.Listener
	db         *gorm.DB
	node       *node.Node
	clientConn *grpc.ClientConn
	client     *client.Client
	ctx        context.Context
}

func NewDeviceMock(name string) (*DeviceMock, error) {
	tmpFile, err := ioutil.TempFile("", "sqlite")
	if err != nil {
		return nil, err
	}

	device := DeviceMock{
		name:   name,
		dbPath: tmpFile.Name(),
	}

	if err := device.Open(); err != nil {
		return nil, err
	}

	return &device, nil
}

func (d *DeviceMock) Open() error {
	var err error

	if d.db, err = sqlcipher.Open(d.dbPath, []byte("s3cur3")); err != nil {
		return err
	}
	if d.db, err = sql.Init(d.db); err != nil {
		return errors.Wrap(err, "failed to initialize sql")
	}

	gs := grpc.NewServer()
	port, err := netutil.GetFreeTCPPort()
	if err != nil {
		return err
	}
	d.listener, err = net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		return err
	}

	if d.node, err = node.New(
		node.WithSQL(d.db),
		node.WithP2PGrpcServer(gs),
		node.WithNodeGrpcServer(gs),
	); err != nil {
		return err
	}

	go func() {
		_ = gs.Serve(d.listener)
	}()

	d.clientConn, err = grpc.Dial(fmt.Sprintf(":%d", port), grpc.WithInsecure())
	if err != nil {
		return err
	}
	d.client = client.New(d.clientConn)

	d.ctx = p2p.SetSender(context.Background(), d.node.PeerID())

	return nil
}

func (d *DeviceMock) Close() error {
	if err := d.db.Close(); err != nil {
		return err
	}
	if err := d.listener.Close(); err != nil {
		return err
	}
	if err := d.clientConn.Close(); err != nil {
		return err
	}
	d.node.Close()
	return nil
}
