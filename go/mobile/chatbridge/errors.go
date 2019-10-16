package chatbridge

// Error is a simple Error struct. See https://dave.cheney.net/2016/04/07/constant-errors
type Error string

func (e Error) Error() string { return string(e) }

const (
	ErrInterrupted = Error("bridge has been interrupted")
	ErrNotRunning  = Error("bridge is not running or has already been stopped")
)
