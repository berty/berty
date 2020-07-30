package bertymessenger

import (
	"sync"
)

// should use EventStream types, this is a poc of the notifiee system à la ipfs
type Notifiee interface {
	StreamEvent(*StreamEvent) error
}

type Dispatcher struct {
	mutex     sync.RWMutex
	notifiees map[Notifiee]struct{}
}

func (d *Dispatcher) Register(n Notifiee) func() {
	d.mutex.Lock()
	d.notifiees[n] = struct{}{}
	d.mutex.Unlock()
	return func() { d.Unregister(n) }
}

func (d *Dispatcher) Unregister(n Notifiee) {
	d.mutex.Lock()
	delete(d.notifiees, n)
	d.mutex.Unlock()
}

func (d *Dispatcher) StreamEvent(c *StreamEvent) []error {
	// we could paralelize this but it would mess logs

	var errors []error
	d.mutex.RLock()
	for n := range d.notifiees {
		if err := n.StreamEvent(c); err != nil {
			errors = append(errors, err)
		}
	}
	d.mutex.RUnlock()
	return errors
}

func NewDispatcher() *Dispatcher {
	return &Dispatcher{notifiees: make(map[Notifiee]struct{})}
}

type NotifieeBundle struct {
	StreamEventImpl func(c *StreamEvent) error
}

func (nb *NotifieeBundle) StreamEvent(c *StreamEvent) error {
	if nb.StreamEventImpl != nil {
		return nb.StreamEventImpl(c)
	}
	return nil
}

var _ Notifiee = (*NotifieeBundle)(nil)
