package ipfsutil

import (
	"context"
	"os"

	ipfs_core "github.com/ipfs/go-ipfs/core"
	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/host"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/protocol"
	ma "github.com/multiformats/go-multiaddr"
	mafmt "github.com/multiformats/go-multiaddr-fmt"
	manet "github.com/multiformats/go-multiaddr/net"

	mc "berty.tech/berty/v2/go/internal/multipeer-connectivity-driver"
)

const recProtocolID = protocol.ID("berty/p2p/localrecord")

type LocalRecord struct {
	host host.Host
}

// OptionLocalRecord is given to CoreAPIOption.Options when the ipfs node setup
func OptionLocalRecord(node *ipfs_core.IpfsNode, api ipfs_interface.CoreAPI) error {
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
	ctx := context.Background() // FIXME: since go-libp2p-core@0.8.0 adds support for passed context on new call, we should think if we have a better context to pass here
	go func() {
		if manet.IsPrivateAddr(c.RemoteMultiaddr()) || mafmt.Base(mc.ProtocolCode).Matches(c.RemoteMultiaddr()) {
			if err := lr.sendLocalRecord(ctx, c); err != nil {
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

func (lr *LocalRecord) sendLocalRecord(ctx context.Context, c network.Conn) error {
	s, err := c.NewStream(ctx)
	if err != nil {
		return err
	}
	s.SetProtocol(recProtocolID)
	return nil
}

func (lr *LocalRecord) handleLocalRecords(s network.Stream) {
	os.Stderr.WriteString("handleLocalRecords")
}
