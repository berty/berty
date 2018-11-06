package account

import (
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"berty.tech/core/entity"
	"berty.tech/core/network"
	"berty.tech/core/network/netutil"
	"berty.tech/core/node"
	"berty.tech/core/sql"
	"berty.tech/core/sql/sqlcipher"
	"github.com/jinzhu/gorm"
	reuse "github.com/libp2p/go-reuseport"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"
)

type Account struct {
	Name       string
	Passphrase string
	banner     string

	db     *gorm.DB
	dbPath string
	dbDrop bool

	gqlHandler  http.Handler
	GQLBind     string
	ioGrpc      *netutil.IOGrpc
	gqlListener net.Listener

	grpcServer   *grpc.Server
	GrpcBind     string
	grpcListener net.Listener

	network network.Driver
	metrics network.Metrics

	node     *node.Node
	initOnly bool

	serverTracerCloser io.Closer
	dialTracerCloser   io.Closer

	errChan chan error
}

var list []*Account

type NewOption func(*Account) error
type Options []NewOption

func New(opts ...NewOption) (*Account, error) {
	a := &Account{
		errChan: make(chan error, 1),
	}

	for _, opt := range opts {
		if err := opt(a); err != nil {
			return nil, err
		}
	}

	if err := a.Validate(); err != nil {
		return nil, err
	}

	list = append(list, a)
	return a, nil
}

func Get(name string) (*Account, error) {
	for _, account := range list {
		if account != nil && account.Name == name {
			return account, nil
		}
	}
	return nil, errors.New("account with name " + name + " isn't opened")
}

func Delete(a *Account) {
	ForEach(func(i int, current *Account) {
		if a == current {
			list = append(list[:i], list[i+1:]...)
		}
	})
}

func ForEach(callback func(int, *Account)) {
	for index, account := range list {
		callback(index, account)
	}
}

func (a *Account) Validate() error {
	if a.Name == "" {
		return errors.New("missing required field (Name) for account")
	} else if a.Passphrase == "" {
		return errors.New("missing required field (Passphrase) for account")
	} else if a.dbPath == "" {
		return errors.New("missing required field (dbPath) for account")
	} else if a.db == nil {
		return errors.New("connecting to the db failed with the provided (dbPath/Passphrase) for account")
	} else if a.network == nil {
		return errors.New("missing required field (network) for account")
	} else if a.grpcServer == nil {
		return errors.New("missing required field (grpcServer) for Account")
	}
	return nil
}

func (a *Account) Open() error {
	if err := a.initNode(); err != nil {
		a.Close()
		return err
	}
	if a.initOnly {
		return nil
	}

	// start
	if err := a.startNetwork(); err != nil {
		a.Close()
		return err
	}
	if err := a.startGrpcServer(); err != nil {
		a.Close()
		return err
	}
	if err := a.startGQL(); err != nil {
		a.Close()
		return err
	}
	if err := a.startNode(); err != nil {
		a.Close()
		return err
	}
	return nil
}

func (a *Account) Close() {
	if a.node != nil {
		_ = a.node.Close()
	}
	if a.network != nil {
		_ = a.network.Close()
	}
	if a.db != nil {
		_ = a.db.Close()
	}
	if a.serverTracerCloser != nil {
		_ = a.serverTracerCloser.Close()
	}
	if a.dialTracerCloser != nil {
		_ = a.dialTracerCloser.Close()
	}
	if a.ioGrpc != nil {
		_ = a.ioGrpc.Listener().Close()
	}
	if a.grpcListener != nil {
		a.grpcListener.Close()
	}

}

// Database
func (a *Account) openDatabase() error {
	var err error
	a.db, err = sqlcipher.Open(a.dbPath+"/berty."+a.Name+".db", []byte(a.Passphrase))
	if err != nil {
		return errors.Wrap(err, "failed to open sqlcipher")
	}
	a.db, err = sql.Init(a.db)
	if err != nil {
		return errors.Wrap(err, "failed to initialize sql")
	}
	if a.dbDrop {
		if err = sql.DropDatabase(a.db); err != nil {
			return errors.Wrap(err, "failed to drop database")
		}
	}
	err = sql.Migrate(a.db)
	if err != nil {
		return errors.Wrap(err, "failed to apply sql migrations")
	}
	return nil
}

