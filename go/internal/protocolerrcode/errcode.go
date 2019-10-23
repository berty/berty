package protocolerrcode

import (
	fmt "fmt"
)

func (e ProtocolErrCode) Error() string {
	name, ok := ProtocolErrCode_name[int32(e)]
	if ok {
		return fmt.Sprintf("%s(#%d)", name, e)
	}
	return fmt.Sprintf("UNKNOWN_ERRCODE(#%d)", e)
}

func (e ProtocolErrCode) Code() int32 {
	return int32(e)
}

func (e ProtocolErrCode) Wrap(inner error) error { // returns an error that implements errcode.WithCode, but we cannot specify it because of a diammond dependency
	return protocolWrappedError{
		code:  int32(e),
		inner: inner,
	}
}

//
// ConfigurableError
//

type protocolWrappedError struct {
	code  int32
	inner error
}

func (e protocolWrappedError) Error() string {
	return fmt.Sprintf("%s: %v", ProtocolErrCode(e.code), e.inner)
}

func (e protocolWrappedError) Code() int32 {
	return e.code
}

// Cause returns the inner error (github.com/pkg/errors)
func (e protocolWrappedError) Cause() error {
	return e.inner
}

// Unwrap returns the inner error (go1.13)
func (e protocolWrappedError) Unwrap() error {
	return e.inner
}
