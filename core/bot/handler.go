package bot

import (
	"berty.tech/core/entity"
)

//
// Handler
//

type Handler interface {
	Handle(*Bot, *Event) error
}

func (b *Bot) AddHandler(h Handler) {
	b.handlers = append(b.handlers, h)
}

//
// HandlerFunc
//

type HandlerFunc func(*Bot, *Event) error

type handlerFuncHandler struct {
	f HandlerFunc
}

func (h handlerFuncHandler) Handle(bot *Bot, event *Event) error {
	return h.f(bot, event)
}

func (b *Bot) AddHandlerFunc(f HandlerFunc) {
	b.handlers = append(b.handlers, handlerFuncHandler{f: f})
}

//
// Trigger
//

type Trigger struct {
	If   func(*Bot, *Event) bool
	Then HandlerFunc
}

func (t Trigger) Handle(bot *Bot, event *Event) error {
	if t.If(bot, event) {
		return t.Then(bot, event)
	}
	return nil
}

//
// MessageHandler
//

type MessageHandlerFunc func(*Bot, *Event, *entity.Message) error

func (b *Bot) AddMessageHandlerFunc(f MessageHandlerFunc) {
	b.AddHandler(Trigger{
		If: func(b *Bot, e *Event) bool {
			return e.Kind == entity.Kind_ConversationNewMessage && e.IsJustReceived()
		},
		Then: func(b *Bot, e *Event) error {
			nm, err := e.GetConversationNewMessageAttrs()
			if err != nil {
				return err
			}
			return f(b, e, nm.Message)
		},
	})
}
