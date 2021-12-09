package omnisearch

import (
	"fmt"
	"reflect"
)

type coordinatorConfig struct {
	providers []Provider

	coordinator *coordinator
}

func (c *coordinatorConfig) usingConstructorMake(constructor interface{}, target reflect.Type) (interface{}, error) {
	value := reflect.ValueOf(constructor)
	typ := value.Type()
	if typ.Kind() != reflect.Func {
		return nil, fmt.Errorf("got a %s", typ.Name())
	}
	iTgt := -1
	iError := -1
	// Finding the index of the returns we want.
	{
		i := typ.NumOut()
		for i > 0 {
			i--
			typOut := typ.Out(i)
			if typOut == target || typOut.ConvertibleTo(target) {
				if iTgt != -1 {
					return nil, fmt.Errorf("type %s as constructor have more than one %s return", typ.Name(), target.Name())
				}
				iTgt = i
			} else if typOut == errorType || typOut.ConvertibleTo(errorType) {
				if iError != -1 {
					return nil, fmt.Errorf("type %s as constructor have more than one error return", typ.Name())
				}
				iError = i
			}
			// Ignoring useless one.
		}
	}
	if iTgt == -1 {
		return nil, fmt.Errorf("type %s as constructor doesn't return any %s", typ.Name(), target.Name())
	}

	// Creating the argument slice
	var args []reflect.Value
	{
		i := typ.NumIn()
		args = make([]reflect.Value, i)
		for i > 0 {
			i--
			typIn := typ.In(i)
		ProviderLoop:
			for _, p := range c.providers {
				for _, pt := range p.Available() {
					if pt == typIn || pt.ConvertibleTo(typIn) {
						rv, err := p.Make(pt)
						if err != nil {
							return nil, fmt.Errorf("error building %s for %s: provider %q errored: %w", typIn.Name(), typ.Name(), p.Name(), err)
						}
						rt := rv.Type()
						if rt != typIn {
							if rt.ConvertibleTo(typIn) {
								rv = rv.Convert(typIn)
							} else {
								return nil, fmt.Errorf("error building %s for %s: provider %q returned wrong type %s while %s was expected", typIn.Name(), typ.Name(), p.Name(), rt.Name(), typIn.Name())
							}
						}
						args[i] = rv
						break ProviderLoop
					}
				}
			}
		}
	}

	// Calling the function
	out := value.Call(args)
	if iError != -1 {
		err := out[iError].Interface()
		if err != nil {
			return nil, fmt.Errorf("type %s as constructor errored: %w", typ.Name(), err.(error))
		}
	}
	// Checking for nil
	tgt := out[iTgt].Interface()
	if tgt == nil {
		return nil, fmt.Errorf("type %s as constructor returned nil %s", typ.Name(), target.Name())
	}
	return tgt, nil
}

// Configurator is used to configure the search engine.
type Configurator func(*coordinatorConfig) error

// CMerge merges multiple configurator, from first to last.
func CMerge(cfgs ...Configurator) Configurator {
	return func(c *coordinatorConfig) error {
		for _, v := range cfgs {
			err := v(c)
			if err != nil {
				return err
			}
		}
		return nil
	}
}

var (
	providerType = reflect.TypeOf((*Provider)(nil)).Elem()
	engineType   = reflect.TypeOf((*Engine)(nil)).Elem()
	parserType   = reflect.TypeOf((*Parser)(nil)).Elem()
	errorType    = reflect.TypeOf((*error)(nil)).Elem()
)

// CAddProvider will add providers to the config, from first to last.
// It accept either instancied Provider or function returning a Provider.
// The function can have some params, in this case the provider logic will be used.
// The function must return a Provider and may return an error, if it returns an error it will be checked against nil and any non nil value will error.
// The provider will be registered for each type only if the type is not yet registered.
func CAddProvider(provs ...interface{}) Configurator {
	return func(c *coordinatorConfig) error {
		for _, v := range provs {
			if v == nil {
				return fmt.Errorf("expected a Provider or a Provider constructor, but got a nil value %T", v)
			}
			// First try if that is instancied ?
			p, ok := v.(Provider)
			if ok {
				goto AddProvider
			}
			{
				// No we have to build it ourself
				r, err := c.usingConstructorMake(v, providerType)
				if err != nil {
					return fmt.Errorf("expected a Provider or a Provider constructor, but %s", err)
				}
				p = r.(Provider)
			}
		AddProvider:
			c.providers = append(c.providers, p)
		}
		return nil
	}
}

// CAddEngine will add engines to the Coordinator.
// It accept either instancied Engine or function returning an Engine.
// The function can have some params, in this case the provider logic will be used.
// The function must return an Engine and may return an error, if it returns an error it will be checked against nil and any non nil value will error.
func CAddEngine(engines ...interface{}) Configurator {
	return func(c *coordinatorConfig) error {
		for _, v := range engines {
			if v == nil {
				return fmt.Errorf("expected an Engine or an Engine constructor, but got a nil value %T", v)
			}
			// First try if that is instancied ?
			e, ok := v.(Engine)
			if ok {
				goto AddEngine
			}
			// No we have to build it ourself
			{
				r, err := c.usingConstructorMake(v, engineType)
				if err != nil {
					return fmt.Errorf("expected an Engine or an Engine constructor, but %w", err)
				}
				e = r.(Engine)
			}
		AddEngine:
			c.coordinator.engines = append(c.coordinator.engines, e)
		}
		return nil
	}
}

// CAddParser adds some parser to the coordinator.
// It accept either instancied Parser or function returning a Parser.
// The function can have some params, in this case the provider logic will be used.
// The function must return a Parser and may return an error, if it returns an error it will be checked against nil and any non nil value will error.
func CAddParser(parsers ...interface{}) Configurator {
	return func(c *coordinatorConfig) error {
		for _, v := range parsers {
			if v == nil {
				return fmt.Errorf("expected a Parser or a Parser constructor, but got a nil value %T", v)
			}
			// First try if that is instancied ?
			p, ok := v.(Parser)
			if ok {
				goto AddParser
			}
			// No we have to build it ourself
			{
				r, err := c.usingConstructorMake(v, parserType)
				if err != nil {
					return fmt.Errorf("expected a Parser or a Parser constructor, but %w", err)
				}
				p = r.(Parser)
			}
		AddParser:
			c.coordinator.parsers = append(c.coordinator.parsers, p)
		}
		return nil
	}
}
