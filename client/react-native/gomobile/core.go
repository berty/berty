package core

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	gqlhandler "github.com/99designs/gqlgen/handler"
	"github.com/jinzhu/gorm"
	"github.com/pkg/errors"
	"go.uber.org/zap"
	"google.golang.org/grpc"

	"berty.tech/core"
	nodeapi "berty.tech/core/api/node"
	gql "berty.tech/core/api/node/graphql"
	graph "berty.tech/core/api/node/graphql/graph"
	p2papi "berty.tech/core/api/p2p"
	"berty.tech/core/entity"
	"berty.tech/core/network"
	"berty.tech/core/network/p2p"
	"berty.tech/core/node"
	"berty.tech/core/sql"
	"berty.tech/core/sql/sqlcipher"
	reuse "github.com/libp2p/go-reuseport"
	"github.com/rs/cors"
)

func logger() *zap.Logger {
	return zap.L().Named("core.cmd.berty")
}

var port int
var unixSockPath string

func Start(datastorePath string) error {

	// check if daemon already init
	if port != 0 {
		return nil
	}
	if unixSockPath != "" {
		return nil
	}

	// initialize logger
	cfg := zap.NewDevelopmentConfig()
	cfg.Level.SetLevel(zap.DebugLevel)
	l, err := cfg.Build()
	if err != nil {
		panic(err)
	}
	zap.ReplaceGlobals(l)

	if err := Daemon(datastorePath, []byte("secure"), "bart"); err != nil {
		return err
	}
	return nil
}

func GetPort() (int, error) {
	if port == 0 {
		err := errors.New("port is not defined: wait for daemon to start")
		logger().Error(err.Error())
		return 0, err
	}
	return port, nil
}

func GetUnixSockPath() (string, error) {
	if unixSockPath == "" {
		err := errors.New("unix socket not initialized")
		logger().Error(err.Error())
		return "", err
	}
	return unixSockPath, nil
}

