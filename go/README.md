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
This part is so you can quickly use Berty Mini in your terminal, this is not an in-depth explanation about all the commands.

To open Berty Mini run:
```console
foo@bar:~$ berty mini
```
Or in the `berty/go/cmd/berty` folder enter
```console
foo@bar:~$ go run . mini
```

#### Help
`/help` To get all available commands in berty mini, and what they do.

#### Contact
`/contact share qr` To get a QR code you can scan with a phone. </br>
`/contact share qr` To get a QR code you can scan with a phone. </br>
`/contact accept all` To accept all incomming contact requests.

#### Navigation
For details, use `/keyboard`

Most important: </br>
`ctrl + n` To go to the chats below. </br>
`ctrl + p` To go to the chats above.

Alternatively you can use the following: </br>
`ctrl + arrow down` To go to the chat below. </br>
`ctrl + arrow up` To go to the chat above.

Closing Berty mini: </br>
`ctrl + c` To exit Berty mini, or use `esc`.

### Share Invite

[embedmd]:# (.tmp/berty-share-invite.txt console)
```console
foo@bar:~$ berty share-invite
https://berty.tech/id#contact/oZBLFX8N5b8YvBsaFgLtJDkHPbvkRUVn1kGiKop2cFyUPoqCChedZizRzDZybrd6AosgxhhaBzd4VhN7FviNfyh9qfBRJWc/name=demo
```

### Info

[embedmd]:# (.tmp/berty-info.txt console)
```console
foo@bar:~$ berty info
{
  "protocol": {
    "process": {
      "version": "v2.439.1",
      "vcsRef": "96e42dd09",
      "uptimeMs": "28",
      "userCpuTimeMs": "530",
      "systemCpuTimeMs": "188",
      "startedAt": "1669913305",
      "rlimitCur": "1048576",
      "numGoroutine": "391",
      "nofile": "34",
      "numCpu": "4",
      "goVersion": "go1.18.8",
      "operatingSystem": "linux",
      "hostName": "8de9e98ac2df",
      "arch": "arm64",
      "rlimitMax": "1048576",
      "pid": "8332",
      "ppid": "7",
      "priority": "20",
      "workingDir": "/Users/foo/go/src/berty.tech/berty/go",
      "systemUsername": "foo"
    },
    "p2p": {
      "connectedPeers": "4"
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
  daemon          start a full Berty instance (Berty Protocol + Berty Messenger)
  account-daemon  start a full Berty instance (Berty Account)
  mini            start a terminal-based mini berty client (some messaging features not compatible with the app)
  banner          print the Berty banner of the day
  version         print software version
  info            display system info
  groupinit       initialize a new multi-member group
  share-invite    share invite link on your terminal or in the dev channel on Discord
  token-server    token server, a basic token server issuer without auth or logging
  repl-server     replication server
  peers           list peers
  export          export messenger data from the specified berty node
  remote-logs     stream logs from a remote node
  service-key     helper to generate a key for managed services
  push-server     push relay server
  p2p             helper around libp2p
  relay           relay server
  vc-issuer       start a verified credentials issuer service

FLAGS
  -log.file ...                                   log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*  file zapfilter configuration
  -log.filters info+:bty*,-*.grpc,error+:*        stderr zapfilter configuration
  -log.format color                               stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*   ring zapfilter configuration
  -log.ring-size 10                               ring buffer size in MB
  -log.tyber-auto-attach ...                      tyber host addresses to be automatically attached to

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty daemon -h
USAGE
  berty [global flags] daemon [flags]

FLAGS
  -config ...                                                             config file (optional)
  -log.file <store-dir>/logs                                              log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*                          file zapfilter configuration
  -log.filters info+:bty*,-*.grpc,error+:*                                stderr zapfilter configuration
  -log.format color                                                       stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*                           ring zapfilter configuration
  -log.ring-size 10                                                       ring buffer size in MB
  -log.tyber-auto-attach ...                                              tyber host addresses to be automatically attached to
  -metrics.listener ...                                                   Metrics listener, will enable metrics
  -metrics.pedantic false                                                 Enable Metrics pedantic for debug
  -no-banner false                                                        do not print the Berty banner on startup
  -no-qr false                                                            do not print the QR code in terminal on startup
  -no-system-info false                                                   do not print system info on startup
  -node.default-push-token ...                                            base 64 encoded default platform push token
  -node.disable-group-monitor false                                       disable group monitoring
  -node.display-name foo (cli)                                            display name
  -node.init-timeout 1m0s                                                 maximum time allowed for the initialization
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc                            gRPC API listeners
  -node.no-notif false                                                    disable desktop notifications
  -node.rdv-rotation 24h0m0s                                              rendezvous rotation base for node
  -node.rebuild-db false                                                  reconstruct messenger DB from OrbitDB logs
  -node.restore-export-path ...                                           inits node from a specified export path
  -node.service-insecure false                                            use insecure connection on services
  -p2p.autorelay true                                                     enable autorelay, force private reachability
  -p2p.ble false                                                          if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `none`, `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.high-water 200                                                     ConnManager high watermark
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.low-water 150                                                      ConnManager low watermark
  -p2p.max-backoff 1h0m0s                                                 maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 10s                                                    minimum p2p backoff duration
  -p2p.multipeer-connectivity false                                       if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, `:dev:` will add the default devs servers, `:none:` will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-discover true                                               if true enable tinder discovery
  -p2p.tinder-localdiscovery-driver true                                  if true localdiscovery driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -passphrase ...                                                         optional sharing-link encryption passphrase
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/foo/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -store.shared-dir ...                                                   shared root datastore directory

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/52.47.79.109/tcp/4040/p2p/12D3KooWKhU...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)

