package handshake

import (
	"context"

	"github.com/pkg/errors"

	"github.com/libp2p/go-libp2p-core/crypto"
)

type step1or2SendKeys struct {
	next HandshakeFrame_HandshakeStep
}

func (s *step1or2SendKeys) isReadAction() bool { return false }
func (s *step1or2SendKeys) action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (*HandshakeFrame_HandshakeStep, error) {
	signKey, encryptKey := f.session.GetPublicKeys()
	signKeyProto, err := crypto.MarshalPublicKey(signKey)
	if err != nil {
		return nil, errors.Wrap(err, "can't unmarshal public key")
	}

	if err = f.writer.WriteMsg(&HandshakeFrame{
		Step:          step,
		SignatureKey:  signKeyProto,
		EncryptionKey: encryptKey,
	}); err != nil {
		return nil, errors.Wrap(err, "can't write on conn")
	}

	return &s.next, nil
}

type step1or2ReceiveKey struct {
	next HandshakeFrame_HandshakeStep
}

func (s *step1or2ReceiveKey) isReadAction() bool { return true }
func (s *step1or2ReceiveKey) action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (*HandshakeFrame_HandshakeStep, error) {
	signKey, err := crypto.UnmarshalPublicKey(readMsg.SignatureKey)
	if err != nil {
		return nil, errors.Wrap(err, "can't unmarshal public key")
	}

	if err := f.session.SetOtherKeys(signKey, readMsg.EncryptionKey); err != nil {
		return nil, errors.Wrap(err, "can't set keys for other peer")
	}

	return &s.next, nil
}
