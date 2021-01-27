package bertyprotocol

import (
	"context"
	"fmt"

	"github.com/ipfs/go-cid"
	"github.com/ipfs/go-datastore"
	"github.com/libp2p/go-libp2p-core/crypto"
	"golang.org/x/crypto/nacl/secretbox"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type pushHandler struct {
	pushKey         *[cryptoutil.KeySize]byte
	groupDatastore  GroupDatastoreReadOnly
	messageKeystore *messageKeystore
	accountCache    datastore.Read
}

func newPushHandler(pushKey *[cryptoutil.KeySize]byte, groupDatastore GroupDatastoreReadOnly, messageKeystore *messageKeystore, accountCache datastore.Read) *pushHandler {
	return &pushHandler{
		pushKey:         pushKey,
		groupDatastore:  groupDatastore,
		messageKeystore: messageKeystore,
		accountCache:    accountCache,
	}
}

func (s *pushHandler) PushReceive(ctx context.Context, request *protocoltypes.PushReceive_Request) (*protocoltypes.PushReceive_Reply, error) {
	msgBytes, err := decryptPushDataFromServer(request.Payload, s.getServerPushPubKey(), s.pushKey)
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

	payload, _, err := s.messageKeystore.openPayload(id, gPK, oosMessage.EncryptedPayload, &protocoltypes.MessageHeaders{
		Counter:  oosMessage.Counter,
		DevicePK: oosMessage.DevicePK,
		Sig:      oosMessage.Sig,
	})
	if err != nil {
		return nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	return &protocoltypes.PushReceive_Reply{
		Message:        oosMessage,
		Cleartext:      payload,
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
