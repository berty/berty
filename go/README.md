# Berty `go/`

[![go.dev reference](https://img.shields.io/badge/go.dev-reference-007d9c?logo=go&logoColor=white)](https://pkg.go.dev/berty.tech/berty/v2)
[![Code coverage](https://codecov.io/gh/berty/berty/branch/master/graph/badge.svg?token=rBPpNHNNow)](https://codecov.io/gh/berty/berty)

__Please, read the main [`README.md`](../README.md) file first.__

This folder contains most of the go code needed by the project.

## Download

Main binary: `go get -u berty.tech/berty/v2/go/cmd/berty`

Fetch library to your go cache: `go get -u berty.tech/berty/v2`

## Main components

* [`./cmd/...`](./cmd): binaries / entrypoints
    * `go get -v berty.tech/berty/v2/go/cmd/berty`
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
...
```

Now you can interact with the daemon API.

### Mini

TODO

### Share Invite

[embedmd]:# (.tmp/berty-share-invite.txt console)
```console
foo@bar:~$ berty share-invite
█████████████████████████████████████████████████
█████████████████████████████████████████████████
████ ▄▄▄▄▄ ██▄█ ▀▄▀▀▀ ▀ ▄▄█     █▄▄▀▀█ ▄▄▄▄▄ ████
████ █   █ █▄█▄█   ▄ █▀▀█▀ ▀██  ▄█ █ █ █   █ ████
████ █▄▄▄█ ██▄▄ █ ▄▀ ▀  ▀▀▀▀██▀ ██▄▀██ █▄▄▄█ ████
████▄▄▄▄▄▄▄█ ▀▄▀▄▀▄▀▄▀▄▀ ▀ █▄▀ ▀ ▀▄█▄█▄▄▄▄▄▄▄████
████▄ ▄█▄▄▄▄▄██ ▄▀▀█ █▀█ ▄▀▀▀ ██▀▄██   ▀█▀▄▀█████
████ ▀█▄▀█▄ ▀ ▄▄▀▀ ▀█ ▀▀▄▀ ▀█ ▄▀▄▀███▄ █▄██ ▄████
████  ▄▀▄▀▄██▀█▀ █ ▀ █▄█  ▄       █▀▀   █▄▀▄ ████
████  ▀███▄█▀██▄  ▀▄ ▀ ▀ ▀█▀▀▀ ▀▄ ███▄▀███▄▄▄████
████▄ ▄ █▀▄█ █▄ ▀▄█  ▄ █▀ █  ▄▀▀  █▀ ▀ ██▄▄▄ ████
█████▄█▄ ▀▄▀▀▄▄▀█▄█▀▄▄██▀ █▀ ▀ █▄▀▀▀▀▄▄  █▄▀▄████
████▄▀█▀▀▀▄▀ ▄ ▀█▀█▀█▀██ ▄█▀ ▀█▄▀▀▀ ▀   █▄█▀▀████
███████▄▀▄▄▀▀▄▀▀█ █▀█▀▀▀▀ ▀█  ▀██ ▄▀██  ▄▄█  ████
████ ▀▀▀ ▀▄█▄ ▀█▀ ▀▀▀▀█▄ ▄██  █▄ ▀█▄█  ██▀ █ ████
█████▄▀▄█▄▄▀▄▄▀██▀ ▀ ▀ ▀▄ ██ ▀ ██ █▀█▀▀▄▀ ▄█ ████
████▄▄ ▀▀▀▄ ▀▀▀▀ █ ▀ ▀ ▄█▄██ ▀▀█ ▄█▄ ▄ ██ █▀ ████
████▄▀  █▄▄▀   ▄ ▀▄▄  ▄▀▀▀█▀█▀▀█  ▄█ █▀ ▄██▄▄████
████▄█▄▄▄█▄▄ █  ▀██ ▀▄▀█▀▀█▀▀█▀▄█  ▄ ▄▄▄  ▀▄ ████
████ ▄▄▄▄▄ █ ▀ █▀▄█▀▄▄█▀█▀ ▀▄▀▄█   ▄ █▄█ ▀█  ████
████ █   █ █▄▄▀▀███▀█▀█▄  █ ▀▀██ ▀▀█▄▄▄  ▀█▄ ████
████ █▄▄▄█ █ ▄ ▀█▀ ▀█  ▀▀▀██ ▀ █▀ ▄ ▄███ ▄▄ ▄████
████▄▄▄▄▄▄▄█▄███▄▄███▄▄▄█████▄▄████▄▄▄▄▄█▄█▄▄████
█████████████████████████████████████████████████
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
html url: https://berty.tech/id#key=CiBfbJ2V3jHrgaweQ8VdIU5tolDYxgpd4Y5Bs0TPAkX_fxIgSqVs84LWBqqa67ejuNiSRZleVcWnkpDlr9AXFQfMBJY&name=demo
```

### Info

[embedmd]:# (.tmp/berty-info.txt console)
```console
foo@bar:~$ berty info
{
  "protocol": {
    "process": {
      "version": "v2.194.5-dev.4+g69822b3e",
      "vcsRef": "69822b3e",
      "uptimeMs": "29",
      "userCpuTimeMs": "1369",
      "systemCpuTimeMs": "182",
      "startedAt": "1604065152",
      "rlimitCur": "1024",
      "numGoroutine": "556",
      "nofile": "43",
      "numCpu": "12",
      "goVersion": "go1.15.2",
      "operatingSystem": "linux",
      "hostName": "REDACTED",
      "arch": "amd64",
      "rlimitMax": "1048576",
      "pid": "4166",
      "ppid": "4165",
      "priority": "20",
      "uid": "1000",
      "workingDir": "REDACTED",
      "systemUsername": "anon#1337"
    },
    "p2p": {
      "connectedPeers": "12"
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
      "accounts": "1"
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

FLAGS
  -log.file ...                             if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*  zapfilter configuration
  -log.format color                         can be: json, console, color, light-console, light-color
  -log.service berty                        service name, used by the tracer
  -log.tracer ...                           specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty daemon -h
USAGE
  berty [global flags] daemon [flags]

FLAGS
  -log.file ...                                    if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters :default: debug+:bty* debug+:*gorm  zapfilter configuration
  -log.format color                                can be: json, console, color, light-console, light-color
  -log.service berty                               service name, used by the tracer
  -log.tracer ...                                  specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger
  -metrics.listener ...                            Metrics listener, will enable metrics
  -metrics.pedantic false                          Enable Metrics pedantic for debug
  -node.display-name moul (cli)                    display name
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc     gRPC API listeners
  -node.no-notif false                             disable desktop notifications
  -node.rebuild-db false                           reconstruct messenger DB from OrbitDB logs
  -node.restore-export-path ...                    inits node from a specified export path
  -p2p.disable-ipfs-network false                  disable as much networking feature as possible, useful during development
  -p2p.ipfs-announce ...                           IPFS announce addrs
  -p2p.ipfs-api-listeners ...                      IPFS API listeners
  -p2p.ipfs-no-announce ...                        IPFS exclude announce addrs
  -p2p.local-discovery true                        if true local discovery will be enabled
  -p2p.max-backoff 1m0s                            maximum p2p backoff duration
  -p2p.min-backoff 1s                              minimum p2p backoff duration
  -p2p.multipeer-connectivity true                 if true Multipeer Connectivity will be enabled
  -p2p.rdvp :default:                              list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.swarm-listeners :default:                   IPFS swarm listeners
  -p2p.webui-listener :3999                        IPFS WebUI listener
  -preset ...                                      applies various default values, see ADVANCED section below
  -store.dir /home/moul/.config/berty-tech/berty   root datastore directory
  -store.fileio false                              enable FileIO Option, files will be loaded using standard I/O
  -store.inmem false                               disable datastore persistence
  -tor.binary-path ...                             if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                               if true tor will be enabled

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.local-discovery=false -p2p.multipeer-connectivity=false
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
  -log.file ...                                    if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters :default: debug+:bty* debug+:*gorm  zapfilter configuration
  -log.format color                                can be: json, console, color, light-console, light-color
  -log.service berty                               service name, used by the tracer
  -log.tracer ...                                  specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger
  -metrics.listener ...                            Metrics listener, will enable metrics
  -metrics.pedantic false                          Enable Metrics pedantic for debug
  -mini.group ...                                  group to join, leave empty to create a new group
  -node.display-name moul (cli)                    display name
  -node.listeners ...                              gRPC API listeners
  -node.no-notif false                             disable desktop notifications
  -node.rebuild-db false                           reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                            remote Berty gRPC API address
  -node.restore-export-path ...                    inits node from a specified export path
  -p2p.disable-ipfs-network false                  disable as much networking feature as possible, useful during development
  -p2p.ipfs-announce ...                           IPFS announce addrs
  -p2p.ipfs-api-listeners ...                      IPFS API listeners
  -p2p.ipfs-no-announce ...                        IPFS exclude announce addrs
  -p2p.local-discovery true                        if true local discovery will be enabled
  -p2p.max-backoff 1m0s                            maximum p2p backoff duration
  -p2p.min-backoff 1s                              minimum p2p backoff duration
  -p2p.multipeer-connectivity true                 if true Multipeer Connectivity will be enabled
  -p2p.rdvp :default:                              list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.swarm-listeners :default:                   IPFS swarm listeners
  -p2p.webui-listener ...                          IPFS WebUI listener
  -preset ...                                      applies various default values, see ADVANCED section below
  -store.dir /home/moul/.config/berty-tech/berty   root datastore directory
  -store.fileio false                              enable FileIO Option, files will be loaded using standard I/O
  -store.inmem false                               disable datastore persistence
  -tor.binary-path ...                             if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                               if true tor will be enabled

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.local-discovery=false -p2p.multipeer-connectivity=false
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
  -light false                                     light mode
  -log.file ...                                    if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters :default: debug+:bty* debug+:*gorm  zapfilter configuration
  -log.format color                                can be: json, console, color, light-console, light-color
  -log.service berty                               service name, used by the tracer
  -log.tracer ...                                  specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger
  -random false                                    pick a random quote

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
  -info.anonymize false                            anonymize output for sharing
  -info.refresh 0s                                 refresh every DURATION (0: no refresh)
  -log.file ...                                    if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters :default: debug+:bty* debug+:*gorm  zapfilter configuration
  -log.format color                                can be: json, console, color, light-console, light-color
  -log.service berty                               service name, used by the tracer
  -log.tracer ...                                  specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger
  -node.display-name moul (cli)                    display name
  -node.no-notif false                             disable desktop notifications
  -node.rebuild-db false                           reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                            remote Berty gRPC API address
  -node.restore-export-path ...                    inits node from a specified export path
  -p2p.disable-ipfs-network false                  disable as much networking feature as possible, useful during development
  -p2p.ipfs-announce ...                           IPFS announce addrs
  -p2p.ipfs-api-listeners ...                      IPFS API listeners
  -p2p.ipfs-no-announce ...                        IPFS exclude announce addrs
  -p2p.local-discovery true                        if true local discovery will be enabled
  -p2p.max-backoff 1m0s                            maximum p2p backoff duration
  -p2p.min-backoff 1s                              minimum p2p backoff duration
  -p2p.multipeer-connectivity true                 if true Multipeer Connectivity will be enabled
  -p2p.rdvp :default:                              list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.swarm-listeners :default:                   IPFS swarm listeners
  -preset ...                                      applies various default values, see ADVANCED section below
  -store.dir /home/moul/.config/berty-tech/berty   root datastore directory
  -store.fileio false                              enable FileIO Option, files will be loaded using standard I/O
  -store.inmem false                               disable datastore persistence
  -tor.binary-path ...                             if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                               if true tor will be enabled

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.local-discovery=false -p2p.multipeer-connectivity=false
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
  -log.file ...                                    if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters :default: debug+:bty* debug+:*gorm  zapfilter configuration
  -log.format color                                can be: json, console, color, light-console, light-color
  -log.service berty                               service name, used by the tracer
  -log.tracer ...                                  specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty share-invite -h
USAGE
  berty [global flags] share-invite [flags]

FLAGS
  -dev-channel false                               post qrcode on dev channel
  -log.file ...                                    if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters :default: debug+:bty* debug+:*gorm  zapfilter configuration
  -log.format color                                can be: json, console, color, light-console, light-color
  -log.service berty                               service name, used by the tracer
  -log.tracer ...                                  specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger
  -no-term false                                   do not print the QR code in terminal
  -node.display-name moul (cli)                    display name
  -node.no-notif false                             disable desktop notifications
  -node.rebuild-db false                           reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                            remote Berty gRPC API address
  -node.restore-export-path ...                    inits node from a specified export path
  -p2p.disable-ipfs-network false                  disable as much networking feature as possible, useful during development
  -p2p.ipfs-announce ...                           IPFS announce addrs
  -p2p.ipfs-api-listeners ...                      IPFS API listeners
  -p2p.ipfs-no-announce ...                        IPFS exclude announce addrs
  -p2p.local-discovery true                        if true local discovery will be enabled
  -p2p.max-backoff 1m0s                            maximum p2p backoff duration
  -p2p.min-backoff 1s                              minimum p2p backoff duration
  -p2p.multipeer-connectivity true                 if true Multipeer Connectivity will be enabled
  -p2p.rdvp :default:                              list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.swarm-listeners :default:                   IPFS swarm listeners
  -preset ...                                      applies various default values, see ADVANCED section below
  -store.dir /home/moul/.config/berty-tech/berty   root datastore directory
  -store.fileio false                              enable FileIO Option, files will be loaded using standard I/O
  -store.inmem false                               disable datastore persistence
  -tor.binary-path ...                             if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                               if true tor will be enabled

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.local-discovery=false -p2p.multipeer-connectivity=false
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
  -auth.secret ...                                 base64 encoded secret
  -auth.sk ...                                     base64 encoded signature key
  -http.listener 127.0.0.1:8080                    http listener
  -log.file ...                                    if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters :default: debug+:bty* debug+:*gorm  zapfilter configuration
  -log.format color                                can be: json, console, color, light-console, light-color
  -log.service berty                               service name, used by the tracer
  -log.tracer ...                                  specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger
  -svc ...                                         comma separated list of supported services as name@ip:port

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty repl-server -h
USAGE
  berty [global flags] repl-server [flags]

FLAGS
  -log.file ...                                    if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters :default: debug+:bty* debug+:*gorm  zapfilter configuration
  -log.format color                                can be: json, console, color, light-console, light-color
  -log.service berty                               service name, used by the tracer
  -log.tracer ...                                  specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger
  -node.auth-pk ...                                Protocol API Authentication Public Key (base64 encoded)
  -node.auth-secret ...                            Protocol API Authentication Secret (base64 encoded)
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc     gRPC API listeners
  -p2p.disable-ipfs-network false                  disable as much networking feature as possible, useful during development
  -p2p.ipfs-announce ...                           IPFS announce addrs
  -p2p.ipfs-api-listeners ...                      IPFS API listeners
  -p2p.ipfs-no-announce ...                        IPFS exclude announce addrs
  -p2p.local-discovery true                        if true local discovery will be enabled
  -p2p.max-backoff 1m0s                            maximum p2p backoff duration
  -p2p.min-backoff 1s                              minimum p2p backoff duration
  -p2p.multipeer-connectivity true                 if true Multipeer Connectivity will be enabled
  -p2p.rdvp :default:                              list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.swarm-listeners :default:                   IPFS swarm listeners
  -p2p.webui-listener :3999                        IPFS WebUI listener
  -preset ...                                      applies various default values, see ADVANCED section below
  -store.dir /home/moul/.config/berty-tech/berty   root datastore directory
  -store.fileio false                              enable FileIO Option, files will be loaded using standard I/O
  -store.inmem false                               disable datastore persistence
  -tor.binary-path ...                             if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                               if true tor will be enabled

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.local-discovery=false -p2p.multipeer-connectivity=false
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
  -log.file ...                                    if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters :default: debug+:bty* debug+:*gorm  zapfilter configuration
  -log.format color                                can be: json, console, color, light-console, light-color
  -log.service berty                               service name, used by the tracer
  -log.tracer ...                                  specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger
  -node.remote-addr ...                            remote Berty gRPC API address
  -p2p.disable-ipfs-network false                  disable as much networking feature as possible, useful during development
  -p2p.ipfs-announce ...                           IPFS announce addrs
  -p2p.ipfs-api-listeners ...                      IPFS API listeners
  -p2p.ipfs-no-announce ...                        IPFS exclude announce addrs
  -p2p.local-discovery true                        if true local discovery will be enabled
  -p2p.max-backoff 1m0s                            maximum p2p backoff duration
  -p2p.min-backoff 1s                              minimum p2p backoff duration
  -p2p.multipeer-connectivity true                 if true Multipeer Connectivity will be enabled
  -p2p.rdvp :default:                              list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.swarm-listeners :default:                   IPFS swarm listeners
  -peers.refresh 1s                                refresh every DURATION (0: no refresh)
  -preset ...                                      applies various default values, see ADVANCED section below
  -store.dir /home/moul/.config/berty-tech/berty   root datastore directory
  -store.fileio false                              enable FileIO Option, files will be loaded using standard I/O
  -store.inmem false                               disable datastore persistence
  -tor.binary-path ...                             if set berty will use this external tor binary instead of his builtin one
  -tor.mode disabled                               if true tor will be enabled

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.local-discovery=false -p2p.multipeer-connectivity=false
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,/ip4/0.0.0.0/udp/0/quic,/ip6/::/udp/0/quic,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/51.159.21.214/tcp/4040/p2p/QmdT7Amhhn...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)
  -tor.mode=disabled                     tor is completely disabled
  -tor.mode=optional                     tor is added to the list of existing transports and can be used to contact other tor-ready nodes
  -tor.mode=required                     tor is the only available transport; you can only communicate with other tor-ready nodes
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
  -db :memory:                                         rdvp sqlite URN
  -l /ip4/0.0.0.0/tcp/4040,/ip4/0.0.0.0/udp/4141/quic  lists of listeners of (m)addrs separate by a comma
  -pk ...                                              private key (generated by `rdvp genkey`)

foo@bar:~$ rdvp genkey -h
USAGE
  genkey

FLAGS
  -length 2048   The length (in bits) of the key generated.
  -type Ed25519  Type of the private key generated, one of : Ed25519, ECDSA, Secp256k1, RSA
```

### `betabot`

[embedmd]:# (.tmp/betabot-usage.txt console)
```console
foo@bar:~$ betabot -h
Usage of betabot:
  -addr string
    	remote 'berty daemon' address (default "127.0.0.1:9091")
  -display-name string
    	bot's display name (default "moul (bot)")
  -staff-conversation-link string
    	link of the staff's conversation to join
  -store string
    	store file path (default "./betabot.store")
```
