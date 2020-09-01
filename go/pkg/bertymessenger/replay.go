package bertymessenger

import (
	"bytes"
	"context"
	"io"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/golang/protobuf/proto" // nolint:staticcheck: not sure how to use the new protobuf api to unmarshal
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

func ReplayLogsToDB(ctx context.Context, client bertyprotocol.ProtocolServiceClient, db *gorm.DB) error {
	// Clean and init DB
	if err := dropAllTables(db); err != nil { // Not sure about this, could prevent painful debug sessions
		return err
	}

	if err := initDB(db); err != nil {
		return err
	}

	// Get account infos
	cfg, err := client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	pk := bytesToString(cfg.GetAccountGroupPK())

	acc := &Account{}
	acc.State = Account_NotReady // Not sure about this, looks like we don't push displayName on log?
	acc.Link = ""                // TODO
	acc.PublicKey = pk
	if err := db.Clauses(clause.OnConflict{DoNothing: true}).Create(&acc).Error; err != nil {
		return errcode.ErrDBWrite.Wrap(err)
	}

	// Replay all account group metadata events
	// TODO: We should have a toggle to "lock" orbitDB while we replaying events
	// So we don't miss events that occurred during the replay
	if err := processMetadataList(ctx, cfg.GetAccountGroupPK(), db, client); err != nil {
		return errcode.ErrReplayProcessGroupMetadata.Wrap(err)
	}

	// Get all groups the account is member of
	var convs []*Conversation
	if err := db.Find(&convs).Error; err != nil {
		return errcode.ErrDBRead.Wrap(err)
	}

	for _, conv := range convs {
		// Replay all other group metadata events
		groupPK, err := stringToBytes(conv.GetPublicKey())
		if err != nil {
			return errcode.ErrDeserialization.Wrap(err)
		}

		// Group account metadata was already replayed above and account group
		// is always activated
		// TODO: check with @glouvigny if we could launch the protocol
		// without activating the account group
		if !bytes.Equal(groupPK, cfg.GetAccountGroupPK()) {
			if _, err := client.ActivateGroup(ctx, &bertytypes.ActivateGroup_Request{
				GroupPK:   groupPK,
				LocalOnly: true,
			}); err != nil {
				return errcode.ErrGroupActivate.Wrap(err)
			}

			if err := processMetadataList(ctx, groupPK, db, client); err != nil {
				return errcode.ErrReplayProcessGroupMetadata.Wrap(err)
			}
		}

		// Replay all group message events
		if err := processMessageList(ctx, groupPK, db, client); err != nil {
			return errcode.ErrReplayProcessGroupMessage.Wrap(err)
		}

		// Deactivate non-account groups
		if !bytes.Equal(groupPK, cfg.GetAccountGroupPK()) {
			if _, err := client.DeactivateGroup(ctx, &bertytypes.DeactivateGroup_Request{
				GroupPK: groupPK,
			}); err != nil {
				return errcode.ErrGroupDeactivate.Wrap(err)
			}
		}
	}

	return nil
}

func processMetadataList(ctx context.Context, groupPK []byte, db *gorm.DB, client bertyprotocol.ProtocolServiceClient) error {
	subCtx, subCancel := context.WithCancel(ctx)
	defer subCancel()

	metaList, err := client.GroupMetadataList(
		subCtx,
		&bertytypes.GroupMetadataList_Request{
			GroupPK:  groupPK,
			UntilNow: true,
		},
	)
	if err != nil {
		return errcode.ErrEventListMetadata.Wrap(err)
	}

	for {
		if subCtx.Err() != nil {
			return errcode.ErrEventListMetadata.Wrap(err)
		}

		metadata, err := metaList.Recv()
		if err == io.EOF {
			return nil
		} else if err != nil {
			return errcode.ErrEventListMetadata.Wrap(err)
		}

		switch metadata.GetMetadata().GetEventType() {
		case bertytypes.EventTypeAccountGroupJoined:
			var ev bertytypes.AccountGroupJoined
			if err := proto.Unmarshal(metadata.GetEvent(), &ev); err != nil {
				return errcode.ErrDeserialization.Wrap(err)
			}
			groupPK := bytesToString(ev.GetGroup().GetPublicKey())

			if _, err := addConversation(db, groupPK); err != nil {
				return errcode.ErrDBAddConversation.Wrap(err)
			}

		case bertytypes.EventTypeAccountContactRequestOutgoingEnqueued:
			var ev bertytypes.AccountContactRequestEnqueued
			if err := proto.Unmarshal(metadata.GetEvent(), &ev); err != nil {
				return errcode.ErrDeserialization.Wrap(err)
			}
			contactPKBytes := ev.GetContact().GetPK()
			contactPK := bytesToString(contactPKBytes)

			var cm ContactMetadata
			err := proto.Unmarshal(ev.GetContact().GetMetadata(), &cm)
			if err != nil {
				return errcode.ErrDeserialization.Wrap(err)
			}

			gpk := bytesToString(ev.GetGroupPK())
			if gpk == "" {
				groupInfoReply, err := client.GroupInfo(ctx, &bertytypes.GroupInfo_Request{ContactPK: contactPKBytes})
				if err != nil {
					return errcode.ErrGroupInfo.Wrap(err)
				}
				gpk = bytesToString(groupInfoReply.GetGroup().GetPublicKey())
			}

			if _, err := addContactRequestOutgoingEnqueued(db, contactPK, cm.DisplayName, gpk); err != nil {
				return errcode.ErrDBAddContactRequestOutgoingEnqueud.Wrap(err)
			}

		case bertytypes.EventTypeAccountContactRequestOutgoingSent:
			var ev bertytypes.AccountContactRequestSent
			if err := proto.Unmarshal(metadata.GetEvent(), &ev); err != nil {
				return errcode.ErrDeserialization.Wrap(err)
			}
			contactPK := bytesToString(ev.GetContactPK())

			if _, err := addContactRequestOutgoingSent(db, contactPK); err != nil {
				return errcode.ErrDBAddContactRequestOutgoingSent.Wrap(err)
			}

		case bertytypes.EventTypeAccountContactRequestIncomingReceived:
			var ev bertytypes.AccountContactRequestReceived
			if err := proto.Unmarshal(metadata.GetEvent(), &ev); err != nil {
				return errcode.ErrDeserialization.Wrap(err)
			}
			contactPK := bytesToString(ev.GetContactPK())

			var m ContactMetadata
			err := proto.Unmarshal(ev.GetContactMetadata(), &m)
			if err != nil {
				return errcode.ErrDeserialization.Wrap(err)
			}

			if _, err := addContactRequestIncomingReceived(db, contactPK, m.GetDisplayName()); err != nil {
				return errcode.ErrDBAddContactRequestIncomingReceived.Wrap(err)
			}

		case bertytypes.EventTypeAccountContactRequestIncomingAccepted:
			var ev bertytypes.AccountContactRequestAccepted
			if err := proto.Unmarshal(metadata.GetEvent(), &ev); err != nil {
				return errcode.ErrDeserialization.Wrap(err)
			}
			contactPKBytes := ev.GetContactPK()
			if contactPKBytes == nil {
				return errcode.ErrInvalidInput
			}
			contactPK := bytesToString(contactPKBytes)

			groupPKBytes, err := groupPKFromContactPK(subCtx, client, contactPKBytes)
			if err != nil {
				return errcode.ErrInvalidInput.Wrap(err)
			}
			groupPK := bytesToString(groupPKBytes)

			if _, _, err := addContactRequestIncomingAccepted(db, contactPK, groupPK); err != nil {
				return errcode.ErrDBAddContactRequestIncomingAccepted.Wrap(err)
			}

		// TODO
		// case bertytypes.EventTypeGroupMemberDeviceAdded:
		// 	var ev bertytypes.GroupAddMemberDevice
		// 	if err := proto.Unmarshal(metadata.GetEvent(), &ev); err != nil {
		// 		return errcode.ErrDeserialization.Wrap(err)
		// 	}

		// 	memberPKBytes := ev.GetMemberPK()
		// 	if memberPKBytes == nil {
		// 		return errcode.ErrInvalidInput
		// 	}
		// 	memberPK := bytesToString(memberPKBytes)

		// 	groupPKBytes, err := groupPKFromContactPK(subCtx, client, memberPKBytes)
		// 	if err != nil {
		// 		return errcode.ErrInvalidInput.Wrap(err)
		// 	}
		// 	groupPK := bytesToString(groupPKBytes)

		// 	if _, err := addGroupMemberDeviceAdded(db, memberPK, groupPK); err != nil {
		// 		return errcode.ErrDBAddGroupMemberDeviceAdded.Wrap(err)
		// 	}

		default:
			// Not sure about what to do in this case, maybe:
			// return errcode.ErrInvalidInput
		}
	}
}

func processMessageList(ctx context.Context, groupPK []byte, db *gorm.DB, client bertyprotocol.ProtocolServiceClient) error {
	subCtx, subCancel := context.WithCancel(ctx)
	defer subCancel()

	msgList, err := client.GroupMessageList(
		subCtx,
		&bertytypes.GroupMessageList_Request{
			GroupPK:  groupPK,
			UntilNow: true,
		},
	)
	if err != nil {
		return errcode.ErrEventListMessage.Wrap(err)
	}

	for {
		if subCtx.Err() != nil {
			return errcode.ErrEventListMessage.Wrap(err)
		}

		message, err := msgList.Recv()
		if err == io.EOF {
			return nil
		} else if err != nil {
			return errcode.ErrEventListMessage.Wrap(err)
		}

		var appMsg AppMessage
		if err := proto.Unmarshal(message.GetMessage(), &appMsg); err != nil {
			return errcode.ErrDeserialization.Wrap(err)
		}

		if _, err = appMsg.UnmarshalPayload(); err != nil {
			return errcode.ErrDeserialization.Wrap(err)
		}

		isMe, err := checkIsMe(subCtx, client, message)
		if err != nil {
			// TODO: Check with Norman if this shouldn't be a:
			// return nil
			return errcode.ErrInvalidInput.Wrap(err)
		}

		i := &Interaction{
			CID:                   bytesToString(message.GetEventContext().GetID()),
			Type:                  appMsg.GetType(),
			Payload:               appMsg.GetPayload(),
			ConversationPublicKey: bytesToString(message.GetEventContext().GetGroupPK()),
			IsMe:                  isMe,
		}

		switch i.Type {
		case AppMessage_TypeAcknowledge:
			// FIXME: set 'Acknowledged: true' on existing interaction instead
			if err := db.Create(i).Error; err != nil {
				return errcode.ErrDBWrite.Wrap(err)
			}

		case AppMessage_TypeGroupInvitation:
			if err := db.Create(i).Error; err != nil {
				return errcode.ErrDBWrite.Wrap(err)
			}

		case AppMessage_TypeUserMessage:
			if err := db.Create(i).Error; err != nil {
				return errcode.ErrDBWrite.Wrap(err)
			}

		default:
			return errcode.ErrInvalidInput.Wrap(err)
		}
	}
}
