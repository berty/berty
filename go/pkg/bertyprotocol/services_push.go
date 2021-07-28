package bertyprotocol

import (
	"context"
	crand "crypto/rand"
	"fmt"
	"sync"

	"go.uber.org/zap"
	"golang.org/x/crypto/curve25519"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

const (
	ServicePushID         = "psh"
	ServicePushPayloadKey = "p"
	ServicePushPayloadMax = 4096 // FIXME: find an appropriate value
)

type PushDispatcher interface {
	Dispatch(payload []byte, receiver *protocoltypes.PushServiceReceiver) error
	BundleID() string
	TokenType() protocoltypes.PushServiceTokenType
}

type pushService struct {
	logger              *zap.Logger
	privateKey          *[cryptoutil.KeySize]byte
	publicKey           *[cryptoutil.KeySize]byte
	dispatchers         map[string]PushDispatcher
	supportedTokenTypes []*protocoltypes.PushServiceSupportedTokenType
}

func pushDispatcherKey(tokenType protocoltypes.PushServiceTokenType, bundleID string) string {
	return fmt.Sprintf("%d-%s", tokenType, bundleID)
}

func (d *pushService) ServerInfo(_ context.Context, _ *protocoltypes.PushServiceServerInfo_Request) (*protocoltypes.PushServiceServerInfo_Reply, error) {
	return &protocoltypes.PushServiceServerInfo_Reply{
		PublicKey:           d.publicKey[:],
		SupportedTokenTypes: d.supportedTokenTypes,
	}, nil
}

func (d *pushService) Send(ctx context.Context, request *protocoltypes.PushServiceSend_Request) (*protocoltypes.PushServiceSend_Reply, error) {
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

	subCtx, cancel := context.WithCancel(ctx)
	errCh := make(chan error)

	for i, receiver := range request.Receivers {
		go func(i int, receiver *protocoltypes.PushServiceOpaqueReceiver) {
			defer wg.Done()

			if err := d.sendSingle(pushPayload, receiver); err != nil {
				d.logger.Warn("unable to send a single push", zap.Error(err), zap.Int("index", i))
				errCh <- err
				return
			}
		}(i, receiver)
	}

	go func() {
		wg.Wait()
		cancel()
	}()

	select {
	case <-subCtx.Done():
		return &protocoltypes.PushServiceSend_Reply{}, nil

	case err := <-errCh:
		cancel()
		return nil, err
	}
}

func (d *pushService) decodeOpaqueReceiver(receiver *protocoltypes.PushServiceOpaqueReceiver) (*protocoltypes.PushServiceReceiver, error) {
	receiverBytes, ok := box.OpenAnonymous(nil, receiver.OpaqueToken, d.publicKey, d.privateKey)
	if !ok {
		return nil, errcode.ErrCryptoDecrypt.Wrap(fmt.Errorf("unable to decrypt push identifier"))
	}

	pushReceiver := &protocoltypes.PushServiceReceiver{}
	if err := pushReceiver.Unmarshal(receiverBytes); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(fmt.Errorf("unable to unmarshal push identifier: %w", err))
	}

	if _, ok := d.dispatchers[pushDispatcherKey(pushReceiver.TokenType, pushReceiver.BundleID)]; !ok {
		return nil, errcode.ErrPushUnknownProvider.Wrap(fmt.Errorf("unsupported bundle id"))
	}

	return pushReceiver, nil
}

func (d *pushService) encryptPushPayloadForReceiver(rawPayload, recipientPublicKey []byte) ([]byte, error) {
	nonce, err := cryptoutil.GenerateNonce()
	if err != nil {
		return nil, errcode.ErrCryptoNonceGeneration.Wrap(err)
	}

	receiverKey, err := cryptoutil.KeySliceToArray(recipientPublicKey)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	boxed := box.Seal(nil, rawPayload, nonce, receiverKey, d.privateKey)

	payloadBytes, err := (&protocoltypes.PushExposedData{
		Nonce: nonce[:],
		Box:   boxed,
	}).Marshal()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return payloadBytes, nil
}

