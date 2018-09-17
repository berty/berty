package main

import (
	"flag"
	"fmt"
	"log"

	"berty.tech/client/go/bot"
	"berty.tech/core/entity"
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

	b.AddMessageHandlerFunc(func(b *bot.Bot, e *bot.Event, msg *entity.Message) error {
		return b.Reply(e, &entity.Message{Text: fmt.Sprintf("hello! (%s)", msg.Text)})
	})

	log.Println("starting bot...")
	if err := b.Start(); err != nil {
		log.Fatal(err)
	}
}
