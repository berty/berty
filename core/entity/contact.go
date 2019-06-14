package entity

import (
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

var TrustedStatuses = []Contact_Status{
	Contact_IsTrustedFriend,
	Contact_IsFriend,
	Contact_Myself,
}

func (c Contact) Filtered() *Contact {
	return &Contact{
		ID:            c.ID,
		DisplayName:   c.DisplayName,
		DisplayStatus: c.DisplayStatus,
		// FIXME: share sigchain
	}
}

func (c *Contact) WithPushInformation(db *gorm.DB) *Contact {
	contact := *c
	devices := []*Device{}

	if err := db.Model(Device{}).Find(&devices, &Device{ContactID: c.ID}).Error; err != nil {
		logger().Error("unable to fetch devices", zap.Error(err))
		return &contact
	}

	for i, device := range devices {
		devices[i] = device.Filtered().WithPushInformation(db)
	}

	contact.Devices = devices

	return &contact
}

func (c *Contact) IsTrusted() bool {
	for _, status := range TrustedStatuses {
		if c.Status == status {
			return true
		}
	}

	return false
}

func (c Contact) PeerID() string {
	return c.ID // FIXME: use sigchain
}
