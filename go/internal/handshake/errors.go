package handshake

type Error string

func (e Error) Error() string { return string(e) }

var (
	ErrNoPayload               = Error("handshake: no payload specified")
	ErrInvalidFlow             = Error("handshake: invalid flow")
	ErrInvalidFlowStepNotFound = Error("handshake: invalid flow, step not found")
	ErrParams                  = Error("handshake: can't init with supplied parameters")
	ErrNoAuthReturned          = Error("handshake: no authenticated sig chain or device key returned")
	ErrInvalidKeyType          = Error("handshake: invalid key type")
	ErrInvalidSignature        = Error("handshake: signature is not valid")
	ErrSessionInvalid          = Error("handshake: session has not been properly initialized")
	ErrKeyNotInSigChain        = Error("handshake: key not found in sig chain")
	ErrDecrypt                 = Error("handshake: unable to decrypt data")
)
