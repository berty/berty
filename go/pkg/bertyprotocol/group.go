package bertyprotocol

import (
	"context"
	"crypto/ed25519"
	crand "crypto/rand"
	"crypto/sha256"
	"io"
	"io/ioutil"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/go-orbit-db/events"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
	"golang.org/x/crypto/hkdf"
	"golang.org/x/crypto/nacl/box"
)

const CurrentGroupVersion = 1

// NewGroupMultiMember creates a new Group object and an invitation to be used by
// the first member of the group
func NewGroupMultiMember() (*bertytypes.Group, crypto.PrivKey, error) {
	priv, pub, err := crypto.GenerateEd25519Key(crand.Reader)
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	pubBytes, err := pub.Raw()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	signing, _, err := crypto.GenerateEd25519Key(crand.Reader)
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	signingBytes, err := cryptoutil.SeedFromEd25519PrivateKey(signing)
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	skSig, err := priv.Sign(signingBytes)
	if err != nil {
		return nil, nil, errcode.ErrCryptoSignature.Wrap(err)
	}

	group := &bertytypes.Group{
		PublicKey: pubBytes,
		Secret:    signingBytes,
		SecretSig: skSig,
		GroupType: bertytypes.GroupTypeMultiMember,
	}

	return group, priv, nil
}

func getKeysForGroupOfContact(contactPairSK crypto.PrivKey) (crypto.PrivKey, crypto.PrivKey, error) {
	// Salt length must be equal to hash length (64 bytes for sha256)
	hash := sha256.New

	ck, err := contactPairSK.Raw()
	if err != nil {
		return nil, nil, errcode.ErrSerialization.Wrap(err)
	}

	// Generate Pseudo Random Key using ck as IKM and salt
	prk := hkdf.Extract(hash, ck, nil)
	if len(prk) == 0 {
		return nil, nil, errcode.ErrInternal
	}

	// Expand using extracted prk and groupID as info (kind of namespace)
	kdf := hkdf.Expand(hash, prk, nil)

	// Generate next KDF and message keys
	groupSeed, err := ioutil.ReadAll(io.LimitReader(kdf, 32))
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	groupSecretSeed, err := ioutil.ReadAll(io.LimitReader(kdf, 32))
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	sk1 := ed25519.NewKeyFromSeed(groupSeed)
	groupSK, _, err := crypto.KeyPairFromStdKey(&sk1)
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	sk2 := ed25519.NewKeyFromSeed(groupSecretSeed)
	groupSecretSK, _, err := crypto.KeyPairFromStdKey(&sk2)
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	return groupSK, groupSecretSK, nil
}

func getGroupForContact(contactPairSK crypto.PrivKey) (*bertytypes.Group, error) {
	groupSK, groupSecretSK, err := getKeysForGroupOfContact(contactPairSK)
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}
	pubBytes, err := groupSK.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	signingBytes, err := cryptoutil.SeedFromEd25519PrivateKey(groupSecretSK)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &bertytypes.Group{
		PublicKey: pubBytes,
		Secret:    signingBytes,
		SecretSig: nil,
		GroupType: bertytypes.GroupTypeContact,
	}, nil
}

func getGroupForAccount(priv, signing crypto.PrivKey) (*bertytypes.Group, error) {
	pubBytes, err := priv.GetPublic().Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	signingBytes, err := cryptoutil.SeedFromEd25519PrivateKey(signing)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	return &bertytypes.Group{
		PublicKey: pubBytes,
		Secret:    signingBytes,
		SecretSig: nil,
		GroupType: bertytypes.GroupTypeAccount,
	}, nil
}

func metadataStoreListSecrets(ctx context.Context, gc *groupContext) map[crypto.PubKey]*bertytypes.DeviceSecret {
	publishedSecrets := map[crypto.PubKey]*bertytypes.DeviceSecret{}

	m := gc.MetadataStore()
	ownSK := gc.getMemberPrivKey()
	g := gc.Group()

	ch := m.ListEvents(ctx)

	for meta := range ch {
		pk, ds, err := openDeviceSecret(meta.Metadata, ownSK, g)
		if err == errcode.ErrInvalidInput || err == errcode.ErrGroupSecretOtherDestMember {
			continue
		}

		if err != nil {
			gc.logger.Error("unable to open device secret", zap.Error(err))
			continue
		}

		publishedSecrets[pk] = ds
	}

	return publishedSecrets
}

func FillMessageKeysHolderUsingNewData(ctx context.Context, gc *groupContext) error {
	m := gc.MetadataStore()

	for evt := range m.Subscribe(ctx) {
		e, ok := evt.(*bertytypes.GroupMetadataEvent)
		if !ok {
			continue
		}

		pk, ds, err := openDeviceSecret(e.Metadata, gc.getMemberPrivKey(), gc.Group())
		if err == errcode.ErrInvalidInput || err == errcode.ErrGroupSecretOtherDestMember {
			continue
		}

		if err != nil {
			gc.logger.Error("an error occurred while opening device secrets", zap.Error(err))
			continue
		}

		if err = registerChainKey(ctx, gc.MessageKeystore(), gc.Group(), pk, ds, gc.DevicePubKey().Equals(pk)); err != nil {
			gc.logger.Error("unable to register chain key", zap.Error(err))
			continue
		}
	}

	return nil
}

