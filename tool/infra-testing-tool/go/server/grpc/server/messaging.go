package server

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"math"
	"math/rand"
	"time"

	"berty.tech/berty/v2/go/pkg/messengertypes"
	"go.uber.org/zap"

	"github.com/golang/protobuf/proto"
	"github.com/google/uuid"
)

var (
	ErrAlreadyInGroup   = errors.New("peer already in group")
	ErrNotInGroup       = errors.New("peer not in group")
	ErrTestNotExist     = errors.New("test does not exist")
	ErrTestInProgress   = errors.New("test already in progress")
	ErrAlreadyReceiving = errors.New("already receiving messages in group")
)

const (
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
func (s *Server) SendTextMessage(ctx context.Context, groupName string, message string) error {
	s.logger.Debug("sending text message to", zap.String("group_name", groupName))
	payload, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{
		Body: message,
	})
	if err != nil {
		return err
	}

	s.logger.Debug("sending message payload", zap.Any("payload", asSha256(payload)))

	_, err = s.Messenger.Interact(ctx, &messengertypes.Interact_Request{
		Type:                  messengertypes.AppMessage_TypeUserMessage,
		Payload:               payload,
		ConversationPublicKey: base64.RawURLEncoding.EncodeToString(s.Groups[groupName].GetPublicKey()),
	})

	if err != nil {
		return fmt.Errorf("unable to interact: %w", err)
	}

	return err
}

func (s *Server) SendImageMessage(ctx context.Context, groupName string, content []byte) error {
	s.logger.Debug("sending image message to", zap.String("group_name", groupName))

	header := messengertypes.Media{
		MimeType:    "image/png",
		Filename:    fmt.Sprintf("%s.png", uuid.NewString()),
		DisplayName: "random noise",
	}

	cl, err := s.Messenger.MediaPrepare(ctx)
	if err != nil {
		return fmt.Errorf("unable to prepare media: %w", err)
	}

	err = cl.Send(&messengertypes.MediaPrepare_Request{Info: &header})
	if err != nil {
		return fmt.Errorf("unable to send media info: %w", err)
	}

	if len(content) <= 3500 {
		err = cl.Send(&messengertypes.MediaPrepare_Request{Block: content})
		if err != nil {
			return fmt.Errorf("unable to send media block: %w", err)
		}
	} else {
		var j int
		for i := 3500; i <= len(content)-1; i += 3500 {
			if i > len(content) {
				i = len(content) - 1
			}

			err = cl.Send(&messengertypes.MediaPrepare_Request{Block: content[j:i]})
			if err != nil {
				return fmt.Errorf("unable to send media block: %w", err)
			}

			j = i
		}
	}

	if len(content) <= ImageSplitSize {
		err = cl.Send(&messengertypes.MediaPrepare_Request{Block: content})
		if err != nil {
			return fmt.Errorf("unable to send media block: %w", err)
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
				return fmt.Errorf("unable to send media block: %w", err)
			}

			j = i
			i += ImageSplitSize
		}
	}

	reply, err := cl.CloseAndRecv()
	if err != nil {
		return fmt.Errorf("unable to close stream: %w", err)
	}

	b64CID := reply.GetCid()

	payload, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{})
	interact := &messengertypes.Interact_Request{
		MediaCids:             []string{b64CID},
		Payload:               payload,
		Type:                  messengertypes.AppMessage_TypeUserMessage,
		ConversationPublicKey: base64.RawURLEncoding.EncodeToString(s.Groups[groupName].GetPublicKey()),
	}

	s.logger.Debug("media message", zap.Any("interaction", interact))

	if err != nil {
		return err
	}

	_, err = s.Messenger.Interact(ctx, interact)
	if err != nil {
		s.logger.Debug("unable to interact", zap.Error(err))
		s.logger.Debug("this shouldn't happen, if it doesn't we know somethings wrong here")
		return fmt.Errorf("unable to interact: %w", err)
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
