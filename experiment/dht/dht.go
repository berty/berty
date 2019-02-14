package dht

type DHT interface {
	Run(port int) error
	Shutdown() error
	Bootstrap(host string, port string) error
	Put(key string, value interface{}) error
	Get(key string) (interface{}, error)
	Remove(key string) error
}
