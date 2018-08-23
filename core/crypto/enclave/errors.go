package enclave

import "github.com/pkg/errors"

var (
	ErrNotImplemented     = errors.New("not implemented")
	ErrUnsupportedKeyType = errors.New("unsupported keytype")
)
