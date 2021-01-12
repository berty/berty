package gui

import (
	"strings"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
	qrcode "github.com/skip2/go-qrcode"
	"go.uber.org/multierr"

	mt "berty.tech/berty/v2/go/pkg/messengertypes"
)

// MULTIMEMBER INFO

func newMultiMemberInfo(mc *msgrContext, convPK string) wfr {
	qrContainer := container.NewVBox()
	qrContainer.Hide()

	qrToggle := widget.NewButton("Show group QR", func() {})
	qrToggle.OnTapped = func() {
		if qrContainer.Hidden {
			qrContainer.Show()
			qrToggle.SetText("Hide group QR")
		} else {
			qrContainer.Hide()
			qrToggle.SetText("Show group QR")
		}
	}
	qrToggle.Refresh()

	unsubConv := mc.store.conversationSubscribe(convPK, func(conv *mt.Conversation) error {
		link := conv.GetLink()
		if len(link) != 0 {
			qr, err := qrcode.New(link, qrcode.Medium)
			if err != nil {
				return err
			}
			img := canvas.NewImageFromImage(qr.Image(256))
			img.FillMode = canvas.ImageFillOriginal
			img.Refresh()

			qrContainer.Objects = []fyne.CanvasObject{img}
			qrContainer.Refresh()
		}
		return nil
	})

	memberList := newDynamicStringKeyedList(container.NewVBox)
	memberList.setSort(func(aKey, bKey string) int {
		members, ok := mc.store.members[convPK]
		if !ok {
			return 0
		}
		a, aOk := members[aKey]
		b, bOk := members[bKey]
		if !(aOk && bOk) {
			return 0
		}
		return strings.Compare(b.GetDisplayName(), a.GetDisplayName())
	})

	unsubMembers := mc.store.memberListSubscribe(convPK, func(member *mt.Member) error {
		pk := member.GetPublicKey()
		return memberList.add(pk, func() wfr { return newMemberThumbnail(mc, convPK, pk) })
	})

	memberListContainer := container.NewBorder(widget.NewLabel("Members:"), nil, nil, nil, container.NewVScroll(memberList.container))

	linkDisplayWFR := newMultiMemberLinkDisplay(mc, convPK)
	if linkDisplayWFR.err != nil {
		err := mergeCleaners(unsubConv, unsubMembers)()
		if err != nil {
			err = multierr.Combine(linkDisplayWFR.err, err)
		} else {
			err = linkDisplayWFR.err
		}
		return wfr{nil, nil, err}
	}

	w := container.NewBorder(container.NewVBox(qrToggle, qrContainer, linkDisplayWFR.object), nil, nil, nil, memberListContainer)

	return wfr{w, mergeCleaners(unsubConv, unsubMembers, linkDisplayWFR.clean), nil}
}

// MEMBER

func newMemberThumbnail(mc *msgrContext, convPK, memberPK string) wfr {
	nameLabel := widget.NewLabel(safeShortPK(memberPK))

	unsub := mc.store.memberSubscribe(convPK, memberPK, func(member *mt.Member) error {
		name := member.GetDisplayName()
		if len(name) != 0 && name != nameLabel.Text {
			text := name + "\n" + safeShortPK(memberPK)
			if member.GetIsCreator() {
				text += "\n" + "Creator"
			}
			if member.GetIsMe() {
				text += "\n" + "You"
			}
			nameLabel.SetText(text)
		}
		return nil
	})

	w := container.NewVBox(nameLabel)

	return wfr{w, unsub, nil}
}
