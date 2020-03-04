package main

import (
	"context"
	"encoding/base64"
	"fmt"
	"image"
	"os"
	"path"
	"sync"
	"time"

	orbitdb "berty.tech/go-orbit-db"
	"berty.tech/go-orbit-db/cache/cacheleveldown"
	"github.com/ipfs/go-datastore"
	ds_sync "github.com/ipfs/go-datastore/sync"
	badger "github.com/ipfs/go-ds-badger"
	"github.com/ipfs/go-ipfs/core"
	ipfslogger "github.com/ipfs/go-log"
	ipfs_coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/juju/fslock"
	"github.com/marcusolsson/tui-go"
	"github.com/pkg/errors"
	"github.com/whyrusleeping/go-logging"

	"berty.tech/berty/go/internal/account"
	"berty.tech/berty/go/internal/bertycrypto"
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
	messageTypeMessageReplayed
	messageTypeError
)

type miniOpts struct {
	groupInvitation string
	port            uint
	path            string
}

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

func (h *historyMessage) ToView() *tui.Label {
	textLabel := tui.NewLabel("")
	textLabel.SetWordWrap(true)
	text := fmt.Sprintf("%s <%s> %s", h.receivedAt.Format("15:04:05"), pkAsShortID(h.sender), string(h.payload))

	textLabel.SetText(text)

	return textLabel
}

func createGroup() (*bertyprotocol.Group, error) {
	g, _, err := bertyprotocol.NewGroupMultiMember()
	if err != nil {
		return nil, errors.Wrap(err, "error while creating group")
	}

	return g, nil
}

