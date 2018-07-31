package config

import (
	"fmt"
	"reflect"
	"runtime"

	host "github.com/libp2p/go-libp2p-host"
	tptu "github.com/libp2p/go-libp2p-transport-upgrader"
)

var errorType = reflect.TypeOf((*error)(nil)).Elem()

// checks if a function returns either the specified type or the specified type
// and an error.
func checkReturnType(fnType, tptType reflect.Type) error {
	switch fnType.NumOut() {
	case 2:
		if fnType.Out(1) != errorType {
			return fmt.Errorf("expected (optional) second return value from transport constructor to be an error")
		}

		fallthrough
	case 1:
		if !fnType.Out(0).Implements(tptType) {
			return fmt.Errorf("transport constructor returns %s which doesn't implement %s", fnType.Out(0), tptType)
		}
	default:
		return fmt.Errorf("expected transport constructor to return a transport and, optionally, an error")
	}
	return nil
}

// Handles return values with optional errors. That is, return values of the
// form `(something, error)` or just `something`.
//
// Panics if the return value isn't of the correct form.
func handleReturnValue(out []reflect.Value) (interface{}, error) {
	switch len(out) {
	case 2:
		err := out[1]
		if err != (reflect.Value{}) && !err.IsNil() {
			return nil, err.Interface().(error)
		}
		fallthrough
	case 1:
		tpt := out[0]

		// Check for nil value and nil error.
		if tpt == (reflect.Value{}) {
			return nil, fmt.Errorf("unspecified error")
		}
		switch tpt.Kind() {
		case reflect.Ptr, reflect.Interface, reflect.Func:
			if tpt.IsNil() {
				return nil, fmt.Errorf("unspecified error")
			}
		}

		return tpt.Interface(), nil
	default:
		panic("expected 1 or 2 return values from transport constructor")
	}
}

// calls the transport constructor and annotates the error with the name of the constructor.
func callConstructor(c reflect.Value, args []reflect.Value) (interface{}, error) {
	val, err := handleReturnValue(c.Call(args))
	if err != nil {
		name := runtime.FuncForPC(c.Pointer()).Name()
		if name != "" {
			// makes debugging easier
			return nil, fmt.Errorf("transport constructor %s failed: %s", name, err)
		}
	}
	return val, err
}

type constructor func(h host.Host, u *tptu.Upgrader) interface{}

func makeArgumentConstructors(fnType reflect.Type, argTypes map[reflect.Type]constructor) ([]constructor, error) {
	out := make([]constructor, fnType.NumIn())
	for i := range out {
		argType := fnType.In(i)
		c, ok := argTypes[argType]
		if !ok {
			return nil, fmt.Errorf("argument %d has an unexpected type %s", i, argType.Name())
		}
		out[i] = c
	}
	return out, nil
}

// makes a transport constructor.
func makeConstructor(
	tpt interface{},
	tptType reflect.Type,
	argTypes map[reflect.Type]constructor,
) (func(host.Host, *tptu.Upgrader) (interface{}, error), error) {
	v := reflect.ValueOf(tpt)
	// avoid panicing on nil/zero value.
	if v == (reflect.Value{}) {
		return nil, fmt.Errorf("expected a transport or transport constructor, got a %T", tpt)
	}
	t := v.Type()
	if t.Kind() != reflect.Func {
		return nil, fmt.Errorf("expected a transport or transport constructor, got a %T", tpt)
	}

	if err := checkReturnType(t, tptType); err != nil {
		return nil, err
	}

	argConstructors, err := makeArgumentConstructors(t, argTypes)
	if err != nil {
		return nil, err
	}

	return func(h host.Host, u *tptu.Upgrader) (interface{}, error) {
		arguments := make([]reflect.Value, len(argConstructors))
		for i, makeArg := range argConstructors {
			arguments[i] = reflect.ValueOf(makeArg(h, u))
		}
		return callConstructor(v, arguments)
	}, nil
}
