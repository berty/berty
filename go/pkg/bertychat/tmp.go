package bertychat

// this file contains temorary functions that should be deleted as soon as they are replace by a better solution.
// if you add new functions in this file, try to always put an annoying warning log message, as a reminder.

import (
	fmt "fmt"

	"berty.tech/go/pkg/chatmodel"
	"github.com/brianvoe/gofakeit"
	"go.uber.org/zap"
)

func fakeConversation(logger *zap.Logger) *chatmodel.Conversation {
	logger.Warn("randomConversation is temporary")

	created := gofakeit.Date()
	updated := gofakeit.Date()
	return &chatmodel.Conversation{
		ID:        gofakeit.UUID(),
		CreatedAt: &created,
		UpdatedAt: &updated,
		Title:     fmt.Sprintf("%s %s", gofakeit.HackerIngverb(), gofakeit.HackerAdjective()),
	}
}
