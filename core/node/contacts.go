package node

import (
	"berty.tech/core/entity"
	"berty.tech/core/pkg/errorcodes"
	"context"
)

func (n *Node) allTrustedContacts(ctx context.Context) ([]*entity.Contact, error) {
	var contacts []*entity.Contact

	sql := n.sql(ctx)
	query := sql.Model(entity.Contact{}).Where("status IN (?)", []entity.Contact_Status{
		entity.Contact_IsFriend,
		entity.Contact_IsTrustedFriend,
	})

	if err := query.Find(&contacts).Error; err != nil {
		return nil, errorcodes.ErrDb.Wrap(err)
	}

	return contacts, nil
}
