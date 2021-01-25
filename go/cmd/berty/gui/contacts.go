package gui

import (
	"context"

	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/pkg/messengertypes"
)

// OUTGOING REQUEST LIST

func newOutgoingContactRequestListDisplay(mc *msgrContext) wfr {
	list := newDynamicStringKeyedList(container.NewHBox)
	list.setSort(func(aKey, bKey string) int {
		a, aOk := mc.store.contacts[aKey]
		b, bOk := mc.store.contacts[bKey]
		if !aOk || !bOk {
			return 0
		}
		return int(b.GetSentDate() - a.GetSentDate())
	})

	root := container.NewVBox(widget.NewLabel("Outgoing contact requests"), list.container)
	root.Hide()

	unsub := mc.store.contactListSubscribe(func(contact *messengertypes.Contact) error {
		defer func() {
			if list.empty() {
				root.Hide()
			} else {
				root.Show()
			}
		}()

		contactPK := contact.GetPublicKey()
		state := contact.GetState()
		if state != messengertypes.Contact_OutgoingRequestEnqueued &&
			state != messengertypes.Contact_OutgoingRequestSent {
			return list.remove(contactPK)
		}

		if err := list.add(contactPK, func() wfr { return newOutgoingContactRequestView(mc, contactPK) }); err != nil {
			return err
		}

		return nil
	})

	return wfr{root, mergeCleaners(unsub, list.clean), nil}
}

// OUTGOING CONTACT REQUEST CARD

func newOutgoingContactRequestView(_ *msgrContext, contactPK string) wfr {
	// FIXME: not state aware

	nameLabel := widget.NewLabel(safeShortPK(contactPK))

	w := container.NewVBox(
		nameLabel,
	)

	return wfr{w, nil, nil}
}

// INCOMING REQUEST LIST

func newIncomingContactRequestListDisplay(mc *msgrContext) wfr {
	list := newDynamicStringKeyedList(container.NewHBox)
	list.setSort(func(aKey, bKey string) int {
		a, aOk := mc.store.contacts[aKey]
		b, bOk := mc.store.contacts[bKey]
		if !aOk || !bOk {
			return 0
		}
		return int(b.GetSentDate() - a.GetSentDate())
	})

	root := container.NewVBox(widget.NewLabel("Incoming contact requests"), list.container)
	root.Hide()

	unsub := mc.store.contactListSubscribe(func(contact *messengertypes.Contact) error {
		defer func() {
			if list.empty() {
				root.Hide()
			} else {
				root.Show()
			}
		}()

		contactPK := contact.GetPublicKey()
		state := contact.GetState()
		if state != messengertypes.Contact_IncomingRequest {
			return list.remove(contactPK)
		}

		if err := list.add(contactPK, func() wfr { return newIncomingContactRequestView(mc, contactPK) }); err != nil {
			return err
		}

		return nil
	})

	return wfr{root, mergeCleaners(unsub, list.clean), nil}
}

// INCOMING CONTACT REQUEST CARD

func newIncomingContactRequestView(mc *msgrContext, contactPK string) wfr {
	// FIXME: not state aware

	nameLabel := widget.NewLabel(safeShortPK(contactPK))

	acceptButton := widget.NewButton("Accept", func() {
		ctx, cancel := context.WithCancel(mc.ctx)
		defer cancel()
		resp, err := mc.client.ContactAccept(ctx, &messengertypes.ContactAccept_Request{PublicKey: contactPK})
		if err != nil {
			mc.logger.Error("accepting contact request", zap.Error(err))
		} else {
			mc.logger.Info("success accepting contact request", zap.Any("reply", resp))
		}
	})

	w := container.NewVBox(
		nameLabel,
		acceptButton,
	)

	return wfr{w, nil, nil}
}
