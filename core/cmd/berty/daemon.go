package main

import (
	"context"
	"io/ioutil"
	"net"
	"net/http"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_recovery "github.com/grpc-ecosystem/go-grpc-middleware/recovery"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	grpc_web "github.com/improbable-eng/grpc-web/go/grpcweb"
	grpc "google.golang.org/grpc"
	grpc_codes "google.golang.org/grpc/codes"
	grpc_status "google.golang.org/grpc/status"

	"berty.tech/core/api/helper"
	daemon "berty.tech/core/daemon"
	"berty.tech/core/pkg/deviceinfo"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/notification"
	"berty.tech/network"
	"github.com/spf13/cobra"
	"github.com/spf13/pflag"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

const MessageMaxSize = 1 << 22 // 4mb

type daemonOptions struct {
	sql sqlOptions `mapstructure:"sql"`

	daemonWebBind  string `mapstructure:"daemon-web-bind"`
	daemonGRPCBind string `mapstructure:"daemon-grpc-bind"`

	grpcBind         string   `mapstructure:"grpc-bind"`
	grpcWebBind      string   `mapstructure:"grpc-web-bind"`
	hideBanner       bool     `mapstructure:"hide-banner"`
	dropDatabase     bool     `mapstructure:"drop-database"`
	initOnly         bool     `mapstructure:"init-only"`
	withBot          bool     `mapstructure:"with-bot"`
	notification     bool     `mapstructure:"notification"`
	apnsCerts        []string `mapstructure:"apns-certs"`
	apnsDevVoipCerts []string `mapstructure:"apns-dev-voip-certs"`
	fcmAPIKeys       []string `mapstructure:"fcm-api-keys"`
	privateKeyFile   string   `mapstructure:"private-key-file"`
	ipfs             bool     `mapstructure:"ipfs"`

	// p2p

	peerCache      bool     `mapstructure:"cache-peer"`
	identity       string   `mapstructure:"identity"`
	bootstrap      []string `mapstructure:"bootstrap"`
	noP2P          bool     `mapstructure:"no-p2p"`
	bindP2P        []string `mapstructure:"bind-p2p"`
	transportP2P   []string `mapstructure:"transport-p2p"`
	hop            bool     `mapstructure:"hop"` // relay hop
	ble            bool     `mapstructure:"ble"`
	mdns           bool     `mapstructure:"mdns"`
	mobile         bool     `mapstructure:"mobile"`
	dhtServer      bool     `mapstructure:"dht"`
	PrivateNetwork bool     `mapstructure:"private-network"`
	nickname       string   `mapstructure:"nickname"`
}

func daemonSetupFlags(flags *pflag.FlagSet, opts *daemonOptions) {
	// account / node
	flags.StringVar(&opts.nickname, "nickname", "berty-daemon", "set account nickname")
	flags.BoolVar(&opts.dropDatabase, "drop-database", false, "drop database to force a reinitialization")
	flags.BoolVar(&opts.notification, "notification", false, "enable local notification")
	flags.BoolVar(&opts.hideBanner, "hide-banner", false, "hide banner")
	flags.BoolVar(&opts.initOnly, "init-only", false, "stop after node initialization (useful for integration tests")
	flags.StringVar(&opts.privateKeyFile, "private-key-file", "", "set private key file for node")
	flags.BoolVar(&opts.withBot, "bot", false, "enable bot")

	// binding
	flags.StringVar(&opts.daemonWebBind, "daemon-web-bind", ":8989", "daemon web listening address")
	flags.StringVar(&opts.daemonGRPCBind, "daemon-grpc-bind", "", "daemon service gRPC listening address")
	flags.StringVar(&opts.grpcBind, "grpc-bind", ":1337", "gRPC listening address")
	flags.StringVar(&opts.grpcWebBind, "grpc-web-bind", ":8737", "Bind grpc web api")

	// network
	flags.StringVarP(&opts.identity, "p2p-identity", "i", "", "set p2p identity")
	flags.StringSliceVar(&opts.apnsCerts, "apns-certs", []string{}, "Path of APNs certificates, delimited by commas")
	flags.StringSliceVar(&opts.apnsDevVoipCerts, "apns-dev-voip-certs", []string{}, "Path of APNs VoIP development certificates, delimited by commas")
	flags.StringSliceVar(&opts.fcmAPIKeys, "fcm-api-keys", []string{}, "API keys for Firebase Cloud Messaging, in the form packageid:token, delimited by commas")
	flags.StringSliceVar(&opts.bootstrap, "bootstrap", network.DefaultBootstrap, "boostrap peers")
	flags.BoolVar(&opts.noP2P, "no-p2p", false, "Disable p2p Driver")
	// flags.BoolVar(&opts.hop, "hop", false, "enable relay hop (should not be enable for client)")
	flags.BoolVar(&opts.mdns, "mdns", true, "enable mdns discovery")
	flags.BoolVar(&opts.dhtServer, "dht-server", true, "enable dht server")
	flags.BoolVar(&opts.ble, "ble", false, "enable ble transport")
	flags.BoolVar(&opts.mobile, "mobile", false, "enable mobile mode")
	flags.BoolVar(&opts.PrivateNetwork, "private-network", true, "enable private network with the default swarm key")
	flags.BoolVar(&opts.ipfs, "ipfs", false, "connect to ipfs network (override private-network & boostrap)")
	flags.BoolVar(&opts.peerCache, "cache-peer", true, "if false, network will ask the dht every time he need to send an envelope (emit)")
	flags.StringSliceVar(&opts.bindP2P, "bind-p2p", nil, "p2p listening address")
	// flags.StringSliceVar(&opts.bindP2P, "bind-p2p", []string{"/ip4/0.0.0.0/tcp/0"}, "p2p listening address")
	_ = viper.BindPFlags(flags)
}

func newDaemonCommand() *cobra.Command {
	opts := &daemonOptions{}
	cmd := &cobra.Command{
		Use: "daemon",
		RunE: func(cmd *cobra.Command, args []string) error {
			if err := viper.Unmarshal(opts); err != nil {
				return err
			}
			if err := viper.Unmarshal(&opts.sql); err != nil {
				return err
			}
			return runDaemon(opts)
		},
	}

	daemonSetupFlags(cmd.Flags(), opts)
	sqlSetupFlags(cmd.Flags(), &opts.sql)
	return cmd
}

func runDaemon(opts *daemonOptions) error {
	sqlConfig := &daemon.SQLConfig{
		Name: opts.sql.name,
		Key:  opts.sql.key,
	}

	if opts.ipfs {
		logger().Warn("Connecting to ipfs network")
		opts.bootstrap = network.BootstrapIpfs
		opts.PrivateNetwork = false
	}

	if opts.bindP2P == nil {
		opts.bindP2P = []string{
			"/ip4/0.0.0.0/udp/0/quic",
			"/ip4/0.0.0.0/tcp/0",
		}
	}

	networkConfig := &daemon.NetworkConfig{
		PeerCache:      opts.peerCache,
		Identity:       opts.identity,
		Bootstrap:      opts.bootstrap,
		BindP2P:        opts.bindP2P,
		Mdns:           opts.mdns,
		PrivateNetwork: opts.PrivateNetwork,
		Mobile:         opts.mobile,
		Ipfs:           opts.ipfs,
	}

	config := &daemon.Config{
		SqlOpts:          sqlConfig,
		GrpcBind:         opts.grpcBind,
		GrpcWebBind:      opts.grpcWebBind,
		HideBanner:       opts.hideBanner,
		DropDatabase:     opts.dropDatabase,
		InitOnly:         opts.initOnly,
		WithBot:          opts.withBot,
		Notification:     opts.notification,
		ApnsCerts:        opts.apnsCerts,
		ApnsDevVoipCerts: opts.apnsDevVoipCerts,
		FcmAPIKeys:       opts.fcmAPIKeys,
		PrivateKeyFile:   opts.privateKeyFile,
		NoP2P:            opts.noP2P,
		NetworkConfig:    networkConfig,
	}

	startRequest := &daemon.StartRequest{
		Nickname: opts.nickname,
	}

	dlogger := zap.L().Named("daemon.grpc")
	// serverStreamOpts := []grpc.StreamServerInterceptor{
	// 	// grpc_auth.StreamServerInterceptor(myAuthFunction),
	// 	grpc_ctxtags.StreamServerInterceptor(),
	// 	grpc_zap.StreamServerInterceptor(dlogger),
	// 	grpc_recovery.StreamServerInterceptor(grpc_recovery.WithRecoveryHandler(errorcodes.RecoveryHandler)),
	// 	errorcodes.StreamServerInterceptor(),
	// }
	serverUnaryOpts := []grpc.UnaryServerInterceptor{
		// grpc_auth.UnaryServerInterceptor(myAuthFunction),
		grpc_ctxtags.UnaryServerInterceptor(),
		grpc_zap.UnaryServerInterceptor(dlogger),
		grpc_recovery.UnaryServerInterceptor(grpc_recovery.WithRecoveryHandler(errorcodes.RecoveryHandler)),
		errorcodes.UnaryServerInterceptor(),
	}

	interceptors := []grpc.ServerOption{
		// grpc.StreamInterceptor(grpc_middleware.ChainStreamServer(serverStreamOpts...)),
		grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(serverUnaryOpts...)),
	}

	// set storage path
	if err := deviceinfo.SetStoragePath(opts.sql.path); err != nil {
		return err
	}

	d := daemon.New()
	if opts.notification {
		d.Notification = notification.NewDesktopNotification()
	}

	if _, err := d.Initialize(context.Background(), config); err != nil {
		return err
	}

	if _, err := d.Start(context.Background(), startRequest); err != nil {
		return err
	}

	if opts.daemonWebBind != "" {
		go func() {
			if err := serveWeb(d, opts.daemonWebBind, interceptors...); err != nil {
				logger().Error("serve web", zap.Error(err))
			}
		}()
	}

	if opts.daemonGRPCBind != "" {
		go func() {
			if err := serveGrpc(d, opts.daemonGRPCBind, interceptors...); err != nil {
				logger().Error("serve web", zap.Error(err))
			}
		}()
	}

	if !opts.initOnly {
		select {}
	}

	return nil
}

