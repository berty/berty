package bertyaccount

import (
	"context"
	"strings"

	"github.com/ipfs/kubo/core"
	ma "github.com/multiformats/go-multiaddr"

	"berty.tech/berty/v2/go/pkg/accounttypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
	"berty.tech/weshnet/v2/pkg/ipfsutil"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
)

// Get GRPC listener addresses
func (s *service) GetGRPCListenerAddrs(_ context.Context, _ *accounttypes.GetGRPCListenerAddrs_Request) (*accounttypes.GetGRPCListenerAddrs_Reply, error) {
	m, err := s.getInitManager()
	if err != nil {
		return nil, err
	}

	grpcListeners := m.GetGRPCListeners()
	entries := make([]*accounttypes.GetGRPCListenerAddrs_Reply_Entry, len(grpcListeners))
	for i, l := range grpcListeners {
		ps := make([]string, 0)
		ma.ForEach(l.GRPCMultiaddr(), func(c ma.Component) bool {
			ps = append(ps, c.Protocol().Name)
			return true
		})

		proto := strings.Join(ps, "/")
		entries[i] = &accounttypes.GetGRPCListenerAddrs_Reply_Entry{
			Maddr: l.Addr().String(),
			Proto: proto,
		}
	}

	return &accounttypes.GetGRPCListenerAddrs_Reply{
		Entries: entries,
	}, nil
}

// GetMessengerClient returns the Messenger Client of the actual Berty account if there is one selected.
func (s *service) GetMessengerClient() (messengertypes.MessengerServiceClient, error) {
	m, err := s.getInitManager()
	if err != nil {
		return nil, errcode.ErrCode_TODO.Wrap(err)
	}

	messenger, err := m.GetMessengerClient()
	if err != nil {
		return nil, errcode.ErrCode_TODO.Wrap(err)
	}

	return messenger, err
}

// GetIPFSNode returns the IPFS Node and core api interface
func (s *service) GetIPFSNode() (ipfsutil.ExtendedCoreAPI, *core.IpfsNode, error) {
	m, err := s.getInitManager()
	if err != nil {
		return nil, nil, errcode.ErrCode_TODO.Wrap(err)
	}

	return m.GetLocalIPFS()
}

// GetProtocolClient returns the Protocol Client of the actual Berty account if there is one selected.
func (s *service) GetProtocolClient() (protocoltypes.ProtocolServiceClient, error) {
	m, err := s.getInitManager()
	if err != nil {
		return nil, errcode.ErrCode_TODO.Wrap(err)
	}

	protocol, err := m.GetProtocolClient()
	if err != nil {
		return nil, errcode.ErrCode_TODO.Wrap(err)
	}

	return protocol, err
}
