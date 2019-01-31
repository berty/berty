package p2p

import (
	"context"
	"time"

	connmgr "github.com/libp2p/go-libp2p-connmgr"
	ifconnmgr "github.com/libp2p/go-libp2p-interface-connmgr"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
)

type ConnManager struct {
	connmanager *connmgr.BasicConnMgr
	relayMap    map[peer.ID]bool
}

func NewConnManager(low, hi int, grace time.Duration) *ConnManager {
	return &ConnManager{
		connmanager: connmgr.NewConnManager(low, hi, grace),
	}
}

func (cm *ConnManager) TrimOpenConns(ctx context.Context) {
	cm.connmanager.TrimOpenConns(ctx)
}

func (cm *ConnManager) GetTagInfo(p peer.ID) *ifconnmgr.TagInfo {
	return cm.connmanager.GetTagInfo(p)
}

func (cm *ConnManager) TagPeer(p peer.ID, tag string, val int) {
	// If peer is a relay, add it to relayList (used by reconnection watcher)
	if tag == "relay-hop" && val == 2 {
		if _, exist := cm.relayMap[p]; !exist {
			cm.relayMap[p] = true
		}
	}

	cm.connmanager.TagPeer(p, tag, val)
}

func (cm *ConnManager) UntagPeer(p peer.ID, tag string) {
	cm.connmanager.UntagPeer(p, tag)
}

func (cm *ConnManager) GetInfo() connmgr.CMInfo {
	return cm.connmanager.GetInfo()
}

func (cm *ConnManager) Notifee() inet.Notifiee {
	return cm.connmanager.Notifee()
}
