package omnisearch

import (
	"context"
	"sync"
)

// Coordinator executes searches
type Coordinator interface {
	// Do execute a search with the currently available resources.
	// The chan will be closed once finished.
	Do(context.Context, ...interface{}) <-chan *ResultReturn
}

type coordinator struct {
	engines []Engine
	parsers []Parser
}

// NewCoordinatorWithBootstrap createsb a new Coordinator.
func NewCoordinator(ctx context.Context, cfgs ...Configurator) (Coordinator, error) {
	c := &coordinatorConfig{
		coordinator: &coordinator{},
		providers:   []Provider{NewMirror(ctx)},
	}
	for _, v := range cfgs {
		err := v(c)
		if err != nil {
			return nil, err
		}
	}
	return c.coordinator, nil
}

type search struct {
	c  *coordinator
	wg *sync.WaitGroup

	ctx    context.Context
	cancel func()

	ic chan *ResultReturn // Internal channel
	rc chan *ResultReturn // Return channel
}

type rootInformator struct{}

func (rootInformator) Name() string {
	return "Root"
}

func (r rootInformator) String() string {
	return r.Name()
}

func (c *coordinator) Do(ctx context.Context, parents ...interface{}) <-chan *ResultReturn {
	var wg sync.WaitGroup
	s := &search{
		c:  c,
		wg: &wg,
		ic: make(chan *ResultReturn),
		rc: make(chan *ResultReturn),
	}
	s.ctx, s.cancel = context.WithCancel(ctx)

	go s.manager()

	// It's important to use a single instance as this might be used later to do search trees.
	var ri Informator = rootInformator{}

	var parentsR []*ResultReturn
	{
		i := len(parents)
		(*s.wg).Add(i) // Increment for the `s.handle` later.
		parentsR = make([]*ResultReturn, i)
		for i > 0 {
			i--
			parentsR[i] = &ResultReturn{
				Object: parents[i],
				Finder: ri,
			}
		}
	}

	for _, r := range parentsR {
		go s.handle(r)
	}

	go s.wgWatcher()

	return s.rc
}

func (s *search) manager() {
	for {
		select {
		case r := <-s.ic:
			(*s.wg).Add(1)
			go s.handle(r)
		case <-s.ctx.Done():
			close(s.rc)
			return
		}
	}
}

func (s *search) handle(r *ResultReturn) {
	defer (*s.wg).Done()
	if r.Object != nil {
		for _, v := range s.c.engines {
			v.Search(s.ctx, s.wg, s.ic, r)
		}
		for _, v := range s.c.parsers {
			pr := v.Parse(r)
			if pr != nil {
				defer (*s.wg).Add(1)
				go s.handle(pr)
			}
		}
		s.rc <- r
	}
	if r.Decrement {
		(*s.wg).Done()
	}
}

func (s *search) wgWatcher() {
	(*s.wg).Wait()
	s.cancel()
}
