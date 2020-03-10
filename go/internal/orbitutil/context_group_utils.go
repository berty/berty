package orbitutil

import (
	"context"

	"berty.tech/go-orbit-db/events"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"

	"berty.tech/berty/go/internal/bertycrypto"
	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

func MetadataStoreListSecrets(ctx context.Context, gc ContextGroup) (map[crypto.PubKey]*bertyprotocol.DeviceSecret, error) {
	publishedSecrets := map[crypto.PubKey]*bertyprotocol.DeviceSecret{}

	m := gc.MetadataStore()
	ownSK := gc.getMemberPrivKey()
	g := gc.Group()

	ch := m.ListEvents(ctx)

	for meta := range ch {
		pk, ds, err := group.OpenDeviceSecret(meta.Metadata, ownSK, g)
		if err != nil {
			// TODO: log
			continue
		}

		publishedSecrets[pk] = ds
	}

	return publishedSecrets, nil
}

func FillMessageKeysHolderUsingNewData(ctx context.Context, gc ContextGroup) error {
	m := gc.MetadataStore()

	for evt := range m.Subscribe(ctx) {
		e, ok := evt.(*bertyprotocol.GroupMetadataEvent)
		if !ok {
			continue
		}

		pk, ds, err := group.OpenDeviceSecret(e.Metadata, gc.getMemberPrivKey(), gc.Group())
		if err != nil {
			continue
		}

		if err = bertycrypto.RegisterChainKey(ctx, gc.getMessageKeys(), gc.Group(), pk, ds, gc.DevicePubKey().Equals(pk)); err != nil {
			// TODO: log
			continue

		}
	}

	return nil
}

func FillMessageKeysHolderUsingPreviousData(ctx context.Context, gc ContextGroup) error {
	publishedSecrets, err := MetadataStoreListSecrets(ctx, gc)

	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	for pk, sec := range publishedSecrets {
		if err := bertycrypto.RegisterChainKey(ctx, gc.getMessageKeys(), gc.Group(), pk, sec, gc.DevicePubKey().Equals(pk)); err != nil {
			return errcode.TODO.Wrap(err)
		}
	}

	return nil
}

func ActivateGroupContext(ctx context.Context, gc ContextGroup) error {
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

func handleNewMember(ctx context.Context, gctx ContextGroup, evt events.Event) error {
	e, ok := evt.(*bertyprotocol.GroupMetadataEvent)
	if !ok {
		return nil
	}

	if e.Metadata.EventType != bertyprotocol.EventTypeGroupMemberDeviceAdded {
		return nil
	}

	event := &bertyprotocol.GroupAddMemberDevice{}
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

func SendSecretsToExistingMembers(ctx context.Context, gctx ContextGroup) error {
	ch := gctx.MetadataStore().ListEvents(ctx)

	for meta := range ch {
		if err := handleNewMember(ctx, gctx, meta); err != nil {
			return err
		}
	}

	return nil
}

func WatchNewMembersAndSendSecrets(ctx context.Context, logger *zap.Logger, gctx ContextGroup) {
	go func() {
		for evt := range gctx.MetadataStore().Subscribe(ctx) {
			if err := handleNewMember(ctx, gctx, evt); err != nil {
				// TODO: log
				logger.Error("unable to send secrets", zap.Error(err))
			}
		}
	}()
}
