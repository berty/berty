// +build android

package deviceinfo

import (
	"io/ioutil"
	"strings"
)

func PackageID() string {
	dat, err := ioutil.ReadFile("/proc/self/cmdline")
	if err != nil {
		return ""
	}

	return strings.Trim(string(dat), "\n \x00")
}
