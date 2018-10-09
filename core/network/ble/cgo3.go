// +build cgo
package ble

// /*
// #cgo CFLAGS: -x objective-c -Wno-incompatible-pointer-types
// #cgo LDFLAGS: -framework Foundation -framework CoreBluetooth
// */
// import "C"
// import "github.com/multiformats/go-multiaddr/trestt/ble"

// func BLEInit() {
// 	ble.BLEInit()
// }

// func BLEStartAdvertising() {
// 	ble.BLEStartAdvertising()
// }

// func BLEStartDiscover() {
// 	ble.BLEStartDiscover()
// }

// //export callFromObjc
// func callFromObjc(test interface{}) {
// 	// fmt.Println("I am in Go code but I was called from objc!")
// 	// ptr := *(**C.NSData)(unsafe.Pointer(&test))
// 	// len := C.dataLength(ptr)
// 	// fmt.Printf("%+v\n\n", ptr)
// 	// dataCast := (*[1 << 30]byte)(C.dataPointer(ptr))[0:len]
// 	// goData := make([]byte, len)

// 	// copy(goData, dataCast)
// 	// fmt.Printf("%+v\n", goData)
// }
