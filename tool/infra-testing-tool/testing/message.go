package testing

import (
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"bytes"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"github.com/golang/protobuf/proto"
	"log"
	"math/rand"
	"sync"
	"time"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"context"
	"io"
)

type MessageHistory struct {
	MessageType messengertypes.AppMessage_Type
	ReceivedAt  time.Time
	Payload     []byte
	PayloadSize int
	PayloadHash string
	PartOfTest 	int // used to keep track of what test message is from
}

func ToMessageHistory(a messengertypes.AppMessage, testn int) MessageHistory {
	return MessageHistory{
		MessageType: a.GetType(),
		ReceivedAt:  time.Now(),
		PayloadHash: asSha256(a.Payload),
		PartOfTest: testn,
		PayloadSize: len(a.Payload),
	}

}

func (p *Peer) SendMessage(groupName string, message string) error {
	payload, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{
		Body: message,
	})
	if err != nil {
		return err
	}

	_, err = p.Messenger.Interact(context.Background(), &messengertypes.Interact_Request{
		Type:                  messengertypes.AppMessage_TypeUserMessage,
		Payload:               payload,
		ConversationPublicKey: base64.RawURLEncoding.EncodeToString(p.Groups[groupName].GetPublicKey()),
	})

	if err != nil {
		return err
	}

	return err
}

func (p *Peer) GetMessageList(groupName string, testn int) error {
	pk := p.Groups[groupName]

	ctx := context.Background()

	var req protocoltypes.GroupMessageList_Request
	// TODO figure out how to not receive duplicate messages

	//if p.lastMessageID[groupName] == nil {
	//	req = protocoltypes.GroupMessageList_Request{GroupPK: pk.PublicKey, UntilNow: true}
	//} else {
	//	req = protocoltypes.GroupMessageList_Request{GroupPK: pk.PublicKey, SinceID: p.lastMessageID[groupName]}
	//}

	req = protocoltypes.GroupMessageList_Request{GroupPK: pk.PublicKey, UntilNow: true}

	cl, err := p.Protocol.GroupMessageList(ctx, &req)
	if err != nil {
		panic(err)
	}

	for {
		evt, err := cl.Recv()
		if err != nil {
			if err != io.EOF {
				return err
			}
			break
		}


		p.Lock.Lock()
		p.lastMessageID[groupName] = evt.EventContext.ID

		p.Lock.Unlock()

		_, am, err := messengertypes.UnmarshalAppMessage(evt.GetMessage())
		if err != nil {
			log.Println(err)
			continue
		}

		switch am.GetType() {
		case messengertypes.AppMessage_TypeAcknowledge:
			if !bytes.Equal(evt.Headers.DevicePK, p.DevicePK) {
				continue
			}

		case messengertypes.AppMessage_TypeUserMessage:
			var isDupe bool
			currentMessage := ToMessageHistory(am, testn)
			wg := sync.WaitGroup{}
			wg.Add(len(p.Messages[groupName]))
			dupeLock := sync.Mutex{}

			for _, message := range p.Messages[groupName] {

				m := message
				go func(wg *sync.WaitGroup) {
					if m.PayloadHash == currentMessage.PayloadHash {
						dupeLock.Lock()
						isDupe = true
						dupeLock.Unlock()
					}
					wg.Done()
				}(&wg)
			}

			wg.Wait()


			p.Lock.Lock()
			if !isDupe {
				p.Messages[groupName] = append(p.Messages[groupName], currentMessage)
			}

			p.Lock.Unlock()
		}
	}

	return nil
}

func (p *Peer) ActivateGroup(groupName string) error {
	pk := p.Groups[groupName].GetPublicKey()

	_, err := p.Protocol.ActivateGroup(context.Background(), &protocoltypes.ActivateGroup_Request{GroupPK: pk})
	return err
}

func (p *Peer) ack(ctx context.Context, evt *protocoltypes.GroupMessageEvent, groupName string) error {
	if p.Groups[groupName].GroupType != protocoltypes.GroupTypeContact {
		return nil
	}

	_, err := p.Messenger.SendAck(ctx, &messengertypes.SendAck_Request{
		GroupPK:   evt.EventContext.GroupPK,
		MessageID: evt.EventContext.ID,
	})

	return err
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

// CountMessages counts the messages in a group that were part of a test
func (p *Peer) CountMessages(groupName string, testn int) (count int) {
	for _, message := range p.Messages[groupName] {
		if message.PartOfTest == testn {
			count += 1
		}
	}

	return count
}

// CountSize returns the average size of messages in a group that were part of a test
func (p *Peer) CountSize(groupName string, testn int) (size int) {
	for _, message := range p.Messages[groupName] {
		if message.PartOfTest == testn {
			size += message.PayloadSize
		}
	}

	return size
}

func asSha256(o interface{}) string {
	h := sha256.New()
	h.Write([]byte(fmt.Sprintf("%v", o)))

	return fmt.Sprintf("%x", h.Sum(nil))
}
