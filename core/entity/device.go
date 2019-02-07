package entity

import (
	"strings"

	"berty.tech/core/pkg/errorcodes"
	"github.com/google/uuid"
	"github.com/jinzhu/gorm"
	"go.uber.org/zap"
)

func (d *Device) Username() string {
	if d == nil {
		return "unknown username"
	}
	name := d.Name
	name = strings.Replace(name, "iPhone de ", "", -1)
	name = strings.Replace(name, "'s iPhone", "", -1)
	return name
}

func (d Device) Filtered() *Device {
	return &Device{
		ID:         d.ID,
		ApiVersion: d.ApiVersion,
		ContactID:  d.ContactID,
	}
}

func (d *Device) WithPushInformation(db *gorm.DB) *Device {
	device := *d

	pushIdentifiers := []*DevicePushIdentifier{}
	devicePushConfigs := []*DevicePushConfig{}

	if err := db.Model(DevicePushConfig{}).Find(&devicePushConfigs, &DevicePushConfig{DeviceID: device.ID}).Error; err != nil {
		logger().Error("unable to fetch push configs", zap.Error(err))
		return &device
	}

	for _, devicePushConfig := range devicePushConfigs {
		pushIdentifier, err := devicePushConfig.CreateDevicePushIdentifier()

		if err != nil {
			logger().Error("unable to create push identifier", zap.Error(err))
			continue
		}

		pushIdentifiers = append(pushIdentifiers, pushIdentifier)
	}

	device.PushIdentifiers = pushIdentifiers

	return &device
}

func (d *Device) UpdatePushIdentifiers(db *gorm.DB, identifiers []*DevicePushIdentifier) error {
	if err := db.Delete(&DevicePushIdentifier{}, &DevicePushIdentifier{DeviceID: d.ID}).Error; err != nil {
		return errorcodes.ErrDbDelete.Wrap(err)
	}

	for _, identifier := range identifiers {
		identifier.ID = uuid.New().String()

		if err := db.Save(identifier).Error; err != nil {
			return errorcodes.ErrDbCreate.Wrap(err)
		}
	}

	return nil
}

func SaveDevices(db *gorm.DB, contactID string, devices []*Device) error {
	for _, device := range devices {
		// TODO: make ID composite with contactID

		pushIdentifiers := device.PushIdentifiers
		device.ContactID = contactID
		device.PushIdentifiers = []*DevicePushIdentifier{}

		if err := db.Save(device).Error; err != nil {
			return errorcodes.ErrDbCreate.Wrap(err)
		}

		if err := device.UpdatePushIdentifiers(db, pushIdentifiers); err != nil {
			return errorcodes.ErrPushInvalidIdentifier.Wrap(err)
		}
	}

	return nil
}

func (d Device) IsNode() {} // required by gqlgen
