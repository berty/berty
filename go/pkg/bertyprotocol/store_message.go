package bertyprotocol

import (
	"context"
	"fmt"

	"encoding/base64"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-ipfs-log/identityprovider"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores"
	"berty.tech/go-orbit-db/stores/basestore"
	"berty.tech/go-orbit-db/stores/operation"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
)

const groupMessageStoreType = "berty_group_messages"

type messageStore struct {
	basestore.BaseStore

	devKS  DeviceKeystore
	mks    *MessageKeystore
	g      *bertytypes.Group
	logger *zap.Logger
}

func (m *messageStore) setLogger(l *zap.Logger) {
	if l == nil {
		return
	}

	m.logger = l.With(zap.String("group-id", fmt.Sprintf("%.6s", base64.StdEncoding.EncodeToString(m.g.PublicKey))))
}

func (m *messageStore) openMessage(ctx context.Context, e ipfslog.Entry) (*bertytypes.GroupMessageEvent, error) {
	if e == nil {
		return nil, errcode.ErrInvalidInput
	}

	op, err := operation.ParseOperation(e)
	if err != nil {
		m.logger.Error("unable to parse operation", zap.Error(err))
		return nil, err
	}

	headers, payload, decryptInfo, err := openEnvelope(ctx, m.mks, m.g, op.GetValue(), e.GetHash())
	if err != nil {
		m.logger.Error("unable to open envelope", zap.Error(err))
		return nil, err
	}

	ownPK := crypto.PubKey(nil)
	md, inErr := m.devKS.MemberDeviceForGroup(m.g)
	if inErr == nil {
		ownPK = md.device.GetPublic()
	}

	if inErr = postDecryptActions(ctx, m.mks, decryptInfo, m.g, ownPK, headers); inErr != nil {
		err = errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	eventContext := newEventContext(e.GetHash(), e.GetNext(), m.g)
	return &bertytypes.GroupMessageEvent{
		EventContext: eventContext,
		Headers:      headers,
		Message:      payload,
	}, err
}

func (m *messageStore) ListMessages(ctx context.Context) (<-chan *bertytypes.GroupMessageEvent, error) {
	out := make(chan *bertytypes.GroupMessageEvent)
	ch := make(chan ipfslog.Entry)

	go func() {
		for e := range ch {
			evt, err := m.openMessage(ctx, e)
			if err != nil {
				m.logger.Error("unable to open message", zap.Error(err))
				continue
			}

			out <- evt
		}

		close(out)
	}()

	go func() {
		if err := m.OpLog().Iterator(&ipfslog.IteratorOptions{}, ch); err != nil {
			m.logger.Error("unable to iterate on messages", zap.Error(err))
		}
	}()

	return out, nil
}

func (m *messageStore) AddMessage(ctx context.Context, payload []byte) (operation.Operation, error) {
	md, err := m.devKS.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	env, err := sealEnvelope(ctx, m.mks, m.g, md.device, payload)
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

func constructorFactoryGroupMessage(s *bertyOrbitDB) iface.StoreConstructor {
	return func(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) (iface.Store, error) {
		g, err := s.getGroupFromOptions(options)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		store := &messageStore{
			devKS:  s.deviceKeystore,
			mks:    s.messageKeystore,
			g:      g,
			logger: zap.NewNop(),
		}

		options.Index = basestore.NewBaseIndex

		if err := store.InitBaseStore(ctx, ipfs, identity, addr, options); err != nil {
			return nil, errcode.ErrOrbitDBInit.Wrap(err)
		}

		go func() {
			for e := range store.Subscribe(ctx) {
				entry := ipfslog.Entry(nil)

				store.logger.Debug("received store event", zap.Any("raw event", e))

				switch evt := e.(type) {
				case *stores.EventWrite:
					entry = evt.Entry

				case *stores.EventReplicateProgress:
					entry = evt.Entry
				}

				if entry == nil {
					continue
				}

				messageEvent, err := store.openMessage(ctx, entry)
				if err != nil {
					store.logger.Error("unable to open message", zap.Error(err))
					continue
				}

				store.logger.Debug("received payload", zap.String("payload", string(messageEvent.Message)))

				store.Emit(ctx, messageEvent)
			}
		}()

		return store, nil
	}
}
