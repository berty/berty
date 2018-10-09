package ble

import (
	"fmt"
	"time"
	"unsafe"

	smu "github.com/libp2p/go-stream-muxer"
	ma "github.com/multiformats/go-multiaddr"
)

/*
#cgo CFLAGS: -x objective-c -Wno-incompatible-pointer-types -Wno-missing-field-initializers -Wno-missing-prototypes -Werror=return-type -Wdocumentation -Wunreachable-code -Wno-implicit-atomic-properties -Werror=deprecated-objc-isa-usage -Wno-objc-interface-ivars -Werror=objc-root-class -Wno-arc-repeated-use-of-weak -Wimplicit-retain-self -Wduplicate-method-match -Wno-missing-braces -Wparentheses -Wswitch -Wunused-function -Wno-unused-label -Wno-unused-parameter -Wunused-variable -Wunused-value -Wempty-body -Wuninitialized -Wconditional-uninitialized -Wno-unknown-pragmas -Wno-shadow -Wno-four-char-constants -Wno-conversion -Wconstant-conversion -Wint-conversion -Wbool-conversion -Wenum-conversion -Wno-float-conversion -Wnon-literal-null-conversion -Wobjc-literal-conversion -Wshorten-64-to-32 -Wpointer-sign -Wno-newline-eof -Wno-selector -Wno-strict-selector-match -Wundeclared-selector -Wdeprecated-implementations -DNS_BLOCK_ASSERTIONS=1 -DOBJC_OLD_DISPATCH_PROTOTYPES=0
#cgo LDFLAGS: -framework Foundation -framework CoreBluetooth
#import "ble.h"
*/
import "C"

type BLEStream struct {
	smu.Stream
	rAddr             ma.Multiaddr
	deadline          time.Time
	rdeadline         time.Time
	wdeadline         time.Time
	notFinishedToRead []byte
	incoming          chan []byte
}

var streams map[string]*BLEStream = make(map[string]*BLEStream)

//export sendBytesToStream
func sendBytesToStream(bleUUID *C.char, bytes unsafe.Pointer, length C.int) {
	for {
		if stream, ok := streams[C.GoString(bleUUID)]; ok {
			stream.incoming <- C.GoBytes(bytes, length)
			return
		}
	}
}

func NewStream(rAddr ma.Multiaddr) *BLEStream {
	fmt.Printf("NEW STREAM\n")
	s := &BLEStream{
		incoming:          make(chan []byte),
		notFinishedToRead: make([]byte, 0),
		rAddr:             rAddr,
	}
	st, _ := rAddr.ValueForProtocol(P_BLE)
	streams[st] = s
	return s
}

func helper(dst, src []byte) int {
	lDst := len(dst)
	lSrc := len(src)
	if len(dst) >= len(src) {
		copy(dst, src)
		copy(src, src[:0])
		return lSrc
	} else {
		copy(dst, src[:len(dst)])
		copy(src, src[len(dst):])
		return lDst
	}
}

func (b *BLEStream) Read(p []byte) (n int, err error) {
	// fmt.Printf("BLEStream Reading %d %d\n\n", len(p), len(b.notFinishedToRead))
	if len(b.notFinishedToRead) != 0 {
		if len(p) >= len(b.notFinishedToRead) {
			copy(p, b.notFinishedToRead)
			b.notFinishedToRead = b.notFinishedToRead[:0]
			return len(p), nil
		} else {
			copy(p, b.notFinishedToRead[:len(p)])
			b.notFinishedToRead = b.notFinishedToRead[len(p):]
			return len(p), nil
		}
		// ret := helper(p, b.notFinishedToRead)

		// return ret, nil
	}

	b.notFinishedToRead = <-b.incoming
	if len(b.notFinishedToRead) != 0 {
		if len(p) >= len(b.notFinishedToRead) {
			copy(p, b.notFinishedToRead)
			b.notFinishedToRead = b.notFinishedToRead[:0]
			return len(p), nil
		} else {
			copy(p, b.notFinishedToRead[:len(p)])
			b.notFinishedToRead = b.notFinishedToRead[len(p):]
			return len(p), nil
		}
		// fmt.Printf("BLEStream Reading %+v %+v\n\n", p, b.notFinishedToRead)
		// return ret2, nil
	}

	return len(p), nil
}

func (b *BLEStream) Write(p []byte) (n int, err error) {
	C.writeNSData(
		C.Bytes2NSData(
			unsafe.Pointer(&p[0]),
			C.int(len(p)),
		),
	)
	return len(p), nil
}

func (b *BLEStream) Close() error {
	fmt.Println("BLEStream Close")
	return nil
}

func (b *BLEStream) Reset() error {
	st, _ := b.rAddr.ValueForProtocol(P_BLE)
	delete(streams, st)
	fmt.Println("BLEStream Reset")
	return nil
}

func (b *BLEStream) SetDeadline(t time.Time) error {
	fmt.Println("BLEStream SetDeadline")
	b.deadline = t
	return nil
}

func (b *BLEStream) SetReadDeadline(t time.Time) error {
	fmt.Println("BLEStream SetReadDeadline")
	b.rdeadline = t
	return nil
}

func (b *BLEStream) SetWriteDeadline(t time.Time) error {
	fmt.Println("BLEStream SetWriteDeadline")
	b.wdeadline = t
	return nil
}
