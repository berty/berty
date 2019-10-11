package handshake

import (
	"context"
	"net"

	"go.uber.org/zap"

	"berty.tech/go/internal/crypto"

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
	ownSigChain        *crypto.SigChain
	ownDevicePubKey    p2pcrypto.PubKey
	provedSigChain     *crypto.SigChain
	provedDevicePubKey p2pcrypto.PubKey
	logger             *zap.Logger
}

func newHandshakeFlow(ctx context.Context, logger *zap.Logger, conn net.Conn, devPubKey p2pcrypto.PubKey, ownSigChain *crypto.SigChain, session *handshakeSession, steps map[HandshakeFrame_HandshakeStep]flowStep) (*crypto.SigChain, p2pcrypto.PubKey, error) {
	if conn == nil || session == nil || steps == nil {
		return nil, nil, ErrParams
	}

	writer := ggio.NewDelimitedWriter(conn)
	reader := ggio.NewDelimitedReader(conn, inet.MessageSizeMax)

	f := flow{
		logger:          logger,
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
	var retErr error

	if f.writer != nil {
		_ = f.writer.Close()
	}

	if f.reader != nil {
		_ = f.reader.Close()
	}

	if f.session != nil {
		_ = f.session.Close()
	}

	return retErr
}

func (f *flow) performFlow(ctx context.Context) (*crypto.SigChain, p2pcrypto.PubKey, error) {
	var err error
	defer func() { _ = f.close() }()

	initialStep := HandshakeFrame_STEP_1_KEY_AGREEMENT
	nextStep := &initialStep

	for nextStep != nil {
		if *nextStep == HandshakeFrame_STEP_9_DONE {
			if f.provedSigChain == nil || f.provedDevicePubKey == nil {
				return nil, nil, ErrNoAuthReturned
			}

			return f.provedSigChain, f.provedDevicePubKey, nil
		}

		currentStep := *nextStep

		step, ok := f.steps[*nextStep]
		if !ok {
			return nil, nil, ErrInvalidFlowStepNotFound
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
			return nil, nil, ErrInvalidFlow
		}
	}

	return nil, nil, ErrInvalidFlow
}

func Request(ctx context.Context, logger *zap.Logger, conn net.Conn, devicePrivateKey p2pcrypto.PrivKey, sigChain *crypto.SigChain, accountToReach p2pcrypto.PubKey) (*crypto.SigChain, p2pcrypto.PubKey, error) {
	session, err := newCryptoRequest(devicePrivateKey, sigChain, accountToReach)
	if err != nil {
		return nil, nil, err
	}

	return newHandshakeFlow(ctx, logger, conn, devicePrivateKey.GetPublic(), sigChain, session, map[HandshakeFrame_HandshakeStep]flowStep{
		HandshakeFrame_STEP_1_KEY_AGREEMENT:              &step1or2SendKeys{next: HandshakeFrame_STEP_2_KEY_AGREEMENT},
		HandshakeFrame_STEP_2_KEY_AGREEMENT:              &step1or2ReceiveKey{next: HandshakeFrame_STEP_3A_KNOWN_IDENTITY_PROOF},
		HandshakeFrame_STEP_3A_KNOWN_IDENTITY_PROOF:      &step3ProveOtherKey{next: HandshakeFrame_STEP_4A_KNOWN_IDENTITY_DISCLOSURE},
		HandshakeFrame_STEP_4A_KNOWN_IDENTITY_DISCLOSURE: &step4or5CheckSigChainProof{next: HandshakeFrame_STEP_5A_KNOWN_IDENTITY_DISCLOSURE},
		HandshakeFrame_STEP_5A_KNOWN_IDENTITY_DISCLOSURE: &step4or5SendSigChainProof{next: HandshakeFrame_STEP_9_DONE},
	})
}

func Response(ctx context.Context, logger *zap.Logger, conn net.Conn, devicePrivateKey p2pcrypto.PrivKey, sigChain *crypto.SigChain) (*crypto.SigChain, p2pcrypto.PubKey, error) {
	session, err := newCryptoResponse(devicePrivateKey, sigChain)
	if err != nil {
		return nil, nil, err
	}

	return newHandshakeFlow(ctx, logger, conn, devicePrivateKey.GetPublic(), sigChain, session, map[HandshakeFrame_HandshakeStep]flowStep{
		HandshakeFrame_STEP_1_KEY_AGREEMENT:              &step1or2ReceiveKey{next: HandshakeFrame_STEP_2_KEY_AGREEMENT},
		HandshakeFrame_STEP_2_KEY_AGREEMENT:              &step1or2SendKeys{next: HandshakeFrame_STEP_3A_KNOWN_IDENTITY_PROOF},
		HandshakeFrame_STEP_3A_KNOWN_IDENTITY_PROOF:      &step3CheckOwnKey{next: HandshakeFrame_STEP_4A_KNOWN_IDENTITY_DISCLOSURE},
		HandshakeFrame_STEP_4A_KNOWN_IDENTITY_DISCLOSURE: &step4or5SendSigChainProof{next: HandshakeFrame_STEP_5A_KNOWN_IDENTITY_DISCLOSURE},
		HandshakeFrame_STEP_5A_KNOWN_IDENTITY_DISCLOSURE: &step4or5CheckSigChainProof{next: HandshakeFrame_STEP_9_DONE},
	})
}
