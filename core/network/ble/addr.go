package ble

import (
	"fmt"
	"net"
)

type BLEAddr struct {
	net.Addr
	addr string
}

func (b *BLEAddr) String() string {
	fmt.Println("BLEAddr String")
	return "test"
}

func (b *BLEAddr) Network() string {
	fmt.Println("BLEAddr Network")
	return "ble"
}
