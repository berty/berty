package bertypush

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"path"
	"time"

	"go.uber.org/zap"
	"google.golang.org/protobuf/proto"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/dbfetcher"
	"berty.tech/berty/v2/go/internal/messengerdb"
	"berty.tech/berty/v2/go/internal/messengerpayloads"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/bertylinks"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
	"berty.tech/weshnet/v2"
	"berty.tech/weshnet/v2/pkg/logutil"
)

func PushDecryptStandalone(logger *zap.Logger, rootDir string, inputB64 string, ks accountutils.NativeKeystore) (*pushtypes.DecryptedPush, error) {
	input, err := base64.RawURLEncoding.DecodeString(inputB64)
	if err != nil {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	rawPushData, accountData, err := PushDecrypt(ctx, rootDir, input, &PushDecryptOpts{Logger: logger, Keystore: ks})
	if err != nil {
		return nil, errcode.ErrCode_ErrPushUnableToDecrypt.Wrap(err)
	}

	return PushEnrich(rawPushData, accountData, logger)
}

func PushEnrich(rawPushData *messengertypes.PushReceivedData, accountData *accounttypes.AccountMetadata, logger *zap.Logger) (*pushtypes.DecryptedPush, error) {
	if accountData == nil {
		return nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("no account metadata specified"))
	}

	link, err := bertylinks.InternalLinkToMessage(accountData.AccountId, rawPushData.Interaction.ConversationPublicKey, rawPushData.Interaction.Cid)
	if err != nil {
		logger.Error("unable to create link for interaction", logutil.PrivateString("cid", string(rawPushData.ProtocolData.Message.Cid)), zap.Error(err))
		link = bertylinks.LinkInternalPrefix
	}

	conversationDisplayName := ""
	memberDisplayName := ""
	switch rawPushData.GetInteraction().GetConversation().GetType() {
	case messengertypes.Conversation_ContactType:
		conversationDisplayName = rawPushData.GetInteraction().GetConversation().GetContact().GetDisplayName()
	case messengertypes.Conversation_MultiMemberType:
		conversationDisplayName = rawPushData.GetInteraction().GetConversation().GetDisplayName()
		memberDisplayName = rawPushData.GetInteraction().GetMember().GetDisplayName()
	}

	d := &pushtypes.DecryptedPush{
		AccountId:               accountData.AccountId,
		AccountName:             accountData.Name,
		ConversationPublicKey:   rawPushData.Interaction.ConversationPublicKey,
		ConversationDisplayName: conversationDisplayName,
		MemberPublicKey:         rawPushData.Interaction.MemberPublicKey,
		MemberDisplayName:       memberDisplayName,
		PushType:                pushtypes.DecryptedPush_Unknown,
		PayloadAttrsJson:        "{}",
		DeepLink:                link,
		AlreadyReceived:         rawPushData.AlreadyReceived,
		AccountMuted:            rawPushData.AccountMuted,
		ConversationMuted:       rawPushData.ConversationMuted,
		HidePreview:             rawPushData.HidePreview,
	}

	payloadAttrs := map[string]string{}
	switch rawPushData.Interaction.Type {
	case messengertypes.AppMessage_TypeUserMessage:
		m := &messengertypes.AppMessage_UserMessage{}
		err := proto.Unmarshal(rawPushData.Interaction.Payload, m)
		if err != nil {
			logger.Error("unable to unmarshal user message", logutil.PrivateString("cid", string(rawPushData.ProtocolData.Message.Cid)), zap.Error(err))
			break
		}

		if m.Body == "" {
			break
		}

		d.PushType = pushtypes.DecryptedPush_Message
		payloadAttrs["message"] = m.Body

	case messengertypes.AppMessage_TypeGroupInvitation:
		d.PushType = pushtypes.DecryptedPush_GroupInvitation
		invitation := &messengertypes.AppMessage_GroupInvitation{}
		err := proto.Unmarshal(rawPushData.Interaction.Payload, invitation)
		if err != nil {
			logger.Error("unable to unmarshal group invitation", logutil.PrivateString("cid", string(rawPushData.ProtocolData.Message.Cid)), zap.Error(err))
			break
		}

		link, err := bertylinks.UnmarshalLink(invitation.Link, nil)
		if err != nil {
			logger.Error("unable to unmarshal group invitation link", logutil.PrivateString("link", invitation.Link), logutil.PrivateString("cid", string(rawPushData.ProtocolData.Message.Cid)), zap.Error(err))
			break
		}

		if link.Kind != messengertypes.BertyLink_GroupV1Kind {
			logger.Error("invalid group invitation link received", logutil.PrivateString("cid", string(rawPushData.ProtocolData.Message.Cid)), zap.String("link-kind", link.Kind.String()))
			break
		}

		payloadAttrs["group-name"] = link.BertyGroup.DisplayName

	case messengertypes.AppMessage_TypeSetGroupInfo:
		d.PushType = pushtypes.DecryptedPush_ConversationNameChanged

	case messengertypes.AppMessage_TypeSetUserInfo:
		// pushType = DecryptedPush_MemberNameChanged
		// pushType = DecryptedPush_MemberPictureChanged
		d.PushType = pushtypes.DecryptedPush_MemberDetailsChanged
		// TODO: get old values

	case messengertypes.AppMessage_TypeAcknowledge:
		logger.Debug("received a push notification for an ack, this should not happen", logutil.PrivateString("cid", rawPushData.Interaction.Cid))

	default:
		logger.Debug("unknown message type", zap.String("message-type", rawPushData.Interaction.Type.String()), logutil.PrivateString("cid", rawPushData.Interaction.Cid))
	}

	if len(payloadAttrs) > 0 {
		jsoned, err := json.Marshal(payloadAttrs)
		if err == nil {
			d.PayloadAttrsJson = string(jsoned)
		}
	}

	return d, nil
}

