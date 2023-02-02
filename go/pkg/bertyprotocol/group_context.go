package bertyprotocol

import (
	"context"
	"encoding/base64"
	"fmt"
	"sync"
	"sync/atomic"
	"time"

	"github.com/libp2p/go-libp2p/core/crypto"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/ipfsutil"
	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/go-orbit-db/stores"
)

type GroupContext struct {
	ctx             context.Context
	cancel          context.CancelFunc
	group           *protocoltypes.Group
	metadataStore   *MetadataStore
	messageStore    *MessageStore
	messageKeystore *cryptoutil.MessageKeystore
	memberDevice    *cryptoutil.OwnMemberDevice
	logger          *zap.Logger
	closed          uint32
}

func (gc *GroupContext) MessageKeystore() *cryptoutil.MessageKeystore {
	return gc.messageKeystore
}

func (gc *GroupContext) getMemberPrivKey() crypto.PrivKey {
	return gc.memberDevice.PrivateMember()
}

func (gc *GroupContext) MessageStore() *MessageStore {
	return gc.messageStore
}

func (gc *GroupContext) MetadataStore() *MetadataStore {
	return gc.metadataStore
}

func (gc *GroupContext) Group() *protocoltypes.Group {
	return gc.group
}

func (gc *GroupContext) MemberPubKey() crypto.PubKey {
	return gc.memberDevice.PrivateMember().GetPublic()
}

func (gc *GroupContext) DevicePubKey() crypto.PubKey {
	return gc.memberDevice.PrivateDevice().GetPublic()
}

func (gc *GroupContext) Close() error {
	gc.logger.Debug("closing group context", zap.String("groupID", gc.group.GroupIDAsString()))

	atomic.StoreUint32(&gc.closed, 1)

	gc.metadataStore.Close()
	gc.messageStore.Close()

	gc.cancel()

	return nil
}

func (gc *GroupContext) IsClosed() bool {
	return atomic.LoadUint32(&gc.closed) != 0
}

func NewContextGroup(group *protocoltypes.Group, metadataStore *MetadataStore, messageStore *MessageStore, messageKeystore *cryptoutil.MessageKeystore, memberDevice *cryptoutil.OwnMemberDevice, logger *zap.Logger) *GroupContext {
	ctx, cancel := context.WithCancel(context.Background())

	if logger == nil {
		logger = zap.NewNop()
	}

	return &GroupContext{
		ctx:             ctx,
		cancel:          cancel,
		group:           group,
		metadataStore:   metadataStore,
		messageStore:    messageStore,
		messageKeystore: messageKeystore,
		memberDevice:    memberDevice,
		logger:          logger.With(logutil.PrivateString("group-id", fmt.Sprintf("%.6s", base64.StdEncoding.EncodeToString(group.PublicKey)))),
		closed:          0,
	}
}

func (gc *GroupContext) ActivateGroupContext(contact crypto.PubKey) error {
	return gc.activateGroupContext(contact, true)
}

func (gc *GroupContext) activateGroupContext(contact crypto.PubKey, selfAnnouncement bool) error {
	// syncChMKH := make(chan bool, 1)
	// syncChSecrets := make(chan bool, 1)

	{
		// Fill keystore
		chNewData := gc.FillMessageKeysHolderUsingNewData()
		go func() {
			for pk := range chNewData {
				if !pk.Equals(gc.memberDevice.PrivateDevice().GetPublic()) {
					gc.logger.Warn("gc member device public key doesn't match")
				}
			}
		}()

		chMember := gc.WatchNewMembersAndSendSecrets()
		go func() {
			for pk := range chMember {
				if !pk.Equals(gc.memberDevice.PrivateMember().GetPublic()) {
					gc.logger.Warn("gc member device public key doesn't match")
				}
			}
		}()
	}

	{
		wg := sync.WaitGroup{}
		wg.Add(2)
		start := time.Now()

		chPreviousData := gc.FillMessageKeysHolderUsingPreviousData()
		go func() {
			for pk := range chPreviousData {
				if !pk.Equals(gc.memberDevice.PrivateDevice().GetPublic()) {
					gc.logger.Warn("gc member device public key doesn't match")
				}
			}

			gc.logger.Info(fmt.Sprintf("FillMessageKeysHolderUsingPreviousData took %s", time.Since(start)))
			wg.Done()
		}()

		chSecrets := gc.SendSecretsToExistingMembers(contact)
		go func() {
			for pk := range chSecrets {
				if !pk.Equals(gc.memberDevice.PrivateMember().GetPublic()) {
					gc.logger.Warn("gc member device public key doesn't match")
				}
			}

			gc.logger.Info(fmt.Sprintf("SendSecretsToExistingMembers took %s", time.Since(start)))
			wg.Done()
		}()

		wg.Wait()
	}

	if selfAnnouncement {
		start := time.Now()
		_, err := gc.MetadataStore().AddDeviceToGroup(gc.ctx)
		if err != nil {
			return errcode.ErrInternal.Wrap(err)
		}

		gc.logger.Info(fmt.Sprintf("AddDeviceToGroup took %s", time.Since(start)))

		// op.
		// if op != nil {
		// 	// Waiting for async events to be handled
		// 	if ok := <-syncChMKH; !ok {
		// 		return errcode.ErrInternal.Wrap(fmt.Errorf("error while registering own secrets"))
		// 	}

		// 	if ok := <-syncChSecrets; !ok {
		// 		return errcode.ErrInternal.Wrap(fmt.Errorf("error while sending own secrets"))
		// 	}
		// }
	}

	return nil
}

