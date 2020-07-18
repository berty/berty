package mini

import (
	"sync"
)

type inputHistory struct {
	history []string
	index   int
	lock    sync.Mutex
}

func newInputHistory() *inputHistory {
	return &inputHistory{}
}

func (h *inputHistory) Append(msg string) {
	h.lock.Lock()
	defer h.lock.Unlock()

	h.history = append(h.history, msg)
	h.index = len(h.history)
}

func (h *inputHistory) Prev() string {
	h.lock.Lock()
	defer h.lock.Unlock()

	h.index--

	return h.stringForIndex()
}

func (h *inputHistory) Next() string {
	h.lock.Lock()
	defer h.lock.Unlock()

	h.index++

	return h.stringForIndex()
}

func (h *inputHistory) stringForIndex() string {
	if h.index < 0 {
		h.index = 0
	}

	if h.index >= len(h.history) {
		h.index = len(h.history)
		return ""
	}

	return h.history[h.index]
}
