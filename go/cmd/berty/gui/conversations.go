package gui

import (
	"context"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
	"github.com/gogo/protobuf/proto"
	"go.uber.org/multierr"
	"go.uber.org/zap"

	mt "berty.tech/berty/v2/go/pkg/messengertypes"
)

// LIST

func newConversationList(mc *msgrContext) wfr {
	list := newDynamicStringKeyedList(func(objs ...fyne.CanvasObject) *fyne.Container {
		return container.NewGridWrap(fyne.NewSize(120, 120), objs...)
	})
	list.setSort(func(aKey, bKey string) int {
		a, aOk := mc.store.conversations[aKey]
		b, bOk := mc.store.conversations[bKey]
		if !aOk || !bOk {
			return 0
		}
		return int(b.GetLastUpdate() - a.GetLastUpdate())
	})

	root := container.NewVBox(widget.NewLabel("Your conversations:"), list.container)
	root.Hide()

	unsubContacts := mc.store.contactListSubscribe(func(contact *mt.Contact) error {
		defer func() {
			if list.empty() {
				root.Hide()
			} else {
				root.Show()
			}
		}()

		if contact.GetState() != mt.Contact_Accepted {
			return nil
		}

		convPK := contact.GetConversationPublicKey()
		if _, ok := mc.store.conversations[convPK]; ok {
			if err := list.add(convPK, func() wfr { return newConversationThumbnail(mc, convPK) }); err != nil {
				return err
			}
		}

		return nil
	})

	unsubConvs := mc.store.conversationListSubscribe(func(conv *mt.Conversation) error {
		convPK := conv.GetPublicKey()

		if conv.GetType() == mt.Conversation_ContactType {
			contact, ok := mc.store.contacts[conv.GetContactPublicKey()]
			if ok && contact.GetState() != mt.Contact_Accepted {
				return nil
			}
		}

		if err := list.add(convPK, func() wfr { return newConversationThumbnail(mc, convPK) }); err != nil {
			return err
		}
		if list.empty() {
			root.Hide()
		} else {
			root.Show()
		}

		return nil
	})

	return wfr{root, mergeCleaners(unsubContacts, unsubConvs, list.clean), nil}
}

// THUMBNAIL

func newConversationThumbnail(mc *msgrContext, convPK string) wfr {
	label := widget.NewLabel(safeShortPK(convPK))

	kindLabel := widget.NewLabel("Loading..")

	unsubName := mc.store.conversationNameSubscribe(convPK, func(name string) error {
		if len(name) != 0 && label.Text != name {
			label.SetText(name)
		}
		return nil
	})

	unsubConv := mc.store.conversationSubscribe(convPK, func(conv *mt.Conversation) error {
		text := ""
		switch conv.GetType() {
		case mt.Conversation_ContactType:
			text = "Contact"
		case mt.Conversation_MultiMemberType:
			text = "Group"
		default:
			text = "Unknown"
		}
		text += "\ndpk: " + safeShortPK(conv.GetLocalDevicePublicKey()) + "\nmpk: " + safeShortPK(conv.GetAccountMemberPublicKey())
		kindLabel.SetText(text)
		return nil
	})

	w := container.NewVBox(
		container.NewHScroll(label),
		kindLabel,
		widget.NewButton("Open", func() {
			conv, ok := mc.store.conversations[convPK]
			if !ok {
				return
			}

			wfr := newConversationDisplay(mc, convPK, conv.GetType())
			if wfr.err != nil {
				mc.logger.Error("error creating conversation widget", zap.Error(wfr.err))
				return
			}

			window := mc.app.NewWindow(safeShortPK(convPK) + " (bergy)")

			unsub := mc.store.conversationNameSubscribe(convPK, func(name string) error {
				if len(name) != 0 {
					window.SetTitle(name + " (bergy)")
				}
				return nil
			})

			if wfr.clean != nil {
				window.SetOnClosed(func() {
					if err := mergeCleaners(wfr.clean, unsub)(); err != nil {
						mc.logger.Error("error cleaning conv", zap.Error(err))
					}
				})
			}
			window.SetContent(wfr.object)
			window.Resize(fyne.NewSize(400, 400))
			window.Show()
		}),
	)

	return wfr{w, mergeCleaners(unsubName, unsubConv), nil}
}

// CONVERSATION

func newConversationDisplay(mc *msgrContext, convPK string, kind mt.Conversation_Type) wfr {
	h := newMCHelper()

	if err := h.add(
		newInteractionList(mc, convPK),
		newConversationMessageEntry(mc, convPK),
	); err != nil {
		return wfr{nil, nil, multierr.Combine(err, h.clean())}
	}

	objs := h.canvasObjects()
	mainPane := container.NewBorder(nil, container.NewVBox(widget.NewSeparator(), objs[1]), nil, nil, objs[0])

	clean := h.clean

	var w fyne.CanvasObject
	if kind == mt.Conversation_MultiMemberType {
		infoPaneWFR := newMultiMemberInfo(mc, convPK)
		clean = mergeCleaners(clean, infoPaneWFR.clean)

		hSplit := container.NewHSplit(infoPaneWFR.object, mainPane)
		hSplit.SetOffset(0)
		w = hSplit
	} else {
		w = mainPane
	}

	return wfr{w, clean, nil}
}

// MESSAGE ENTRY

func newConversationMessageEntry(mc *msgrContext, convPK string) wfr {
	textEntry := newEnterEntry()
	textEntry.SetPlaceHolder("Message")

	sendHandler := func() {
		body := textEntry.Text
		if len(body) == 0 {
			return
		}

		ctx, cancel := context.WithCancel(mc.ctx)
		defer cancel()

		userMessage, err := proto.Marshal(&mt.AppMessage_UserMessage{Body: body})
		if err != nil {
			mc.logger.Error("marshal user message", zap.Error(err))
			return
		}
		resp, err := mc.client.Interact(ctx, &mt.Interact_Request{
			Type:                  mt.AppMessage_TypeUserMessage,
			Payload:               userMessage,
			ConversationPublicKey: convPK,
		})
		if err != nil {
			mc.logger.Error("send user message", zap.Error(err))
			return
		}

		mc.logger.Debug("send success", zap.Any("reply", resp))
		textEntry.SetText("")
	}

	textEntry.onEnter = sendHandler
	sendButton := widget.NewButton("Send", sendHandler)

	w := container.NewBorder(nil, nil, textEntry, sendButton)

	return wfr{w, nil, nil}
}

// MULTIMEMBER LINK

func newMultiMemberLinkDisplay(mc *msgrContext, convPK string) wfr {
	linkEntry := widget.NewEntry()
	linkEntry.SetPlaceHolder("Loading..")
	linkEntry.Disable()

	copyLinkButton := widget.NewButton("Copy group link", func() {
		link := linkEntry.Text
		if len(link) > 0 {
			mc.window.Clipboard().SetContent(link)
		}
	})

	handler := func(conversation *mt.Conversation) error {
		link := conversation.GetLink()
		if linkEntry.Text != link {
			linkEntry.SetText(link)
		}
		return nil
	}

	w := container.NewVBox(
		container.NewHScroll(linkEntry),
		container.NewHBox(copyLinkButton),
	)

	return wfr{w, mc.store.conversationSubscribe(convPK, handler), nil}
}
