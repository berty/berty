package main

import (
	"flag"
	"log"

	"berty.tech/client/go/bot"
)

var addr = flag.String("addr", "127.0.0.1:1337", "daemon gRPC address")

func main() {
	flag.Parse()

	b, err := bot.New(
		bot.WithTCPDaemon(*addr),
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
