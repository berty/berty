package dht

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"sync"
	"time"

	ggio "github.com/gogo/protobuf/io"
	ctxio "github.com/jbenet/go-context/io"
	pb "github.com/libp2p/go-libp2p-kad-dht/pb"
	inet "github.com/libp2p/go-libp2p-net"
	peer "github.com/libp2p/go-libp2p-peer"
)

var dhtReadMessageTimeout = time.Minute
var ErrReadTimeout = fmt.Errorf("timed out reading response")

type bufferedWriteCloser interface {
	ggio.WriteCloser
	Flush() error
}

// The Protobuf writer performs multiple small writes when writing a message.
// We need to buffer those writes, to make sure that we're not sending a new
// packet for every single write.
type bufferedDelimitedWriter struct {
	*bufio.Writer
	ggio.WriteCloser
}

func newBufferedDelimitedWriter(str io.Writer) bufferedWriteCloser {
	w := bufio.NewWriter(str)
	return &bufferedDelimitedWriter{
		Writer:      w,
		WriteCloser: ggio.NewDelimitedWriter(w),
	}
}

func (w *bufferedDelimitedWriter) Flush() error {
	return w.Writer.Flush()
}

// handleNewStream implements the inet.StreamHandler
func (dht *IpfsDHT) handleNewStream(s inet.Stream) {
	go dht.handleNewMessage(s)
}

func (dht *IpfsDHT) handleNewMessage(s inet.Stream) {
	ctx := dht.Context()
	cr := ctxio.NewReader(ctx, s) // ok to use. we defer close stream in this func
	cw := ctxio.NewWriter(ctx, s) // ok to use. we defer close stream in this func
	r := ggio.NewDelimitedReader(cr, inet.MessageSizeMax)
	w := newBufferedDelimitedWriter(cw)
	mPeer := s.Conn().RemotePeer()

	for {
		// receive msg
		pmes := new(pb.Message)
		switch err := r.ReadMsg(pmes); err {
		case io.EOF:
			s.Close()
			return
		case nil:
		default:
			s.Reset()
			log.Debugf("Error unmarshaling data: %s", err)
			return
		}

		// update the peer (on valid msgs only)
		dht.updateFromMessage(ctx, mPeer, pmes)

		// get handler for this msg type.
		handler := dht.handlerForMsgType(pmes.GetType())
		if handler == nil {
			s.Reset()
			log.Debug("got back nil handler from handlerForMsgType")
			return
		}

		// dispatch handler.
		rpmes, err := handler(ctx, mPeer, pmes)
		if err != nil {
			s.Reset()
			log.Debugf("handle message error: %s", err)
			return
		}

		// if nil response, return it before serializing
		if rpmes == nil {
			log.Debug("got back nil response from request")
			continue
		}

		// send out response msg
		err = w.WriteMsg(rpmes)
		if err == nil {
			err = w.Flush()
		}
		if err != nil {
			s.Reset()
			log.Debugf("send response error: %s", err)
			return
		}
	}
}

// sendRequest sends out a request, but also makes sure to
// measure the RTT for latency measurements.
func (dht *IpfsDHT) sendRequest(ctx context.Context, p peer.ID, pmes *pb.Message) (*pb.Message, error) {

	ms, err := dht.messageSenderForPeer(p)
	if err != nil {
		return nil, err
	}

	start := time.Now()

	rpmes, err := ms.SendRequest(ctx, pmes)
	if err != nil {
		return nil, err
	}

	// update the peer (on valid msgs only)
	dht.updateFromMessage(ctx, p, rpmes)

	dht.peerstore.RecordLatency(p, time.Since(start))
	log.Event(ctx, "dhtReceivedMessage", dht.self, p, rpmes)
	return rpmes, nil
}

// sendMessage sends out a message
func (dht *IpfsDHT) sendMessage(ctx context.Context, p peer.ID, pmes *pb.Message) error {
	ms, err := dht.messageSenderForPeer(p)
	if err != nil {
		return err
	}

	if err := ms.SendMessage(ctx, pmes); err != nil {
		return err
	}
	log.Event(ctx, "dhtSentMessage", dht.self, p, pmes)
	return nil
}

func (dht *IpfsDHT) updateFromMessage(ctx context.Context, p peer.ID, mes *pb.Message) error {
	// Make sure that this node is actually a DHT server, not just a client.
	protos, err := dht.peerstore.SupportsProtocols(p, dht.protocolStrs()...)
	if err == nil && len(protos) > 0 {
		dht.Update(ctx, p)
	}
	return nil
}

