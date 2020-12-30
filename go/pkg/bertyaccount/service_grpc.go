package bertyaccount

import (
	context "context"
	"strings"

	ma "github.com/multiformats/go-multiaddr"
)

// Get GRPC listener addresses
func (s *service) GetGRPCListenerAddrs(ctx context.Context, req *GetGRPCListenerAddrs_Request) (*GetGRPCListenerAddrs_Reply, error) {
	m, err := s.getInitManager()
	if err != nil {
		return nil, err
	}

	grpcListeners := m.GetGRPCListeners()
	entries := make([]*GetGRPCListenerAddrs_Reply_Entry, len(grpcListeners))
	for i, l := range grpcListeners {
		ps := make([]string, 0)
		ma.ForEach(l.GRPCMultiaddr(), func(c ma.Component) bool {
			ps = append(ps, c.Protocol().Name)
			return true
		})

		proto := strings.Join(ps, "/")
		entries[i] = &GetGRPCListenerAddrs_Reply_Entry{
			Maddr: l.Addr().String(),
			Proto: proto,
		}
	}

	return &GetGRPCListenerAddrs_Reply{
		Entries: entries,
	}, nil
}
