package bertyprotocol

import (
	"context"
	"fmt"

	"github.com/libp2p/go-libp2p-core/crypto"

	"berty.tech/berty/go/pkg/errcode"
)

func (c *client) indexGroups() error {
	c.lock.Lock()
	defer c.lock.Unlock()

	groups := c.accContextGroup.MetadataStore().ListMultiMemberGroups()
	for _, g := range groups {
		if _, ok := c.groups[string(g.PublicKey)]; ok {
			continue
		}

		c.groups[string(g.PublicKey)] = g
	}

	contacts := c.accContextGroup.MetadataStore().ListContactsByStatus(ContactStateToRequest, ContactStateReceived, ContactStateAdded, ContactStateRemoved, ContactStateDiscarded, ContactStateBlocked)
	for _, contact := range contacts {
		if _, ok := c.groups[string(contact.PK)]; ok {
			continue
		}

		cPK, err := contact.GetPubKey()
		if err != nil {
			return errcode.TODO.Wrap(err)
		}

		sk, err := c.account.ContactGroupPrivKey(cPK)
		if err != nil {
			return errcode.ErrSecretKeyGenerationFailed.Wrap(err)
		}

		g, err := GetGroupForContact(sk)
		if err != nil {
			return errcode.ErrOrbitDBOpen.Wrap(err)
		}

		c.groups[string(g.PublicKey)] = g
	}

	return nil
}

func (c *client) getContactGroup(key crypto.PubKey) (*Group, error) {
	sk, err := c.account.ContactGroupPrivKey(key)
	if err != nil {
		return nil, errcode.ErrSecretKeyGenerationFailed.Wrap(err)
	}

	g, err := GetGroupForContact(sk)
	if err != nil {
		return nil, errcode.ErrOrbitDBOpen.Wrap(err)
	}

	return g, nil
}

func (c *client) getGroupForPK(pk crypto.PubKey) (*Group, error) {
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

	if cg.Group().GroupType == GroupTypeAccount {
		return errcode.ErrInvalidInput.Wrap(fmt.Errorf("can't deactivate account group"))
	}

	_ = cg.Close()

	c.lock.Lock()
	defer c.lock.Unlock()

	delete(c.groups, string(id))

	return nil
}

func (c *client) activateGroup(ctx context.Context, pk crypto.PubKey) (ContextGroup, error) {
	id, err := pk.Raw()
	if err != nil {
		return nil, errcode.ErrSerialization.Wrap(err)
	}

	cg, err := c.getContextGroupForID(id)
	if err == nil && cg != nil {
		return cg, nil
	}

	g, err := c.getGroupForPK(pk)
	if err != nil {
		return nil, errcode.TODO.Wrap(err)
	}

	c.lock.Lock()
	defer c.lock.Unlock()

	switch g.GroupType {
	case GroupTypeContact, GroupTypeMultiMember:
		cg, err := c.odb.OpenGroup(ctx, g, nil)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		err = ActivateGroupContext(ctx, cg)
		if err != nil {
			return nil, errcode.TODO.Wrap(err)
		}

		c.openedGroups[string(id)] = cg

		return cg, nil

	case GroupTypeAccount:
		return nil, errcode.ErrInternal.Wrap(fmt.Errorf("account group should already be opened"))
	}

	return nil, errcode.ErrInternal.Wrap(fmt.Errorf("unknown group type"))

}

func (c *client) getContextGroupForID(id []byte) (ContextGroup, error) {
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
