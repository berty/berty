package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"net"
	"net/http"
	"os"
	"strings"
	"time"

	"berty.tech/go/internal/banner"
	_ "berty.tech/go/internal/buildconstraints" // fail if bad go version
	"berty.tech/go/internal/grpcutil"
	"berty.tech/go/pkg/bertychat"
	"berty.tech/go/pkg/bertyprotocol"
	"berty.tech/go/pkg/errcode"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/sqlite" // required by gorm
	"github.com/oklog/run"
	"github.com/peterbourgon/ff"
	"github.com/peterbourgon/ff/ffcli"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"

	grpcw "github.com/grpc-ecosystem/grpc-gateway/runtime"
	grpcweb "github.com/improbable-eng/grpc-web/go/grpcweb"
	grpc "google.golang.org/grpc"

	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr-net"
)

func main() {
	log.SetFlags(0)

	var (
		logger            *zap.Logger
		globalFlags       = flag.NewFlagSet("bertychat", flag.ExitOnError)
		globalDebug       = globalFlags.Bool("debug", false, "debug mode")
		bannerFlags       = flag.NewFlagSet("banner", flag.ExitOnError)
		bannerLight       = bannerFlags.Bool("light", false, "light mode")
		clientFlags       = flag.NewFlagSet("client", flag.ExitOnError)
		clientProtocolURN = clientFlags.String("protocol-urn", ":memory:", "protocol sqlite URN")
		clientChatURN     = clientFlags.String("chat-urn", ":memory:", "chat sqlite URN")
		clientListeners   = clientFlags.String("listeners", ":9091", "client listeners")
	)

	globalPreRun := func() error {
		rand.Seed(time.Now().UnixNano())
		if *globalDebug {
			config := zap.NewDevelopmentConfig()
			config.Level.SetLevel(zap.DebugLevel)
			config.DisableStacktrace = true
			config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
			var err error
			logger, err = config.Build()
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
			logger.Debug("logger initialized in debug mode")
		} else {
			config := zap.NewDevelopmentConfig()
			config.Level.SetLevel(zap.InfoLevel)
			config.DisableStacktrace = true
			config.EncoderConfig.EncodeLevel = zapcore.CapitalColorLevelEncoder
			var err error
			logger, err = config.Build()
			if err != nil {
				return errcode.TODO.Wrap(err)
			}
		}
		return nil
	}

	banner := &ffcli.Command{
		Name:    "banner",
		Usage:   "banner",
		FlagSet: bannerFlags,
		Exec: func(args []string) error {
			if err := globalPreRun(); err != nil {
				return err
			}
			if *bannerLight {
				fmt.Println(banner.QOTD())
			} else {
				fmt.Println(banner.OfTheDay())
			}
			return nil
		},
	}

	version := &ffcli.Command{
		Name:  "version",
		Usage: "version",
		Exec: func(args []string) error {
			fmt.Println("dev")
			return nil
		},
	}

	daemon := &ffcli.Command{
		Name:    "daemon",
		Usage:   "daemon",
		FlagSet: clientFlags,
		Exec: func(args []string) error {
			if err := globalPreRun(); err != nil {
				return err
			}

			ctx := context.Background()

			// protocol
			var protocol bertyprotocol.Client
			{
				// initialize sqlite3 gorm database
				db, err := gorm.Open("sqlite3", *clientProtocolURN)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				defer db.Close()

				// initialize new protocol client
				opts := bertyprotocol.Opts{
					Logger: logger.Named("bertyprotocol"),
				}
				protocol, err = bertyprotocol.New(db, opts)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				defer protocol.Close()
			}

			// chat
			var chat bertychat.Client
			{
				// initialize sqlite3 gorm database
				db, err := gorm.Open("sqlite3", *clientChatURN)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
				defer db.Close()

				// initialize bertychat client
				chatOpts := bertychat.Opts{
					Logger: logger.Named("bertychat"),
				}
				chat, err = bertychat.New(db, protocol, chatOpts)
				if err != nil {
					return errcode.TODO.Wrap(err)
				}

				defer chat.Close()
			}

			// listeners for bertychat
			var workers run.Group
			{
				// setup grpc server
				grpcServer := grpc.NewServer()
				bertychat.RegisterAccountServer(grpcServer, chat)

				// setup listeners
				for _, addr := range strings.Split(*clientListeners, ",") {
					maddr, err := parseAddr(addr)
					if err != nil {
						return errcode.TODO.Wrap(err)
					}

					var listener manet.Listener
					var serveFunc func(net.Listener) error = grpcServer.Serve // set grpcServer by default
					ma.ForEach(maddr, func(c ma.Component) bool {
						switch c.Protocol().Code {
						case ma.P_IP4, ma.P_IP6: // skip
						case ma.P_TCP, ma.P_UNIX:
							if listener, err = manet.Listen(maddr); err != nil {
								return false // end
							}

						case grpcutil.P_GRPC:
							if listener == nil {
								return false // end
							}

							serveFunc = grpcServer.Serve

						case grpcutil.P_GRPC_WEB, grpcutil.P_GRPC_WEBSOCKET:
							if listener == nil {
								return false // end
							}

							wgrpc := grpcweb.WrapServer(grpcServer,
								grpcweb.WithOriginFunc(func(string) bool { return true }), // @FIXME: this is very insecure
								grpcweb.WithWebsockets(grpcutil.P_GRPC_WEBSOCKET == c.Protocol().Code),
							)
							serverWeb := http.Server{
								Handler: grpcWebHandler(wgrpc),
							}

							serveFunc = serverWeb.Serve

						case grpcutil.P_GRPC_GATEWAY:
							if listener == nil {
								return false // end
							}

							gwmux := grpcw.NewServeMux()
							gatewayServer := http.Server{
								Handler: gwmux,
							}

							dialOpts := []grpc.DialOption{grpc.WithInsecure()}
							target := "127.0.0.1:" + c.Value()
							err = bertychat.RegisterAccountHandlerFromEndpoint(ctx, gwmux, target, dialOpts)

							serveFunc = gatewayServer.Serve

						default:
							err = fmt.Errorf("protocol not supported: %s", c.Protocol().Name)
							return false // end
						}

						return true // continue
					})

					if err != nil {
						return errcode.TODO.Wrap(err)
					}

					if listener == nil {
						return errcode.TODO.Wrap(fmt.Errorf("invalid addr: `%s`", addr))
					}

					workers.Add(func() error {
						logger.Info("starting server", zap.String("addr", maddr.String()))
						return serveFunc(manet.NetListener(listener))
					}, func(error) {
						logger.Debug("closing grpc server")
						listener.Close()
					})
				}
			}

			info, err := protocol.AccountGetInformation(ctx, nil)
			if err != nil {
				return errcode.TODO.Wrap(err)
			}

			logger.Info("client initialized", zap.String("peer-id", info.PeerID), zap.Strings("listeners", info.Listeners))
			return workers.Run()
		},
	}

	root := &ffcli.Command{
		Usage:       "bertychat [global flags] <subcommand> [flags] [args...]",
		FlagSet:     globalFlags,
		Options:     []ff.Option{ff.WithEnvVarPrefix("BERTY")},
		Subcommands: []*ffcli.Command{daemon, banner, version},
		Exec: func([]string) error {
			globalFlags.Usage()
			return flag.ErrHelp
		},
	}

	if err := root.Run(os.Args[1:]); err != nil {
		log.Fatalf("error: %v", err)
	}
}

