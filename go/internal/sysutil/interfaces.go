package sysutil

type NativeKeystore interface {
	Put(key string, data []byte) error
	Get(key string) ([]byte, error)
}