foo@bar:~$ berty account-daemon -h
USAGE
  berty [global flags] account-daemon [flags]

FLAGS
  -log.file ...                                                           log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*                          file zapfilter configuration
  -log.filters info+:bty*,-*.grpc,error+:*                                stderr zapfilter configuration
  -log.format color                                                       stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*                           ring zapfilter configuration
  -log.ring-size 10                                                       ring buffer size in MB
  -log.tyber-auto-attach ...                                              tyber host addresses to be automatically attached to
  -node.account.listeners /ip4/127.0.0.1/tcp/9092/grpc                    gRPC account API listeners
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc                            gRPC API listeners
  -store.dir /Users/foo/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -store.shared-dir ...                                                   shared root datastore directory

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty mini -h
USAGE
  berty [global flags] mini [flags]

FLAGS
  -config ...                                                             config file (optional)
  -log.file <store-dir>/logs                                              log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*                          file zapfilter configuration
  -log.filters info+:bty*,-*.grpc,error+:*                                stderr zapfilter configuration
  -log.format color                                                       stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*                           ring zapfilter configuration
  -log.ring-size 10                                                       ring buffer size in MB
  -log.tyber-auto-attach ...                                              tyber host addresses to be automatically attached to
  -metrics.listener ...                                                   Metrics listener, will enable metrics
  -metrics.pedantic false                                                 Enable Metrics pedantic for debug
  -mini.group ...                                                         group to join, leave empty to create a new group
  -node.default-push-token ...                                            base 64 encoded default platform push token
  -node.disable-group-monitor false                                       disable group monitoring
  -node.display-name foo (cli)                                        display name
  -node.init-timeout 1m0s                                                 maximum time allowed for the initialization
  -node.listeners ...                                                     gRPC API listeners
  -node.no-notif false                                                    disable desktop notifications
  -node.rdv-rotation 24h0m0s                                              rendezvous rotation base for node
  -node.rebuild-db false                                                  reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                                                   remote Berty gRPC API address
  -node.restore-export-path ...                                           inits node from a specified export path
  -node.service-insecure false                                            use insecure connection on services
  -p2p.autorelay true                                                     enable autorelay, force private reachability
  -p2p.ble false                                                          if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `none`, `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.high-water 200                                                     ConnManager high watermark
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.low-water 150                                                      ConnManager low watermark
  -p2p.max-backoff 1h0m0s                                                 maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 10s                                                    minimum p2p backoff duration
  -p2p.multipeer-connectivity false                                       if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, `:dev:` will add the default devs servers, `:none:` will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-discover true                                               if true enable tinder discovery
  -p2p.tinder-localdiscovery-driver true                                  if true localdiscovery driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/foo/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -store.shared-dir ...                                                   shared root datastore directory

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/52.47.79.109/tcp/4040/p2p/12D3KooWKhU...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)

foo@bar:~$ berty banner -h
USAGE
  berty banner [flags]

FLAGS
  -config ...                                     config file (optional)
  -light false                                    light mode
  -log.file ...                                   log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*  file zapfilter configuration
  -log.filters info+:bty*,-*.grpc,error+:*        stderr zapfilter configuration
  -log.format color                               stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*   ring zapfilter configuration
  -log.ring-size 10                               ring buffer size in MB
  -log.tyber-auto-attach ...                      tyber host addresses to be automatically attached to
  -random false                                   pick a random quote

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty version -h
USAGE
  berty version

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty info -h
USAGE
  berty [global flags] info [flags]

FLAGS
  -config ...                                                             config file (optional)
  -info.anonymize false                                                   anonymize output for sharing
  -info.refresh 0s                                                        refresh every DURATION (0: no refresh)
  -log.file <store-dir>/logs                                              log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*                          file zapfilter configuration
  -log.filters info+:bty*,-*.grpc,error+:*                                stderr zapfilter configuration
  -log.format color                                                       stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*                           ring zapfilter configuration
  -log.ring-size 10                                                       ring buffer size in MB
  -log.tyber-auto-attach ...                                              tyber host addresses to be automatically attached to
  -node.default-push-token ...                                            base 64 encoded default platform push token
  -node.disable-group-monitor false                                       disable group monitoring
  -node.display-name foo (cli)                                        display name
  -node.no-notif false                                                    disable desktop notifications
  -node.rdv-rotation 24h0m0s                                              rendezvous rotation base for node
  -node.rebuild-db false                                                  reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                                                   remote Berty gRPC API address
  -node.restore-export-path ...                                           inits node from a specified export path
  -node.service-insecure false                                            use insecure connection on services
  -p2p.autorelay true                                                     enable autorelay, force private reachability
  -p2p.ble false                                                          if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `none`, `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.high-water 200                                                     ConnManager high watermark
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.low-water 150                                                      ConnManager low watermark
  -p2p.max-backoff 1h0m0s                                                 maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 10s                                                    minimum p2p backoff duration
  -p2p.multipeer-connectivity false                                       if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, `:dev:` will add the default devs servers, `:none:` will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-discover true                                               if true enable tinder discovery
  -p2p.tinder-localdiscovery-driver true                                  if true localdiscovery driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/foo/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -store.shared-dir ...                                                   shared root datastore directory

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/52.47.79.109/tcp/4040/p2p/12D3KooWKhU...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)

