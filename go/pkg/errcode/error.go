package errcode

import "fmt"

type WithCode interface {
	error
	Code() int32
}

// Code returns the code of the actual error without trying to unwrap it, or -1.
func Code(err error) int32 {
	typed, ok := err.(WithCode)
	if ok {
		return typed.Code()
	}
	return -1
}

// LastCode walks the passed error and returns the code of the latest ErrCode, or -1.
func LastCode(err error) int32 {
	if err == nil {
		return -1
	}

	if cause := genericCause(err); cause != nil {
		if ret := LastCode(cause); ret != -1 {
			return ret
		}
	}

	return Code(err)
}

// FirstCode walks the passed error and returns the code of the first ErrCode met, or -1.
func FirstCode(err error) int32 {
	if err == nil {
		return -1
	}

	if code := Code(err); code != -1 {
		return code
	}

	if cause := genericCause(err); cause != nil {
		return FirstCode(cause)
	}

	return -1
}

func genericCause(err error) error {
	type causer interface{ Cause() error }
	type wrapper interface{ Unwrap() error }

	if causer, ok := err.(causer); ok {
		return causer.Cause()
	}

	if wrapper, ok := err.(wrapper); ok {
		return wrapper.Unwrap()
	}

	return nil
}

//
// Error
//

func (e ErrCode) Error() string {
	name, ok := ErrCode_name[int32(e)]
	if ok {
		return fmt.Sprintf("%s(#%d)", name, e)
	}
	return fmt.Sprintf("UNKNOWN_ERRCODE(#%d)", e)
}

func (e ErrCode) Code() int32 {
	return int32(e)
}

func (e ErrCode) Wrap(inner error) WithCode {
	return wrappedError{
		code:  int32(e),
		inner: inner,
	}
}

//
// ConfigurableError
//

type wrappedError struct {
	code  int32
	inner error
}

func (e wrappedError) Error() string {
	return fmt.Sprintf("%s: %v", ErrCode(e.code), e.inner)
}

func (e wrappedError) Code() int32 {
	return e.code
}

// Cause returns the inner error (github.com/pkg/errors)
func (e wrappedError) Cause() error {
	return e.inner
}

// Unwrap returns the inner error (go1.13)
func (e wrappedError) Unwrap() error {
	return e.inner
}
