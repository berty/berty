package errors

import (
	"net/http"

	"google.golang.org/grpc/codes"
)

var (
	//
	// generic errors
	//
	// advice: should be avoided in preference to specific errors when possible
	//

	ErrUnknownError = Error{ID: 1, HTTPStatus: http.StatusInternalServerError, GRPCCode: codes.Unavailable}

	// HTTP redirection (generic)

	ErrMultipleChoices   = Error{ID: 300, HTTPStatus: http.StatusMultipleChoices, GRPCCode: codes.Unknown}
	ErrMovedPermanently  = Error{ID: 301, HTTPStatus: http.StatusMovedPermanently, GRPCCode: codes.Unknown}
	ErrFound             = Error{ID: 302, HTTPStatus: http.StatusFound, GRPCCode: codes.Unknown}
	ErrSeeOther          = Error{ID: 303, HTTPStatus: http.StatusSeeOther, GRPCCode: codes.Unknown}
	ErrNotModified       = Error{ID: 304, HTTPStatus: http.StatusNotModified, GRPCCode: codes.Unknown}
	ErrUseProxy          = Error{ID: 305, HTTPStatus: http.StatusUseProxy, GRPCCode: codes.Unknown}
	ErrTemporaryRedirect = Error{ID: 307, HTTPStatus: http.StatusTemporaryRedirect, GRPCCode: codes.Unknown}

	// HTTP client errors (generic)

	ErrBadRequest                   = Error{ID: 400, HTTPStatus: http.StatusBadRequest, GRPCCode: codes.Internal}
	ErrUnauthorized                 = Error{ID: 401, HTTPStatus: http.StatusUnauthorized, GRPCCode: codes.Unauthenticated}
	ErrForbidden                    = Error{ID: 403, HTTPStatus: http.StatusForbidden, GRPCCode: codes.PermissionDenied}
	ErrNotFound                     = Error{ID: 404, HTTPStatus: http.StatusNotFound, GRPCCode: codes.NotFound}
	ErrMethodNotAllowed             = Error{ID: 405, HTTPStatus: http.StatusMethodNotAllowed, GRPCCode: codes.Unknown}
	ErrNotAcceptable                = Error{ID: 406, HTTPStatus: http.StatusNotAcceptable, GRPCCode: codes.Unknown}
	ErrProxyAuthRequired            = Error{ID: 407, HTTPStatus: http.StatusProxyAuthRequired, GRPCCode: codes.Unauthenticated}
	ErrRequestTimeout               = Error{ID: 408, HTTPStatus: http.StatusRequestTimeout, GRPCCode: codes.Unavailable}
	ErrConflict                     = Error{ID: 409, HTTPStatus: http.StatusConflict, GRPCCode: codes.Unknown}
	ErrGone                         = Error{ID: 410, HTTPStatus: http.StatusGone, GRPCCode: codes.Unknown}
	ErrLengthRequired               = Error{ID: 411, HTTPStatus: http.StatusLengthRequired, GRPCCode: codes.Unknown}
	ErrPreconditionFailed           = Error{ID: 412, HTTPStatus: http.StatusPreconditionFailed, GRPCCode: codes.FailedPrecondition}
	ErrRequestEntityTooLarge        = Error{ID: 413, HTTPStatus: http.StatusRequestEntityTooLarge, GRPCCode: codes.Unknown}
	ErrRequestURITooLong            = Error{ID: 414, HTTPStatus: http.StatusRequestURITooLong, GRPCCode: codes.Unknown}
	ErrUnsupportedMediaType         = Error{ID: 415, HTTPStatus: http.StatusUnsupportedMediaType, GRPCCode: codes.Unknown}
	ErrRequestedRangeNotSatisfiable = Error{ID: 416, HTTPStatus: http.StatusRequestedRangeNotSatisfiable, GRPCCode: codes.Unknown}
	ErrExpectationFailed            = Error{ID: 417, HTTPStatus: http.StatusExpectationFailed, GRPCCode: codes.Unknown}
	ErrTeapot                       = Error{ID: 418, HTTPStatus: http.StatusTeapot, GRPCCode: codes.Unknown} // can't be skipped :-)
	ErrUnprocessableEntity          = Error{ID: 422, HTTPStatus: http.StatusUnprocessableEntity, GRPCCode: codes.Unknown}
	ErrFailedDependency             = Error{ID: 424, HTTPStatus: http.StatusFailedDependency, GRPCCode: codes.Unknown}
	ErrUpgradeRequired              = Error{ID: 426, HTTPStatus: http.StatusUpgradeRequired, GRPCCode: codes.Unknown}
	ErrPreconditionRequired         = Error{ID: 428, HTTPStatus: http.StatusPreconditionRequired, GRPCCode: codes.Unknown}
	ErrTooManyRequests              = Error{ID: 429, HTTPStatus: http.StatusTooManyRequests, GRPCCode: codes.Unavailable}
	ErrRequestHeaderFieldsTooLarge  = Error{ID: 431, HTTPStatus: http.StatusRequestHeaderFieldsTooLarge, GRPCCode: codes.Unknown}
	ErrUnavailableForLegalReasons   = Error{ID: 451, HTTPStatus: http.StatusUnavailableForLegalReasons, GRPCCode: codes.Unavailable}

	// HTTP server errors (generic)

	ErrInternalServerError           = Error{ID: 500, HTTPStatus: http.StatusInternalServerError, GRPCCode: codes.Internal}
	ErrNotImplemented                = Error{ID: 501, HTTPStatus: http.StatusNotImplemented, GRPCCode: codes.Unimplemented}
	ErrBadGateway                    = Error{ID: 502, HTTPStatus: http.StatusBadGateway, GRPCCode: codes.Unavailable}
	ErrServiceUnavailable            = Error{ID: 503, HTTPStatus: http.StatusServiceUnavailable, GRPCCode: codes.Unavailable}
	ErrGatewayTimeout                = Error{ID: 504, HTTPStatus: http.StatusGatewayTimeout, GRPCCode: codes.Unavailable}
	ErrHTTPVersionNotSupported       = Error{ID: 505, HTTPStatus: http.StatusHTTPVersionNotSupported, GRPCCode: codes.Unknown}
	ErrInsufficientStorage           = Error{ID: 507, HTTPStatus: http.StatusInsufficientStorage, GRPCCode: codes.Unknown}
	ErrLoopDetected                  = Error{ID: 508, HTTPStatus: http.StatusLoopDetected, GRPCCode: codes.Unknown}
	ErrNotExtended                   = Error{ID: 510, HTTPStatus: http.StatusNotExtended, GRPCCode: codes.Unknown}
	ErrNetworkAuthenticationRequired = Error{ID: 511, HTTPStatus: http.StatusNetworkAuthenticationRequired, GRPCCode: codes.Unauthenticated}

	//
	// specific errors
	//
	// advice: do not try to reuse related errors, instead, create more specific ones,
	// even if they will be translated in the same way for human readers
	//
)
