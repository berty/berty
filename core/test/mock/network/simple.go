package network

import (
	"context"
	"fmt"

	"berty.tech/core/entity"
	"berty.tech/network"
	p2pnet "berty.tech/network"
	"berty.tech/network/protocol/berty"
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

var _ p2pnet.Driver = (*SimpleDriver)(nil)

//
// Driver
//

type SimpleDriver struct {
	network.Driver
	localContactID      string
	manager             *SimpleManager
	channels            []string
	handler             func(msg *berty.Message, cmeta *berty.ConnMetadata)
	lastSentMessage     *berty.Message
	lastReceivedMessage *berty.Message
}

func (d *SimpleDriver) EmitMessage(ctx context.Context, msg *berty.Message) error {
	found := false

	d.lastSentMessage = msg
	localAddr := &berty.Addr{
		Full: "/mock/" + d.localContactID,
	}

	for _, peer := range d.manager.peers {
		if peer == d {
			continue
		}

		for _, channel := range peer.channels {
			if channel == msg.RemoteContactID {
				found = true
				logger().Debug("Simple.Emit",
					zap.String("channel", msg.RemoteContactID),
					zap.Strings("peers", peer.channels),
				)

				remoteAddr := &berty.Addr{
					Full: "/mock/" + msg.RemoteContactID,
				}

				cmeta := &berty.ConnMetadata{
					Direction:  berty.ConnMetadata_DirOutbound,
					LocalAddr:  localAddr,
					RemoteAddr: remoteAddr,
				}

				peer.handler(msg, cmeta)

				// @TODO: this is useless, do something else
				// if errorcodes.ErrEnvelopeUntrusted.Is(err) {
				//      logger().Error("signature check failed", zap.Error(err))
				// } else if err != nil {
				//      logger().Error("peer.driver.handler failed", zap.Error(err))
				// }
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

func (d *SimpleDriver) OnMessage(handler func(msg *berty.Message, cmeta *berty.ConnMetadata)) {
	d.handler = func(msg *berty.Message, cmeta *berty.ConnMetadata) {
		d.lastReceivedMessage = msg
		handler(msg, cmeta)
	}
}

func (d *SimpleDriver) SetLocalContactID(lcontactID string) {
	d.localContactID = lcontactID
}

func (d *SimpleDriver) Join(_ context.Context) error {
	d.channels = append(d.channels, d.localContactID)
	return nil
}

func (d *SimpleDriver) GetLastReceivedEnvelope() *entity.Envelope {
	e, err := GetEnvelopeFromMessage(d.lastReceivedMessage)
	if err != nil {
		panic(err)
	}

	return e
}

func (d *SimpleDriver) GetLastSentEnvelope() *entity.Envelope {
	e, err := GetEnvelopeFromMessage(d.lastSentMessage)
	if err != nil {
		panic(err)
	}

	return e
}
