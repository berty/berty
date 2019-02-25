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
	app = &deviceinfo.Application{
		State: deviceinfo.Application_Kill,
		Route: "",
	}
	DeviceInfoAppStateKill       string = deviceinfo.Application_State_name[int32(deviceinfo.Application_Kill)]
	DeviceInfoAppStateBackground string = deviceinfo.Application_State_name[int32(deviceinfo.Application_Background)]
	DeviceInfoAppStateForeground string = deviceinfo.Application_State_name[int32(deviceinfo.Application_Foreground)]
)

func (*DeviceInfoPkg) GetAppState() string {
	return deviceinfo.Application_State_name[int32(app.GetState())]
}

func (*DeviceInfoPkg) SetAppState(state string) error {
	val, ok := deviceinfo.Application_State_value[state]
	if !ok {
		return errors.New("cannot specify " + state + " as state")
	}
	app.SetState(deviceinfo.Application_State(val))
	return nil
}

func (*DeviceInfoPkg) SetAppRoute(route string) {
	app.SetRoute(route)
}
