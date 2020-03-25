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

	"berty.tech/berty/v2/go/pkg/errcode"
	ggio "github.com/gogo/protobuf/io"
	"github.com/gogo/protobuf/proto"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var (
	ErrDummy             = errors.New("handshake: dummy")
	ErrNoIncomingMessage = errors.New("handshake: missing incoming message")
	ErrNotExpectedMsg    = errors.New("handshake: not expected message")
)

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
	devicePubKey p2pcrypto.PubKey
}

func (s *dummySetCredsStep) isReadAction() bool { return false }
func (s *dummySetCredsStep) action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (*HandshakeFrame_HandshakeStep, error) {
	_, provedDevicePubKey, err := p2pcrypto.GenerateEd25519Key(rand.Reader)
	if err != nil {
		return nil, err
	}

	f.ownPK = provedDevicePubKey

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
			expected: errcode.ErrHandshakeInvalidFlowStepNotFound,
		},
		{
			name: "single valid, no authenticated returned",
			steps: map[HandshakeFrame_HandshakeStep]flowStep{
				HandshakeFrame_STEP_1_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_9_DONE,
				},
			},
			expected: errcode.ErrHandshakeNoAuthReturned,
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
			expected: errcode.ErrHandshakeNoAuthReturned,
		},
		{
			name: "single invalid looping",
			steps: map[HandshakeFrame_HandshakeStep]flowStep{
				HandshakeFrame_STEP_1_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_1_KEY_AGREEMENT,
				},
			},
			expected: errcode.ErrHandshakeInvalidFlow,
		},
		{
			name: "single invalid end",
			steps: map[HandshakeFrame_HandshakeStep]flowStep{
				HandshakeFrame_STEP_1_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_2_KEY_AGREEMENT,
				},
			},
			expected: errcode.ErrHandshakeInvalidFlowStepNotFound,
		},
		{
			name: "single invalid start",
			steps: map[HandshakeFrame_HandshakeStep]flowStep{
				HandshakeFrame_STEP_2_KEY_AGREEMENT: &dummyStep{
					next: HandshakeFrame_STEP_9_DONE,
				},
			},
			expected: errcode.ErrHandshakeInvalidFlowStepNotFound,
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
			expected: errcode.ErrHandshakeNoAuthReturned,
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

		_, err := f.performFlow(ctx)
		assert.Equal(t, c.expected, err, c.name)
	}
}

func Test_Request_Response(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*2)
	defer cancel()

	reqPrivateKey, _, err := p2pcrypto.GenerateEd25519Key(rand.Reader)
	require.NoError(t, err)

	resPrivateKey, _, err := p2pcrypto.GenerateEd25519Key(rand.Reader)
	require.NoError(t, err)

	wg := sync.WaitGroup{}
	wg.Add(2)

	reqConn, resConn := net.Pipe()

	go func() {
		defer wg.Done()

		reqProvedKey, err := Request(ctx, reqConn, reqPrivateKey, resPrivateKey.GetPublic())
		require.NoError(t, err)

		assert.True(t, reqProvedKey.Equals(resPrivateKey.GetPublic()), "sig chain found on requester side is invalid")
	}()

	go func() {
		defer wg.Done()

		resProvedKey, err := Response(ctx, resConn, resPrivateKey)
		require.NoError(t, err)

		assert.True(t, resProvedKey.Equals(reqPrivateKey.GetPublic()), "sig chain found on requestee side is invalid")
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
