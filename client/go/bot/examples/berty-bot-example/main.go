package main

import (
	"log"

	"berty.tech/client/go/bot"
)

func main() {
	b, err := bot.New(
		bot.WithDefaultDaemon(),
		bot.WithAutoAcceptInvites(),
		bot.WithLogger(),
	)
	if err != nil {
		panic(err)
	}

	b.AddHandlerFunc(func(b *bot.Bot, e *bot.Event) error {
		// do stuff
		return nil
	})
	b.AddHandler(bot.Trigger{
		If: func(b *bot.Bot, e *bot.Event) bool {
			return true
		},
		Then: func(b *bot.Bot, e *bot.Event) error {
			// do stuff
			return nil
		},
	})

	log.Println("starting bot...")
	if err := b.Start(); err != nil {
		log.Fatal(err)
	}
}
