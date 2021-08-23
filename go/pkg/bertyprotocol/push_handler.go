package bertyprotocol

import (
	"fmt"

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
	accountCache    datastore.Read
}

type PushHandler interface {
	PushReceive(payload []byte) (*protocoltypes.PushReceive_Reply, error)
}

var _ PushHandler = (*pushHandler)(nil)

func newPushHandler(pushKey *[cryptoutil.KeySize]byte, groupDatastore GroupDatastoreReadOnly, messageKeystore *messageKeystore, accountCache datastore.Read) *pushHandler {
	h := &pushHandler{
		pushSK:          pushKey,
		pushPK:          &[cryptoutil.KeySize]byte{},
		groupDatastore:  groupDatastore,
		messageKeystore: messageKeystore,
		accountCache:    accountCache,
	}

	if pushKey != nil {
		curve25519.ScalarBaseMult(h.pushPK, h.pushSK)
	} else {
		h.pushPK = nil
	}

	return h
}

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
	oosBytes, err := decryptPushDataFromServer(payload, s.getServerPushPubKey(), s.pushSK)
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

func (s *pushHandler) getServerPushPubKey() *[cryptoutil.KeySize]byte {
	serverBytes, err := s.accountCache.Get(datastore.NewKey(AccountCacheDatastorePushServerPK))
	if err != nil || len(serverBytes) == 0 {
		return nil
	}

	server := &protocoltypes.PushServer{}
	if err := server.Unmarshal(serverBytes); err != nil {
		return nil
	}

	if len(server.ServerKey) != cryptoutil.KeySize {
		return nil
	}

	out := [cryptoutil.KeySize]byte{}
	for i, c := range server.ServerKey {
		out[i] = c
	}

	return &out
}
