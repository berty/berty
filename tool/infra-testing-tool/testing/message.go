package testing

import (
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"bytes"
	"encoding/base64"
	"github.com/golang/protobuf/proto"
	"github.com/google/uuid"
	"log"
	"time"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"context"
	"io"
)

type MessageHistory struct {
	MessageType messengertypes.AppMessage_Type
	ReceivedAt  time.Time
	Payload     []byte
}

func ToMessageHistory(a messengertypes.AppMessage, ) MessageHistory {
	return MessageHistory{
		MessageType: a.GetType(),
		ReceivedAt: time.Now(),
		Payload: a.Payload,
	}

}

func (p *Peer) SendMessage(groupName string) error {
	s := uuid.NewString()[:5]

	payload, err := proto.Marshal(&messengertypes.AppMessage_UserMessage{
		Body: s,
	})
	if err != nil {
		return err
	}

	_, err = p.Messenger.Interact(context.Background(), &messengertypes.Interact_Request{
		Type: messengertypes.AppMessage_TypeUserMessage,
		Payload: payload,
		ConversationPublicKey: base64.RawURLEncoding.EncodeToString(p.Groups[groupName].GetPublicKey()),
	})

	if err != nil {
		return err
	}

	return err
}

func (p *Peer) GetMessageList(groupName string) error {
	pk := p.Groups[groupName]

	ctx := context.Background()

	var req protocoltypes.GroupMessageList_Request
	if p.lastMessageID == nil {
		req = protocoltypes.GroupMessageList_Request{GroupPK: pk.PublicKey, UntilNow: true}
	} else {
		req = protocoltypes.GroupMessageList_Request{GroupPK: pk.PublicKey, UntilID: p.lastMessageID}
	}

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
		p.lastMessageID = evt.EventContext.ID

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
			p.Lock.Lock()
			p.Messages = append(p.Messages, ToMessageHistory(am))
			p.Lock.Unlock()
		}
	}

	return nil
}

func (p *Peer) ActivateGroup (groupName string) error {
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
