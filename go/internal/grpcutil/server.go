package grpcutil

import (
	"fmt"
	"net"
	"net/http"

	"github.com/improbable-eng/grpc-web/go/grpcweb"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr-net"
	"google.golang.org/grpc"
)

// BertyCustomPrefix is a multiformat custom prefix
const BertyCustomPrefix = 0xbe00

const (
	P_GRPC           = BertyCustomPrefix + 0x0002 //nolint:golint
	P_GRPC_WEB       = BertyCustomPrefix + 0x0004 //nolint:golint
	P_GRPC_WEBSOCKET = BertyCustomPrefix + 0x0008 //nolint:golint
	// P_GRPC_GATEWAY = BertyCustomPrefix + 0x0016
)

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
	//      Name:       "gw",
	//      Code:       P_GRPC_GATEWAY,
	//      VCode:      ma.CodeToVarint(P_GRPC_GATEWAY),
	//      Size:       16,
	//      Path:       false,
	//      Transcoder: ma.TranscoderPort,
	// },
}

type Listener interface {
	manet.Listener

	GRPCMultiaddr() ma.Multiaddr
}

type listener struct {
	manet.Listener

	grpcProtocol ma.Multiaddr
}

func Listen(maddr ma.Multiaddr) (Listener, error) {
	var (
		maListener manet.Listener
		component  *ma.Component
		err        error
	)

	component, _ = ma.NewComponent("grpc", "") // default to grpc
	ma.ForEach(maddr, func(c ma.Component) bool {
		switch c.Protocol().Code {
		case ma.P_IP4, ma.P_IP6, ma.P_TCP, ma.P_UNIX: // skip (supported protocol)
		case P_GRPC, P_GRPC_WEB, P_GRPC_WEBSOCKET:
			component = &c
		default:
			err = fmt.Errorf("protocol not supported: %s", c.Protocol().Name)
			return false // end
		}

		return true // continue
	})

	if err != nil {
		return nil, err
	}

	var grpcProtocol ma.Multiaddr
	if grpcProtocol, err = ma.NewMultiaddrBytes(component.Bytes()); err != nil {
		return nil, err
	}

	maddr = maddr.Decapsulate(grpcProtocol)
	if maListener, err = manet.Listen(maddr); err != nil {
		return nil, err
	}

	l := listener{maListener, grpcProtocol}
	return &l, nil
}

func (l *listener) GRPCMultiaddr() ma.Multiaddr {
	return l.Listener.Multiaddr().Encapsulate(l.grpcProtocol)
}

type Server struct {
	*grpc.Server
}

func (s *Server) Serve(l Listener) (err error) {
	var serve func(net.Listener) error
	ma.ForEach(l.GRPCMultiaddr(), func(c ma.Component) bool {
		switch c.Protocol().Code {
		case P_GRPC:
			serve = s.Server.Serve
		case P_GRPC_WEB, P_GRPC_WEBSOCKET:
			wgrpc := grpcweb.WrapServer(s.Server,
				grpcweb.WithOriginFunc(func(string) bool { return true }), // @FIXME: this is very insecure
				grpcweb.WithWebsockets(P_GRPC_WEBSOCKET == c.Protocol().Code),
			)

			serverWeb := http.Server{
				Handler: http.HandlerFunc(wgrpc.ServeHTTP),
			}

			serve = serverWeb.Serve

		// case P_GRPC_GATEWAY:
		//      if listener == nil {
		//              return false // end
		//      }

		// 	gwmux := grpcw.NewServeMux()
		// 	gatewayServer := http.Server{
		// 		Handler: gwmux,
		// 	}

		// 	dialOpts := []grpc.DialOption{grpc.WithInsecure()}
		// 	target := "127.0.0.1:" + c.Value()
		// 	err = bertyprotocol.RegisterAccountHandlerFromEndpoint(ctx, gwmux, target, dialOpts)

		// 	s.serve = gatewayServer.Serve
		default:
			return true // continue
		}

		return false // end
	})

	if serve == nil {
		return fmt.Errorf("unable to find a way to serve: %s", l.GRPCMultiaddr())
	}

	return serve(manet.NetListener(l))
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
