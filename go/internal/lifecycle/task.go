package lifecycle

import "sync"

type task struct {
	tasks *sync.WaitGroup
	o     sync.Once
}

type Task interface {
	Done()
}

func (t *task) Done() {
	t.o.Do(t.tasks.Done)
}
