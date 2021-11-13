//go:build android
// +build android

package tempdir

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"os"
)

const (
	globalCacheDir = "/data/local/tmp"
	appCacheDir1   = "/data/user/0/%s/cache"
	appCacheDir2   = "/data/data/%s/cache"
)

func tempDir() string {
	// Return androidCacheDir if previously set from Java
	if androidCacheDir != "" {
		return androidCacheDir
	}

	// If not set, try to get the temp dir through env
	if envPath := os.Getenv("TMPDIR"); envPath != "" {
		if _, err := os.Stat(envPath); err == nil {
			return envPath
		}
	}

	// If not available, get ApplicationID for next tries
	content, err := ioutil.ReadFile("/proc/self/cmdline")
	if err == nil {
		applicationID := string(content[:bytes.IndexByte(content, 0)])

		// Try to get app cache dir variant 1
		variant1 := fmt.Sprintf(appCacheDir1, applicationID)
		if _, err := os.Stat(variant1); err == nil {
			return variant1
		}

		// Try to get app cache dir variant 2
		variant2 := fmt.Sprintf(appCacheDir2, applicationID)
		if _, err := os.Stat(variant2); err == nil {
			return variant2
		}
	}

	// If not available, try to use the global cache dir
	if _, err := os.Stat(globalCacheDir); err == nil {
		return globalCacheDir
	}

	return ""
}

// Can be set from Java by calling `getCacheDir().getAbsolutePath()` from a
// context and passing the returned value to `SetAndroidCacheDir()`.
var androidCacheDir string = ""

func SetAndroidCacheDir(path string) {
	androidCacheDir = path
}
