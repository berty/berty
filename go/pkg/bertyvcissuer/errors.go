package bertyvcissuer

import "fmt"

var (
	ErrNewConfigMissing                  = fmt.Errorf("config is required")
	ErrNewConfigPrivateKeyMissing        = fmt.Errorf("issuer private key is required")
	ErrNewConfigFlowMissing              = fmt.Errorf("flow is missing")
	ErrNewConfigFlowTypeUnimplemented    = fmt.Errorf("unimplemented flow type")
	ErrNewConfigFlowTypeMissing          = fmt.Errorf("flow type is missing")
	ErrNewConfigFlowCodeGeneratorMissing = fmt.Errorf("code generator is missing")
	ErrNewConfigFlowCodeSenderMissing    = fmt.Errorf("code emitter endpoint is required")

	ErrFlowStateMissing       = fmt.Errorf("a state is required")
	ErrFlowRedirectURIMissing = fmt.Errorf("a redirect_uri is required")
	ErrChallengeAuthenticity  = fmt.Errorf("unable to certify challenge")
	ErrChallengeVerify        = fmt.Errorf("unable to verify challenge")
	ErrChallengeExpired       = fmt.Errorf("expired challenge")
	ErrChallengeFailed        = fmt.Errorf("unable to verify challenge signature")

	ErrMsgInvalidIdentifier    = "Invalid identifier"
	ErrMsgUnableToSendCode     = "Unable to send code"
	ErrMsgUnableToGenerateCode = "Unable to generate code"
	ErrMsgInvalidCode          = "Invalid code submitted"
)
