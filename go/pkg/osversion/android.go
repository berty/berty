//go:build android
// +build android

package osversion

/*
#include <android/api-level.h>

const int GetVersion() {
	return android_get_device_api_level();
}
*/
import "C"

func GetVersion() Version {
	cver := C.GetVersion()

	return &version{
		major: int(cver),
		minor: -1,
		patch: -1,
	}
}
