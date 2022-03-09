package bertypush

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"path"
	"strings"
	"time"

	"github.com/gogo/protobuf/proto"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/accountutils"
	"berty.tech/berty/v2/go/internal/bertylinks"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/internal/messengerdb"
	"berty.tech/berty/v2/go/internal/messengerpayloads"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

func PushDecryptStandalone(logger *zap.Logger, rootDir string, inputB64 string, ks accountutils.NativeKeystore) (*pushtypes.DecryptedPush, error) {
	input, err := base64.RawURLEncoding.DecodeString(inputB64)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	rawPushData, accountData, err := PushDecrypt(ctx, rootDir, input, &PushDecryptOpts{Logger: logger, Keystore: ks})
	if err != nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(err)
	}

	return PushEnrich(rawPushData, accountData, logger)
}

func PushEnrich(rawPushData *messengertypes.PushReceivedData, accountData *accounttypes.AccountMetadata, logger *zap.Logger) (*pushtypes.DecryptedPush, error) {
	if accountData == nil {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no account metadata specified"))
	}

	link, err := bertylinks.InternalLinkToMessage(accountData.AccountID, rawPushData.Interaction.ConversationPublicKey, rawPushData.Interaction.CID)
	if err != nil {
		logger.Error("unable to create link for interaction", logutil.PrivateString("cid", string(rawPushData.ProtocolData.Message.CID)), zap.Error(err))
		link = bertylinks.LinkInternalPrefix
	}

	d := &pushtypes.DecryptedPush{
		AccountID:               accountData.AccountID,
		AccountName:             accountData.Name,
		ConversationPublicKey:   rawPushData.Interaction.ConversationPublicKey,
		ConversationDisplayName: rawPushData.Interaction.Conversation.DisplayName,
		MemberPublicKey:         rawPushData.Interaction.MemberPublicKey,
		PushType:                pushtypes.DecryptedPush_Unknown,
		PayloadAttrsJSON:        "{}",
		DeepLink:                link,
		AlreadyReceived:         rawPushData.AlreadyReceived,
	}

	if rawPushData.Interaction.Member != nil {
		d.MemberDisplayName = rawPushData.Interaction.Member.DisplayName
	}

	payloadAttrs := map[string]string{}
	switch rawPushData.Interaction.Type {
	case messengertypes.AppMessage_TypeUserMessage:
		m := &messengertypes.AppMessage_UserMessage{}
		err := proto.Unmarshal(rawPushData.Interaction.Payload, m)
		if err != nil {
			logger.Error("unable to unmarshal user message", logutil.PrivateString("cid", string(rawPushData.ProtocolData.Message.CID)), zap.Error(err))
			break
		}

		if l := len(rawPushData.Interaction.Medias); l > 0 {
			switch {
			case !checkAllMediasHaveSameMime(rawPushData.Interaction.Medias):
				d.PushType = pushtypes.DecryptedPush_Media

			case strings.HasSuffix(rawPushData.Interaction.Medias[0].MimeType, "gif"):
				d.PushType = pushtypes.DecryptedPush_Gif

			case strings.HasPrefix(rawPushData.Interaction.Medias[0].MimeType, "image/") || rawPushData.Interaction.Medias[0].MimeType == "image":
				d.PushType = pushtypes.DecryptedPush_Photo

			case strings.HasPrefix(rawPushData.Interaction.Medias[0].MimeType, "audio/") || rawPushData.Interaction.Medias[0].MimeType == "audio":
				d.PushType = pushtypes.DecryptedPush_VoiceMessage

			default:
				d.PushType = pushtypes.DecryptedPush_Media
			}

			payloadAttrs["medias-count"] = fmt.Sprintf("%d", l)
			break
		}

		if m.Body == "" {
			break
		}

		d.PushType = pushtypes.DecryptedPush_Message
		payloadAttrs["message"] = m.Body

	case messengertypes.AppMessage_TypeUserReaction:
		d.PushType = pushtypes.DecryptedPush_Reaction
		r := &messengertypes.AppMessage_UserReaction{}
		err := proto.Unmarshal(rawPushData.Interaction.Payload, r)
		if err != nil {
			logger.Error("unable to unmarshal reaction", logutil.PrivateString("cid", string(rawPushData.ProtocolData.Message.CID)), zap.Error(err))
			break
		}

		payloadAttrs["reaction"] = r.Emoji
		// IDEA: ignore if reaction's targeted message is not send by the user if possible (i.e. not on iOS)

	case messengertypes.AppMessage_TypeGroupInvitation:
		d.PushType = pushtypes.DecryptedPush_GroupInvitation
		invitation := &messengertypes.AppMessage_GroupInvitation{}
		err := proto.Unmarshal(rawPushData.Interaction.Payload, invitation)
		if err != nil {
			logger.Error("unable to unmarshal group invitation", logutil.PrivateString("cid", string(rawPushData.ProtocolData.Message.CID)), zap.Error(err))
			break
		}

		link, err := bertylinks.UnmarshalLink(invitation.Link, nil)
		if err != nil {
			logger.Error("unable to unmarshal group invitation link", logutil.PrivateString("link", invitation.Link), logutil.PrivateString("cid", string(rawPushData.ProtocolData.Message.CID)), zap.Error(err))
			break
		}

		if link.Kind != messengertypes.BertyLink_GroupV1Kind {
			logger.Error("invalid group invitation link received", logutil.PrivateString("cid", string(rawPushData.ProtocolData.Message.CID)), zap.String("link-kind", link.Kind.String()))
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
		logger.Debug("received a push notification for an ack, this should not happen", logutil.PrivateString("cid", rawPushData.Interaction.CID))

	case messengertypes.AppMessage_TypeReplyOptions:
		d.PushType = pushtypes.DecryptedPush_ReplyOptions

	default:
		logger.Debug("unknown message type", zap.String("message-type", rawPushData.Interaction.Type.String()), logutil.PrivateString("cid", rawPushData.Interaction.CID))
	}

	if len(payloadAttrs) > 0 {
		jsoned, err := json.Marshal(payloadAttrs)
		if err == nil {
			d.PayloadAttrsJSON = string(jsoned)
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
		return nil, nil, errcode.ErrPushUnableToDecrypt.Wrap(fmt.Errorf("device has no known push key"))
	}

	accounts, err := accountutils.ListAccounts(ctx, rootDir, opts.Keystore, opts.Logger)
	if err != nil {
		return nil, nil, err
	}

	if len(accounts) == 0 {
		return nil, nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no accounts found"))
	}

	var errs []error

	for _, account := range accounts {
		data, err := func() (*messengertypes.PushReceivedData, error) {
			var reply *messengertypes.PushReceive_Reply

			ignoreAccount := false
			for _, excluded := range opts.ExcludedAccounts {
				if account.AccountID == excluded {
					ignoreAccount = true
					break
				}
			}

			if ignoreAccount {
				return nil, nil
			}

			accountDir, err := accountutils.GetDatastoreDir(accountutils.GetAccountDir(rootDir, account.AccountID))
			if err != nil {
				return nil, err
			}

			var storageKey []byte
			if opts.Keystore != nil {
				if storageKey, err = accountutils.GetOrCreateStorageKeyForAccount(opts.Keystore, account.AccountID); err != nil {
					return nil, err
				}
			}

			var storageSalt []byte
			if opts.Keystore != nil {
				if storageSalt, err = accountutils.GetOrCreateStorageSaltForAccount(opts.Keystore, account.AccountID); err != nil {
					return nil, err
				}
			}

			rootDS, err := accountutils.GetRootDatastoreForPath(accountDir, storageKey, storageSalt, opts.Logger)
			if err != nil {
				return nil, err
			}
			defer rootDS.Close()

			db, dbCleanup, err := accountutils.GetMessengerDBForPath(accountDir, storageKey, opts.Logger)
			if err != nil {
				return nil, err
			}
			defer dbCleanup()

			pushHandler, err := NewPushHandler(&PushHandlerOpts{
				Logger:        opts.Logger,
				RootDatastore: rootDS,
				PushKey:       pushSK,
			})
			if err != nil {
				return nil, errcode.ErrInternal.Wrap(fmt.Errorf("unable to initialize push handler: %w", err))
			}

			evtHandler := messengerpayloads.NewEventHandler(ctx, messengerdb.NewDBWrapper(db, opts.Logger), nil, messengertypes.NewPostActionsServiceNoop(), opts.Logger, nil, false)
			pushReceiver := NewPushReceiver(pushHandler, evtHandler, opts.Logger)

			reply, err = pushReceiver.PushReceive(ctx, input)
			if err != nil {
				opts.Logger.Warn("unable to decrypt push", logutil.PrivateString("account-id", account.AccountID), zap.Error(err))
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
		return nil, nil, errcode.ErrInternal.Wrap(fmt.Errorf("no account can decrypt the received push message"))
	}

	// only returning the first error
	return nil, nil, errcode.ErrPushUnableToDecrypt.Wrap(errs[0])
}

func checkAllMediasHaveSameMime(medias []*messengertypes.Media) bool {
	if len(medias) < 2 {
		return true
	}

	firstType := medias[0].MimeType
	for i := range medias {
		if firstType != medias[i].MimeType {
			return false
		}
	}

	return true
}
