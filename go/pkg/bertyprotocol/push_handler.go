package bertyprotocol

import (
	"context"
	"fmt"
	"time"

	"github.com/ipfs/go-datastore"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
	"golang.org/x/crypto/curve25519"
	"golang.org/x/crypto/nacl/secretbox"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type pushHandler struct {
	logger          *zap.Logger
	pushSK          *[cryptoutil.KeySize]byte
	pushPK          *[cryptoutil.KeySize]byte
	groupDatastore  GroupDatastoreReadOnly
	messageKeystore *messageKeystore
	accountCache    datastore.Datastore
}

func (s *pushHandler) UpdatePushServer(server *protocoltypes.PushServer) error {
	cachePayload, err := server.Marshal()
	if err != nil {
		return errcode.ErrSerialization.Wrap(fmt.Errorf("unable to marshal PushServer: %w", err))
	}

	err = s.accountCache.Put(datastore.NewKey(AccountCacheDatastorePushServerPK), cachePayload)
	if err != nil {
		return errcode.ErrInternal.Wrap(fmt.Errorf("unable to cache push server info: %s", err))
	}

	return nil
}

func (s *pushHandler) PushPK() *[cryptoutil.KeySize]byte {
	return s.pushPK
}

func (s *pushHandler) SetPushSK(key *[cryptoutil.KeySize]byte) {
	s.pushSK = key
	curve25519.ScalarBaseMult(s.pushPK, s.pushSK)
}

type PushHandler interface {
	PushReceive(payload []byte) (*protocoltypes.PushReceive_Reply, error)
	PushPK() *[cryptoutil.KeySize]byte
	UpdatePushServer(server *protocoltypes.PushServer) error
}

var _ PushHandler = (*pushHandler)(nil)

func NewPushHandler(opts *Opts) (PushHandler, error) {
	if opts.PushKey == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no cross account push key specified"))
	}

	if err := opts.applyPushDefaults(); err != nil {
		return nil, err
	}

	h := &pushHandler{
		logger:          opts.Logger,
		pushSK:          opts.PushKey,
		pushPK:          &[cryptoutil.KeySize]byte{},
		groupDatastore:  opts.GroupDatastore,
		messageKeystore: opts.MessageKeystore,
		accountCache:    opts.AccountCache,
	}

	curve25519.ScalarBaseMult(h.pushPK, h.pushSK)

	return h, nil
}

func (s *pushHandler) PushReceive(payload []byte) (*protocoltypes.PushReceive_Reply, error) {
	pushServerPK, err := s.getServerPushPubKey()
	if err != nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(err)
	}

	oosBytes, err := decryptPushDataFromServer(payload, pushServerPK, s.pushSK)
	if err != nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(err)
	}

	oosMessageEnv := &protocoltypes.OutOfStoreMessageEnvelope{}
	if err := oosMessageEnv.Unmarshal(oosBytes); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	gPK, err := crypto.UnmarshalEd25519PublicKey(oosMessageEnv.GroupPublicKey)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	oosMessage, err := decryptOutOfStoreMessageEnv(s.groupDatastore, oosMessageEnv, gPK)
	if err != nil {
		return nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	clear, err := s.messageKeystore.OpenOutOfStoreMessage(oosMessage, oosMessageEnv.GroupPublicKey)
	if err != nil {
		return nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	return &protocoltypes.PushReceive_Reply{
		Message:        oosMessage,
		Cleartext:      clear,
		GroupPublicKey: oosMessageEnv.GroupPublicKey,
	}, nil
}

func decryptOutOfStoreMessageEnv(gd GroupDatastoreReadOnly, env *protocoltypes.OutOfStoreMessageEnvelope, groupPK crypto.PubKey) (*protocoltypes.OutOfStoreMessage, error) {
	nonce, err := cryptoutil.NonceSliceToArray(env.Nonce)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	g, err := gd.Get(groupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("unable to find group, err: %w", err))
	}

	secret := g.GetSharedSecret()

	data, ok := secretbox.Open(nil, env.Box, nonce, secret)
	if !ok {
		return nil, errcode.ErrCryptoDecrypt
	}

	outOfStoreMessage := &protocoltypes.OutOfStoreMessage{}
	if err := outOfStoreMessage.Unmarshal(data); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	return outOfStoreMessage, nil
}

func (s *pushHandler) getServerPushPubKey() (*[cryptoutil.KeySize]byte, error) {
	serverBytes, err := s.accountCache.Get(datastore.NewKey(AccountCacheDatastorePushServerPK))
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("missing push server data: %w", err))
	}

	if len(serverBytes) == 0 {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("got an empty push server data"))
	}

	server := &protocoltypes.PushServer{}
	if err := server.Unmarshal(serverBytes); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(fmt.Errorf("unable to deserialize push server data: %w", err))
	}

	if l := len(server.ServerKey); l != cryptoutil.KeySize {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid push pk size, expected %d bytes, got %d", cryptoutil.KeySize, l))
	}

	out := [cryptoutil.KeySize]byte{}
	for i, c := range server.ServerKey {
		out[i] = c
	}

	return &out, nil
}

type pushHandlerClient struct {
	serviceClient protocoltypes.ProtocolServiceClient
	ctx           context.Context
}

func (p *pushHandlerClient) PushReceive(payload []byte) (*protocoltypes.PushReceive_Reply, error) {
	ctx, cancel := context.WithTimeout(p.ctx, time.Second*5)
	defer cancel()

	return p.serviceClient.PushReceive(ctx, &protocoltypes.PushReceive_Request{Payload: payload})
}

func (p *pushHandlerClient) PushPK() *[32]byte {
	// TODO: not supported in client mode
	return nil
}

func (p *pushHandlerClient) SetPushSK(i *[32]byte) {
	// TODO: not supported in client mode
}

func (p *pushHandlerClient) UpdatePushServer(server *protocoltypes.PushServer) error {
	ctx, cancel := context.WithTimeout(p.ctx, time.Second*5)
	defer cancel()

	_, err := p.serviceClient.PushSetServer(ctx, &protocoltypes.PushSetServer_Request{Server: server})

	return err
}

func NewPushHandlerViaProtocol(ctx context.Context, serviceClient protocoltypes.ProtocolServiceClient) PushHandler {
	return &pushHandlerClient{
		serviceClient: serviceClient,
		ctx:           ctx,
	}
}
