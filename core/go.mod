module berty.tech/core

require (
	cloud.google.com/go v0.30.0 // indirect
	github.com/99designs/gqlgen v0.6.0
	github.com/BurntSushi/toml v0.3.1 // indirect
	github.com/agl/ed25519 v0.0.0-20170116200512-5312a6153412 // indirect
	github.com/agnivade/levenshtein v1.0.1 // indirect
	github.com/andreyvit/diff v0.0.0-20170406064948-c7f18ee00883 // indirect
	github.com/brianvoe/gofakeit v3.13.0+incompatible
	github.com/btcsuite/btcd v0.0.0-20181013004428-67e573d211ac // indirect
	github.com/codahale/hdrhistogram v0.0.0-20161010025455-3a0bb77429bd // indirect
	github.com/coreos/go-semver v0.2.0 // indirect
	github.com/denisenkom/go-mssqldb v0.0.0-20181014144952-4e0d7dc8888f // indirect
	github.com/erikstmartin/go-testdb v0.0.0-20160219214506-8d10e4a1bae5 // indirect
	github.com/fd/go-nat v1.0.0 // indirect
	github.com/go-check/check v0.0.0-20180628173108-788fd7840127 // indirect
	github.com/go-gormigrate/gormigrate v1.2.1
	github.com/go-sql-driver/mysql v1.4.0 // indirect
	github.com/gogo/protobuf v1.1.1
	github.com/golang/protobuf v1.2.0
	github.com/google/go-cmp v0.2.0 // indirect
	github.com/google/uuid v1.0.0 // indirect
	github.com/gopherjs/gopherjs v0.0.0-20181004151105-1babbf986f6f // indirect
	github.com/gorilla/websocket v1.4.0
	github.com/grpc-ecosystem/go-grpc-middleware v1.0.0
	github.com/gxed/GoEndian v0.0.0-20160916112711-0f5c6873267e // indirect
	github.com/gxed/eventfd v0.0.0-20160916113412-80a92cca79a8 // indirect
	github.com/gxed/hashland v0.0.0-20180221191214-d9f6b97f8db2 // indirect
	github.com/hashicorp/golang-lru v0.5.0 // indirect
	github.com/huin/goupnp v1.0.0 // indirect
	github.com/inconshreveable/mousetrap v1.0.0 // indirect
	github.com/ipfs/go-cid v0.9.0
	github.com/ipfs/go-datastore v3.2.0+incompatible
	github.com/ipfs/go-detect-race v1.0.1 // indirect
	github.com/ipfs/go-ipfs-addr v0.1.24
	github.com/ipfs/go-ipfs-util v1.2.8 // indirect
	github.com/ipfs/go-log v1.5.7
	github.com/ipfs/go-todocounter v1.0.1 // indirect
	github.com/jbenet/go-cienv v0.0.0-20150120210510-1bb1476777ec // indirect
	github.com/jbenet/go-context v0.0.0-20150711004518-d14ea06fba99 // indirect
	github.com/jbenet/go-randbuf v0.0.0-20160322125720-674640a50e6a // indirect
	github.com/jbenet/go-temp-err-catcher v0.0.0-20150120210811-aac704a3f4f2 // indirect
	github.com/jbenet/goprocess v0.0.0-20160826012719-b497e2f366b8 // indirect
	github.com/jinzhu/gorm v1.9.1
	github.com/jinzhu/inflection v0.0.0-20180308033659-04140366298a // indirect
	github.com/jinzhu/now v0.0.0-20180511015916-ed742868f2ae // indirect
	github.com/joho/godotenv v1.3.0 // indirect
	github.com/jtolds/gls v4.2.1+incompatible // indirect
	github.com/konsorten/go-windows-terminal-sequences v1.0.1 // indirect
	github.com/kr/pretty v0.1.0 // indirect
	github.com/lib/pq v1.0.0 // indirect
	github.com/libp2p/go-addr-util v2.0.6+incompatible // indirect
	github.com/libp2p/go-buffer-pool v0.1.1 // indirect
	github.com/libp2p/go-conn-security v0.1.13 // indirect
	github.com/libp2p/go-conn-security-multistream v0.1.13 // indirect
	github.com/libp2p/go-flow-metrics v0.2.0 // indirect
	github.com/libp2p/go-libp2p v6.0.19+incompatible
	github.com/libp2p/go-libp2p-blankhost v0.3.13 // indirect
	github.com/libp2p/go-libp2p-circuit v2.2.8+incompatible
	github.com/libp2p/go-libp2p-crypto v2.0.1+incompatible
	github.com/libp2p/go-libp2p-host v3.0.13+incompatible
	github.com/libp2p/go-libp2p-interface-connmgr v0.0.19
	github.com/libp2p/go-libp2p-interface-pnet v3.0.0+incompatible
	github.com/libp2p/go-libp2p-kad-dht v4.4.8+incompatible
	github.com/libp2p/go-libp2p-kbucket v2.2.11+incompatible // indirect
	github.com/libp2p/go-libp2p-loggables v1.1.22 // indirect
	github.com/libp2p/go-libp2p-metrics v2.1.6+incompatible
	github.com/libp2p/go-libp2p-nat v0.8.7 // indirect
	github.com/libp2p/go-libp2p-net v3.0.13+incompatible
	github.com/libp2p/go-libp2p-netutil v0.4.11 // indirect
	github.com/libp2p/go-libp2p-peer v2.3.8+incompatible
	github.com/libp2p/go-libp2p-peerstore v2.0.4+incompatible
	github.com/libp2p/go-libp2p-protocol v1.0.0
	github.com/libp2p/go-libp2p-record v4.1.7+incompatible // indirect
	github.com/libp2p/go-libp2p-routing v2.6.5+incompatible // indirect
	github.com/libp2p/go-libp2p-secio v2.0.15+incompatible // indirect
	github.com/libp2p/go-libp2p-swarm v3.0.19+incompatible // indirect
	github.com/libp2p/go-libp2p-transport v3.0.13+incompatible
	github.com/libp2p/go-libp2p-transport-upgrader v0.1.14 // indirect
	github.com/libp2p/go-maddr-filter v1.1.9 // indirect
	github.com/libp2p/go-mplex v0.2.30 // indirect
	github.com/libp2p/go-msgio v0.0.6 // indirect
	github.com/libp2p/go-reuseport v0.1.18
	github.com/libp2p/go-reuseport-transport v0.1.10
	github.com/libp2p/go-sockaddr v1.0.3 // indirect
	github.com/libp2p/go-stream-muxer v3.0.1+incompatible
	github.com/libp2p/go-tcp-transport v2.0.14+incompatible // indirect
	github.com/libp2p/go-testutil v1.2.8 // indirect
	github.com/libp2p/go-ws-transport v2.0.14+incompatible // indirect
	github.com/mattn/go-colorable v0.0.9 // indirect
	github.com/mattn/go-isatty v0.0.4 // indirect
	github.com/mattn/go-sqlite3 v1.9.0 // indirect
	github.com/miekg/dns v1.0.13 // indirect
	github.com/minio/blake2b-simd v0.0.0-20160723061019-3f5f724cb5b1 // indirect
	github.com/minio/sha256-simd v0.0.0-20181005183134-51976451ce19 // indirect
	github.com/mitchellh/mapstructure v1.1.2 // indirect
	github.com/mr-tron/base58 v1.0.0 // indirect
	github.com/multiformats/go-multiaddr v1.3.0
	github.com/multiformats/go-multiaddr-dns v0.0.0-20180623005149-78f39e8892d4 // indirect
	github.com/multiformats/go-multiaddr-net v1.6.3
	github.com/multiformats/go-multibase v0.3.0 // indirect
	github.com/multiformats/go-multihash v1.0.8
	github.com/multiformats/go-multistream v0.3.9 // indirect
	github.com/onsi/gomega v1.4.2 // indirect
	github.com/opentracing/opentracing-go v1.0.2
	github.com/pkg/errors v0.8.0
	github.com/rs/cors v1.6.0
	github.com/satori/go.uuid v0.0.0-20180103172713-c596ec57260f
	github.com/sergi/go-diff v1.0.0 // indirect
	github.com/sirupsen/logrus v1.1.1 // indirect
	github.com/smartystreets/assertions v0.0.0-20180927180507-b2de0cb4f26d // indirect
	github.com/smartystreets/goconvey v0.0.0-20180222194500-ef6db91d284a
	github.com/spaolacci/murmur3 v0.0.0-20180118202830-f09979ecbc72 // indirect
	github.com/spf13/cobra v0.0.3
	github.com/spf13/pflag v1.0.3
	github.com/spf13/viper v1.2.1
	github.com/teris-io/shortid v0.0.0-20171029131806-771a37caa5cf
	github.com/uber-go/atomic v1.3.2 // indirect
	github.com/uber/jaeger-client-go v2.15.0+incompatible
	github.com/uber/jaeger-lib v1.5.0 // indirect
	github.com/vektah/gqlparser v0.0.0-20181002002754-f119686bf1d4 // indirect
	github.com/whyrusleeping/base32 v0.0.0-20170828182744-c30ac30633cc // indirect
	github.com/whyrusleeping/go-keyspace v0.0.0-20160322163242-5b898ac5add1 // indirect
	github.com/whyrusleeping/go-logging v0.0.0-20170515211332-0457bb6b88fc
	github.com/whyrusleeping/go-notifier v0.0.0-20170827234753-097c5d47330f // indirect
	github.com/whyrusleeping/go-smux-multiplex v3.0.16+incompatible // indirect
	github.com/whyrusleeping/go-smux-multistream v2.0.2+incompatible // indirect
	github.com/whyrusleeping/go-smux-yamux v2.0.6+incompatible // indirect
	github.com/whyrusleeping/mafmt v0.0.0-20180627004827-1dc32401ee9f
	github.com/whyrusleeping/mdns v0.0.0-20180901202407-ef14215e6b30 // indirect
	github.com/whyrusleeping/multiaddr-filter v0.0.0-20160516205228-e903e4adabd7 // indirect
	github.com/whyrusleeping/yamux v1.1.2
	github.com/xeodou/go-sqlcipher v0.0.0-20180523161204-7f9cd319987f
	go.uber.org/atomic v1.3.2 // indirect
	go.uber.org/multierr v1.1.0 // indirect
	go.uber.org/zap v1.9.1
	golang.org/x/crypto v0.0.0-20181015023909-0c41d7ab0a0e // indirect
	golang.org/x/sys v0.0.0-20181011152604-fa43e7bc11ba // indirect
	google.golang.org/appengine v1.2.0 // indirect
	google.golang.org/genproto v0.0.0-20181004005441-af9cb2a35e7f // indirect
	google.golang.org/grpc v1.15.0
	gopkg.in/check.v1 v1.0.0-20180628173108-788fd7840127 // indirect
	gopkg.in/stretchr/testify.v1 v1.2.2 // indirect
)
