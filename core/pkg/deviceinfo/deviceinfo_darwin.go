// +build darwin

package deviceinfo

/*
#cgo CFLAGS: -x objective-c -Wno-incompatible-pointer-types
#cgo LDFLAGS: -framework Foundation -framework Security
#import "DarwinInterface.h"

*/
import "C"

func PackageID() string {
	return C.GoString(C.getPackageId())
}
