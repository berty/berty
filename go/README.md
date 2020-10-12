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
████ ▄▄▄▄▄ ██▄█▀▀▄▀ █ ▀ █▀  ███ ▀  ▀▀█ ▄▄▄▄▄ ████
████ █   █ █▄▄ █▄  ▀ █▀█▄▀▀▄▄▀  █▀ █▄█ █   █ ████
████ █▄▄▄█ ████▀▄▀ ▀ █  ▀█▀▀██▀ █▀  ██ █▄▄▄█ ████
████▄▄▄▄▄▄▄█ ▀▄▀▄▀▄▀▄▀▄▀ ▀▄▀▄▀ █ ▀▄▀ █▄▄▄▄▄▄▄████
████▄▄ █▄ ▄▄▄   ▀  █▀█▀█▀▀▀ ▀  ▀ ███   ▀█▀▄█▀████
████▄▀ ▄▀▀▄█▄▄  █▀ █  ▀█▀▀ ▀█▀▀▀█ ▄█████▄██ ▄████
████ ▀ ▀ ▄▄  ▀   ▀   ▀▄█ ▄▄▄ ▄█▄███▀ ▄▄ █ ▀█▀████
████  █ █▀▄▄██ ▄ ▀▄▄ ▀ ▀ ▀▄██▀ ▀▀▀██ ▄▀█▄██▄▄████
████ ██ ▀▀▄▀██  ▀█▀▄ ▄█▀ ▀███▄█▄█ █  ▀ ██▄▄▄ ████
████ ▀███▀▄█ █ █▄▄██▄▄█▀█ █▀█ ▀▀█  ▀▀▀█  █▄▄ ████
████▀▄██▀▀▄▀▀  ▀███▀█▀██  █   ▀▀ ██  ▄▄▄▄▄█  ████
████ █ ▄ ▄▄▀▄▄ ▀█ ▀▀█ ▄▀▀ ██▄ ███ █▀██ ▄ █▄  ████
█████▀██ █▄ ▀▀▄▀ ▀▀██▀█ ▀▄▀█ ▀█▀▀████  ██▀ ▀▄████
████ █▄▀█ ▄▄██▀▀█▀ ▀ ▀ █▄ █▀ ▀▄▀▄▀▀▀█▀▄▄▀ ▄▄▄████
█████▀▄▄▄▀▄████  ▀ ▀ ▀ ██ ██ █▀▄ ██▄  ▄██ ▀▀▀████
████▄▀█ ▀█▄▀▄  ▄  ▄▄ ▀ ▀▀  █▄  ▀█  ▀▄█▀▄██▄▄▄████
████▄██▄▄▄▄█▀▀▀▄▀██▄ █▀█▀ ▀▄ ▀██ ▀██ ▄▄▄ ▀▀▄▄████
████ ▄▄▄▄▄ █ ▄▄█▀▄█▀ ▄███▀ █▀  █ ▀▀▄ █▄█ ▀█▄▄████
████ █   █ █▄▄ ▀███▀█▀██  █▄ ▀██ ▄ █▄▄▄  ███▀████
████ █▄▄▄█ █ ▄ ▀█▀ ▀█  ▀▀▀▀▀█  █▀▀█▄ ▀██ ▄█ ▄████
████▄▄▄▄▄▄▄█▄█▄█▄▄█████▄█▄██▄██████▄▄▄▄▄█▄▄▄▄████
█████████████████████████████████████████████████
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
html url: https://berty.tech/id#key=CiDLnKLVhQ9Gw9fKCOdi9ZfXFsusrQGxvQbASTd2npt0_RIgyBYYGxzTHgWmT9XPApaNDlJCME7acM6bUopSAjbChEQ&name=demo
```

### Info

[embedmd]:# (.tmp/berty-info.txt console)
```console
foo@bar:~$ berty info
{
  "protocol": {
    "process": {
      "version": "v2.180.1-dev.2+g6952cb2d",
      "vcsRef": "6952cb2d",
      "uptimeMs": "14",
      "userCpuTimeMs": "1022",
      "systemCpuTimeMs": "178",
      "startedAt": "1602556036",
      "rlimitCur": "1024",
      "numGoroutine": "489",
      "nofile": "32",
      "numCpu": "12",
      "goVersion": "go1.15",
      "operatingSystem": "linux",
      "hostName": "REDACTED",
      "arch": "amd64",
      "rlimitMax": "1048576",
      "pid": "30403",
      "ppid": "30402",
      "priority": "20",
      "uid": "1000",
      "workingDir": "REDACTED",
      "systemUsername": "anon#1337"
    },
    "p2p": {
      "connectedPeers": "10"
    },
    "orbitdb": {
      "accountMetadata": {
        "progress": "2",
        "maximum": "2"
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

FLAGS
  -log.file ...                             if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*  zapfilter configuration
  -log.format color                         can be: json, console, color, light-console, light-color
  -log.tracer ...                           specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger

foo@bar:~$ berty daemon -h
USAGE
  berty [global flags] daemon [flags]

FLAGS
  -node.display-name moul (cli)                                   display name
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc                    gRPC API listeners
  -node.no-notif false                                            disable desktop notifications
  -node.rebuild-db false                                          reconstruct messenger DB from OrbitDB logs
  -p2p.ipfs-announce ...                                          IPFS announce addrs
  -p2p.ipfs-api-listeners ...                                     IPFS API listeners
  -p2p.ipfs-listeners /ip4/0.0.0.0/tcp/0,/ip4/0.0.0.0/udp/0/quic  IPFS listeners
  -p2p.ipfs-no-announce ...                                       IPFS exclude announce addrs
  -p2p.local-discovery true                                       local discovery
  -p2p.max-backoff 1m0s                                           maximum p2p backoff duration
  -p2p.min-backoff 1s                                             minimum p2p backoff duration
  -p2p.rdvp []                                                    list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.webui-listener :3999                                       IPFS WebUI listener
  -store.dir /home/moul/.config/berty-tech/berty                  root datastore directory
  -store.inmem false                                              disable datastore persistence

foo@bar:~$ berty mini -h
USAGE
  berty [global flags] mini [flags]

FLAGS
  -mini.group ...                                                 group to join, leave empty to create a new group
  -node.display-name moul (cli)                                   display name
  -node.listeners ...                                             gRPC API listeners
  -node.no-notif false                                            disable desktop notifications
  -node.rebuild-db false                                          reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                                           remote Berty gRPC API address
  -p2p.ipfs-announce ...                                          IPFS announce addrs
  -p2p.ipfs-api-listeners ...                                     IPFS API listeners
  -p2p.ipfs-listeners /ip4/0.0.0.0/tcp/0,/ip4/0.0.0.0/udp/0/quic  IPFS listeners
  -p2p.ipfs-no-announce ...                                       IPFS exclude announce addrs
  -p2p.local-discovery true                                       local discovery
  -p2p.max-backoff 1m0s                                           maximum p2p backoff duration
  -p2p.min-backoff 1s                                             minimum p2p backoff duration
  -p2p.rdvp []                                                    list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.webui-listener ...                                         IPFS WebUI listener
  -store.dir /home/moul/.config/berty-tech/berty                  root datastore directory
  -store.inmem false                                              disable datastore persistence

foo@bar:~$ berty banner -h
USAGE
  berty banner [flags]

FLAGS
  -light false   light mode
  -random false  pick a random quote

foo@bar:~$ berty version -h
USAGE
  berty version

foo@bar:~$ berty info -h
USAGE
  berty [global flags] info [flags]

FLAGS
  -info.anonimize false                                           anonimize output for sharing
  -info.refresh 0s                                                refresh every DURATION (0: no refresh)
  -node.display-name moul (cli)                                   display name
  -node.no-notif false                                            disable desktop notifications
  -node.rebuild-db false                                          reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                                           remote Berty gRPC API address
  -p2p.ipfs-announce ...                                          IPFS announce addrs
  -p2p.ipfs-api-listeners ...                                     IPFS API listeners
  -p2p.ipfs-listeners /ip4/0.0.0.0/tcp/0,/ip4/0.0.0.0/udp/0/quic  IPFS listeners
  -p2p.ipfs-no-announce ...                                       IPFS exclude announce addrs
  -p2p.local-discovery true                                       local discovery
  -p2p.max-backoff 1m0s                                           maximum p2p backoff duration
  -p2p.min-backoff 1s                                             minimum p2p backoff duration
  -p2p.rdvp []                                                    list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -store.dir /home/moul/.config/berty-tech/berty                  root datastore directory
  -store.inmem false                                              disable datastore persistence

foo@bar:~$ berty groupinit -h
USAGE
  berty groupinit

foo@bar:~$ berty share-invite -h
USAGE
  berty [global flags] share-invite [flags]

FLAGS
  -dev-channel false                                              post qrcode on dev channel
  -no-term false                                                  do not print the QR code in terminal
  -node.display-name moul (cli)                                   display name
  -node.no-notif false                                            disable desktop notifications
  -node.rebuild-db false                                          reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                                           remote Berty gRPC API address
  -p2p.ipfs-announce ...                                          IPFS announce addrs
  -p2p.ipfs-api-listeners ...                                     IPFS API listeners
  -p2p.ipfs-listeners /ip4/0.0.0.0/tcp/0,/ip4/0.0.0.0/udp/0/quic  IPFS listeners
  -p2p.ipfs-no-announce ...                                       IPFS exclude announce addrs
  -p2p.local-discovery true                                       local discovery
  -p2p.max-backoff 1m0s                                           maximum p2p backoff duration
  -p2p.min-backoff 1s                                             minimum p2p backoff duration
  -p2p.rdvp []                                                    list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -store.dir /home/moul/.config/berty-tech/berty                  root datastore directory
  -store.inmem false                                              disable datastore persistence

foo@bar:~$ berty token-server -h
USAGE
  berty [global flags] token-server [flags]

FLAGS
  -auth.secret ...               base64 encoded secret
  -auth.sk ...                   base64 encoded signature key
  -http.listener 127.0.0.1:8080  http listener
  -svc ...                       comma separated list of supported services as name@ip:port

foo@bar:~$ berty repl-server -h
USAGE
  berty [global flags] repl-server [flags]

FLAGS
  -node.auth-pk ...                                               Protocol API Authentication Public Key (base64 encoded)
  -node.auth-secret ...                                           Protocol API Authentication Secret (base64 encoded)
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc                    gRPC API listeners
  -p2p.ipfs-announce ...                                          IPFS announce addrs
  -p2p.ipfs-api-listeners ...                                     IPFS API listeners
  -p2p.ipfs-listeners /ip4/0.0.0.0/tcp/0,/ip4/0.0.0.0/udp/0/quic  IPFS listeners
  -p2p.ipfs-no-announce ...                                       IPFS exclude announce addrs
  -p2p.local-discovery true                                       local discovery
  -p2p.max-backoff 1m0s                                           maximum p2p backoff duration
  -p2p.min-backoff 1s                                             minimum p2p backoff duration
  -p2p.rdvp []                                                    list of rendezvous point maddr, ":dev:" will add the default devs servers, ":none:" will disable rdvp
  -p2p.webui-listener :3999                                       IPFS WebUI listener
  -store.dir /home/moul/.config/berty-tech/berty                  root datastore directory
  -store.inmem false                                              disable datastore persistence
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
  -announce ...                                        addrs that will be announce by this server
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
    	bot's display name (default "moul (betabot)")
  -staff-conversation-link string
    	link of the staff's conversation to join
  -store string
    	store file path (default "./betabot.store")
```
