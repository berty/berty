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

	var err error
	switch decrypted.PushType {
	case pushtypes.DecryptedPush_Message:
		var msg string
		if err = payload.get("message", &msg); err != nil {
			break
		}

		fmtpush.Title = decrypted.MemberDisplayName
		fmtpush.Subtitle = ""
		fmtpush.Body = msg

	case pushtypes.DecryptedPush_Reaction:
		var emoji string
		if err = payload.get("reaction", &emoji); err != nil {
			emoji = ":)"
		}

		fmtpush.Title = decrypted.MemberDisplayName
		fmtpush.Subtitle = ""
		fmtpush.Body = printer.Sprintf("push.reaction.bodyWithDisplayNameAndEmoji", decrypted.MemberDisplayName, emoji)

	case pushtypes.DecryptedPush_VoiceMessage:
		var mediasCount string
		_ = payload.get("medias-count", &mediasCount)

		var c int
		if c, err = strconv.Atoi(mediasCount); err != nil {
			c = 1
		}

		fmtpush.Title = decrypted.MemberDisplayName
		fmtpush.Subtitle = ""
		fmtpush.Body = printer.Sprintf("push.voiceMessage.bodyWithNumberOfMedia", c)

	case pushtypes.DecryptedPush_Photo:
		var mediasCount string
		_ = payload.get("medias-count", &mediasCount)

		var c int
		if c, err = strconv.Atoi(mediasCount); err != nil {
			c = 1
		}

		fmtpush.Title = decrypted.MemberDisplayName
		fmtpush.Subtitle = ""
		fmtpush.Body = printer.Sprintf("push.photo.bodyWithNumberOfMedia", c)

	case pushtypes.DecryptedPush_Gif:
		var mediasCount string
		_ = payload.get("medias-count", &mediasCount)

		var c int
		if c, err = strconv.Atoi(mediasCount); err != nil {
			c = 1
		}

		fmtpush.Title = decrypted.MemberDisplayName
		fmtpush.Subtitle = ""
		fmtpush.Body = printer.Sprintf("push.gif.bodyWithNumberOfMedia", c)

	case pushtypes.DecryptedPush_GroupInvitation:
		var groupName string
		if err = payload.get("group-name", &groupName); err != nil {
			break
		}

		fmtpush.Title = decrypted.MemberDisplayName
		fmtpush.Subtitle = ""
		fmtpush.Body = printer.Sprintf("push.groupInvitation.bodyWithGroupName", groupName)

	// @FIXME(gfanton): not handled (yet)
	// case pushtypes.DecryptedPush_MemberDetailsChanged:
	// case pushtypes.DecryptedPush_MemberNameChanged:
	// case pushtypes.DecryptedPush_MemberPictureChanged:
	default:
		err = fmt.Errorf("unknown push type")
	}

	if err != nil {
		fmtpush.Title = printer.Sprintf("push.error.title")
		fmtpush.Subtitle = decrypted.PushType.String()
		fmtpush.Body = err.Error()
	}

	return fmtpush
}
