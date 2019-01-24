package core

import "berty.tech/core/pkg/deviceinfo"

type DeviceInfoPkg struct{}

var DeviceInfo = &DeviceInfoPkg{}

func (*DeviceInfoPkg) GetStoragePath() string {
	return deviceinfo.GetStoragePath()
}

func (*DeviceInfoPkg) SetStoragePath(path string) error {
	return deviceinfo.SetStoragePath(path)
}