foo@bar:~$ berty groupinit -h
USAGE
  berty groupinit

FLAGS
  -config ...                                     config file (optional)
  -log.file ...                                   log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*  file zapfilter configuration
  -log.filters info+:bty*,-*.grpc,error+:*        stderr zapfilter configuration
  -log.format color                               stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*   ring zapfilter configuration
  -log.ring-size 10                               ring buffer size in MB
  -log.tyber-auto-attach ...                      tyber host addresses to be automatically attached to
  -no-qr false                                    do not print the QR code in terminal
  -passphrase ...                                 optional encryption passphrase

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty share-invite -h
USAGE
  berty [global flags] share-invite [flags]

FLAGS
  -config ...                                                             config file (optional)
  -dev-channel false                                                      post qrcode on dev channel
  -log.file <store-dir>/logs                                              log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*                          file zapfilter configuration
  -log.filters error+:*                                                   stderr zapfilter configuration
  -log.format color                                                       stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*                           ring zapfilter configuration
  -log.ring-size 10                                                       ring buffer size in MB
  -log.tyber-auto-attach ...                                              tyber host addresses to be automatically attached to
  -name ...                                                               override display name
  -no-qr false                                                            do not print the QR code in terminal
  -node.default-push-token ...                                            base 64 encoded default platform push token
  -node.disable-group-monitor false                                       disable group monitoring
  -node.display-name foo (cli)                                        display name
  -node.no-notif false                                                    disable desktop notifications
  -node.rdv-rotation 24h0m0s                                              rendezvous rotation base for node
  -node.rebuild-db false                                                  reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                                                   remote Berty gRPC API address
  -node.restore-export-path ...                                           inits node from a specified export path
  -node.service-insecure false                                            use insecure connection on services
  -p2p.autorelay true                                                     enable autorelay, force private reachability
  -p2p.ble false                                                          if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `none`, `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.high-water 200                                                     ConnManager high watermark
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.low-water 150                                                      ConnManager low watermark
  -p2p.max-backoff 1h0m0s                                                 maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 10s                                                    minimum p2p backoff duration
  -p2p.multipeer-connectivity false                                       if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, `:dev:` will add the default devs servers, `:none:` will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-discover true                                               if true enable tinder discovery
  -p2p.tinder-localdiscovery-driver true                                  if true localdiscovery driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -passphrase ...                                                         optional sharing-link encryption passphrase
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/foo/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -store.shared-dir ...                                                   shared root datastore directory

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/52.47.79.109/tcp/4040/p2p/12D3KooWKhU...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)

foo@bar:~$ berty token-server -h
USAGE
  berty [global flags] token-server [flags]

FLAGS
  -auth.secret ...                                base64 encoded secret
  -auth.sk ...                                    base64 encoded signature key
  -config ...                                     config file (optional)
  -generate false                                 generate a single token and output it on stdout
  -http.listener 127.0.0.1:8080                   http listener
  -log.file ...                                   log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*  file zapfilter configuration
  -log.filters info+:bty*,-*.grpc,error+:*        stderr zapfilter configuration
  -log.format color                               stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*   ring zapfilter configuration
  -log.ring-size 10                               ring buffer size in MB
  -log.tyber-auto-attach ...                      tyber host addresses to be automatically attached to
  -no-click false                                 disable the login screen and redirect to the next token step directly
  -privacy-policy-url ...                         url of privacy policies
  -svc ...                                        comma separated list of supported services as name@ip:port

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty repl-server -h
USAGE
  berty [global flags] repl-server [flags]

FLAGS
  -config ...                                                             config file (optional)
  -log.file <store-dir>/logs                                              log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*                          file zapfilter configuration
  -log.filters info+:bty*,-*.grpc,error+:*                                stderr zapfilter configuration
  -log.format color                                                       stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*                           ring zapfilter configuration
  -log.ring-size 10                                                       ring buffer size in MB
  -log.tyber-auto-attach ...                                              tyber host addresses to be automatically attached to
  -node.auth-pk ...                                                       Protocol API Authentication Public Key (base64 encoded)
  -node.auth-secret ...                                                   Protocol API Authentication Secret (base64 encoded)
  -node.default-push-token ...                                            base 64 encoded default platform push token
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc                            gRPC API listeners
  -node.rdv-rotation 24h0m0s                                              rendezvous rotation base for node
  -node.service-insecure false                                            use insecure connection on services
  -p2p.autorelay true                                                     enable autorelay, force private reachability
  -p2p.ble false                                                          if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `none`, `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.high-water 200                                                     ConnManager high watermark
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.low-water 150                                                      ConnManager low watermark
  -p2p.max-backoff 1h0m0s                                                 maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 10s                                                    minimum p2p backoff duration
  -p2p.multipeer-connectivity false                                       if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, `:dev:` will add the default devs servers, `:none:` will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-discover true                                               if true enable tinder discovery
  -p2p.tinder-localdiscovery-driver true                                  if true localdiscovery driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/foo/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -store.shared-dir ...                                                   shared root datastore directory

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/52.47.79.109/tcp/4040/p2p/12D3KooWKhU...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)

