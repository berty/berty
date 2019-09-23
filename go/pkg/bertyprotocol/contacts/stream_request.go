package contacts

import (
	"context"
	"net"

	"berty.tech/go/pkg/iface"
)

type streamRequest struct {
}

func (s *streamRequest) GetID() []byte {
	panic("implement me")
}

func (s *streamRequest) GetPayload() []byte {
	panic("implement me")
}

func (s *streamRequest) GetDevice() iface.Device {
	panic("implement me")
}

func (s *streamRequest) AcceptRequest(ctx context.Context) (net.Conn, error) {
	panic("implement me")
}

func (s *streamRequest) DiscardRequest(ctx context.Context) error {
	panic("implement me")
}

func (s *streamRequest) RefuseRequest(ctx context.Context) error {
	panic("implement me")
}

var _ iface.StreamRequest = (*streamRequest)(nil)
