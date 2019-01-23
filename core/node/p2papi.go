package node

import (
	"context"
	"crypto/x509"
	"encoding/base64"
	"time"

	"github.com/gogo/protobuf/proto"
	"github.com/pkg/errors"
	"google.golang.org/grpc"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/keypair"
	"berty.tech/core/entity"
	"berty.tech/core/network"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
)

// WithP2PGrpcServer registers the Node as a 'berty.p2p' protobuf server implementation
func WithP2PGrpcServer(gs *grpc.Server) NewNodeOption {
	return func(n *Node) {
		p2p.RegisterServiceServer(gs, n)
	}
}

func (n *Node) ID(ctx context.Context, _ *node.Void) (*network.Peer, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	return n.networkDriver.ID(ctx), nil
}

func (n *Node) Protocols(ctx context.Context, p *network.Peer) (*node.ProtocolsOutput, error) {
	tracer := tracing.EnterFunc(ctx, p)
	defer tracer.Finish()
	ctx = tracer.Context()

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
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.asyncWaitGroup(ctx)()

	return &p2p.Void{}, n.handleEnvelope(ctx, input)
}

func (n *Node) Ping(ctx context.Context, _ *p2p.Void) (*p2p.Void, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	return &p2p.Void{}, nil
}

func (n *Node) handleEnvelope(ctx context.Context, input *p2p.Envelope) error {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.asyncWaitGroup(ctx)()

	event, err := n.OpenEnvelope(ctx, input)
	if errorcodes.ErrEnvelopeUntrusted.Is(err) {
		// ignored error
	} else if err != nil {
		return errors.Wrap(err, "unable to open envelope")
	}

	return n.handleEvent(ctx, event)
}

func (n *Node) OpenEnvelope(ctx context.Context, envelope *p2p.Envelope) (*p2p.Event, error) {
	tracer := tracing.EnterFunc(ctx, envelope)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.asyncWaitGroup(ctx)()

	trusted := false
	sql := n.sql(ctx)
	device, err := envelope.GetDeviceForEnvelope(sql)

	if errorcodes.ErrEnvelopeNoDeviceFound.Is(err) {
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
		contact := &entity.Contact{}
		if err := n.sql(ctx).First(contact, &entity.Contact{ID: device.ContactID}).Error; err != nil {
			return nil, errorcodes.ErrDbNothingFound.Wrap(err)
		}

		trusted = contact.IsTrusted()
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
		err = errorcodes.ErrEnvelopeUntrusted.New()
	}

	return &event, err
}

func (n *Node) pushEvent(ctx context.Context, event *p2p.Event, envelope *p2p.Envelope) error {
	pushIdentifiers, err := n.getPushDestinationsForEvent(ctx, event)
	if err != nil {
		return errorcodes.ErrPushBroadcastIdentifier.Wrap(err)
	}

	marshaledEnvelope, err := envelope.Marshal()
	if err != nil {
		return errorcodes.ErrSerialization.Wrap(err)
	}

	for _, pushIdentifier := range pushIdentifiers {
		wrappedEvent := n.NewContactEvent(ctx, &entity.Contact{
			ID: pushIdentifier.RelayPubkey,
		}, p2p.Kind_DevicePushTo)

		if err := wrappedEvent.SetDevicePushToAttrs(&p2p.DevicePushToAttrs{
			Priority:       event.PushPriority(),
			PushIdentifier: pushIdentifier.PushInfo,
			Envelope:       marshaledEnvelope,
		}); err != nil {
			return errorcodes.ErrPushBroadcast.Wrap(err)
		}

		n.outgoingEvents <- wrappedEvent
	}

	return nil
}

func (n *Node) queuePushEvent(ctx context.Context, event *p2p.Event, envelope *p2p.Envelope) {
	go func() {
		tctx, cancel := context.WithTimeout(ctx, time.Second*10)
		defer cancel()

		if err := n.pushEvent(tctx, event, envelope); err != nil {
			n.LogBackgroundError(ctx, errors.Wrap(err, "failed queue push event"))
		}
	}()
}

func (n *Node) getPushDestinationsForEvent(ctx context.Context, event *p2p.Event) ([]*entity.DevicePushIdentifier, error) {
	db := n.sql(ctx)
	var subqueryContactIDs interface{}
	pushIdentifiers := []*entity.DevicePushIdentifier{}

	if event.ConversationID != "" {
		subqueryContactIDs = db.
			Model(&entity.ConversationMember{}).
			Select("contact_id").
			Where(&entity.ConversationMember{ConversationID: event.ConversationID}).
			QueryExpr()
	} else if event.ReceiverID != "" {
		subqueryContactIDs = []string{event.ReceiverID}
	}

	if err := db.
		Model(&entity.DevicePushIdentifier{}).
		Find(&pushIdentifiers).
		Where("device_id IN (?)", db.
			Model(&entity.Device{}).
			Select("device_id").
			Where("contact_id IN (?)", subqueryContactIDs).
			SubQuery()).Error; err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	if len(pushIdentifiers) == 0 {
		return nil, errorcodes.ErrDbNothingFound.New()
	}

	return pushIdentifiers, nil
}
