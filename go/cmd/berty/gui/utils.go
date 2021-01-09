package gui

import (
	"sync"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/widget"
	"go.uber.org/multierr"
)

// MISC

func mergeCleaners(cleaners ...func() error) func() error {
	return func() error {
		errs := []error(nil)
		for _, cleaner := range cleaners {
			if cleaner != nil {
				if err := cleaner(); err != nil {
					errs = append(errs, err)
				}
			}
		}
		return multierr.Combine(errs...)
	}
}

func safeShortPK(pk string) string {
	if len(pk) < 7 {
		return "ano1337"
	}
	return pk[:7]
}

// SYNC

func autoLock(mu sync.Locker) func() {
	mu.Lock()
	return mu.Unlock
}

// DYNAMIC LIST WIDGET

type dynamicStringKeyedList struct {
	views     map[string]wfr
	container *fyne.Container
	mu        *sync.Mutex
	cmp       func(string, string) int
}

func newDynamicStringKeyedList(containerFactory func(...fyne.CanvasObject) *fyne.Container) *dynamicStringKeyedList {
	c := containerFactory()
	list := dynamicStringKeyedList{
		views:     make(map[string]wfr),
		container: c,
		mu:        &sync.Mutex{},
	}
	return &list
}

func (list *dynamicStringKeyedList) unsafeRefresh() {
	objs := []fyne.CanvasObject(nil)
	keys := []string(nil)
	for k, wfr := range list.views {
		objs = append(objs, wfr.object)
		keys = append(keys, k)
	}

	list.container.Objects = objs

	if list.cmp != nil {
		// FIXME: replace with real sort
		items := list.container.Objects
		n := len(items) // https://www.golangprograms.com/golang-program-for-implementation-of-insertionsort.html
		for i := 1; i < n; i++ {
			j := i
			for j > 0 {
				if list.cmp(keys[j-1], keys[j]) > 0 {
					items[j-1], items[j] = items[j], items[j-1]
					keys[j-1], keys[j] = keys[j], keys[j-1]
				}
				j--
			}
		}
	}

	list.container.Refresh()
}

func (list *dynamicStringKeyedList) remove(key string) error {
	defer autoLock(list.mu)()

	clean := (func() error)(nil)
	if view, ok := list.views[key]; ok {
		clean = view.clean
	}

	delete(list.views, key)
	list.unsafeRefresh()

	if clean != nil {
		return clean()
	}
	return nil
}

func (list *dynamicStringKeyedList) clean() error {
	defer autoLock(list.mu)()

	cleaners := ([]func() error)(nil)
	for _, v := range list.views {
		cleaners = append(cleaners, v.clean)
	}
	return mergeCleaners(cleaners...)()
}

func (list *dynamicStringKeyedList) add(key string, factory func() wfr) error {
	defer autoLock(list.mu)()

	if _, ok := list.views[key]; !ok {
		wfr := factory()
		if wfr.err != nil {
			return wfr.err
		}
		list.views[key] = wfr
		list.unsafeRefresh()
	}
	return nil
}

func (list *dynamicStringKeyedList) empty() bool {
	defer autoLock(list.mu)()

	return len(list.container.Objects) == 0
}

func (list *dynamicStringKeyedList) setSort(cmp func(string, string) int) {
	defer autoLock(list.mu)()

	list.cmp = cmp
}

// ENTER ENTRY

// https://developer.fyne.io/tutorial/keypress-on-entry

type enterEntry struct {
	widget.Entry
	onEnter func()
}

func newEnterEntry() *enterEntry {
	entry := &enterEntry{}
	entry.ExtendBaseWidget(entry)
	return entry
}

func (e *enterEntry) TypedKey(key *fyne.KeyEvent) {
	switch key.Name {
	case fyne.KeyReturn:
		if e.onEnter != nil {
			e.onEnter()
		}
	default:
		e.Entry.TypedKey(key)
	}
}

// SEPARATOR

func newSeparator(mc *msgrContext) wfr { return wfr{widget.NewSeparator(), nil, nil} }
