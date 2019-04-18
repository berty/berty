package daemon

import (
	"berty.tech/core/pkg/deviceinfo"
	"github.com/pkg/errors"
)

func (d *Daemon) SetStoragePath(path string) error {
	return deviceinfo.SetStoragePath(path)
}

func (d *Daemon) GetStoragePath() string {
	return deviceinfo.GetStoragePath()
}

func (d *Daemon) SetAppState(state string) error {
	val, ok := deviceinfo.Application_State_value[state]
	if !ok {
		return errors.New("cannot specify " + state + " as state")
	}
	d.app.SetState(deviceinfo.Application_State(val))
	return nil
}

func (d *Daemon) GetAppState() string {
	return d.app.GetState().String()
}

func (d *Daemon) SetAppRoute(route string) {
	d.app.SetRoute(route)
}

func (d *Daemon) GetAppRoute() string {
	return d.app.Route
}
