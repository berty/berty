package host

import (
	"context"
	"fmt"
	"time"

	connmgr "github.com/libp2p/go-libp2p-connmgr"
	ifconnmgr "github.com/libp2p/go-libp2p-interface-connmgr"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

var _ ifconnmgr.ConnManager = (*BertyConnMgr)(nil)
var _ inet.Notifiee = (*BertyConnMgr)(nil)

type BertyConnMgr struct {
	*connmgr.BasicConnMgr
	ctx context.Context
}

func NewBertyConnMgr(ctx context.Context, low, hi int, grace time.Duration) *BertyConnMgr {
	cm := &BertyConnMgr{
		ctx:          ctx,
		BasicConnMgr: connmgr.NewConnManager(low, hi, grace),
	}
	return cm
}

func (cm *BertyConnMgr) reconnect(net inet.Network, pid peer.ID, delay *BackoffDelay) {
	retries := 0
	for {
		select {
		case <-time.After(delay.Backoff(retries)):
		case <-cm.ctx.Done():
			logger().Error("connmanager", zap.Error(cm.ctx.Err()))
			return
		}

		logger().Debug("connmanager: try to reconnect", zap.String("id", pid.Pretty()), zap.Int("retries", retries))
		_, err := net.DialPeer(cm.ctx, pid)
		if err == nil {
			return
		}

		logger().Debug("connmanager: cannot reconnect", zap.String("id", pid.Pretty()), zap.Error(err))

		// update retries
		retries++
	}
}

func (cm *BertyConnMgr) TrimOpenConns(ctx context.Context) {
	cm.BasicConnMgr.TrimOpenConns(ctx)
}

func (cm *BertyConnMgr) GetTagInfo(p peer.ID) *ifconnmgr.TagInfo {
	return cm.BasicConnMgr.GetTagInfo(p)
}

func (cm *BertyConnMgr) TagPeer(p peer.ID, tag string, val int) {
	cm.BasicConnMgr.TagPeer(p, tag, val)
}

func (cm *BertyConnMgr) UntagPeer(p peer.ID, tag string) {
	cm.BasicConnMgr.UntagPeer(p, tag)
}

func (cm *BertyConnMgr) GetInfo() connmgr.CMInfo {
	return cm.BasicConnMgr.GetInfo()
}

func (cm *BertyConnMgr) getRelayPeers() []pstore.PeerInfo {
	fmt.Printf("not implemented")
	return nil
}
func (cm *BertyConnMgr) getBootstrapPeers() []pstore.PeerInfo {
	fmt.Printf("not implemented")
	return nil
}
func (cm *BertyConnMgr) getKbucketPeers() []pstore.PeerInfo {
	fmt.Printf("not implemented")
	return nil
}

func (cm *BertyConnMgr) Notifee() inet.Notifiee {
	return cm
}

func (cm *BertyConnMgr) Connected(net inet.Network, c inet.Conn) {
	logger().Debug("Connected")
	cm.BasicConnMgr.Notifee().Connected(net, c)
}

func (cm *BertyConnMgr) Disconnected(net inet.Network, c inet.Conn) {
	if net.Connectedness(c.RemotePeer()) != inet.Connected {
		// check if it a relay conn and try to reconnect
		peerID := c.RemotePeer()
		tagInfo := cm.GetTagInfo(peerID)

		var delay *BackoffDelay

		if v, ok := tagInfo.Tags["bootstrap"]; ok && v == 2 {
			delay = NewBackoffDelay(time.Second, time.Second*10)
			go cm.reconnect(net, peerID, delay)
		} else if v, ok := tagInfo.Tags["relay-hop"]; ok && v == 2 {
			delay = NewBackoffDelay(time.Second, time.Minute)
			go cm.reconnect(net, peerID, delay)
		}
	}

	cm.BasicConnMgr.Notifee().Disconnected(net, c)
}

// Listen is no-op in this implementation.
func (cm *BertyConnMgr) Listen(n inet.Network, addr ma.Multiaddr) {
	cm.BasicConnMgr.Notifee().Listen(n, addr)
}

// ListenClose is no-op in this implementation.
func (cm *BertyConnMgr) ListenClose(n inet.Network, addr ma.Multiaddr) {
	cm.BasicConnMgr.Notifee().Listen(n, addr)
}

// OpenedStream is no-op in this implementation.
func (cm *BertyConnMgr) OpenedStream(n inet.Network, s inet.Stream) {
	cm.BasicConnMgr.Notifee().OpenedStream(n, s)
}

// ClosedStream is no-op in this implementation.
func (cm *BertyConnMgr) ClosedStream(n inet.Network, s inet.Stream) {
	cm.BasicConnMgr.Notifee().ClosedStream(n, s)
}
