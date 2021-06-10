package testing

import (
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"bytes"
	"encoding/base64"
	"fmt"
	"github.com/golang/protobuf/proto"
	"github.com/google/uuid"
	"log"
	//"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"context"
	"io"
)

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

	fmt.Println("sent: " + s)

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

		amp, am, err := messengertypes.UnmarshalAppMessage(evt.GetMessage())
		if err != nil {
			log.Println(err)
			continue
		}

		switch am.GetType() {
		case messengertypes.AppMessage_TypeAcknowledge:
			if !bytes.Equal(evt.Headers.DevicePK, p.DevicePK) {
				continue
			}
			log.Println("new ack")

		case messengertypes.AppMessage_TypeUserMessage:
			payload := amp.(*messengertypes.AppMessage_UserMessage)
			fmt.Println(payload.Body)
		}
	}

	return nil
}

func (p *Peer) ActivateGroup (groupName string) error {
	pk := p.Groups[groupName].GetPublicKey()

	_, err := p.Protocol.ActivateGroup(context.Background(), &protocoltypes.ActivateGroup_Request{GroupPK: pk})
	return err
}


func (p *Peer) ack(ctx context.Context, evt *protocoltypes.GroupMessageEvent, groupName string) {
	if p.Groups[groupName].GroupType != protocoltypes.GroupTypeContact {
		return
	}

	_, err := p.Messenger.SendAck(ctx, &messengertypes.SendAck_Request{
		GroupPK:   evt.EventContext.GroupPK,
		MessageID: evt.EventContext.ID,
	})
	if err != nil {
		log.Println(err)
	}
}