func (gc *GroupContext) FillMessageKeysHolderUsingNewData() <-chan crypto.PubKey {
	m := gc.MetadataStore()
	ch := make(chan crypto.PubKey)
	sub, err := m.EventBus().Subscribe(new(protocoltypes.GroupMetadataEvent))
	if err != nil {
		m.logger.Warn("unable to subscribe to events", zap.Error(err))
		close(ch)
		return ch
	}

	go func() {
		defer close(ch)
		defer sub.Close()
		for {
			var evt interface{}
			select {
			case <-gc.ctx.Done():
				return
			case evt = <-sub.Out():
			}

			e := evt.(protocoltypes.GroupMetadataEvent)
			if e.Metadata.EventType != protocoltypes.EventTypeGroupDeviceSecretAdded {
				continue
			}

			pk, ds, err := openDeviceSecret(e.Metadata, gc.getMemberPrivKey(), gc.Group())
			if errcode.Is(err, errcode.ErrInvalidInput) {
				continue
			}

			if errcode.Is(err, errcode.ErrGroupSecretOtherDestMember) {
				continue
			}

			if err != nil {
				gc.logger.Error("an error occurred while opening device secrets", zap.Error(err))
				continue
			}

			if err = gc.MessageKeystore().RegisterChainKey(gc.ctx, gc.Group(), pk, ds, gc.DevicePubKey().Equals(pk)); err != nil {
				gc.logger.Error("unable to register chain key", zap.Error(err))
				continue
			}

			// A new chainKey is registered, check if cached messages can be opened with it
			if rawPK, err := pk.Raw(); err == nil {
				gc.MessageStore().ProcessMessageQueueForDevicePK(gc.ctx, rawPK)
			}

			ch <- pk
		}
	}()

	return ch
}

func (gc *GroupContext) WatchNewMembersAndSendSecrets() <-chan crypto.PubKey {
	ch := make(chan crypto.PubKey)
	sub, err := gc.MetadataStore().EventBus().Subscribe(new(protocoltypes.GroupMetadataEvent))
	if err != nil {
		gc.logger.Warn("unable to subscribe to group metadata", zap.Error(err))
		close(ch)
		return ch
	}

	go func() {
		defer close(ch)
		defer sub.Close()
		for {
			var evt interface{}
			select {
			case evt = <-sub.Out():
			case <-gc.ctx.Done():
				return
			}

			e := evt.(protocoltypes.GroupMetadataEvent)
			if e.Metadata.EventType != protocoltypes.EventTypeGroupMemberDeviceAdded {
				continue
			}

			event := &protocoltypes.GroupAddMemberDevice{}
			if err := event.Unmarshal(e.Event); err != nil {
				gc.logger.Error("unable to unmarshal payload", zap.Error(err))
				continue
			}

			memberPK, err := crypto.UnmarshalEd25519PublicKey(event.MemberPK)
			if err != nil {
				gc.logger.Error("unable to unmarshal sender member pk", zap.Error(err))
				continue
			}

			if _, err := gc.MetadataStore().SendSecret(gc.ctx, memberPK); err != nil {
				if !errcode.Is(err, errcode.ErrGroupSecretAlreadySentToMember) {
					gc.logger.Error("unable to send secret to member", zap.Error(err))
				}
			}

			ch <- memberPK
		}
	}()

	return ch
}

