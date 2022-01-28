package bertypush

import (
	"context"
	"fmt"
	"time"

	ds "github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
	"golang.org/x/crypto/curve25519"
	"golang.org/x/crypto/nacl/box"
	"golang.org/x/crypto/nacl/secretbox"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/datastoreutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

type pushHandler struct {
	logger          *zap.Logger
	pushSK          *[cryptoutil.KeySize]byte
	pushPK          *[cryptoutil.KeySize]byte
	groupDatastore  cryptoutil.GroupDatastoreReadOnly
	messageKeystore *cryptoutil.MessageKeystore
	accountCache    ds.Datastore
}

func (s *pushHandler) UpdatePushServer(ctx context.Context, server *protocoltypes.PushServer) error {
	cachePayload, err := server.Marshal()
	if err != nil {
		return errcode.ErrSerialization.Wrap(fmt.Errorf("unable to marshal PushServer: %w", err))
	}

	err = s.accountCache.Put(ctx, ds.NewKey(datastoreutil.AccountCacheDatastorePushServerPK), cachePayload)
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
	PushReceive(ctx context.Context, payload []byte) (*protocoltypes.PushReceive_Reply, error)
	PushPK() *[cryptoutil.KeySize]byte
	UpdatePushServer(ctx context.Context, server *protocoltypes.PushServer) error
}

var _ PushHandler = (*pushHandler)(nil)

type PushHandlerOpts struct {
	Logger          *zap.Logger
	PushKey         *[cryptoutil.KeySize]byte
	DatastoreDir    string
	RootDatastore   ds.Datastore
	GroupDatastore  *cryptoutil.GroupDatastore
	MessageKeystore *cryptoutil.MessageKeystore
	AccountCache    ds.Datastore
}

func (opts *PushHandlerOpts) applyPushDefaults() error {
	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	if opts.RootDatastore == nil {
		if opts.DatastoreDir == "" || opts.DatastoreDir == accountutils.InMemoryDir {
			opts.RootDatastore = ds_sync.MutexWrap(ds.NewMapDatastore())
		} else {
			opts.RootDatastore = nil
		}
	}

	if opts.GroupDatastore == nil {
		var err error
		opts.GroupDatastore, err = cryptoutil.NewGroupDatastore(opts.RootDatastore)
		if err != nil {
			return err
		}
	}

	if opts.AccountCache == nil {
		opts.AccountCache = datastoreutil.NewNamespacedDatastore(opts.RootDatastore, ds.NewKey(datastoreutil.NamespaceAccountCacheDatastore))
	}

	if opts.MessageKeystore == nil {
		opts.MessageKeystore = cryptoutil.NewMessageKeystore(datastoreutil.NewNamespacedDatastore(opts.RootDatastore, ds.NewKey(datastoreutil.NamespaceMessageKeystore)))
	}

	return nil
}

func NewPushHandler(opts *PushHandlerOpts) (PushHandler, error) {
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

func (s *pushHandler) PushReceive(ctx context.Context, payload []byte) (*protocoltypes.PushReceive_Reply, error) {
	pushServerPK, err := s.getServerPushPubKey(ctx)
	if err != nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(err)
	}

	oosBytes, err := DecryptPushDataFromServer(payload, pushServerPK, s.pushSK)
	if err != nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(err)
	}

	oosMessageEnv := &pushtypes.OutOfStoreMessageEnvelope{}
	if err := oosMessageEnv.Unmarshal(oosBytes); err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	gPKBytes, err := s.messageKeystore.GetByPushGroupReference(ctx, oosMessageEnv.GroupReference)
	if err != nil {
		return nil, errcode.ErrNotFound.Wrap(err)
	}

	gPK, err := crypto.UnmarshalEd25519PublicKey(gPKBytes)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	oosMessage, err := DecryptOutOfStoreMessageEnv(ctx, s.groupDatastore, oosMessageEnv, gPK)
	if err != nil {
		return nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	clear, newlyDecrypted, err := s.messageKeystore.OpenOutOfStoreMessage(ctx, oosMessage, gPKBytes)
	if err != nil {
		return nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	g, err := s.groupDatastore.Get(ctx, gPK)
	if err == nil {
		if err := s.messageKeystore.UpdatePushGroupReferences(ctx, oosMessage.DevicePK, oosMessage.Counter, g); err != nil {
			s.logger.Error("unable to update push group references", zap.Error(err))
		}
	}

	return &protocoltypes.PushReceive_Reply{
		Message:         oosMessage,
		Cleartext:       clear,
		GroupPublicKey:  gPKBytes,
		AlreadyReceived: !newlyDecrypted,
	}, nil
}

func DecryptOutOfStoreMessageEnv(ctx context.Context, gd cryptoutil.GroupDatastoreReadOnly, env *pushtypes.OutOfStoreMessageEnvelope, groupPK crypto.PubKey) (*protocoltypes.OutOfStoreMessage, error) {
	nonce, err := cryptoutil.NonceSliceToArray(env.Nonce)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	g, err := gd.Get(ctx, groupPK)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("unable to find group, err: %w", err))
	}

	secret := cryptoutil.GetSharedSecret(g)

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

func (s *pushHandler) getServerPushPubKey(ctx context.Context) (*[cryptoutil.KeySize]byte, error) {
	serverBytes, err := s.accountCache.Get(ctx, ds.NewKey(datastoreutil.AccountCacheDatastorePushServerPK))
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
}

func (p *pushHandlerClient) PushReceive(ctx context.Context, payload []byte) (*protocoltypes.PushReceive_Reply, error) {
	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
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

func (p *pushHandlerClient) UpdatePushServer(ctx context.Context, server *protocoltypes.PushServer) error {
	ctx, cancel := context.WithTimeout(ctx, time.Second*5)
	defer cancel()

	_, err := p.serviceClient.PushSetServer(ctx, &protocoltypes.PushSetServer_Request{Server: server})

	return err
}

func NewPushHandlerViaProtocol(ctx context.Context, serviceClient protocoltypes.ProtocolServiceClient) PushHandler {
	return &pushHandlerClient{serviceClient: serviceClient}
}

func DecryptPushDataFromServer(data []byte, serverPK, ownSK *[32]byte) ([]byte, error) {
	if serverPK == nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(fmt.Errorf("no push server public key provided"))
	}

	if ownSK == nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(fmt.Errorf("no push receiver secret key provided"))
	}

	pushEnv := &pushtypes.PushExposedData{}
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
