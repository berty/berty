package store

import (
	"fmt"
	"sync"
)

type InMemory struct {
	store   map[string][]byte
	muStore sync.RWMutex
}

func NewInMemoryStore() (Store, error) {
	return &InMemory{
		store: make(map[string][]byte),
	}, nil
}

func (m *InMemory) Put(key string, value []byte) error {
	m.muStore.Lock()
	m.store[key] = value
	m.muStore.Unlock()
	return nil
}

func (m *InMemory) Get(key string) ([]byte, error) {
	m.muStore.RLock()
	defer m.muStore.RUnlock()

	if v, ok := m.store[key]; ok {
		return v, nil
	}

	return nil, fmt.Errorf("no value found for `%s`", key)
}
func (m *InMemory) Close() error {
	m.muStore.Lock()
	m.store = make(map[string][]byte)
	m.muStore.Unlock()

	return nil
}
