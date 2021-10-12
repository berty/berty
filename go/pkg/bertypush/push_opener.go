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
	"berty.tech/berty/v2/go/internal/messengerdb"
	"berty.tech/berty/v2/go/internal/messengerpayloads"
	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
)

func PushDecryptStandalone(rootDir string, inputB64 string, storageKey []byte) (*pushtypes.DecryptedPush, error) {
	input, err := base64.StdEncoding.DecodeString(inputB64)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	logger := zap.NewNop()

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	rawPushData, accountData, err := PushDecrypt(ctx, rootDir, input, &PushDecryptOpts{Logger: logger, StorageKey: storageKey})
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
		logger.Error("unable to create link for interaction", zap.String("cid", string(rawPushData.ProtocolData.Message.CID)), zap.Error(err))
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
			logger.Error("unable to unmarshal user message", zap.String("cid", string(rawPushData.ProtocolData.Message.CID)), zap.Error(err))
			break
		}

		if l := len(rawPushData.Interaction.Medias); l > 0 {
			switch {
			case !checkAllMediasHaveSameMime(rawPushData.Interaction.Medias):
				d.PushType = pushtypes.DecryptedPush_Media

			case strings.HasSuffix(rawPushData.Interaction.Medias[0].MimeType, "gif"):
				d.PushType = pushtypes.DecryptedPush_Gif

			case strings.HasPrefix(rawPushData.Interaction.Medias[0].MimeType, "image/"):
				d.PushType = pushtypes.DecryptedPush_Photo

			case strings.HasPrefix(rawPushData.Interaction.Medias[0].MimeType, "audio/"):
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
			logger.Error("unable to unmarshal reaction", zap.String("cid", string(rawPushData.ProtocolData.Message.CID)), zap.Error(err))
			break
		}

		payloadAttrs["reaction"] = r.Emoji
		// IDEA: ignore if reaction's targeted message is not send by the user if possible (i.e. not on iOS)

	case messengertypes.AppMessage_TypeGroupInvitation:
		d.PushType = pushtypes.DecryptedPush_GroupInvitation
		invitation := &messengertypes.AppMessage_GroupInvitation{}
		err := proto.Unmarshal(rawPushData.Interaction.Payload, invitation)
		if err != nil {
			logger.Error("unable to unmarshal group invitation", zap.String("cid", string(rawPushData.ProtocolData.Message.CID)), zap.Error(err))
			break
		}

		link, err := bertylinks.UnmarshalLink(invitation.Link, nil)
		if err != nil {
			logger.Error("unable to unmarshal group invitation link", zap.String("cid", string(rawPushData.ProtocolData.Message.CID)), zap.Error(err))
			break
		}

		if link.Kind != messengertypes.BertyLink_GroupV1Kind {
			logger.Error("invalid group invitation link received", zap.String("cid", string(rawPushData.ProtocolData.Message.CID)), zap.String("link-kind", link.Kind.String()))
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
		logger.Debug("received a push notification for an ack, this should not happen", zap.String("cid", rawPushData.Interaction.CID))

	case messengertypes.AppMessage_TypeReplyOptions:
		d.PushType = pushtypes.DecryptedPush_ReplyOptions

	default:
		logger.Debug("unknown message type", zap.String("message-type", rawPushData.Interaction.Type.String()), zap.String("cid", rawPushData.Interaction.CID))
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
	StorageKey       []byte
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

	accounts, err := accountutils.ListAccounts(rootDir, opts.Logger)
	if err != nil {
		return nil, nil, err
	}

	if len(accounts) == 0 {
		return nil, nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no accounts found"))
	}

	var errs []error

	for _, account := range accounts {
		var reply *messengertypes.PushReceive_Reply

		ignoreAccount := false
		for _, excluded := range opts.ExcludedAccounts {
			if account.AccountID == excluded {
				ignoreAccount = true
				break
			}
		}

		if ignoreAccount {
			continue
		}

		accountDir, err := accountutils.GetDatastoreDir(path.Join(rootDir, account.AccountID))
		if err != nil {
			errs = append(errs, err)
			continue
		}

		rootDS, err := accountutils.GetRootDatastoreForPath(accountDir, opts.StorageKey, opts.Logger)
		if err != nil {
			errs = append(errs, err)
			continue
		}

		db, dbCleanup, err := accountutils.GetMessengerDBForPath(accountDir, opts.Logger)
		if err != nil {
			errs = append(errs, err)
			rootDS.Close()
			continue
		}

		pushHandler, err := NewPushHandler(&PushHandlerOpts{
			Logger:        opts.Logger,
			RootDatastore: rootDS,
			PushKey:       pushSK,
		})
		if err != nil {
			return nil, nil, errcode.ErrInternal.Wrap(fmt.Errorf("unable to initialize push handler: %w", err))
		}

		evtHandler := messengerpayloads.NewEventHandler(ctx, messengerdb.NewDBWrapper(db, opts.Logger), nil, messengertypes.NewPostActionsServiceNoop(), opts.Logger, nil, false)
		pushReceiver := NewPushReceiver(pushHandler, evtHandler, opts.Logger)

		reply, err = pushReceiver.PushReceive(ctx, input)
		if err != nil {
			dbCleanup()
			rootDS.Close()
			opts.Logger.Warn("unable to decrypt push", zap.String("account-id", account.AccountID), zap.Error(err))
			errs = append(errs, err)
			continue
		}

		dbCleanup()
		rootDS.Close()
		return reply.Data, account, nil
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
