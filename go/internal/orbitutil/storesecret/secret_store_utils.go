package storesecret

import (
	"context"

	"berty.tech/go-orbit-db/events"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"

	"berty.tech/berty/go/internal/orbitutil/orbitutilapi"
	"berty.tech/berty/go/pkg/errcode"
)

func SendSecretsToNewMembers(ctx context.Context, logger *zap.Logger, gctx orbitutilapi.GroupContext) {
	scs := gctx.GetSecretStore()
	ms := gctx.GetMemberStore()

	go scs.Subscribe(ctx, func(e events.Event) {
		switch e.(type) {
		case *orbitutilapi.EventSecretNewDevice:
			event, _ := e.(*orbitutilapi.EventSecretNewDevice)

			devicePK, err := crypto.UnmarshalEd25519PublicKey(event.GroupStoreEvent.GroupDevicePubKey)
			if err != nil {
				logger.Error("unable unmarshal public key", zap.Error(err))
				return
			}

			memberEntry, err := ms.GetEntryByDevice(devicePK)
			if err != nil {
				logger.Error("unable to get member entry", zap.Error(err))
				return
			}

			if _, err := gctx.GetSecretStore().SendSecret(ctx, memberEntry.Member()); err != nil {
				logger.Error("unable to send secret to member", zap.Error(err))
				return
			}
		}
	})
}

func SendSecretsToCurrentMembers(ctx context.Context, gctx orbitutilapi.GroupContext) error {
	members, err := gctx.GetMemberStore().ListMembers()
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	for _, m := range members {
		if _, err := gctx.GetSecretStore().SendSecret(ctx, m); err != nil {
			if err == errcode.ErrGroupSecretAlreadySentToMember {
				continue
			}

			return errcode.TODO.Wrap(err)
		}
	}

	return nil
}
