package tinder

import (
	"context"
	"fmt"
	"time"

	libp2p_discovery "github.com/libp2p/go-libp2p-core/discovery"
	libp2p_peer "github.com/libp2p/go-libp2p-core/peer"
)

// Service is a Driver
var _ Driver = (Service)(nil)

// Service is a libp2p_discovery.Discovery
var _ libp2p_discovery.Discovery = (Service)(nil)

// Tinder Service
type Service interface {
	Driver

	RegisterDriver(driver Driver)
}

type service struct {
	drivers []Driver
}

func (s *service) RegisterDriver(driver Driver) {
	s.drivers = append(s.drivers, driver)
}

func (s *service) Advertise(ctx context.Context, ns string, opts ...libp2p_discovery.Option) (time.Duration, error) {
	return 0, fmt.Errorf("not implemented")
}

func (s *service) FindPeers(ctx context.Context, ns string, opts ...libp2p_discovery.Option) (<-chan libp2p_peer.AddrInfo, error) {
	return nil, fmt.Errorf("not implemented")
}

func (s *service) Unregister(ctx context.Context, ns string) error {
	return fmt.Errorf("not implemented")
}
