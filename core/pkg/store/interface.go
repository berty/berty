// simple k/v store package

package store

type Store interface {
	Put(key string, value []byte) error
	Get(key string) ([]byte, error)

	Close() error
}
