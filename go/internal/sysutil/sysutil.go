package sysutil

import (
	"os"
	"runtime"
	"syscall"

	"go.uber.org/multierr"
	"moul.io/openfiles"

	"berty.tech/berty/v2/go/pkg/bertyversion"
	"berty.tech/weshnet/v2/pkg/protocoltypes"
	"berty.tech/weshnet/v2/pkg/username"
)

func SystemInfoProcess() (*protocoltypes.SystemInfo_Process, error) {
	var errs error

	// openfiles
	nofile, nofileErr := openfiles.Count()
	errs = multierr.Append(errs, nofileErr)

	// hostname
	hn, err := os.Hostname()
	errs = multierr.Append(errs, err)

	// working dir
	wd, err := syscall.Getwd()
	errs = multierr.Append(errs, err)

	reply := protocoltypes.SystemInfo_Process{
		Nofile:           nofile,
		TooManyOpenFiles: openfiles.IsTooManyError(nofileErr),
		NumCpu:           int64(runtime.NumCPU()),
		GoVersion:        runtime.Version(),
		HostName:         hn,
		NumGoroutine:     int64(runtime.NumGoroutine()),
		OperatingSystem:  runtime.GOOS,
		Arch:             runtime.GOARCH,
		Version:          bertyversion.Version,
		VcsRef:           bertyversion.VcsRef,
		Pid:              int64(syscall.Getpid()),
		Uid:              int64(syscall.Getuid()),
		Ppid:             int64(syscall.Getppid()),
		WorkingDir:       wd,
		SystemUsername:   username.GetUsername(),
	}

	// see sysutil_<OS>.go files
	err = appendCustomSystemInfo(&reply)
	errs = multierr.Append(errs, err)

	return &reply, errs
}
