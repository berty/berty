package gui

import "fyne.io/fyne/v2"

func newMCHelper() *mcHelper {
	return &mcHelper{}
}

type mcHelper struct {
	children []struct {
		obj   fyne.CanvasObject
		clean func() error
	}
}

func (h *mcHelper) add(ws ...wfr) error {
	for _, w := range ws {
		if w.err != nil {
			return w.err
		}
		h.children = append(h.children, struct {
			obj   fyne.CanvasObject
			clean func() error
		}{w.object, w.clean})
	}
	return nil
}

func (h *mcHelper) clean() error {
	cleaners := ([]func() error)(nil)
	for _, elem := range h.children {
		cleaners = append(cleaners, elem.clean)
	}
	return mergeCleaners(cleaners...)()
}

func (h *mcHelper) canvasObjects() []fyne.CanvasObject {
	objects := []fyne.CanvasObject(nil)
	for _, elem := range h.children {
		objects = append(objects, elem.obj)
	}
	return objects
}
