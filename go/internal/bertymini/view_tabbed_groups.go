package mini

import (
	"bytes"
	"context"
	"sync"

	"berty.tech/berty/v2/go/pkg/bertyprotocol"
	"berty.tech/berty/v2/go/pkg/bertytypes"
	"github.com/gdamore/tcell"
	"github.com/rivo/tview"
)

type tabbedGroupsView struct {
	ctx                    context.Context
	app                    *tview.Application
	client                 bertyprotocol.ProtocolServiceClient
	topics                 *tview.Table
	activeViewContainer    *tview.Flex
	selectedGroupView      *groupView
	accountGroupView       *groupView
	contactGroupViews      []*groupView
	multiMembersGroupViews []*groupView
	lock                   sync.RWMutex
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

func (v *tabbedGroupsView) getChannelLabels() []string {
	topics := []string{"Account"}
	topics = append(topics, pkAsShortID(v.accountGroupView.g.PublicKey))

	if len(v.contactGroupViews) > 0 {
		topics = append(topics, "Contacts")

		for _, cg := range v.contactGroupViews {
			topics = append(topics, pkAsShortID(cg.g.PublicKey))
		}
	}

	if len(v.multiMembersGroupViews) > 0 {
		topics = append(topics, "Groups")

		for _, cg := range v.multiMembersGroupViews {
			topics = append(topics, pkAsShortID(cg.g.PublicKey))
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

func (v *tabbedGroupsView) AddContextGroup(ctx context.Context, g *bertytypes.Group) {
	v.lock.Lock()
	defer v.lock.Unlock()

	// Check if group already opened
	switch g.GroupType {
	case bertytypes.GroupTypeContact:
		for _, vg := range v.contactGroupViews {
			if bytes.Equal(vg.g.PublicKey, g.PublicKey) {
				return
			}
		}
	case bertytypes.GroupTypeMultiMember:
		for _, vg := range v.multiMembersGroupViews {
			if bytes.Equal(vg.g.PublicKey, g.PublicKey) {
				return
			}
		}
	default:
		return
	}

	info, err := v.client.GroupInfo(ctx, &bertytypes.GroupInfo_Request{
		GroupPK: g.PublicKey,
	})

	if err != nil {
		return
	}

	if _, err := v.client.ActivateGroup(ctx, &bertytypes.ActivateGroup_Request{
		GroupPK: g.PublicKey,
	}); err != nil {
		return
	}

	vg := newViewGroup(v, g, info.MemberPK, info.DevicePK, globalLogger)
	vg.welcomeGroupEventDisplay()
	vg.loop(v.ctx)

	if g.GroupType == bertytypes.GroupTypeContact {
		v.contactGroupViews = append(v.contactGroupViews, vg)
	} else if g.GroupType == bertytypes.GroupTypeMultiMember {
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

func newTabbedGroups(ctx context.Context, g *bertytypes.GroupInfo_Reply, client bertyprotocol.ProtocolServiceClient, app *tview.Application) *tabbedGroupsView {
	v := &tabbedGroupsView{
		ctx:    ctx,
		topics: tview.NewTable(),
		client: client,
		app:    app,
	}

	v.accountGroupView = newViewGroup(v, g.Group, g.MemberPK, g.DevicePK, globalLogger)
	v.selectedGroupView = v.accountGroupView
	v.activeViewContainer = tview.NewFlex().SetDirection(tview.FlexRow).
		AddItem(v.selectedGroupView.View(), 0, 1, false)
	v.recomputeChannelList(false)

	v.accountGroupView.welcomeEventDisplay(ctx)

	v.accountGroupView.loop(ctx)

	return v
}
