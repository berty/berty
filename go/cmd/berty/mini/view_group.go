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

	"github.com/gdamore/tcell"
	"github.com/gogo/protobuf/proto"
	"github.com/pkg/errors"
	"github.com/rivo/tview"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/banner"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type groupView struct {
	g            *protocoltypes.Group
	messages     *historyMessageList
	v            *tabbedGroupsView
	inputHistory *inputHistory
	syncMessages chan *historyMessage
	memberPK     []byte
	devicePK     []byte
	acks         sync.Map
	devices      map[string]*protocoltypes.GroupAddMemberDevice
	secrets      map[string]*protocoltypes.GroupAddDeviceSecret
	muAggregates sync.Mutex
	logger       *zap.Logger
	hasNew       int32
	lastSentCID  string
}

func (v *groupView) View() tview.Primitive {
	return v.messages.View()
}

func (v *groupView) commandParser(ctx context.Context, input string) error {
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

				if attrs.cmd == nil {
					return errors.New("not implemented")
				}

				trimmed := strings.TrimPrefix(input, prefix+" ")
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
	v.logger.Debug("onSubmit", logutil.PrivateString("input", input))
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

func newViewGroup(v *tabbedGroupsView, g *protocoltypes.Group, memberPK, devicePK []byte, logger *zap.Logger) *groupView {
	return &groupView{
		memberPK:     memberPK,
		devicePK:     devicePK,
		v:            v,
		g:            g,
		messages:     newHistoryMessageList(v.app),
		syncMessages: make(chan *historyMessage),
		inputHistory: newInputHistory(),
		logger:       logger.With(logutil.PrivateString("group", pkAsShortID(g.PublicKey))),
		devices:      map[string]*protocoltypes.GroupAddMemberDevice{},
		secrets:      map[string]*protocoltypes.GroupAddDeviceSecret{},
	}
}

func (v *groupView) loop(ctx context.Context) {
	var lastMessageID, lastMetadataID []byte

	wg := sync.WaitGroup{}
	wg.Add(3)

	go func() {
		wg.Done()
		for m := range v.syncMessages {
			v.messages.Append(m)
			v.addBadge()
		}
	}()

	// Open group with local only first
	if _, err := v.v.protocol.ActivateGroup(ctx, &protocoltypes.ActivateGroup_Request{
		GroupPK: v.g.PublicKey,
	}); err != nil {
		v.messages.Append(&historyMessage{
			messageType: messageTypeError,
			payload:     []byte(err.Error()),
		})

		return
	}

	// subscribe to group metadata monitor
	{
		req := &protocoltypes.MonitorGroup_Request{GroupPK: v.g.PublicKey}
		cl, err := v.v.protocol.MonitorGroup(ctx, req)
		if err != nil {
			panic(err)
		}

		go func() {
			for {
				res, err := cl.Recv()
				if err != nil {
					if err == io.EOF {
						return
					}

					// @TODO: Log this
					v.syncMessages <- &historyMessage{
						messageType: messageTypeError,
						payload:     []byte(err.Error()),
					}
					continue
				}

				groupMonitorEventHandler(v.logger, v, res.GetEvent())
			}
		}()
	}

	// list group message events
	{
		req := &protocoltypes.GroupMessageList_Request{GroupPK: v.g.PublicKey, UntilNow: true}
		cl, err := v.v.protocol.GroupMessageList(ctx, req)
		if err != nil {
			panic(err)
		}

		for {
			evt, err := cl.Recv()
			if err != nil {
				if err != io.EOF {
					panic(err)
				}
				break
			}
			lastMessageID = evt.EventContext.ID

			amp, am, err := messengertypes.UnmarshalAppMessage(evt.GetMessage())
			if err != nil {
				v.messages.Prepend(&historyMessage{
					messageType: messageTypeMessage,
					payload:     []byte(err.Error()),
					sender:      evt.Headers.DevicePK,
				}, time.Time{})
				continue
			}

			switch am.GetType() {
			case messengertypes.AppMessage_TypeAcknowledge:
				if !bytes.Equal(evt.Headers.DevicePK, v.devicePK) {
					continue
				}
				v.acks.Store(am.TargetCID, true)

			case messengertypes.AppMessage_TypeReplyOptions:
				// TODO:

			case messengertypes.AppMessage_TypeUserMessage:
				payload := amp.(*messengertypes.AppMessage_UserMessage)
				v.messages.Prepend(&historyMessage{
					messageType: messageTypeMessage,
					payload:     []byte(payload.Body),
					sender:      evt.Headers.DevicePK,
					receivedAt:  time.Unix(0, am.GetSentDate()*1000000),
				}, time.Time{})
			}
		}
	}

	// list group metadata events
	{
		req := &protocoltypes.GroupMetadataList_Request{GroupPK: v.g.PublicKey, UntilNow: true}
		cl, err := v.v.protocol.GroupMetadataList(ctx, req)
		if err != nil {
			panic(err)
		}

		for {
			evt, err := cl.Recv()
			if err != nil {
				if err != io.EOF {
					panic(err)
				}
				break
			}

			metadataEventHandler(ctx, v, evt, true, v.logger)
			lastMetadataID = evt.EventContext.ID
		}
	}

	// subscribe to group message events
	{
		var evt *protocoltypes.GroupMessageEvent

		req := &protocoltypes.GroupMessageList_Request{GroupPK: v.g.PublicKey, SinceID: lastMessageID}
		cl, err := v.v.protocol.GroupMessageList(ctx, req)
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
						sender:      nil,
					})
					v.addBadge()
					return
				}

				var am messengertypes.AppMessage
				err := proto.Unmarshal(evt.Message, &am)
				if err != nil {
					v.messages.Append(&historyMessage{
						messageType: messageTypeMessage,
						payload:     []byte(err.Error()),
						sender:      evt.Headers.DevicePK,
					})
					v.addBadge()

					continue
				}

				switch am.GetType() {
				case messengertypes.AppMessage_TypeAcknowledge:
					if !bytes.Equal(evt.Headers.DevicePK, v.devicePK) {
						continue
					}
					var payload messengertypes.AppMessage_Acknowledge
					err := proto.Unmarshal(am.GetPayload(), &payload)
					if err != nil {
						v.logger.Error("failed to unmarshal Acknowledge", zap.Error(err))
					}
					v.acks.Store(am.TargetCID, true)
					continue

				case messengertypes.AppMessage_TypeUserMessage:
					var payload messengertypes.AppMessage_UserMessage
					err := proto.Unmarshal(am.GetPayload(), &payload)
					if err != nil {
						v.logger.Error("failed to unmarshal UserMessage", zap.Error(err))
						continue
					}

					receivedAt := time.Unix(0, am.GetSentDate()*1000000)

					v.messages.Append(&historyMessage{
						messageType: messageTypeMessage,
						payload:     []byte(payload.Body),
						sender:      evt.Headers.DevicePK,
						receivedAt:  receivedAt,
					})
					v.addBadge()

				case messengertypes.AppMessage_TypeReplyOptions:
					var payload messengertypes.AppMessage_ReplyOptions
					err := proto.Unmarshal(am.GetPayload(), &payload)
					if err != nil {
						v.logger.Error("failed to unmarshal ReplyOptions", zap.Error(err))
						continue
					}

					receivedAt := time.Unix(0, am.GetSentDate()*1000000)

					v.messages.Append(&historyMessage{
						messageType: messageTypeMessage,
						payload:     []byte("Response options offered:"),
						sender:      evt.Headers.DevicePK,
						receivedAt:  receivedAt,
					})

					for i, o := range payload.Options {
						v.messages.Append(&historyMessage{
							messageType: messageTypeMessage,
							payload:     []byte(fmt.Sprintf("  - %d: %s ==> %s", i, o.Display, o.Payload)),
							sender:      evt.Headers.DevicePK,
							receivedAt:  receivedAt,
						})
						v.addBadge()
					}
				}
			}
		}()
	}

	// subscribe to group metadata events
	{
		var evt *protocoltypes.GroupMetadataEvent

		req := &protocoltypes.GroupMetadataList_Request{GroupPK: v.g.PublicKey, SinceID: lastMetadataID}
		cl, err := v.v.protocol.GroupMetadataList(ctx, req)
		if err != nil {
			panic(err)
		}

		go func() {
			wg.Done()
			for {
				evt, err = cl.Recv()
				if err != nil {
					if err != io.EOF {
						v.syncMessages <- &historyMessage{
							messageType: messageTypeError,
							payload:     []byte(err.Error()),
						}
					}
					return
				}

				// @TODO: Log this
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
