package group

// See https://dave.cheney.net/2016/04/07/constant-errors
type Error string

func (e Error) Error() string { return string(e) }

const (
	ErrNotImplemented = Error("not implemented")
)
