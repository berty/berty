package bertyprotocol

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"sync"

	"github.com/ipfs/go-cid"
	coreapi "github.com/ipfs/interface-go-ipfs-core"
	"github.com/libp2p/go-eventbus"
	"github.com/libp2p/go-libp2p-core/crypto"
	"github.com/libp2p/go-libp2p-core/event"
	"go.uber.org/zap"
	"golang.org/x/crypto/nacl/secretbox"
	"golang.org/x/sync/semaphore"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/pushtypes"
	"berty.tech/berty/v2/go/pkg/tyber"
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
type MessageStore struct {
	basestore.BaseStore
	eventBus event.Bus
	emitters struct {
		groupMessage      event.Emitter
		groupCacheMessage event.Emitter
	}

	devKS  cryptoutil.DeviceKeystore
	mks    *cryptoutil.MessageKeystore
	g      *protocoltypes.Group
	logger *zap.Logger

	deviceCaches   map[string]*groupCache
	muDeviceCaches sync.RWMutex
	cmessage       chan *messageItem
	// muProcess       sync.RWMutex
}

func (m *MessageStore) setLogger(l *zap.Logger) {
	if l == nil {
		return
	}

	m.logger = l.With(logutil.PrivateString("group-id", fmt.Sprintf("%.6s", base64.StdEncoding.EncodeToString(m.g.PublicKey))))
}

func (m *MessageStore) openMessage(ctx context.Context, e ipfslog.Entry) (*protocoltypes.GroupMessageEvent, error) {
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
		ownPK = md.PrivateDevice().GetPublic()
	}

	env, headers, err := cryptoutil.OpenEnvelopeHeaders(op.GetValue(), m.g)
	if err != nil {
		return nil, errcode.ErrCryptoDecrypt.Wrap(err)
	}

	if !m.mks.HasSecretForRawDevicePK(ctx, m.g.PublicKey, headers.DevicePK) {
		if err := m.addToMessageQueue(ctx, e); err != nil {
			m.logger.Error("unable to add message to cache", zap.Error(err))
		}

		return nil, fmt.Errorf("no secret for device")
	}

	return m.processMessage(ctx, ownPK, &messageItem{
		op:      op,
		env:     env,
		headers: headers,
		ownPK:   ownPK,
		hash:    e.GetHash(),
	})
}

type groupCache struct {
	self, hasSecret bool
	locker          sync.Locker
	queue           *priorityMessageQueue
}

func (m *MessageStore) CacheSizeForDevicePK(devicePK []byte) (size int, ok bool) {
	m.muDeviceCaches.RLock()
	var device *groupCache
	if device, ok = m.deviceCaches[string(devicePK)]; ok {
		size = device.queue.Size()
	}
	m.muDeviceCaches.RUnlock()
	return
}

func (m *MessageStore) ProcessMessageQueueForDevicePK(ctx context.Context, devicePK []byte) {
	m.muDeviceCaches.Lock()
	if device, ok := m.deviceCaches[string(devicePK)]; ok {
		if device.hasSecret = m.mks.HasSecretForRawDevicePK(ctx, m.g.PublicKey, devicePK); !device.hasSecret {
			m.logger.Error("unable to process message, no secret found for device pk", logutil.PrivateBinary("devicepk", devicePK))
		} else if next := device.queue.Next(); next != nil {
			m.cmessage <- next
		}
	}
	m.muDeviceCaches.Unlock()
}

func (m *MessageStore) processMessage(ctx context.Context, ownPK crypto.PubKey, message *messageItem) (*protocoltypes.GroupMessageEvent, error) {
	// process message
	msg, attachmentsCIDs, err := m.mks.OpenEnvelopePayload(ctx, message.env, message.headers, m.g, ownPK, message.hash)
	if err != nil {
		return nil, err
	}

	err = m.devKS.AttachmentSecretSlicePut(attachmentsCIDs, msg.GetProtocolMetadata().GetAttachmentsSecrets())
	if err != nil {
		m.logger.Error("unable to put attachments keys in keystore", zap.Error(err))
	}

	err = m.mks.UpdatePushGroupReferences(ctx, message.headers.DevicePK, message.headers.Counter, m.g)
	if err != nil {
		m.logger.Error("unable to update push group references", zap.Error(err))
	}

	entry := message.op.GetEntry()
	eventContext := newEventContext(entry.GetHash(), entry.GetNext(), m.g, attachmentsCIDs)
	return &protocoltypes.GroupMessageEvent{
		EventContext: eventContext,
		Headers:      message.headers,
		Message:      msg.GetPlaintext(),
	}, nil
}

