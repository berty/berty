//go:build !linux && !darwin
// +build !linux,!darwin

package sysutil

import "berty.tech/berty/v2/go/pkg/protocoltypes"

func appendCustomSystemInfo(reply *protocoltypes.SystemInfo_Process) error {
	return nil
}
