package handshake

import (
	"context"

	"berty.tech/berty/v2/go/pkg/errcode"
)

type step3ProveOtherKey struct {
	next HandshakeFrame_HandshakeStep
}

func (s *step3ProveOtherKey) isReadAction() bool { return false }
func (s *step3ProveOtherKey) action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (*HandshakeFrame_HandshakeStep, error) {
	sig, err := f.session.ProveOtherKey()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	err = writeEncryptedPayload(f.session, f.writer, step, &HandshakePayload{
		Signature: sig,
	})
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &s.next, nil
}

type step3CheckOwnKey struct {
	next HandshakeFrame_HandshakeStep
}

func (s *step3CheckOwnKey) isReadAction() bool { return true }
func (s *step3CheckOwnKey) action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (*HandshakeFrame_HandshakeStep, error) {
	payload, err := decryptPayload(f.session, readMsg.EncryptedPayload)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if err := f.session.CheckOwnKeyProof(payload.Signature); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &s.next, nil
}
