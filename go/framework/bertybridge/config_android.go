//go:build android
// +build android

package bertybridge

import "berty.tech/berty/v2/go/pkg/tempdir"

func (c *Config) SetAndroidCacheDir(path string) { tempdir.SetAndroidCacheDir(path) }
