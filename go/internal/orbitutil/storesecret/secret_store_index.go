package storesecret

import (
	"context"
	"encoding/base64"
	"fmt"
	"sync"

	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-orbit-db/events"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go/internal/group"
	"berty.tech/go/internal/orbitutil/orbitutilapi"
	"berty.tech/go/internal/orbitutil/storegroup"
	memberstore "berty.tech/go/internal/orbitutil/storemember"
	"berty.tech/go/pkg/errcode"
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

func formatSecretMapKey(destMemberPubKey crypto.PubKey, senderDevicePubKey crypto.PubKey) (string, error) {
	destBytes, err := destMemberPubKey.Bytes()
	if err != nil {
		return "", errcode.TODO.Wrap(err)
	}

	senderBytes, err := senderDevicePubKey.Raw()
	if err != nil {
		return "", errcode.TODO.Wrap(err)
	}

	// Converted to base64 to be printable when debugging
	destB64 := base64.StdEncoding.EncodeToString(destBytes)
	senderB64 := base64.StdEncoding.EncodeToString(senderBytes)

	return fmt.Sprintf("%s-%s", destB64, senderB64), nil
}

func (s *secretStoreIndex) Get(key string) interface{} {
	ret := &secretsMapEntry{}

	s.muSecrets.RLock()
	ret.secret, ret.exists = s.secrets[key]
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
		member, _ := s.groupContext.GetMemberStore().MemberForDevice(senderDevicePubKey)
		if member != nil {
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
			if err != nil && err != errcode.ErrGroupSecretOtherDestMember {
				continue
			}

			destMemberPubKey, err := crypto.UnmarshalEd25519PublicKey(payload.DestMemberPubKey)
			if err != nil {
				continue
			}

			senderDevicePubKey, err := crypto.UnmarshalEd25519PublicKey(payload.SenderDevicePubKey)
			if err != nil {
				continue
			}

			secretMapKey, err := formatSecretMapKey(destMemberPubKey, senderDevicePubKey)
			if err != nil {
				continue
			}

			s.muSecrets.Lock()
			s.secrets[secretMapKey] = deviceSecret
			s.muSecrets.Unlock()

			// Secret is destined to own member
			if destMemberPubKey.Equals(ownMemberKey.GetPublic()) {
				s.syncSecretWithPendingMember(senderDevicePubKey)
			}
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
		processed:     map[string]struct{}{},
		secrets:       map[string]*group.DeviceSecret{},
	}

	go g.GetMemberStore().Subscribe(context.TODO(), func(e events.Event) {
		switch e.(type) {
		case *memberstore.EventNewMemberDevice:
			casted, _ := e.(*memberstore.EventNewMemberDevice)
			newSecretStoreIndex.syncMemberWithPendingSecret(casted.MemberDevice.Device)
		}
	})

	return func(publicKey []byte) iface.StoreIndex {
		return newSecretStoreIndex
	}
}

var _ iface.StoreIndex = &secretStoreIndex{}
