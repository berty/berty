package storegroup

import (
	"sync"

	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-orbit-db/stores/basestore"
	"berty.tech/go-orbit-db/stores/operation"
	"berty.tech/go/internal/orbitutil/orbitutilapi"
	"berty.tech/go/pkg/errcode"
)

type BaseGroupStore struct {
	basestore.BaseStore

	groupContext orbitutilapi.GroupContext
	lock         sync.RWMutex
}

func (b *BaseGroupStore) SetGroupContext(g orbitutilapi.GroupContext) {
	b.lock.Lock()
	b.groupContext = g
	b.lock.Unlock()
}

func (b *BaseGroupStore) GetGroupContext() orbitutilapi.GroupContext {
	b.lock.RLock()
	defer b.lock.RUnlock()

	return b.groupContext
}

func UnwrapOperation(opEntry ipfslog.Entry) ([]byte, error) {
	entry, ok := opEntry.(ipfslog.Entry)
	if !ok {
		return nil, errcode.ErrInvalidInput
	}

	op, err := operation.ParseOperation(entry)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	return op.GetValue(), nil
}

var _ orbitutilapi.GroupStore = (*BaseGroupStore)(nil)
