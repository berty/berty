package gui

import (
	"context"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
	qrcode "github.com/skip2/go-qrcode"
	"go.uber.org/zap"

	"berty.tech/berty/v2/go/internal/logutil"
	"berty.tech/berty/v2/go/pkg/messengertypes"
)

// ACCOUNT LINK

func newAccountLinkDisplay(mc *msgrContext) wfr {
	linkEntry := widget.NewEntry()
	linkEntry.SetPlaceHolder("Loading..")
	linkEntry.Disable()

	copyLinkButton := widget.NewButton("Copy your link", func() {
		link := linkEntry.Text
		if len(link) > 0 {
			mc.window.Clipboard().SetContent(link)
		}
	})

	w := container.NewVBox()

	handler := func(account *messengertypes.Account) error {
		link := account.GetLink()
		if linkEntry.Text != link {
			linkEntry.SetText(link)

			qr, err := qrcode.New(link, qrcode.Medium)
			if err != nil {
				return err
			}
			img := canvas.NewImageFromImage(qr.Image(256))
			img.FillMode = canvas.ImageFillOriginal
			img.Refresh()

			w.Objects[1] = img
			w.Refresh()
		}
		return nil
	}

	w.Objects = []fyne.CanvasObject{
		widget.NewLabel("Your ID:"),
		widget.NewLabel("Loading qr.."),
		container.NewHScroll(linkEntry),
		container.NewHBox(copyLinkButton),
	}
	w.Refresh()

	return wfr{w, mc.store.accountSubscribe(handler), nil}
}

// ACCOUNT DISPLAY NAME

func newAccountNameEntry(mc *msgrContext) wfr {
	nameEntry := widget.NewEntry()
	nameEntry.SetPlaceHolder("Loading..")

	updateNameButton := widget.NewButton("Update", func() {
		newName := nameEntry.Text
		if len(newName) == 0 {
			return
		}
		if _, err := mc.client.AccountUpdate(mc.ctx, &messengertypes.AccountUpdate_Request{DisplayName: newName}); err != nil {
			mc.logger.Error("account update", zap.Error(err))
			return
		}
	})
	updateNameButton.Hide()

	resetNameButton := widget.NewButton("Reset", func() {
		currentName := mc.store.account.GetDisplayName()
		if nameEntry.Text != currentName {
			nameEntry.SetText(currentName)
		}
	})
	resetNameButton.Hide()

	nameEntry.OnChanged = func(newName string) {
		name := mc.store.account.GetDisplayName()
		if len(newName) == 0 || newName == name {
			updateNameButton.Hide()
			resetNameButton.Hide()
		} else {
			updateNameButton.Show()
			resetNameButton.Show()
		}
	}
	nameEntry.Refresh()

	handler := func(account *messengertypes.Account) error {
		name := account.GetDisplayName()
		if len(name) == 0 {
			ph := account.GetPublicKey()
			if len(ph) < 7 {
				ph = "anon#1337"
			} else {
				ph = ph[:7]
			}
			nameEntry.SetPlaceHolder(ph)
		} else if nameEntry.Text != name {
			nameEntry.SetText(name)
		}

		if len(nameEntry.Text) == 0 || nameEntry.Text == name {
			updateNameButton.Hide()
			resetNameButton.Hide()
		} else {
			updateNameButton.Show()
			resetNameButton.Show()
		}

		return nil
	}

	w := container.NewHBox(
		widget.NewLabel("Hello"),
		nameEntry,
		widget.NewLabel("!"),
		updateNameButton,
		resetNameButton,
	)

	return wfr{w, mc.store.accountSubscribe(handler), nil}
}

// ADD BY LINK

func newAddByLinkEntry(mc *msgrContext) wfr {
	linkEntry := widget.NewEntry()
	linkEntry.SetPlaceHolder("Berty link")

	addButton := widget.NewButton("Add", func() {
		link := linkEntry.Text
		if len(link) == 0 {
			return
		}

		ctx, cancel := context.WithCancel(mc.ctx)
		defer cancel()

		pdlReply, err := mc.client.ParseDeepLink(ctx, &messengertypes.ParseDeepLink_Request{Link: link})
		if err != nil {
			mc.logger.Error("ParseDeepLink error: ", zap.Error(err))
			return
		}

		switch pdlReply.GetLink().GetKind() {
		case messengertypes.BertyLink_ContactInviteV1Kind:
			resp, err := mc.client.ContactRequest(ctx, &messengertypes.ContactRequest_Request{Link: link})
			if err != nil {
				mc.logger.Error("contact request error:", zap.Error(err))
			}

			mc.logger.Info("contact request success", zap.Any("reply", resp))
			linkEntry.SetText("")
		case messengertypes.BertyLink_GroupV1Kind:
			resp, err := mc.client.ConversationJoin(ctx, &messengertypes.ConversationJoin_Request{Link: link})
			if err != nil {
				mc.logger.Error("conv join error:", zap.Error(err))
			}

			mc.logger.Info("convo join success", zap.Any("reply", resp))
			linkEntry.SetText("")
		default:
			mc.logger.Error("link kind not supported", zap.Any("reply", pdlReply))
		}
	})

	w := container.NewVBox(
		widget.NewLabel("Add by link:"),
		container.NewHScroll(linkEntry),
		container.NewHBox(addButton),
	)

	return wfr{w, nil, nil}
}

// CREATE MULTIMEMBER

func newCreateMultiMember(mc *msgrContext) wfr {
	nameEntry := widget.NewEntry()
	nameEntry.SetPlaceHolder("Group name")

	createButton := widget.NewButton("Create group", func() {
		name := nameEntry.Text
		if len(name) == 0 {
			return
		}
		mc.logger.Info("creating group", logutil.PrivateString("name", name))

		ctx, cancel := context.WithCancel(mc.ctx)
		resp, err := mc.client.ConversationCreate(ctx, &messengertypes.ConversationCreate_Request{DisplayName: name})
		cancel()
		if err != nil {
			mc.logger.Error("creating group", logutil.PrivateString("name", name), zap.Error(err))
			return
		}

		mc.logger.Info("create group success", logutil.PrivateAny("reply", resp))
		nameEntry.SetText("")
	})

	w := container.NewVBox(
		widget.NewLabel("Create group:"),
		nameEntry,
		container.NewHBox(createButton),
	)
	return wfr{w, nil, nil}
}
