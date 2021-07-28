package bertyaccount

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

	"berty.tech/berty/v2/go/internal/bertylinks"
	"berty.tech/berty/v2/go/internal/initutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

func PushDecryptStandalone(rootDir string, inputB64 string) (*DecryptedPush, error) {
	input, err := base64.StdEncoding.DecodeString(inputB64)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	logger := zap.NewNop()

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	rawPushData, accountData, err := PushDecrypt(ctx, rootDir, input, logger)
	if err != nil {
		return nil, errcode.ErrPushUnableToDecrypt.Wrap(err)
	}

	link, err := bertylinks.InternalLinkToMessage(accountData.AccountID, rawPushData.Interaction.ConversationPublicKey, rawPushData.Interaction.CID)
	if err != nil {
		logger.Error("unable to create link for interaction", zap.String("cid", string(rawPushData.ProtocolData.Message.CID)), zap.Error(err))
		link = bertylinks.LinkInternalPrefix
	}

	d := &DecryptedPush{
		AccountID:               accountData.AccountID,
		AccountName:             accountData.Name,
		ConversationPublicKey:   rawPushData.Interaction.ConversationPublicKey,
		ConversationDisplayName: rawPushData.Interaction.Conversation.DisplayName,
		MemberPublicKey:         rawPushData.Interaction.MemberPublicKey,
		PushType:                DecryptedPush_Unknown,
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
				d.PushType = DecryptedPush_Media

			case strings.HasSuffix(rawPushData.Interaction.Medias[0].MimeType, "gif"):
				d.PushType = DecryptedPush_Gif

			case strings.HasPrefix(rawPushData.Interaction.Medias[0].MimeType, "image/"):
				d.PushType = DecryptedPush_Photo

			case strings.HasPrefix(rawPushData.Interaction.Medias[0].MimeType, "audio/"):
				d.PushType = DecryptedPush_VoiceMessage

			default:
				d.PushType = DecryptedPush_Media
			}

			payloadAttrs["medias-count"] = fmt.Sprintf("%d", l)
			break
		}

		if m.Body == "" {
			break
		}

		d.PushType = DecryptedPush_Message
		payloadAttrs["message"] = m.Body

	case messengertypes.AppMessage_TypeUserReaction:
		d.PushType = DecryptedPush_Reaction
		r := &messengertypes.AppMessage_UserReaction{}
		err := proto.Unmarshal(rawPushData.Interaction.Payload, r)
		if err != nil {
			logger.Error("unable to unmarshal reaction", zap.String("cid", string(rawPushData.ProtocolData.Message.CID)), zap.Error(err))
			break
		}

		payloadAttrs["reaction"] = r.Emoji
		// IDEA: ignore if reaction's targeted message is not send by the user if possible (i.e. not on iOS)

	case messengertypes.AppMessage_TypeGroupInvitation:
		d.PushType = DecryptedPush_GroupInvitation
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
		d.PushType = DecryptedPush_ConversationNameChanged

	case messengertypes.AppMessage_TypeSetUserInfo:
		// pushType = DecryptedPush_MemberNameChanged
		// pushType = DecryptedPush_MemberPictureChanged
		d.PushType = DecryptedPush_MemberDetailsChanged
		// TODO: get old values

	case messengertypes.AppMessage_TypeAcknowledge:
		logger.Debug("received a push notification for an ack, this should not happen", zap.String("cid", rawPushData.Interaction.CID))

	case messengertypes.AppMessage_TypeReplyOptions:
		d.PushType = DecryptedPush_ReplyOptions

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

func PushDecrypt(ctx context.Context, rootDir string, input []byte, logger *zap.Logger) (*messengertypes.PushReceive_Reply, *AccountMetadata, error) {
	if logger == nil {
		logger = zap.NewNop()
	}

	_, pushSK, err := initutil.GetDevicePushKeyForPath(path.Join(rootDir, initutil.DefaultPushKeyFilename), false)
	if err != nil {
		return nil, nil, errcode.ErrPushUnableToDecrypt.Wrap(fmt.Errorf("device has no known push key"))
	}

	accounts, err := listAccounts(rootDir, logger)
	if err != nil {
		return nil, nil, err
	}

	if len(accounts) == 0 {
		return nil, nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("no accounts found"))
	}

	var errs []error

	for _, account := range accounts {
		var reply *messengertypes.PushReceive_Reply

		accountDir := path.Join(rootDir, account.AccountID)
		pushReceiver, tearDown, err := initutil.GetMessengerPushReceiver(ctx, accountDir, pushSK, logger)
		if err != nil {
			logger.Warn("unable to init push receiver", zap.String("account-id", account.AccountID), zap.Error(err))
			errs = append(errs, err)
			continue
		}

		reply, err = pushReceiver.PushReceive(ctx, input)
		if err != nil {
			tearDown()
			logger.Warn("unable to decrypt push", zap.String("account-id", account.AccountID), zap.Error(err))
			errs = append(errs, err)
			continue
		}

		tearDown()
		return reply, account, nil
	}

	if len(errs) == 0 {
		return nil, nil, errcode.ErrInternal.Wrap(fmt.Errorf("this should not occur"))
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
