package main

type DHT interface {
	Run(port int) error
	RunSigned(port int, identity string) error
	Bootstrap(host string, port string) error
	Put(key string, value interface{}) error
	PutSigned(key string, value interface{}, identity string) error
	Get(key string) (interface{}, error)
	GetSigned(key string, identity string) (interface{}, error)
	Remove(key string) error
	RemoveSigned(key string, identity string) error
}