func FillMessageKeysHolderUsingPreviousData(ctx context.Context, gc *groupContext) error {
	publishedSecrets := metadataStoreListSecrets(ctx, gc)

	for pk, sec := range publishedSecrets {
		if err := registerChainKey(ctx, gc.MessageKeystore(), gc.Group(), pk, sec, gc.DevicePubKey().Equals(pk)); err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	return nil
}

func ActivateGroupContext(ctx context.Context, gc *groupContext) error {
	if _, err := gc.MetadataStore().AddDeviceToGroup(ctx); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if err := FillMessageKeysHolderUsingPreviousData(ctx, gc); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}

	if err := SendSecretsToExistingMembers(ctx, gc); err != nil {
		return errcode.ErrInternal.Wrap(err)
	}
	//
	go func() {
		_ = FillMessageKeysHolderUsingNewData(ctx, gc)
	}()

	go WatchNewMembersAndSendSecrets(ctx, zap.NewNop(), gc)

	return nil
}

func handleNewMember(ctx context.Context, gctx *groupContext, evt events.Event) error {
	e, ok := evt.(*bertytypes.GroupMetadataEvent)
	if !ok {
		return nil
	}

	if e.Metadata.EventType != bertytypes.EventTypeGroupMemberDeviceAdded {
		return nil
	}

	event := &bertytypes.GroupAddMemberDevice{}
	if err := event.Unmarshal(e.Metadata.Payload); err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	memberPK, err := crypto.UnmarshalEd25519PublicKey(event.MemberPK)
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	if memberPK.Equals(gctx.MemberPubKey()) {
		return nil
	}

	if _, err := gctx.MetadataStore().SendSecret(ctx, memberPK); err != nil {
		if err != errcode.ErrGroupSecretAlreadySentToMember {
			return errcode.ErrInternal.Wrap(err)
		}

		return nil
	}

	return nil
}

func SendSecretsToExistingMembers(ctx context.Context, gctx *groupContext) error {
	members := gctx.MetadataStore().ListMembers()

	for _, pk := range members {
		if _, err := gctx.MetadataStore().SendSecret(ctx, pk); err != nil {
			if err != errcode.ErrGroupSecretAlreadySentToMember {
				return errcode.ErrInternal.Wrap(err)
			}
		}
	}

	return nil
}

func WatchNewMembersAndSendSecrets(ctx context.Context, logger *zap.Logger, gctx *groupContext) {
	go func() {
		for evt := range gctx.MetadataStore().Subscribe(ctx) {
			if err := handleNewMember(ctx, gctx, evt); err != nil {
				logger.Error("unable to send secrets", zap.Error(err))
			}
		}
	}()
}

func openDeviceSecret(m *bertytypes.GroupMetadata, localMemberPrivateKey crypto.PrivKey, group *bertytypes.Group) (crypto.PubKey, *bertytypes.DeviceSecret, error) {
	if m == nil || m.EventType != bertytypes.EventTypeGroupDeviceSecretAdded {
		return nil, nil, errcode.ErrInvalidInput
	}

	s := &bertytypes.GroupAddDeviceSecret{}
	if err := s.Unmarshal(m.Payload); err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	senderDevicePubKey, err := crypto.UnmarshalEd25519PublicKey(s.DevicePK)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	destMemberPubKey, err := crypto.UnmarshalEd25519PublicKey(s.DestMemberPK)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	if !localMemberPrivateKey.GetPublic().Equals(destMemberPubKey) {
		return nil, nil, errcode.ErrGroupSecretOtherDestMember
	}

	mongPriv, mongPub, err := cryptoutil.EdwardsToMontgomery(localMemberPrivateKey, senderDevicePubKey)
	if err != nil {
		return nil, nil, errcode.ErrCryptoKeyConversion.Wrap(err)
	}

	nonce := groupIDToNonce(group)
	decryptedSecret := &bertytypes.DeviceSecret{}
	decryptedMessage, ok := box.Open(nil, s.Payload, nonce, mongPub, mongPriv)
	if !ok {
		return nil, nil, errcode.ErrCryptoDecrypt
	}

	err = decryptedSecret.Unmarshal(decryptedMessage)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization
	}

	return senderDevicePubKey, decryptedSecret, nil
}

func groupIDToNonce(group *bertytypes.Group) *[cryptoutil.NonceSize]byte {
	// Nonce doesn't need to be secret, random nor unpredictable, it just needs
	// to be used only once for a given {sender, receiver} set and we will send
	// only one SecretEntryPayload per {localDevicePrivKey, remoteMemberPubKey}
	// So we can reuse groupID as nonce for all SecretEntryPayload and save
	// 24 bytes of storage and bandwidth for each of them.
	//
	// See https://pynacl.readthedocs.io/en/stable/secret/#nonce
	// See Security Model here: https://nacl.cr.yp.to/box.html
	var nonce [cryptoutil.NonceSize]byte

	gid := group.GetPublicKey()

	copy(nonce[:], gid)

	return &nonce
}
