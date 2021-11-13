//go:build darwin
// +build darwin

package tempdir

/*
#cgo CFLAGS: -x objective-c
#cgo LDFLAGS: -framework Foundation
#import <Foundation/Foundation.h>

const char* NativeTempDir() {
    NSString *tempDir = NSTemporaryDirectory();
    char *copy = strdup([tempDir UTF8String]);

    return copy;
}
*/
import "C"

import "unsafe"

func tempDir() string {
	cstring := C.NativeTempDir()
	path := C.GoString(cstring)
	C.free(unsafe.Pointer(cstring))

	return path
}
