package bertymessenger

import (
	"bytes"
	"context"
	"io"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"berty.tech/berty/v2/go/internal/messengerdb"
	"berty.tech/berty/v2/go/internal/messengerpayloads"
	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	weshnet_errcode "berty.tech/weshnet/v2/pkg/errcode"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
	"berty.tech/weshnet/v2/pkg/tyber"
)

func getEventsReplayerForDB(ctx context.Context, client protocoltypes.ProtocolServiceClient, log *zap.Logger) func(db *messengerdb.DBWrapper) error {
	return func(db *messengerdb.DBWrapper) error {
		return replayLogsToDB(ctx, client, db, log)
	}
}

func replayLogsToDB(ctx context.Context, client protocoltypes.ProtocolServiceClient, wrappedDB *messengerdb.DBWrapper, log *zap.Logger) (err error) {
	ctx, _, endSection := tyber.Section(ctx, log, "Replaying logs to database")
	defer func() { endSection(err, "") }()

	// Get account infos
	cfg, err := client.ServiceGetConfiguration(ctx, &protocoltypes.ServiceGetConfiguration_Request{})
	if err != nil {
		return errcode.ErrCode_TODO.Wrap(err)
	}
	pk := messengerutil.B64EncodeBytes(cfg.GetAccountGroupPk())

	if err := wrappedDB.FirstOrCreateAccount(pk, ""); err != nil {
		return errcode.ErrCode_ErrDBWrite.Wrap(err)
	}

	handler := messengerpayloads.NewEventHandler(ctx, wrappedDB, &MetaFetcherFromProtocolClient{client: client}, messengertypes.NewPostActionsServiceNoop(), zap.NewNop(), nil, true)

	// Replay all account group metadata events
	// TODO: We should have a toggle to "lock" orbitDB while we replaying events
	// So we don't miss events that occurred during the replay
	if err := processMetadataList(cfg.GetAccountGroupPk(), handler, client); err != nil {
		return errcode.ErrCode_ErrReplayProcessGroupMetadata.Wrap(err)
	}

	// Get all groups the account is member of
	convs, err := wrappedDB.GetAllConversations()
	if err != nil {
		return errcode.ErrCode_ErrDBRead.Wrap(err)
	}

	for _, conv := range convs {
		// Replay all other group metadata events
		groupPK, err := messengerutil.B64DecodeBytes(conv.GetPublicKey())
		if err != nil {
			return errcode.ErrCode_ErrDeserialization.Wrap(err)
		}

		// Group account metadata was already replayed above and account group
		// is always activated
		// TODO: check with @glouvigny if we could launch the protocol
		// without activating the account group
		if !bytes.Equal(groupPK, cfg.GetAccountGroupPk()) {
			if _, err := client.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
				GroupPk:   groupPK,
				LocalOnly: true,
			}); err != nil {
				return weshnet_errcode.ErrCode_ErrGroupActivate.Wrap(err)
			}

			if err := processMetadataList(groupPK, handler, client); err != nil {
				return errcode.ErrCode_ErrReplayProcessGroupMetadata.Wrap(err)
			}
		}

		// Replay all group message events
		if err := processMessageList(groupPK, handler, client); err != nil {
			return errcode.ErrCode_ErrReplayProcessGroupMessage.Wrap(err)
		}

		// Deactivate non-account groups
		if !bytes.Equal(groupPK, cfg.GetAccountGroupPk()) {
			if _, err := client.DeactivateGroup(ctx, &protocoltypes.DeactivateGroup_Request{
				GroupPk: groupPK,
			}); err != nil {
				return weshnet_errcode.ErrCode_ErrGroupDeactivate.Wrap(err)
			}
		}
	}

	return nil
}

func processMetadataList(groupPK []byte, handler *messengerpayloads.EventHandler, client protocoltypes.ProtocolServiceClient) error {
	metaList, err := client.GroupMetadataList(
		handler.Ctx(),
		&protocoltypes.GroupMetadataList_Request{
			GroupPk:  groupPK,
			UntilNow: true,
		},
	)
	if err != nil {
		return errcode.ErrCode_ErrEventListMetadata.Wrap(err)
	}

	for {
		if handler.Ctx().Err() != nil {
			return errcode.ErrCode_ErrEventListMetadata.Wrap(err)
		}

		metadata, err := metaList.Recv()
		if err == io.EOF {
			return nil
		} else if err != nil {
			return errcode.ErrCode_ErrEventListMetadata.Wrap(err)
		}

		if err := handler.HandleMetadataEvent(metadata); err != nil {
			return err
		}
	}
}

func processMessageList(groupPK []byte, handler *messengerpayloads.EventHandler, client protocoltypes.ProtocolServiceClient) error {
	groupPKStr := messengerutil.B64EncodeBytes(groupPK)

	msgList, err := client.GroupMessageList(
		handler.Ctx(),
		&protocoltypes.GroupMessageList_Request{
			GroupPk:  groupPK,
			UntilNow: true,
		},
	)
	if err != nil {
		return errcode.ErrCode_ErrEventListMessage.Wrap(err)
	}

	for {
		if handler.Ctx().Err() != nil {
			return errcode.ErrCode_ErrEventListMessage.Wrap(err)
		}

		message, err := msgList.Recv()
		if err == io.EOF {
			return nil
		} else if err != nil {
			return errcode.ErrCode_ErrEventListMessage.Wrap(err)
		}

		var appMsg messengertypes.AppMessage
		if err := proto.Unmarshal(message.GetMessage(), &appMsg); err != nil {
			return errcode.ErrCode_ErrDeserialization.Wrap(err)
		}

		if err := handler.HandleAppMessage(groupPKStr, message, &appMsg); err != nil {
			return errcode.ErrCode_TODO.Wrap(err)
		}
	}
}
