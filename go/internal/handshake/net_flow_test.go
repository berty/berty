package handshake

import (
	"bytes"
	"context"
	"crypto/rand"
	"errors"
	"net"
	"sync"
	"testing"
	"time"

	"berty.tech/go/internal/crypto"
	ggio "github.com/gogo/protobuf/io"
	"github.com/gogo/protobuf/proto"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
)

var ErrDummy = errors.New("handshake: dummy")
var ErrNoIncomingMessage = errors.New("handshake: missing incoming message")
var ErrNotExpectedMsg = errors.New("handshake: not expected message")

type dummyReader struct {
	msg *HandshakeFrame
}

func (d *dummyReader) ReadMsg(msg proto.Message) error {
	data, err := d.msg.Marshal()
	if err != nil {
		return err
	}

	return proto.Unmarshal(data[:], msg)
}

func (d *dummyReader) Close() error {
	return nil
}

var _ ggio.ReadCloser = (*dummyReader)(nil)

type dummyStep struct {
	next        HandshakeFrame_HandshakeStep
	err         error
	read        bool
	expectedMsg *HandshakeFrame
}

func (s *dummyStep) isReadAction() bool { return s.read }
func (s *dummyStep) action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (*HandshakeFrame_HandshakeStep, error) {
	if s.read {
		if readMsg == nil {
			return nil, ErrNoIncomingMessage
		}

		if readMsg.Step != s.expectedMsg.Step || bytes.Compare(readMsg.EncryptedPayload, s.expectedMsg.EncryptedPayload) != 0 {
			return nil, ErrNotExpectedMsg
		}
	}

	return &s.next, s.err
}

type dummySetCredsStep struct {
	next         HandshakeFrame_HandshakeStep
	sigChain     *crypto.SigChain
	devicePubKey p2pcrypto.PubKey
}

func (s *dummySetCredsStep) isReadAction() bool { return false }
func (s *dummySetCredsStep) action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (*HandshakeFrame_HandshakeStep, error) {
	_, provedDevicePubKey, err := p2pcrypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, err
	}

	f.provedDevicePubKey = provedDevicePubKey
	f.provedSigChain = crypto.WrapSigChain(&crypto.SigChain{}, nil)

	return &s.next, nil
}

