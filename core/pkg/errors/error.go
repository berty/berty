package errors

import (
	"net/http"

	"google.golang.org/grpc/codes"
)

var httpToGrpcMapping = map[int]codes.Code{
	http.StatusBadRequest:         codes.Internal,
	http.StatusUnauthorized:       codes.Unauthenticated,
	http.StatusForbidden:          codes.PermissionDenied,
	http.StatusNotFound:           codes.Unimplemented,
	http.StatusTooManyRequests:    codes.Unavailable,
	http.StatusBadGateway:         codes.Unavailable,
	http.StatusServiceUnavailable: codes.Unavailable,
	http.StatusGatewayTimeout:     codes.Unavailable,
}

func (e Error) GRPCCodeWithFallback() codes.Code {
	if e.GRPCCode != codes.OK { // codes.OK == 0
		return e.GRPCCode
	}
	if e.HTTPStatus == 0 {
		return codes.Unknown
	}

	if code, found := httpToGrpcMapping[e.HTTPStatusWithFallback()]; found {
		return code
	}
	return codes.Unknown
}

func (e Error) HTTPStatusWithFallback() int {
	if e.HTTPStatus == 0 {
		return http.StatusInternalServerError
	}
	return int(e.HTTPStatus)
}
