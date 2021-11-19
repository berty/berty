package bertypushrelay

import (
	"context"
	"encoding/base64"
	"fmt"
	"sync"
	"sync/atomic"

	"go.uber.org/zap"
	"golang.org/x/crypto/curve25519"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

const ServicePushPayloadMax = 4096 // FIXME: find an appropriate value

type PushDispatcher interface {
	Dispatch(payload []byte, receiver *protocoltypes.PushServiceReceiver) error
	BundleID() string
	TokenType() pushtypes.PushServiceTokenType
}

type pushService struct {
	logger              *zap.Logger
	privateKey          *[cryptoutil.KeySize]byte
	publicKey           *[cryptoutil.KeySize]byte
	dispatchers         map[string]PushDispatcher
	supportedTokenTypes []*pushtypes.PushServiceSupportedTokenType
}

func PushDispatcherKey(tokenType pushtypes.PushServiceTokenType, bundleID string) string {
	return fmt.Sprintf("%d-%s", tokenType, bundleID)
}

func (d *pushService) ServerInfo(_ context.Context, _ *pushtypes.PushServiceServerInfo_Request) (*pushtypes.PushServiceServerInfo_Reply, error) {
	return &pushtypes.PushServiceServerInfo_Reply{
		PublicKey:           d.publicKey[:],
		SupportedTokenTypes: d.supportedTokenTypes,
	}, nil
}

func (d *pushService) Send(ctx context.Context, request *pushtypes.PushServiceSend_Request) (*pushtypes.PushServiceSend_Reply, error) {
	if len(request.Receivers) == 0 {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no receivers supplied"))
	}

	if len(request.Envelope.Nonce) != cryptoutil.NonceSize {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid nonce size"))
	}

	if len(request.Envelope.Box) > ServicePushPayloadMax {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("payload too large"))
	}

	pushPayload, err := request.Envelope.Marshal()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	wg := sync.WaitGroup{}
	wg.Add(len(request.Receivers))

	errCount := int32(0)
	for i, receiver := range request.Receivers {
		go func(i int, receiver *pushtypes.PushServiceOpaqueReceiver) {
			if err := d.sendSingle(pushPayload, receiver); err != nil {
				d.logger.Warn("unable to send a push", zap.Int("index", i), zap.Error(err))
				atomic.AddInt32(&errCount, 1)
			} else {
				secretToken := fmt.Sprintf("%.10s...", base64.StdEncoding.EncodeToString(receiver.OpaqueToken))
				d.logger.Debug("successfully send push notification", zap.Int("index", i), logutil.PrivateString("target token", secretToken), zap.Error(err))
			}

			wg.Done()
		}(i, receiver)
	}

	wg.Wait()

	if errCount > 0 {
		return nil, fmt.Errorf("unable to send %d/%d push to receivers", errCount, len(request.Receivers))
	}

	return &pushtypes.PushServiceSend_Reply{}, nil
}

func (d *pushService) decodeOpaqueReceiver(receiver *pushtypes.PushServiceOpaqueReceiver) (*protocoltypes.PushServiceReceiver, error) {
	return InternalDecodeOpaqueReceiver(d.publicKey, d.privateKey, d.dispatchers, receiver)
}

func (d *pushService) encryptPushPayloadForReceiver(rawPayload, recipientPublicKey []byte) ([]byte, error) {
	return InternalEncryptPushPayloadForReceiver(d.privateKey, rawPayload, recipientPublicKey)
}

func InternalDecodeOpaqueReceiver(publicKey *[cryptoutil.KeySize]byte, privateKey *[cryptoutil.KeySize]byte, dispatchers map[string]PushDispatcher, receiver *pushtypes.PushServiceOpaqueReceiver) (*protocoltypes.PushServiceReceiver, error) {
	receiverBytes, ok := box.OpenAnonymous(nil, receiver.OpaqueToken, publicKey, privateKey)
	if !ok {
		return nil, errcode.ErrCryptoDecrypt.Wrap(fmt.Errorf("unable to decrypt push identifier"))
	}

	pushReceiver := &protocoltypes.PushServiceReceiver{}
	if err := pushReceiver.Unmarshal(receiverBytes); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(fmt.Errorf("unable to unmarshal push identifier: %w", err))
	}

	if _, ok := dispatchers[PushDispatcherKey(pushReceiver.TokenType, pushReceiver.BundleID)]; !ok {
		return nil, errcode.ErrPushUnknownProvider.Wrap(fmt.Errorf("unsupported bundle id"))
	}

	return pushReceiver, nil
}

