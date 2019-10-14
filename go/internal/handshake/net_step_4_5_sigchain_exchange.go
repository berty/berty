package handshake

import (
	"context"

	"berty.tech/go/internal/crypto"

	"github.com/pkg/errors"

	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
)

type step4or5CheckSigChainProof struct {
	next HandshakeFrame_HandshakeStep
}

func (s *step4or5CheckSigChainProof) isReadAction() bool { return true }
func (s *step4or5CheckSigChainProof) action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (*HandshakeFrame_HandshakeStep, error) {
	payload, err := decryptPayload(f.session, readMsg.EncryptedPayload)
	if err != nil {
		return nil, errors.Wrap(err, "can't decrypt payload")
	}

	signKey, err := p2pcrypto.UnmarshalPublicKey(payload.DeviceKey)
	if err != nil {
		return nil, errors.Wrap(err, "can't unmarshal public key")
	}

	chain := crypto.WrapSigChain(payload.SigChain, f.session.opts)

	if err = f.session.CheckOtherKeyProof(payload.Signature, chain, signKey); err != nil {
		return nil, errors.Wrap(err, "can't check other peer key proof")
	}

	f.provedDevicePubKey = signKey
	f.provedSigChain = chain

	return &s.next, nil
}

type step4or5SendSigChainProof struct {
	next HandshakeFrame_HandshakeStep
}

func (s *step4or5SendSigChainProof) isReadAction() bool { return false }
func (s *step4or5SendSigChainProof) action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (*HandshakeFrame_HandshakeStep, error) {
	proof, err := f.session.ProveOwnDeviceKey()
	if err != nil {
		return nil, errors.Wrap(err, "can't prove own device key")
	}

	devicePubKey, err := p2pcrypto.MarshalPublicKey(f.ownDevicePubKey)
	if err != nil {
		return nil, errors.Wrap(err, "can't marshal public key")
	}

	if err := writeEncryptedPayload(f.session, f.writer, step, &HandshakePayload{
		Signature: proof,
		SigChain:  f.ownSigChain.Unwrap(),
		DeviceKey: devicePubKey,
	}); err != nil {
		return nil, errors.Wrap(err, "can't write on conn")
	}

	return &s.next, nil
}
