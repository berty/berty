package daemon

import (
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"github.com/golang/protobuf/proto"
	"math/rand"
	"time"
)

const (
	ErrAlreadyInGroup = "peer already in group"
	ErrNotInGroup = "peer not in group"
	ErrTestNotExist = "test does not exist"
	ErrTestInProgress = "test already in progress"

	ErrAlreadyReceiving = "already receiving messages in group"
)

func (s *Server) SendMessage(groupName string, message string) error {
	payload, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{
		Body: message,
	})
	if err != nil {
		return err
	}

	_, err = s.Messenger.Interact(context.Background(), &messengertypes.Interact_Request{
		Type:                  messengertypes.AppMessage_TypeUserMessage,
		Payload:               payload,
		ConversationPublicKey: base64.RawURLEncoding.EncodeToString(s.Groups[groupName].GetPublicKey()),
	})

	if err != nil {
		return err
	}


	return err
}

type Message struct {
	MessageType messengertypes.AppMessage_Type
	ReceivedAt  time.Time
	Payload     []byte
	PayloadSize int
	PayloadHash string
}

func ToMessage(a messengertypes.AppMessage) Message {
	return Message{
		MessageType: a.GetType(),
		ReceivedAt:  time.Now(),
		PayloadHash: asSha256(a.Payload),
		PayloadSize: len(a.Payload),
	}

}

// ConstructMessage constructs a string of a certain size
func ConstructMessage(size int) string{
	var letterRunes = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

	b := make([]rune, size)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}

func asSha256(o interface{}) string {
	h := sha256.New()
	h.Write([]byte(fmt.Sprintf("%v", o)))

	return fmt.Sprintf("%x", h.Sum(nil))
}
