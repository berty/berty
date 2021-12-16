# Berty `go/`

[![go.dev reference](https://img.shields.io/badge/go.dev-reference-007d9c?logo=go&logoColor=white)](https://pkg.go.dev/berty.tech/berty/v2)
[![Code coverage](https://codecov.io/gh/berty/berty/branch/master/graph/badge.svg?token=rBPpNHNNow)](https://codecov.io/gh/berty/berty)

__Please, read the main [`README.md`](../README.md) file first.__

This folder contains most of the go code needed by the project.

## Download

Main binary:
```sh
git clone https://github.com/berty/berty
cd berty/go
make install

# if things go wrong, please run and share the result of
make doctor
```

## Main components

* [`./cmd/...`](./cmd): binaries / entrypoints
    * `cd go; make install`
* [`./pkg/...`](./pkg): packages especially made to be imported by other projects
    * [`./bertyprotocol`](./pkg/bertyprotocol): the [Berty Protocol](https://berty.tech/protocol)
    * ...
* [`./internal/`](./internal): internal packages that can be useful to understand how things are working under the hood
    * _you won't be able to import them directly from your projects; if you think that an internal package should be made public, open an issue_
* [`./framework`](./framework): bridges used by mobile apps

## Usage

### Daemon

[embedmd]:# (.tmp/berty-daemon.txt console)
```console
foo@bar:~$ berty daemon
2020-11-16T20:46:31Z	INFO    bty                 metrics listener	{"handler": "/bty/metrics", "listener": "[::]:8888"}
...
```

Now you can interact with the daemon API.

### Mini

TODO

### Share Invite

[embedmd]:# (.tmp/berty-share-invite.txt console)
```console
foo@bar:~$ berty share-invite
https://berty.tech/id#contact/oZBLFCLBf9jVeFU12w6KEqBbGfvPqRzNdDq8gw3yogYqHhQ1o4jsy6ucYBmicj2TRkSQ4zLkPGwWP9wfFSQsBCZ3zdrVXcB/name=demo
```

### Info

[embedmd]:# (.tmp/berty-info.txt console)
```console
foo@bar:~$ berty info
{
  "protocol": {
    "process": {
      "version": "v2.278.2-dev.4+gf50460f5",
      "vcsRef": "f50460f5",
      "uptimeMs": "3938",
      "userCpuTimeMs": "402",
      "systemCpuTimeMs": "99",
      "startedAt": "1619711919",
      "rlimitCur": "2560",
      "numGoroutine": "418",
      "nofile": "43",
      "numCpu": "8",
      "goVersion": "go1.16.2",
      "operatingSystem": "darwin",
      "hostName": "REDACTED",
      "arch": "arm64",
      "rlimitMax": "9223372036854775807",
      "pid": "36035",
      "ppid": "36034",
      "uid": "501",
      "workingDir": "REDACTED",
      "systemUsername": "Guilhem Fanton"
    },
    "p2p": {
      "connectedPeers": "8"
    },
    "orbitdb": {
      "accountMetadata": {
        "progress": "4",
        "maximum": "4"
      }
    }
  },
  "messenger": {
    "protocolInSameProcess": true,
    "db": {
      "accounts": "1",
      "members": "1",
      "devices": "1"
    }
  }
}
```

### `--help`

[embedmd]:# (.tmp/berty-usage.txt console)
```console
foo@bar:~$ berty -h
USAGE
  berty [global flags] <subcommand> [flags] [args...]

SUBCOMMANDS
  daemon        start a full Berty instance (Berty Protocol + Berty Messenger)
  mini          start a terminal-based mini berty client (not fully compatible with the app)
  banner        print the Berty banner of the day
  version       print software version
  info          display system info
  groupinit     initialize a new multi-member group
  share-invite  share invite link on your terminal or in the dev channel on Discord
  token-server  token server, a basic token server issuer without auth or logging
  repl-server   replication server
  peers         list peers
  export        export messenger data from the specified berty node
  search        use omnisearch to find information about some things
  remote-logs   stream logs from a remote node

FLAGS
  -log.file ...                                  if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*       zapfilter configuration
  -log.format color                              can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc error+:*  zapfilter configuration for ring
  -log.ring-size 10                              logging ring buffer size in MB
  -log.service berty                             service name, used by the tracer
  -log.tracer ...                                specify "stdout" to output tracing on stdout or <hostname:port> to trace on Jaeger

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty daemon -h
USAGE
  berty [global flags] daemon [flags]

FLAGS
  -config ...                                                             config file (optional)
  -log.file ...                                                           if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*                                zapfilter configuration
  -log.format color                                                       can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc error+:*                           zapfilter configuration for ring
  -log.ring-size 10                                                       logging ring buffer size in MB
  -log.service berty                                                      service name, used by the tracer
  -log.tracer ...                                                         specify "stdout" to output tracing on stdout or <hostname:port> to trace on Jaeger
  -metrics.listener ...                                                   Metrics listener, will enable metrics
  -metrics.pedantic false                                                 Enable Metrics pedantic for debug
  -node.disable-group-monitor false                                       disable group monitoring
  -node.display-name gfanton (cli)                                        display name
  -node.init-timeout 1m0s                                                 maximum time allowed for the initialization
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc                            gRPC API listeners
  -node.no-notif false                                                    disable desktop notifications
  -node.rebuild-db false                                                  reconstruct messenger DB from OrbitDB logs
  -node.restore-export-path ...                                           inits node from a specified export path
  -p2p.ble true                                                           if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.max-backoff 10m0s                                                  maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 1m0s                                                   minimum p2p backoff duration
  -p2p.multipeer-connectivity true                                        if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/gfanton/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -tor.binary-path ...                                                    if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                                                      changes the behavior of libp2p regarding tor, see advanced help for more details

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,/ip4/0.0.0.0/udp/0/quic,/ip6/::/udp/0/quic,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/51.159.21.214/tcp/4040/p2p/QmdT7Amhhn...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)
  -tor.mode=disabled                     tor is completely disabled
  -tor.mode=optional                     tor is added to the list of existing transports and can be used to contact other tor-ready nodes
  -tor.mode=required                     tor is the only available transport; you can only communicate with other tor-ready nodes

foo@bar:~$ berty mini -h
USAGE
  berty [global flags] mini [flags]

FLAGS
  -config ...                                                             config file (optional)
  -log.file ...                                                           if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*                                zapfilter configuration
  -log.format color                                                       can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc error+:*                           zapfilter configuration for ring
  -log.ring-size 10                                                       logging ring buffer size in MB
  -log.service berty                                                      service name, used by the tracer
  -log.tracer ...                                                         specify "stdout" to output tracing on stdout or <hostname:port> to trace on Jaeger
  -metrics.listener ...                                                   Metrics listener, will enable metrics
  -metrics.pedantic false                                                 Enable Metrics pedantic for debug
  -mini.group ...                                                         group to join, leave empty to create a new group
  -node.disable-group-monitor false                                       disable group monitoring
  -node.display-name gfanton (cli)                                        display name
  -node.init-timeout 1m0s                                                 maximum time allowed for the initialization
  -node.listeners ...                                                     gRPC API listeners
  -node.no-notif false                                                    disable desktop notifications
  -node.rebuild-db false                                                  reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                                                   remote Berty gRPC API address
  -node.restore-export-path ...                                           inits node from a specified export path
  -p2p.ble true                                                           if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.max-backoff 10m0s                                                  maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 1m0s                                                   minimum p2p backoff duration
  -p2p.multipeer-connectivity true                                        if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/gfanton/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -tor.binary-path ...                                                    if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                                                      changes the behavior of libp2p regarding tor, see advanced help for more details

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,/ip4/0.0.0.0/udp/0/quic,/ip6/::/udp/0/quic,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/51.159.21.214/tcp/4040/p2p/QmdT7Amhhn...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)
  -tor.mode=disabled                     tor is completely disabled
  -tor.mode=optional                     tor is added to the list of existing transports and can be used to contact other tor-ready nodes
  -tor.mode=required                     tor is the only available transport; you can only communicate with other tor-ready nodes

foo@bar:~$ berty banner -h
USAGE
  berty banner [flags]

FLAGS
  -config ...                                    config file (optional)
  -light false                                   light mode
  -log.file ...                                  if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*       zapfilter configuration
  -log.format color                              can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc error+:*  zapfilter configuration for ring
  -log.ring-size 10                              logging ring buffer size in MB
  -log.service berty                             service name, used by the tracer
  -log.tracer ...                                specify "stdout" to output tracing on stdout or <hostname:port> to trace on Jaeger
  -random false                                  pick a random quote

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty version -h
USAGE
  berty version

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty info -h
USAGE
  berty [global flags] info [flags]

FLAGS
  -config ...                                                             config file (optional)
  -info.anonymize false                                                   anonymize output for sharing
  -info.refresh 0s                                                        refresh every DURATION (0: no refresh)
  -log.file ...                                                           if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*                                zapfilter configuration
  -log.format color                                                       can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc error+:*                           zapfilter configuration for ring
  -log.ring-size 10                                                       logging ring buffer size in MB
  -log.service berty                                                      service name, used by the tracer
  -log.tracer ...                                                         specify "stdout" to output tracing on stdout or <hostname:port> to trace on Jaeger
  -node.disable-group-monitor false                                       disable group monitoring
  -node.display-name gfanton (cli)                                        display name
  -node.no-notif false                                                    disable desktop notifications
  -node.rebuild-db false                                                  reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                                                   remote Berty gRPC API address
  -node.restore-export-path ...                                           inits node from a specified export path
  -p2p.ble true                                                           if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.max-backoff 10m0s                                                  maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 1m0s                                                   minimum p2p backoff duration
  -p2p.multipeer-connectivity true                                        if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/gfanton/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -tor.binary-path ...                                                    if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                                                      changes the behavior of libp2p regarding tor, see advanced help for more details

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,/ip4/0.0.0.0/udp/0/quic,/ip6/::/udp/0/quic,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/51.159.21.214/tcp/4040/p2p/QmdT7Amhhn...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)
  -tor.mode=disabled                     tor is completely disabled
  -tor.mode=optional                     tor is added to the list of existing transports and can be used to contact other tor-ready nodes
  -tor.mode=required                     tor is the only available transport; you can only communicate with other tor-ready nodes

foo@bar:~$ berty groupinit -h
USAGE
  berty groupinit

FLAGS
  -config ...                                    config file (optional)
  -log.file ...                                  if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*       zapfilter configuration
  -log.format color                              can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc error+:*  zapfilter configuration for ring
  -log.ring-size 10                              logging ring buffer size in MB
  -log.service berty                             service name, used by the tracer
  -log.tracer ...                                specify "stdout" to output tracing on stdout or <hostname:port> to trace on Jaeger
  -no-qr false                                   do not print the QR code in terminal
  -passphrase ...                                optional encryption passphrase

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty share-invite -h
USAGE
  berty [global flags] share-invite [flags]

FLAGS
  -config ...                                                             config file (optional)
  -dev-channel false                                                      post qrcode on dev channel
  -log.file ...                                                           if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*                                zapfilter configuration
  -log.format color                                                       can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc error+:*                           zapfilter configuration for ring
  -log.ring-size 10                                                       logging ring buffer size in MB
  -log.service berty                                                      service name, used by the tracer
  -log.tracer ...                                                         specify "stdout" to output tracing on stdout or <hostname:port> to trace on Jaeger
  -name ...                                                               override display name
  -no-qr false                                                            do not print the QR code in terminal
  -node.disable-group-monitor false                                       disable group monitoring
  -node.display-name gfanton (cli)                                        display name
  -node.no-notif false                                                    disable desktop notifications
  -node.rebuild-db false                                                  reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                                                   remote Berty gRPC API address
  -node.restore-export-path ...                                           inits node from a specified export path
  -p2p.ble true                                                           if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.max-backoff 10m0s                                                  maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 1m0s                                                   minimum p2p backoff duration
  -p2p.multipeer-connectivity true                                        if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -passphrase ...                                                         optional encryption passphrase
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/gfanton/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -tor.binary-path ...                                                    if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                                                      changes the behavior of libp2p regarding tor, see advanced help for more details

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,/ip4/0.0.0.0/udp/0/quic,/ip6/::/udp/0/quic,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/51.159.21.214/tcp/4040/p2p/QmdT7Amhhn...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)
  -tor.mode=disabled                     tor is completely disabled
  -tor.mode=optional                     tor is added to the list of existing transports and can be used to contact other tor-ready nodes
  -tor.mode=required                     tor is the only available transport; you can only communicate with other tor-ready nodes

foo@bar:~$ berty token-server -h
USAGE
  berty [global flags] token-server [flags]

FLAGS
  -auth.secret ...                               base64 encoded secret
  -auth.sk ...                                   base64 encoded signature key
  -config ...                                    config file (optional)
  -generate false                                generate a single token and output it on stdout
  -http.listener 127.0.0.1:8080                  http listener
  -log.file ...                                  if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*       zapfilter configuration
  -log.format color                              can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc error+:*  zapfilter configuration for ring
  -log.ring-size 10                              logging ring buffer size in MB
  -log.service berty                             service name, used by the tracer
  -log.tracer ...                                specify "stdout" to output tracing on stdout or <hostname:port> to trace on Jaeger
  -no-click false                                disable the login screen and redirect to the next token step directly
  -svc ...                                       comma separated list of supported services as name@ip:port

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty repl-server -h
USAGE
  berty [global flags] repl-server [flags]

FLAGS
  -config ...                                                             config file (optional)
  -log.file ...                                                           if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*                                zapfilter configuration
  -log.format color                                                       can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc error+:*                           zapfilter configuration for ring
  -log.ring-size 10                                                       logging ring buffer size in MB
  -log.service berty                                                      service name, used by the tracer
  -log.tracer ...                                                         specify "stdout" to output tracing on stdout or <hostname:port> to trace on Jaeger
  -node.auth-pk ...                                                       Protocol API Authentication Public Key (base64 encoded)
  -node.auth-secret ...                                                   Protocol API Authentication Secret (base64 encoded)
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc                            gRPC API listeners
  -p2p.ble true                                                           if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.max-backoff 10m0s                                                  maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 1m0s                                                   minimum p2p backoff duration
  -p2p.multipeer-connectivity true                                        if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/gfanton/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -tor.binary-path ...                                                    if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                                                      changes the behavior of libp2p regarding tor, see advanced help for more details

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,/ip4/0.0.0.0/udp/0/quic,/ip6/::/udp/0/quic,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/51.159.21.214/tcp/4040/p2p/QmdT7Amhhn...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)
  -tor.mode=disabled                     tor is completely disabled
  -tor.mode=optional                     tor is added to the list of existing transports and can be used to contact other tor-ready nodes
  -tor.mode=required                     tor is the only available transport; you can only communicate with other tor-ready nodes

foo@bar:~$ berty peers -h
USAGE
  berty [global flags] peers [flags]

FLAGS
  -config ...                                                             config file (optional)
  -log.file ...                                                           if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*                                zapfilter configuration
  -log.format color                                                       can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc error+:*                           zapfilter configuration for ring
  -log.ring-size 10                                                       logging ring buffer size in MB
  -log.service berty                                                      service name, used by the tracer
  -log.tracer ...                                                         specify "stdout" to output tracing on stdout or <hostname:port> to trace on Jaeger
  -node.remote-addr ...                                                   remote Berty gRPC API address
  -p2p.ble true                                                           if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.max-backoff 10m0s                                                  maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 1m0s                                                   minimum p2p backoff duration
  -p2p.multipeer-connectivity true                                        if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -peers.refresh 1s                                                       refresh every DURATION (0: no refresh)
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/gfanton/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -tor.binary-path ...                                                    if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                                                      changes the behavior of libp2p regarding tor, see advanced help for more details

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,/ip4/0.0.0.0/udp/0/quic,/ip6/::/udp/0/quic,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/51.159.21.214/tcp/4040/p2p/QmdT7Amhhn...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)
  -tor.mode=disabled                     tor is completely disabled
  -tor.mode=optional                     tor is added to the list of existing transports and can be used to contact other tor-ready nodes
  -tor.mode=required                     tor is the only available transport; you can only communicate with other tor-ready nodes

foo@bar:~$ berty export -h
USAGE
  berty [global flags] export [flags]

FLAGS
  -config ...                                                             config file (optional)
  -export-path ...                                                        path of the export tarball
  -log.file ...                                                           if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*                                zapfilter configuration
  -log.format color                                                       can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc error+:*                           zapfilter configuration for ring
  -log.ring-size 10                                                       logging ring buffer size in MB
  -log.service berty                                                      service name, used by the tracer
  -log.tracer ...                                                         specify "stdout" to output tracing on stdout or <hostname:port> to trace on Jaeger
  -node.disable-group-monitor false                                       disable group monitoring
  -node.display-name gfanton (cli)                                        display name
  -node.no-notif false                                                    disable desktop notifications
  -node.rebuild-db false                                                  reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                                                   remote Berty gRPC API address
  -node.restore-export-path ...                                           inits node from a specified export path
  -p2p.ble true                                                           if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.max-backoff 10m0s                                                  maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 1m0s                                                   minimum p2p backoff duration
  -p2p.multipeer-connectivity true                                        if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/gfanton/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -tor.binary-path ...                                                    if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                                                      changes the behavior of libp2p regarding tor, see advanced help for more details

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,/ip4/0.0.0.0/udp/0/quic,/ip6/::/udp/0/quic,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/51.159.21.214/tcp/4040/p2p/QmdT7Amhhn...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)
  -tor.mode=disabled                     tor is completely disabled
  -tor.mode=optional                     tor is added to the list of existing transports and can be used to contact other tor-ready nodes
  -tor.mode=required                     tor is the only available transport; you can only communicate with other tor-ready nodes

foo@bar:~$ berty search -h
USAGE
  berty [global flags] search QUERY

Currently parsers and engines available for omnisearch are :
- Berty invite parser (parse berty's group and one to one invites)
- Berty swiper engine (find peers (peer.AddrInfo) from their invites)

Example:
berty omnisearch https://berty.tech/id#key=CiDnVU4YlFPkjTbSggoZAWbFdAIsnuv5qoruQDyN_NB8rBIgfrT2x0wzMjiK4kBXnPYStGxW2Hssk8UyYfW8ITJbEFg&name=Example

FLAGS
  -node.disable-group-monitor false                                       disable group monitoring
  -node.display-name gfanton (cli)                                        display name
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc                            gRPC API listeners
  -node.no-notif false                                                    disable desktop notifications
  -node.rebuild-db false                                                  reconstruct messenger DB from OrbitDB logs
  -node.restore-export-path ...                                           inits node from a specified export path
  -p2p.ble true                                                           if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.max-backoff 10m0s                                                  maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 1m0s                                                   minimum p2p backoff duration
  -p2p.multipeer-connectivity true                                        if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/gfanton/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -tor.binary-path ...                                                    if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                                                      changes the behavior of libp2p regarding tor, see advanced help for more details

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,/ip4/0.0.0.0/udp/0/quic,/ip6/::/udp/0/quic,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/51.159.21.214/tcp/4040/p2p/QmdT7Amhhn...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)
  -tor.mode=disabled                     tor is completely disabled
  -tor.mode=optional                     tor is added to the list of existing transports and can be used to contact other tor-ready nodes
  -tor.mode=required                     tor is the only available transport; you can only communicate with other tor-ready nodes

foo@bar:~$ berty remote-logs -h
USAGE
  berty [global flags] remote-logs

FLAGS
  -node.remote-addr ...  remote Berty gRPC API address

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter
```

## Other Binaries

### `rdvp`

[embedmd]:# (.tmp/rdvp-usage.txt console)
```console
foo@bar:~$ rdvp -h
USAGE
  rdvp [global flags] <subcommand>

SUBCOMMANDS
  serve
  genkey
  sharekey

FLAGS
  -log.file stderr      if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:*  logged namespaces
  -log.format color     if specified, will override default log format

foo@bar:~$ rdvp serve -h
USAGE
  rdvp [global flags] serve [flags]

EXAMPLE
  rdvp genkey > rdvp.key
  rdvp serve -pk `cat rdvp.key` -db ./rdvp-store

FLAGS
  -announce ...                                        addrs that will be announce by this server
  -config ...                                          config file (optional)
  -db :memory:                                         rdvp sqlite URN
  -l /ip4/0.0.0.0/tcp/4040,/ip4/0.0.0.0/udp/4141/quic  lists of listeners of (m)addrs separate by a comma
  -metrics ...                                         metrics listener, if empty will disable metrics
  -pk ...                                              private key (generated by `rdvp genkey`)

foo@bar:~$ rdvp genkey -h
USAGE
  genkey

FLAGS
  -length 2048   The length (in bits) of the key generated.
  -type Ed25519  Type of the private key generated, one of : Ed25519, ECDSA, Secp256k1, RSA

foo@bar:~$ rdvp sharekey -h
USAGE
  rdvp [global flags] sharekey -pk PK

FLAGS
  -pk ...  private key (generated by `rdvp genkey`)
```

### `welcomebot`

[embedmd]:# (.tmp/welcomebot-usage.txt console)
```console
foo@bar:~$ welcomebot -h
Usage of welcomebot:
  -addr string
        remote 'berty daemon' address (default "127.0.0.1:9091")
  -display-name string
        bot's display name (default "gfanton (welcomebot)")
  -log-format string
        console, json, light-console, light-json (default "console")
  -staff-conversation-link string
        link of the staff's conversation to join
  -store string
        store file path (default "./welcomebot.store")
```
