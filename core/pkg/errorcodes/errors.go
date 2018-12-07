package errorcodes

import (
	"fmt"

	"github.com/pkg/errors"

	"berty.tech/core/pkg/i18n"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

func (c BertyErrorCodes) Is(err error) bool {
	original, ok := FromError(err)
	if !ok {
		return false
	}

	return IsSubCode(original.Code, c)
}

func (c BertyErrorCodes) Wrap(err error) error {
	return c.WrapArgs(err, map[string]string{})
}

func (c BertyErrorCodes) WrapArgs(err error, placeholders map[string]string) error {
	if err == nil {
		err = errors.Errorf(BertyErrorCodes_name[int32(c)])
	} else if original, ok := FromError(err); ok == true {
		err = original
	}

	parentBertyError, isParentBertyError := err.(*BertyError)

	devInfo := err.Error()
	if !isParentBertyError {
		devInfo = fmt.Sprintf("%+v", errors.WithStack(err))
	}

	translatedMessage := i18n.T(fmt.Sprintf(BertyErrorCodes_name[int32(c)]))

	newErr := &BertyError{
		Code:          c,
		ExtendedCodes: c.Extends(),
		Message:       translatedMessage,
		Placeholders:  placeholders,
		DevInfo:       devInfo,
	}

	if !isParentBertyError {
		return newErr.grpc()

	}

	parentBertyError.Outer = newErr

	return parentBertyError.grpc()
}

func (c BertyErrorCodes) New() error {
	err := errors.Errorf(BertyErrorCodes_name[int32(c)])

	return c.WrapArgs(err, map[string]string{})
}

func (c BertyErrorCodes) NewArgs(placeholders map[string]string) error {
	err := errors.Errorf(BertyErrorCodes_name[int32(c)])

	return c.WrapArgs(err, placeholders)
}

func (c BertyErrorCodes) Extends() []BertyErrorCodes {
	errorCodes := map[BertyErrorCodes]bool{}
	returnedErrorCodes := []BertyErrorCodes{c}

	for _, parentCode := range errorHierarchy[c] {
		returnedErrorCodes = append(returnedErrorCodes, parentCode.Extends()...)
	}

	for _, errorCode := range returnedErrorCodes {
		errorCodes[errorCode] = true
	}

	returnedErrorCodes = []BertyErrorCodes{}

	for errorCode := range errorCodes {
		returnedErrorCodes = append(returnedErrorCodes, errorCode)
	}

	return returnedErrorCodes
}

// Extensions is used for GraphQL errors enrichment
func (e *BertyError) Extensions() map[string]interface{} {
	var outer map[string]interface{}

	if e.Outer != nil {
		outer = e.Outer.Extensions()
	}

	return map[string]interface{}{
		"code":          e.Code,
		"message":       e.Message,
		"placeholders":  e.Placeholders,
		"devInfo":       e.DevInfo,
		"extendedCodes": e.ExtendedCodes,
		"outer":         outer,
	}
}

func (e *BertyError) grpc() error {
	grpcError := status.New(e.Code.grpcStatus(), e.Message)
	grpcErrorWithStatus, err := grpcError.WithDetails(e)

	if err == nil {
		return grpcErrorWithStatus.Err()
	}

	return grpcError.Err()
}

func (c BertyErrorCodes) grpcStatus() codes.Code {
	for _, extended := range c.Extends() {
		if statusCode, ok := grpcStatuses[extended]; ok {
			return statusCode
		}
	}

	return codes.Unknown
}

func FromError(err error) (*BertyError, bool) {
	if bertyErr, ok := err.(*BertyError); ok {
		return bertyErr, true
	}

	if grpcError, ok := status.FromError(err); ok {
		details := grpcError.Details()

		if len(details) == 1 {
			if bertyErr, ok := details[0].(*BertyError); ok {
				return bertyErr, true
			}
		}
	}

	return nil, false
}

func (e *BertyError) SetURL(url string) *BertyError {
	e.Url = url

	return e
}

func (e *BertyError) SetCode(errorCode BertyErrorCodes) *BertyError {
	e.Code = errorCode

	return e
}

func (e *BertyError) SetMessage(message string) *BertyError {
	e.Message = message

	return e
}

func IsSubCode(candidate BertyErrorCodes, code BertyErrorCodes) bool {
	for _, outerCandidate := range candidate.Extends() {
		if outerCandidate == code {
			return true
		}
	}

	return false
}

func (e *BertyError) Error() string {
	return e.Message
}
