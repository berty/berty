package omnisearch

import (
	"fmt"
	"reflect"
)

type mirror struct {
	objs  map[reflect.Type]reflect.Value
	types []reflect.Type
}

// NewMirror creates a mirror provider.
// The mirror provider just reprovide the given objects.
func NewMirror(objs ...interface{}) Provider {
	objsm := make(map[reflect.Type]reflect.Value)
	i := len(objs)
	types := make([]reflect.Type, i)
	for i > 0 {
		i--
		v := reflect.ValueOf(objs[i])
		t := v.Type()
		types[i] = t
		objsm[t] = v
	}
	return mirror{
		objs:  objsm,
		types: types,
	}
}

func (m mirror) Available() []reflect.Type {
	return m.types
}

func (m mirror) Make(t reflect.Type) (reflect.Value, error) {
	v, ok := m.objs[t]
	if ok {
		return v, nil
	}
	return reflect.Value{}, fmt.Errorf("mirror provider doesn't contain type %s", t.Name())
}

func (mirror) Name() string {
	return "Mirror"
}

func (m mirror) String() string {
	return m.Name()
}
