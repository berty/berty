package network

import (
	"fmt"
	"io"
	onet "net"
	"regexp"

	"berty.tech/core/entity"
	"berty.tech/core/network/helper"
	ggio "github.com/gogo/protobuf/io"
	inet "github.com/libp2p/go-libp2p-net"
	protocol "github.com/libp2p/go-libp2p-protocol"
	filter "github.com/libp2p/go-maddr-filter"
	ma "github.com/multiformats/go-multiaddr"
	"go.uber.org/zap"
)

var (
	recProtocolID  = protocol.ID("berty/p2p/localrecord")
	privateIPCIDRs = []string{
		"127.0.0.0/8",    // IPv4 loopback
		"10.0.0.0/8",     // RFC1918
		"172.16.0.0/12",  // RFC1918
		"192.168.0.0/16", // RFC1918
		"::1/128",        // IPv6 loopback
		"fe80::/10",      // IPv6 link-local
		"fc00::/7",       // IPv6 unique local addr
	}
	privateIPFilters = filter.NewFilters()
)

func init() {
	// Init private IP filters
	privateIPFilters.DefaultAction = filter.ActionDeny

	for _, privateIPCIDR := range privateIPCIDRs {
		_, ipnet, err := onet.ParseCIDR(privateIPCIDR)
		if err != nil {
			logger().Fatal("parsing CIDR failed", zap.Error(err), zap.String("CIDR", privateIPCIDR))
		}

		privateIPFilters.AddFilter(*ipnet, filter.ActionAccept)
	}
}

type LocalRecordManager struct {
	net *Network
}

func NewLocalRecordManager(net *Network) *LocalRecordManager {
	lrm := &LocalRecordManager{
		net: net,
	}

	net.host.Network().Notify(lrm)
	net.host.SetStreamHandler(recProtocolID, lrm.handleLocalRecord)

	return lrm
}

func (lrm *LocalRecordManager) Connected(net inet.Network, c inet.Conn) {
	isPrivateIP := !privateIPFilters.AddrBlocked(c.RemoteMultiaddr())
	isBLEMultiaddr, err := regexp.Match(`^/ble/.+`, c.RemoteMultiaddr().Bytes())
	if err != nil {
		logger().Fatal("parsing regex failed", zap.Error(err))
	}

	if isBLEMultiaddr || isPrivateIP {
		if err := lrm.sendLocalRecord(c); err != nil {
			logger().Error("sending local record failed", zap.Error(err))
		} else {
			logger().Debug("sending local record succeeded",
				zap.String("peerID", c.RemotePeer().Pretty()),
			)
		}
	}
}

// Unused notifees
func (lrm *LocalRecordManager) Disconnected(net inet.Network, c inet.Conn)    {}
func (lrm *LocalRecordManager) Listen(n inet.Network, addr ma.Multiaddr)      {}
func (lrm *LocalRecordManager) ListenClose(n inet.Network, addr ma.Multiaddr) {}
func (lrm *LocalRecordManager) OpenedStream(n inet.Network, s inet.Stream)    {}
func (lrm *LocalRecordManager) ClosedStream(n inet.Network, s inet.Stream)    {}

func (lrm *LocalRecordManager) handleLocalRecord(s inet.Stream) {
	logger().Debug("receiving local record",
		zap.String("peerID", s.Conn().RemotePeer().Pretty()),
	)

	pbr := ggio.NewDelimitedReader(s, inet.MessageSizeMax)
	for {
		lr := &entity.LocalRecord{}
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
			zap.String("peerID", s.Conn().RemotePeer().Pretty()),
			zap.String("contactID", lr.ContactId),
		)

		peerInfo := lrm.net.host.Peerstore().PeerInfo(s.Conn().RemotePeer())
		lrm.net.cache.UpdateCache(lr.ContactId, peerInfo)
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

	lr := &entity.LocalRecord{ContactId: lrm.net.contactID}
	pbw := ggio.NewDelimitedWriter(sw)
	if err := pbw.WriteMsg(lr); err != nil {
		return fmt.Errorf("write stream failed: `%s`", err.Error())
	}

	go inet.FullClose(s)

	return nil
}
