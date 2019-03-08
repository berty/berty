#!/bin/bash

GO111MODULE=on

repos="
github.com/libp2p/go-addr-util
github.com/libp2p/go-buffer-pool
github.com/libp2p/go-conn-security
github.com/libp2p/go-conn-security-multistream
github.com/libp2p/go-flow-metrics
github.com/libp2p/go-libp2p
github.com/libp2p/go-libp2p-blankhost
github.com/libp2p/go-libp2p-circuit
github.com/libp2p/go-libp2p-connmgr
github.com/libp2p/go-libp2p-crypto
github.com/libp2p/go-libp2p-host
github.com/libp2p/go-libp2p-interface-connmgr
github.com/libp2p/go-libp2p-interface-pnet
github.com/libp2p/go-libp2p-kad-dht
github.com/libp2p/go-libp2p-kbucket
github.com/libp2p/go-libp2p-loggables
github.com/libp2p/go-libp2p-metrics
github.com/libp2p/go-libp2p-nat
github.com/libp2p/go-libp2p-net
github.com/libp2p/go-libp2p-netutil
github.com/libp2p/go-libp2p-peer
github.com/libp2p/go-libp2p-peerstore
github.com/libp2p/go-libp2p-pnet
github.com/libp2p/go-libp2p-protocol
github.com/libp2p/go-libp2p-pubsub
github.com/libp2p/go-libp2p-quic-transport
github.com/libp2p/go-libp2p-record
github.com/libp2p/go-libp2p-routing
github.com/libp2p/go-libp2p-secio
github.com/libp2p/go-libp2p-swarm
github.com/libp2p/go-libp2p-transport
github.com/libp2p/go-libp2p-transport-upgrader
github.com/libp2p/go-maddr-filter
github.com/libp2p/go-mplex
github.com/libp2p/go-msgio
github.com/libp2p/go-reuseport
github.com/libp2p/go-reuseport-transport
github.com/libp2p/go-sockaddr
github.com/libp2p/go-stream-muxer
github.com/libp2p/go-tcp-transport
github.com/libp2p/go-testutil
github.com/libp2p/go-ws-transport
github.com/multiformats/go-multiaddr
github.com/multiformats/go-multiaddr-dns
github.com/multiformats/go-multiaddr-net
github.com/multiformats/go-multibase
github.com/multiformats/go-multicodec
github.com/multiformats/go-multihash
github.com/multiformats/go-multistream
github.com/ipfs/go-cid
github.com/ipfs/go-datastore
github.com/ipfs/go-ipfs-addr
github.com/ipfs/go-ipfs-util
github.com/ipfs/go-log
"

# clean up
[ "clean" = "$1" ] && echo "cleaning..." && (rm -rf vendor || true) && go clean -modcache > /dev/null 2>&1

echo "upgrading..."

# update them all
for repo in $repos; do
    version=$(git ls-remote --tags "git://$repo" | sed -E 's`refs/tags/(v[0-9]+\.[0-9]+\.[0-9]+).*`\1`g' | sort -V -k 2 | tail -1 | cut -f2)
    if [ ! -z "$version" ]; then
        echo "$repo -> $version"
        go mod edit -require "$repo@$version"
    fi
done

go mod vendor -v
go mod tidy
go mod verify