func (gc *GroupContext) FillMessageKeysHolderUsingPreviousData() <-chan crypto.PubKey {
	ch := make(chan crypto.PubKey)
	publishedSecrets := gc.metadataStoreListSecrets()

	go func() {
		for pk, sec := range publishedSecrets {
			if err := gc.MessageKeystore().RegisterChainKey(gc.ctx, gc.Group(), pk, sec, gc.DevicePubKey().Equals(pk)); err != nil {
				gc.logger.Error("unable to register chain key", zap.Error(err))
				continue
			}
			// A new chainKey is registered, check if cached messages can be opened with it
			if rawPK, err := pk.Raw(); err == nil {
				gc.MessageStore().ProcessMessageQueueForDevicePK(gc.ctx, rawPK)
			}

			ch <- pk
		}

		close(ch)
	}()

	return ch
}

func (gc *GroupContext) metadataStoreListSecrets() map[crypto.PubKey]*protocoltypes.DeviceSecret {
	publishedSecrets := map[crypto.PubKey]*protocoltypes.DeviceSecret{}

	m := gc.MetadataStore()
	ownSK := gc.getMemberPrivKey()
	g := gc.Group()

	metadatas, err := m.ListEvents(gc.ctx, nil, nil, false)
	if err != nil {
		return nil
	}
	for metadata := range metadatas {
		if metadata == nil {
			continue
		}

		pk, ds, err := openDeviceSecret(metadata.Metadata, ownSK, g)
		if errcode.Is(err, errcode.ErrInvalidInput) || errcode.Is(err, errcode.ErrGroupSecretOtherDestMember) {
			continue
		}

		if err != nil {
			gc.logger.Error("unable to open device secret", zap.Error(err))
			continue
		}

		publishedSecrets[pk] = ds
	}

	return publishedSecrets
}

func (gc *GroupContext) SendSecretsToExistingMembers(contact crypto.PubKey) <-chan crypto.PubKey {
	ch := make(chan crypto.PubKey)
	members := gc.MetadataStore().ListMembers()

	// Force sending secret to contact member in contact group
	if gc.group.GroupType == protocoltypes.GroupTypeContact && len(members) < 2 && contact != nil {
		// Check if contact member is already listed
		found := false
		for _, member := range members {
			if member.Equals(contact) {
				found = true
			}
		}

		// If not listed, add it to the list
		if !found {
			members = append(members, contact)
		}
	}

	go func() {
		for _, pk := range members {
			rawPK, err := pk.Raw()
			if err != nil {
				gc.logger.Error("failed to serialize pk", zap.Error(err))
				continue
			}

			if _, err := gc.MetadataStore().SendSecret(gc.ctx, pk); err != nil {
				if !errcode.Is(err, errcode.ErrGroupSecretAlreadySentToMember) {
					gc.logger.Info("secret already sent secret to member", logutil.PrivateString("memberpk", base64.StdEncoding.EncodeToString(rawPK)))
					ch <- pk
					continue
				}
			} else {
				gc.logger.Info("sent secret to existing member", logutil.PrivateString("memberpk", base64.StdEncoding.EncodeToString(rawPK)))
				ch <- pk
			}
		}

		close(ch)
	}()

	return ch
}

func (gc *GroupContext) TagGroupContextPeers(ipfsCoreAPI ipfsutil.ExtendedCoreAPI, weight int) {
	id := gc.Group().GroupIDAsString()

	chSub1, err := gc.metadataStore.EventBus().Subscribe(new(stores.EventNewPeer))
	if err != nil {
		gc.logger.Warn("unable to subscribe to metadata event new peer")
		return
	}

	chSub2, err := gc.messageStore.EventBus().Subscribe(new(stores.EventNewPeer))
	if err != nil {
		gc.logger.Warn("unable to subscribe to message event new peer")
		return
	}

	go func() {
		defer chSub1.Close()
		defer chSub2.Close()

		for {
			var e interface{}

			select {
			case e = <-chSub1.Out():
			case e = <-chSub2.Out():
			case <-gc.ctx.Done():
				return
			}

			evt := e.(stores.EventNewPeer)

			tag := fmt.Sprintf("grp_%s", id)
			gc.logger.Debug("new peer of interest", logutil.PrivateStringer("peer", evt.Peer), zap.String("tag", tag), zap.Int("score", weight))
			ipfsCoreAPI.ConnMgr().TagPeer(evt.Peer, tag, weight)
		}
	}()
}
