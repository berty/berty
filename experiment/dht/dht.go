package dht

type DHT interface {
	Run() error
	Shutdown() error
	Bootstrap(url string) error
	Put(key string, value interface{}) error
	Get(key string) (interface{}, error)
	Remove(key string) error
}

type Options struct {
	User     string
	Password string
}
