// +build darwin

package ble

import (
	"fmt"
)

func (b *BLEAddr) String() string {
	fmt.Println("BLEAddr String")
	return "test"
}

func (b *BLEAddr) Network() string {
	fmt.Println("BLEAddr Network")
	return "ble"
}
