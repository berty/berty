module berty.tech/berty/v2

go 1.14

require (
	bazil.org/fuse v0.0.0-20200524192727-fb710f7dfd05 // indirect
	berty.tech/go-ipfs-log v1.2.3
	berty.tech/go-orbit-db v1.10.4
	berty.tech/ipfs-webui-packed v1.0.0-v2.9.0-4
	github.com/aead/ecdh v0.2.0
	github.com/agl/ed25519 v0.0.0-20170116200512-5312a6153412
	github.com/atotto/clipboard v0.1.2
	github.com/buicongtan1997/protoc-gen-swagger-config v0.0.0-20190801162412-b6396e884596
	github.com/davidlazar/go-crypto v0.0.0-20200604182044-b73af7476f6c // indirect
	github.com/desertbit/timer v0.0.0-20180107155436-c41aec40b27f // indirect
	github.com/dgraph-io/badger v1.6.1
	github.com/dgraph-io/ristretto v0.0.3 // indirect
	github.com/gabriel-vasile/mimetype v1.1.1 // indirect
	github.com/gdamore/tcell v1.3.0
	github.com/githubnemo/CompileDaemon v1.2.1
	github.com/gobuffalo/here v0.6.2 // indirect
	github.com/gogo/protobuf v1.3.1
	github.com/golang/protobuf v1.4.2
	github.com/grpc-ecosystem/go-grpc-middleware v1.2.0
	github.com/grpc-ecosystem/grpc-gateway v1.14.6
	github.com/improbable-eng/grpc-web v0.13.0
	github.com/ipfs/go-cid v0.0.7
	github.com/ipfs/go-datastore v0.4.4
	github.com/ipfs/go-ds-badger v0.2.4
	github.com/ipfs/go-ipfs v0.6.0
	github.com/ipfs/go-ipfs-config v0.9.0
	github.com/ipfs/go-ipfs-keystore v0.0.1
	github.com/ipfs/go-log v1.0.4
	github.com/ipfs/go-log/v2 v2.1.1
	github.com/ipfs/interface-go-ipfs-core v0.3.0
	github.com/ipld/go-ipld-prime v0.0.2 // indirect
	github.com/itsTurnip/dishooks v0.0.0-20200206125049-b4fc7c7b042e
	github.com/juju/fslock v0.0.0-20160525022230-4d5c94c67b4b
	github.com/kisielk/errcheck v1.4.0 // indirect
	github.com/libp2p/go-libp2p v0.10.2
	github.com/libp2p/go-libp2p-circuit v0.3.1
	github.com/libp2p/go-libp2p-core v0.6.1
	github.com/libp2p/go-libp2p-discovery v0.5.0
	github.com/libp2p/go-libp2p-kad-dht v0.8.3
	github.com/libp2p/go-libp2p-kbucket v0.4.6 // indirect
	github.com/libp2p/go-libp2p-pubsub v0.3.3
	github.com/libp2p/go-libp2p-quic-transport v0.7.1
	github.com/libp2p/go-libp2p-record v0.1.3
	github.com/libp2p/go-libp2p-rendezvous v0.0.0-20190708065449-737144165c9e
	github.com/libp2p/go-libp2p-transport-upgrader v0.3.0
	github.com/libp2p/go-reuseport-transport v0.0.4 // indirect
	github.com/libp2p/go-yamux v1.3.8 // indirect
	github.com/marten-seemann/qtls v0.10.0 // indirect
	github.com/mattn/go-colorable v0.1.7 // indirect
	github.com/mdp/qrterminal/v3 v3.0.0
	github.com/mgutz/ansi v0.0.0-20200706080929-d51e80ef957d // indirect
	github.com/multiformats/go-multiaddr v0.2.2
	github.com/multiformats/go-multiaddr-dns v0.2.0
	github.com/multiformats/go-multiaddr-fmt v0.1.0
	github.com/multiformats/go-multiaddr-net v0.1.5
	github.com/multiformats/go-multihash v0.0.14
	github.com/multiformats/go-multistream v0.1.2
	github.com/oklog/run v1.1.0
	github.com/peterbourgon/ff/v3 v3.0.0
	github.com/pkg/errors v0.9.1
	github.com/prometheus/client_golang v1.7.1 // indirect
	github.com/pseudomuto/protoc-gen-doc v1.3.2
	github.com/rivo/tview v0.0.0-20200712113419-c65badfc3d92
	github.com/shibukawa/configdir v0.0.0-20170330084843-e180dbdc8da0
	github.com/skip2/go-qrcode v0.0.0-20200617195104-da1b6568686e
	github.com/smartystreets/goconvey v1.6.4 // indirect
	github.com/stretchr/testify v1.6.1
	go.opentelemetry.io/otel v0.8.0
	go.opentelemetry.io/otel/exporters/trace/jaeger v0.8.0
	go.uber.org/fx v1.13.0 // indirect
	go.uber.org/zap v1.15.0
	golang.org/x/crypto v0.0.0-20200728195943-123391ffb6de
	golang.org/x/net v0.0.0-20200707034311-ab3426394381
	golang.org/x/sys v0.0.0-20200728102440-3e129f6d46b1 // indirect
	golang.org/x/text v0.3.3 // indirect
	golang.org/x/tools v0.0.0-20200717024301-6ddee64345a6
	google.golang.org/genproto v0.0.0-20200715011427-11fb19a81f2c // indirect
	google.golang.org/grpc v1.30.0
	google.golang.org/protobuf v1.25.0 // indirect
	gorm.io/driver/sqlite v1.0.8
	gorm.io/gorm v0.2.26
	honnef.co/go/tools v0.0.1-2020.1.4 // indirect
	moul.io/godev v1.6.0
	moul.io/openfiles v1.2.0
	moul.io/srand v1.4.0
)

replace (
	bazil.org/fuse => bazil.org/fuse v0.0.0-20200117225306-7b5117fecadc // specific version for iOS building
	github.com/agl/ed25519 => github.com/agl/ed25519 v0.0.0-20170116200512-5312a6153412 // latest commit before the author shutdown the repo; see https://github.com/golang/go/issues/20504
	github.com/ipld/go-ipld-prime => github.com/ipld/go-ipld-prime v0.0.2-0.20191108012745-28a82f04c785 // specific version needed indirectly
	github.com/ipld/go-ipld-prime-proto => github.com/ipld/go-ipld-prime-proto v0.0.0-20191113031812-e32bd156a1e5 // specific version needed indirectly
	github.com/libp2p/go-libp2p-kbucket => github.com/libp2p/go-libp2p-kbucket v0.4.2 // specific version needed indirectly
)
