module berty.tech/berty/v2

go 1.19

require (
	berty.tech/go-ipfs-repo-encrypted v1.3.0
	berty.tech/go-orbit-db v1.22.0
	berty.tech/ipfs-webui-packed v1.0.0-v2.11.4-1
	berty.tech/weshnet v1.12.1
	fyne.io/fyne/v2 v2.1.1
	github.com/Masterminds/semver v1.5.0
	github.com/appleboy/go-fcm v0.1.5
	github.com/atotto/clipboard v0.1.4
	github.com/berty/go-libp2p-mock v1.0.1
	github.com/berty/go-libp2p-rendezvous v0.5.0
	github.com/bufbuild/buf v1.13.1
	github.com/buicongtan1997/protoc-gen-swagger-config v0.0.0-20200705084907-1342b78c1a7e
	github.com/campoy/embedmd v1.0.0
	github.com/daixiang0/gci v0.8.2
	github.com/denisbrodbeck/machineid v1.0.1
	github.com/eknkc/basex v1.0.1
	github.com/fabiokung/shm v0.0.0-20150728212823-2852b0d79bae
	github.com/fatih/color v1.13.0
	github.com/gdamore/tcell v1.4.0
	github.com/gen2brain/beeep v0.0.0-20200526185328-e9c15c258e28
	github.com/githubnemo/CompileDaemon v1.4.0
	github.com/gofrs/uuid v4.3.1+incompatible
	github.com/gogo/protobuf v1.3.2
	github.com/golang/protobuf v1.5.3
	github.com/grandcat/zeroconf v1.0.0
	github.com/grpc-ecosystem/go-grpc-middleware v1.3.0
	github.com/grpc-ecosystem/grpc-gateway v1.16.0
	github.com/hyperledger/aries-framework-go v0.1.9-0.20221202141134-083803ecf0a3
	github.com/hyperledger/aries-framework-go/component/storageutil v0.0.0-20220322085443-50e8f9bd208b
	github.com/improbable-eng/grpc-web v0.14.1
	github.com/ipfs/go-cid v0.4.1
	github.com/ipfs/go-datastore v0.6.0
	github.com/ipfs/go-log/v2 v2.5.1
	github.com/ipfs/interface-go-ipfs-core v0.11.1
	github.com/ipfs/kubo v0.19.0
	github.com/itsTurnip/dishooks v0.0.0-20200206125049-b4fc7c7b042e
	github.com/jbenet/go-context v0.0.0-20150711004518-d14ea06fba99
	github.com/kr/pretty v0.3.1
	github.com/libp2p/go-libp2p v0.27.8
	github.com/libp2p/go-libp2p-kad-dht v0.21.1
	github.com/libp2p/go-libp2p-pubsub v0.9.3
	github.com/libp2p/zeroconf/v2 v2.2.0
	github.com/markbates/pkger v0.17.1
	github.com/mdomke/git-semver/v5 v5.0.0
	github.com/mdp/qrterminal v1.0.1
	github.com/mdp/qrterminal/v3 v3.0.0
	github.com/mr-tron/base58 v1.2.0
	github.com/multiformats/go-multiaddr v0.9.0
	github.com/multiformats/go-multibase v0.2.0
	github.com/multiformats/go-multicodec v0.8.1
	github.com/mutecomm/go-sqlcipher/v4 v4.4.2
	github.com/nyaruka/phonenumbers v1.0.75
	github.com/oklog/run v1.1.0
	github.com/peterbourgon/ff/v3 v3.0.0
	github.com/phayes/freeport v0.0.0-20180830031419-95f893ade6f2
	github.com/piprate/json-gold v0.4.2
	github.com/pkg/errors v0.9.1
	github.com/prometheus/client_golang v1.14.0
	github.com/pseudomuto/protoc-gen-doc v1.5.1
	github.com/rivo/tview v0.0.0-20200712113419-c65badfc3d92
	github.com/shibukawa/configdir v0.0.0-20170330084843-e180dbdc8da0
	github.com/sideshow/apns2 v0.20.0
	github.com/skip2/go-qrcode v0.0.0-20200617195104-da1b6568686e
	github.com/stretchr/testify v1.8.2
	github.com/tailscale/depaware v0.0.0-20210622194025-720c4b409502
	github.com/tj/assert v0.0.3
	github.com/zcalusic/sysinfo v0.0.0-20200820110305-ef1bb2697bc2
	go.uber.org/goleak v1.1.12
	go.uber.org/multierr v1.11.0
	go.uber.org/zap v1.24.0
	golang.org/x/crypto v0.7.0
	golang.org/x/mobile v0.0.0-20210220033013-bdb1ca9a1e08
	golang.org/x/net v0.8.0
	golang.org/x/text v0.8.0
	golang.org/x/tools v0.7.0
	golang.org/x/xerrors v0.0.0-20220907171357-04be3eba64a2
	google.golang.org/grpc v1.50.1
	google.golang.org/grpc/cmd/protoc-gen-go-grpc v1.3.0
	gorm.io/gorm v1.25.0
	moul.io/godev v1.7.0
	moul.io/openfiles v1.2.0
	moul.io/progress v1.4.0
	moul.io/srand v1.6.1
	moul.io/testman v1.5.0
	moul.io/u v1.27.0
	moul.io/zapconfig v1.4.0
	moul.io/zapgorm2 v1.1.1
	moul.io/zapring v1.3.3
	mvdan.cc/gofumpt v0.4.0
)