func Daemon(datastorePath string, passphrase []byte, deviceName string) error {
	var (
		gs       *grpc.Server
		bind     string
		listener net.Listener
		db       *gorm.DB
		driver   network.Driver
		conn     *grpc.ClientConn
		resolver graph.Config
		mux      *http.ServeMux
		handler  http.Handler
		n        *node.Node
		errChan  chan error
		err      error
	)

	errChan = make(chan error)

	// initialize gRPC
	gs = grpc.NewServer()

	// listener, err = net.Listen("unix", datastorePath+"/berty.sock")
	// if err != nil {
	// 	return err
	// }
	// unixSockPath = datastorePath + "/berty.sock"

	listener, err = reuse.Listen("tcp", "0.0.0.0:0")
	if err != nil {
		return err
	}

	port = listener.Addr().(*net.TCPAddr).Port
	bind = fmt.Sprintf("127.0.0.1:%d", port)
	logger().Debug(fmt.Sprintf("Listener address: %s", bind))

	// initialize sql
	db, err = sqlcipher.Open(datastorePath+"/berty.sqlcipher", passphrase)
	if err != nil {
		return errors.Wrap(err, "failed to open sqlcipher")
	}

	defer db.Close()
	if db, err = sql.Init(db); err != nil {
		return errors.Wrap(err, "failed to initialize sql")
	}

	if err = sql.Migrate(db); err != nil {
		return errors.Wrap(err, "failed to apply sql migrations")
	}

	p2pOpts := []p2p.Option{
		p2p.WithRandomIdentity(),
		p2p.WithDefaultMuxers(),
		p2p.WithDefaultPeerstore(),
		p2p.WithDefaultSecurity(),
		p2p.WithDefaultTransports(),
		// @TODO: Allow static identity loaded from a file (useful for relay
		// server for creating static endpoint for bootstrap)
		// p2p.WithIdentity(<key>),
		p2p.WithNATPortMap(), // @TODO: Is this a pb on mobile?
		p2p.WithListenAddrStrings("/ip4/0.0.0.0/tcp/0"),
		//p2p.WithBootstrap(opts.bootstrap...),
		p2p.WithMDNS(),
		p2p.WithRelayClient(),
	}

	driver, err = p2p.NewDriver(context.Background(), p2pOpts...)
	if err != nil {
		logger().Error(err.Error())
		return err
	}

	// initialize node
	n, err = node.New(
		node.WithP2PGrpcServer(gs),
		node.WithNodeGrpcServer(gs),
		node.WithSQL(db),
		node.WithDevice(&entity.Device{Name: deviceName}), // FIXME: get device dynamically
		node.WithNetworkDriver(driver),                    // FIXME: use a p2p driver instead
	)
	if err != nil {
		logger().Error(err.Error())
		return errors.Wrap(err, "failed to initialize node")
	}

	conn, err = grpc.Dial(bind, grpc.WithInsecure())
	if err != nil {
		logger().Error(err.Error())
		return errors.Wrap(err, "failed to dial node")
	}

	resolver = gql.New(nodeapi.NewServiceClient(conn))

	// mux = http.NewServeMux()
	// mux.Handle("/", gqlhandler.Playground("Berty", "/query"))
	// mux.Handle("/query", gqlhandler.GraphQL(graph.NewExecutableSchema(resolver)))

	// handler = cors.New(cors.Options{
	// 	AllowedOrigins: []string{"*"}, // FIXME: use specific URLs?
	// 	AllowedMethods: []string{"POST"},
	// 	//AllowCredentials: true,
	// 	AllowedHeaders: []string{"authorization", "content-type"},
	// 	ExposedHeaders: []string{"Access-Control-Allow-Origin"},
	// 	Debug:          true,
	// }).Handler(mux)

	// http.Handle("/", gqlhandler.Playground("Berty", "/query"))
	// http.Handle("/query", gqlhandler.GraphQL(graph.NewExecutableSchema(resolver)))

	mux = http.NewServeMux()
	mux.Handle("/", gqlhandler.Playground("Berty", "/query"))
	mux.Handle("/query", gqlhandler.GraphQL(graph.NewExecutableSchema(resolver)))

	handler = cors.New(cors.Options{
		AllowedOrigins: []string{"*"}, // FIXME: use specific URLs?
		AllowedMethods: []string{"POST"},
		//AllowCredentials: true,
		AllowedHeaders: []string{"authorization", "content-type"},
		ExposedHeaders: []string{"Access-Control-Allow-Origin"},
		//Debug:            true,
	}).Handler(mux)

	go func() {
		if err := http.Serve(listener, handler); err != nil {
			logger().Error(err.Error())
			errChan <- fmt.Errorf("http.ListenAndServe: %s", err.Error())
		}
	}()

	// start grpc server(s)
	// go func() {
	// 	if err := gs.Serve(listener); err != nil {
	// 		logger().Error(err.Error())
	// 		errChan <- fmt.Errorf("gs.Serve: %s", err.Error())
	// 	}
	// 	logger().Debug("gs.Serve")
	// }()

	logger().Info("grpc server started",
		zap.String("user-id", n.UserID()),
		zap.String("bind", bind),
		zap.Int("p2p-api", int(p2papi.Version)),
		zap.Int("node-api", int(nodeapi.Version)),
		zap.String("version", core.Version),
	)

	// start node
	go func() {
		if err := n.Start(); err != nil {
			logger().Error(err.Error())
			errChan <- fmt.Errorf("n.Start(): %s", err.Error())
		}
	}()

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
				errChan <- nil
			case syscall.SIGTERM: // kill -SIGTERM XXXX (force stop)
				log.Println("sigterm received")
				errChan <- nil
			case syscall.SIGQUIT: // kill -SIGQUIT XXXX (stop and core dump)
				log.Println("sigquit received")
				errChan <- nil
			default:
				errChan <- fmt.Errorf("unknown signal received")
			}
		}
	}()

	// tigger first goroutine error
	go func() {
		err := <-errChan
		logger().Panic(err.Error())
		panic(err)
	}()

	return nil
}
