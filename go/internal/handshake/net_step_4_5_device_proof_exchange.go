package handshake

import (
	"context"

	"berty.tech/berty/v2/go/pkg/errcode"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
)

type step4or5CheckSigChainProof struct {
	next HandshakeFrame_HandshakeStep
}

func (s *step4or5CheckSigChainProof) isReadAction() bool { return true }
func (s *step4or5CheckSigChainProof) action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (*HandshakeFrame_HandshakeStep, error) {
	payload, err := decryptPayload(f.session, readMsg.EncryptedPayload)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	signKey, err := p2pcrypto.UnmarshalPublicKey(payload.AccountKey)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if err = f.session.CheckOtherKeyProof(payload.Signature, signKey); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	f.otherPK = signKey

	return &s.next, nil
}

type step4or5SendSigChainProof struct {
	next HandshakeFrame_HandshakeStep
}

func (s *step4or5SendSigChainProof) isReadAction() bool { return false }
func (s *step4or5SendSigChainProof) action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (*HandshakeFrame_HandshakeStep, error) {
	proof, err := f.session.ProveOwnAccountKey()
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	accountPubKey, err := p2pcrypto.MarshalPublicKey(f.ownPK)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	if err := writeEncryptedPayload(f.session, f.writer, step, &HandshakePayload{
		Signature:  proof,
		AccountKey: accountPubKey,
	}); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return &s.next, nil
}