func (dht *IpfsDHT) messageSenderForPeer(p peer.ID) (*messageSender, error) {
	dht.smlk.Lock()
	ms, ok := dht.strmap[p]
	if ok {
		dht.smlk.Unlock()
		return ms, nil
	}
	ms = &messageSender{p: p, dht: dht}
	dht.strmap[p] = ms
	dht.smlk.Unlock()

	if err := ms.prepOrInvalidate(); err != nil {
		dht.smlk.Lock()
		defer dht.smlk.Unlock()

		if msCur, ok := dht.strmap[p]; ok {
			// Changed. Use the new one, old one is invalid and
			// not in the map so we can just throw it away.
			if ms != msCur {
				return msCur, nil
			}
			// Not changed, remove the now invalid stream from the
			// map.
			delete(dht.strmap, p)
		}
		// Invalid but not in map. Must have been removed by a disconnect.
		return nil, err
	}
	// All ready to go.
	return ms, nil
}

type messageSender struct {
	s   inet.Stream
	r   ggio.ReadCloser
	w   bufferedWriteCloser
	lk  sync.Mutex
	p   peer.ID
	dht *IpfsDHT

	invalid   bool
	singleMes int
}

// invalidate is called before this messageSender is removed from the strmap.
// It prevents the messageSender from being reused/reinitialized and then
// forgotten (leaving the stream open).
func (ms *messageSender) invalidate() {
	ms.invalid = true
	if ms.s != nil {
		ms.s.Reset()
		ms.s = nil
	}
}

func (ms *messageSender) prepOrInvalidate() error {
	ms.lk.Lock()
	defer ms.lk.Unlock()
	if err := ms.prep(); err != nil {
		ms.invalidate()
		return err
	}
	return nil
}

func (ms *messageSender) prep() error {
	if ms.invalid {
		return fmt.Errorf("message sender has been invalidated")
	}
	if ms.s != nil {
		return nil
	}

	nstr, err := ms.dht.host.NewStream(ms.dht.ctx, ms.p, ms.dht.protocols...)
	if err != nil {
		return err
	}

	ms.r = ggio.NewDelimitedReader(nstr, inet.MessageSizeMax)
	ms.w = newBufferedDelimitedWriter(nstr)
	ms.s = nstr

	return nil
}

// streamReuseTries is the number of times we will try to reuse a stream to a
// given peer before giving up and reverting to the old one-message-per-stream
// behaviour.
const streamReuseTries = 3

func (ms *messageSender) SendMessage(ctx context.Context, pmes *pb.Message) error {
	ms.lk.Lock()
	defer ms.lk.Unlock()
	retry := false
	for {
		if err := ms.prep(); err != nil {
			return err
		}

		if err := ms.writeMsg(pmes); err != nil {
			ms.s.Reset()
			ms.s = nil

			if retry {
				log.Info("error writing message, bailing: ", err)
				return err
			} else {
				log.Info("error writing message, trying again: ", err)
				retry = true
				continue
			}
		}

		log.Event(ctx, "dhtSentMessage", ms.dht.self, ms.p, pmes)

		if ms.singleMes > streamReuseTries {
			go inet.FullClose(ms.s)
			ms.s = nil
		} else if retry {
			ms.singleMes++
		}

		return nil
	}
}

func (ms *messageSender) SendRequest(ctx context.Context, pmes *pb.Message) (*pb.Message, error) {
	ms.lk.Lock()
	defer ms.lk.Unlock()
	retry := false
	for {
		if err := ms.prep(); err != nil {
			return nil, err
		}

		if err := ms.writeMsg(pmes); err != nil {
			ms.s.Reset()
			ms.s = nil

			if retry {
				log.Info("error writing message, bailing: ", err)
				return nil, err
			} else {
				log.Info("error writing message, trying again: ", err)
				retry = true
				continue
			}
		}

		mes := new(pb.Message)
		if err := ms.ctxReadMsg(ctx, mes); err != nil {
			ms.s.Reset()
			ms.s = nil

			if retry {
				log.Info("error reading message, bailing: ", err)
				return nil, err
			} else {
				log.Info("error reading message, trying again: ", err)
				retry = true
				continue
			}
		}

		log.Event(ctx, "dhtSentMessage", ms.dht.self, ms.p, pmes)

		if ms.singleMes > streamReuseTries {
			go inet.FullClose(ms.s)
			ms.s = nil
		} else if retry {
			ms.singleMes++
		}

		return mes, nil
	}
}

func (ms *messageSender) writeMsg(pmes *pb.Message) error {
	if err := ms.w.WriteMsg(pmes); err != nil {
		return err
	}
	return ms.w.Flush()
}

func (ms *messageSender) ctxReadMsg(ctx context.Context, mes *pb.Message) error {
	errc := make(chan error, 1)
	go func(r ggio.ReadCloser) {
		errc <- r.ReadMsg(mes)
	}(ms.r)

	t := time.NewTimer(dhtReadMessageTimeout)
	defer t.Stop()

	select {
	case err := <-errc:
		return err
	case <-ctx.Done():
		return ctx.Err()
	case <-t.C:
		return ErrReadTimeout
	}
}