func (m *MessageStore) processMessageLoop(ctx context.Context) {
	var ownPK crypto.PubKey
	var rawOwnPK []byte
	md, inErr := m.devKS.MemberDeviceForGroup(m.g)
	if inErr == nil {
		ownPK = md.PrivateDevice().GetPublic()
		rawOwnPK, _ = ownPK.Raw()
	}

	semProcess := semaphore.NewWeighted(32)

	for {
		var message *messageItem
		select {
		case message = <-m.cmessage:
		case <-ctx.Done():
			return
		}

		devicepk := string(message.headers.DevicePK)

		m.muDeviceCaches.Lock()
		device, ok := m.deviceCaches[devicepk]
		if !ok {
			hasSecret := m.mks.HasSecretForRawDevicePK(ctx, m.g.PublicKey, message.headers.DevicePK)
			device = &groupCache{
				self:      bytes.Equal(rawOwnPK, message.headers.DevicePK),
				queue:     newPriorityMessageQueue(),
				locker:    &sync.RWMutex{},
				hasSecret: hasSecret,
			}
			m.deviceCaches[devicepk] = device
		}

		// check for device secret, if unavailable add message to cache queue
		if !device.hasSecret {
			device.queue.Add(message)
			_ = m.emitters.groupCacheMessage.Emit(*message)
			m.muDeviceCaches.Unlock()
			continue
		}

		// start process routine
		go func() {
			// wait for a process slot
			if err := semProcess.Acquire(ctx, 1); err != nil {
				m.logger.Error("unable to acquire lock", zap.Error(err))
				return
			}

			// defer release a process slot
			defer semProcess.Release(1)

			// process the message
			evt, err := m.processMessage(ctx, ownPK, message)
			if err != nil {
				if errcode.Is(err, errcode.ErrCryptoDecryptPayload) {
					// @FIXME(gfanton): this should not happen
					m.logger.Warn("unable to open envelope, adding envelope to cache for later process", zap.Error(err))

					// if failed to decrypt add to queue, for later process
					device.queue.Add(message)
					_ = m.emitters.groupCacheMessage.Emit(*message)
				} else {
					m.logger.Error("unable to prcess message", zap.Error(err))
				}

				return
			}

			// emit new message event
			if err := m.emitters.groupMessage.Emit(*evt); err != nil {
				m.logger.Warn("unable to emit group message event", zap.Error(err))
			}

			if next := device.queue.Next(); next != nil {
				m.cmessage <- next
			}
		}()

		m.muDeviceCaches.Unlock()
	}
}

func (m *MessageStore) addToMessageQueue(ctx context.Context, e ipfslog.Entry) error {
	if e == nil {
		return errcode.ErrInvalidInput
	}

	op, err := operation.ParseOperation(e)
	if err != nil {
		return err
	}

	ownPK := crypto.PubKey(nil)
	md, inErr := m.devKS.MemberDeviceForGroup(m.g)
	if inErr == nil {
		ownPK = md.PrivateDevice().GetPublic()
	}

	env, headers, err := cryptoutil.OpenEnvelopeHeaders(op.GetValue(), m.g)
	if err != nil {
		return errcode.ErrCryptoDecrypt.Wrap(err)
	}

	msg := &messageItem{
		hash:    e.GetHash(),
		env:     env,
		headers: headers,
		ownPK:   ownPK,
		op:      op,
	}

	select {
	case <-ctx.Done():
	case m.cmessage <- msg:
	}
	return nil
}

