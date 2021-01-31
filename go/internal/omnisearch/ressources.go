package omnisearch

import (
	"context"
	"fmt"
	"reflect"
	"sync"
)

type Engine interface {
	Informator
	// Search tries a search on the passed string.
	//
	// Search will be called in sync, if Search wants to fork it need to increment the waitGroup and
	// then set the field `decrement` in the ResultReturn to true (only set the last if you return multiple of them).
	// Or if the search was unsuccess full, decrement yourself.
	// You could also send a ResultReturn with a nil `Object` and decrement set (nil r.Object are just ignored).
	//
	// If you want to write to the channel you must do it concurrently.
	Search(context.Context, *sync.WaitGroup, chan<- *ResultReturn, *ResultReturn)
}

type Parser interface {
	Informator
	// Parse tries to decode string
	// Return nil if weren't success full, else reflection will be used to know how to continue search.
	Parse(*ResultReturn) *ResultReturn
}

// Provider can creates objects for the engines or other provider.
// Provider are only used at instantiation time.
type Provider interface {
	Informator
	Available() []reflect.Type
	Make(reflect.Type) (reflect.Value, error)
}

type Informator interface {
	stringable
	Name() string
}

type stringable interface {
	String() string
}

// ResultReturn is a struct used to communicate metadata.
type ResultReturn struct {
	Object    interface{}   // The thing actually found.
	Finder    Informator    // Reference to the object used to found it.
	Previous  *ResultReturn // Reference to the object with the search were triggered (is nil for parents).
	Decrement bool          // If true the Coordinator knows the search were a forked one and is now finished.
}

func (r *ResultReturn) String() string {
	s, ok := r.Object.(stringable)
	if ok {
		return fmt.Sprintf("Found by %q: %s", r.Finder.Name(), s.String())
	}
	return fmt.Sprintf("Found by %q: %v", r.Finder.Name(), s)
}
