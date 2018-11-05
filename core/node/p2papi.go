package node

import (
	"context"

	"berty.tech/core/entity"
	"berty.tech/core/errorcodes"

	"github.com/gogo/protobuf/proto"
	"github.com/pkg/errors"
	"google.golang.org/grpc"

	"encoding/base64"

	"crypto/x509"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/keypair"
)

// WithP2PGrpcServer registers the Node as a 'berty.p2p' protobuf server implementation
func WithP2PGrpcServer(gs *grpc.Server) NewNodeOption {
	return func(n *Node) {
		p2p.RegisterServiceServer(gs, n)
	}
}

func (n *Node) ID(ctx context.Context, _ *node.Void) (*p2p.Peer, error) {
	return n.networkDriver.ID(), nil
}

func (n *Node) Protocols(ctx context.Context, p *p2p.Peer) (*node.ProtocolsOutput, error) {
	pids, err := n.networkDriver.Protocols(p)
	if err != nil {
		return nil, err
	}

	return &node.ProtocolsOutput{
		Protocols: pids,
	}, nil
}

func (n *Node) HandleEnvelope(ctx context.Context, input *p2p.Envelope) (*p2p.Void, error) {
	n.asyncWaitGroup.Add(1)
	defer n.asyncWaitGroup.Done()
	return &p2p.Void{}, n.handleEnvelope(ctx, input)
}

func (n *Node) Ping(ctx context.Context, _ *p2p.Void) (*p2p.Void, error) {
	return &p2p.Void{}, nil
}

func (n *Node) handleEnvelope(ctx context.Context, input *p2p.Envelope) error {
	n.asyncWaitGroup.Add(1)
	defer n.asyncWaitGroup.Done()
	event, err := n.OpenEnvelope(input)

	if err == errorcodes.ErrorUntrustedEnvelope {
		// ignored error
	} else if err != nil {
		return errors.Wrap(err, "unable to open envelope")
	}

	return n.handleEvent(ctx, event)
}

func (n *Node) OpenEnvelope(envelope *p2p.Envelope) (*p2p.Event, error) {
	n.asyncWaitGroup.Add(1)
	defer n.asyncWaitGroup.Done()

	trusted := false
	device, err := envelope.GetDeviceForEnvelope(n.sql)

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
