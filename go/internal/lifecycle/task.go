package lifecycle

import "sync"

type Tasks struct {
	sync.WaitGroup
	mu sync.RWMutex
}

func (t *Tasks) Add(i int) {
	t.mu.RLock()
	t.WaitGroup.Add(1)
	t.mu.RUnlock()
}

func (t *Tasks) Wait() {
	t.mu.Lock()
	t.WaitGroup.Wait()
	t.mu.Unlock()
}

func (t *Tasks) Lock()      { t.mu.Lock() }
func (t *Tasks) Unlock()    { t.mu.Unlock() }
func (t *Tasks) Task() Task { return &task{t: t} }

type Task interface {
	Done()
}

type task struct {
	t Task
	o sync.Once
}

func (t *task) Done() {
	t.o.Do(t.t.Done)
}