foo@bar:~$ berty peers -h
USAGE
  berty [global flags] peers [flags]

FLAGS
  -config ...                                                             config file (optional)
  -log.file ...                                                           log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*                          file zapfilter configuration
  -log.filters info+:bty*,-*.grpc,error+:*                                stderr zapfilter configuration
  -log.format color                                                       stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*                           ring zapfilter configuration
  -log.ring-size 10                                                       ring buffer size in MB
  -log.tyber-auto-attach ...                                              tyber host addresses to be automatically attached to
  -node.default-push-token ...                                            base 64 encoded default platform push token
  -node.rdv-rotation 24h0m0s                                              rendezvous rotation base for node
  -node.remote-addr ...                                                   remote Berty gRPC API address
  -node.service-insecure false                                            use insecure connection on services
  -p2p.autorelay true                                                     enable autorelay, force private reachability
  -p2p.ble false                                                          if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `none`, `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.high-water 200                                                     ConnManager high watermark
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.low-water 150                                                      ConnManager low watermark
  -p2p.max-backoff 1h0m0s                                                 maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 10s                                                    minimum p2p backoff duration
  -p2p.multipeer-connectivity false                                       if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, `:dev:` will add the default devs servers, `:none:` will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-discover true                                               if true enable tinder discovery
  -p2p.tinder-localdiscovery-driver true                                  if true localdiscovery driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -peers.refresh 1s                                                       refresh every DURATION (0: no refresh)
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/foo/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -store.shared-dir ...                                                   shared root datastore directory

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/52.47.79.109/tcp/4040/p2p/12D3KooWKhU...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)

foo@bar:~$ berty export -h
USAGE
  berty [global flags] export [flags]

FLAGS
  -config ...                                                             config file (optional)
  -export-path ...                                                        path of the export tarball
  -log.file ...                                                           log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*                          file zapfilter configuration
  -log.filters info+:bty*,-*.grpc,error+:*                                stderr zapfilter configuration
  -log.format color                                                       stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*                           ring zapfilter configuration
  -log.ring-size 10                                                       ring buffer size in MB
  -log.tyber-auto-attach ...                                              tyber host addresses to be automatically attached to
  -node.default-push-token ...                                            base 64 encoded default platform push token
  -node.disable-group-monitor false                                       disable group monitoring
  -node.display-name foo (cli)                                            display name
  -node.no-notif false                                                    disable desktop notifications
  -node.rdv-rotation 24h0m0s                                              rendezvous rotation base for node
  -node.rebuild-db false                                                  reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                                                   remote Berty gRPC API address
  -node.restore-export-path ...                                           inits node from a specified export path
  -node.service-insecure false                                            use insecure connection on services
  -p2p.autorelay true                                                     enable autorelay, force private reachability
  -p2p.ble false                                                          if true Bluetooth Low Energy will be enabled
  -p2p.bootstrap :default:                                                ipfs bootstrap node, `:default:` will set ipfs default bootstrap node
  -p2p.dht client                                                         dht mode, can be: `none`, `client`, `server`, `auto`, `autoserver`
  -p2p.dht-randomwalk true                                                if true dht will have randomwalk enable
  -p2p.disable-ipfs-network false                                         disable as much networking feature as possible, useful during development
  -p2p.high-water 200                                                     ConnManager high watermark
  -p2p.ipfs-api-listeners /ip4/127.0.0.1/tcp/5001                         IPFS API listeners
  -p2p.low-water 150                                                      ConnManager low watermark
  -p2p.max-backoff 1h0m0s                                                 maximum p2p backoff duration
  -p2p.mdns true                                                          if true mdns will be enabled
  -p2p.min-backoff 10s                                                    minimum p2p backoff duration
  -p2p.multipeer-connectivity false                                       if true Multipeer Connectivity will be enabled
  -p2p.nearby false                                                       if true Android Nearby will be enabled
  -p2p.poll-interval 1s                                                   how long the discovery system will waits for more peers
  -p2p.rdvp :default:                                                     list of rendezvous point maddr, `:dev:` will add the default devs servers, `:none:` will disable rdvp
  -p2p.static-relays :default:                                            list of static relay maddrs, `:default:` will use statics relays from the config
  -p2p.swarm-announce ...                                                 IPFS announce addrs
  -p2p.swarm-listeners :default:                                          IPFS swarm listeners
  -p2p.swarm-no-announce ...                                              IPFS exclude announce addrs
  -p2p.tinder-dht-driver true                                             if true dht driver will be enable for tinder
  -p2p.tinder-discover true                                               if true enable tinder discovery
  -p2p.tinder-localdiscovery-driver true                                  if true localdiscovery driver will be enable for tinder
  -p2p.tinder-rdvp-driver true                                            if true rdvp driver will be enable for tinder
  -p2p.webui-listener :3999                                               IPFS WebUI listener
  -preset ...                                                             applies various default values, see ADVANCED section below
  -store.dir /Users/foo/Library/Application Support/berty-tech/berty  root datastore directory
  -store.inmem false                                                      disable datastore persistence
  -store.shared-dir ...                                                   shared root datastore directory

ADVANCED
  -log.filters=':default: CUSTOM'        equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                         -> more info at https://github.com/moul/zapfilter
  -preset=performance                    better performance: current development defaults
  -preset=anonymity                      better privacy: -tor.mode=required -p2p.mdns=false -p2p.multipeer-connectivity=false -p2p.ble=false -p2p.nearby=false
  -preset=volatile                       similar to performance but optimize for a quick throwable node: -store.inmem=true -p2p.ipfs-api-listeners="" -p2p.swarm-listeners="" -p2p.webui-listener=""
  -p2p.swarm-listeners=:default:,CUSTOM  equivalent to -p2p.swarm-listeners=/ip4/0.0.0.0/tcp/0,/ip6/::/tcp/0,CUSTOM
  -p2p.rdvp=:default:,CUSTOM             equivalent to -p2p.rdvp=/ip4/52.47.79.109/tcp/4040/p2p/12D3KooWKhU...,CUSTOM
                                         -> full list available at https://github.com/berty/berty/tree/master/config)

foo@bar:~$ berty remote-logs -h
USAGE
  berty [global flags] remote-logs

FLAGS
  -node.remote-addr ...  remote Berty gRPC API address

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty service-key -h
USAGE
  berty service-key [flags] [command]

FLAGS
  -auth.sk ...  base64 encoded ed25519 private key to convert to a public key

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty push-server -h
USAGE
  berty [global flags] push-server [flags]

FLAGS
  -apns ...                                       Apple's apns certs path, comma-separated
  -fcm ...                                        Firebase's FCM API keys, formatted like app_id:api_key and comma-separated
  -log.file ...                                   log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*  file zapfilter configuration
  -log.filters info+:bty*,-*.grpc,error+:*        stderr zapfilter configuration
  -log.format color                               stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*   ring zapfilter configuration
  -log.ring-size 10                               ring buffer size in MB
  -log.tyber-auto-attach ...                      tyber host addresses to be automatically attached to
  -node.auth-pk ...                               Protocol API Authentication Public Key (base64 encoded)
  -node.auth-secret ...                           Protocol API Authentication Secret (base64 encoded)
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc    gRPC API listeners
  -push-private-key ...                           Push server private key, base64 formatted

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty p2p -h
USAGE
  berty p2p [command]

SUBCOMMANDS
  generate-id  helper to generate a key identity for libp2p service
  load-id      helper to display peerid or related information from libp2p key from path or stdin

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty relay -h
USAGE
  berty [global flags] relay [flags]

FLAGS
  -key-autogenerate true                                                                                    auto-generate key if none is found
  -key-b64 ...                                                                                              full private key, base 64 encoded
  -key-file peer.key                                                                                        path of the peer key, if none exist, one will be automatically created
  -key-size 2048                                                                                            for RSA key only, specfy the bit size of the key
  -key-type Ed25519                                                                                         for RSA key only, specfy the bit size of the key
  -log.file ...                                                                                             log file path (pattern)
  -log.file-filters debug+:bty*,-*.grpc,error+:*                                                            file zapfilter configuration
  -log.filters info+:bty*,-*.grpc,error+:*                                                                  stderr zapfilter configuration
  -log.format color                                                                                         stderr logging format. can be: json, console, color, light-console, light-color
  -log.ring-filters info+:bty*,-*.grpc,error+:*                                                             ring zapfilter configuration
  -log.ring-size 10                                                                                         ring buffer size in MB
  -log.tyber-auto-attach ...                                                                                tyber host addresses to be automatically attached to
  -prom-listener :9092                                                                                      listener to expose Prometheus host metric
  -relay-buffsize 2048                                                                                      the size of the relayed connection buffers
  -relay-limit-data 131072                                                                                  Data is the limit of data relayed (on each direction) before resetting the connection. Defaults to 128KB
  -relay-limit-duration 2m0s                                                                                the time limit before resetting a relayed connection
  -relay-max-circuits 2048                                                                                  the maximum number of open relay connections for each peer
  -relay-max-reservations 128                                                                               the maximum number of active relay slots
  -relay-max-reservations-per-asn 32                                                                        the maximum number of reservations origination from the same ASN
  -relay-max-reservations-per-ip 8                                                                          the maximum number of reservations originating from the same IP
  -relay-max-reservations-per-peer 4                                                                        the maximum number of reservations originating from the same peer
  -relay-reservation-ttl 1h0m0s                                                                             ReservationTTL is the duration of a new (or refreshed reservation).
  -swarm-announce ...                                                                                       addrs that will be announce by this server
  -swarm-listeners /ip4/0.0.0.0/tcp/4040,/ip4/0.0.0.0/udp/4141/quic,/ip6/::/tcp/4040,/ip6/::/udp/4040/quic  lists of listeners of (m)addrs separate by a comma

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
                                   -> more info at https://github.com/moul/zapfilter

foo@bar:~$ berty vc-issuer -h
USAGE
  berty [global flags] vc-issuer [flags]

FLAGS
  -http.listener ...     http listener
  -http.server-root ...  http server root
  -vc-sk ...             Verifiable Credentials Issuer private key (base64 encoded)

ADVANCED
  -log.filters=':default: CUSTOM'  equivalent to -log.filters='info+:bty*,-*.grpc,error+:* CUSTOM'
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
  -emitter-admin-key ...                               admin key of the emitter-io server
  -emitter-public-addr ...                             if set, will be used to tell the client where to find emitter server
  -emitter-server ...                                  address of the emitter-io server, ie. tcp://127.0.0.1:8080
  -l /ip4/0.0.0.0/tcp/4040,/ip4/0.0.0.0/udp/4141/quic  lists of listeners of (m)addrs separate by a comma
  -log.file stderr                                     if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:*                                 logged namespaces
  -log.format color                                    if specified, will override default log format
  -metrics ...                                         metrics listener, if empty will disable metrics
  -pk ...                                              private key (generated by `rdvp genkey`)

foo@bar:~$ rdvp genkey -h
USAGE
  genkey

FLAGS
  -length 2048          The length (in bits) of the key generated.
  -log.file stderr      if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:*  logged namespaces
  -log.format color     if specified, will override default log format
  -type Ed25519         Type of the private key generated, one of : Ed25519, ECDSA, Secp256k1, RSA

foo@bar:~$ rdvp sharekey -h
USAGE
  rdvp [global flags] sharekey -pk PK

FLAGS
  -log.file stderr      if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:*  logged namespaces
  -log.format color     if specified, will override default log format
  -pk ...               private key (generated by `rdvp genkey`)
```

### `welcomebot`

[embedmd]:# (.tmp/welcomebot-usage.txt console)
```console
foo@bar:~$ welcomebot -h
Usage of welcomebot:
  -addr string
    	remote 'berty daemon' address (default "127.0.0.1:9091")
  -display-name string
    	bot's display name (default "foo (Welcome Bot)")
  -log-format string
    	console, json, light-console, light-json, testing (default "console")
  -staff-conversation-link string
    	link of the staff's conversation to join
  -store string
    	store file path (default "./welcomebot.store")
```
