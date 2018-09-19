package mock

import (
	"context"
	"fmt"

	"go.uber.org/zap"

	"berty.tech/core/api/p2p"
	"berty.tech/core/network"
)

//
// Manager
//

type SimpleManager struct {
	peers []*SimpleDriver
}

func NewSimple() *SimpleManager {
	return &SimpleManager{
		peers: make([]*SimpleDriver, 0),
	}
}

func (m *SimpleManager) Driver() *SimpleDriver {
	return &SimpleDriver{
		manager:  m,
		channels: []string{},
	}
}

func (m *SimpleManager) AddPeer(driver *SimpleDriver) {
	m.peers = append(m.peers, driver)
}

//
// Driver
//

type SimpleDriver struct {
	network.Driver
	manager  *SimpleManager
	channels []string
	handler  func(context.Context, *p2p.Envelope) (*p2p.Void, error)
}

func (d *SimpleDriver) Emit(ctx context.Context, envelope *p2p.Envelope) error {
	found := false
	for _, peer := range d.manager.peers {
		for _, channel := range peer.channels {
			if channel == envelope.ChannelID {
				found = true
				logger().Debug("Simple.Emit",
					zap.String("channel", envelope.ChannelID),
					zap.Strings("peers", peer.channels),
				)
				if _, err := peer.handler(ctx, envelope); err != nil {
					logger().Error("peer.driver.handler failed", zap.Error(err))
				}
			}
		}
	}
	if !found {
		return fmt.Errorf("peer not found")
	}
	return nil
}

func (d *SimpleDriver) PingOtherNode(ctx context.Context, destination string) error {
	return nil
}

func (d *SimpleDriver) OnEnvelopeHandler(handler func(context.Context, *p2p.Envelope) (*p2p.Void, error)) {
	d.handler = handler
}

func (d *SimpleDriver) Join(_ context.Context, channel string) error {
	d.channels = append(d.channels, channel)
	return nil
}
