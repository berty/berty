package testing

import (
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"bytes"
	"github.com/gogo/protobuf/proto"
	"log"
	"time"

	//"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"context"
	"io"
)

func (p *Peer) SendMessage(groupName string) error {
	protocol := protocoltypes.NewProtocolServiceClient(p.Cc)
	//messenger :=  messengertypes.NewMessengerServiceClient(p.Cc)

	pk := p.Groups[groupName]

	_, err := protocol.AppMessageSend(context.Background(), &protocoltypes.AppMessageSend_Request{
		GroupPK: pk,
		Payload: []byte("hello"),
	})

	return err

}

func (p *Peer) GetMessageList(groupName string) error {
	pk := p.Groups[groupName]

	req := &protocoltypes.GroupMessageList_Request{
		GroupPK:  pk,
		UntilNow: true,
	}

	protocol := protocoltypes.NewProtocolServiceClient(p.Cc)
	cl, err := protocol.GroupMessageList(context.Background(), req)
	if err != nil {
		return err
	}

	for {
		evt, err := cl.Recv()
		if err != nil {
			if err != io.EOF {
				return err
			}
			break
		}

		_, am, err := messengertypes.UnmarshalAppMessage(evt.GetMessage())
		if err != nil {
			log.Println(err)
			continue
		}

		p.Protocol.GroupInfo(context.Background(), &protocoltypes.GroupInfo_Request{})

		switch am.GetType() {
		case messengertypes.AppMessage_TypeAcknowledge:
			if !bytes.Equal(evt.Headers.DevicePK, p.DevicePK) {
				continue
			}
			var payload messengertypes.AppMessage_Acknowledge
			err := proto.Unmarshal(am.GetPayload(), &payload)
			if err != nil {
				return err
			}
			p.Acks.Store(am.TargetCID, true)

		case messengertypes.AppMessage_TypeUserMessage:
			var payload messengertypes.AppMessage_UserMessage
			err := proto.Unmarshal(am.GetPayload(), &payload)
			if err != nil {
				return err
			}

			p.Messages = append(p.Messages, MessageHistory{
				MessageType: uint64(am.GetType()),
				Sender:      evt.Headers.DevicePK,
				ReceivedAt:  time.Time{},
				Payload:     []byte(payload.GetBody()),
			})
			p.ack(context.Background(), evt)
		}
	}

	return nil
}

func (p *Peer) ack(ctx context.Context, evt *protocoltypes.GroupMessageEvent) {
	_, err := p.Messenger.SendAck(ctx, &messengertypes.SendAck_Request{
		GroupPK:   evt.EventContext.GroupPK,
		MessageID: evt.EventContext.ID,
	})
	if err != nil {
		log.Println(err)
	}
}
