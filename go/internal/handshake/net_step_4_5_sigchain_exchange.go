package handshake

import (
	"context"

	"berty.tech/go/internal/crypto"

	"berty.tech/go/pkg/iface"

	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
)

type step4or5CheckSigChainProof struct {
	next HandshakeFrame_HandshakeStep
}

func sigChainAsProto(chain iface.SigChain) (*crypto.SigChain, error) {
	p, ok := chain.(*crypto.SigChain)
	if !ok {
		return nil, ErrSigChainCast
	}

	return p, nil
}

func (s *step4or5CheckSigChainProof) isReadAction() bool { return true }
func (s *step4or5CheckSigChainProof) action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (*HandshakeFrame_HandshakeStep, error) {
	payload, err := decryptPayload(f.session, readMsg.EncryptedPayload)
	if err != nil {
		return nil, err
	}

	signKey, err := p2pcrypto.UnmarshalPublicKey(payload.DeviceKey)
	if err != nil {
		return nil, err
	}

	if err = f.session.CheckOtherKeyProof(payload.Signature, payload.SigChain, signKey); err != nil {
		return nil, err
	}

	f.provedDevicePubKey = signKey
	f.provedSigChain = payload.SigChain

	return &s.next, nil
}

type step4or5SendSigChainProof struct {
	next HandshakeFrame_HandshakeStep
}

func (s *step4or5SendSigChainProof) isReadAction() bool { return false }
func (s *step4or5SendSigChainProof) action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (*HandshakeFrame_HandshakeStep, error) {
	proof, err := f.session.ProveOwnDeviceKey()
	if err != nil {
		return nil, err
	}

	devicePubKey, err := p2pcrypto.MarshalPublicKey(f.ownDevicePubKey)
	if err != nil {
		return nil, err
	}

	sigChain, err := sigChainAsProto(f.ownSigChain)
	if err != nil {
		return nil, err
	}

	if err := writeEncryptedPayload(f.session, f.writer, step, &HandshakePayload{
		Signature: proof,
		SigChain:  sigChain,
		DeviceKey: devicePubKey,
	}); err != nil {
		return nil, err
	}

	return &s.next, nil
}
