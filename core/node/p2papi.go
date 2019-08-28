package node

import (
	"berty.tech/core/chunk"
	"context"
	"crypto/x509"
	"encoding/base64"
	"fmt"
	"go.uber.org/zap"
	"time"

	"github.com/gogo/protobuf/proto"
	"github.com/pkg/errors"
	"google.golang.org/grpc"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
	"berty.tech/core/crypto/keypair"
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"berty.tech/core/pkg/tracing"
	"berty.tech/core/sql"
	bsql "berty.tech/core/sql"
	network_metric "berty.tech/network/metric"
	push "berty.tech/zero-push/proto/push"
	pushService "berty.tech/zero-push/proto/service"
)

const pushServerAddr = "dns:///push.berty.tech:1337"

// WithentityGrpcServer registers the Node as a 'berty.entity' protobuf server implementation
func WithP2PGrpcServer(gs *grpc.Server) NewNodeOption {
	return func(n *Node) {
		p2p.RegisterServiceServer(gs, n)
	}
}

func (n *Node) ID(ctx context.Context, _ *node.Void) (*network_metric.Peer, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	ctx = tracer.Context()

	return n.networkDriver.ID(), nil
}

func (n *Node) Protocols(ctx context.Context, p *network_metric.Peer) (*node.ProtocolsOutput, error) {
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

func (n *Node) HandleEnvelope(ctx context.Context, input *entity.Envelope) (*entity.Void, error) {
	tracer := tracing.EnterFunc(ctx, input)
	defer tracer.Finish()
	ctx = tracer.Context()

	defer n.asyncWaitGroup(ctx)()

	return &entity.Void{}, n.handleEnvelope(ctx, input)
}

func (n *Node) Ping(ctx context.Context, _ *entity.Void) (*entity.Void, error) {
	tracer := tracing.EnterFunc(ctx)
	defer tracer.Finish()
	// ctx = tracer.Context()

	return &entity.Void{}, nil
}

func (n *Node) handleEnvelope(ctx context.Context, input *entity.Envelope) error {
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

func (n *Node) OpenEnvelope(ctx context.Context, envelope *entity.Envelope) (*entity.Event, error) {
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
		err := n.sql(ctx).First(contact, &entity.Contact{ID: device.ContactID}).Error
		if err != nil {
			logger().Error(err.Error())
			return nil, bsql.GenericError(err)
		}
		trusted = contact.IsTrusted()
	}

	// TODO: Decode event
	event := entity.Event{}
	if err := proto.Unmarshal(envelope.EncryptedEvent, &event); err != nil {
		return nil, err
	}

	if event.SourceDeviceID != device.ID {
		return nil, errors.New("event is signed by a known device but has not been sent by it")
	}

	if trusted == false {
		err = errorcodes.ErrEnvelopeUntrusted.New()
	}

	return &event, err
}

func (n *Node) pushEvent(ctx context.Context, event *entity.Event, envelope *entity.Envelope) error {
	// tracer := tracing.EnterFunc(ctx, event, envelope)
	// defer tracer.Finish()
	// ctx = tracer.Context()

	pushIdentifiers, err := n.getPushDestinationsForEvent(ctx, event)
	if err != nil {
		return errorcodes.ErrPush.Wrap(err)
	}

	if len(pushIdentifiers) == 0 {
		return nil
	}

	logger().Info(fmt.Sprintf("pushing event to %d destinations", len(pushIdentifiers)))

	marshaledEnvelope, err := envelope.Marshal()
	if err != nil {
		return errorcodes.ErrSerialization.Wrap(err)
	}

	chunks, err := chunk.Split(marshaledEnvelope, 2000)

	if err != nil {
		return errorcodes.ErrPushBroadcast.Wrap(err)
	}

	conn, err := grpc.Dial(pushServerAddr, grpc.WithInsecure())
	if err != nil {
		return errorcodes.ErrPushBroadcast.Wrap(err)
	}

	pushClient := pushService.NewPushServiceClient(conn)

	for _, pushIdentifier := range pushIdentifiers {
		var pushMessages []*push.PushData

		logger().Info(fmt.Sprintf("connecting to push notification server on %s", pushServerAddr))

		for _, c := range chunks {
			envelopeData, err := c.Marshal()
			if err != nil {
				logger().Error("unable to marshal envelope")
				break
			}

			pushData := &push.PushData{
				Priority:       event.PushPriority(),
				PushIdentifier: pushIdentifier.PushInfo,
				Envelope:       envelopeData,
			}

			pushMessages = append(pushMessages, pushData)
		}

		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		_, err = pushClient.PushTo(ctx, &push.PushToInput{
			PushData: pushMessages,
		})

		cancel()

		if err != nil {

			logger().Error("error while pushing data to device", zap.Error(err))
			continue
		}
	}

	_ = conn.Close()

	return nil
}

func (n *Node) queuePushEvent(ctx context.Context, event *entity.Event, envelope *entity.Envelope) {
	// FIXME: this function should not take an Event in the arguments, it should be able to work only with envelopes
	go func() {
		tctx, cancel := context.WithTimeout(ctx, time.Second*10)
		defer cancel()

		if err := n.pushEvent(tctx, event, envelope); err != nil {
			n.LogBackgroundError(ctx, errors.Wrap(err, "failed queue push event"))
		}
	}()
}

func (n *Node) getPushDestinationsForEvent(ctx context.Context, event *entity.Event) ([]*entity.DevicePushIdentifier, error) {
	db := n.sql(ctx)
	var subqueryContactIDs interface{}
	deviceIDs := []string{}
	pushIdentifiers := []*entity.DevicePushIdentifier{}

	switch event.TargetType {
	case entity.Event_ToSpecificConversation:
		subqueryContactIDs = db.
			Model(&entity.ConversationMember{}).
			Select("contact_id").
			Where(&entity.ConversationMember{ConversationID: event.ToConversationID()}).
			QueryExpr()
	case entity.Event_ToSpecificContact:
		subqueryContactIDs = []string{event.ToContactID()}
	case entity.Event_ToSpecificDevice:
		return nil, fmt.Errorf("getPushDestinationsForEvent: specific device not implemented")
	default:
		return nil, fmt.Errorf("getPushDestinationsForEvent: unhandled target type")
	}

	if err := db.
		Model(&entity.Device{}).
		Where("contact_id IN (?)", subqueryContactIDs).
		Pluck("id", &deviceIDs).Error; err != nil {
		return nil, sql.GenericError(err)
	}

	if err := db.
		Model(&entity.DevicePushIdentifier{}).
		Where("device_id IN (?)", deviceIDs).
		Find(&pushIdentifiers).
		Error; err != nil {
		return nil, sql.GenericError(err)
	}

	return pushIdentifiers, nil
}
