package bot

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
