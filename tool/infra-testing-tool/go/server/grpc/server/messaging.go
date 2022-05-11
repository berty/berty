package server

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"infratesting/logging"
	"math"
	"math/rand"
	"time"

	"berty.tech/berty/v2/go/pkg/messengertypes"

	"github.com/golang/protobuf/proto"
	"github.com/google/uuid"
)

const (
	ErrAlreadyInGroup = "peer already in group"
	ErrNotInGroup     = "peer not in group"
	ErrTestNotExist   = "test does not exist"
	ErrTestInProgress = "test already in progress"

	ErrAlreadyReceiving = "already receiving messages in group"

	RandomChars    = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	ImageSplitSize = 3000
)

var letterRunes = []rune(RandomChars)

type Message struct {
	MessageType messengertypes.AppMessage_Type
	ReceivedAt  time.Time
	Payload     []byte
	PayloadSize int
	PayloadHash string
}

func init() {
	rand.Seed(time.Now().UnixNano())
}

func ToMessage(a messengertypes.AppMessage) Message {
	return Message{
		MessageType: a.GetType(),
		ReceivedAt:  time.Now(),
		PayloadHash: asSha256(a.Payload),
		PayloadSize: len(a.Payload),
	}
}

// SendTextMessage sends a string to a specific group
func (s *Server) SendTextMessage(groupName string, message string) error {
	logging.Log(fmt.Sprintf("sending text message to '%s'", groupName))
	payload, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{
		Body: message,
	})
	if err != nil {
		return err
	}

	logging.Log(fmt.Sprintf("sending message payload: %v", asSha256(payload)))

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

func (s *Server) SendImageMessage(groupName string, content []byte) error {
	logging.Log(fmt.Sprintf("sending image message to %s", groupName))
	ctx := context.Background()

	header := messengertypes.Media{
		MimeType:    "image/png",
		Filename:    fmt.Sprintf("%s.png", uuid.NewString()),
		DisplayName: "random noise",
	}

	cl, err := s.Messenger.MediaPrepare(ctx)
	if err != nil {
		return logging.LogErr(err)
	}

	err = cl.Send(&messengertypes.MediaPrepare_Request{Info: &header})
	if err != nil {
		return logging.LogErr(err)
	}

	if len(content) <= 3500 {
		err = cl.Send(&messengertypes.MediaPrepare_Request{Block: content})
		if err != nil {
			return logging.LogErr(err)
		}
	} else {
		var j int
		for i := 3500; i <= len(content)-1; i += 3500 {
			if i > len(content) {
				i = len(content) - 1
			}

			err = cl.Send(&messengertypes.MediaPrepare_Request{Block: content[j:i]})
			if err != nil {
				return logging.LogErr(err)
			}

			j = i
		}
	}

	if len(content) <= ImageSplitSize {
		err = cl.Send(&messengertypes.MediaPrepare_Request{Block: content})
		if err != nil {
			return logging.LogErr(err)
		}
	} else {
		var i, j int
		i = ImageSplitSize
		for {
			if j == len(content) {
				break
			}

			if i > len(content) {
				i = len(content)
			}

			err = cl.Send(&messengertypes.MediaPrepare_Request{Block: content[j:i]})
			if err != nil {
				return logging.LogErr(err)
			}

			j = i
			i += ImageSplitSize
		}
	}

	reply, err := cl.CloseAndRecv()
	if err != nil {
		return logging.LogErr(err)
	}

	b64CID := reply.GetCid()

	payload, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{})
	interact := &messengertypes.Interact_Request{
		MediaCids:             []string{b64CID},
		Payload:               payload,
		Type:                  messengertypes.AppMessage_TypeUserMessage,
		ConversationPublicKey: base64.RawURLEncoding.EncodeToString(s.Groups[groupName].GetPublicKey()),
	}

	logging.Log(fmt.Sprintf("media message: %+v", interact))

	if err != nil {
		return err
	}

	_, err = s.Messenger.Interact(ctx, interact)
	if err != nil {
		logging.Log("this shouldn't happen, if it doesn't we know somethings wrong here")
		return logging.LogErr(err)
	}

	return nil
}

// ConstructTextMessage constructs a string of a certain size
func ConstructTextMessage(size int) string {
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

// ConstructImageMessage constructs an image of a certain size
func ConstructImageMessage(size int) ([]byte, error) {
	// formula to most accurately approximate size or rectangle PNG consisting of random noise
	height := int(math.Sqrt(float64(size))*1.15) / 2
	width := height

	min := image.Point{X: 0, Y: 0}
	max := image.Point{X: width, Y: height}

	img := image.NewRGBA(image.Rectangle{Min: min, Max: max})
	for x := 0; x < width; x++ {
		for y := 0; y < height; y++ {
			img.Set(x, y, GetRandomColor())
		}
	}

	var b bytes.Buffer
	err := png.Encode(&b, img)
	if err != nil {
		return nil, err
	}

	return b.Bytes(), nil
}

func GetRandomColor() color.RGBA {
	return color.RGBA{R: uint8(rand.Intn(255)), G: uint8(rand.Intn(255)), B: uint8(rand.Intn(255)), A: 0xff}
}
