package settingstore

import (
	"sync"

	ipfslog "berty.tech/go-ipfs-log"
	"berty.tech/go-orbit-db/iface"
	"berty.tech/go/internal/group"
	"berty.tech/go/internal/orbitutil/orbitutilapi"
	"berty.tech/go/internal/orbitutil/storegroup"
)

type settingsIndex struct {
	lock         sync.RWMutex
	settings     map[string]map[string][]byte
	groupContext orbitutilapi.GroupContext
}

func (s *settingsIndex) Get(key string) interface{} {
	s.lock.RLock()
	defer s.lock.RUnlock()
	return s.settings[key]
}

func (s *settingsIndex) UpdateIndex(log ipfslog.Log, entries []ipfslog.Entry) error {
	var (
		err        error
		entryBytes []byte
	)

	for _, e := range log.Values().Slice() {
		namespace := ""
		payload := &group.SettingsEntryPayload{}

		if entryBytes, err = storegroup.UnwrapOperation(e); err != nil {
			continue
		}

		if err = group.OpenStorePayload(payload, entryBytes, s.groupContext.GetGroup()); err != nil {
			continue
		}

		switch payload.Type {
		case group.SettingsEntryPayload_PayloadTypeGroupSetting:
			if err := isAllowedToWriteSetting(s.groupContext.GetMemberStore(), payload); err != nil {
				continue
			}

		case group.SettingsEntryPayload_PayloadTypeMemberSetting:
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
		if _, ok := s.settings[namespace]; !ok {
			s.settings[namespace] = map[string][]byte{}
		}

		s.settings[namespace][payload.Key] = payload.Value
		s.lock.Unlock()
	}

	return nil
}

func NewSettingsStoreIndex(g orbitutilapi.GroupContext) iface.IndexConstructor {
	return func(publicKey []byte) iface.StoreIndex {
		return &settingsIndex{
			groupContext: g,
			settings:     map[string]map[string][]byte{},
		}
	}
}

var _ iface.StoreIndex = &settingsIndex{}
