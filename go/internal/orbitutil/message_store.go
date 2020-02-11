package orbitutil

import (
	"context"

	"berty.tech/go-ipfs-log/identityprovider"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
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
}

func (m *messageStore) ListMessages(ctx context.Context, out chan<- *bertyprotocol.GroupMessageEvent) error {
	ch := make(chan ipfslog.Entry)

	mkh := m.GetGroupContext().GetMessageKeysHolder()
	if mkh == nil {
		return errcode.ErrInternal
	}

	go func() {
		for {
			select {
			case <-ctx.Done():
				return

			case e := <-ch:
				if e == nil {
					continue
				}

				op, err := operation.ParseOperation(e)
				if err != nil {
					// TODO: log
					continue
				}
				headers, payload, err := OpenEnvelope(ctx, op.GetValue(), e.GetHash(), mkh)
				if err != nil {
					// TODO: log
					continue
				}

				eventContext, err := NewEventContext(e.GetHash(), e.GetNext(), mkh.GetGroupContext().GetGroup().PubKey)
				if err != nil {
					// TODO: log
					continue
				}

				out <- &bertyprotocol.GroupMessageEvent{
					EventContext: eventContext,
					Headers:      headers,
					Message:      payload,
				}

				// TODO: handle closed chan?
			}
		}
	}()

	go func() {
		if err := m.OpLog().Iterator(&ipfslog.IteratorOptions{}, ch); err != nil {
			// TODO: log
			_ = err
		}
	}()

	return nil
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

		return store, nil
	}
}

func NewMessageIndex(g GroupContext) iface.IndexConstructor {
	return basestore.NewBaseIndex
}

var _ MessageStore = (*messageStore)(nil)
