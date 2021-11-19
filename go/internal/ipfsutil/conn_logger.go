package ipfsutil

import (
	"context"
	"time"

	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
)

var ignoredTags = map[string]bool{
	"kbucket":          true,
	"relay":            true,
	"relay-hop-stream": true,
}

type connLogger struct {
	host   host.Host
	logger *zap.Logger
}

func EnableConnLogger(ctx context.Context, logger *zap.Logger, h host.Host) {
	notifee := &connLogger{
		host:   h,
		logger: logger.Named("conn_logger"),
	}

	h.Network().Notify(notifee)

	go func() {
		<-ctx.Done()
		h.Network().StopNotify(notifee)
	}()
}

func (cl *connLogger) getPeerTags(p peer.ID) []string {
	if tagInfo := cl.host.ConnManager().GetTagInfo(p); tagInfo != nil {
		var tags []string

		for tag := range tagInfo.Tags {
			if !ignoredTags[tag] {
				tags = append(tags, tag)
			}
		}

		if len(tags) > 0 {
			return tags
		}
	}
	return nil
}

func (cl *connLogger) Listen(n network.Network, m ma.Multiaddr) {
	cl.logger.Debug("Listener opened", logutil.PrivateString("Multiaddr", m.String()))
}

func (cl *connLogger) ListenClose(n network.Network, m ma.Multiaddr) {
	cl.logger.Debug("Listener closed", logutil.PrivateString("Multiaddr", m.String()))
}

func (cl *connLogger) Connected(net network.Network, c network.Conn) {
	// Wait 10 ms until the peer has been tagged by orbit-db
	go func() {
		<-time.After(10 * time.Millisecond)
		if tags := cl.getPeerTags(c.RemotePeer()); tags != nil {
			cl.logger.Info("Connected",
				logutil.PrivateString("peer", c.RemotePeer().Pretty()),
				logutil.PrivateString("to", c.LocalMultiaddr().String()),
				logutil.PrivateString("from", c.RemoteMultiaddr().String()),
				logutil.PrivateStrings("tags", tags),
			)
		}
	}()
}

func (cl *connLogger) Disconnected(n network.Network, c network.Conn) {
	if tags := cl.getPeerTags(c.RemotePeer()); tags != nil {
		cl.logger.Info("Disconnected",
			logutil.PrivateString("peer", c.RemotePeer().Pretty()),
			logutil.PrivateString("to", c.LocalMultiaddr().String()),
			logutil.PrivateString("from", c.RemoteMultiaddr().String()),
			logutil.PrivateStrings("tags", tags),
		)
	}
}

func (cl *connLogger) OpenedStream(n network.Network, s network.Stream) {
	if tags := cl.getPeerTags(s.Conn().RemotePeer()); tags != nil {
		cl.logger.Debug("Stream opened",
			logutil.PrivateString("peer", s.Conn().RemotePeer().Pretty()),
			logutil.PrivateString("to", s.Conn().LocalMultiaddr().String()),
			logutil.PrivateString("from", s.Conn().RemoteMultiaddr().String()),
			logutil.PrivateStrings("tags", tags),
		)
	}
}

func (cl *connLogger) ClosedStream(n network.Network, s network.Stream) {
	if tags := cl.getPeerTags(s.Conn().RemotePeer()); tags != nil {
		cl.logger.Debug("Stream closed",
			logutil.PrivateString("peer", s.Conn().RemotePeer().Pretty()),
			logutil.PrivateString("to", s.Conn().LocalMultiaddr().String()),
			logutil.PrivateString("from", s.Conn().RemoteMultiaddr().String()),
			logutil.PrivateStrings("tags", tags),
		)
	}
}
