package crypto

type Error string

func (e Error) Error() string { return string(e) }

var (
	ErrSigChainNoEntries            = Error("sigchain: no entries found")
	ErrSigChainInvalidEntryType     = Error("sigchain: invalid entry type")
	ErrSigChainAlreadyInitialized   = Error("sigchain: chain already initialized")
	ErrSigChainPermission           = Error("sigchain: not allowed to perform operation")
	ErrSigChainOperationAlreadyDone = Error("sigchain: operation already performed")
)
