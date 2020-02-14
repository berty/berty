package orbitutil

import (
	"context"
	"sync"

	"berty.tech/go-ipfs-log/identityprovider"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores"
	"berty.tech/go-orbit-db/stores/basestore"
	"berty.tech/go-orbit-db/stores/operation"
	coreapi "github.com/ipfs/interface-go-ipfs-core"

	"berty.tech/berty/go/pkg/bertyprotocol"
	"berty.tech/berty/go/pkg/errcode"

	ipfslog "berty.tech/go-ipfs-log"
)

const GroupMessageStoreType = "berty_group_messages"

type messageStore struct {
	BaseGroupStore
	lock sync.Mutex
}

func (m *messageStore) openMessage(ctx context.Context, e ipfslog.Entry) (*bertyprotocol.GroupMessageEvent, error) {
	m.lock.Lock()
	defer m.lock.Unlock()

	mkh := m.GetGroupContext().GetMessageKeysHolder()

	if e == nil {
		return nil, errcode.ErrInvalidInput
	}

	op, err := operation.ParseOperation(e)
	if err != nil {
		// TODO: log
		return nil, err
	}

	headers, payload, err := OpenEnvelope(ctx, op.GetValue(), e.GetHash(), mkh)
	if err != nil {
		// TODO: log
		return nil, err
	}

	eventContext, err := NewEventContext(e.GetHash(), e.GetNext(), m.GetGroupContext().GetGroup().PubKey)
	if err != nil {
		// TODO: log
		return nil, err
	}

	return &bertyprotocol.GroupMessageEvent{
		EventContext: eventContext,
		Headers:      headers,
		Message:      payload,
	}, nil
}

func (m *messageStore) ListMessages(ctx context.Context) (<-chan *bertyprotocol.GroupMessageEvent, error) {
	out := make(chan *bertyprotocol.GroupMessageEvent)
	ch := make(chan ipfslog.Entry)

	go func() {
		for e := range ch {
			evt, err := m.openMessage(ctx, e)
			if err != nil {
				// TODO: log
				continue
			}

			out <- evt
		}

		close(out)
	}()

	go func() {
		_ = m.OpLog().Iterator(&ipfslog.IteratorOptions{}, ch)
		// TODO: log
	}()

	return out, nil
}

func (m *messageStore) AddMessage(ctx context.Context, payload []byte) (operation.Operation, error) {
	env, err := SealEnvelope(ctx, payload, m.GetGroupContext().GetMessageKeysHolder())
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}

	op := operation.NewOperation(nil, "ADD", env)

	e, err := m.AddOperation(ctx, op, nil)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}

	op, err = operation.ParseOperation(e)
	if err != nil {
		return nil, errcode.ErrOrbitDBDeserialization.Wrap(err)
	}

	return op, nil
}

func ConstructorFactoryGroupMessage(s BertyOrbitDB) iface.StoreConstructor {
	return func(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) (iface.Store, error) {
		store := &messageStore{}
		if err := s.InitGroupStore(ctx, NewMessageIndex, store, ipfs, identity, addr, options); err != nil {
			return nil, errcode.ErrOrbitDBOpen.Wrap(err)
		}

		go store.Subscribe(ctx, func(e events.Event) {
			switch evt := e.(type) {
			case *stores.EventWrite:
				messageEvent, err := store.openMessage(ctx, evt.Entry)
				if err != nil {
					// TODO: log
					return
				}

				store.Emit(messageEvent)

			case *stores.EventReplicateProgress:
				messageEvent, err := store.openMessage(ctx, evt.Entry)
				if err != nil {
					// TODO: log
					return
				}

				store.Emit(messageEvent)
			}
		})

		return store, nil
	}
}

func NewMessageIndex(g GroupContext) iface.IndexConstructor {
	return basestore.NewBaseIndex
}

var _ MessageStore = (*messageStore)(nil)
