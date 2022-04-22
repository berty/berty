package bertypush

import (
	"encoding/json"
	"fmt"
	"strconv"

	"golang.org/x/text/message"

	"berty.tech/berty/v2/go/pkg/pushtypes"
)

type formatedPayload map[string]string

func (p formatedPayload) get(key string, value *string) error {
	res, ok := p[key]
	if !ok {
		return fmt.Errorf("payload key not found: %s", key)
	}

	*value = res
	return nil
}

func FormatDecryptedPush(decrypted *pushtypes.DecryptedPush, printer *message.Printer) *pushtypes.FormatedPush {
	fmtpush := &pushtypes.FormatedPush{
		PushType: decrypted.PushType,
		DeepLink: decrypted.DeepLink,
	}

	var payload formatedPayload = make(map[string]string)
	_ = json.Unmarshal([]byte(decrypted.PayloadAttrsJSON), &payload)

	fmtpush.Title = decrypted.ConversationDisplayName
	if decrypted.ConversationDisplayName != decrypted.MemberDisplayName {
		fmtpush.Subtitle = decrypted.MemberDisplayName
	}

	var err error
	switch {
	case decrypted.HidePreview:
		fmtpush.Title = printer.Sprintf("push.message.title")
		fmtpush.Subtitle = ""
		fmtpush.Body = ""

	case decrypted.PushType == pushtypes.DecryptedPush_Message:
		var msg string
		if err = payload.get("message", &msg); err != nil {
			break
		}

		fmtpush.Body = msg

	case decrypted.PushType == pushtypes.DecryptedPush_Reaction:
		var emoji string
		if err = payload.get("reaction", &emoji); err != nil {
			emoji = ":)"
		}

		fmtpush.Body = printer.Sprintf("push.reaction.bodyWithDisplayNameAndEmoji", decrypted.MemberDisplayName, emoji)

	case decrypted.PushType == pushtypes.DecryptedPush_Photo, decrypted.PushType == pushtypes.DecryptedPush_Gif, decrypted.PushType == pushtypes.DecryptedPush_VoiceMessage, decrypted.PushType == pushtypes.DecryptedPush_Media:
		formatKeys := map[pushtypes.DecryptedPush_PushType]string{
			pushtypes.DecryptedPush_Photo:        "push.photo.bodyWithNumberOfMedia",
			pushtypes.DecryptedPush_Gif:          "push.gif.bodyWithNumberOfMedia",
			pushtypes.DecryptedPush_VoiceMessage: "push.voiceMessage.bodyWithNumberOfMedia",
			pushtypes.DecryptedPush_Media:        "push.media.bodyWithNumberOfMedia",
		}

		var mediasCount string
		_ = payload.get("medias-count", &mediasCount)

		var c int
		if c, err = strconv.Atoi(mediasCount); err != nil {
			c = 1
		}

		fmtpush.Body = printer.Sprintf(formatKeys[decrypted.PushType], c)

	case decrypted.PushType == pushtypes.DecryptedPush_GroupInvitation:
		var groupName string
		if err = payload.get("group-name", &groupName); err != nil {
			break
		}

		fmtpush.Body = printer.Sprintf("push.groupInvitation.bodyWithGroupName", groupName)

	case
		decrypted.PushType == pushtypes.DecryptedPush_Unknown,
		decrypted.PushType == pushtypes.DecryptedPush_ConversationNameChanged,
		decrypted.PushType == pushtypes.DecryptedPush_MemberNameChanged,
		decrypted.PushType == pushtypes.DecryptedPush_MemberPictureChanged,
		decrypted.PushType == pushtypes.DecryptedPush_MemberDetailsChanged,
		decrypted.PushType == pushtypes.DecryptedPush_ReplyOptions:
		placeHolderMessages := map[pushtypes.DecryptedPush_PushType]string{
			pushtypes.DecryptedPush_Unknown:                 "push.unknown.body",
			pushtypes.DecryptedPush_ConversationNameChanged: "push.conversationNameChanged.body",
			pushtypes.DecryptedPush_MemberNameChanged:       "push.memberNameChanged.body",
			pushtypes.DecryptedPush_MemberPictureChanged:    "push.memberPictureChanged.body",
			pushtypes.DecryptedPush_MemberDetailsChanged:    "push.memberDetailsChanged.body",
			pushtypes.DecryptedPush_ReplyOptions:            "push.replyOptionsOffered.body",
		}

		fmtpush.Body = printer.Sprintf(placeHolderMessages[decrypted.PushType])

	default:
		err = fmt.Errorf(printer.Sprintf("push.unknown.body"))
	}

	if err != nil {
		fmtpush.Title = printer.Sprintf("push.error.title")
		fmtpush.Subtitle = decrypted.PushType.String()
		fmtpush.Body = err.Error()
	}

	fmtpush.Muted = decrypted.AlreadyReceived || decrypted.AccountMuted || decrypted.ConversationMuted

	return fmtpush
}
