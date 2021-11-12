//go:build android
// +build android

package username

/*
#include <sys/system_properties.h>
#include <string.h>
#include <stdlib.h>

// Could be improved using Android Java API
// https://medium.com/capital-one-tech/how-to-get-an-android-device-nickname-d5eab12f4ced

const char* GetDeviceName() {
	char model[PROP_VALUE_MAX + 1];
	int len = __system_property_get("ro.product.model", model);
	char *name = malloc(len + 1);

	memcpy(name, model, len);
	name[len] = 0;

	return name;
}
*/
import "C"

import "unsafe"

const defaultUsername = "android#1337"

func getUsername() string {
	cstring := C.GetDeviceName()
	username := C.GoString(cstring)
	C.free(unsafe.Pointer(cstring))

	return username
}
