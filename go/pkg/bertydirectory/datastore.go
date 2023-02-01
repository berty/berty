package bertydirectory

import (
	"berty.tech/berty/v2/go/pkg/directorytypes"
)

type Datastore interface {
	Get(identifier string) (*directorytypes.Record, error)
	Put(record *directorytypes.Record) error
	Del(identifier string) error
}
