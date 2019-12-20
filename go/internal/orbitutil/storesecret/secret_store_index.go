package storesecret

import (
	"context"
	"sync"

	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go/internal/group"
	"berty.tech/go/internal/orbitutil/orbitutilapi"
	"berty.tech/go/internal/orbitutil/storegroup"
	"berty.tech/go/internal/orbitutil/storemember"
	"github.com/libp2p/go-libp2p-core/crypto"
)

type secretStoreIndex struct {
	groupContext orbitutilapi.GroupContext

	secretPending map[string]struct{}
	memberPending map[string]struct{}
	muPending     sync.RWMutex

	secrets     map[string]*group.DeviceSecret
	muSecrets   sync.RWMutex
	processed   map[string]struct{}
	muProcessed sync.RWMutex
}

type secretsMapEntry struct {
	secret *group.DeviceSecret
	exists bool
}

func (s *secretStoreIndex) Get(senderDevicePubKey string) interface{} {
	ret := &secretsMapEntry{}

	s.muSecrets.RLock()
	ret.secret, ret.exists = s.secrets[senderDevicePubKey]
	s.muSecrets.RUnlock()

	return ret
}

func (s *secretStoreIndex) syncMemberWithPendingSecret(senderDevicePubKey crypto.PubKey) {
	senderDevicePubKeyBytes, err := senderDevicePubKey.Bytes()
	if err != nil {
		return
	}
	senderDevicePubKeyStr := string(senderDevicePubKeyBytes)

	s.muPending.Lock()

	_, secretPending := s.secretPending[senderDevicePubKeyStr]
	_, memberPending := s.memberPending[senderDevicePubKeyStr]

	if !memberPending {
		s.memberPending[senderDevicePubKeyStr] = struct{}{}
	}

	if !memberPending && secretPending {
		s.emitEventNewSecret(senderDevicePubKey)
	}

	s.muPending.Unlock()
}

func (s *secretStoreIndex) syncSecretWithPendingMember(senderDevicePubKey crypto.PubKey) {
	senderDevicePubKeyBytes, err := senderDevicePubKey.Bytes()
	if err != nil {
		return
	}
	senderDevicePubKeyStr := string(senderDevicePubKeyBytes)

	s.muPending.Lock()

	s.secretPending[senderDevicePubKeyStr] = struct{}{}

	_, memberPending := s.memberPending[senderDevicePubKeyStr]

	if memberPending {
		s.emitEventNewSecret(senderDevicePubKey)
	} else {
		// member, _ := s.groupContext.GetMemberStore().MemberForDevice(senderDevicePubKey)
		// if member != nil {
		// s.memberPending[senderDevicePubKeyStr] = struct{}{}
		// s.emitEventNewSecret(senderDevicePubKey)
		// }
	}

	s.muPending.Unlock()
}

func (s *secretStoreIndex) emitEventNewSecret(senderDevicePubKey crypto.PubKey) {
	eventNewSecret := NewEventNewSecret(senderDevicePubKey)
	s.groupContext.GetSecretStore().Emit(eventNewSecret)
}

func (s *secretStoreIndex) UpdateIndex(log ipfslog.Log, entries []ipfslog.Entry) error {
	ownMemberKey := s.groupContext.GetMemberPrivKey()
	currenGroup := s.groupContext.GetGroup()

	for _, e := range log.Values().Slice() {
		var err error
		entryHash := e.GetHash().String()

		s.muProcessed.RLock()
		_, ok := s.processed[entryHash]
		s.muProcessed.RUnlock()

		if !ok {
			s.muProcessed.Lock()
			s.processed[entryHash] = struct{}{}
			s.muProcessed.Unlock()

			var entryBytes []byte
			payload := &group.SecretEntryPayload{}

			if entryBytes, err = storegroup.UnwrapOperation(e); err != nil {
				continue
			}

			if err = group.OpenStorePayload(payload, entryBytes, currenGroup); err != nil {
				continue
			}

			if err = payload.CheckStructure(); err != nil {
				continue
			}

			deviceSecret, err := payload.ToDeviceSecret(ownMemberKey, currenGroup)
			if err != nil {
				continue
			}

			senderDevicePubKey, err := crypto.UnmarshalEd25519PublicKey(payload.SenderDevicePubKey)
			if err != nil {
				continue
			}

			senderBytes, err := senderDevicePubKey.Raw()
			if err != nil {
				continue
			}

			s.muSecrets.Lock()
			s.secrets[string(senderBytes)] = deviceSecret
			s.muSecrets.Unlock()

			s.syncSecretWithPendingMember(senderDevicePubKey)
		}
	}

	return nil
}

// NewSecretStoreIndex returns a new index to manage the list of the group member secrets
func NewSecretStoreIndex(g orbitutilapi.GroupContext) iface.IndexConstructor {
	newSecretStoreIndex := &secretStoreIndex{
		groupContext:  g,
		secretPending: map[string]struct{}{},
		memberPending: map[string]struct{}{},
		secrets:       map[string]*group.DeviceSecret{},
		processed:     map[string]struct{}{},
	}

	go g.GetMemberStore().Subscribe(context.TODO(), func(e events.Event) {
		switch e.(type) {
		case *storemember.EventNewMemberDevice:
			casted, _ := e.(*storemember.EventNewMemberDevice)
			newSecretStoreIndex.syncMemberWithPendingSecret(casted.MemberDevice.Device)
		}
	})

	return func(publicKey []byte) iface.StoreIndex {
		return newSecretStoreIndex
	}
}

var _ iface.StoreIndex = &secretStoreIndex{}
