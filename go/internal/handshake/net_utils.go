package handshake

import (
	"berty.tech/go/pkg/errcode"
	ggio "github.com/gogo/protobuf/io"
)

func encryptPayload(session *handshakeSession, payload *HandshakePayload) ([]byte, error) {
	data, err := payload.Marshal()
	if err != nil {
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	return session.Encrypt(data)
}

func writeEncryptedPayload(session *handshakeSession, writer ggio.WriteCloser, step HandshakeFrame_HandshakeStep, payload *HandshakePayload) error {
	var (
		data []byte
		err  error
	)

	if payload == nil {
		return errcode.ErrProtocolHandshakeNoPayload
	}

	data, err = encryptPayload(session, payload)
	if err != nil {
		return errcode.ProtocolTODO.Wrap(err)
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
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	if err = instance.Unmarshal(clear); err != nil {
		return nil, errcode.ProtocolTODO.Wrap(err)
	}

	return instance, nil
}
