package entity

import (
	"strings"
)

var DefaultPushRelayIds = map[DevicePushType][]byte{
	DevicePushType_UnknownDevicePushType: []byte("FILL_ME"),
	DevicePushType_APNS:                  []byte("FILL_ME"),
	DevicePushType_FCM:                   []byte("FILL_ME"),
}

func (d *Device) Username() string {
	if d == nil {
		return "unknown username"
	}
	name := d.Name
	name = strings.Replace(name, "iPhone de ", "", -1)
	name = strings.Replace(name, "'s iPhone", "", -1)
	return name
}

func (d Device) IsNode() {} // required by gqlgen

func (d DevicePushIdentifier) IsNode() {} // required by gqlgen

func (d DevicePushConfig) IsNode() {} // required by gqlgen
