package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"os"
	"path"
	"sync"
	"time"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/events"
	"github.com/whyrusleeping/go-logging"

	ipfslog "github.com/ipfs/go-log"
	"github.com/marcusolsson/tui-go"
	"github.com/pkg/errors"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/internal/orbitutil"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

type messageType uint64

const (
	messageTypeUndefined messageType = iota
	messageTypeStarted
	messageTypeJoined
	messageTypeNewDevice
	messageTypeMessage
	messageTypeError
)

type historyMessage struct {
	messageType messageType
	sender      []byte
	receivedAt  time.Time
	payload     []byte
}

func pkAsShortID(pk []byte) string {
	if len(pk) > 24 {
		return base64.StdEncoding.EncodeToString(pk)[0:8]
	}

	return "--------"
}

func (h *historyMessage) ToView() *tui.Box {
	return tui.NewHBox(
		tui.NewLabel(h.receivedAt.Format("15:04:05")),
		tui.NewPadder(1, 0, tui.NewLabel(fmt.Sprintf("<%s>", pkAsShortID(h.sender)))),
		tui.NewLabel(string(h.payload)),
		tui.NewSpacer(),
	)
}

func createGroup() (*group.Group, error) {
	g, _, err := group.New()
	if err != nil {
		return nil, errors.Wrap(err, "error while creating group")
	}

	return g, nil
}

func openGroup(argv []string) (*bertyprotocol.Group, error) {
	// Read invitation (as base64 on stdin)
	iB64, err := base64.StdEncoding.DecodeString(argv[0])
	if err != nil {
		return nil, err
	}

	grp := &bertyprotocol.Group{}
	err = grp.Unmarshal(iB64)
	if err != nil {
		return nil, err
	}

	return grp, nil
}

func acquireGroup(argv []string) (*group.Group, error) {
	create := len(argv) == 0

	if create {
		g, err := createGroup()
		if err != nil {
			return nil, err
		}

		return g, nil
	}
	g, err := openGroup(argv)
	if err != nil {
		return nil, err
	}

	return group.FromProtocol(g)
}

type historyMessageList struct {
	lock    sync.RWMutex
	view    *tui.Box
	viewBox *tui.Box
}

func newHistoryMessageList() *historyMessageList {
	history := tui.NewVBox()

	historyScroll := tui.NewScrollArea(history)
	historyScroll.SetAutoscrollToBottom(true)

	historyBox := tui.NewVBox(historyScroll)
	historyBox.SetBorder(false)

	h := &historyMessageList{
		view:    history,
		viewBox: historyBox,
	}

	_ = h.Append(&historyMessage{
		messageType: messageTypeStarted,
		payload:     []byte("app started"),
	})

	return h
}

func (h *historyMessageList) View() *tui.Box {
	h.lock.RLock()
	defer h.lock.RUnlock()

	return h.viewBox
}

func (h *historyMessageList) AppendErr(err error) {
	if err == nil {
		return
	}

	_ = h.Append(&historyMessage{
		messageType: messageTypeError,
		payload:     []byte(err.Error()),
	})

}

func (h *historyMessageList) Append(m *historyMessage) error {
	h.lock.Lock()
	defer h.lock.Unlock()

	m.receivedAt = time.Now()

	h.view.Append(m.ToView())

	return nil
}

func initOrbitDB(ctx context.Context) (orbitutil.BertyOrbitDB, error) {
	p := path.Join(os.TempDir(), fmt.Sprintf("%d", os.Getpid()))

	cfg, err := ipfsutil.CreateBuildConfig()
	if err != nil {
		return nil, err
	}

	api, _, err := ipfsutil.NewConfigurableCoreAPI(ctx, cfg, ipfsutil.OptionMDNSDiscovery)
	if err != nil {
		return nil, err
	}

	odb, err := orbitutil.NewBertyOrbitDB(ctx, api, &orbitdb.NewOrbitDBOptions{Directory: &p})
	if err != nil {
		return nil, err
	}

	return odb, nil
}

func initGroup(argv []string) (orbitutil.GroupContext, error) {
	g, err := acquireGroup(argv)
	if err != nil {
		panic(err)
	}

	omd, err := group.NewOwnMemberDevice()
	if err != nil {
		return nil, err
	}

	return orbitutil.NewGroupContext(g, omd), nil
}

