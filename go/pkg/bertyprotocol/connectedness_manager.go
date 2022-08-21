package bertyprotocol

import (
	"context"
	"sync"

	peer "github.com/libp2p/go-libp2p-core/peer"

	"berty.tech/berty/v2/go/internal/notify"
)

type ConnectednessType int

const (
	ConnectednessTypeDisconnected ConnectednessType = iota
	ConnectednessTypeReconnecting
	ConnectednessTypeConnected
)

type ConnectednessUpdate struct {
	Peer   peer.ID
	Status ConnectednessType
}

type PeersConnectedness map[peer.ID]ConnectednessType

type GroupStatus struct {
	peers  map[peer.ID]*PeerStatus
	notify *notify.Notify
}

type PeerStatus struct {
	groups map[string]*GroupStatus
	status ConnectednessType
}

type ConnectednessManager struct {
	peerState  map[peer.ID]*PeerStatus
	groupState map[string]*GroupStatus
	muState    sync.Mutex
}

func NewConnectednessManager() *ConnectednessManager {
	return &ConnectednessManager{
		peerState:  make(map[peer.ID]*PeerStatus),
		groupState: make(map[string]*GroupStatus),
	}
}

// AssociatePeer associate a peer to a group
func (m *ConnectednessManager) AssociatePeer(group string, peer peer.ID) {
	m.muState.Lock()
	defer m.muState.Unlock()

	sg := m.getGroupStatus(group)
	sp := m.getPeerStatus(peer)

	sg.notify.L.Lock()
	if _, ok := sg.peers[peer]; !ok {
		// we got a new peer, update and signal an update
		sg.peers[peer] = sp
		sp.groups[group] = sg
		sg.notify.Broadcast()
	}
	sg.notify.L.Unlock()
}

// UpdateState update peer current connectedness state
func (m *ConnectednessManager) UpdateState(peer peer.ID, update ConnectednessType) {
	m.muState.Lock()
	defer m.muState.Unlock()

	sp := m.getPeerStatus(peer)
	if sp.status != update {
		sp.status = update

		// notify each group that need an update
		for _, g := range sp.groups {
			g.notify.Broadcast()
		}
	}
}

// WaitForConnectednessChange wait until the given `current` peers status differ from `local` peers state
func (m *ConnectednessManager) WaitForConnectednessChange(ctx context.Context, gkey string, current PeersConnectedness) ([]peer.ID, bool) {
	m.muState.Lock()
	sg := m.getGroupStatus(gkey)
	m.muState.Unlock()

	ok := true
	sg.notify.L.Lock()
	var updated []peer.ID
	for ok {
		// check if there are some diff between local state and the current state
		if updated = m.updateStatus(sg, current); len(updated) > 0 {
			break // we got some update, leave the loop
		}

		// wait until there is an update on this group or context expire
		// unlock notify locker
		ok = sg.notify.Wait(ctx)
	}

	sg.notify.L.Unlock()

	return updated, ok
}

func (m *ConnectednessManager) getGroupStatus(gkey string) *GroupStatus {
	s, ok := m.groupState[gkey]
	if !ok {
		s = &GroupStatus{
			peers:  make(map[peer.ID]*PeerStatus),
			notify: notify.New(&sync.Mutex{}),
		}
		m.groupState[gkey] = s
	}
	return s
}

func (m *ConnectednessManager) getPeerStatus(peer peer.ID) *PeerStatus {
	s, ok := m.peerState[peer]
	if !ok {
		s = &PeerStatus{
			groups: make(map[string]*GroupStatus),
		}
		m.peerState[peer] = s
	}
	return s
}

func (m *ConnectednessManager) updateStatus(group *GroupStatus, current PeersConnectedness) []peer.ID {
	m.muState.Lock()

	updated := []peer.ID{}
	for peer := range group.peers {
		if ourPeer, ok := m.peerState[peer]; ok {
			theirStatus, ok := current[peer]
			if ok && ourPeer.status == theirStatus {
				continue // we share the same state for that peer, skip
			}

			// update peer status
			current[peer] = ourPeer.status
			updated = append(updated, peer)
		}
	}

	m.muState.Unlock()

	return updated
}
