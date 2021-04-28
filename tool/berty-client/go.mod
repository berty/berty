module berty.tech/berty/tool/dameon-client

go 1.16

require (
	berty.tech/berty/v2 v2.0.0
	github.com/grpc-ecosystem/go-grpc-middleware v1.2.2
	github.com/oklog/run v1.1.0
	github.com/peterbourgon/ff/v3 v3.0.0
	go.uber.org/zap v1.16.0
	google.golang.org/grpc v1.36.0
)

replace (
	berty.tech/berty/v2 => ../../
	github.com/libp2p/go-libp2p-rendezvous => github.com/berty/go-libp2p-rendezvous v0.0.0-20201028141428-5b2e7e8ff19a // use berty fork of go-libp2p-rendezvous
)
