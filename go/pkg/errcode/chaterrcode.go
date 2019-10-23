package errcode

import fmt "fmt"

func (e ChatErrCode) Error() string {
	name, ok := ChatErrCode_name[int32(e)]
	if ok {
		return fmt.Sprintf("%s(#%d)", name, e)
	}
	return fmt.Sprintf("UNKNOWN_ERRCODE(#%d)", e)
}

func (e ChatErrCode) Code() int32 {
	return int32(e)
}

func (e ChatErrCode) Wrap(inner error) WithCode {
	return chatWrappedError{
		code:  int32(e),
		inner: inner,
	}
}

//
// ConfigurableError
//

type chatWrappedError struct {
	code  int32
	inner error
}

func (e chatWrappedError) Error() string {
	return fmt.Sprintf("%s: %v", ChatErrCode(e.code), e.inner)
}

func (e chatWrappedError) Code() int32 {
	return e.code
}

// Cause returns the inner error (github.com/pkg/errors)
func (e chatWrappedError) Cause() error {
	return e.inner
}

// Unwrap returns the inner error (go1.13)
func (e chatWrappedError) Unwrap() error {
	return e.inner
}