func grpcWebHandler(wgrpc *grpcweb.WrappedGrpcServer) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Handle preflight CORS

		// FIXME: enable tls, add authentification and remove wildcard on Allow-Origin
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, XMLHttpRequest, x-user-agent, x-grpc-web, grpc-status, grpc-message, x-method")
		w.Header().Add("Access-Control-Expose-Headers", "grpc-status, grpc-message")

		if r.Method == "OPTIONS" {
			return
		}

		// handle grpc web
		if wgrpc.IsGrpcWebRequest(r) {
			// set this headers to avoid unsafe header
			w.Header().Set("grpc-status", "")
			w.Header().Set("grpc-message", "")

			wgrpc.ServeHTTP(w, r)
			return
		}

		http.DefaultServeMux.ServeHTTP(w, r)
	}
}

func parseAddr(addr string) (maddr ma.Multiaddr, err error) {
	maddr, err = ma.NewMultiaddr(addr)
	if err != nil {
		// try to get a tcp multiaddr from host:port
		host, port, serr := net.SplitHostPort(addr)
		if serr != nil {
			return
		}

		if host == "" {
			host = "127.0.0.1"
		}

		addr = fmt.Sprintf("/ip4/%s/tcp/%s/", host, port)
		maddr, err = ma.NewMultiaddr(addr)
	}

	return
}
