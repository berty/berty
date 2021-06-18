package mini

import (
	"bytes"
	"context"
	"fmt"
	"sync"
	"sync/atomic"

	"github.com/gdamore/tcell"
	"github.com/rivo/tview"

	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

type tabbedGroupsView struct {
	ctx                    context.Context
	app                    *tview.Application
	protocol               protocoltypes.ProtocolServiceClient
	topics                 *tview.Table
	activeViewContainer    *tview.Flex
	selectedGroupView      *groupView
	accountGroupView       *groupView
	contactGroupViews      []*groupView
	multiMembersGroupViews []*groupView
	lock                   sync.RWMutex
	messenger              messengertypes.MessengerServiceClient
	displayName            string
	contactStates          map[string]protocoltypes.ContactState
	contactNames           map[string]string
}

func (v *tabbedGroupsView) getChannelViewGroups() []*groupView {
	items := []*groupView{nil}
	items = append(items, v.accountGroupView)

	if len(v.contactGroupViews) > 0 {
		items = append(items, nil)
		items = append(items, v.contactGroupViews...)
	}

	if len(v.multiMembersGroupViews) > 0 {
		items = append(items, nil)
		items = append(items, v.multiMembersGroupViews...)
	}

	return items
}

func groupLabelWithBadge(cg *groupView, name string) string {
	badge := " "
	if atomic.LoadInt32(&cg.hasNew) == 1 {
		badge = "*"
	}

	if name == "" {
		name = pkAsShortID(cg.g.PublicKey)
	}

	return fmt.Sprintf("%s%s", badge, name)
}

func (v *tabbedGroupsView) getChannelLabels() []string {
	topics := []string{"Account"}
	topics = append(topics, groupLabelWithBadge(v.accountGroupView, ""))

	if len(v.contactGroupViews) > 0 {
		topics = append(topics, "Contacts")

		for _, cg := range v.contactGroupViews {
			name := ""
			if displayName, ok := v.contactNames[string(cg.g.PublicKey)]; ok {
				name = displayName
			}

			topics = append(topics, groupLabelWithBadge(cg, name))
		}
	}

	if len(v.multiMembersGroupViews) > 0 {
		topics = append(topics, "Groups")

		for _, cg := range v.multiMembersGroupViews {
			topics = append(topics, groupLabelWithBadge(cg, ""))
		}
	}

	return topics
}

func (v *tabbedGroupsView) recomputeChannelList(viewChanged bool) {
	v.lock.Lock()
	defer v.lock.Unlock()

	groups := v.getChannelViewGroups()

	v.topics.Clear()
	for i, l := range v.getChannelLabels() {
		v.topics.SetCellSimple(i, 0, l)
		cell := v.topics.GetCell(i, 0)

		if groups[i] == nil {
			cell.SetTextColor(tcell.ColorGray)
		} else if v.selectedGroupView == groups[i] {
			cell.SetBackgroundColor(tcell.ColorBlue).SetTextColor(tcell.ColorWhite)
		}
	}

	if viewChanged {
		v.activeViewContainer.Clear()
		v.activeViewContainer.AddItem(v.selectedGroupView.View(), 0, 1, false)
	}
}

func (v *tabbedGroupsView) AddContextGroup(ctx context.Context, g *protocoltypes.Group) {
	v.lock.Lock()

	// Check if group already opened
	switch g.GroupType {
	case protocoltypes.GroupTypeContact:
		for _, vg := range v.contactGroupViews {
			if bytes.Equal(vg.g.PublicKey, g.PublicKey) {
				v.lock.Unlock()
				return
			}
		}
	case protocoltypes.GroupTypeMultiMember:
		for _, vg := range v.multiMembersGroupViews {
			if bytes.Equal(vg.g.PublicKey, g.PublicKey) {
				v.lock.Unlock()
				return
			}
		}
	default:
		v.lock.Unlock()
		return
	}

	info, err := v.protocol.GroupInfo(ctx, &protocoltypes.GroupInfo_Request{
		GroupPK: g.PublicKey,
	})
	if err != nil {
		v.lock.Unlock()
		return
	}
	v.lock.Unlock()

	vg := newViewGroup(v, g, info.MemberPK, info.DevicePK, globalLogger)
	vg.welcomeGroupEventDisplay()
	vg.loop(v.ctx)

	if g.GroupType == protocoltypes.GroupTypeContact {
		v.contactGroupViews = append(v.contactGroupViews, vg)
	} else if g.GroupType == protocoltypes.GroupTypeMultiMember {
		v.multiMembersGroupViews = append(v.multiMembersGroupViews, vg)
	}
}

func (v *tabbedGroupsView) PrevGroup() {
	v.lock.Lock()
	defer v.recomputeChannelList(true)
	defer v.lock.Unlock()

	if v.selectedGroupView == v.accountGroupView {
		return
	}

	groups := v.getChannelViewGroups()
	for i, item := range groups {
		if v.selectedGroupView == item {
			if groups[i-1] == nil {
				v.selectedGroupView = groups[i-2]
			} else {
				v.selectedGroupView = groups[i-1]
			}

			atomic.StoreInt32(&v.selectedGroupView.hasNew, 0)

			break
		}
	}
}

func (v *tabbedGroupsView) NextGroup() {
	v.lock.Lock()
	defer v.recomputeChannelList(true)
	defer v.lock.Unlock()

	groups := v.getChannelViewGroups()

	if v.selectedGroupView == groups[len(groups)-1] {
		return
	}

	for i, item := range groups {
		if v.selectedGroupView == item {
			if groups[i+1] == nil {
				v.selectedGroupView = groups[i+2]
			} else {
				v.selectedGroupView = groups[i+1]
			}

			atomic.StoreInt32(&v.selectedGroupView.hasNew, 0)

			break
		}
	}
}

func (v *tabbedGroupsView) GetActiveViewGroup() *groupView {
	v.lock.Lock()
	defer v.lock.Unlock()

	return v.selectedGroupView
}

func (v *tabbedGroupsView) GetTabs() tview.Primitive {
	return v.topics
}

func (v *tabbedGroupsView) GetHistory() tview.Primitive {
	v.lock.RLock()
	defer v.lock.RUnlock()

	return v.activeViewContainer
}

func newTabbedGroups(ctx context.Context, g *protocoltypes.GroupInfo_Reply, protocol protocoltypes.ProtocolServiceClient, messenger messengertypes.MessengerServiceClient, app *tview.Application, displayName string) *tabbedGroupsView {
	v := &tabbedGroupsView{
		ctx:           ctx,
		topics:        tview.NewTable(),
		protocol:      protocol,
		messenger:     messenger,
		app:           app,
		contactStates: map[string]protocoltypes.ContactState{},
		contactNames:  map[string]string{},
		displayName:   displayName,
	}

	v.accountGroupView = newViewGroup(v, g.Group, g.MemberPK, g.DevicePK, globalLogger)
	v.selectedGroupView = v.accountGroupView
	v.activeViewContainer = tview.NewFlex().
		SetDirection(tview.FlexRow).
		AddItem(v.selectedGroupView.View(), 0, 1, false)
	v.recomputeChannelList(false)

	v.accountGroupView.welcomeEventDisplay()

	v.accountGroupView.loop(ctx)

	return v
}
