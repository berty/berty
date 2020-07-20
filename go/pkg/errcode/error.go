package errcode

import (
	"fmt"

	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

type WithCode interface {
	error
	Code() ErrCode
}

// Codes returns a list of wrapped codes
func Codes(err error) []ErrCode {
	if err == nil {
		return nil
	}

	codes := []ErrCode{}

	if st := getGRPCStatus(err); st != nil {
		return codesFromGRPCStatus(st)
	}

	if code := Code(err); code != -1 {
		codes = []ErrCode{code}
	}
	if cause := genericCause(err); cause != nil {
		causeCodes := Codes(cause)
		if len(causeCodes) > 0 {
			codes = append(codes, Codes(cause)...)
		}
	}

	return codes
}

// Has returns true if one of the error is or contains (wraps) an expected errcode
func Has(err error, code WithCode) bool {
	if Code(err) == code.Code() {
		return true
	}

	if cause := genericCause(err); cause != nil {
		return Has(cause, code)
	}

	return false
}

// Is returns true if the top-level error (not the FirstCode) is actually an ErrCode of the same value
func Is(err error, code WithCode) bool {
	return Code(err) == code.Code()
}

// Code returns the code of the actual error without trying to unwrap it, or -1.
func Code(err error) ErrCode {
	if err == nil {
		return -1
	}

	if typed, ok := err.(WithCode); ok {
		return typed.Code()
	}

	if st := getGRPCStatus(err); st != nil {
		codes := codesFromGRPCStatus(st)
		if len(codes) > 0 {
			return codes[0]
		}
		return -1
	}

	return -1
}

// LastCode walks the passed error and returns the code of the latest ErrCode, or -1.
func LastCode(err error) ErrCode {
	if err == nil {
		return -1
	}

	if cause := genericCause(err); cause != nil {
		if ret := LastCode(cause); ret != -1 {
			return ret
		}
	}

	if st := getGRPCStatus(err); st != nil {
		codes := codesFromGRPCStatus(st)
		if len(codes) > 0 {
			return codes[len(codes)-1]
		}
		return -1
	}

	return Code(err)
}

// FirstCode walks the passed error and returns the code of the first ErrCode met, or -1.
func FirstCode(err error) ErrCode {
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

func (e ErrCode) Code() ErrCode {
	return e
}

func (e ErrCode) Wrap(inner error) WithCode {
	return wrappedError{
		code:  e,
		inner: inner,
	}
}

func (e ErrCode) GRPCStatus() *status.Status {
	code := grpcCodeFromWithCode(e)
	st, _ := status.New(code, e.Error()).WithDetails(
		&ErrDetails{Codes: Codes(e)},
	)
	return st
}

//
// ConfigurableError
//

type wrappedError struct {
	code  ErrCode
	inner error
}

func (e wrappedError) Error() string {
	return fmt.Sprintf("%s: %v", e.code, e.inner)
}

func (e wrappedError) Code() ErrCode {
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

func (e wrappedError) GRPCStatus() *status.Status {
	code := grpcCodeFromWithCode(e)
	st, _ := status.New(code, e.Error()).WithDetails(
		&ErrDetails{Codes: Codes(e)},
	)
	return st
}

//
// gRPC helpers
//

func codesFromGRPCStatus(st *status.Status) []ErrCode {
	details := st.Details()
	for _, detail := range details {
		if typed, ok := detail.(*ErrDetails); ok {
			return typed.Codes
		}
	}
	return nil
}

func grpcCodeFromWithCode(err WithCode) codes.Code {
	// here, we can do a big switch case if we plan to make accurate gRPC codes
	// but we probably don't care
	return codes.Unavailable
}

type gRPCStatus interface{ GRPCStatus() *status.Status }

func getGRPCStatus(err error) *status.Status {
	if _, ok := err.(WithCode); !ok {
		if typed, ok := err.(gRPCStatus); ok {
			return typed.GRPCStatus()
		}
	}
	return nil
}
