package host

import (
	"context"
	"time"

	connmgr "github.com/libp2p/go-libp2p-connmgr"
	ifconnmgr "github.com/libp2p/go-libp2p-interface-connmgr"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
	"go.uber.org/zap"
)

var _ ifconnmgr.ConnManager = (*BertyConnMgr)(nil)

type BertyConnMgr struct {
	ctx context.Context
	*connmgr.BasicConnMgr
}

func NewBertyConnMgr(ctx context.Context, low, hi int, grace time.Duration) *BertyConnMgr {
	cm := &BertyConnMgr{
		ctx:          ctx,
		BasicConnMgr: connmgr.NewConnManager(low, hi, grace),
	}
	return cm
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

func (cm *BertyConnMgr) Notifee() inet.Notifiee {
	return cm.BasicConnMgr.Notifee()
}

func (cm *BertyConnMgr) Disconnected(net inet.Network, c inet.Conn) {
	// check if it a relay conn and try to reconnect
	tagInfo := cm.GetTagInfo(c.RemotePeer())

	v, ok := tagInfo.Tags["relay-hop"]
	if !ok || v != 2 {
		cm.BasicConnMgr.Notifee().Disconnected(net, c)
		return
	}

	peerID := c.RemotePeer()
	go func() {
		for {
			logger().Debug(
				"connmanager: try to reconnect to relay",
				zap.String("id", peerID.Pretty()),
			)
			if _, err := net.DialPeer(cm.ctx, peerID); err != nil {
				logger().Debug(
					"connmanager: cannot reconnect to relay",
					zap.String("id", peerID.Pretty()),
					zap.String("err", err.Error()),
				)
				select {
				case <-time.After(time.Second * 10):
					continue
				case <-cm.ctx.Done():
					cm.BasicConnMgr.Notifee().Disconnected(net, c)
					break
				}
			}
			break
		}
	}()
}
