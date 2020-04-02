package bertyprotocol

import (
	"fmt"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

func (s *service) indexGroups() error {
	s.lock.Lock()
	defer s.lock.Unlock()

	groups := s.accountGroup.MetadataStore().ListMultiMemberGroups()
	for _, g := range groups {
		if _, ok := s.groups[string(g.PublicKey)]; ok {
			continue
		}

		s.groups[string(g.PublicKey)] = g
	}

	contacts := s.accountGroup.MetadataStore().ListContactsByStatus(
		bertytypes.ContactStateToRequest,
		bertytypes.ContactStateReceived,
		bertytypes.ContactStateAdded,
		bertytypes.ContactStateRemoved,
		bertytypes.ContactStateDiscarded,
		bertytypes.ContactStateBlocked,
	)
	for _, contact := range contacts {
		if _, ok := s.groups[string(contact.PK)]; ok {
			continue
		}

		cPK, err := contact.GetPubKey()
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		sk, err := s.deviceKeystore.ContactGroupPrivKey(cPK)
		if err != nil {
			return errcode.ErrCryptoKeyGeneration.Wrap(err)
		}

		g, err := getGroupForContact(sk)
		if err != nil {
			return errcode.ErrOrbitDBOpen.Wrap(err)
		}

		s.groups[string(g.PublicKey)] = g
	}

	return nil
}

func (s *service) getContactGroup(key crypto.PubKey) (*bertytypes.Group, error) {
	sk, err := s.deviceKeystore.ContactGroupPrivKey(key)
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	g, err := getGroupForContact(sk)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	return g, nil
}

func (s *service) getGroupForPK(pk crypto.PubKey) (*bertytypes.Group, error) {
	id, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	s.lock.Lock()
	g, ok := s.groups[string(id)]
	s.lock.Unlock()

	if ok {
		return g, nil
	}

	if err = s.indexGroups(); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	s.lock.Lock()
	g, ok = s.groups[string(id)]
	s.lock.Unlock()

	if ok {
		return g, nil
	}

	return nil, errcode.ErrMissingInput
}

func (s *service) deactivateGroup(pk crypto.PubKey) error {
	id, err := pk.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	cg, err := s.getContextGroupForID(id)
	if err != nil || cg == nil {
		return nil
	}

	if cg.Group().GroupType == bertytypes.GroupTypeAccount {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("can't deactivate deviceKeystore group"))
	}

	_ = cg.Close()

	s.lock.Lock()
	defer s.lock.Unlock()

	delete(s.groups, string(id))

	return nil
}

func (s *service) activateGroup(pk crypto.PubKey) error {
	id, err := pk.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	cg, err := s.getContextGroupForID(id)
	if err == nil && cg != nil {
		return nil
	}

	g, err := s.getGroupForPK(pk)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	s.lock.Lock()
	defer s.lock.Unlock()

	switch g.GroupType {
	case bertytypes.GroupTypeContact, bertytypes.GroupTypeMultiMember:
		cg, err := s.odb.OpenGroup(s.ctx, g, nil)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		err = ActivateGroupContext(s.ctx, cg)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		s.openedGroups[string(id)] = cg

		return nil
	case bertytypes.GroupTypeAccount:
		return errcode.ErrInternal.Wrap(fmt.Errorf("deviceKeystore group should already be opened"))
	}

	return errcode.ErrInternal.Wrap(fmt.Errorf("unknown group type"))
}

func (s *service) getContextGroupForID(id []byte) (*groupContext, error) {
	if len(id) == 0 {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("no group id provided"))
	}

	s.lock.Lock()
	defer s.lock.Unlock()

	cg, ok := s.openedGroups[string(id)]

	if ok {
		return cg, nil
	}

	return nil, errcode.ErrInternal.Wrap(fmt.Errorf("unknown group or not activated yet"))
}
