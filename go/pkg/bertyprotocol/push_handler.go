package bertyprotocol

import (
	"fmt"

	"github.com/ipfs/go-cid"
	"github.com/ipfs/go-datastore"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/secretbox"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type pushHandler struct {
	logger          *zap.Logger
	pushKey         *[cryptoutil.KeySize]byte
	groupDatastore  GroupDatastoreReadOnly
	messageKeystore *messageKeystore
	accountCache    datastore.Read
}

type PushHandler interface {
	PushReceive(payload []byte) (*protocoltypes.PushReceive_Reply, error)
}

var _ PushHandler = (*pushHandler)(nil)

func newPushHandler(pushKey *[cryptoutil.KeySize]byte, groupDatastore GroupDatastoreReadOnly, messageKeystore *messageKeystore, accountCache datastore.Read) *pushHandler {
	return &pushHandler{
		pushKey:         pushKey,
		groupDatastore:  groupDatastore,
		messageKeystore: messageKeystore,
		accountCache:    accountCache,
	}
}

func NewPushHandler(opts *Opts) (PushHandler, error) {
	if opts.PushKey == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no cross account push key specified"))
	}

	if err := opts.applyPushDefaults(); err != nil {
		return nil, err
	}

	return &pushHandler{
		logger:          opts.Logger,
		pushKey:         opts.PushKey,
		groupDatastore:  opts.GroupDatastore,
		messageKeystore: opts.MessageKeystore,
		accountCache:    opts.AccountCache,
	}, nil
}

func (s *pushHandler) PushReceive(payload []byte) (*protocoltypes.PushReceive_Reply, error) {
	msgBytes, err := decryptPushDataFromServer(payload, s.getServerPushPubKey(), s.pushKey)
	if err != nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(err)
	}

	oosMessageEnv := &protocoltypes.OutOfStoreMessageEnvelope{}
	err = oosMessageEnv.Unmarshal(msgBytes)
	if err != nil {
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

	_, id, err := cid.CidFromBytes(oosMessage.CID)
	if err != nil {
		return nil, errcode.ErrDeserialization.Wrap(err)
	}

	clear, _, err := s.messageKeystore.openPayload(id, gPK, oosMessage.EncryptedPayload, &protocoltypes.MessageHeaders{
		Counter:  oosMessage.Counter,
		DevicePK: oosMessage.DevicePK,
		Sig:      oosMessage.Sig,
	})
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
