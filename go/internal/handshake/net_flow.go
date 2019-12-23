package handshake

import (
	"context"
	"net"

	"berty.tech/berty/go/internal/crypto"
	"berty.tech/berty/go/pkg/errcode"
	ggio "github.com/gogo/protobuf/io"
	p2pcrypto "github.com/libp2p/go-libp2p-core/crypto"
	inet "github.com/libp2p/go-libp2p-core/network"
)

type flowStep interface {
	action(ctx context.Context, f *flow, step HandshakeFrame_HandshakeStep, readMsg *HandshakeFrame) (nextStep *HandshakeFrame_HandshakeStep, err error)
	isReadAction() bool
}

type flow struct {
	reader             ggio.ReadCloser
	writer             ggio.WriteCloser
	session            *handshakeSession
	steps              map[HandshakeFrame_HandshakeStep]flowStep
	ownSigChain        crypto.SigChainManager
	ownDevicePubKey    p2pcrypto.PubKey
	provedSigChain     crypto.SigChainManager
	provedDevicePubKey p2pcrypto.PubKey
}

func newHandshakeFlow(ctx context.Context, conn net.Conn, devPubKey p2pcrypto.PubKey, ownSigChain crypto.SigChainManager, session *handshakeSession, steps map[HandshakeFrame_HandshakeStep]flowStep) (crypto.SigChainManager, p2pcrypto.PubKey, error) {
	if conn == nil || session == nil || steps == nil {
		return nil, nil, errcode.ErrHandshakeParams
	}

	writer := ggio.NewDelimitedWriter(conn)
	reader := ggio.NewDelimitedReader(conn, inet.MessageSizeMax)

	f := flow{
		reader:          reader,
		writer:          writer,
		session:         session,
		steps:           steps,
		ownDevicePubKey: devPubKey,
		ownSigChain:     ownSigChain,
	}

	return f.performFlow(ctx)
}

func (f *flow) close() error {
	if f.writer != nil {
		_ = f.writer.Close()
	}

	if f.reader != nil {
		_ = f.reader.Close()
	}

	if f.session != nil {
		_ = f.session.Close()
	}

	return nil
}

func (f *flow) performFlow(ctx context.Context) (crypto.SigChainManager, p2pcrypto.PubKey, error) {
	var err error
	defer func() { _ = f.close() }()

	initialStep := HandshakeFrame_STEP_1_KEY_AGREEMENT
	nextStep := &initialStep

	for nextStep != nil {
		if *nextStep == HandshakeFrame_STEP_9_DONE {
			if f.provedSigChain == nil || f.provedDevicePubKey == nil {
				return nil, nil, errcode.ErrHandshakeNoAuthReturned
			}

			return f.provedSigChain, f.provedDevicePubKey, nil
		}

		currentStep := *nextStep

		step, ok := f.steps[*nextStep]
		if !ok {
			return nil, nil, errcode.ErrHandshakeInvalidFlowStepNotFound
		}

		var readMsg = &HandshakeFrame{}
		if step.isReadAction() {
			// TODO: time out

			if err := f.reader.ReadMsg(readMsg); err != nil {
				return nil, nil, err
			}

		}

		if nextStep, err = step.action(ctx, f, *nextStep, readMsg); err != nil {
			return nil, nil, err
		}

		if *nextStep == currentStep {
			return nil, nil, errcode.ErrHandshakeInvalidFlow
		}
	}

	return nil, nil, errcode.ErrHandshakeInvalidFlow
}

func Request(ctx context.Context, conn net.Conn, devicePrivateKey p2pcrypto.PrivKey, sigChain crypto.SigChainManager, accountToReach p2pcrypto.PubKey, opts *crypto.Opts) (crypto.SigChainManager, p2pcrypto.PubKey, error) {
	session, err := newCryptoRequest(devicePrivateKey, sigChain, accountToReach, opts)
	if err != nil {
		return nil, nil, err
	}

	return newHandshakeFlow(ctx, conn, devicePrivateKey.GetPublic(), sigChain, session, map[HandshakeFrame_HandshakeStep]flowStep{
		HandshakeFrame_STEP_1_KEY_AGREEMENT:              &step1or2SendKeys{next: HandshakeFrame_STEP_2_KEY_AGREEMENT},
		HandshakeFrame_STEP_2_KEY_AGREEMENT:              &step1or2ReceiveKey{next: HandshakeFrame_STEP_3A_KNOWN_IDENTITY_PROOF},
		HandshakeFrame_STEP_3A_KNOWN_IDENTITY_PROOF:      &step3ProveOtherKey{next: HandshakeFrame_STEP_4A_KNOWN_IDENTITY_DISCLOSURE},
		HandshakeFrame_STEP_4A_KNOWN_IDENTITY_DISCLOSURE: &step4or5CheckSigChainProof{next: HandshakeFrame_STEP_5A_KNOWN_IDENTITY_DISCLOSURE},
		HandshakeFrame_STEP_5A_KNOWN_IDENTITY_DISCLOSURE: &step4or5SendSigChainProof{next: HandshakeFrame_STEP_9_DONE},
	})
}

func Response(ctx context.Context, conn net.Conn, devicePrivateKey p2pcrypto.PrivKey, sigChain crypto.SigChainManager, opts *crypto.Opts) (crypto.SigChainManager, p2pcrypto.PubKey, error) {
	session, err := newCryptoResponse(devicePrivateKey, sigChain, opts)
	if err != nil {
		return nil, nil, err
	}

	return newHandshakeFlow(ctx, conn, devicePrivateKey.GetPublic(), sigChain, session, map[HandshakeFrame_HandshakeStep]flowStep{
		HandshakeFrame_STEP_1_KEY_AGREEMENT:              &step1or2ReceiveKey{next: HandshakeFrame_STEP_2_KEY_AGREEMENT},
		HandshakeFrame_STEP_2_KEY_AGREEMENT:              &step1or2SendKeys{next: HandshakeFrame_STEP_3A_KNOWN_IDENTITY_PROOF},
		HandshakeFrame_STEP_3A_KNOWN_IDENTITY_PROOF:      &step3CheckOwnKey{next: HandshakeFrame_STEP_4A_KNOWN_IDENTITY_DISCLOSURE},
		HandshakeFrame_STEP_4A_KNOWN_IDENTITY_DISCLOSURE: &step4or5SendSigChainProof{next: HandshakeFrame_STEP_5A_KNOWN_IDENTITY_DISCLOSURE},
		HandshakeFrame_STEP_5A_KNOWN_IDENTITY_DISCLOSURE: &step4or5CheckSigChainProof{next: HandshakeFrame_STEP_9_DONE},
	})
}