require (
	bazil.org/fuse v0.0.0-20200117225306-7b5117fecadc // indirect
	berty.tech/go-ipfs-log v1.10.0 // indirect
	contrib.go.opencensus.io/exporter/prometheus v0.4.0 // indirect
	filippo.io/edwards25519 v1.0.0 // indirect
	github.com/AndreasBriese/bbloom v0.0.0-20190825152654-46b345b51c96 // indirect
	github.com/Azure/go-ansiterm v0.0.0-20210617225240-d185dfc1b5a1 // indirect
	github.com/DataDog/zstd v1.4.1 // indirect
	github.com/Masterminds/goutils v1.1.0 // indirect
	github.com/Masterminds/sprig v2.22.0+incompatible // indirect
	github.com/Microsoft/go-winio v0.6.0 // indirect
	github.com/VictoriaMetrics/fastcache v1.5.7 // indirect
	github.com/aead/ecdh v0.2.0 // indirect
	github.com/alecthomas/units v0.0.0-20211218093645-b94a6e3cc137 // indirect
	github.com/alexbrainman/goissue34681 v0.0.0-20191006012335-3fc7a47baff5 // indirect
	github.com/benbjohnson/clock v1.3.0 // indirect
	github.com/beorn7/perks v1.0.1 // indirect
	github.com/berty/emitter-go v0.0.0-20221031144724-5dae963c3622 // indirect
	github.com/blang/semver/v4 v4.0.0 // indirect
	github.com/btcsuite/btcd v0.22.1 // indirect
	github.com/btcsuite/btcutil v1.0.3-0.20201208143702-a53e38424cce // indirect
	github.com/bufbuild/connect-go v1.4.1 // indirect
	github.com/bufbuild/protocompile v0.1.0 // indirect
	github.com/cenkalti/backoff v2.2.1+incompatible // indirect
	github.com/cenkalti/backoff/v4 v4.1.3 // indirect
	github.com/ceramicnetwork/go-dag-jose v0.1.0 // indirect
	github.com/cespare/xxhash v1.1.0 // indirect
	github.com/cespare/xxhash/v2 v2.2.0 // indirect
	github.com/cheggaaa/pb v1.0.29 // indirect
	github.com/containerd/cgroups v1.1.0 // indirect
	github.com/coreos/go-systemd/v22 v22.5.0 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.2 // indirect
	github.com/crackcomm/go-gitignore v0.0.0-20170627025303-887ab5e44cc3 // indirect
	github.com/cskr/pubsub v1.0.2 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/davidlazar/go-crypto v0.0.0-20200604182044-b73af7476f6c // indirect
	github.com/decred/dcrd/dcrec/secp256k1/v4 v4.1.0 // indirect
	github.com/desertbit/timer v0.0.0-20180107155436-c41aec40b27f // indirect
	github.com/dgraph-io/badger v1.6.2 // indirect
	github.com/dgraph-io/badger/v2 v2.2007.3 // indirect
	github.com/dgraph-io/ristretto v0.0.3 // indirect
	github.com/dgrijalva/jwt-go v3.2.0+incompatible // indirect
	github.com/dgryski/go-farm v0.0.0-20190423205320-6a90982ecee2 // indirect
	github.com/docker/cli v20.10.23+incompatible // indirect
	github.com/docker/distribution v2.8.1+incompatible // indirect
	github.com/docker/docker v20.10.23+incompatible // indirect
	github.com/docker/docker-credential-helpers v0.7.0 // indirect
	github.com/docker/go-connections v0.4.0 // indirect
	github.com/docker/go-units v0.5.0 // indirect
	github.com/dustin/go-humanize v1.0.0 // indirect
	github.com/eclipse/paho.mqtt.golang v1.4.2 // indirect
	github.com/elastic/gosigar v0.14.2 // indirect
	github.com/elgris/jsondiff v0.0.0-20160530203242-765b5c24c302 // indirect
	github.com/emicklei/proto v1.6.13 // indirect
	github.com/envoyproxy/protoc-gen-validate v0.6.2 // indirect
	github.com/facebookgo/atomicfile v0.0.0-20151019160806-2de1f203e7d5 // indirect
	github.com/felixge/fgprof v0.9.3 // indirect
	github.com/felixge/httpsnoop v1.0.3 // indirect
	github.com/flynn/noise v1.0.0 // indirect
	github.com/francoispqt/gojay v1.2.13 // indirect
	github.com/fredbi/uri v0.0.0-20181227131451-3dcfdacbaaf3 // indirect
	github.com/fsnotify/fsnotify v1.6.0 // indirect
	github.com/gabriel-vasile/mimetype v1.4.1 // indirect
	github.com/gdamore/encoding v1.0.0 // indirect
	github.com/ghodss/yaml v1.0.0 // indirect
	github.com/go-chi/chi/v5 v5.0.8 // indirect
	github.com/go-gl/gl v0.0.0-20210813123233-e4099ee2221f // indirect
	github.com/go-gl/glfw/v3.3/glfw v0.0.0-20210410170116-ea3d685f79fb // indirect
	github.com/go-kit/log v0.2.1 // indirect
	github.com/go-logfmt/logfmt v0.5.1 // indirect
	github.com/go-logr/logr v1.2.3 // indirect
	github.com/go-logr/stdr v1.2.2 // indirect
	github.com/go-task/slim-sprig v0.0.0-20230315185526-52ccab3ef572 // indirect
	github.com/go-toast/toast v0.0.0-20190211030409-01e6764cf0a4 // indirect
	github.com/gobuffalo/here v0.6.2 // indirect
	github.com/godbus/dbus/v5 v5.1.0 // indirect
	github.com/gofrs/flock v0.8.1 // indirect
	github.com/goki/freetype v0.0.0-20181231101311-fa8a33aabaff // indirect
	github.com/golang/glog v1.0.0 // indirect
	github.com/golang/groupcache v0.0.0-20210331224755-41bb18bfe9da // indirect
	github.com/golang/mock v1.6.0 // indirect
	github.com/golang/snappy v0.0.4 // indirect
	github.com/google/go-cmp v0.5.9 // indirect
	github.com/google/go-containerregistry v0.12.1 // indirect
	github.com/google/gopacket v1.1.19 // indirect
	github.com/google/pprof v0.0.0-20230405160723-4a4c7d95572b // indirect
	github.com/google/tink/go v1.7.0 // indirect
	github.com/google/uuid v1.3.0 // indirect
	github.com/gopherjs/gopherjs v0.0.0-20190812055157-5d271430af9f // indirect
	github.com/gopherjs/gopherwasm v1.1.0 // indirect
	github.com/gorilla/mux v1.8.0 // indirect
	github.com/gorilla/websocket v1.5.0 // indirect
	github.com/grpc-ecosystem/grpc-gateway/v2 v2.7.0 // indirect
	github.com/hannahhoward/go-pubsub v0.0.0-20200423002714-8d62886cc36e // indirect
	github.com/hashicorp/errwrap v1.1.0 // indirect
	github.com/hashicorp/go-multierror v1.1.1 // indirect
	github.com/hashicorp/golang-lru v0.5.4 // indirect
	github.com/hashicorp/golang-lru/v2 v2.0.2 // indirect
	github.com/hexops/gotextdiff v1.0.3 // indirect
	github.com/huandu/xstrings v1.3.2 // indirect
	github.com/huin/goupnp v1.1.0 // indirect
	github.com/hyperledger/aries-framework-go/spi v0.0.0-20221025204933-b807371b6f1e // indirect
	github.com/hyperledger/ursa-wrapper-go v0.3.1 // indirect
	github.com/imdario/mergo v0.3.11 // indirect
	github.com/inconshreveable/mousetrap v1.1.0 // indirect
	github.com/ipfs/bbloom v0.0.4 // indirect
	github.com/ipfs/go-bitfield v1.1.0 // indirect
	github.com/ipfs/go-block-format v0.1.1 // indirect
	github.com/ipfs/go-blockservice v0.5.0 // indirect
	github.com/ipfs/go-cidutil v0.1.0 // indirect
	github.com/ipfs/go-delegated-routing v0.7.0 // indirect
	github.com/ipfs/go-ds-badger v0.3.0 // indirect
	github.com/ipfs/go-ds-badger2 v0.1.3 // indirect
	github.com/ipfs/go-ds-flatfs v0.5.1 // indirect
	github.com/ipfs/go-ds-leveldb v0.5.0 // indirect
	github.com/ipfs/go-ds-measure v0.2.0 // indirect
	github.com/ipfs/go-ds-sql v0.3.0 // indirect
	github.com/ipfs/go-fetcher v1.6.1 // indirect
	github.com/ipfs/go-filestore v1.2.0 // indirect
	github.com/ipfs/go-fs-lock v0.0.7 // indirect
	github.com/ipfs/go-graphsync v0.14.1 // indirect
	github.com/ipfs/go-ipfs-blockstore v1.2.0 // indirect
	github.com/ipfs/go-ipfs-chunker v0.0.5 // indirect
	github.com/ipfs/go-ipfs-cmds v0.8.2 // indirect
	github.com/ipfs/go-ipfs-delay v0.0.1 // indirect
	github.com/ipfs/go-ipfs-ds-help v1.1.0 // indirect
	github.com/ipfs/go-ipfs-exchange-interface v0.2.0 // indirect
	github.com/ipfs/go-ipfs-exchange-offline v0.3.0 // indirect
	github.com/ipfs/go-ipfs-keystore v0.1.0 // indirect
	github.com/ipfs/go-ipfs-pinner v0.3.0 // indirect
	github.com/ipfs/go-ipfs-posinfo v0.0.1 // indirect
	github.com/ipfs/go-ipfs-pq v0.0.3 // indirect
	github.com/ipfs/go-ipfs-provider v0.8.1 // indirect
	github.com/ipfs/go-ipfs-redirects-file v0.1.1 // indirect
	github.com/ipfs/go-ipfs-routing v0.3.0 // indirect
	github.com/ipfs/go-ipfs-util v0.0.2 // indirect
	github.com/ipfs/go-ipld-cbor v0.0.6 // indirect
	github.com/ipfs/go-ipld-format v0.4.0 // indirect
	github.com/ipfs/go-ipld-git v0.1.1 // indirect
	github.com/ipfs/go-ipld-legacy v0.1.1 // indirect
	github.com/ipfs/go-ipns v0.3.0 // indirect
	github.com/ipfs/go-libipfs v0.6.2 // indirect
	github.com/ipfs/go-log v1.0.5 // indirect
	github.com/ipfs/go-merkledag v0.10.0 // indirect
	github.com/ipfs/go-metrics-interface v0.0.1 // indirect
	github.com/ipfs/go-mfs v0.2.1 // indirect
	github.com/ipfs/go-namesys v0.7.0 // indirect
	github.com/ipfs/go-path v0.3.1 // indirect
	github.com/ipfs/go-peertaskqueue v0.8.1 // indirect
	github.com/ipfs/go-pinning-service-http-client v0.1.2 // indirect
	github.com/ipfs/go-unixfs v0.4.4 // indirect
	github.com/ipfs/go-unixfsnode v1.5.2 // indirect
	github.com/ipfs/go-verifcid v0.0.2 // indirect
	github.com/ipld/edelweiss v0.2.0 // indirect
	github.com/ipld/go-car v0.5.0 // indirect
	github.com/ipld/go-car/v2 v2.5.1 // indirect
	github.com/ipld/go-codec-dagpb v1.6.0 // indirect
	github.com/ipld/go-ipld-prime v0.20.0 // indirect
	github.com/jackpal/go-nat-pmp v1.0.2 // indirect
	github.com/jbenet/go-temp-err-catcher v0.1.0 // indirect
	github.com/jbenet/goprocess v0.1.4 // indirect
	github.com/jdxcode/netrc v0.0.0-20221124155335-4616370d1a84 // indirect
	github.com/jinzhu/copier v0.0.0-20190924061706-b57f9002281a // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/jinzhu/now v1.1.5 // indirect
	github.com/kilic/bls12-381 v0.1.1-0.20210503002446-7b7597926c69 // indirect
	github.com/klauspost/compress v1.16.4 // indirect
	github.com/klauspost/cpuid/v2 v2.2.4 // indirect
	github.com/klauspost/pgzip v1.2.5 // indirect
	github.com/koron/go-ssdp v0.0.4 // indirect
	github.com/kr/text v0.2.0 // indirect
	github.com/libp2p/go-buffer-pool v0.1.0 // indirect
	github.com/libp2p/go-cidranger v1.1.0 // indirect
	github.com/libp2p/go-doh-resolver v0.4.0 // indirect
	github.com/libp2p/go-flow-metrics v0.1.0 // indirect
	github.com/libp2p/go-libp2p-asn-util v0.3.0 // indirect
	github.com/libp2p/go-libp2p-gostream v0.5.0 // indirect
	github.com/libp2p/go-libp2p-http v0.4.0 // indirect
	github.com/libp2p/go-libp2p-kbucket v0.5.0 // indirect
	github.com/libp2p/go-libp2p-pubsub-router v0.6.0 // indirect
	github.com/libp2p/go-libp2p-record v0.2.0 // indirect
	github.com/libp2p/go-libp2p-routing-helpers v0.6.1 // indirect
	github.com/libp2p/go-libp2p-xor v0.1.0 // indirect
	github.com/libp2p/go-mplex v0.7.0 // indirect
	github.com/libp2p/go-msgio v0.3.0 // indirect
	github.com/libp2p/go-nat v0.1.0 // indirect
	github.com/libp2p/go-netroute v0.2.1 // indirect
	github.com/libp2p/go-reuseport v0.2.0 // indirect
	github.com/libp2p/go-yamux/v4 v4.0.0 // indirect
	github.com/lucasb-eyer/go-colorful v1.0.3 // indirect
	github.com/marten-seemann/tcp v0.0.0-20210406111302-dfbc87cc63fd // indirect
	github.com/maruel/circular v0.0.0-20200815005550-36e533b830e9 // indirect
	github.com/mattn/go-colorable v0.1.12 // indirect
	github.com/mattn/go-isatty v0.0.18 // indirect
	github.com/mattn/go-runewidth v0.0.8 // indirect
	github.com/matttproud/golang_protobuf_extensions v1.0.4 // indirect
	github.com/mgutz/ansi v0.0.0-20200706080929-d51e80ef957d // indirect
	github.com/miekg/dns v1.1.53 // indirect
	github.com/mikioh/tcpinfo v0.0.0-20190314235526-30a79bb1804b // indirect
	github.com/mikioh/tcpopt v0.0.0-20190314235656-172688c1accc // indirect
	github.com/minio/sha256-simd v1.0.0 // indirect
	github.com/mitchellh/copystructure v1.0.0 // indirect
	github.com/mitchellh/go-homedir v1.1.0 // indirect
	github.com/mitchellh/mapstructure v1.5.0 // indirect
	github.com/mitchellh/reflectwalk v1.0.1 // indirect
	github.com/moby/term v0.0.0-20221205130635-1aeaba878587 // indirect
	github.com/morikuni/aec v1.0.0 // indirect
	github.com/multiformats/go-base32 v0.1.0 // indirect
	github.com/multiformats/go-base36 v0.2.0 // indirect
	github.com/multiformats/go-multiaddr-dns v0.3.1 // indirect
	github.com/multiformats/go-multiaddr-fmt v0.1.0 // indirect
	github.com/multiformats/go-multihash v0.2.1 // indirect
	github.com/multiformats/go-multistream v0.4.1 // indirect
	github.com/multiformats/go-varint v0.0.7 // indirect
	github.com/mwitkow/go-proto-validators v0.0.0-20180403085117-0950a7990007 // indirect
	github.com/nu7hatch/gouuid v0.0.0-20131221200532-179d4d0c4d8d // indirect
	github.com/onsi/ginkgo/v2 v2.9.2 // indirect
	github.com/opencontainers/go-digest v1.0.0 // indirect
	github.com/opencontainers/image-spec v1.1.0-rc2 // indirect
	github.com/opencontainers/runtime-spec v1.0.2 // indirect
	github.com/opentracing/opentracing-go v1.2.0 // indirect
	github.com/openzipkin/zipkin-go v0.4.0 // indirect
	github.com/pbnjay/memory v0.0.0-20210728143218-7b4eea64cf58 // indirect
	github.com/pborman/uuid v1.2.1 // indirect
	github.com/pkg/browser v0.0.0-20210911075715-681adbf594b8 // indirect
	github.com/pkg/diff v0.0.0-20210226163009-20ebb0f2a09e // indirect
	github.com/pkg/profile v1.7.0 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/polydawn/refmt v0.89.0 // indirect
	github.com/pquerna/cachecontrol v0.1.0 // indirect
	github.com/prometheus/client_model v0.3.0 // indirect
	github.com/prometheus/common v0.42.0 // indirect
	github.com/prometheus/procfs v0.9.0 // indirect
	github.com/prometheus/statsd_exporter v0.21.0 // indirect
	github.com/pseudomuto/protokit v0.2.0 // indirect
	github.com/quic-go/qpack v0.4.0 // indirect
	github.com/quic-go/qtls-go1-19 v0.3.3 // indirect
	github.com/quic-go/qtls-go1-20 v0.2.3 // indirect
	github.com/quic-go/quic-go v0.33.0 // indirect
	github.com/quic-go/webtransport-go v0.5.2 // indirect
	github.com/radovskyb/watcher v1.0.7 // indirect
	github.com/raulk/go-watchdog v1.3.0 // indirect
	github.com/rivo/uniseg v0.1.0 // indirect
	github.com/rogpeppe/go-internal v1.9.0 // indirect
	github.com/rs/cors v1.8.3 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/samber/lo v1.36.0 // indirect
	github.com/sirupsen/logrus v1.9.0 // indirect
	github.com/spaolacci/murmur3 v1.1.0 // indirect
	github.com/spf13/cobra v1.6.1 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
	github.com/square/go-jose/v3 v3.0.0-20200630053402-0a67ce9b0693 // indirect
	github.com/srwiley/oksvg v0.0.0-20200311192757-870daf9aa564 // indirect
	github.com/srwiley/rasterx v0.0.0-20200120212402-85cb7272f5e9 // indirect
	github.com/syndtr/goleveldb v1.0.1-0.20210819022825-2ae1ddf74ef7 // indirect
	github.com/tadvi/systray v0.0.0-20190226123456-11a2b8fa57af // indirect
	github.com/teserakt-io/golang-ed25519 v0.0.0-20210104091850-3888c087a4c8 // indirect
	github.com/ucarion/urlpath v0.0.0-20200424170820-7ccc79b76bbb // indirect
	github.com/whyrusleeping/base32 v0.0.0-20170828182744-c30ac30633cc // indirect
	github.com/whyrusleeping/cbor-gen v0.0.0-20230126041949-52956bd4c9aa // indirect
	github.com/whyrusleeping/chunker v0.0.0-20181014151217-fe64bd25879f // indirect
	github.com/whyrusleeping/go-keyspace v0.0.0-20160322163242-5b898ac5add1 // indirect
	github.com/whyrusleeping/go-sysinfo v0.0.0-20190219211824-4a357d4b90b1 // indirect
	github.com/whyrusleeping/multiaddr-filter v0.0.0-20160516205228-e903e4adabd7 // indirect
	github.com/xeipuuv/gojsonpointer v0.0.0-20190905194746-02993c407bfb // indirect
	github.com/xeipuuv/gojsonreference v0.0.0-20180127040603-bd5ef7bd5415 // indirect
	github.com/xeipuuv/gojsonschema v1.2.0 // indirect
	github.com/yuin/goldmark v1.4.13 // indirect
	go.opencensus.io v0.24.0 // indirect
	go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.32.0 // indirect
	go.opentelemetry.io/otel v1.11.2 // indirect
	go.opentelemetry.io/otel/exporters/jaeger v1.7.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/internal/retry v1.7.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace v1.7.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc v1.7.0 // indirect
	go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp v1.7.0 // indirect
	go.opentelemetry.io/otel/exporters/stdout/stdouttrace v1.7.0 // indirect
	go.opentelemetry.io/otel/exporters/zipkin v1.7.0 // indirect
	go.opentelemetry.io/otel/metric v0.34.0 // indirect
	go.opentelemetry.io/otel/sdk v1.11.1 // indirect
	go.opentelemetry.io/otel/trace v1.11.2 // indirect
	go.opentelemetry.io/proto/otlp v0.16.0 // indirect
	go.uber.org/atomic v1.10.0 // indirect
	go.uber.org/dig v1.16.1 // indirect
	go.uber.org/fx v1.19.2 // indirect
	go4.org v0.0.0-20200411211856-f5505b9728dd // indirect
	golang.org/x/exp v0.0.0-20230321023759-10a507213a29 // indirect
	golang.org/x/image v0.5.0 // indirect
	golang.org/x/mod v0.10.0 // indirect
	golang.org/x/oauth2 v0.5.0 // indirect
	golang.org/x/sync v0.1.0 // indirect
	golang.org/x/sys v0.7.0 // indirect
	golang.org/x/term v0.6.0 // indirect
	google.golang.org/appengine v1.6.7 // indirect
	google.golang.org/genproto v0.0.0-20221202195650-67e5cbc046fd // indirect
	google.golang.org/protobuf v1.30.0 // indirect
	gopkg.in/square/go-jose.v2 v2.6.0 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
	lukechampine.com/blake3 v1.1.7 // indirect
	moul.io/banner v1.0.1 // indirect
	moul.io/motd v1.0.0 // indirect
	moul.io/zapfilter v1.7.0 // indirect
	nhooyr.io/websocket v1.8.7 // indirect
	rsc.io/qr v0.2.0 // indirect
)

replace (
	bazil.org/fuse => bazil.org/fuse v0.0.0-20200117225306-7b5117fecadc // specific version for iOS building

	github.com/multiformats/go-multiaddr => github.com/berty/go-multiaddr v0.7.1-0.20221227155345-2f7904a06393 // tmp, required for Android SDK30
	github.com/mutecomm/go-sqlcipher/v4 => github.com/berty/go-sqlcipher/v4 v4.4.3-0.20220810151512-74ea78235b48 // plaintext header support
	github.com/peterbourgon/ff/v3 => github.com/moul/ff/v3 v3.0.1 // temporary, see https://github.com/peterbourgon/ff/pull/67, https://github.com/peterbourgon/ff/issues/68
	go.opentelemetry.io/otel => go.opentelemetry.io/otel v1.11.1 // https://github.com/open-telemetry/opentelemetry-go/issues/3548
	golang.org/x/mobile => github.com/berty/mobile v0.0.8 // temporary, see https://github.com/golang/mobile/pull/58 and https://github.com/golang/mobile/pull/82
)
