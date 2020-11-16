package bertyprotocol

import (
	"container/ring"
	"context"
	"encoding/base64"
	"fmt"
	"sync"

	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-ipfs-log/identityprovider"
	ipliface "berty.tech/go-ipfs-log/iface"
	"berty.tech/go-orbit-db/address"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go-orbit-db/stores"
	"berty.tech/go-orbit-db/stores/basestore"
	"berty.tech/go-orbit-db/stores/operation"
)

const groupMessageStoreType = "berty_group_messages"

// FIXME: replace cache by a circular buffer to avoid an attack by RAM saturation
type messageStore struct {
	basestore.BaseStore

	devKS     DeviceKeystore
	mks       *messageKeystore
	g         *bertytypes.Group
	logger    *zap.Logger
	cache     map[string]*ring.Ring
	cacheLock sync.Mutex
}

func (m *messageStore) setLogger(l *zap.Logger) {
	if l == nil {
		return
	}

	m.logger = l.With(zap.String("group-id", fmt.Sprintf("%.6s", base64.StdEncoding.EncodeToString(m.g.PublicKey))))
}

// addToCache adds the event into a circular buffer
func (m *messageStore) addToCache(ctx context.Context, devicePK []byte, e ipfslog.Entry) {
	bufferSize := 64
	m.logger.Debug("addToCache", zap.Any("devicePK", devicePK), zap.Any("event", e))
	m.cacheLock.Lock()
	if _, ok := m.cache[string(devicePK)]; !ok {
		m.cache[string(devicePK)] = ring.New(bufferSize)
	}
	buffer := m.cache[string(devicePK)]
	buffer.Value = e
	buffer = buffer.Next()
	m.cache[string(devicePK)] = buffer
	m.cacheLock.Unlock()

	go m.openMessageCacheForPK(ctx, devicePK)
}

// openMessageCacheForPK tries to open messages for a given devicePK
func (m *messageStore) openMessageCacheForPK(ctx context.Context, devicePK []byte) {
	m.cacheLock.Lock()
	if buffer, ok := m.cache[string(devicePK)]; ok {
		len := buffer.Len()
		for i := 0; i < len; i++ {
			e, ok := buffer.Value.(ipfslog.Entry)
			if !ok {
				buffer = buffer.Next()
				continue
			}

			m.logger.Debug("openMessageCacheForPK: processing event", zap.Any("devicePK", devicePK), zap.Any("event", e))
			evt, err := m.openMessage(ctx, e, false)
			if err != nil {
				m.logger.Error("openFromCache: unable to open message", zap.Error(err))
				buffer = buffer.Next()
				continue
			}
			m.Emit(ctx, evt)
			buffer.Value = nil
			buffer = buffer.Next()
		}
	}
	m.cacheLock.Unlock()
}

func (m *messageStore) openMessage(ctx context.Context, e ipfslog.Entry, enableCache bool) (*bertytypes.GroupMessageEvent, error) {
	if e == nil {
		return nil, errcode.ErrInvalidInput
	}

	op, err := operation.ParseOperation(e)
	if err != nil {
		m.logger.Error("unable to parse operation", zap.Error(err))
		return nil, err
	}

	ownPK := crypto.PubKey(nil)
	md, inErr := m.devKS.MemberDeviceForGroup(m.g)
	if inErr == nil {
		ownPK = md.device.GetPublic()
	}

	headers, payload, err := m.mks.OpenEnvelope(ctx, m.g, ownPK, op.GetValue(), e.GetHash())
	if err != nil {
		if enableCache && errcode.Is(err, errcode.ErrCryptoDecryptPayload) {
			// Saving this message in the cache waiting for the corresponding secret to be received
			m.addToCache(ctx, headers.DevicePK, e)
		}
		m.logger.Error("unable to open envelope", zap.Error(err))
		return nil, err
	}

	eventContext := newEventContext(e.GetHash(), e.GetNext(), m.g)
	return &bertytypes.GroupMessageEvent{
		EventContext: eventContext,
		Headers:      headers,
		Message:      payload,
	}, err
}

// FIXME: use iterator instead to reduce resource usage (require go-ipfs-log improvements)
func (m *messageStore) ListEvents(ctx context.Context, since, until []byte, reverse bool) (<-chan *bertytypes.GroupMessageEvent, error) {
	entries, err := getEntriesInRange(m.OpLog().GetEntries().Reverse().Slice(), since, until)
	if err != nil {
		return nil, err
	}

	out := make(chan *bertytypes.GroupMessageEvent)

	go func() {
		iterateOverEntries(
			entries,
			reverse,
			func(entry ipliface.IPFSLogEntry) {
				message, err := m.openMessage(ctx, entry, false)
				if err != nil {
					m.logger.Error("unable to open message", zap.Error(err))
				} else {
					out <- message
					m.logger.Info("message store - sent 1 event from log history")
				}
			},
		)

		close(out)
	}()

	return out, nil
}

func (m *messageStore) AddMessage(ctx context.Context, payload []byte) (operation.Operation, error) {
	md, err := m.devKS.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	env, err := m.mks.SealEnvelope(ctx, m.g, md.device, payload)
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

func constructorFactoryGroupMessage(s *BertyOrbitDB) iface.StoreConstructor {
	return func(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) (iface.Store, error) {
		g, err := s.getGroupFromOptions(options)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		replication := false

		if s.deviceKeystore == nil {
			replication = true
		} else {
			if _, err := s.deviceKeystore.MemberDeviceForGroup(g); err == errcode.ErrInvalidInput {
				replication = true
			} else if err != nil {
				return nil, errcode.TODO.Wrap(err)
			}
		}

		store := &messageStore{
			devKS:  s.deviceKeystore,
			mks:    s.messageKeystore,
			g:      g,
			logger: s.Logger(),
			cache:  make(map[string]*ring.Ring),
		}

		options.Index = basestore.NewBaseIndex

		if err := store.InitBaseStore(ctx, ipfs, identity, addr, options); err != nil {
			return nil, errcode.ErrOrbitDBInit.Wrap(err)
		}

		if replication {
			return store, nil
		}

		chSub := store.Subscribe(ctx)
		go func() {
			for e := range chSub {
				entry := ipfslog.Entry(nil)

				switch evt := e.(type) {
				case *stores.EventWrite:
					entry = evt.Entry

				case *stores.EventReplicateProgress:
					entry = evt.Entry
				}

				if entry == nil {
					continue
				}

				store.logger.Debug("store_message: received store event", zap.Any("raw event", e))

				messageEvent, err := store.openMessage(ctx, entry, true)
				if err != nil {
					store.logger.Error("unable to open message", zap.Error(err))
					continue
				}

				store.logger.Debug("store_message: received payload", zap.String("payload", string(messageEvent.Message)))
				store.Emit(ctx, messageEvent)
			}
		}()

		return store, nil
	}
}
