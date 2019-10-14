package handshake

import (
	ggio "github.com/gogo/protobuf/io"
	"github.com/pkg/errors"
)

func encryptPayload(session *handshakeSession, payload *HandshakePayload) ([]byte, error) {
	data, err := payload.Marshal()
	if err != nil {
		return nil, errors.Wrap(err, "can't marshal payload")
	}

	return session.Encrypt(data)
}

func writeEncryptedPayload(session *handshakeSession, writer ggio.WriteCloser, step HandshakeFrame_HandshakeStep, payload *HandshakePayload) error {
	var (
		data []byte
		err  error
	)

	if payload == nil {
		return ErrNoPayload
	}

	data, err = encryptPayload(session, payload)
	if err != nil {
		return errors.Wrap(err, "can't encrypt payload")
	}

	return writer.WriteMsg(&HandshakeFrame{
		Step:             step,
		EncryptedPayload: data,
	})
}

func decryptPayload(session *handshakeSession, payload []byte) (*HandshakePayload, error) {
	instance := &HandshakePayload{}

	clear, err := session.Decrypt(payload)
	if err != nil {
		return nil, errors.Wrap(err, "can't decrypt payload")
	}

	if err = instance.Unmarshal(clear); err != nil {
		return nil, errors.Wrap(err, "can't unmarshal payload")
	}

	return instance, nil
}
