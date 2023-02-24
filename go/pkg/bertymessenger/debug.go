package bertymessenger

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"net/http/pprof"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"

	"github.com/gogo/protobuf/proto"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

type debugCommand struct {
	mu sync.Mutex

	// pprof
	pprofEnable bool
	pprofListn  net.Listener

	// msgsession
	msgsession uint64
}

func (svc *service) debug(ctx context.Context, req *messengertypes.Interact_Request, cmd string) error {
	svc.dd.mu.Lock()
	defer svc.dd.mu.Unlock()

	argsv := strings.Split(strings.TrimSpace(cmd), " ")
	if len(argsv) == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("empty command"))
	}

	switch cmd, args := argsv[0], argsv[1:]; cmd {
	case "pprof":
		return svc.monitorCmd(ctx, req, args)
	case "send":
		return svc.sendCmd(ctx, req, args)
	default:
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid debug command: %s", cmd))
	}
}

func (svc *service) monitorCmd(_ context.Context, _ *messengertypes.Interact_Request, args []string) error {
	isEnable := svc.dd.pprofEnable

	if len(args) == 0 {
		if isEnable {
			args = []string{"stop"}
		} else {
			args = []string{"start"}
		}
	}

	switch {
	case !isEnable && args[0] == "start":
		listn := "0.0.0.0:3615"
		if len(args) > 1 {
			port, err := strconv.ParseUint(args[1], 10, 0)
			if err != nil {
				return errcode.ErrInvalidInput.Wrap(fmt.Errorf("wrong port number"))
			}

			listn = fmt.Sprintf("0.0.0.0:%d", port)
		}

		l, err := net.Listen("tcp", listn) // nolint:gosec
		if err != nil {
			return errcode.ErrInternal.Wrap(fmt.Errorf("unable to listen: %w", err))
		}
		svc.dd.pprofListn = l

		svc.logger.Debug("start pprof listner", zap.String("addr", l.Addr().String()))

		mux := http.NewServeMux()
		mux.HandleFunc("/debug/pprof", pprof.Index)
		mux.HandleFunc("/debug/pprof/cmdline", pprof.Cmdline)
		mux.HandleFunc("/debug/pprof/profile", pprof.Profile)
		mux.HandleFunc("/debug/pprof/symbol", pprof.Symbol)
		mux.HandleFunc("/debug/pprof/trace", pprof.Trace)

		// start serve
		go func() {
			if err := http.Serve(l, mux); err != nil { // nolint:gosec
				svc.logger.Error("unable to serve debug command", zap.Error(err))
			}
		}()

	case isEnable && args[0] == "stop":
		if l := svc.dd.pprofListn; l != nil {
			svc.logger.Debug("stop pprof listner", zap.String("addr", l.Addr().String()))

			svc.dd.pprofListn.Close()
			svc.dd.pprofListn = nil
		}
	default:
		return errcode.ErrInternal.Wrap(fmt.Errorf("invalid command: %s", args[0]))
	}

	svc.dd.pprofEnable = !isEnable
	svc.logger.Debug("pprof status", zap.Bool("enable", svc.dd.pprofEnable))
	return nil
}

func (svc *service) sendCmd(_ context.Context, req *messengertypes.Interact_Request, args []string) error {
	if len(args) == 0 {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("send require a number as argument"))
	}

	nmsgs, err := strconv.ParseUint(args[0], 10, 0)
	switch {
	case err != nil:
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("unable to parse number of messages to send"))
	case nmsgs > 10000:
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("cannot send more than 10000 messages"))
	default: // ok
	}

	mask := fmt.Sprintf("S%%02dE%%0%dd - %%s", len(fmt.Sprintf("%d", nmsgs)))
	sess := atomic.AddUint64(&svc.dd.msgsession, 1)
	msg := "message"
	if len(args) > 1 {
		msg = args[1]
	}

	svc.logger.Debug("sending debug message", zap.String("msg", msg), zap.Uint64("session", sess), zap.Uint64("n", nmsgs))

	go func() {
		ctx, cancel := context.WithCancel(context.Background()) // ignore top context
		defer cancel()

		var m messengertypes.AppMessage_UserMessage
		var i uint64
		for i = 0; i < nmsgs; i++ {
			m.Body = fmt.Sprintf(mask, sess, i+1, msg)
			p, err := proto.Marshal(&m)
			if err != nil {
				svc.logger.Error("unable to marshal message", zap.Error(err))
				return
			}

			_, err = svc.Interact(ctx, &messengertypes.Interact_Request{
				Type:                  messengertypes.AppMessage_TypeUserMessage,
				Payload:               p,
				ConversationPublicKey: req.ConversationPublicKey,
				TargetCID:             req.TargetCID,
			})
			if err != nil {
				svc.logger.Error("unable to marshal message", zap.Error(err))
				return
			}
		}

		svc.logger.Debug("sending debug message done", zap.Uint64("numbers", nmsgs))
	}()

	return nil
}