func (a *Account) startNetwork() error {
	go func() {
		defer a.PanicHandler()
		a.errChan <- a.network.Start()
	}()
	return nil
}

func (a *Account) startGrpcServer() error {
	var err error

	addr, err := net.ResolveTCPAddr("tcp", a.GrpcBind)
	if err != nil {
		return err
	}

	if addr.IP == nil {
		addr.IP = net.IP{0, 0, 0, 0}
	}

	a.grpcListener, err = reuse.Listen(addr.Network(), fmt.Sprintf("%s:%d", addr.IP.String(), addr.Port))
	if err != nil {
		defer a.PanicHandler()
		return err
	}

	go func() {
		defer a.PanicHandler()
		a.errChan <- a.grpcServer.Serve(a.grpcListener)
	}()

	return nil
}

func (a *Account) startGQL() error {
	var err error

	if a.gqlHandler == nil {
		return nil
	}

	go func() {
		defer a.PanicHandler()
		a.errChan <- a.grpcServer.Serve(a.ioGrpc.Listener())
	}()

	addr, err := net.ResolveTCPAddr("tcp", a.GQLBind)
	if err != nil {
		return err
	}

	if addr.IP == nil {
		addr.IP = net.IP{0, 0, 0, 0}
	}

	if a.GQLBind == "" {
		a.GQLBind = ":8700"
	}

	a.gqlListener, err = reuse.Listen(addr.Network(), fmt.Sprintf("%s:%d", addr.IP.String(), addr.Port))
	if err != nil {
		return err
	}

	// start gql server
	go func() {
		defer a.PanicHandler()
		a.errChan <- http.Serve(a.gqlListener, a.gqlHandler)
	}()
	return nil
}

func (a *Account) initNode() error {
	var err error

	// initialize node
	a.node, err = node.New(
		node.WithP2PGrpcServer(a.grpcServer),
		node.WithNodeGrpcServer(a.grpcServer),
		node.WithSQL(a.db),
		node.WithDevice(&entity.Device{Name: a.Name}),
		node.WithNetworkDriver(a.network),
		node.WithNetworkMetrics(a.metrics),
		node.WithInitConfig(),
		node.WithSoftwareCrypto(), // FIXME: use hardware impl if available
		node.WithConfig(),
	)
	if err != nil {
		return errors.Wrap(err, "failed to initialize node")
	}
	return nil
}

func (a *Account) startNode() error {

	// start node
	go func() {
		defer a.PanicHandler()
		a.errChan <- a.node.Start()

	}()

	// show banner
	if a.banner != "" {
		fmt.Println(a.banner)
	}

	// signal handling
	signalChan := make(chan os.Signal, 1)
	signal.Notify(
		signalChan,
		syscall.SIGHUP,
		syscall.SIGINT,
		syscall.SIGTERM,
		syscall.SIGQUIT,
	)
	go func() {
		for {
			s := <-signalChan
			switch s {
			case syscall.SIGHUP: // kill -SIGHUP XXXX
				log.Println("sighup received")
			case syscall.SIGINT: // kill -SIGINT XXXX or Ctrl+c
				log.Println("sigint received")
				a.errChan <- nil
			case syscall.SIGTERM: // kill -SIGTERM XXXX (force stop)
				log.Println("sigterm received")
				a.errChan <- nil
			case syscall.SIGQUIT: // kill -SIGQUIT XXXX (stop and core dump)
				log.Println("sigquit received")
				a.errChan <- nil
			default:
				a.errChan <- fmt.Errorf("unknown signal received")
			}
		}
	}()

	return nil
}

func (a *Account) ErrChan() chan error {
	return a.errChan
}

func (a *Account) PanicHandler() {
	r := recover()
	if r != nil {
		err := errors.New(fmt.Sprintf("%+v", r))
		logger().Error("panic handler: panic received, send error to errChan", zap.Error(err))
		a.errChan <- err
	}
}
