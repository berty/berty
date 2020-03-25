package mini

import (
	"context"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	"github.com/gdamore/tcell"
	"github.com/pkg/errors"
	"github.com/rivo/tview"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"

	"berty.tech/berty/go/pkg/bertyprotocol"
)

type groupView struct {
	g            *bertyprotocol.Group
	messages     *historyMessageList
	v            *tabbedGroupsView
	inputHistory *inputHistory
	syncMessages chan *historyMessage
	memberPK     []byte
	devicePK     []byte
}

func (v *groupView) View() tview.Primitive {
	return v.messages.View()
}

func (v *groupView) commandParser(ctx context.Context, input string) error {
	if len(input) > 0 && input[0] == '/' {
		for _, attrs := range commandList() {
			if prefix := fmt.Sprintf("/%s", attrs.title); strings.HasPrefix(strings.ToLower(input), prefix) {
				if attrs.cmd == nil {
					return errors.New("not implemented")
				}

				trimmed := strings.TrimPrefix(input, prefix+" ")

				return attrs.cmd(ctx, v, trimmed)
			}
		}

		return errors.New(fmt.Sprintf("command not found, start with // to send a message beginning with a slash"))
	}

	return newMessageCommand(ctx, v, input)
}

func (v *groupView) OnSubmit(ctx context.Context, msg string) {
	v.messages.View().ScrollToEnd()

	if err := v.commandParser(ctx, msg); err != nil {
		v.syncMessages <- &historyMessage{
			messageType: messageTypeError,
			payload:     []byte(fmt.Sprintf("out: %s", err.Error())),
		}
	}

	v.inputHistory.Append(msg)
}

type fakeServerStream struct {
	context context.Context
}

func (f *fakeServerStream) SetHeader(metadata.MD) error {
	panic("implement me")
}

func (f *fakeServerStream) SendHeader(metadata.MD) error {
	panic("implement me")
}

func (f *fakeServerStream) SetTrailer(metadata.MD) {
	panic("implement me")
}

func (f *fakeServerStream) Context() context.Context {
	return f.context
}

func (f *fakeServerStream) SendMsg(m interface{}) error {
	panic("implement me")
}

func (f *fakeServerStream) RecvMsg(m interface{}) error {
	panic("implement me")
}

var _ grpc.ServerStream = (*fakeServerStream)(nil)

type protocolServiceGroupMessage struct {
	*fakeServerStream
	ch chan *bertyprotocol.GroupMessageEvent
}

func (x *protocolServiceGroupMessage) Send(m *bertyprotocol.GroupMessageEvent) error {
	x.ch <- m
	return nil
}

func newProtocolServiceGroupMessage(ctx context.Context) (chan *bertyprotocol.GroupMessageEvent, *protocolServiceGroupMessage) {
	ch := make(chan *bertyprotocol.GroupMessageEvent)

	return ch, &protocolServiceGroupMessage{
		fakeServerStream: &fakeServerStream{
			context: ctx,
		},
		ch: ch,
	}
}

type protocolServiceGroupMetadata struct {
	*fakeServerStream
	ch chan *bertyprotocol.GroupMetadataEvent
}

func (x *protocolServiceGroupMetadata) Send(m *bertyprotocol.GroupMetadataEvent) error {
	x.ch <- m
	return nil
}

func newProtocolServiceGroupMetadata(ctx context.Context) (chan *bertyprotocol.GroupMetadataEvent, *protocolServiceGroupMetadata) {
	ch := make(chan *bertyprotocol.GroupMetadataEvent)

	return ch, &protocolServiceGroupMetadata{
		fakeServerStream: &fakeServerStream{
			context: ctx,
		},
		ch: ch,
	}
}

func newViewGroup(v *tabbedGroupsView, g *bertyprotocol.Group, memberPK, devicePK []byte) *groupView {
	return &groupView{
		memberPK:     memberPK,
		devicePK:     devicePK,
		v:            v,
		g:            g,
		messages:     newHistoryMessageList(v.app),
		syncMessages: make(chan *historyMessage),
		inputHistory: newInputHistory(),
	}
}

func (v *groupView) loop(ctx context.Context) {
	go func() {
		for m := range v.syncMessages {
			v.messages.Append(m)
		}
	}()

	// Replay message history
	msgs, srvListMessages := newProtocolServiceGroupMessage(ctx)
	go func() {
		for evt := range msgs {
			v.messages.Prepend(&historyMessage{
				messageType: messageTypeMessage,
				payload:     evt.Message,
				sender:      evt.Headers.DevicePK,
			}, time.Time{})
		}
	}()

	if err := v.v.client.GroupMessageList(&bertyprotocol.GroupMessageList_Request{GroupPK: v.g.PublicKey}, srvListMessages); err != nil {
		panic(err)
	}
	close(msgs)

	metas, srvListMetadatas := newProtocolServiceGroupMetadata(ctx)
	go func() {
		// List existing members of the group
		for e := range metas {
			// _ = e
			metadataEventHandler(ctx, v, e, true)
		}
	}()

	if err := v.v.client.GroupMetadataList(&bertyprotocol.GroupMetadataList_Request{GroupPK: v.g.PublicKey}, srvListMetadatas); err != nil {
		panic(err)
	}
	close(metas)

	// Watch for incoming new messages
	go func() {
		msgs, srvListMessages := newProtocolServiceGroupMessage(ctx)
		go func() {
			for evt := range msgs {
				v.messages.Append(&historyMessage{
					messageType: messageTypeMessage,
					payload:     evt.Message,
					sender:      evt.Headers.DevicePK,
				})
			}
		}()

		err := v.v.client.GroupMessageSubscribe(&bertyprotocol.GroupMessageSubscribe_Request{GroupPK: v.g.PublicKey}, srvListMessages)
		if err != nil {
			panic(err)
		}

		close(msgs)
	}()

	// Watch for new incoming metadata
	go func() {
		metas, srvListMetadatas := newProtocolServiceGroupMetadata(ctx)
		go func() {
			for e := range metas {
				metadataEventHandler(ctx, v, e, false)
			}
		}()

		err := v.v.client.GroupMetadataSubscribe(&bertyprotocol.GroupMetadataSubscribe_Request{GroupPK: v.g.PublicKey}, srvListMetadatas)
		if err != nil {
			panic(err)
		}

		close(metas)
	}()
}

func (v *groupView) welcomeEventDisplay(ctx context.Context) {
	config, err := v.v.client.InstanceGetConfiguration(ctx, nil)
	if err != nil {
		panic(err)
	}

	b := `
          /\
     /\  / /\  ______
    / /\/ /  \/  |   \
   | |  \/   | ()|    |
    \ \      |   |____|
     \ \      \____/ __           __
      \/       /    / /  ___ ____/ /___ __
      /     __/    / _ \/ -_) __/ __/ // /
     /_____/      /____/\__/_/  \__/\__ /
    /__/                           /___/
`

	bannerLines := strings.Split(b, "\n")
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

	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		payload:     []byte(fmt.Sprintf("peerid: %s", config.PeerID)),
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
