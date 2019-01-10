package account

import (
	"berty.tech/core/push"
	"context"
	"fmt"
	"io"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"github.com/jinzhu/gorm"
	reuse "github.com/libp2p/go-reuseport"
	opentracing "github.com/opentracing/opentracing-go"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/core"
	nodeapi "berty.tech/core/api/node"
	p2papi "berty.tech/core/api/p2p"
	"berty.tech/core/bot"
	"berty.tech/core/entity"
	"berty.tech/core/network"
	"berty.tech/core/network/netutil"
	"berty.tech/core/node"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/i18n"
	"berty.tech/core/pkg/notification"
	"berty.tech/core/pkg/tracing"
	"berty.tech/core/pkg/zapring"
	"berty.tech/core/sql"
	"berty.tech/core/sql/sqlcipher"
)

// Info is used in berty.node.DeviceInfos
func Info(ctx context.Context) map[string]string {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	if len(list) < 1 {
		return map[string]string{"accounts": "none!"}
	}
	a := list[0] // FIXME: support multi accounts
	return map[string]string{
		"manager: accounts":  fmt.Sprintf("%d accounts", len(list)),
		"manager: gql-bind":  a.GQLBind,
		"manager: grpc-bind": a.GrpcBind,
		"manager: db":        a.dbPath(),
		"manager: name":      a.Name,
		"manager: with-bot":  fmt.Sprintf("%v", a.withBot),
		// FIXME: retrieve info from manager's DB
	}
}

type Account struct {
	Name       string
	Passphrase string // passphrase should not be stored in this structure (this memory is too easy to read)
	banner     string

	db     *gorm.DB
	dbDir  string
	dbDrop bool

	gqlHandler     http.Handler
	GQLBind        string
	ioGrpc         *netutil.IOGrpc
	ioGrpcListener net.Listener
	gqlServer      *http.Server

	GrpcServer   *grpc.Server
	GrpcBind     string
	grpcListener net.Listener

	network network.Driver
	metrics network.Metrics

	notification notification.Driver

	node     *node.Node
	initOnly bool

	withBot    bool
	BotRunning bool

	tracer        opentracing.Tracer
	tracingCloser io.Closer
	rootContext   context.Context
	rootSpan      opentracing.Span

	errChan chan error

	ring        *zapring.Ring
	pushManager *push.Manager
}

var list []*Account

type NewOption func(*Account) error
type Options []NewOption

