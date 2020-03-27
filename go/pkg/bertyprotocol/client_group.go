package bertyprotocol

import (
	"context"
	"fmt"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
	"github.com/libp2p/go-libp2p-core/crypto"
)

func (c *client) indexGroups() error {
	c.lock.Lock()
	defer c.lock.Unlock()

	groups := c.accountGroup.MetadataStore().ListMultiMemberGroups()
	for _, g := range groups {
		if _, ok := c.groups[string(g.PublicKey)]; ok {
			continue
		}

		c.groups[string(g.PublicKey)] = g
	}

	contacts := c.accountGroup.MetadataStore().ListContactsByStatus(
		bertytypes.ContactStateToRequest,
		bertytypes.ContactStateReceived,
		bertytypes.ContactStateAdded,
		bertytypes.ContactStateRemoved,
		bertytypes.ContactStateDiscarded,
		bertytypes.ContactStateBlocked,
	)
	for _, contact := range contacts {
		if _, ok := c.groups[string(contact.PK)]; ok {
			continue
		}

		cPK, err := contact.GetPubKey()
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		sk, err := c.deviceKeystore.ContactGroupPrivKey(cPK)
		if err != nil {
			return errcode.ErrCryptoKeyGeneration.Wrap(err)
		}

		g, err := getGroupForContact(sk)
		if err != nil {
			return errcode.ErrOrbitDBOpen.Wrap(err)
		}

		c.groups[string(g.PublicKey)] = g
	}

	return nil
}

func (c *client) getContactGroup(key crypto.PubKey) (*bertytypes.Group, error) {
	sk, err := c.deviceKeystore.ContactGroupPrivKey(key)
	if err != nil {
		return nil, errcode.ErrCryptoKeyGeneration.Wrap(err)
	}

	g, err := getGroupForContact(sk)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	return g, nil
}

func (c *client) getGroupForPK(pk crypto.PubKey) (*bertytypes.Group, error) {
	id, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	c.lock.Lock()
	g, ok := c.groups[string(id)]
	c.lock.Unlock()

	if ok {
		return g, nil
	}

	if err = c.indexGroups(); err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	c.lock.Lock()
	g, ok = c.groups[string(id)]
	c.lock.Unlock()

	if ok {
		return g, nil
	}

	return nil, errcode.ErrMissingInput
}

func (c *client) deactivateGroup(pk crypto.PubKey) error {
	id, err := pk.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	cg, err := c.getContextGroupForID(id)
	if err != nil || cg == nil {
		return nil
	}

	if cg.Group().GroupType == bertytypes.GroupTypeAccount {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("can't deactivate deviceKeystore group"))
	}

	_ = cg.Close()

	c.lock.Lock()
	defer c.lock.Unlock()

	delete(c.groups, string(id))

	return nil
}

func (c *client) activateGroup(ctx context.Context, pk crypto.PubKey) error {
	id, err := pk.Raw()
	if err != nil {
		return errcode.ErrSerialization.Wrap(err)
	}

	cg, err := c.getContextGroupForID(id)
	if err == nil && cg != nil {
		return nil
	}

	g, err := c.getGroupForPK(pk)
	if err != nil {
		return errcode.TODO.Wrap(err)
	}

	c.lock.Lock()
	defer c.lock.Unlock()

	switch g.GroupType {
	case bertytypes.GroupTypeContact, bertytypes.GroupTypeMultiMember:
		cg, err := c.odb.OpenGroup(ctx, g, nil)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		err = ActivateGroupContext(ctx, cg)
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		c.openedGroups[string(id)] = cg

		return nil
	case bertytypes.GroupTypeAccount:
		return errcode.ErrInternal.Wrap(fmt.Errorf("deviceKeystore group should already be opened"))
	}

	return errcode.ErrInternal.Wrap(fmt.Errorf("unknown group type"))
}

func (c *client) getContextGroupForID(id []byte) (*groupContext, error) {
	if len(id) == 0 {
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("no group id provided"))
	}

	c.lock.Lock()
	defer c.lock.Unlock()

	cg, ok := c.openedGroups[string(id)]

	if ok {
		return cg, nil
	}

	return nil, errcode.ErrInternal.Wrap(fmt.Errorf("unknown group or not activated yet"))
}
