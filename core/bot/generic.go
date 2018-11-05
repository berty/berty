package bot

import (
	"fmt"

	"berty.tech/core/entity"
)

func GenericOptions() []Option {
	return []Option{
		WithAutoAcceptInvites(),
		WithMessageHandlerFunc(func(b *Bot, e *Event, msg *entity.Message) error {
			return b.Reply(e, &entity.Message{Text: fmt.Sprintf("hello! (%s)", msg.Text)})
		}),
	}
}
