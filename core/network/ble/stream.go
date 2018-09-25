package ble

import (
	"fmt"
	"time"

	smu "github.com/libp2p/go-stream-muxer"
)

type BLEStream struct {
	smu.Stream
	deadline  time.Time
	rdeadline time.Time
	wdeadline time.Time
}

func (b *BLEStream) Read(p []byte) (n int, err error) {
	fmt.Println("BLEStream Read")
	return 0, nil
}

func (b *BLEStream) Write(p []byte) (n int, err error) {
	fmt.Println("BLEStream Write")
	return 0, nil
}

func (b *BLEStream) Close() error {
	fmt.Println("BLEStream Close")
	return nil
}

func (b *BLEStream) Reset() error {
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
