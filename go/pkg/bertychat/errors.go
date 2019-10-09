package bertychat

// See https://dave.cheney.net/2016/04/07/constant-errors
type Error string

func (e Error) Error() string { return string(e) }

const (
	// ErrNotImplemented is a placeholder for functions that will be implemented later
	ErrNotImplemented = Error("not implemented")

	// ErrInvalidInput indicates that the input contains invalid arguments
	ErrInvalidInput = Error("invalid input") // FIXME: use an input validation tool

	// ErrMissingInput indicates that a mandatory input is missing
	ErrMissingInput = Error("missing input")
)