func metadataEventDisplay(messages *historyMessageList, e *bertyprotocol.GroupMetadataEvent) {
	switch e.Metadata.EventType {
	case bertyprotocol.EventTypeGroupMemberDeviceAdded:
		casted := &bertyprotocol.GroupAddMemberDevice{}
		if err := casted.Unmarshal(e.Event); err != nil {
			messages.AppendErr(err)
			return
		}

		_ = messages.Append(&historyMessage{
			messageType: messageTypeNewDevice,
			payload:     []byte("new device joined the group"),
			sender:      casted.DevicePK,
		})

	case bertyprotocol.EventTypeGroupDeviceSecretAdded:
		casted := &bertyprotocol.GroupAddDeviceSecret{}
		if err := casted.Unmarshal(e.Event); err != nil {
			messages.AppendErr(err)
			return
		}

		_ = messages.Append(&historyMessage{
			messageType: messageTypeNewDevice,
			payload:     []byte(fmt.Sprintf("has exchanged a secret")),
			sender:      casted.DevicePK,
		})
	}
}

func welcomeEventDisplay(messages *historyMessageList, gc orbitutil.GroupContext) {
	pkB, err := gc.GetDevicePrivKey().GetPublic().Raw()
	if err != nil {
		panic(err)
	}

	pkMemberB, err := gc.GetMemberPrivKey().GetPublic().Raw()
	if err != nil {
		panic(err)
	}

	protoGroup, err := gc.GetGroup().ToProtocol()
	if err != nil {
		panic(err)
	}

	protoBytes, err := protoGroup.Marshal()
	if err != nil {
		panic(err)
	}

	_ = messages.Append(&historyMessage{
		messageType: messageTypeJoined,
		sender:      pkB,
		payload:     []byte(fmt.Sprintf("grp: %s", base64.StdEncoding.EncodeToString(protoBytes))),
	})
	_ = messages.Append(&historyMessage{
		messageType: messageTypeJoined,
		sender:      pkB,
		payload:     []byte(fmt.Sprintf("own member id: %s", pkAsShortID(pkMemberB))),
	})
}

func miniMain(argv []string) {
	ipfslog.SetAllLoggers(logging.CRITICAL)

	_ = messageTypeUndefined

	messages := newHistoryMessageList()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	gc, err := initGroup(argv)
	if err != nil {
		panic(err)
	}

	odb, err := initOrbitDB(ctx)
	if err != nil {
		panic(err)
	}

	err = orbitutil.InitGroupContext(ctx, gc, odb)
	if err != nil {
		panic(err)
	}

	// Announce that we joined the group and show the group invitation token
	welcomeEventDisplay(messages, gc)

	// List existing members of the group
	go func() {
		for e := range gc.GetMetadataStore().ListEvents(ctx) {
			metadataEventDisplay(messages, e)
		}
	}()

	// Watch for incoming new messages
	go gc.GetMessageStore().Subscribe(ctx, func(e events.Event) {
		evt, ok := e.(*bertyprotocol.GroupMessageEvent)
		if !ok {
			return
		}

		_ = messages.Append(&historyMessage{
			messageType: messageTypeMessage,
			payload:     evt.Message,
			sender:      evt.Headers.DevicePK,
		})
	})

	// Watch for new incoming metadata
	go gc.GetMetadataStore().Subscribe(ctx, func(evt events.Event) {
		e, ok := evt.(*bertyprotocol.GroupMetadataEvent)
		if !ok {
			return
		}

		metadataEventDisplay(messages, e)
	})

	historyBox := messages.View()

	input := tui.NewEntry()
	input.SetFocused(true)
	input.SetSizePolicy(tui.Expanding, tui.Maximum)

	inputBox := tui.NewHBox(input)
	inputBox.SetBorder(true)
	inputBox.SetSizePolicy(tui.Expanding, tui.Maximum)

	chat := tui.NewVBox(historyBox, inputBox)
	chat.SetSizePolicy(tui.Expanding, tui.Expanding)

	input.OnSubmit(func(e *tui.Entry) {
		msg := e.Text()
		input.SetText("")

		if msg == "" {
			return
		}

		if _, err := gc.GetMessageStore().AddMessage(ctx, []byte(msg)); err != nil {
			messages.AppendErr(errors.Wrap(err, "Can't send message"))
		}
	})

	err = orbitutil.ActivateGroupContext(ctx, gc)
	if err != nil {
		panic(err)
	}

	ui, err := tui.New(chat)
	if err != nil {
		panic(err)
	}
	ui.SetKeybinding("Esc", func() { ui.Quit() })

	if err := ui.Run(); err != nil {
		panic(err)
	}
}
