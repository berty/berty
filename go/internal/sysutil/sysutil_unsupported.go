//go:build !linux && !darwin
// +build !linux,!darwin

package sysutil

import "berty.tech/weshnet/v2/pkg/protocoltypes"

func appendCustomSystemInfo(reply *protocoltypes.SystemInfo_Process) error {
	return nil
}