func Test_flow_performFlow(t *testing.T) {
	ctx := context.Background()

	expectedMsg := &HandshakeFrame{
		Step:             HandshakeFrame_STEP_1_KEY_AGREEMENT,
		EncryptedPayload: []byte("dummy"),
	}

	cases := []struct {
		name     string
		steps    map[HandshakeFrame_HandshakeStep]flowStep
		expected error
		reader   ggio.ReadCloser
	}{
		{
			name:     "no steps",
			steps:    map[HandshakeFrame_HandshakeStep]flowStep{},
			expected: ErrInvalidFlowStepNotFound,
		},
		{
			name: "single valid, no authenticated returned",
			steps: map[HandshakeFrame_HandshakeStep]flowStep{
				HandshakeFrame_STEP_1_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_9_DONE,
				},
			},
			expected: ErrNoAuthReturned,
		},
		{
			name: "single valid, read, no authenticated returned",
			steps: map[HandshakeFrame_HandshakeStep]flowStep{
				HandshakeFrame_STEP_1_KEY_AGREEMENT: &dummyStep{
					next:        HandshakeFrame_STEP_9_DONE,
					read:        true,
					expectedMsg: expectedMsg,
				},
			},
			reader:   &dummyReader{msg: expectedMsg},
			expected: ErrNoAuthReturned,
		},
		{
			name: "single invalid looping",
			steps: map[HandshakeFrame_HandshakeStep]flowStep{
				HandshakeFrame_STEP_1_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_1_KEY_AGREEMENT,
				},
			},
			expected: ErrInvalidFlow,
		},
		{
			name: "single invalid end",
			steps: map[HandshakeFrame_HandshakeStep]flowStep{
				HandshakeFrame_STEP_1_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_2_KEY_AGREEMENT,
				},
			},
			expected: ErrInvalidFlowStepNotFound,
		},
		{
			name: "single invalid start",
			steps: map[HandshakeFrame_HandshakeStep]flowStep{
				HandshakeFrame_STEP_2_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_9_DONE,
				},
			},
			expected: ErrInvalidFlowStepNotFound,
		},
		{
			name: "multiple valid, no authenticated returned",
			steps: map[HandshakeFrame_HandshakeStep]flowStep{
				HandshakeFrame_STEP_1_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_2_KEY_AGREEMENT,
				},
				HandshakeFrame_STEP_2_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_9_DONE,
				},
			},
			expected: ErrNoAuthReturned,
		},
		{
			name: "multiple valid, authenticated returned",
			steps: map[HandshakeFrame_HandshakeStep]flowStep{
				HandshakeFrame_STEP_1_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_2_KEY_AGREEMENT,
				},
				HandshakeFrame_STEP_2_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_3A_KNOWN_IDENTITY_PROOF,
				},
				HandshakeFrame_STEP_3A_KNOWN_IDENTITY_PROOF: &dummySetCredsStep{
					next: HandshakeFrame_STEP_9_DONE,
				},
			},
			expected: nil,
		},
		{
			name: "multiple erroring",
			steps: map[HandshakeFrame_HandshakeStep]flowStep{
				HandshakeFrame_STEP_1_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_2_KEY_AGREEMENT,
					err:  ErrDummy,
				},
				HandshakeFrame_STEP_2_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_9_DONE,
				},
			},
			expected: ErrDummy,
		},
	}

	for _, c := range cases {
		f := flow{
			steps:  c.steps,
			reader: c.reader,
		}

		_, _, err := f.performFlow(ctx)
		if err != c.expected {
			t.Fatalf("invalid flow for case %s (got error %v, expected %v)", c.name, err, c.expected)
		}
	}
}

func Test_Request_Response(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*2)
	defer cancel()

	reqCrypto, reqPrivateKey, err := crypto.InitNewIdentity(ctx, nil)
	if err != nil {
		t.Fatalf("unable to create an identity")
		return
	}

	resCrypto, resPrivateKey, err := crypto.InitNewIdentity(ctx, nil)
	if err != nil {
		t.Fatalf("unable to create an identity")
		return
	}

	wg := sync.WaitGroup{}
	wg.Add(2)

	reqConn, resConn := net.Pipe()

	go func() {
		defer wg.Done()

		initialEntry, err := resCrypto.GetSigChain().GetInitialEntry()
		if err != nil {
			t.Fatalf("unable to get initial sigchain entry of requestee on requester side: %v", err)
			return
		}

		accountPk, err := initialEntry.GetSubject()
		if err != nil {
			t.Fatalf("unable to get initial sigchain entry of requestee on requester side: %v", err)
			return
		}

		reqProvedSigChain, reqProvedKey, err := Request(ctx, reqConn, reqPrivateKey, reqCrypto.GetSigChain(), accountPk, nil)
		if err != nil {
			t.Fatalf("unable to perform handshake on requester side: %v", err)
			return
		}

		if !reqProvedKey.Equals(resPrivateKey.GetPublic()) {
			t.Fatalf("sig chain found on requester side is invalid")
			return
		}

		_ = reqProvedSigChain

	}()

	go func() {
		defer wg.Done()

		resProvedSigChain, resProvedKey, err := Response(ctx, resConn, resPrivateKey, resCrypto.GetSigChain(), nil)
		if err != nil {
			t.Fatalf("unable to perform handshake on requestee side: %v", err)
			return
		}

		if !resProvedKey.Equals(reqPrivateKey.GetPublic()) {
			t.Fatalf("sig chain found on requestee side is invalid")
			return
		}

		_ = resProvedSigChain
	}()

	go func() {
		select {
		case <-time.After(time.Second * 2):
			// TODO: find something cleaner
			wg.Done()
			wg.Done()
			t.Fail()
		case <-ctx.Done():
			return
		}
	}()

	wg.Wait()
}
