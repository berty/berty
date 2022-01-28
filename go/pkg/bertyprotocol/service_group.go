package bertyprotocol

import (
	"context"
	"fmt"

	"github.com/libp2p/go-libp2p-core/crypto"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/go-orbit-db/iface"
)

func (s *service) getContactGroup(key crypto.PubKey) (*protocoltypes.Group, error) {
	sk, err := s.deviceKeystore.ContactGroupPrivKey(key)
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	g, err := cryptoutil.GetGroupForContact(sk)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	return g, nil
}

func (s *service) getGroupForPK(ctx context.Context, pk crypto.PubKey) (*protocoltypes.Group, error) {
	g, err := s.groupDatastore.Get(ctx, pk)
	if err == nil {
		return g, nil
	} else if !errcode.Is(err, errcode.ErrMissingMapKey) {
		return nil, errcode.ErrInternal.Wrap(err)
	}

	if err = reindexGroupDatastore(ctx, s.groupDatastore, s.accountGroup.metadataStore, s.deviceKeystore); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	g, err = s.groupDatastore.Get(ctx, pk)
	if err == nil {
		return g, nil
	} else if errcode.Is(err, errcode.ErrMissingMapKey) {
		return nil, errcode.ErrInvalidInput.Wrap(fmt.Errorf("unknown group specified"))
	}

	return nil, errcode.ErrInternal.Wrap(err)
}

func (s *service) deactivateGroup(pk crypto.PubKey) error {
	id, err := pk.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	cg, err := s.GetContextGroupForID(id)
	if err != nil || cg == nil {
		return nil
	}

	if cg.Group().GroupType == protocoltypes.GroupTypeAccount {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("can't deactivate account group"))
	}

	s.lock.Lock()
	defer s.lock.Unlock()

	err = cg.Close()
	if err != nil {
		s.logger.Error("unable to close group context", zap.Error(err))
	}

	delete(s.openedGroups, string(id))

	return nil
}

func (s *service) activateGroup(ctx context.Context, pk crypto.PubKey, localOnly bool) error {
	id, err := pk.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	cg, err := s.GetContextGroupForID(id)
	if err == nil && cg != nil {
		return nil
	}

	g, err := s.getGroupForPK(ctx, pk)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	s.lock.Lock()
	defer s.lock.Unlock()

	switch g.GroupType {
	case protocoltypes.GroupTypeContact, protocoltypes.GroupTypeMultiMember:
		dbOpts := &iface.CreateDBOptions{LocalOnly: &localOnly}

		gc, err := s.odb.OpenGroup(s.ctx, g, dbOpts)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		var contactPK crypto.PubKey
		if g.GroupType == protocoltypes.GroupTypeContact {
			contact := s.accountGroup.metadataStore.GetContactFromGroupPK(id)
			if contact != nil {
				contactPK, err = contact.GetPubKey()
				if err != nil {
					return errcode.TODO.Wrap(err)
				}
			}
		}

		if err := ActivateGroupContext(s.ctx, gc, contactPK); err != nil {
			return errcode.TODO.Wrap(err)
		}

		s.openedGroups[string(id)] = gc

		TagGroupContextPeers(s.ctx, gc, s.ipfsCoreAPI, 42)

		return nil
	case protocoltypes.GroupTypeAccount:
		return errcode.ErrInternal.Wrap(fmt.Errorf("deviceKeystore group should already be opened"))
	}

	return errcode.ErrInternal.Wrap(fmt.Errorf("unknown group type"))
}

func (s *service) GetContextGroupForID(id []byte) (*GroupContext, error) {
	if len(id) == 0 {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("no group id provided"))
	}

	s.lock.RLock()
	defer s.lock.RUnlock()

	cg, ok := s.openedGroups[string(id)]

	if ok {
		return cg, nil
	}

	return nil, errcode.ErrInternal.Wrap(fmt.Errorf("unknown group or not activated yet"))
}

func reindexGroupDatastore(ctx context.Context, gd *cryptoutil.GroupDatastore, m *MetadataStore, deviceKeystore cryptoutil.DeviceKeystore) error {
	if deviceKeystore == nil {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("missing device keystore"))
	}

	for _, g := range m.ListMultiMemberGroups() {
		if err := gd.Put(ctx, g); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}
	}

	for _, contact := range m.ListContactsByStatus(
		protocoltypes.ContactStateToRequest,
		protocoltypes.ContactStateReceived,
		protocoltypes.ContactStateAdded,
		protocoltypes.ContactStateRemoved,
		protocoltypes.ContactStateDiscarded,
		protocoltypes.ContactStateBlocked,
	) {
		cPK, err := contact.GetPubKey()
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		if err := gd.PutForContactPK(ctx, cPK, deviceKeystore); err != nil {
			return errcode.ErrInternal.Wrap(err)
		}
	}

	return nil
}
