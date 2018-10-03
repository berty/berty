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
func sendBytesToStream(peerID *C.char, bytes unsafe.Pointer, length C.int) {
	fmt.Printf("TYING TO SEND TO STREAM %s %s %d mapsstream%+v\n", C.GoString(peerID), string(C.GoBytes(bytes, length)), length, streams)
	if stream, ok := streams[C.GoString(peerID)]; ok {
		fmt.Println("SENDING")
		stream.incoming <- C.GoBytes(bytes, length)
	}
}

func NewStream(rAddr ma.Multiaddr) *BLEStream {
	fmt.Printf("NEW STREAM\n")
	s := &BLEStream{
		incoming:          make(chan []byte),
		notFinishedToRead: make([]byte, 0),
		rAddr:             rAddr,
	}
	st, _ := rAddr.ValueForProtocol(ma.P_RAW)
	streams[st] = s
	return s
}

func (b *BLEStream) Read(p []byte) (n int, err error) {
	fmt.Printf("BLEStream Reading %d %d\n\n", len(p), len(b.notFinishedToRead))
	if len(b.notFinishedToRead) != 0 {
		var lenToWrite int
		if len(p) <= len(b.notFinishedToRead) {
			fmt.Println("123")
			lenToWrite = len(p)
			copy(p, b.notFinishedToRead)
			if lenToWrite == len(b.notFinishedToRead) {
				b.notFinishedToRead = b.notFinishedToRead[:0]
			} else {
				b.notFinishedToRead = append(b.notFinishedToRead[:lenToWrite], b.notFinishedToRead[lenToWrite+1:]...)
			}
			fmt.Printf("BLEStream Readed %s $$$$$$$\n\n\n", string(p))
			return len(p), nil
		} else {
			fmt.Println("1234")
			lenToWrite = len(b.notFinishedToRead)
			copy(p, b.notFinishedToRead)
			b.notFinishedToRead = b.notFinishedToRead[:0]
			fmt.Printf("BLEStream Readed %s $$$$$$$\n\n\n", string(p))
			return lenToWrite, nil
		}
	}

	b.notFinishedToRead = <-b.incoming
	if len(b.notFinishedToRead) != 0 {
		var lenToWrite int
		if len(p) <= len(b.notFinishedToRead) {
			fmt.Println("12345")
			lenToWrite = len(p)
			copy(p, b.notFinishedToRead)
			if lenToWrite == len(b.notFinishedToRead) {
				b.notFinishedToRead = b.notFinishedToRead[:0]
			} else {
				b.notFinishedToRead = append(b.notFinishedToRead[:lenToWrite], b.notFinishedToRead[lenToWrite+1:]...)
			}
			fmt.Printf("BLEStream Readed %s $$$$$$$\n\n\n", string(p))
			return len(p), nil
		} else {
			fmt.Println("12356")
			lenToWrite = len(b.notFinishedToRead)
			copy(p, b.notFinishedToRead)
			b.notFinishedToRead = b.notFinishedToRead[:0]
			fmt.Printf("BLEStream Readed %s $$$$$$$\n\n\n", string(p))
			return lenToWrite, nil
		}
	}
	fmt.Printf("BLEStream Readeded %+v %+v\n\n\n", p, b.notFinishedToRead)

	return len(p), nil
}

func (b *BLEStream) Write(p []byte) (n int, err error) {
	fmt.Printf("BLEStream Write %s FINISHED\n\n\n", string(p))
	C.writeNSData(
		C.Bytes2NSData(
			unsafe.Pointer(&p[0]),
			C.int(len(p)),
		),
	)
	return 0, nil
}

func (b *BLEStream) Close() error {
	fmt.Println("BLEStream Close")
	return nil
}

func (b *BLEStream) Reset() error {
	st, _ := b.rAddr.ValueForProtocol(ma.P_RAW)
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
