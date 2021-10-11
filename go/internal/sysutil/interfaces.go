package sysutil

type NativeKeystore interface {
	Put(key, value string) error
	Get(key string) (string, error)
}
