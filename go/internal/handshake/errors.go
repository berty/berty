package handshake

import "errors"

var ErrNoPayload = errors.New("handshake: no payload specified")
var ErrInvalidFlow = errors.New("handshake: invalid flow")
var ErrInvalidFlowStepNotFound = errors.New("handshake: invalid flow, step not found")
var ErrParams = errors.New("handshake: can't init with supplied parameters")
var ErrSigChainCast = errors.New("handshake: can't cast sig chain")
var ErrNoAuthReturned = errors.New("handshake: no authenticated sig chain or device key returned")
var ErrInvalidKeyType = errors.New("handshake: invalid key type")
var ErrInvalidSignature = errors.New("handshake: signature is not valid")
var ErrSessionInvalid = errors.New("handshake: session has not been properly initialized")
var ErrKeyNotInSigChain = errors.New("handshake: key not found in sig chain")
var ErrDecrypt = errors.New("handshake: unable to decrypt data")
