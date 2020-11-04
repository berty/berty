// +build android

package bertyaccount

import "berty.tech/berty/v2/go/pkg/tempdir"

func (c *Config) SetAndroidCacheDir(path string) { tempdir.SetAndroidCacheDir(path) }
