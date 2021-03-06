package main

import (
	"log"

	"berty.tech/berty/tool/tyber/go/bridge"
)

func main() {
	// Create logger
	l := log.New(log.Writer(), log.Prefix(), log.Flags())

	wb := newWebsocketBridge()

	// Init Go <-> JS bridge
	b := bridge.New(l, wb)
	defer b.Close()

	if err := b.Init(nil, nil, nil, nil, nil); err != nil {
		panic(err)
	}

	// Run websocket server
	if err := wb.runServer("127.0.0.1:9342"); err != nil {
		panic(err)
	}
}