func InternalEncryptPushPayloadForReceiver(privateKey *[cryptoutil.KeySize]byte, rawPayload, recipientPublicKey []byte) ([]byte, error) {
	nonce, err := cryptoutil.GenerateNonce()
	if err != nil {
		return nil, errcode.ErrCryptoNonceGeneration.Wrap(err)
	}

	receiverKey, err := cryptoutil.KeySliceToArray(recipientPublicKey)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	boxed := box.Seal(nil, rawPayload, nonce, receiverKey, privateKey)

	payloadBytes, err := (&pushtypes.PushExposedData{
		Nonce: nonce[:],
		Box:   boxed,
	}).Marshal()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return payloadBytes, nil
}

func (d *pushService) sendSingle(rawPayload []byte, receiver *pushtypes.PushServiceOpaqueReceiver) error {
	pushReceiver, err := d.decodeOpaqueReceiver(receiver)
	if err != nil {
		return errcode.ErrCryptoDecrypt.Wrap(err)
	}

	dispatcher, ok := d.dispatchers[PushDispatcherKey(pushReceiver.TokenType, pushReceiver.BundleID)]
	if !ok {
		return errcode.ErrPushUnknownProvider.Wrap(fmt.Errorf("unsupported %s", PushDispatcherKey(pushReceiver.TokenType, pushReceiver.BundleID)))
	}

	payloadBytes, err := d.encryptPushPayloadForReceiver(rawPayload, pushReceiver.RecipientPublicKey)
	if err != nil {
		return errcode.ErrCryptoEncrypt.Wrap(err)
	}

	if err := dispatcher.Dispatch(payloadBytes, pushReceiver); err != nil {
		return errcode.ErrPushProvider.Wrap(err)
	}

	return nil
}

func (d *pushService) Close() error {
	return nil
}

func NewPushService(privateKey *[cryptoutil.KeySize]byte, dispatchers []PushDispatcher, logger *zap.Logger) (PushService, error) {
	if logger == nil {
		logger = zap.NewNop()
	}

	logger = logger.Named("push")

	return newPushService(privateKey, dispatchers, logger)
}

func newPushService(privateKey *[cryptoutil.KeySize]byte, dispatchers []PushDispatcher, logger *zap.Logger) (*pushService, error) {
	var err error

	if privateKey == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no private key provided"))
	}

	if len(dispatchers) == 0 {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no push dispatchers provided"))
	}

	if logger == nil {
		logger = zap.NewNop()
	}

	service := &pushService{
		logger:      logger,
		privateKey:  privateKey,
		publicKey:   &[cryptoutil.KeySize]byte{},
		dispatchers: map[string]PushDispatcher{},
	}

	curve25519.ScalarBaseMult(service.publicKey, privateKey)

	service.dispatchers, service.supportedTokenTypes, err = PushServiceGenerateDispatchers(dispatchers)
	if err != nil {
		return nil, err
	}

	logger.Info("push server dispatchers:")
	for k := range service.dispatchers {
		logger.Info(fmt.Sprintf(" - %s", k))
	}

	return service, nil
}

func PushServiceGenerateDispatchers(dispatchers []PushDispatcher) (map[string]PushDispatcher, []*pushtypes.PushServiceSupportedTokenType, error) {
	serviceDispatchers := make(map[string]PushDispatcher, len(dispatchers))
	serviceSupportedTypes := make([]*pushtypes.PushServiceSupportedTokenType, 0, len(dispatchers))

	for _, dispatcher := range dispatchers {
		bundleID := dispatcher.BundleID()
		tokenType := dispatcher.TokenType()

		if _, ok := serviceDispatchers[PushDispatcherKey(tokenType, bundleID)]; ok {
			return nil, nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("pushservice: %s app %s registered twice", tokenType.String(), bundleID))
		}

		serviceDispatchers[PushDispatcherKey(tokenType, bundleID)] = dispatcher

		serviceSupportedTypes = append(serviceSupportedTypes, &pushtypes.PushServiceSupportedTokenType{
			AppBundleID: bundleID,
			TokenType:   tokenType,
		})
	}

	return serviceDispatchers, serviceSupportedTypes, nil
}

var _ PushService = (*pushService)(nil)

type PushService interface {
	pushtypes.PushServiceServer

	Close() error
}
