package orbitutil

import (
	"context"

	"berty.tech/go-orbit-db/events"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"

	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"
)

func WatchNewMembersAndSendSecrets(ctx context.Context, logger *zap.Logger, gctx GroupContext) {
	gctx.GetMetadataStore().Subscribe(ctx, func(e events.Event) {
		switch e.(type) {
		case *bertyprotocol.GroupMetadataEvent:
			casted, _ := e.(*bertyprotocol.GroupMetadataEvent)
			if casted.Metadata.EventType != bertyprotocol.EventTypeGroupMemberDeviceAdded {
				return
			}

			event := &bertyprotocol.GroupAddMemberDevice{}
			if err := event.Unmarshal(casted.Metadata.Payload); err != nil {
				logger.Error("err: unable to unmarshal event", zap.Error(err))
				return
			}

			memberPK, err := crypto.UnmarshalEd25519PublicKey(event.MemberPK)
			if err != nil {
				logger.Error("err: unable to unmarshal public key", zap.Error(err))
				return
			}

			if _, err := gctx.GetMetadataStore().SendSecret(ctx, memberPK); err != nil {
				if err != errcode.ErrGroupSecretAlreadySentToMember {
					logger.Error("err: unable to send secret to member", zap.Error(err))
				} else if err == errcode.ErrGroupSecretAlreadySentToMember {
					logger.Info("err: unable to send secret to member, already sent")
				}

				return
			}
		}
	})
}
