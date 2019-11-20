package grpcutil

import (
	"fmt"
	"net"
	"net/http"
	"sync"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr-net"
	"google.golang.org/grpc"
)

// BertyCustomPrefix is a multiformat custom prefix
const BertyCustomPrefix = 0xbe00

const P_GRPC = BertyCustomPrefix + 0x0002           //nolint:golint
const P_GRPC_WEB = BertyCustomPrefix + 0x0004       //nolint:golint
const P_GRPC_WEBSOCKET = BertyCustomPrefix + 0x0008 //nolint:golint

// const P_GRPC_GATEWAY = BertyCustomPrefix + 0x0016

var protos = []ma.Protocol{
	{
		Name:  "grpc",
		Code:  P_GRPC,
		VCode: ma.CodeToVarint(P_GRPC),
	},

	{
		Name:  "grpcweb",
		Code:  P_GRPC_WEB,
		VCode: ma.CodeToVarint(P_GRPC_WEB),
	},

	{
		Name:  "grpcws",
		Code:  P_GRPC_WEBSOCKET,
		VCode: ma.CodeToVarint(P_GRPC_WEBSOCKET),
	},

	// ma.Protocol{
	// 	Name:       "gw",
	// 	Code:       P_GRPC_GATEWAY,
	// 	VCode:      ma.CodeToVarint(P_GRPC_GATEWAY),
	// 	Size:       16,
	// 	Path:       false,
	// 	Transcoder: ma.TranscoderPort,
	// },
}

type WrappedServer interface {
	ListenAndServe() error
	Close() error
}

type server struct {
	mulistener sync.Mutex
	listener   manet.Listener
	maddr      ma.Multiaddr
	serve      func(net.Listener) error
}

func (s *server) Close() (err error) {
	s.mulistener.Lock()
	defer s.mulistener.Unlock()

	if s.listener != nil {
		err = s.listener.Close()
	}

	return
}

func (s *server) ListenAndServe() (err error) {
	s.mulistener.Lock()
	if s.listener, err = manet.Listen(s.maddr); err != nil {
		s.mulistener.Unlock()
		return
	}

	s.mulistener.Unlock()
	err = s.serve(manet.NetListener(s.listener))
	return
}

func NewWrappedServer(maddr ma.Multiaddr, grpcServer *grpc.Server) (WrappedServer, error) {
	s := &server{
		maddr: maddr,
		serve: grpcServer.Serve,
	}

	var err error
	ma.ForEach(maddr, func(c ma.Component) bool {
		switch c.Protocol().Code {
		case ma.P_IP4, ma.P_IP6, ma.P_TCP, ma.P_UNIX: // skip (supported protocol)

		case P_GRPC:
			s.serve = grpcServer.Serve

		case P_GRPC_WEB, P_GRPC_WEBSOCKET:
			wgrpc := grpcweb.WrapServer(grpcServer,
				grpcweb.WithOriginFunc(func(string) bool { return true }), // @FIXME: this is very insecure
				grpcweb.WithWebsockets(P_GRPC_WEBSOCKET == c.Protocol().Code),
			)

			serverWeb := http.Server{
				Handler: http.HandlerFunc(wgrpc.ServeHTTP),
			}

			s.serve = serverWeb.Serve

		// case P_GRPC_GATEWAY:
		// 	if listener == nil {
		// 		return false // end
		// 	}

		// 	gwmux := grpcw.NewServeMux()
		// 	gatewayServer := http.Server{
		// 		Handler: gwmux,
		// 	}

		// 	dialOpts := []grpc.DialOption{grpc.WithInsecure()}
		// 	target := "127.0.0.1:" + c.Value()
		// 	err = bertychat.RegisterAccountHandlerFromEndpoint(ctx, gwmux, target, dialOpts)

		// 	s.serve = gatewayServer.Serve

		default:
			err = fmt.Errorf("protocol not supported: %s", c.Protocol().Name)
			return false // end
		}

		return true // continue
	})

	return s, err
}

//nolint:gochecknoinits
func init() {
	// register protos
	for _, proto := range protos {
		if err := ma.AddProtocol(proto); err != nil {
			panic(err)
		}

	}
}
