package bertyvcissuer

import (
	"context"
	"fmt"

	"github.com/nyaruka/phonenumbers"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/errcode"
)

type PhoneCodeSenderMockService struct {
	Logger *zap.Logger
}

func (m *PhoneCodeSenderMockService) SendVerificationCode(_ context.Context, in SendVerificationCodeData) error {
	logger := m.Logger
	if logger == nil {
		logger = zap.NewNop()
	}

	logger.Debug("Code not sent, but this is an expected behavior for testing", zap.String("recipient", in.Recipient), zap.String("code", in.Code))

	return nil
}

func (m *PhoneCodeSenderMockService) ValidateIdentifier(_ context.Context, rawIdentifier string) (string, error) {
	num, err := phonenumbers.Parse(rawIdentifier, "")
	if err != nil {
		return "", errcode.ErrCode_ErrInvalidInput.Wrap(err)
	}

	if !phonenumbers.IsValidNumber(num) {
		return "", errcode.ErrCode_ErrInvalidInput.Wrap(fmt.Errorf("phone number is invalid"))
	}

	return fmt.Sprintf("tel:%s", phonenumbers.Format(num, phonenumbers.E164)), nil
}

var _ VerificationCodeSender = (*PhoneCodeSenderMockService)(nil)
