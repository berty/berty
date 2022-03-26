// this file is just a precaution to avoid golang to process this directory

module berty.tech/berty/tool/v2

go 1.15

require (
	berty.tech/berty/v2 v2.0.0
	github.com/mdp/qrterminal/v3 v3.0.0
	github.com/otiai10/copy v1.7.0
	github.com/pkg/errors v0.9.1
	go.uber.org/zap v1.20.0
	gopkg.in/yaml.v3 v3.0.0-20210107192922-496545a6307b
	moul.io/u v1.27.0
)

replace berty.tech/berty/v2 => ../

replace github.com/libp2p/go-libp2p-rendezvous => github.com/berty/go-libp2p-rendezvous v0.0.0-20211013085524-09965cd64781 // use berty fork of go-libp2p-rendezvous with sqlcipher support
