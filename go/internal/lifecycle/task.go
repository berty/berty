package lifecycle

import "sync"

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