func (d *pushService) sendSingle(rawPayload []byte, receiver *protocoltypes.PushServiceOpaqueReceiver) error {
	pushReceiver, err := d.decodeOpaqueReceiver(receiver)
	if err != nil {
		return errcode.ErrCryptoDecrypt.Wrap(err)
	}

	dispatcher, ok := d.dispatchers[pushDispatcherKey(pushReceiver.TokenType, pushReceiver.BundleID)]
	if !ok {
		return errcode.ErrPushUnknownProvider.Wrap(fmt.Errorf("unsupported %s", pushDispatcherKey(pushReceiver.TokenType, pushReceiver.BundleID)))
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

	service.dispatchers, service.supportedTokenTypes, err = pushServiceGenerateDispatchers(dispatchers)
	if err != nil {
		return nil, err
	}

	logger.Info("push server dispatchers:")
	for k := range service.dispatchers {
		logger.Info(fmt.Sprintf(" - %s", k))
	}

	return service, nil
}

func pushServiceGenerateDispatchers(dispatchers []PushDispatcher) (map[string]PushDispatcher, []*protocoltypes.PushServiceSupportedTokenType, error) {
	serviceDispatchers := make(map[string]PushDispatcher, len(dispatchers))
	serviceSupportedTypes := make([]*protocoltypes.PushServiceSupportedTokenType, 0, len(dispatchers))

	for _, dispatcher := range dispatchers {
		bundleID := dispatcher.BundleID()
		tokenType := dispatcher.TokenType()

		if _, ok := serviceDispatchers[pushDispatcherKey(tokenType, bundleID)]; ok {
			return nil, nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("pushservice: %s app %s registered twice", tokenType.String(), bundleID))
		}

		serviceDispatchers[pushDispatcherKey(tokenType, bundleID)] = dispatcher

		serviceSupportedTypes = append(serviceSupportedTypes, &protocoltypes.PushServiceSupportedTokenType{
			AppBundleID: bundleID,
			TokenType:   tokenType,
		})
	}

	return serviceDispatchers, serviceSupportedTypes, nil
}

func pushSealTokenForServer(receiver *protocoltypes.PushServiceReceiver, server *protocoltypes.PushServer) (*protocoltypes.PushMemberTokenUpdate, error) {
	if server == nil || len(server.ServerKey) != cryptoutil.KeySize {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("expected a server key of %d bytes", cryptoutil.KeySize))
	}

	if receiver == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("expected the receiver value to be defined"))
	}

	serverKey := [cryptoutil.KeySize]byte{}
	for i, c := range server.ServerKey {
		serverKey[i] = c
	}

	opaqueToken, err := receiver.Marshal()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	opaqueToken, err = box.SealAnonymous(nil, opaqueToken, &serverKey, crand.Reader)
	if err != nil {
		return nil, err
	}

	return &protocoltypes.PushMemberTokenUpdate{
		Token:  opaqueToken,
		Server: server,
	}, nil
}

func decryptPushDataFromServer(data []byte, serverPK, ownSK *[32]byte) ([]byte, error) {
	if serverPK == nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(fmt.Errorf("no push server public key provided"))
	}

	if ownSK == nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(fmt.Errorf("no push receiver secret key provided"))
	}

	pushEnv := &protocoltypes.PushExposedData{}
	if err := pushEnv.Unmarshal(data); err != nil {
		return nil, errcode.ErrPushInvalidPayload.Wrap(err)
	}

	nonce, err := cryptoutil.NonceSliceToArray(pushEnv.Nonce)
	if err != nil {
		return nil, errcode.ErrPushInvalidPayload.Wrap(err)
	}

	msgBytes, ok := box.Open(nil, pushEnv.Box, nonce, serverPK, ownSK)
	if !ok {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(fmt.Errorf("box.Open failed"))
	}

	return msgBytes, nil
}

var _ PushService = (*pushService)(nil)

type PushService interface {
	PushServiceServer

	Close() error
}