// FIXME: use iterator instead to reduce resource usage (require go-ipfs-log improvements)
func (m *MessageStore) ListEvents(ctx context.Context, since, until []byte, reverse bool) (<-chan *protocoltypes.GroupMessageEvent, error) {
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
				message, err := m.openMessage(ctx, entry)
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

func (m *MessageStore) AddMessage(ctx context.Context, payload []byte, attachmentsCIDs [][]byte) (operation.Operation, error) {
	ctx, newTrace := tyber.ContextWithTraceID(ctx)

	if newTrace {
		m.logger.Debug("Sending message to group "+base64.RawURLEncoding.EncodeToString(m.g.PublicKey), tyber.FormatTraceLogFields(ctx)...)
	}

	m.logger.Debug(
		fmt.Sprintf("Adding message to store with payload of %d bytes and %d attachment(s)", len(payload), len(attachmentsCIDs)),
		tyber.FormatStepLogFields(
			ctx,
			[]tyber.Detail{
				{Name: "Payload", Description: string(payload)},
				{Name: "Attachments cIDs", Description: fmt.Sprintf("%q", attachmentsCIDs)},
			},
		)...,
	)

	md, err := m.devKS.MemberDeviceForGroup(m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	attachmentsSecrets, err := m.devKS.AttachmentSecretSlice(attachmentsCIDs)
	if err != nil {
		return nil, errcode.ErrKeystoreGet.Wrap(err)
	}
	m.logger.Debug(
		"Secrets to encrypt message content retrieved successfully",
		tyber.FormatStepLogFields(ctx, []tyber.Detail{})...,
	)

	return messageStoreAddMessage(ctx, m.g, md, m, payload, attachmentsCIDs, attachmentsSecrets)
}

func messageStoreAddMessage(ctx context.Context, g *protocoltypes.Group, md *cryptoutil.OwnMemberDevice, m *MessageStore, payload []byte, attachmentsCIDs [][]byte, attachmentsSecrets [][]byte) (operation.Operation, error) {
	msg, err := (&protocoltypes.EncryptedMessage{
		Plaintext:        payload,
		ProtocolMetadata: &protocoltypes.ProtocolMetadata{AttachmentsSecrets: attachmentsSecrets},
	}).Marshal()
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	env, err := m.mks.SealEnvelope(ctx, g, md.PrivateDevice(), msg, attachmentsCIDs)
	if err != nil {
		return nil, errcode.ErrCryptoEncrypt.Wrap(err)
	}
	m.logger.Debug(
		"Message sealed successfully in secretbox envelope",
		tyber.FormatStepLogFields(
			ctx,
			[]tyber.Detail{
				{Name: "Cleartext size", Description: fmt.Sprintf("%d bytes", len(msg))},
				{Name: "Cyphertext size", Description: fmt.Sprintf("%d bytes", len(env))},
			},
		)...,
	)

	op := operation.NewOperation(nil, "ADD", env)

	e, err := m.AddOperation(ctx, op, nil)
	if err != nil {
		return nil, errcode.ErrOrbitDBAppend.Wrap(err)
	}
	m.logger.Debug(
		"Envelope added to orbit-DB log successfully",
		tyber.FormatStepLogFields(ctx, []tyber.Detail{})...,
	)

	op, err = operation.ParseOperation(e)
	if err != nil {
		return nil, errcode.ErrOrbitDBDeserialization.Wrap(err)
	}

	return op, nil
}

func constructorFactoryGroupMessage(s *BertyOrbitDB, logger *zap.Logger) iface.StoreConstructor {
	return func(ctx context.Context, ipfs coreapi.CoreAPI, identity *identityprovider.Identity, addr address.Address, options *iface.NewStoreOptions) (iface.Store, error) {
		g, err := s.getGroupFromOptions(options)
		if err != nil {
			return nil, errcode.ErrInvalidInput.Wrap(err)
		}

		if options.EventBus == nil {
			options.EventBus = eventbus.NewBus()
		}

		replication := false

		if s.deviceKeystore == nil {
			replication = true
		} else {
			if _, err := s.deviceKeystore.MemberDeviceForGroup(g); errcode.Is(err, errcode.ErrInvalidInput) {
				replication = true
			} else if err != nil {
				return nil, errcode.ErrOrbitDBInit.Wrap(err)
			}
		}

		store := &MessageStore{
			eventBus:     options.EventBus,
			devKS:        s.deviceKeystore,
			mks:          s.messageKeystore,
			cmessage:     make(chan *messageItem),
			g:            g,
			logger:       logger,
			deviceCaches: make(map[string]*groupCache),
		}

		go func() {
			store.processMessageLoop(ctx)
			logger.Debug("store message process loop ended", zap.Error(ctx.Err()))
		}()

		if store.emitters.groupMessage, err = store.eventBus.Emitter(new(protocoltypes.GroupMessageEvent)); err != nil {
			return nil, errcode.ErrOrbitDBInit.Wrap(err)
		}

		// for debug/test purpose
		if store.emitters.groupCacheMessage, err = store.eventBus.Emitter(new(messageItem)); err != nil {
			return nil, errcode.ErrOrbitDBInit.Wrap(err)
		}

		options.Index = basestore.NewNoopIndex

		if err := store.InitBaseStore(ctx, ipfs, identity, addr, options); err != nil {
			return nil, errcode.ErrOrbitDBInit.Wrap(err)
		}

		if replication {
			return store, nil
		}

		chSub, err := store.EventBus().Subscribe([]interface{}{
			new(stores.EventWrite),
			new(stores.EventReplicated),
		}, eventbus.BufSize(128))
		if err != nil {
			return nil, fmt.Errorf("unable to subscribe to store events")
		}

		go func() {
			defer chSub.Close()
			for {
				var e interface{}
				select {
				case e = <-chSub.Out():
				case <-ctx.Done():
					return
				}

				var entries []ipfslog.Entry

				switch evt := e.(type) {
				case stores.EventWrite:
					entries = []ipfslog.Entry{evt.Entry}

				case stores.EventReplicated:
					entries = evt.Entries
				}

				for _, entry := range entries {
					ctx = tyber.ContextWithConstantTraceID(ctx, "msgrcvd-"+entry.GetHash().String())
					store.logger.Debug("Received message store event", tyber.FormatTraceLogFields(ctx)...)
					store.logger.Debug(
						"Message store event",
						tyber.FormatStepLogFields(ctx, []tyber.Detail{{Name: "RawEvent", Description: fmt.Sprint(e)}})...,
					)

					if err := store.addToMessageQueue(ctx, entry); err != nil {
						logger.Error("unable to add message to queue", zap.Error(err))
					}
				}
			}
		}()

		return store, nil
	}
}

func (m *MessageStore) GetMessageByCID(c cid.Cid) (*protocoltypes.MessageEnvelope, *protocoltypes.MessageHeaders, error) {
	logEntry, ok := m.OpLog().Get(c)
	if !ok {
		return nil, nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("unable to find message entry"))
	}

	op, err := operation.ParseOperation(logEntry)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	env, headers, err := cryptoutil.OpenEnvelopeHeaders(op.GetValue(), m.g)
	if err != nil {
		return nil, nil, errcode.ErrDeserialization.Wrap(err)
	}

	return env, headers, nil
}

func (m *MessageStore) GetOutOfStoreMessageEnvelope(ctx context.Context, c cid.Cid) (*pushtypes.OutOfStoreMessageEnvelope, error) {
	env, headers, err := m.GetMessageByCID(c)
	if err != nil {
		return nil, errcode.ErrInvalidInput.Wrap(err)
	}

	sealedMessageEnvelope, err := SealOutOfStoreMessageEnvelope(c, env, headers, m.g)
	if err != nil {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	return sealedMessageEnvelope, nil
}

func SealOutOfStoreMessageEnvelope(id cid.Cid, env *protocoltypes.MessageEnvelope, headers *protocoltypes.MessageHeaders, g *protocoltypes.Group) (*pushtypes.OutOfStoreMessageEnvelope, error) {
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

	groupPushSecret, err := cryptoutil.GetGroupPushSecret(g)
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	pushGroupRef, err := cryptoutil.CreatePushGroupReference(headers.DevicePK, headers.Counter, groupPushSecret)
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	return &pushtypes.OutOfStoreMessageEnvelope{
		Nonce:          nonce[:],
		Box:            encryptedData,
		GroupReference: pushGroupRef,
	}, nil
}
