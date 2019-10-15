package crypto

// Error is a simple error struct. See https://dave.cheney.net/2016/04/07/constant-errors
type Error string

func (e Error) Error() string { return string(e) }

const (
	ErrSigChainNoEntries            = Error("sigchain: no entries found")
	ErrSigChainInvalidEntryType     = Error("sigchain: invalid entry type")
	ErrSigChainAlreadyInitialized   = Error("sigchain: chain already initialized")
	ErrSigChainPermission           = Error("sigchain: not allowed to perform operation")
	ErrSigChainOperationAlreadyDone = Error("sigchain: operation already performed")
)
