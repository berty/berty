package errorcodes

import (
	"errors"

	"google.golang.org/grpc/codes"
)

func (c Code) Is(err error) bool {
	original, ok := FromError(err)
	if !ok {
		return false
	}

	return IsSubCode(original.Code(), c)
}

func (c Code) Wrap(cause error) *Error {
	return c.newError(
		map[string]string{},
		callers(3),
		cause,
	)
}

func (c Code) WrapArgs(cause error, placeholders map[string]string) *Error {
	return c.newError(
		placeholders,
		callers(3),
		cause,
	)
}

func (c Code) New() *Error {
	return c.newError(
		map[string]string{},
		callers(3),
		nil,
	)
}

func (c Code) NewArgs(placeholders map[string]string) *Error {
	return c.newError(
		placeholders,
		callers(3),
		nil,
	)
}

func (c Code) newError(placeholders map[string]string, stack *stack, cause error) *Error {
	codeName := Code_name[int32(c)]
	grpcCode, ok := grpcStatuses[c]
	if !ok {
		grpcCode = codes.Unknown
	}
	e := convert(
		errors.New(codeName),
		grpcCode,
		stack,
	)
	e.metadata.Code = c
	e.metadata.ExtendedCodes = c.Extends()
	e.metadata.Placeholders = placeholders
	e.cause = cause
	// FIXME: add more metadata
	// FIXME: translate error
	return e
}

func (c Code) Extends() []Code {
	errorCodes := map[Code]bool{}
	returnedErrorCodes := []Code{c}

	for _, parentCode := range errorHierarchy[c] {
		returnedErrorCodes = append(returnedErrorCodes, parentCode.Extends()...)
	}

	for _, errorCode := range returnedErrorCodes {
		errorCodes[errorCode] = true
	}

	returnedErrorCodes = []Code{}

	for errorCode := range errorCodes {
		returnedErrorCodes = append(returnedErrorCodes, errorCode)
	}

	return returnedErrorCodes
}

func (c Code) grpcCode() codes.Code {
	for _, extended := range c.Extends() {
		if statusCode, ok := grpcStatuses[extended]; ok {
			return statusCode
		}
	}

	return codes.Unknown
}

func IsSubCode(candidate Code, code Code) bool {
	for _, parentCandidate := range candidate.Extends() {
		if parentCandidate == code {
			return true
		}
	}

	return false
}
