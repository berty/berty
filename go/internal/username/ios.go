//go:build ios && !catalyst
// +build ios,!catalyst

package username

/*
#cgo CFLAGS: -x objective-c
#cgo darwin LDFLAGS: -framework Foundation -framework UIKit
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

const char* GetDeviceName() {
	NSString *deviceName = [[UIDevice currentDevice] name];
	char *copy = strdup([deviceName UTF8String]);

	return copy;
}
*/
import "C"

import "unsafe"

const defaultUsername = "ios#1337"

func getUsername() string {
	cstring := C.GetDeviceName()
	username := C.GoString(cstring)
	C.free(unsafe.Pointer(cstring))

	return username
}