func openGroup(opts *miniOpts) (*bertyprotocol.Group, error) {
	// Read invitation (as base64 on stdin)
	iB64, err := base64.StdEncoding.DecodeString(opts.groupInvitation)
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

func acquireGroup(opts *miniOpts) (*bertyprotocol.Group, error) {
	create := opts.groupInvitation == ""

	if create {
		g, err := createGroup()
		if err != nil {
			return nil, err
		}

		return g, nil
	}
	g, err := openGroup(opts)
	if err != nil {
		return nil, err
	}

	return g, nil
}

type ScrollArea struct {
	*tui.ScrollArea
	topLeft image.Point
}

// Scroll shifts the views over the content.
func (s *ScrollArea) Scroll(dx, dy int) {
	if y := s.Widget.SizeHint().Y - s.Size().Y; y < dy+s.topLeft.Y {
		s.ScrollToBottom()
		dy = 0
	} else if dy+s.topLeft.Y < 0 {
		s.ScrollToTop()
		dy = 0
	}

	s.ScrollArea.Scroll(dx, dy)
	s.topLeft.X += dx
	s.topLeft.Y += dy
}

// ScrollToBottom ensures the bottom-most part of the scroll area is visible.
func (s *ScrollArea) ScrollToBottom() {
	s.ScrollArea.ScrollToBottom()
	s.topLeft.Y = s.Widget.SizeHint().Y - s.Size().Y
}

// ScrollToTop resets the vertical scroll position.
func (s *ScrollArea) ScrollToTop() {
	s.ScrollArea.ScrollToTop()
	s.topLeft.Y = 0
}

type historyMessageList struct {
	lock          sync.RWMutex
	view          *tui.Box
	viewBox       *tui.Box
	membersList   *tui.List
	ui            tui.UI
	historyScroll *ScrollArea
}

func newHistoryMessageList() *historyMessageList {
	history := tui.NewVBox()

	historyScroll := &ScrollArea{ScrollArea: tui.NewScrollArea(history)}
	historyBox := tui.NewVBox(historyScroll)

	h := &historyMessageList{
		view:          history,
		viewBox:       historyBox,
		historyScroll: historyScroll,
		membersList:   tui.NewList(),
	}

	h.membersList.AddItems("Devices:", "----")

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

func (h *historyMessageList) MembersList() tui.Widget {
	w := tui.NewHBox(h.membersList)
	w.SetBorder(true)

	return w
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

	if h.ui == nil {
		h.view.Append(m.ToView())
	} else {
		h.ui.Update(func() {
			h.view.Append(m.ToView())
		})
	}

	h.historyScroll.ScrollToBottom()

	return nil
}

func (h *historyMessageList) Prepend(m *historyMessage, receivedAt time.Time) error {
	h.lock.Lock()
	defer h.lock.Unlock()

	if receivedAt.IsZero() {
		m.receivedAt = time.Now()
	}

	if h.ui == nil {
		h.view.Prepend(m.ToView())
	} else {
		h.ui.Update(func() {
			h.view.Prepend(m.ToView())
		})
	}

	h.historyScroll.ScrollToBottom()

	return nil
}

func (h *historyMessageList) SetUI(ui tui.UI) {
	h.lock.Lock()
	defer h.lock.Unlock()

	h.ui = ui
}

func (h *historyMessageList) ViewHistory() *ScrollArea {
	h.lock.Lock()
	defer h.lock.Unlock()

	return h.historyScroll
}

func unlockFS(l *fslock.Lock) {
	if l == nil {
		return
	}

	err := l.Unlock()
	if err != nil {
		panic(err)
	}
}

func panicUnlockFS(err error, l *fslock.Lock) {
	unlockFS(l)
	panic(err)
}

func initOrbitDB(ctx context.Context, opts *miniOpts) (orbitutil.BertyOrbitDB, datastore.Batching, *core.IpfsNode, *fslock.Lock) {
	var (
		swarmAddresses []string = nil
		lock           *fslock.Lock
	)

	if opts.port != 0 {
		swarmAddresses = []string{
			fmt.Sprintf("/ip4/0.0.0.0/tcp/%d", opts.port),
			fmt.Sprintf("/ip6/0.0.0.0/tcp/%d", opts.port),
		}
	}

	var baseDS datastore.Batching = datastore.NewMapDatastore()

	if opts.path != cacheleveldown.InMemoryDirectory {
		basePath := path.Join(opts.path, "berty")
		_, err := os.Stat(basePath)
		if err != nil {
			if !os.IsNotExist(err) {
				panic(err)
			}
			if err := os.MkdirAll(basePath, 0700); err != nil {
				panic(err)
			}
		}

		lock = fslock.New(path.Join(opts.path, "lock"))
		err = lock.TryLock()
		if err != nil {
			panic(err)
		}

		baseDS, err = badger.NewDatastore(basePath, nil)
		if err != nil {
			panic(err)
		}
	}

	baseDS = ds_sync.MutexWrap(baseDS)

	accountDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("account"))
	messagesDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("messages"))
	ipfsDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("ipfs"))
	orbitdbDS := ipfsutil.NewNamespacedDatastore(baseDS, datastore.NewKey("orbitdb"))

	accountKS := ipfsutil.NewDatastoreKeystore(accountDS)
	orbitdbCache := orbitutil.NewOrbitDatastoreCache(orbitdbDS)
	mk := bertycrypto.NewDatastoreMessageKeys(messagesDS)

	cfg, err := ipfsutil.CreateBuildConfigWithDatastore(&ipfsutil.BuildOpts{
		SwarmAddresses: swarmAddresses,
	}, ipfsDS)
	if err != nil {
		panicUnlockFS(err, lock)
	}

	api, node, err := ipfsutil.NewConfigurableCoreAPI(ctx, cfg, ipfsutil.OptionMDNSDiscovery)
	if err != nil {
		panicUnlockFS(err, lock)
	}

	odb, err := orbitutil.NewBertyOrbitDB(ctx, api, account.New(accountKS), mk, &orbitdb.NewOrbitDBOptions{Cache: orbitdbCache})
	if err != nil {
		panicUnlockFS(err, lock)
	}

	return odb, baseDS, node, lock
}

func metadataEventDisplay(messages *historyMessageList, e *bertyprotocol.GroupMetadataEvent, isHistory bool) {
	evt := (*historyMessage)(nil)

	switch e.Metadata.EventType {
	case bertyprotocol.EventTypeGroupMemberDeviceAdded:
		casted := &bertyprotocol.GroupAddMemberDevice{}
		if err := casted.Unmarshal(e.Event); err != nil {
			messages.AppendErr(err)
			return
		}

		evt = &historyMessage{
			messageType: messageTypeNewDevice,
			payload:     []byte("new device joined the group"),
			sender:      casted.DevicePK,
		}

		messages.membersList.AddItems(pkAsShortID(casted.DevicePK))

	case bertyprotocol.EventTypeGroupDeviceSecretAdded:
		casted := &bertyprotocol.GroupAddDeviceSecret{}
		if err := casted.Unmarshal(e.Event); err != nil {
			messages.AppendErr(err)
			return
		}

		evt = &historyMessage{
			messageType: messageTypeNewDevice,
			payload:     []byte(fmt.Sprintf("has exchanged a secret")),
			sender:      casted.DevicePK,
		}
	}

	if evt == nil {
		return
	}

	if isHistory {
		_ = messages.Prepend(evt, time.Time{})
	} else {
		_ = messages.Append(evt)
	}
}