type PushDecryptOpts struct {
	Logger           *zap.Logger
	Keystore         accountutils.NativeKeystore
	ExcludedAccounts []string
}

func PushDecrypt(ctx context.Context, rootDir string, input []byte, opts *PushDecryptOpts) (*messengertypes.PushReceivedData, *accounttypes.AccountMetadata, error) {
	if opts == nil {
		opts = &PushDecryptOpts{}
	}

	if opts.Logger == nil {
		opts.Logger = zap.NewNop()
	}

	_, pushSK, err := accountutils.GetDevicePushKeyForPath(path.Join(rootDir, accountutils.DefaultPushKeyFilename), false)
	if err != nil {
		return nil, nil, errcode.ErrCode_ErrPushUnableToDecrypt.Wrap(fmt.Errorf("device has no known push key"))
	}

	accounts, err := accountutils.ListAccounts(ctx, rootDir, opts.Keystore, opts.Logger)
	if err != nil {
		return nil, nil, err
	}

	if len(accounts) == 0 {
		return nil, nil, errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("no accounts found"))
	}

	var errs []error

	for _, account := range accounts {
		data, err := func() (*messengertypes.PushReceivedData, error) {
			var reply *messengertypes.PushReceive_Reply

			ignoreAccount := false
			for _, excluded := range opts.ExcludedAccounts {
				if account.AccountId == excluded {
					ignoreAccount = true
					break
				}
			}

			if ignoreAccount {
				return nil, nil
			}

			accountDir := accountutils.GetAccountDir(rootDir, account.AccountId)
			err := accountutils.CreateDataDir(accountDir)
			if err != nil {
				return nil, err
			}

			var storageKey []byte
			if opts.Keystore != nil {
				if storageKey, err = accountutils.GetOrCreateStorageKeyForAccount(opts.Keystore, account.AccountId); err != nil {
					return nil, err
				}
			}

			var rootDatastoreSalt []byte
			if opts.Keystore != nil {
				if rootDatastoreSalt, err = accountutils.GetOrCreateRootDatastoreSaltForAccount(opts.Keystore, account.AccountId); err != nil {
					return nil, err
				}
			}

			rootDS, err := accountutils.GetRootDatastoreForPath(accountDir, storageKey, rootDatastoreSalt, opts.Logger)
			if err != nil {
				return nil, err
			}
			defer rootDS.Close()

			var messengerDBSalt []byte
			if opts.Keystore != nil {
				if messengerDBSalt, err = accountutils.GetOrCreateMessengerDBSaltForAccount(opts.Keystore, account.AccountId); err != nil {
					return nil, err
				}
			}

			db, dbCleanup, err := accountutils.GetMessengerDBForPath(accountDir, storageKey, messengerDBSalt, opts.Logger)
			if err != nil {
				return nil, err
			}
			defer dbCleanup()

			wrappedDB := messengerdb.NewDBWrapper(db, opts.Logger)
			dbFetcher := dbfetcher.NewDBFetcher(account.PublicKey, wrappedDB)

			weshClient, err := weshnet.NewOutOfStoreMessageServiceClient(weshnet.WithRootDatastore(rootDS), weshnet.WithLogger(opts.Logger))
			if err != nil {
				return nil, errcode.ErrCode_ErrInternal.Wrap(fmt.Errorf("unable to initialize weshnet client: %w", err))
			}

			pushHandler, err := NewPushHandler(weshClient, dbFetcher, pushSK, &PushHandlerOpts{
				Logger: opts.Logger,
			})
			if err != nil {
				return nil, errcode.ErrCode_ErrInternal.Wrap(fmt.Errorf("unable to initialize push handler: %w", err))
			}

			evtHandler := messengerpayloads.NewEventHandler(ctx, wrappedDB, nil, messengertypes.NewPostActionsServiceNoop(), opts.Logger, nil, false)
			pushReceiver := NewPushReceiver(pushHandler, evtHandler, dbFetcher, opts.Logger)

			reply, err = pushReceiver.PushReceive(ctx, input)
			if err != nil {
				opts.Logger.Warn("unable to decrypt push", logutil.PrivateString("account-id", account.AccountId), zap.Error(err))
				return nil, err
			}

			return reply.Data, nil
		}()
		if err != nil {
			errs = append(errs, err)
			continue
		}
		if data != nil {
			return data, account, nil
		}
	}

	if len(errs) == 0 {
		return nil, nil, errcode.ErrCode_ErrInternal.Wrap(fmt.Errorf("no account can decrypt the received push message"))
	}

	// only returning the first error
	return nil, nil, errcode.ErrCode_ErrPushUnableToDecrypt.Wrap(errs[0])
}
