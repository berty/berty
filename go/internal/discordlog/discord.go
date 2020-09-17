package discordlog

import (
	"encoding/base64"
	"strings"

	"github.com/itsTurnip/dishooks"
	qrcode "github.com/skip2/go-qrcode"

	"berty.tech/berty/v2/go/pkg/errcode"
)

// rooms are webhook URLs encoded in base64 to prevent most stupid bots to spam our channels.
//
// if we get spammed, then we can think about a better way to store secrets on the repo and in the releases.
const (
	QRCodeRoom = "aHR0cHM6Ly9kaXNjb3JkYXBwLmNvbS9hcGkvd2ViaG9va3MvNzEyNjkwNTc5NTk0ODA1Mzc5L2R2OTFFX0pqM0xkYVdFM2p5N0N1TDAtMmRzQ1NTaE85Q2RGRG05QUhtQThCWFRXS0lEZ29jUFRFRDVyTU5KVlFkcFJ5"
)

const (
	avatarURL = "https://assets.berty.tech/files/developer--berty_developer.png"
)

// ShareQRLink shares a link as a QR Code on discord.
func ShareQRLink(username, room, title, qrData, url string) error {
	clearRoom, err := base64.StdEncoding.DecodeString(room)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	webhook, err := dishooks.WebhookFromURL(string(clearRoom))
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	qr, err := qrcode.New(qrData, qrcode.Medium)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	png, err := qr.PNG(256)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	msg := &dishooks.WebhookMessage{
		AvatarURL: avatarURL,
		Username:  username,
		Content:   title,
		Embeds: []*dishooks.Embed{
			{
				Title:       "Associated Link",
				Description: url,
			},
			/*{
				Title:       "QR Data",
				Description: qrData,
			},*/
		},
	}
	if strings.HasPrefix(url, "http") {
		msg.Embeds[0].URL = url
	}
	_, err = webhook.SendFile(png, "qr.png", msg)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}
	return nil
}
