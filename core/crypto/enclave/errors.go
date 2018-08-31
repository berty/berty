package enclave

import "github.com/pkg/errors"

var (
	ErrNotImplemented     = errors.New("not implemented yet")
	ErrNotImplementable   = errors.New("not implementable")
	ErrUnsupportedKeyAlgo = errors.New("unsupported crypto algorithm")
)
