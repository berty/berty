package host

import (
	"context"
	"fmt"
	"time"

	connmgr "github.com/libp2p/go-libp2p-connmgr"
	ifconnmgr "github.com/libp2p/go-libp2p-interface-connmgr"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
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
	return cm
}

func (cm *BertyConnMgr) Connected(net inet.Network, c inet.Conn) {
	logger().Debug("Connected")
	cm.BasicConnMgr.Notifee().Connected(net, c)
}

func (cm *BertyConnMgr) Disconnected(net inet.Network, c inet.Conn) {
	// check if it a relay conn and try to reconnect
	tagInfo := cm.GetTagInfo(c.RemotePeer())
	peerID := c.RemotePeer()

	// TODO: reconnect to kbucket && bootstrap && relay if list of each are < 1
	logger().Debug("Disconnected", zap.String("tagInfo", fmt.Sprintf("%+v", tagInfo.Tags)))
	if v, ok := tagInfo.Tags["kbucket"]; ok && v == 5 {
		go func() {
			for {
				logger().Debug(
					"connmanager: try to reconnect to kbucket",
					zap.String("id", peerID.Pretty()),
				)
				if _, err := net.DialPeer(cm.ctx, peerID); err != nil {
					logger().Debug(
						"connmanager: cannot reconnect to kbucket",
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
		return
	} else if v, ok := tagInfo.Tags["bootstrap"]; ok && v == 2 {
		go func() {
			for {
				logger().Debug(
					"connmanager: try to reconnect to bootstrap",
					zap.String("id", peerID.Pretty()),
				)
				if _, err := net.DialPeer(cm.ctx, peerID); err != nil {
					logger().Debug(
						"connmanager: cannot reconnect to bootstrap",
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
		return
	} else if v, ok := tagInfo.Tags["relay-hop"]; ok && v == 2 {
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
		return
	} else {
		cm.BasicConnMgr.Notifee().Disconnected(net, c)
	}
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
