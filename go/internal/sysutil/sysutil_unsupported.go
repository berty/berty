// +build !unix

package sysutil

import "berty.tech/berty/v2/go/pkg/bertytypes"

func appendCustomSystemInfo(reply *bertytypes.SystemInfo_Process) error {
	return nil
}
