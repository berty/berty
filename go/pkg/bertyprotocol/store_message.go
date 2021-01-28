package bertyprotocol

import (
	"container/ring"
	"context"
	"encoding/base64"
	"fmt"
	"sync"

	"github.com/ipfs/go-cid"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/secretbox"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
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
	g         *protocoltypes.Group
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

func (m *messageStore) openMessage(ctx context.Context, e ipfslog.Entry, enableCache bool) (*protocoltypes.GroupMessageEvent, error) {
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

	headers, msg, attachmentsCIDs, err := m.mks.OpenEnvelope(ctx, m.g, ownPK, op.GetValue(), e.GetHash())
	if err != nil {
		if enableCache && errcode.Is(err, errcode.ErrCryptoDecryptPayload) {
			// Saving this message in the cache waiting for the corresponding secret to be received
			m.addToCache(ctx, headers.DevicePK, e)
		}
		m.logger.Error("unable to open envelope", zap.Error(err))
		return nil, err
	}

	err = m.devKS.AttachmentSecretSlicePut(attachmentsCIDs, msg.GetProtocolMetadata().GetAttachmentsSecrets())
	if err != nil {
		m.logger.Error("unable to put attachments keys in keystore", zap.Error(err))
		return nil, err
	}

	eventContext := newEventContext(e.GetHash(), e.GetNext(), m.g, attachmentsCIDs)
	return &protocoltypes.GroupMessageEvent{
		EventContext: eventContext,
		Headers:      headers,
		Message:      msg.GetPlaintext(),
	}, err
}

// FIXME: use iterator instead to reduce resource usage (require go-ipfs-log improvements)
func (m *messageStore) ListEvents(ctx context.Context, since, until []byte, reverse bool) (<-chan *protocoltypes.GroupMessageEvent, error) {
	entries, err := getEntriesInRange(m.OpLog().GetEntries().Reverse().Slice(), since, until)
	if err != nil {
		return nil, err
	}

	out := make(chan *protocoltypes.GroupMessageEvent)

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

func (m *messageStore) AddMessage(ctx context.Context, payload []byte, attachmentsCIDs [][]byte) (operation.Operation, error) {
	md, err := m.devKS.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	attachmentsSecrets, err := m.devKS.AttachmentSecretSlice(attachmentsCIDs)
	if err != nil {
		return nil, errcode.ErrKeystoreGet.Wrap(err)
	}

	return messageStoreAddMessage(ctx, m.g, md, m, payload, attachmentsCIDs, attachmentsSecrets)
}

func messageStoreAddMessage(ctx context.Context, g *protocoltypes.Group, md *ownMemberDevice, m *messageStore, payload []byte, attachmentsCIDs [][]byte, attachmentsSecrets [][]byte) (operation.Operation, error) {
	msg, err := (&protocoltypes.EncryptedMessage{
		Plaintext:        payload,
		ProtocolMetadata: &protocoltypes.ProtocolMetadata{AttachmentsSecrets: attachmentsSecrets},
	}).Marshal()
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	env, err := m.mks.SealEnvelope(ctx, g, md.device, msg, attachmentsCIDs)
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

func (m *messageStore) GetMessageByCID(ctx context.Context, c cid.Cid) (*protocoltypes.MessageEnvelope, *protocoltypes.MessageHeaders, error) {
	m.cacheLock.Lock()
	defer m.cacheLock.Unlock()

	logEntry, ok := m.OpLog().Values().Get(c.String())
	if !ok {
		return nil, nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("unable to find message entry"))
	}

	op, err := operation.ParseOperation(logEntry)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	env, headers, err := openEnvelopeHeaders(op.GetValue(), m.g)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	return env, headers, nil
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

func (m *messageStore) GetOutOfStoreMessageEnvelope(ctx context.Context, c cid.Cid) (*protocoltypes.OutOfStoreMessageEnvelope, error) {
	env, headers, err := m.GetMessageByCID(ctx, c)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	sealedMessageEnvelope, err := sealOutOfStoreMessageEnveloppe(c, env, headers, m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return sealedMessageEnvelope, nil
}

func sealOutOfStoreMessageEnveloppe(id cid.Cid, env *protocoltypes.MessageEnvelope, headers *protocoltypes.MessageHeaders, g *protocoltypes.Group) (*protocoltypes.OutOfStoreMessageEnvelope, error) {
	oosMessage := &protocoltypes.OutOfStoreMessage{
		CID:              id.Bytes(),
		DevicePK:         headers.DevicePK,
		Counter:          headers.Counter,
		Sig:              headers.Sig,
		EncryptedPayload: env.Message,
		Nonce:            env.Nonce,
	}

	data, err := oosMessage.Marshal()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	nonce, err := cryptoutil.GenerateNonce()
	if err != nil {
		return nil, errcode.ErrCryptoNonceGeneration.Wrap(err)
	}

	secret, err := cryptoutil.KeySliceToArray(g.Secret)
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	encryptedData := secretbox.Seal(nil, data, nonce, secret)

	return &protocoltypes.OutOfStoreMessageEnvelope{
		Nonce:          nonce[:],
		Box:            encryptedData,
		GroupPublicKey: g.PublicKey,
	}, nil
}
