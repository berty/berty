// +build !darwin !cgo

// This file is just to make `go list` happy.

package mcdriver

import "C"

import (
	"unsafe"
)

func StartMCDriver(_ string) {}

func StopMCDriver() {}

var (
	GoHandleFoundPeer func(remotePID string) bool            = nil
	GoReceiveFromPeer func(remotePID string, payload []byte) = nil
)

//export HandleFoundPeer
func HandleFoundPeer(*C.char) C.int { return 0 } // nolint:golint

//export ReceiveFromPeer
func ReceiveFromPeer(*C.char, unsafe.Pointer, C.int) {}

func SendToPeer(_ string, _ []byte) bool { return false }

func DialPeer(_ string) bool { return false }

func CloseConnWithPeer(_ string) {}
