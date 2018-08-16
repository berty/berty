package main

import (
	"fmt"
	"log"

	"berty.tech/client/go/bot"
)

func main() {
	b, err := bot.New(bot.WithDefaultDaemon())
	if err != nil {
		panic(err)
	}

	b.AddHandlerFunc(func(b *bot.Bot, e *bot.Event) error {
		fmt.Println("a", e)
		return nil
	})
	b.AddHandler(bot.Trigger{
		If: func(b *bot.Bot, e *bot.Event) bool {
			return true
		},
		Then: func(b *bot.Bot, e *bot.Event) error {
			fmt.Println("b", e)
			return nil
		},
	})

	log.Println("starting bot...")
	if err := b.Run(); err != nil {
		log.Fatal(err)
	}
}
