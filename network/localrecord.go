package network

import (
	"fmt"
	"io"

	"berty.tech/network/helper"
	"berty.tech/network/protocol/berty"
	blema "berty.tech/network/transport/ble/multiaddr"
	mcma "berty.tech/network/transport/mc/multiaddr"
	ggio "github.com/gogo/protobuf/io"
	inet "github.com/libp2p/go-libp2p-net"
	protocol "github.com/libp2p/go-libp2p-protocol"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr-net"
	"go.uber.org/zap"
)

const recProtocolID = protocol.ID("berty/p2p/localrecord")

type LocalRecordManager struct {
	net            *Network
	localContactID string
}

func NewLocalRecordManager(net *Network, lcontactID string) *LocalRecordManager {
	lrm := &LocalRecordManager{
		net:            net,
		localContactID: lcontactID,
	}

	net.host.Network().Notify(lrm)
	net.host.SetStreamHandler(recProtocolID, lrm.handleLocalRecord)
	return lrm
}

func (lrm *LocalRecordManager) UpdateLocalContactID(lcontactID string) {
	lrm.localContactID = lcontactID
}

func (lrm *LocalRecordManager) Connected(net inet.Network, c inet.Conn) {
	go func() {
		// Send local record if new connection is made through MC/BLE or private IP
		if mcma.MC.Matches(c.RemoteMultiaddr()) || blema.BLE.Matches(c.RemoteMultiaddr()) || manet.IsPrivateAddr(c.RemoteMultiaddr()) {
			if err := lrm.sendLocalRecord(c); err != nil {
				logger().Error("sending local record failed", zap.Error(err))
			} else {
				logger().Debug("sending local record succeeded",
					zap.String("peerID", c.RemotePeer().Pretty()),
				)
			}
		}
	}()
}

// Unused notifees
func (lrm *LocalRecordManager) Disconnected(net inet.Network, c inet.Conn)    {}
func (lrm *LocalRecordManager) Listen(n inet.Network, addr ma.Multiaddr)      {}
func (lrm *LocalRecordManager) ListenClose(n inet.Network, addr ma.Multiaddr) {}
func (lrm *LocalRecordManager) OpenedStream(n inet.Network, s inet.Stream)    {}
func (lrm *LocalRecordManager) ClosedStream(n inet.Network, s inet.Stream)    {}

func (lrm *LocalRecordManager) handleLocalRecord(s inet.Stream) {
	logger().Debug("receiving local record",
		zap.String("remote peerID", s.Conn().RemotePeer().Pretty()),
	)

	pbr := ggio.NewDelimitedReader(s, inet.MessageSizeMax)
	for {
		lr := &berty.LocalRecord{}
		switch err := pbr.ReadMsg(lr); err {
		case io.EOF:
			s.Close()
			return
		case nil: // do noting, everything fine
		default:
			s.Reset()
			logger().Error("invalid local record", zap.Error(err))
			return
		}

		logger().Debug("saving local record in cache",
			zap.String("remote peerID", s.Conn().RemotePeer().Pretty()),
			zap.String("remote contactID", lr.ID),
		)

		peerInfo := lrm.net.host.Peerstore().PeerInfo(s.Conn().RemotePeer())
		lrm.net.cache.UpdateCache(lr.ID, peerInfo)
	}
}

func (lrm *LocalRecordManager) sendLocalRecord(c inet.Conn) error {
	logger().Debug("sending local record", zap.String("peerID", c.RemotePeer().Pretty()))

	if c.RemotePeer() == lrm.net.host.ID() {
		return fmt.Errorf("cannot dial to self")
	}

	s, err := c.NewStream()
	if err != nil {
		return fmt.Errorf("new stream failed: `%s`", err.Error())
	}

	sw := helper.NewStreamWrapper(s, recProtocolID)
	if err != nil {
		return fmt.Errorf("new stream wrapper failed: `%s`", err.Error())
	}

	lr := &berty.LocalRecord{ID: lrm.net.localContactID}
	pbw := ggio.NewDelimitedWriter(sw)
	if err := pbw.WriteMsg(lr); err != nil {
		return fmt.Errorf("write stream failed: `%s`", err.Error())
	}

	go inet.FullClose(s)

	return nil
}
