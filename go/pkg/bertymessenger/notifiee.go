package bertymessenger

import (
	"sync"

	"github.com/gogo/protobuf/proto"
	"go.uber.org/multierr"

	"berty.tech/berty/v2/go/pkg/messengertypes"
)

// Notifiee system inspired from ipfs
type Notifiee interface {
	StreamEvent(*messengertypes.StreamEvent) error
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

func (d *Dispatcher) UnregisterAll() {
	if d == nil {
		return
	}
	d.mutex.Lock()
	d.notifiees = make(map[Notifiee]struct{})
	d.mutex.Unlock()
}

func (d *Dispatcher) StreamEvent(typ messengertypes.StreamEvent_Type, msg proto.Message, isNew bool) error {
	payload, err := proto.Marshal(msg)
	if err != nil {
		return err
	}

	event := &messengertypes.StreamEvent{
		Type:    typ,
		Payload: payload,
		IsNew:   isNew,
	}

	// can be parallelized if needed
	var errs error
	d.mutex.RLock()
	for n := range d.notifiees {
		if err := n.StreamEvent(event); err != nil {
			errs = multierr.Append(errs, err)
		}
	}
	d.mutex.RUnlock()
	return errs
}

func (d *Dispatcher) Notify(typ messengertypes.StreamEvent_Notified_Type, title, body string, msg proto.Message) error {
	var payload []byte
	if msg != nil {
		var err error
		if payload, err = proto.Marshal(msg); err != nil {
			return err
		}
	}

	event := &messengertypes.StreamEvent_Notified{
		Title:   title,
		Body:    body,
		Type:    typ,
		Payload: payload,
	}

	return d.StreamEvent(messengertypes.StreamEvent_TypeNotified, event, false)
}

func (d *Dispatcher) IsEnabled() bool {
	return true
}

func NewDispatcher() *Dispatcher {
	return &Dispatcher{notifiees: make(map[Notifiee]struct{})}
}

type NotifieeBundle struct {
	StreamEventImpl func(c *messengertypes.StreamEvent) error
}

func (nb *NotifieeBundle) StreamEvent(c *messengertypes.StreamEvent) error {
	if nb.StreamEventImpl != nil {
		return nb.StreamEventImpl(c)
	}
	return nil
}

var _ Notifiee = (*NotifieeBundle)(nil)
