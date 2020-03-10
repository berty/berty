package mini

import (
	"context"
	"sync"

	"github.com/gdamore/tcell"
	"github.com/rivo/tview"

	"berty.tech/berty/go/internal/orbitutil"
	"berty.tech/berty/go/pkg/bertyprotocol"
)

type tabbedGroupsView struct {
	ctx                    context.Context
	app                    *tview.Application
	odb                    orbitutil.BertyOrbitDB
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

		for _, cg := range v.contactGroupViews {
			items = append(items, cg)
		}
	}

	if len(v.multiMembersGroupViews) > 0 {
		items = append(items, nil)

		for _, cg := range v.multiMembersGroupViews {
			items = append(items, cg)
		}
	}

	return items
}

func (v *tabbedGroupsView) getChannelLabels() []string {
	topics := []string{"Account"}
	topics = append(topics, pkAsShortID(v.accountGroupView.cg.Group().PublicKey))

	if len(v.contactGroupViews) > 0 {
		topics = append(topics, "Contacts")

		for _, cg := range v.contactGroupViews {
			topics = append(topics, pkAsShortID(cg.cg.Group().PublicKey))
		}
	}

	if len(v.multiMembersGroupViews) > 0 {
		topics = append(topics, "Groups")

		for _, cg := range v.multiMembersGroupViews {
			topics = append(topics, pkAsShortID(cg.cg.Group().PublicKey))
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

func (v *tabbedGroupsView) AddContextGroup(cg orbitutil.ContextGroup) {
	v.lock.Lock()

	if cg.Group().GroupType == bertyprotocol.GroupTypeContact {
		for _, vg := range v.contactGroupViews {
			if vg.cg.Group() == cg.Group() {
				return
			}
		}

		vg := newViewGroup(v, cg)
		vg.welcomeGroupEventDisplay()
		vg.loop(v.ctx)

		v.contactGroupViews = append(v.contactGroupViews, vg)

	} else if cg.Group().GroupType == bertyprotocol.GroupTypeMultiMember {
		for _, vg := range v.multiMembersGroupViews {
			if vg.cg.Group() == cg.Group() {
				return
			}
		}

		vg := newViewGroup(v, cg)
		vg.welcomeGroupEventDisplay()
		vg.loop(v.ctx)

		v.multiMembersGroupViews = append(v.multiMembersGroupViews, vg)
	}

	v.lock.Unlock()

	v.recomputeChannelList(false)
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

func newTabbedGroups(ctx context.Context, cg orbitutil.ContextGroup, odb orbitutil.BertyOrbitDB, app *tview.Application) *tabbedGroupsView {
	v := &tabbedGroupsView{
		ctx:    ctx,
		topics: tview.NewTable(),
		odb:    odb,
		app:    app,
	}

	v.accountGroupView = newViewGroup(v, cg)
	v.selectedGroupView = v.accountGroupView
	v.activeViewContainer = tview.NewFlex().SetDirection(tview.FlexRow).
		AddItem(v.selectedGroupView.View(), 0, 1, false)
	v.recomputeChannelList(false)

	v.accountGroupView.welcomeEventDisplay(ctx, odb.IPFS())

	v.accountGroupView.loop(ctx)

	return v
}
