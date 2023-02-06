//go:build !linux && !darwin
// +build !linux,!darwin

package sysutil

import "berty.tech/weshnet/pkg/protocoltypes"

func appendCustomSystemInfo(reply *protocoltypes.SystemInfo_Process) error {
	return nil
}
