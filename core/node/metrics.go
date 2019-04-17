package node

import (
	"context"
	"fmt"
	"time"

	"berty.tech/core/api/node"
	network_metric "berty.tech/core/network/metric"
	"berty.tech/core/pkg/tracing"
)

// @FIXME: networkMetric should never be nil

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

	var metric network_metric.Metric

	lastMap := map[string]*network_metric.Peer{}
	for {
		currentMap := map[string]*network_metric.Peer{}

		if metric = n.networkMetric; metric == nil {
			logger().Error("network metrics not started or has been disabled")
			<-time.After(time.Second * 1)
			continue
		}

		// add peers to map
		for _, peer := range metric.Peers(ctx).List {
			currentMap[peer.ID] = peer
		}

		// check last peer removed
		for _, last := range lastMap {
			_, ok := currentMap[last.ID]
			if !ok {
				last.Connection = network_metric.ConnectionType_NOT_CONNECTED
				if err := stream.Send(last); err != nil {
					return err
				}
			}
		}

		// send current updates
		for _, current := range currentMap {
			last, ok := lastMap[current.ID]
			if !ok || last.Connection != current.Connection {
				if err := stream.Send(current); err != nil {
					return err
				}
			}
		}

		<-time.After(time.Second * 1)
		lastMap = currentMap
	}

}

// Monitor bandwidth globally with the given interval
func (n *Node) MonitorBandwidth(input *network_metric.BandwidthStats, stream node.Service_MonitorBandwidthServer) error {
	tracer := tracing.EnterFunc(stream.Context(), input)
	defer tracer.Finish()
	ctx := tracer.Context()

	if n.networkMetric == nil {
		return fmt.Errorf("network metrics not started")
	}

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