func welcomeEventDisplay(ctx context.Context, messages *historyMessageList, gc *orbitutil.GroupContext, api ipfs_coreapi.CoreAPI) {
	pkB, err := gc.DevicePubKey().Raw()
	if err != nil {
		panic(err)
	}

	pkMemberB, err := gc.MemberPubKey().Raw()
	if err != nil {
		panic(err)
	}

	protoBytes, err := gc.Group().Marshal()
	if err != nil {
		panic(err)
	}

	grpInv := base64.StdEncoding.EncodeToString(protoBytes)

	self, err := api.Key().Self(ctx)
	if err != nil {
		panic(err)
	}

	_ = messages.Append(&historyMessage{
		messageType: messageTypeJoined,
		sender:      pkB,
		payload:     []byte(fmt.Sprintf("peerid: %s", self.ID().String())),
	})
	_ = messages.Append(&historyMessage{
		messageType: messageTypeJoined,
		sender:      pkB,
		payload:     []byte(fmt.Sprintf("grp: %s", grpInv)),
	})
	_ = messages.Append(&historyMessage{
		messageType: messageTypeJoined,
		sender:      pkB,
		payload:     []byte(fmt.Sprintf("own member id: %s", pkAsShortID(pkMemberB))),
	})
}

func miniMain(opts *miniOpts) {
	ipfslogger.SetAllLoggers(logging.CRITICAL)

	_ = messageTypeUndefined

	messages := newHistoryMessageList()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	odb, ds, node, lock := initOrbitDB(ctx, opts)
	defer unlockFS(lock)
	defer ds.Close()
	defer node.Close()

	g, err := acquireGroup(opts)
	if err != nil {
		panic(err)
	}

	gc, err := odb.OpenGroup(ctx, g, nil)
	if err != nil {
		panic(err)
	}

	// Announce that we joined the group and show the group invitation token
	welcomeEventDisplay(ctx, messages, gc, odb.IPFS())

	// Replay message history
	msgs, err := gc.MessageStore().ListMessages(ctx)
	if err != nil {
		panic(err)
	}

	for evt := range msgs {
		_ = messages.Prepend(&historyMessage{
			messageType: messageTypeMessageReplayed,
			payload:     evt.Message,
			sender:      evt.Headers.DevicePK,
		}, time.Time{})
	}

	// List existing members of the group
	for e := range gc.MetadataStore().ListEvents(ctx) {
		metadataEventDisplay(messages, e, true)
	}

	// Watch for incoming new messages
	go func() {
		for e := range gc.MessageStore().Subscribe(ctx) {
			evt, ok := e.(*bertyprotocol.GroupMessageEvent)
			if !ok {
				continue
			}

			_ = messages.Append(&historyMessage{
				messageType: messageTypeMessage,
				payload:     evt.Message,
				sender:      evt.Headers.DevicePK,
			})
		}
	}()

	// Watch for new incoming metadata
	go func() {
		for evt := range gc.MetadataStore().Subscribe(ctx) {
			e, ok := evt.(*bertyprotocol.GroupMetadataEvent)
			if !ok {
				continue
			}

			metadataEventDisplay(messages, e, false)
		}
	}()

	historyBox := messages.View()

	input := tui.NewEntry()
	input.SetFocused(true)
	input.SetSizePolicy(tui.Expanding, tui.Maximum)

	inputBox := tui.NewHBox(tui.NewLabel(">> "), input)
	inputBox.SetSizePolicy(tui.Expanding, tui.Maximum)

	rightPanel := tui.NewVBox(historyBox, inputBox)
	rightPanel.SetSizePolicy(tui.Expanding, tui.Expanding)
	rightPanel.SetBorder(true)

	chat := tui.NewHBox(messages.MembersList(), rightPanel)
	chat.SetSizePolicy(tui.Expanding, tui.Expanding)

	input.OnSubmit(func(e *tui.Entry) {
		msg := e.Text()
		input.SetText("")

		messages.ViewHistory().ScrollToBottom()

		if msg == "" {
			return
		}

		if _, err := gc.MessageStore().AddMessage(ctx, []byte(msg)); err != nil {
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

	messages.SetUI(ui)

	ui.SetKeybinding("Esc", func() { ui.Quit() })
	ui.SetKeybinding("Ctrl+C", func() { ui.Quit() })
	ui.SetKeybinding("PgUp", func() { messages.ViewHistory().Scroll(0, -10) })
	ui.SetKeybinding("PgDn", func() { messages.ViewHistory().Scroll(0, 10) })
	ui.SetKeybinding("Home", func() { messages.ViewHistory().ScrollToTop() })
	ui.SetKeybinding("End", func() { messages.ViewHistory().ScrollToBottom() })

	if err := ui.Run(); err != nil {
		panic(err)
	}
}
