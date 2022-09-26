module berty.tech/berty/tool/tyber/go

go 1.17

require (
	berty.tech/berty/v2 v2.0.0
	github.com/asticode/go-astikit v0.21.1
	github.com/asticode/go-astilectron v0.24.0
	github.com/asticode/go-astilectron-bootstrap v0.4.13
	github.com/asticode/go-astilectron-bundler v0.7.11
	github.com/gorilla/websocket v1.4.2
	github.com/grandcat/zeroconf v1.0.0
	github.com/peterbourgon/ff/v3 v3.0.0
	github.com/pkg/errors v0.9.1
	github.com/wk8/go-ordered-map v0.2.0
	go.uber.org/multierr v1.7.0
)

require (
	github.com/akavel/rsrc v0.8.0 // indirect
	github.com/asticode/go-bindata v1.0.0 // indirect
	github.com/btcsuite/btcd v0.22.0-beta // indirect
	github.com/cenkalti/backoff v2.2.1+incompatible // indirect
	github.com/gofrs/uuid v3.4.0+incompatible // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	github.com/grpc-ecosystem/grpc-gateway v1.16.0 // indirect
	github.com/ipfs/go-cid v0.1.0 // indirect
	github.com/klauspost/cpuid/v2 v2.0.9 // indirect
	github.com/libp2p/go-libp2p-core v0.13.0 // indirect
	github.com/libp2p/go-openssl v0.0.7 // indirect
	github.com/miekg/dns v1.1.43 // indirect
	github.com/minio/blake2b-simd v0.0.0-20160723061019-3f5f724cb5b1 // indirect
	github.com/minio/sha256-simd v1.0.0 // indirect
	github.com/mr-tron/base58 v1.2.0 // indirect
	github.com/multiformats/go-base32 v0.0.3 // indirect
	github.com/multiformats/go-base36 v0.1.0 // indirect
	github.com/multiformats/go-multibase v0.0.3 // indirect
	github.com/multiformats/go-multihash v0.1.0 // indirect
	github.com/multiformats/go-varint v0.0.6 // indirect
	github.com/sam-kamerer/go-plister v1.2.0 // indirect
	github.com/spacemonkeygo/spacelog v0.0.0-20180420211403-2296661a0572 // indirect
	github.com/spaolacci/murmur3 v1.1.0 // indirect
	go.uber.org/atomic v1.9.0 // indirect
	go.uber.org/zap v1.20.0 // indirect
	golang.org/x/crypto v0.0.0-20220411220226-7b82a4e95df4 // indirect
	golang.org/x/net v0.0.0-20211112202133-69e39bad7dc2 // indirect
	golang.org/x/sys v0.0.0-20211216021012-1d35b9e2eb4e // indirect
	golang.org/x/text v0.3.7 // indirect
	golang.org/x/xerrors v0.0.0-20200804184101-5ec99f83aff1 // indirect
	google.golang.org/genproto v0.0.0-20211208223120-3a66f561d7aa // indirect
	google.golang.org/grpc v1.42.0 // indirect
	google.golang.org/protobuf v1.27.1 // indirect
	lukechampine.com/blake3 v1.1.6 // indirect
)

replace (
	berty.tech/berty/v2 v2.0.0 => ../../../
	github.com/libp2p/go-libp2p-rendezvous v0.0.0 => github.com/berty/go-libp2p-rendezvous v0.0.0-20211013085524-09965cd64781 // use berty fork of go-libp2p-rendezvous with sqlcipher support
)
