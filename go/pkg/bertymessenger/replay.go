package bertymessenger

import (
	"bytes"
	"context"
	"io"

	// nolint:staticcheck // cannot use the new protobuf API while keeping gogoproto
	"github.com/golang/protobuf/proto"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/messengerdb"
	"berty.tech/berty/v2/go/internal/messengerpayloads"
	"berty.tech/berty/v2/go/internal/messengerutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
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
	cfg, err := client.InstanceGetConfiguration(ctx, &protocoltypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	pk := messengerutil.B64EncodeBytes(cfg.GetAccountGroupPK())

	if err := wrappedDB.FirstOrCreateAccount(pk, ""); err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	handler := messengerpayloads.NewEventHandler(ctx, wrappedDB, &MetaFetcherFromProtocolClient{client: client}, messengertypes.NewPostActionsServiceNoop(), zap.NewNop(), nil, true)

	// Replay all account group metadata events
	// TODO: We should have a toggle to "lock" orbitDB while we replaying events
	// So we don't miss events that occurred during the replay
	if err := processMetadataList(cfg.GetAccountGroupPK(), handler, client); err != nil {
		return errcode.ErrReplayProcessGroupMetadata.Wrap(err)
	}

	// Get all groups the account is member of
	convs, err := wrappedDB.GetAllConversations()
	if err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}

	for _, conv := range convs {
		// Replay all other group metadata events
		groupPK, err := messengerutil.B64DecodeBytes(conv.GetPublicKey())
		if err != nil {
			return errcode.ErrDeserialization.Wrap(err)
		}

		// Group account metadata was already replayed above and account group
		// is always activated
		// TODO: check with @glouvigny if we could launch the protocol
		// without activating the account group
		if !bytes.Equal(groupPK, cfg.GetAccountGroupPK()) {
			if _, err := client.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
				GroupPK:   groupPK,
				LocalOnly: true,
			}); err != nil {
				return errcode.ErrGroupActivate.Wrap(err)
			}

			if err := processMetadataList(groupPK, handler, client); err != nil {
				return errcode.ErrReplayProcessGroupMetadata.Wrap(err)
			}
		}

		// Replay all group message events
		if err := processMessageList(groupPK, handler, client); err != nil {
			return errcode.ErrReplayProcessGroupMessage.Wrap(err)
		}

		// Deactivate non-account groups
		if !bytes.Equal(groupPK, cfg.GetAccountGroupPK()) {
			if _, err := client.DeactivateGroup(ctx, &protocoltypes.DeactivateGroup_Request{
				GroupPK: groupPK,
			}); err != nil {
				return errcode.ErrGroupDeactivate.Wrap(err)
			}
		}
	}

	return nil
}

func processMetadataList(groupPK []byte, handler *messengerpayloads.EventHandler, client protocoltypes.ProtocolServiceClient) error {
	metaList, err := client.GroupMetadataList(
		handler.Ctx(),
		&protocoltypes.GroupMetadataList_Request{
			GroupPK:  groupPK,
			UntilNow: true,
		},
	)
	if err != nil {
		return errcode.ErrEventListMetadata.Wrap(err)
	}

	for {
		if handler.Ctx().Err() != nil {
			return errcode.ErrEventListMetadata.Wrap(err)
		}

		metadata, err := metaList.Recv()
		if err == io.EOF {
			return nil
		} else if err != nil {
			return errcode.ErrEventListMetadata.Wrap(err)
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
			GroupPK:  groupPK,
			UntilNow: true,
		},
	)
	if err != nil {
		return errcode.ErrEventListMessage.Wrap(err)
	}

	for {
		if handler.Ctx().Err() != nil {
			return errcode.ErrEventListMessage.Wrap(err)
		}

		message, err := msgList.Recv()
		if err == io.EOF {
			return nil
		} else if err != nil {
			return errcode.ErrEventListMessage.Wrap(err)
		}

		var appMsg messengertypes.AppMessage
		if err := proto.Unmarshal(message.GetMessage(), &appMsg); err != nil {
			return errcode.ErrDeserialization.Wrap(err)
		}

		if err := handler.HandleAppMessage(groupPKStr, message, &appMsg); err != nil {
			return errcode.TODO.Wrap(err)
		}
	}
}
