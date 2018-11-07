package deviceinfo

import (
	"fmt"
	"os"
	"runtime"
	"strings"
)

func Runtime() map[string]string {
	infos := map[string]string{}
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	infos["runtime: memory"] = fmt.Sprintf(
		"Alloc=%vMiB, TotalAlloc=%vMiB, Sys=%vMiB, NumGC=%v",
		m.Alloc/1024/1024,
		m.TotalAlloc/1024/1024,
		m.Sys/1024/1024,
		m.NumGC,
	)
	infos["runtime: platform"] = fmt.Sprintf("%s/%s", runtime.GOOS, runtime.GOARCH)
	infos["runtime: CPUs"] = fmt.Sprintf("%d", runtime.NumCPU())
	infos["build: GO version"] = fmt.Sprintf("%s (compiler: %s)", runtime.Version(), runtime.Compiler)
	infos["runtime: CGO calls"] = fmt.Sprintf("%d", runtime.NumCgoCall())
	infos["runtime: Go routines"] = fmt.Sprintf("%d", runtime.NumGoroutine())
	if hn, err := os.Hostname(); err != nil {
		infos["runtime: hostname"] = hn
	}
	if exe, err := os.Executable(); err != nil {
		infos["runtime: executable"] = exe
	}
	infos["runtime: pid"] = fmt.Sprintf("%d", os.Getpid())
	infos["runtime: uid"] = fmt.Sprintf("%d", os.Geteuid())
	if wd, err := os.Getwd(); err != nil {
		infos["runtime: pwd"] = wd
	}

	// env
	infos["env: vars"] = strings.Join(os.Environ(), "\n")
	return infos
}
