module berty.tech/network

go 1.12

require (
	github.com/gofrs/uuid v3.2.0+incompatible
	github.com/gogo/protobuf v1.2.1
	github.com/golang/protobuf v1.3.1
	github.com/gopherjs/gopherjs v0.0.0-20181103185306-d547d1d9531e // indirect
	github.com/ipfs/go-cid v0.0.2
	github.com/ipfs/go-datastore v0.0.5
	github.com/ipfs/go-ipfs-addr v0.0.1
	github.com/ipfs/go-ipfs-util v0.0.1
	github.com/ipfs/go-log v0.0.1
	github.com/jtolds/gls v4.2.2-0.20181110203027-b4936e06046b+incompatible // indirect
	github.com/libp2p/go-libp2p v0.1.1
	github.com/libp2p/go-libp2p-circuit v0.1.0
	github.com/libp2p/go-libp2p-connmgr v0.1.0
	github.com/libp2p/go-libp2p-core v0.0.3
	github.com/libp2p/go-libp2p-crypto v0.1.0
	github.com/libp2p/go-libp2p-host v0.1.0
	github.com/libp2p/go-libp2p-interface-connmgr v0.1.0
	github.com/libp2p/go-libp2p-kad-dht v0.1.0
	github.com/libp2p/go-libp2p-metrics v0.1.0
	github.com/libp2p/go-libp2p-mplex v0.2.1
	github.com/libp2p/go-libp2p-net v0.1.0
	github.com/libp2p/go-libp2p-peer v0.2.0
	github.com/libp2p/go-libp2p-peerstore v0.1.0
	github.com/libp2p/go-libp2p-pnet v0.1.0
	github.com/libp2p/go-libp2p-protocol v0.1.0
	github.com/libp2p/go-libp2p-quic-transport v0.1.2-0.20190805113730-01a06cdc5461
	github.com/libp2p/go-libp2p-record v0.1.0
	github.com/libp2p/go-libp2p-routing v0.1.0
	github.com/libp2p/go-libp2p-swarm v0.1.0
	github.com/libp2p/go-libp2p-tls v0.1.1
	github.com/libp2p/go-libp2p-transport-upgrader v0.1.1
	github.com/libp2p/go-libp2p-yamux v0.2.1
	github.com/libp2p/go-maddr-filter v0.0.4
	github.com/libp2p/go-tcp-transport v0.1.0
	github.com/libp2p/go-ws-transport v0.1.0
	github.com/multiformats/go-multiaddr v0.0.4
	github.com/multiformats/go-multiaddr-net v0.0.1
	github.com/multiformats/go-multihash v0.0.5
	github.com/multiformats/go-multistream v0.1.0
	github.com/pkg/errors v0.8.1
	github.com/smartystreets/assertions v0.0.0-20190215210624-980c5ac6f3ac // indirect
	github.com/smartystreets/goconvey v0.0.0-20190222223459-a17d461953aa
	github.com/sparrc/go-ping v0.0.0-20190613174326-4e5b6552494c
	github.com/whyrusleeping/mafmt v1.2.8
	go.uber.org/atomic v1.3.2 // indirect
	go.uber.org/multierr v1.1.0 // indirect
	go.uber.org/zap v1.9.1
	golang.org/x/crypto v0.0.0-20190701094942-4def268fd1a4 // indirect
	golang.org/x/net v0.0.0-20190628185345-da137c7871d7 // indirect
	golang.org/x/sys v0.0.0-20190626221950-04f50cda93cb // indirect
)

replace github.com/lucas-clemente/quic-go => github.com/lucas-clemente/quic-go v0.11.2

replace github.com/libp2p/go-libp2p-quic-transport => github.com/berty/go-libp2p-quic-transport v0.1.2-0.20190805113730-01a06cdc5461
