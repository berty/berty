package core

import (
	"berty.tech/core/pkg/deviceinfo"
	"github.com/pkg/errors"
)

type DeviceInfoPkg struct{}

var DeviceInfo = &DeviceInfoPkg{}

func (*DeviceInfoPkg) GetStoragePath() string {
	return deviceinfo.GetStoragePath()
}

func (*DeviceInfoPkg) SetStoragePath(path string) error {
	return deviceinfo.SetStoragePath(path)
}

var (
	DeviceInfoAppStateKill       string = deviceinfo.AppState_name[int32(deviceinfo.AppState_Kill)]
	DeviceInfoAppStateBackground string = deviceinfo.AppState_name[int32(deviceinfo.AppState_Background)]
	DeviceInfoAppStateForeground string = deviceinfo.AppState_name[int32(deviceinfo.AppState_Foreground)]
)

func (*DeviceInfoPkg) GetAppState() string {
	return deviceinfo.AppState_name[int32(deviceinfo.GetAppState())]
}

func (*DeviceInfoPkg) SetAppState(state string) error {
	val, ok := deviceinfo.AppState_value[state]
	if !ok {
		return errors.New("cannot specify " + state + " as state")
	}
	deviceinfo.SetAppState(deviceinfo.AppState(val))
	return nil
}
