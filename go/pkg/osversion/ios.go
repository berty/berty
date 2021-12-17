//go:build ios
// +build ios

package osversion

/*
#cgo CFLAGS: -x objective-c
#cgo darwin LDFLAGS: -framework Foundation
#import <Foundation/Foundation.h>

typedef struct {
    int major;
    int minor;
    int patch;
} Version;

const Version GetVersion() {
	NSOperatingSystemVersion nsVersion = [[NSProcessInfo processInfo] operatingSystemVersion];
	Version version;

	version.major = (int) nsVersion.majorVersion;
	version.minor = (int) nsVersion.minorVersion;
	version.patch = (int) nsVersion.patchVersion;

	return version;
}
*/
import "C"

func GetVersion() Version {
	cver := C.GetVersion()

	return &version{
		major: int(cver.major),
		minor: int(cver.minor),
		patch: int(cver.patch),
	}
}
