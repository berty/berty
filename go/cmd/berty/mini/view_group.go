package mini

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"strings"
	"sync"
	"time"

	"berty.tech/berty/v2/go/internal/tracer"
	"berty.tech/berty/v2/go/pkg/banner"
	"berty.tech/berty/v2/go/pkg/bertymessenger"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/gdamore/tcell"
	"github.com/pkg/errors"
	"github.com/rivo/tview"
	"go.opentelemetry.io/otel/api/kv"
	"go.opentelemetry.io/otel/api/trace"
	"go.uber.org/zap"
)

type groupView struct {
	g            *bertytypes.Group
	messages     *historyMessageList
	v            *tabbedGroupsView
	inputHistory *inputHistory
	syncMessages chan *historyMessage
	memberPK     []byte
	devicePK     []byte
	acks         sync.Map
	devices      map[string]*bertytypes.GroupAddMemberDevice
	secrets      map[string]*bertytypes.GroupAddDeviceSecret
	muAggregates sync.Mutex
	logger       *zap.Logger
	hasNew       int32
}

func (v *groupView) View() tview.Primitive {
	return v.messages.View()
}

func (v *groupView) commandParser(ctx context.Context, input string) error {
	tr := tracer.New("command")
	input = strings.TrimSpace(input)

	if len(input) > 0 && input[0] == '/' {
		for _, attrs := range commandList() {
			if prefix := fmt.Sprintf("/%s", attrs.title); strings.HasPrefix(strings.ToLower(input), prefix) {
				if !attrs.hideInLog {
					v.syncMessages <- &historyMessage{
						messageType: messageTypeMessage,
						payload:     []byte(input),
					}
				}

				ctx, span := tr.Start(ctx, attrs.title, trace.WithAttributes(kv.String("input", input)))
				defer span.End()

				if attrs.cmd == nil {
					return errors.New("not implemented")
				}

				trimmed := strings.TrimPrefix(input, prefix+" ")
				span.SetAttribute("args", trimmed)
				return attrs.cmd(ctx, v, trimmed)
			}
		}

		v.syncMessages <- &historyMessage{
			messageType: messageTypeError,
			payload:     []byte(input),
		}
		return fmt.Errorf("command not found, start with // to send a message beginning with a slash")
	}

	return newMessageCommand(ctx, v, input)
}

func (v *groupView) OnSubmit(ctx context.Context, input string) {
	v.logger.Debug("onSubmit", zap.String("input", input))
	v.messages.View().ScrollToEnd()

	if err := v.commandParser(ctx, input); err != nil {
		v.logger.Debug("onSubmit error", zap.Error(err))
		v.syncMessages <- &historyMessage{
			messageType: messageTypeError,
			payload:     []byte(fmt.Sprintf("out: %s", err.Error())),
		}
	}

	v.inputHistory.Append(input)
}

func newViewGroup(v *tabbedGroupsView, g *bertytypes.Group, memberPK, devicePK []byte, logger *zap.Logger) *groupView {
	return &groupView{
		memberPK:     memberPK,
		devicePK:     devicePK,
		v:            v,
		g:            g,
		messages:     newHistoryMessageList(v.app),
		syncMessages: make(chan *historyMessage),
		inputHistory: newInputHistory(),
		logger:       logger.With(zap.String("group", pkAsShortID(g.PublicKey))),
		devices:      map[string]*bertytypes.GroupAddMemberDevice{},
		secrets:      map[string]*bertytypes.GroupAddDeviceSecret{},
	}
}

func (v *groupView) ack(ctx context.Context, evt *bertytypes.GroupMessageEvent) {
	if v.g.GroupType != bertytypes.GroupTypeContact {
		return
	}

	_, err := v.v.messenger.SendAck(ctx, &bertymessenger.SendAck_Request{
		GroupPK:   evt.EventContext.GroupPK,
		MessageID: evt.EventContext.ID,
	})

	if err != nil {
		v.messages.AppendErr(fmt.Errorf("error while sending ack: %s", err.Error()))
		v.addBadge()
	}
}

