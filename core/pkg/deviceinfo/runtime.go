package deviceinfo

import (
	"os"
	"runtime"
	"strings"

	"berty.tech/core"
)

type MemoryInfo struct {
	AllocMiB      uint64
	TotalAllocMiB uint64
	SysMiB        uint64
	NumGC         uint32
	Raw           *runtime.MemStats
}

type SystemInfo struct {
	OS           string
	Arch         string
	NumCPU       int
	GoVersion    string
	Compiler     string
	NumCgoCall   int64
	NumGoroutine int
	PID          int
	UID          int
	Hostname     string
	Executable   string
	Workdir      string
}

type VersionInfo struct {
	Core      core.All
	P2PApi    uint32
	NodeAPI   uint32
	PackageID string
}

func Runtime() (*DeviceInfos, error) {
	infos := DeviceInfos{}

	// memory
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	infos.Add(NewInfo("runtime", "memory").SetJSON(MemoryInfo{
		AllocMiB:      m.Alloc / 1024 / 1024,
		TotalAllocMiB: m.TotalAlloc / 1024 / 1024,
		SysMiB:        m.Sys / 1024 / 1024,
		NumGC:         m.NumGC,
		// Raw:           &m, // if enabled, there will be a huge amount of information
	}))

	// system
	systemInfo := SystemInfo{
		OS:           runtime.GOOS,
		Arch:         runtime.GOARCH,
		NumCPU:       runtime.NumCPU(),
		GoVersion:    runtime.Version(),
		Compiler:     runtime.Compiler,
		NumCgoCall:   runtime.NumCgoCall(),
		NumGoroutine: runtime.NumGoroutine(),
		PID:          os.Getpid(),
		UID:          os.Geteuid(),
	}
	// FIXME: aggregates err in multierr and set info.ErrMsg if any
	if hn, err := os.Hostname(); err == nil {
		systemInfo.Hostname = hn
	}
	if exe, err := os.Executable(); err == nil {
		systemInfo.Executable = exe
	}
	if wd, err := os.Getwd(); err == nil {
		systemInfo.Workdir = wd
	}
	infos.Add(NewInfo("runtime", "system").SetJSON(systemInfo))

	// env
	infos.Add(NewInfo("runtime", "environment").SetString(strings.Join(os.Environ(), "\n")))

	return &infos, nil
}