func serveWeb(d *daemon.Daemon, bind string, interceptors ...grpc.ServerOption) error {
	gs := grpc.NewServer(interceptors...)
	daemon.RegisterDaemonServer(gs, d)

	iogrpc := helper.NewIOGrpc()
	listener := iogrpc.Listener()
	go func() {
		if err := gs.Serve(listener); err != nil {
			logger().Error("io serve error", zap.Error(err))
		}
	}()

	dialer := iogrpc.NewDialer()
	dialOpts := append([]grpc.DialOption{
		grpc.WithInsecure(),
		grpc.WithDialer(dialer),
	})

	conn, err := grpc.Dial("", dialOpts...)
	if err != nil {
		return err
	}

	// web handler (should be deprecated in favor of grpc-web)
	http.HandleFunc("/daemon", func(w http.ResponseWriter, r *http.Request) {
		if method := r.Header.Get("X-Method"); method != "" {
			buff, err := ioutil.ReadAll(r.Body)
			if err != nil {
				logger().Error("error while reading full body", zap.Error(err))
				return
			}

			in := helper.NewLazyMessage().FromBytes(buff)
			out := helper.NewLazyMessage()

			if err := conn.Invoke(context.Background(), method, in, out, helper.GrpcCallWithLazyCodec()); err != nil {
				s, ok := grpc_status.FromError(err)
				if !ok {
					s = grpc_status.New(grpc_codes.Unknown, err.Error())
				}

				http.Error(w, s.Message(), errorcodes.HTTPStatusFromGrpcCode(s.Code()))
				return
			}

			w.Header().Set("Content-Type", "application/octet-stream")
			w.Write(out.Bytes())
			return
		}

		w.WriteHeader(http.StatusNoContent)
	})

	// grpc web
	wgrpc := grpc_web.WrapServer(
		gs,
		// @TODO: do something smarter here
		grpc_web.WithOriginFunc(func(_ string) bool {
			return true
		}),
		// @TODO: check if this can be use by every platform; setting to
		// false for the moment
		grpc_web.WithWebsockets(false),
	)

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Handle preflight CORS
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, XMLHttpRequest, x-user-agent, x-grpc-web, grpc-status, grpc-message, x-method")
		w.Header().Add("Access-Control-Expose-Headers", "grpc-status, grpc-message")

		if r.Method == "OPTIONS" {
			return
		}

		if wgrpc.IsGrpcWebRequest(r) {
			// set this headers to avoid unsafe header
			w.Header().Set("grpc-status", "")
			w.Header().Set("grpc-message", "")

			wgrpc.ServeHTTP(w, r)
			return
		}

		http.DefaultServeMux.ServeHTTP(w, r)
	})

	s := &http.Server{
		Addr:    bind,
		Handler: handler,
	}

	return s.ListenAndServe()
}

func serveGrpc(d *daemon.Daemon, bind string, interceptors ...grpc.ServerOption) error {
	gs := grpc.NewServer(interceptors...)
	daemon.RegisterDaemonServer(gs, d)
	listener, err := net.Listen("tcp", bind)
	if err != nil {
		return err
	}

	return gs.Serve(listener)
}
