package storesecret

import (
	"context"
	"sync"

	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/iface"
	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/internal/orbitutil/orbitutilapi"
	"berty.tech/berty/go/internal/orbitutil/storegroup"
	"berty.tech/berty/go/internal/orbitutil/storemember"
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

func (s *secretStoreIndex) syncSecretWithPendingMemberDevice(senderDevicePubKey crypto.PubKey) {
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
		_, err := s.groupContext.GetMemberStore().GetEntryByDevice(senderDevicePubKey)
		if err == nil {
			s.memberPending[senderDevicePubKeyStr] = struct{}{}
			s.emitEventNewSecret(senderDevicePubKey)
		}
	}

	s.muPending.Unlock()
}

func (s *secretStoreIndex) emitEventNewSecret(senderDevicePubKey crypto.PubKey) {
	eventNewSecret := NewEventNewSecret(senderDevicePubKey)
	s.groupContext.GetSecretStore().Emit(eventNewSecret)
}

func (s *secretStoreIndex) UpdateIndex(log ipfslog.Log, entries []ipfslog.Entry) error {
	ownMemberKey := s.groupContext.GetMemberPrivKey()
	currentGroup := s.groupContext.GetGroup()

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

			if err = group.OpenStorePayload(payload, entryBytes, currentGroup); err != nil {
				continue
			}

			if err = payload.CheckStructure(); err != nil {
				continue
			}

			senderDevicePubKey, err := crypto.UnmarshalEd25519PublicKey(payload.SenderDevicePubKey)
			if err != nil {
				continue
			}

			if senderDevicePubKey.Equals(s.groupContext.GetDevicePrivKey().GetPublic()) {
				// Secret was sent from current device to a member, stores it in map
				// so it will be used as a "sent receipt"
				destMemberPubKey, err := crypto.UnmarshalEd25519PublicKey(payload.DestMemberPubKey)
				if err != nil {
					continue
				}

				destMemberBytes, err := destMemberPubKey.Raw()
				if err != nil {
					continue
				}

				s.muSecrets.Lock()
				s.secrets[string(destMemberBytes)] = nil
				s.muSecrets.Unlock()
			} else {
				// Decrypts and stores the secret if destined to current member or
				// discards it otherwise
				deviceSecret, err := payload.ToDeviceSecret(ownMemberKey, currentGroup)
				if err != nil {
					continue
				}

				senderDeviceBytes, err := senderDevicePubKey.Raw()
				if err != nil {
					continue
				}

				s.muSecrets.Lock()
				s.secrets[string(senderDeviceBytes)] = deviceSecret
				s.muSecrets.Unlock()

				s.syncSecretWithPendingMemberDevice(senderDevicePubKey)
			}
		}
	}

	return nil
}

// NewSecretStoreIndex returns a new index constructor to manage the list of the group member secrets
func NewSecretStoreIndex(ctx context.Context) func(g orbitutilapi.GroupContext) iface.IndexConstructor {
	return func(g orbitutilapi.GroupContext) iface.IndexConstructor {
		newSecretStoreIndex := &secretStoreIndex{
			groupContext:  g,
			secretPending: map[string]struct{}{},
			memberPending: map[string]struct{}{},
			secrets:       map[string]*group.DeviceSecret{},
			processed:     map[string]struct{}{},
		}

		go g.GetMemberStore().Subscribe(ctx, func(e events.Event) {
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
}

var _ iface.StoreIndex = &secretStoreIndex{}
