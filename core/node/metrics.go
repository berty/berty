package node

import (
	"context"
	"fmt"
	"time"

	"berty.tech/core/api/node"
	network_metric "berty.tech/core/network/metric"
	"berty.tech/core/pkg/tracing"
)

const BandwidthInterval = time.Second

// Return a list of peers
func (n *Node) Peers(ctx context.Context, _ *node.Void) (*network_metric.Peers, error) {
	return n.networkMetric.Peers(ctx), nil
}

// @FIXME: do we need to remove/change this
func (n *Node) Libp2PPing(ctx context.Context, str *network_metric.PingReq) (*node.Bool, error) {
	// b, err := n.networkMetric.Ping(ctx, str.Str)
	return &node.Bool{
		Ret: false,
	}, fmt.Errorf("not implemented yet")
}

func (n *Node) GetListenAddrs(ctx context.Context, _ *node.Void) (*network_metric.ListAddrs, error) {
	return n.networkMetric.GetListenAddrs(ctx), nil
}

func (n *Node) GetListenInterfaceAddrs(ctx context.Context, _ *node.Void) (*network_metric.ListAddrs, error) {
	return n.networkMetric.GetListenInterfaceAddrs(ctx)
}

func (n *Node) MonitorPeers(_ *node.Void, stream node.Service_MonitorPeersServer) error {
	tracer := tracing.EnterFunc(stream.Context())
	defer tracer.Finish()
	ctx := tracer.Context()

	cerr := make(chan error, 1)
	n.networkMetric.MonitorPeers(func(p *network_metric.Peer, err error) error {
		tracer := tracing.EnterFunc(ctx, p, err)
		defer tracer.Finish()

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
func (n *Node) MonitorBandwidth(input *network_metric.BandwidthStats, stream node.Service_MonitorBandwidthServer) error {
	tracer := tracing.EnterFunc(stream.Context(), input)
	defer tracer.Finish()
	ctx := tracer.Context()

	cerr := make(chan error, 1)

	handler := func(bs *network_metric.BandwidthStats, err error) error {
		tracer := tracing.EnterFunc(ctx, bs, err)
		defer tracer.Finish()

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
	case network_metric.MetricsType_PEER:
		n.networkMetric.MonitorBandwidthPeer(input.ID, BandwidthInterval, handler)
	case network_metric.MetricsType_PROTOCOL:
		n.networkMetric.MonitorBandwidthProtocol(input.ID, BandwidthInterval, handler)
	case network_metric.MetricsType_GLOBAL:
		n.networkMetric.MonitorBandwidth(BandwidthInterval, handler)
	}

	return <-cerr
}