func New(ctx context.Context, opts ...NewOption) (*Account, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	a := &Account{
		errChan:     make(chan error, 1),
		rootSpan:    tracer.Span(),
		rootContext: ctx,
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

func Get(ctx context.Context, name string) (*Account, error) {
	tracer := tracing.EnterFunc(ctx, name)
	defer tracer.Finish()
	// ctx = tracer.Context()

	for _, account := range list {
		if account != nil && account.Name == name {
			return account, nil
		}
	}

	return nil, errorcodes.ErrAccManagerNotOpened.NewArgs(map[string]string{"name": name})
}

func List(ctx context.Context, datastorePath string) ([]string, error) {
	tracer := tracing.EnterFunc(ctx, datastorePath)
	defer tracer.Finish()
	// ctx = tracer.Context()

	var names []string

	err := filepath.Walk(datastorePath, func(path string, info os.FileInfo, err error) error {
		logger().Debug("List", zap.String("path", path))
		name := filepath.Base(path)
		match, _ := filepath.Match("berty.*.db", name)
		if match {
			logger().Debug("List", zap.Bool("match", match))
			name = strings.Split(name, ".")[1]
			logger().Debug("List", zap.String("name", name))
			names = append(names, name)
			logger().Debug("List", zap.Strings("names", names))
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return names, nil
}

func Delete(ctx context.Context, a *Account) {
	tracer := tracing.EnterFunc(ctx, a)
	defer tracer.Finish()
	ctx = tracer.Context()

	ForEach(ctx, func(ctx context.Context, i int, current *Account) {
		if a == current {
			list = append(list[:i], list[i+1:]...)
		}
	})
}

func ForEach(ctx context.Context, callback func(context.Context, int, *Account)) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	for index, account := range list {
		callback(ctx, index, account)
	}
}

func (a *Account) Validate() error {
	if a.Name == "" {
		return errorcodes.ErrAccManagerCfgName.New()
	} else if a.Passphrase == "" {
		return errorcodes.ErrAccManagerCfgPassphrase.New()
	} else if a.dbDir == "" {
		return errorcodes.ErrAccManagerDbDir.New()
	} else if a.db == nil {
		return errorcodes.ErrAccManagerDb.New()
	} else if a.network == nil {
		return errorcodes.ErrAccManagerCfgNet.New()
	} else if a.GrpcServer == nil {
		return errorcodes.ErrAccManagerCfgGrpcSrv.New()
	}
	return nil
}

func (a *Account) Open(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	if err := a.initNode(ctx); err != nil {
		a.Close(ctx)
		return err
	}
	if a.initOnly {
		return nil
	}

	// start
	if err := a.startNetwork(ctx); err != nil {
		a.Close(ctx)
		return err
	}
	if err := a.startGrpcServer(ctx); err != nil {
		a.Close(ctx)
		return err
	}
	if err := a.startGQL(ctx); err != nil {
		a.Close(ctx)
		return err
	}
	if err := a.startNode(ctx); err != nil {
		a.Close(ctx)
		return err
	}
	if a.withBot {
		if err := a.StartBot(ctx); err != nil {
			return err
		}
	}

	logger().Info("account started",
		zap.String("pubkey", a.node.PubKey()),
		zap.String("grpc-bind", a.GrpcBind),
		zap.String("gql-bind", a.GQLBind),
		zap.Int("p2p-api", int(p2papi.Version)),
		zap.Int("node-api", int(nodeapi.Version)),
		zap.String("version", core.Version),
		zap.String("git-tag", core.GitTag),
		zap.String("git-sha", core.GitSha),
		zap.String("git-branch", core.GitBranch),
		zap.String("build-mode", core.BuildMode),
		zap.String("commit-date", core.CommitDate().String()),
		zap.String("db", a.dbPath()),
		zap.String("name", a.Name),
	)

	return nil
}

func (a *Account) Close(ctx context.Context) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	if a.node != nil {
		_ = a.node.Close()
	}
	if a.network != nil {
		_ = a.network.Close(ctx)
	}
	if a.db != nil {
		_ = a.db.Close()
	}
	if a.tracingCloser != nil {
		_ = a.tracingCloser.Close()
	}
	if a.grpcListener != nil {
		a.grpcListener.Close()
	}
	if a.ioGrpcListener != nil {
		_ = a.ioGrpcListener.Close()
	}
	if a.gqlServer != nil {
		_ = a.gqlServer.Close()
	}
	if a.BotRunning {
		_ = a.StopBot(ctx)
	}
	if a.ring != nil {
		a.ring.Close()
	}

	logger().Info("account closed")
}

// Database
func (a *Account) dbPath() string {
	return a.dbDir + "/berty." + a.Name + ".db"
}

func (a *Account) openDatabase(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	var err error
	a.db, err = sqlcipher.Open(a.dbPath(), []byte(a.Passphrase))
	if err != nil {
		return errorcodes.ErrAccManagerDb.Wrap(err)
	}
	a.db, err = sql.Init(a.db)
	if err != nil {
		return errorcodes.ErrAccManagerDbInit.Wrap(err)
	}
	if a.dbDrop {
		if err = a.DropDatabase(ctx); err != nil {
			return errorcodes.ErrAccManagerDbDrop.Wrap(err)
		}
	}
	if err = sql.Migrate(a.db); err != nil {
		return errorcodes.ErrAccManagerDbMig.Wrap(err)
	}
	return nil
}

func (a *Account) DropDatabase(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	var err error

	if err = sql.DropDatabase(a.db); err != nil {
		return errorcodes.ErrAccManagerDbDrop.Wrap(err)
	}
	return a.openDatabase(ctx)
}

func (a *Account) startNetwork(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	if a.network == nil {
		return nil
	}

	go func() {
		defer a.PanicHandler()
		a.errChan <- a.network.Start(ctx)
		logger().Debug("network closed")
	}()
	return nil
}

func (a *Account) startGrpcServer(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

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
		a.errChan <- a.GrpcServer.Serve(a.grpcListener)
		logger().Debug("grpc server closed")
	}()

	return nil
}

func (a *Account) StartBot(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	options := append(
		[]bot.Option{
			bot.WithTCPDaemon(a.GrpcBind),
			bot.WithLogger(),
		},
		bot.GenericOptions()...,
	)
	b, err := bot.New(ctx, options...)
	if err != nil {
		return errorcodes.ErrAccManagerBotInit.Wrap(err)
	}

	go func() {
		defer a.PanicHandler()
		for {
			a.BotRunning = true
			logger().Debug("starting bot...")
			if err := b.Start(); err != nil {
				err = errorcodes.ErrAccManagerBotExited.Wrap(err)
				a.node.LogBackgroundError(ctx, err)
				a.BotRunning = false
				//a.errChan <- err
			}
			time.Sleep(time.Second) // retry in 1 sec
		}
	}()

	return nil
}

func (a *Account) StopBot(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	// TODO: implement bot closing function
	// Then set a.BotRunning = false
	return errorcodes.ErrUnimplemented.New()
}

func (a *Account) startGQL(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	if a.gqlHandler == nil {
		return nil
	}

	a.ioGrpcListener = a.ioGrpc.Listener()

	go func() {
		defer a.PanicHandler()
		a.errChan <- a.GrpcServer.Serve(a.ioGrpcListener)
		logger().Debug("io grpc server closed")
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

	a.gqlServer = &http.Server{Addr: fmt.Sprintf("%s:%d", addr.IP.String(), addr.Port), Handler: a.gqlHandler}

	// start gql server
	go func() {
		defer a.PanicHandler()
		a.errChan <- a.gqlServer.ListenAndServe()
		logger().Debug("gql server closed")
	}()
	return nil
}

func (a *Account) initNode(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	var err error

	// initialize node
	a.node, err = node.New(
		a.rootContext,
		node.WithP2PGrpcServer(a.GrpcServer),
		node.WithNodeGrpcServer(a.GrpcServer),
		node.WithSQL(a.db),
		node.WithDevice(&entity.Device{Name: a.Name}),
		node.WithNetworkDriver(a.network),
		node.WithNetworkMetrics(a.metrics),
		node.WithNotificationDriver(a.notification),
		node.WithInitConfig(),
		node.WithSoftwareCrypto(), // FIXME: use hardware impl if available
		node.WithConfig(),
		node.WithRing(a.ring),
		node.WithPushManager(a.pushManager),
	)
	if err != nil {
		return errorcodes.ErrAccManagerInitNode.Wrap(err)
	}

	a.node.DisplayNotification(notification.Payload{
		Title: i18n.T("DaemonStartTitle", nil),
		Body:  i18n.T("DaemonStartBody", nil),
	})
	return nil
}

func (a *Account) startNode(ctx context.Context) error {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	// start node
	go func() {
		defer a.PanicHandler()
		a.errChan <- a.node.Start(a.rootContext, true, true)
		logger().Debug("node stopped")
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
				logger().Info("sighup received")
			case syscall.SIGINT: // kill -SIGINT XXXX or Ctrl+c
				logger().Info("sigint received")
				a.errChan <- nil
			case syscall.SIGTERM: // kill -SIGTERM XXXX (force stop)
				logger().Info("sigterm received")
				a.errChan <- nil
			case syscall.SIGQUIT: // kill -SIGQUIT XXXX (stop and core dump)
				logger().Info("sigquit received")
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
	tracer := tracing.EnterFunc(a.rootContext)
	defer tracer.Finish()
	// ctx := tracer.Context()

	r := recover()
	if r != nil {
		err := errors.New(fmt.Sprintf("%+v", r))
		logger().Error("panic handler: panic received, send error to errChan", zap.Error(err))
		a.errChan <- err
	}
}
