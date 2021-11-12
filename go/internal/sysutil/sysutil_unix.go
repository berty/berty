//go:build linux || darwin
// +build linux darwin

package sysutil

import (
	"syscall"

	"go.uber.org/multierr"

	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func appendCustomSystemInfo(reply *protocoltypes.SystemInfo_Process) error {
	var errs error

	// rlimit
	rlimitNofile := syscall.Rlimit{}
	err := syscall.Getrlimit(syscall.RLIMIT_NOFILE, &rlimitNofile)
	errs = multierr.Append(errs, err)
	reply.RlimitCur = rlimitNofile.Cur
	reply.RlimitMax = rlimitNofile.Max

	// rusage
	rusage := syscall.Rusage{}
	err = syscall.Getrusage(syscall.RUSAGE_SELF, &rusage)
	errs = multierr.Append(errs, err)
	reply.UserCPUTimeMS = int64(rusage.Utime.Sec*1000) + int64(rusage.Utime.Usec/1000)   // nolint:unconvert // on some archs, those vars may be int32 instead of int64
	reply.SystemCPUTimeMS = int64(rusage.Stime.Sec*1000) + int64(rusage.Stime.Usec/1000) // nolint:unconvert // on some archs, those vars may be int32 instead of int64

	// process priority
	prio, err := syscall.Getpriority(syscall.PRIO_PROCESS, 0)
	errs = multierr.Append(errs, err)
	reply.Priority = int64(prio)

	return errs
}
