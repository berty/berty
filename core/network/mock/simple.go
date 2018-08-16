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
	peers []peer
}

type peer struct {
	id     string
	driver *SimpleDriver
}

func NewSimple() *SimpleManager {
	return &SimpleManager{
		peers: make([]peer, 0),
	}
}

func (m *SimpleManager) Driver() *SimpleDriver {
	return &SimpleDriver{
		manager: m,
	}
}

func (m *SimpleManager) AddPeer(id string, driver *SimpleDriver) {
	m.peers = append(m.peers, peer{id: id, driver: driver})
}

//
// Driver
//

type SimpleDriver struct {
	network.Driver
	manager *SimpleManager
	handler func(context.Context, *p2p.Event) (*p2p.Void, error)
}

func (d *SimpleDriver) SendEvent(ctx context.Context, event *p2p.Event) error {
	for _, peer := range d.manager.peers {
		if peer.id == event.ReceiverID {
			zap.L().Debug("Simple.SendEvent",
				zap.String("sender", event.SenderID),
				zap.String("receiver", event.ReceiverID),
			)
			_, err := peer.driver.handler(p2p.SetSender(ctx, event.SenderID), event)
			return err
		}
	}
	return fmt.Errorf("peer not found")
}

func (d *SimpleDriver) SetReceiveEventHandler(handler func(context.Context, *p2p.Event) (*p2p.Void, error)) {
	d.handler = handler
}
