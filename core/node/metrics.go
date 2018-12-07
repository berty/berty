package node

import (
	"context"
	"time"

	"berty.tech/core/api/node"
	"berty.tech/core/network"
	"berty.tech/core/pkg/tracing"
)

const BandwidthInterval = time.Second

// Return a list of peers
func (n *Node) Peers(ctx context.Context, _ *node.Void) (*network.Peers, error) {
	return n.networkMetrics.Peers(ctx), nil
}

func (n *Node) MonitorPeers(_ *node.Void, stream node.Service_MonitorPeersServer) error {
	span, ctx := tracing.EnterFunc(stream.Context())
	defer span.Finish()

	cerr := make(chan error, 1)
	n.networkMetrics.MonitorPeers(func(p *network.Peer, err error) error {
		span, _ := tracing.EnterFunc(ctx, p, err)
		defer span.Finish()
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
func (n *Node) MonitorBandwidth(input *network.BandwidthStats, stream node.Service_MonitorBandwidthServer) error {
	span, ctx := tracing.EnterFunc(stream.Context(), input)
	defer span.Finish()

	cerr := make(chan error, 1)

	handler := func(bs *network.BandwidthStats, err error) error {
		span, _ := tracing.EnterFunc(ctx, bs, err)
		defer span.Finish()

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
	case network.MetricsType_PEER:
		n.networkMetrics.MonitorBandwidthPeer(input.ID, BandwidthInterval, handler)
	case network.MetricsType_PROTOCOL:
		n.networkMetrics.MonitorBandwidthProtocol(input.ID, BandwidthInterval, handler)
	case network.MetricsType_GLOBAL:
		n.networkMetrics.MonitorBandwidth(BandwidthInterval, handler)
	}

	return <-cerr
}
