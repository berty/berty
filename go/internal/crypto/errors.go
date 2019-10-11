package crypto

import "errors"

var ErrSigChainNoEntries = errors.New("sigchain: no entries found")
var ErrSigChainInvalidEntryType = errors.New("sigchain: invalid entry type")
var ErrSigChainAlreadyInitialized = errors.New("sigchain: chain already initialized")
var ErrSigChainPermission = errors.New("sigchain: not allowed to perform operation")
var ErrSigChainOperationAlreadyDone = errors.New("sigchain: operation already performed")
