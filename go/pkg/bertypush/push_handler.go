package bertypush

import (
	"context"
	"fmt"
	"time"

	ds "github.com/ipfs/go-datastore"
	"go.uber.org/zap"
	"golang.org/x/crypto/curve25519"
	"golang.org/x/crypto/nacl/box"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
	"berty.tech/weshnet/pkg/cryptoutil"
	oosmtypes "berty.tech/weshnet/pkg/outofstoremessagetypes"
	"berty.tech/weshnet/pkg/protocoltypes"
)

const InMemoryDir = ":memory:"

type DBFetcher interface {
	GetCurrentPushServers() ([]*messengertypes.PushServer, error)
}

type pushHandler struct {
	logger        *zap.Logger
	pushSK        *[cryptoutil.KeySize]byte
	pushPK        *[cryptoutil.KeySize]byte
	accountCache  ds.Datastore
	serviceClient oosmtypes.OutOfStoreMessageServiceClient
	dbFetcher     DBFetcher
}

func (s *pushHandler) PushPK() *[cryptoutil.KeySize]byte {
	return s.pushPK
}

func (s *pushHandler) SetPushSK(key *[cryptoutil.KeySize]byte) {
	s.pushSK = key
	curve25519.ScalarBaseMult(s.pushPK, s.pushSK)
}

type PushHandler interface {
	PushReceive(ctx context.Context, payload []byte) (*protocoltypes.OutOfStoreReceive_Reply, error)
	PushPK() *[cryptoutil.KeySize]byte
}

var _ PushHandler = (*pushHandler)(nil)

type PushHandlerOpts struct {
	Logger *zap.Logger
}

func (opts *PushHandlerOpts) applyPushDefaults() error {
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	return nil
}

func NewPushHandler(serviceClient oosmtypes.OutOfStoreMessageServiceClient, dbFetcher DBFetcher, pushSK *[cryptoutil.KeySize]byte, opts *PushHandlerOpts) (PushHandler, error) {
	if serviceClient == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no service client specified"))
	}

	if dbFetcher == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no db fetcher specified"))
	}

	if pushSK == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no cross account push key specified"))
	}

	if err := opts.applyPushDefaults(); err != nil {
		return nil, err
	}

	h := &pushHandler{
		serviceClient: serviceClient,
		dbFetcher:     dbFetcher,
		logger:        opts.Logger,
		pushSK:        pushSK,
		pushPK:        &[cryptoutil.KeySize]byte{},
	}

	curve25519.ScalarBaseMult(h.pushPK, h.pushSK)

	return h, nil
}

func (s *pushHandler) PushReceive(ctx context.Context, payload []byte) (*protocoltypes.OutOfStoreReceive_Reply, error) {
	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	pushServerPK, err := s.getPushServerPubKey(ctx)
	if err != nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(err)
	}

	oosBytes, err := DecryptPushDataFromServer(payload, pushServerPK, s.pushSK)
	if err != nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(err)
	}

	oosMessageEnv := &protocoltypes.OutOfStoreMessageEnvelope{}
	if err := oosMessageEnv.Unmarshal(oosBytes); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	oosMessageEnvBytes, err := oosMessageEnv.Marshal()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	oosMessage, err := s.serviceClient.OutOfStoreReceive(ctx, &protocoltypes.OutOfStoreReceive_Request{Payload: oosMessageEnvBytes})
	if err != nil {
		return nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	return oosMessage, nil
}

func (s *pushHandler) getPushServerPubKey(ctx context.Context) (*[cryptoutil.KeySize]byte, error) {
	pushServers, err := s.dbFetcher.GetCurrentPushServers()
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("unable to get push servers: %w", err))
	}

	// currently, take only the first server public key
	server := pushServers[0]

	if l := len(server.Key); l != cryptoutil.KeySize {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid push pk size, expected %d bytes, got %d", cryptoutil.KeySize, l))
	}

	out := [cryptoutil.KeySize]byte{}
	copy(out[:], server.Key)

	return &out, nil
}

func DecryptPushDataFromServer(data []byte, serverPK, ownSK *[32]byte) ([]byte, error) {
	if serverPK == nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(fmt.Errorf("no push server public key provided"))
	}

	if ownSK == nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(fmt.Errorf("no push receiver secret key provided"))
	}

	pushEnv := &pushtypes.OutOfStoreExposedData{}
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