func (v *groupView) loop(ctx context.Context) {
	wg := sync.WaitGroup{}
	wg.Add(3)

	go func() {
		wg.Done()
		for m := range v.syncMessages {
			v.messages.Append(m)
			v.addBadge()
		}
	}()

	// list group message events
	{
		var evt *bertytypes.GroupMessageEvent

		req := &bertytypes.GroupMessageList_Request{GroupPK: v.g.PublicKey}
		cl, err := v.v.client.GroupMessageList(ctx, req)
		for err == nil {
			if evt, err = cl.Recv(); err == nil {
				payload, err := payloadParser(evt.Message)
				if err != nil {
					v.messages.Prepend(&historyMessage{
						messageType: messageTypeMessage,
						payload:     []byte(err.Error()),
						sender:      evt.Headers.DevicePK,
					}, time.Time{})

					continue
				}

				switch payload.GetType() {
				case bertymessenger.AppMessageType_Acknowledge:
					if !bytes.Equal(evt.Headers.DevicePK, v.devicePK) {
						continue
					}

					v.acks.Store(payload.(*bertymessenger.PayloadAcknowledge).Target, true)

				case bertymessenger.AppMessageType_UserMessage:
					receivedAt := time.Unix(0, payload.(*bertymessenger.PayloadUserMessage).SentDate*1000000)

					v.messages.Prepend(&historyMessage{
						messageType: messageTypeMessage,
						payload:     []byte(payload.(*bertymessenger.PayloadUserMessage).Body),
						sender:      evt.Headers.DevicePK,
						receivedAt:  receivedAt,
					}, time.Time{})

					v.ack(ctx, evt)
				}
			}
		}

		if err != io.EOF {
			panic(err)
		}
	}

	// list group metadata events
	{
		var evt *bertytypes.GroupMetadataEvent

		req := &bertytypes.GroupMetadataList_Request{GroupPK: v.g.PublicKey}
		cl, err := v.v.client.GroupMetadataList(ctx, req)
		for err == nil {
			if evt, err = cl.Recv(); err == nil {
				metadataEventHandler(ctx, v, evt, true, v.logger)
			}
		}

		if err != io.EOF {
			panic(err)
		}
	}

	// subscribe to group message events
	{
		var evt *bertytypes.GroupMessageEvent

		req := &bertytypes.GroupMessageSubscribe_Request{GroupPK: v.g.PublicKey}
		cl, err := v.v.client.GroupMessageSubscribe(ctx, req)
		if err != nil {
			panic(err)
		}

		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte("start group message subscribe"),
		})

		go func() {
			wg.Done()
			for {
				evt, err = cl.Recv()
				if err == io.EOF {
					return
				} else if err != nil {
					v.messages.Append(&historyMessage{
						messageType: messageTypeMessage,
						payload:     []byte(err.Error()),
						sender:      evt.Headers.DevicePK,
					})
					v.addBadge()
					return
				}

				payload, err := payloadParser(evt.Message)
				if err != nil {
					v.messages.Append(&historyMessage{
						messageType: messageTypeMessage,
						payload:     []byte(err.Error()),
						sender:      evt.Headers.DevicePK,
					})
					v.addBadge()

					continue
				}

				switch payload.GetType() {
				case bertymessenger.AppMessageType_Acknowledge:
					if !bytes.Equal(evt.Headers.DevicePK, v.devicePK) {
						continue
					}

					v.acks.Store(payload.(*bertymessenger.PayloadAcknowledge).Target, true)
					continue

				case bertymessenger.AppMessageType_UserMessage:
					receivedAt := time.Unix(0, payload.(*bertymessenger.PayloadUserMessage).SentDate*1000000)

					v.messages.Append(&historyMessage{
						messageType: messageTypeMessage,
						payload:     []byte(payload.(*bertymessenger.PayloadUserMessage).Body),
						sender:      evt.Headers.DevicePK,
						receivedAt:  receivedAt,
					})
					v.addBadge()

					v.ack(ctx, evt)
				}
			}
		}()
	}

	// subscribe to group metadata events
	{
		var evt *bertytypes.GroupMetadataEvent

		req := &bertytypes.GroupMetadataSubscribe_Request{GroupPK: v.g.PublicKey}
		cl, err := v.v.client.GroupMetadataSubscribe(ctx, req)
		if err != nil {
			panic(err)
		}

		go func() {
			wg.Done()
			for {
				evt, err = cl.Recv()
				if err != nil {
					// @TODO: Log this
					return
				}

				metadataEventHandler(ctx, v, evt, false, v.logger)
			}
		}()
	}

	wg.Wait()
}

func (v *groupView) welcomeEventDisplay() {
	bannerLines := strings.Split(banner.OfTheDay(), "\n")
	v.messages.lock.Lock()
	for i := range bannerLines {
		v.messages.historyScroll.InsertRow(0)
		v.messages.historyScroll.SetCellSimple(0, 2, bannerLines[len(bannerLines)-i-1])
		v.messages.historyScroll.GetCell(0, 2).SetTextColor(tcell.ColorOrange)
	}
	v.messages.lock.Unlock()
	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte("type /help for available commands"),
	})

	v.welcomeGroupEventDisplay()
}

func (v *groupView) ScrollToOffset(i int) {
	maxR := v.messages.historyScroll.GetRowCount()
	r, c := v.messages.historyScroll.GetOffset()

	if r+i >= maxR {
		v.messages.historyScroll.ScrollToEnd()
		return
	} else if r+i < 0 {
		v.messages.historyScroll.ScrollToBeginning()
		return
	}

	v.messages.historyScroll.SetOffset(r+i, c)
}

func (v *groupView) welcomeGroupEventDisplay() {
	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		sender:      v.devicePK,
		payload:     []byte(fmt.Sprintf("own member id: %s (%s)", base64.StdEncoding.EncodeToString(v.memberPK), pkAsShortID(v.memberPK))),
	})
}
