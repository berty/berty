package messengerdb

import (
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

// atomic
func (d *DBWrapper) NotificationSetEnabled(value bool) (*messengertypes.Account, error) {
	var update *messengertypes.Account

	err := d.TX(d.ctx, func(d *DBWrapper) error {
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

		update = acc
		update.ShouldNotify = value
		return nil
	})

	return update, err
}

// atomic
func (d *DBWrapper) NotificationSetPushEnabled(value bool) (*messengertypes.Account, error) {
	var update *messengertypes.Account

	err := d.TX(d.ctx, func(d *DBWrapper) error {
		acc, err := d.GetAccount()
		if err != nil {
			return errcode.ErrDBRead.Wrap(err)
		}

		/*
			if acc.ShouldPushNotify == value {
				return nil
			}
		*/

		if err := d.db.Model(&acc).Update("should_push_notify", value).Error; err != nil {
			return errcode.ErrDBWrite.Wrap(err)
		}

		update = acc
		// update.ShouldPushNotify = value
		return nil
	})

	return update, err
}

// atomic
func (d *DBWrapper) NotificationConversationSetEnabled(convPK string, value bool) (*messengertypes.Conversation, error) {
	var update *messengertypes.Conversation

	err := d.TX(d.ctx, func(d *DBWrapper) error {
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

		update = conv
		update.ShouldNotify = value
		return nil
	})

	return update, err
}
