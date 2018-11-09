package node

import (
	"context"
	"time"

	"berty.tech/core/api/node"
	"berty.tech/core/api/p2p"
)

const BandwidthInterval = time.Second

// Return a list of peers
func (n *Node) Peers(_ context.Context, _ *node.Void) (*p2p.Peers, error) {
	return n.networkMetrics.Peers(), nil
}

func (n *Node) MonitorPeers(_ *node.Void, stream node.Service_MonitorPeersServer) error {
	cerr := make(chan error, 1)
	n.networkMetrics.MonitorPeers(func(p *p2p.Peer, err error) error {
		if err != nil {
			cerr <- err
			return err
		}

		if err = stream.Send(p); err != nil {
			cerr <- err
			return err
		}

		return nil
	})

	return <-cerr
}

// Monitor bandwidth globally with the given interval
func (n *Node) MonitorBandwidth(input *p2p.BandwidthStats, stream node.Service_MonitorBandwidthServer) error {
	cerr := make(chan error, 1)

	handler := func(bs *p2p.BandwidthStats, err error) error {
		if err != nil {
			cerr <- err
			return err
		}

		if err = stream.Send(bs); err != nil {
			cerr <- err
			return err
		}

		return nil
	}

	switch input.Type {
	case p2p.MetricsType_PEER:
		n.networkMetrics.MonitorBandwidthPeer(input.ID, BandwidthInterval, handler)
	case p2p.MetricsType_PROTOCOL:
		n.networkMetrics.MonitorBandwidthProtocol(input.ID, BandwidthInterval, handler)
	case p2p.MetricsType_GLOBAL:
		n.networkMetrics.MonitorBandwidth(BandwidthInterval, handler)
	}

	return <-cerr
}
