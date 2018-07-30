package drivermock

import (
	"context"
	"fmt"

	"go.uber.org/zap"
	"google.golang.org/grpc"

	"github.com/berty/berty/core/api/p2p"
	"github.com/berty/berty/core/client"
	"github.com/berty/berty/core/network"
)

type peer struct {
	id   string
	conn *grpc.ClientConn
}

type Simple struct {
	network.Driver

	peers []peer
}

func NewSimple() *Simple {
	return &Simple{
		peers: make([]peer, 0),
	}
}

func (s *Simple) SendEvent(ctx context.Context, event *p2p.Event) error {
	for _, peer := range s.peers {
		if peer.id == event.ReceiverID {
			zap.L().Debug("Simple.SendEvent",
				zap.String("sender", event.SenderID),
				zap.String("receiver", event.ReceiverID),
			)
			_, err := client.New(peer.conn).P2p().Handle(p2p.SetSender(ctx, event.SenderID), event)
			return err
		}
	}
	zap.L().Error("AAAAAAAAAAAAAAAAA")
	return fmt.Errorf("peer not found")
}

func (s *Simple) AddPeer(id string, conn *grpc.ClientConn) {
	s.peers = append(s.peers, peer{id: id, conn: conn})
}
