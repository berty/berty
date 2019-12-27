package storesetting

import (
	"sync"

	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-orbit-db/iface"

	"berty.tech/berty/go/internal/group"
	"berty.tech/berty/go/internal/orbitutil/orbitutilapi"
	"berty.tech/berty/go/internal/orbitutil/storegroup"
)

type settingStoreIndex struct {
	lock         sync.RWMutex
	settings     map[string]map[string][]byte
	groupContext orbitutilapi.GroupContext
}

func (s *settingStoreIndex) Get(key string) interface{} {
	s.lock.RLock()
	defer s.lock.RUnlock()
	return s.settings[key]
}

// TODO: implement the same pattern used in secret store (pending setting /
// pending member, when both are ready, commit setting and send event)
// TODO2: use the same pattern used in secret and member store with a "processed"
// map to avoid processing the same entry each time UpdateIndex is called
func (s *settingStoreIndex) UpdateIndex(log ipfslog.Log, entries []ipfslog.Entry) error {
	var (
		err        error
		entryBytes []byte
	)

	for _, e := range log.Values().Slice() {
		namespace := ""
		payload := &group.SettingEntryPayload{}

		if entryBytes, err = storegroup.UnwrapOperation(e); err != nil {
			continue
		}

		if err = group.OpenStorePayload(payload, entryBytes, s.groupContext.GetGroup()); err != nil {
			continue
		}

		switch payload.Type {
		case group.SettingEntryPayload_PayloadTypeGroupSetting:
			if err := isAllowedToWriteSetting(s.groupContext.GetMemberStore(), payload); err != nil {
				continue
			}

		case group.SettingEntryPayload_PayloadTypeMemberSetting:
			member, err := payload.GetSignerPubKey()
			if err != nil {
				continue
			}

			namespace, err = keyAsString(member)
			if err != nil {
				continue
			}

		default:
			continue
		}

		s.lock.Lock()
		// TODO: Send an event when a setting has been updated
		if _, ok := s.settings[namespace]; !ok {
			s.settings[namespace] = map[string][]byte{}
		}

		s.settings[namespace][payload.Key] = payload.Value
		s.lock.Unlock()
	}

	return nil
}

// TODO: pass context for event subscription
func NewSettingStoreIndex(g orbitutilapi.GroupContext) iface.IndexConstructor {
	return func(publicKey []byte) iface.StoreIndex {
		return &settingStoreIndex{
			groupContext: g,
			settings:     map[string]map[string][]byte{},
		}
	}
}

var _ iface.StoreIndex = &settingStoreIndex{}
