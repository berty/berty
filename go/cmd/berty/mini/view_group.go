package mini

import (
	"context"
	"encoding/base64"
	"fmt"
	"strings"
	"time"

	"github.com/gdamore/tcell"
	ipfs_coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/pkg/errors"
	"github.com/rivo/tview"

	"berty.tech/berty/go/internal/banner"
	"berty.tech/berty/go/internal/orbitutil"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

type groupView struct {
	cg           orbitutil.ContextGroup
	messages     *historyMessageList
	v            *tabbedGroupsView
	inputHistory *inputHistory
	syncMessages chan *historyMessage
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
			payload:     []byte(err.Error()),
		}
	}

	v.inputHistory.Append(msg)
}

func newViewGroup(v *tabbedGroupsView, cg orbitutil.ContextGroup) *groupView {
	return &groupView{
		v:            v,
		cg:           cg,
		messages:     newHistoryMessageList(v.app),
		syncMessages: make(chan *historyMessage),
		inputHistory: newInputHistory(),
	}
}

func (v *groupView) loop(ctx context.Context) {
	// Replay message history
	msgs, err := v.cg.MessageStore().ListMessages(ctx)
	if err != nil {
		panic(err)
	}

	for evt := range msgs {
		v.messages.Prepend(&historyMessage{
			messageType: messageTypeMessage,
			payload:     evt.Message,
			sender:      evt.Headers.DevicePK,
		}, time.Time{})
	}

	// List existing members of the group
	for e := range v.cg.MetadataStore().ListEvents(ctx) {
		metadataEventHandler(ctx, v, e, true)
	}

	// Watch for incoming new messages
	go func() {
		for e := range v.cg.MessageStore().Subscribe(ctx) {
			evt, ok := e.(*bertyprotocol.GroupMessageEvent)
			if !ok {
				continue
			}

			v.messages.Append(&historyMessage{
				messageType: messageTypeMessage,
				payload:     evt.Message,
				sender:      evt.Headers.DevicePK,
			})
		}
	}()

	// Watch for new incoming metadata
	go func() {
		for evt := range v.cg.MetadataStore().Subscribe(ctx) {
			e, ok := evt.(*bertyprotocol.GroupMetadataEvent)
			if !ok {
				continue
			}
			metadataEventHandler(ctx, v, e, false)
		}
	}()

	go func() {
		for m := range v.syncMessages {
			v.messages.Append(m)
		}
	}()
}

func (v *groupView) welcomeEventDisplay(ctx context.Context, api ipfs_coreapi.CoreAPI) {
	self, err := api.Key().Self(ctx)
	if err != nil {
		panic(err)
	}

	b := banner.Banner()
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
		payload:     []byte(fmt.Sprintf("peerid: %s", self.ID().String())),
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
	pkMemberB, err := v.cg.MemberPubKey().Raw()
	if err != nil {
		panic(err)
	}

	pkB, err := v.cg.DevicePubKey().Raw()
	if err != nil {
		panic(err)
	}

	v.messages.Append(&historyMessage{
		messageType: messageTypeMeta,
		sender:      pkB,
		payload:     []byte(fmt.Sprintf("own member id: %s (%s)", base64.StdEncoding.EncodeToString(pkMemberB), pkAsShortID(pkMemberB))),
	})
}
