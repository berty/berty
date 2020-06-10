package ipfsutil

import (
	"context"
	"os"

	mcma "berty.tech/berty/v2/go/internal/multipeer-connectivity-transport/multiaddr"
	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/protocol"
	ma "github.com/multiformats/go-multiaddr"
	manet "github.com/multiformats/go-multiaddr-net"
)

const recProtocolID = protocol.ID("berty/p2p/localrecord")

type LocalRecord struct {
	host host.Host
}

// OptionLocalRecord is given to CoreAPIOption.Options when the ipfs node setup
func OptionLocalRecord(ctx context.Context, node *ipfs_core.IpfsNode, api ipfs_interface.CoreAPI) error {
	lr := &LocalRecord{
		host: node.PeerHost,
	}
	lr.host.Network().Notify(lr)
	lr.host.SetStreamHandler(recProtocolID, lr.handleLocalRecords)

	return nil
}

// called when network starts listening on an addr
func (lr *LocalRecord) Listen(network.Network, ma.Multiaddr) {}

// called when network stops listening on an addr
func (lr *LocalRecord) ListenClose(network.Network, ma.Multiaddr) {}

// called when a connection opened
func (lr *LocalRecord) Connected(net network.Network, c network.Conn) {
	go func() {
		if manet.IsPrivateAddr(c.RemoteMultiaddr()) || mcma.MC.Matches(c.RemoteMultiaddr()) {
			if err := lr.sendLocalRecord(c); err != nil {
				return
			}
		}
	}()
}

// called when a connection closed
func (lr *LocalRecord) Disconnected(network.Network, network.Conn) {}

// called when a stream opened
func (lr *LocalRecord) OpenedStream(network.Network, network.Stream) {}

// called when a stream closed
func (lr *LocalRecord) ClosedStream(network.Network, network.Stream) {}

func (lr *LocalRecord) sendLocalRecord(c network.Conn) error {
	s, err := c.NewStream()
	if err != nil {
		return err
	}
	s.SetProtocol(recProtocolID)
	return nil
}

func (lr *LocalRecord) handleLocalRecords(s network.Stream) {
	os.Stderr.WriteString("handleLocalRecords")
}
