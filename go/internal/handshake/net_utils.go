package handshake

import (
	ggio "github.com/gogo/protobuf/io"
)

func encryptPayload(session *handshakeSession, payload *HandshakePayload) ([]byte, error) {
	data, err := payload.Marshal()
	if err != nil {
		return nil, err
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
		return err
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
		return nil, err
	}

	if err = instance.Unmarshal(clear); err != nil {
		return nil, err
	}

	return instance, nil
}
