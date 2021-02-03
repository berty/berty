package gui

import (
	"fmt"
	"time"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"

	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

// INTERACTION LIST

func newInteractionList(mc *msgrContext, convPK string) wfr {
	list := newDynamicStringKeyedList(container.NewVBox)
	list.setSort(func(aKey, bKey string) int {
		a, aOk := mc.store.interactions[convPK][aKey]
		b, bOk := mc.store.interactions[convPK][bKey]
		if !aOk || !bOk {
			return 0
		}
		return int(a.GetSentDate() - b.GetSentDate())
	})

	w := container.NewVScroll(list.container)

	refreshScroll := func() {
		w.Offset = fyne.NewPos(0, list.container.MinSize().Height)
		w.Refresh()
	}

	unsub := mc.store.interactionListSubscribe(convPK, func(interaction *messengertypes.Interaction) error {
		defer refreshScroll()

		cid := interaction.GetCID()
		inteType := interaction.GetType()
		if inteType != messengertypes.AppMessage_TypeUserMessage {
			return list.remove(cid)
		}

		if err := list.add(cid, func() wfr { return newInteractionView(mc, interaction) }); err != nil {
			return err
		}

		return nil
	})

	refreshScroll()

	return wfr{w, mergeCleaners(unsub, list.clean), nil}
}

// INTERACTION

func newInteractionView(mc *msgrContext, inte *messengertypes.Interaction) wfr {
	if inte.GetType() != messengertypes.AppMessage_TypeUserMessage {
		return wfr{nil, nil, errcode.ErrInvalidInput}
	}

	convPK := inte.GetConversationPublicKey()
	memberPK := inte.GetMemberPublicKey()

	payload, err := inte.UnmarshalPayload()
	if err != nil {
		return wfr{nil, nil, err}
	}

	member := (*messengertypes.Member)(nil)

	refresh := func() {}

	unsubMember := mc.store.memberSubscribe(convPK, memberPK, func(m *messengertypes.Member) error {
		member = m
		refresh()
		return nil
	})

	clean := unsubMember

	msgContent := widget.NewLabel("")

	{ // T0D0: split into one func by interaction type
		usrMsg := payload.(*messengertypes.AppMessage_UserMessage)

		refresh = func() {
			prefix := ""
			if member != nil {
				name := member.GetDisplayName()
				if len(name) == 0 {
					name = safeShortPK(member.GetPublicKey())
				}
				prefix = name + ":\n"
			}
			msgContent.Text = fmt.Sprintf("%s%s\n%s", prefix, time.Unix(0, inte.GetSentDate()*1000000).Format("Mon Jan 2 15:04:05 2006"), usrMsg.GetBody())
			msgContent.Wrapping = fyne.TextWrapWord

			if inte.GetIsMine() {
				msgContent.Alignment = fyne.TextAlignTrailing
			}

			msgContent.Refresh()
		}
	}

	refresh()

	return wfr{msgContent, clean, nil}
}
