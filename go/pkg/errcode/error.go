package errcode

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
