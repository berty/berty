package mock

import (
	"context"
	"fmt"

	"berty.tech/core/entity"
	"berty.tech/core/network"
	"berty.tech/core/pkg/errorcodes"
	"go.uber.org/zap"
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
	manager              *SimpleManager
	channels             []string
	handler              func(context.Context, *entity.Envelope) (*entity.Void, error)
	lastSentEnvelope     *entity.Envelope
	lastReceivedEnvelope *entity.Envelope
}

func (d *SimpleDriver) Emit(ctx context.Context, envelope *entity.Envelope) error {
	found := false

	d.lastSentEnvelope = envelope

	for _, peer := range d.manager.peers {
		if peer == d {
			continue
		}

		for _, channel := range peer.channels {
			if channel == envelope.ChannelID {
				found = true
				logger().Debug("Simple.Emit",
					zap.String("channel", envelope.ChannelID),
					zap.Strings("peers", peer.channels),
				)

				_, err := peer.handler(ctx, envelope)

				if errorcodes.ErrEnvelopeUntrusted.Is(err) {
					logger().Error("signature check failed", zap.Error(err))
				} else if err != nil {
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

func (d *SimpleDriver) OnEnvelopeHandler(handler func(context.Context, *entity.Envelope) (*entity.Void, error)) {
	d.handler = func(ctx context.Context, envelope *entity.Envelope) (*entity.Void, error) {
		d.lastReceivedEnvelope = envelope

		return handler(ctx, envelope)
	}
}

func (d *SimpleDriver) Join(_ context.Context, channel string) error {
	d.channels = append(d.channels, channel)
	return nil
}

func (d *SimpleDriver) GetLastReceivedEnvelope() *entity.Envelope {
	return d.lastReceivedEnvelope
}

func (d *SimpleDriver) GetLastSentEnvelope() *entity.Envelope {
	return d.lastSentEnvelope
}
