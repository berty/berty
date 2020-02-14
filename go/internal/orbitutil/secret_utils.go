package orbitutil

import (
	"context"

	"berty.tech/go-orbit-db/events"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"

	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

func handleNewMember(ctx context.Context, gctx GroupContext, evt events.Event) error {
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

	if _, err := gctx.GetMetadataStore().SendSecret(ctx, memberPK); err != nil {
		if err != errcode.ErrGroupSecretAlreadySentToMember {
			return errcode.ErrInternal.Wrap(err)
		}

		return nil
	}

	return nil
}

func SendSecretsToExistingMembers(ctx context.Context, gctx GroupContext) error {
	ch := gctx.GetMetadataStore().ListEvents(ctx)

	for meta := range ch {
		if err := handleNewMember(ctx, gctx, meta); err != nil {
			return err
		}
	}

	return nil
}

func WatchNewMembersAndSendSecrets(ctx context.Context, logger *zap.Logger, gctx GroupContext) {
	go gctx.GetMetadataStore().Subscribe(ctx, func(evt events.Event) {
		if err := handleNewMember(ctx, gctx, evt); err != nil {
			// TODO: log
			logger.Error("unable to send secrets", zap.Error(err))
		}
	})
}
