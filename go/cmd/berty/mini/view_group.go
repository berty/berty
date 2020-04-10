package mini

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"strings"
	"sync"
	"time"

	"berty.tech/berty/v2/go/pkg/banner"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/gdamore/tcell"
	"github.com/pkg/errors"
	"github.com/rivo/tview"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

type groupView struct {
	g            *bertytypes.Group
	messages     *historyMessageList
	v            *tabbedGroupsView
	inputHistory *inputHistory
	syncMessages chan *historyMessage
	memberPK     []byte
	devicePK     []byte
	logger       *zap.Logger
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

		return fmt.Errorf("command not found, start with // to send a message beginning with a slash")
	}

	return newMessageCommand(ctx, v, input)
}

func (v *groupView) OnSubmit(ctx context.Context, msg string) {
	v.logger.Debug("onSubmit", zap.String("msg", msg))
	v.messages.View().ScrollToEnd()

	if err := v.commandParser(ctx, msg); err != nil {
		v.logger.Debug("onSubmit error", zap.Error(err))
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
	}
}

func (v *groupView) loop(ctx context.Context) {
	wg := sync.WaitGroup{}
	wg.Add(3)

	go func() {
		wg.Done()
		for m := range v.syncMessages {
			v.messages.Append(m)
		}
	}()

	// list group message events
	{
		var evt *bertytypes.GroupMessageEvent

		req := &bertytypes.GroupMessageList_Request{GroupPK: v.g.PublicKey}
		cl, err := v.v.client.GroupMessageList(ctx, req)
		for err == nil {
			if evt, err = cl.Recv(); err == nil {
				v.messages.Prepend(&historyMessage{
					messageType: messageTypeMessage,
					payload:     evt.Message,
					sender:      evt.Headers.DevicePK,
				}, time.Time{})
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
				if err != nil {
					// @TODO: Log this
					return
				}

				v.messages.Append(&historyMessage{
					messageType: messageTypeMeta,
					payload:     []byte("receiving message: " + string(evt.Message)),
				})

				v.messages.Append(&historyMessage{
					messageType: messageTypeMessage,
					payload:     evt.Message,
					sender:      evt.Headers.DevicePK,
				})
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

func (v *groupView) welcomeEventDisplay(ctx context.Context) {
	config, err := v.v.client.InstanceGetConfiguration(ctx, &bertytypes.InstanceGetConfiguration_Request{})
	if err != nil {
		panic(err)
	}

	bannerLines := strings.Split(banner.Banner, "\n")
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

	for i, listener := range config.Listeners {
		msg := fmt.Sprintf("listener [#%d]: %s", i, listener)
		v.messages.Append(&historyMessage{
			messageType: messageTypeMeta,
			payload:     []byte(msg),
		})
	}

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
