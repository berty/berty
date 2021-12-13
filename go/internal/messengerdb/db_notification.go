package messengerdb

import "berty.tech/berty/v2/go/pkg/errcode"

func (d *DBWrapper) NotificationSetEnabled(value bool) (bool, error) {
	updated := false

	if err := d.TX(d.ctx, func(d *DBWrapper) error {
		acc, err := d.GetAccount()
		if err != nil {
			return errcode.ErrDBRead.Wrap(err)
		}

		if acc.ShouldNotify == value {
			return nil
		}

		if err := d.db.Model(&acc).Update("should_notify", value).Error; err != nil {
			return errcode.ErrDBWrite.Wrap(err)
		}

		updated = true
		return nil
	}); err != nil {
		return false, err
	}

	return updated, nil
}

func (d *DBWrapper) NotificationConversationSetEnabled(convPK string, value bool) (bool, error) {
	updated := false

	if err := d.TX(d.ctx, func(d *DBWrapper) error {
		conv, err := d.GetConversationByPK(convPK)
		if err != nil {
			return errcode.ErrDBRead.Wrap(err)
		}

		if conv.ShouldNotify == value {
			return nil
		}

		if err := d.db.Model(&conv).Update("should_notify", value).Error; err != nil {
			return errcode.ErrDBWrite.Wrap(err)
		}

		updated = true
		return nil
	}); err != nil {
		return false, err
	}

	return updated, nil
}
