package floodsub

import (
	"bufio"
	"context"
	"io"

	pb "github.com/libp2p/go-floodsub/pb"

	ggio "github.com/gogo/protobuf/io"
	proto "github.com/gogo/protobuf/proto"
	inet "github.com/libp2p/go-libp2p-net"
)

// get the initial RPC containing all of our subscriptions to send to new peers
func (p *PubSub) getHelloPacket() *RPC {
	var rpc RPC
	for t := range p.myTopics {
		as := &pb.RPC_SubOpts{
			Topicid:   proto.String(t),
			Subscribe: proto.Bool(true),
		}
		rpc.Subscriptions = append(rpc.Subscriptions, as)
	}
	return &rpc
}

func (p *PubSub) handleNewStream(s inet.Stream) {
	r := ggio.NewDelimitedReader(s, 1<<20)
	for {
		rpc := new(RPC)
		err := r.ReadMsg(&rpc.RPC)
		if err != nil {
			if err != io.EOF {
				s.Reset()
				log.Infof("error reading rpc from %s: %s", s.Conn().RemotePeer(), err)
			} else {
				// Just be nice. They probably won't read this
				// but it doesn't hurt to send it.
				s.Close()
			}
			select {
			case p.peerDead <- s.Conn().RemotePeer():
			case <-p.ctx.Done():
			}
			return
		}

		rpc.from = s.Conn().RemotePeer()
		select {
		case p.incoming <- rpc:
		case <-p.ctx.Done():
			// Close is useless because the other side isn't reading.
			s.Reset()
			return
		}
	}
}

func (p *PubSub) handleSendingMessages(ctx context.Context, s inet.Stream, outgoing <-chan *RPC) {
	bufw := bufio.NewWriter(s)
	wc := ggio.NewDelimitedWriter(bufw)

	writeMsg := func(msg proto.Message) error {
		err := wc.WriteMsg(msg)
		if err != nil {
			return err
		}

		return bufw.Flush()
	}

	defer inet.FullClose(s)
	for {
		select {
		case rpc, ok := <-outgoing:
			if !ok {
				return
			}

			err := writeMsg(&rpc.RPC)
			if err != nil {
				s.Reset()
				log.Infof("writing message to %s: %s", s.Conn().RemotePeer(), err)
				select {
				case p.peerDead <- s.Conn().RemotePeer():
				case <-ctx.Done():
				}
			}
		case <-ctx.Done():
			return
		}
	}
}

func rpcWithSubs(subs ...*pb.RPC_SubOpts) *RPC {
	return &RPC{
		RPC: pb.RPC{
			Subscriptions: subs,
		},
	}
}

func rpcWithMessages(msgs ...*pb.Message) *RPC {
	return &RPC{RPC: pb.RPC{Publish: msgs}}
}

func rpcWithControl(msgs []*pb.Message,
	ihave []*pb.ControlIHave,
	iwant []*pb.ControlIWant,
	graft []*pb.ControlGraft,
	prune []*pb.ControlPrune) *RPC {
	return &RPC{
		RPC: pb.RPC{
			Publish: msgs,
			Control: &pb.ControlMessage{
				Ihave: ihave,
				Iwant: iwant,
				Graft: graft,
				Prune: prune,
			},
		},
	}
}
