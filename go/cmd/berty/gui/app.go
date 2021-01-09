package gui

import (
	"fyne.io/fyne/v2/container"
)

// ROOT

func newAppRootWidget(mc *msgrContext) wfr {
	h := newMCHelper()

	children := []widgetFactory{
		newAccountNameEntry,
		newAccountLinkDisplay,

		newSeparator,
		newAddByLinkEntry,
		newOutgoingContactRequestListDisplay,

		newSeparator,
		newCreateMultiMember,

		newSeparator,
		newIncomingContactRequestListDisplay,
		newConversationList,
	}

	for _, child := range children {
		if err := h.add(child(mc)); err != nil {
			return wfr{nil, h.clean, err}
		}
	}

	w := container.NewVScroll(container.NewVBox(h.canvasObjects()...))

	return wfr{w, h.clean, nil}
}
