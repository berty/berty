package node

import (
	"context"
	"crypto/x509"
	"encoding/base64"

	"github.com/gogo/protobuf/proto"
	opentracing "github.com/opentracing/opentracing-go"
	"github.com/pkg/errors"
	"google.golang.org/grpc"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/keypair"
	"berty.tech/core/entity"
	"berty.tech/core/errorcodes"
	"berty.tech/core/network"
	"berty.tech/core/pkg/tracing"
)

// WithP2PGrpcServer registers the Node as a 'berty.p2p' protobuf server implementation
func WithP2PGrpcServer(gs *grpc.Server) NewNodeOption {
	return func(n *Node) {
		p2p.RegisterServiceServer(gs, n)
	}
}

func (n *Node) ID(ctx context.Context, _ *node.Void) (*network.Peer, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx)
	defer span.Finish()

	return n.networkDriver.ID(ctx), nil
}

func (n *Node) Protocols(ctx context.Context, p *network.Peer) (*node.ProtocolsOutput, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, p)
	defer span.Finish()
	defer n.asyncWaitGroup(ctx)()

	pids, err := n.networkDriver.Protocols(ctx, p)
	if err != nil {
		return nil, err
	}

	return &node.ProtocolsOutput{
		Protocols: pids,
	}, nil
}

func (n *Node) HandleEnvelope(ctx context.Context, input *p2p.Envelope) (*p2p.Void, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	defer n.asyncWaitGroup(ctx)()

	return &p2p.Void{}, n.handleEnvelope(ctx, input)
}

func (n *Node) Ping(ctx context.Context, _ *p2p.Void) (*p2p.Void, error) {
	span, _ := tracing.EnterFunc(ctx)
	defer span.Finish()

	return &p2p.Void{}, nil
}

func (n *Node) handleEnvelope(ctx context.Context, input *p2p.Envelope) error {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, input)
	defer span.Finish()
	defer n.asyncWaitGroup(ctx)()

	event, err := n.OpenEnvelope(ctx, input)
	if err == errorcodes.ErrorUntrustedEnvelope {
		// ignored error
	} else if err != nil {
		return errors.Wrap(err, "unable to open envelope")
	}

	return n.handleEvent(ctx, event)
}

func (n *Node) OpenEnvelope(ctx context.Context, envelope *p2p.Envelope) (*p2p.Event, error) {
	var span opentracing.Span
	span, ctx = tracing.EnterFunc(ctx, envelope)
	defer span.Finish()
	defer n.asyncWaitGroup(ctx)()

	trusted := false
	sql := n.sql(ctx)
	device, err := envelope.GetDeviceForEnvelope(sql)

	if err == errorcodes.ErrorNoDeviceFoundForEnvelope {
		// No device found, lets try to use the pubkey if provided,
		// it can be useful when receiving a contact request for instance
		pubKeyBytes, err := base64.StdEncoding.DecodeString(envelope.Source)

		if err != nil {
			return nil, errors.New("unable to verify signature, unknown source device")
		}

		pubKey, err := x509.ParsePKIXPublicKey(pubKeyBytes)

		if err != nil {
			return nil, errors.New("unable to verify signature, unknown source device")
		}

		device = &entity.Device{
			ID: envelope.Source,
		}

		err = keypair.CheckSignature(envelope, pubKey)

		if err != nil {
			return nil, errors.New("unable to verify signature")
		}

	} else if err != nil {
		return nil, errors.Wrap(err, "unable to fetch candidate devices for envelope")
	} else {
		trusted = true
	}

	// TODO: Decode event
	event := p2p.Event{}
	if err := proto.Unmarshal(envelope.EncryptedEvent, &event); err != nil {
		return nil, err
	}

	if event.SenderID != device.ID {
		return nil, errors.New("event is signed by a known device but has not been sent by it")
	}

	if trusted == false {
		err = errorcodes.ErrorUntrustedEnvelope
	}

	return &event, err
}
