package bertyvcissuer

import (
	"crypto/hmac"
	"crypto/sha256"
	"fmt"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/verifiablecredstypes"
)

func CodeGeneratorZero(_ *verifiablecredstypes.StateCode) (string, error) {
	return "000000", nil
}

type codeGeneratorEightDigits struct {
	secret []byte
}

func bytesToInt(input []byte) (uint64, error) {
	bytesRequired := 4

	if len(input) < bytesRequired {
		return 0, errcode.ErrInvalidInput.Wrap(fmt.Errorf("expected at least %d bytes", bytesRequired))
	}

	out := uint64(0)
	for i := uint64(0); i < uint64(bytesRequired); i++ {
		out |= uint64(input[i]) << (8 * i)
	}

	return out % 100000000, nil
}

func (c *codeGeneratorEightDigits) CodeGeneratorEightDigits(state *verifiablecredstypes.StateCode) (string, error) {
	if len(c.secret) == 0 {
		return "", errcode.ErrInvalidInput.Wrap(fmt.Errorf("secret needs to be defined"))
	}

	if len(state.BertyLink) == 0 {
		return "", errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid state: berty_link field needs to be defined"))
	}

	if len(state.Identifier) == 0 {
		return "", errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid state: identifier field needs to be defined"))
	}

	if len(state.Timestamp) == 0 {
		return "", errcode.ErrInvalidInput.Wrap(fmt.Errorf("invalid state: timestamp needs to be defined"))
	}

	h := hmac.New(sha256.New, c.secret)

	_, err := h.Write([]byte(state.BertyLink))
	if err != nil {
		return "", errcode.ErrStreamWrite.Wrap(err)
	}

	_, err = h.Write([]byte(state.Identifier))
	if err != nil {
		return "", errcode.ErrStreamWrite.Wrap(err)
	}

	_, err = h.Write(state.Timestamp)
	if err != nil {
		return "", errcode.ErrStreamWrite.Wrap(err)
	}

	sum := h.Sum(nil)
	codeAsInt, err := bytesToInt(sum[0:4])
	if err != nil {
		return "", errcode.ErrInternal.Wrap(err)
	}

	return fmt.Sprintf("%08d", codeAsInt), nil
}

func CodeGeneratorEightDigits(secret []byte) func(state *verifiablecredstypes.StateCode) (string, error) {
	generator := &codeGeneratorEightDigits{secret: secret}

	return generator.CodeGeneratorEightDigits
}
