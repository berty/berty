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

[embedmd]:# (.tmp/daemon.txt console)
```console
foo@bar:~$ berty daemon
API server listening on /ip4/127.0.0.1/tcp/5001
...
```

Now you can interact with the daemon API.

### Mini

TODO

### Share Invite

[embedmd]:# (.tmp/share-invite.txt console)
```console
foo@bar:~$ berty share-invite
API server listening on /ip4/127.0.0.1/tcp/5001
█████████████████████████████████████████████████
█████████████████████████████████████████████████
████ ▄▄▄▄▄ ██▀█▀ ▄▀ ▄ ▀▀▀▀▀  ▄█ █▀ ▀▀█ ▄▄▄▄▄ ████
████ █   █ █▄▄ ▀    ▀█▀▀▄▀ █ █  ████ █ █   █ ████
████ █▄▄▄█ ██ █▀▀▀ ▀  ▄ ▀█▄ ▀ █ █▀█ ██ █▄▄▄█ ████
████▄▄▄▄▄▄▄█ ▀ █ ▀ ▀▄▀ ▀ ▀▄█▄▀▄█▄▀ █ █▄▄▄▄▄▄▄████
████  ▄▀▄ ▄  ▄▀▄▄  ██▄██▀ ██  █  ███   ▀█▀▄▀█████
████ █ ▄█ ▄█▀ ▄▄▀▀ █▀ ▀█▄▀ ██▀▀▀█▀▄█████▄██  ████
████▄ █▄█▀▄ ▄██  ▀   █▄▄  ▄▄ █▀█▀▀▀██▄ █▄▄▀▄▀████
████▄█▀ █▀▄█▀▄█▄  █▄ ▀ ▀   █▄  ██▀▀█ ▄▀▄▄██▄▄████
████▄ ▀▄▄ ▄▄▀ █  ▄  ▀▄██ ▀▀▀  ▀▄▀█▀▀ ▀ ██▄█ ▄████
█████▄█▄  ▄▄▀▀▄█ ▄█▀ ▄█▀█ █▀█▀█▀█ ▀▀▀█   █▄ ▄████
██████▀█  ▄ ███▀█▀█ ███▄  ███ ▀█ ▀█ ▀ ▄▄▄ █▀▀████
█████ ▀ ▀█▄█▄▀ ▀█ ▄▀█▀▀▀▀▀██ ▀▀▀█ ▀▀▀█ ▀▀▄▄  ████
█████▄▀ █ ▄█ ▀█▀▀▀▀█ ▀▀▄█▄▀▄  ▀█ ▀█▄█  ██▀▀█▄████
████▀▀▄▄██▄▀▄▄█▀█▀ █▀▀ ▀  █▀  ▀▀▀▀█▀██▄▄▀ ▄ ▄████
████▄█▀▀ ▄▄▀▄▄▄▀ ▀ ▀ ▀ ██ ██ ▀██▀██   ▄██▄▀  ████
████▄▀▄█  ▄▀▀██▄  ▄▄ ▀▄▀▀▀ █▄▀▄▀▀ █▀ █▀▀██▄▄▄████
████▄███▄▄▄█  █  ██▄█▄█▀▀ ███▄▄█▀▀▀▄ ▄▄▄ ▀ ▄ ████
████ ▄▄▄▄▄ █ ▀ █▀▄█▀▀▄██▄▀ ▀▀▀▀█▀ █▄ █▄█ ▀█  ████
████ █   █ █▄▄▀▀███▀████ ▄█▄▀███ ▀▀█▄▄▄  ▀▀▄▀████
████ █▄▄▄█ █ ▄ ▀█▀ ▀█  ▀▀ ██▀▀▀▀▄▀▀  ▀▀█ ██ ▄████
████▄▄▄▄▄▄▄█▄▄▄█▄▄██▄██▄▄▄█▄▄▄███▄█▄▄▄█▄██▄▄▄████
█████████████████████████████████████████████████
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
html url: https://berty.tech/id#key=CiAEWNUwuaqFxkup-m4aKi2cTqnbT9jqYimPkE7l_6562RIgAVNtXNNqlJBjUIsAKlMV6u8_DFPeqkzjuTwMOrn2ctA&name=demo
```

### Info

[embedmd]:# (.tmp/info.txt console)
```console
foo@bar:~$ berty info
API server listening on /ip4/127.0.0.1/tcp/5001
{
  "rlimitCur": "1024",
  "numGoroutine": "404",
  "nofile": "40",
  "startedAt": "1599845029",
  "numCpu": "12",
  "goVersion": "go1.15",
  "operatingSystem": "linux",
  "hostName": "fwrz",
  "arch": "amd64",
  "version": "v2.136.4-4-g45299280",
  "vcsRef": "45299280",
  "buildTime": "1599845011",
  "selfRusage": "{\"Utime\":{\"Sec\":1,\"Usec\":85018},\"Stime\":{\"Sec\":0,\"Usec\":179412},\"Maxrss\":77124,\"Ixrss\":0,\"Idrss\":0,\"Isrss\":0,\"Minflt\":8095,\"Majflt\":0,\"Nswap\":0,\"Inblock\":0,\"Oublock\":8,\"Msgsnd\":0,\"Msgrcv\":0,\"Nsignals\":0,\"Nvcsw\":8021,\"Nivcsw\":14}",
  "childrenRusage": "{\"Utime\":{\"Sec\":1,\"Usec\":653185},\"Stime\":{\"Sec\":0,\"Usec\":226263},\"Maxrss\":30996,\"Ixrss\":0,\"Idrss\":0,\"Isrss\":0,\"Minflt\":10490,\"Majflt\":0,\"Nswap\":0,\"Inblock\":0,\"Oublock\":0,\"Msgsnd\":0,\"Msgrcv\":0,\"Nsignals\":0,\"Nvcsw\":11852,\"Nivcsw\":326}",
  "rlimitMax": "1048576"
}
```

### `--help`

[embedmd]:# (.tmp/usage.txt console)
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

FLAGS
  -log.file ...                             if specified, will log everything in JSON into a file and nothing on stderr
  -log.filters info+:bty*,-*.grpc error+:*  zapfilter configuration
  -log.format color                         can be: json, console, color, light-console, light-color
  -log.tracer ...                           specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger

foo@bar:~$ berty daemon -h
USAGE
  berty [global flags] daemon [flags]

FLAGS
  -node.display-name moul (cli)                   display name
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc    gRPC API listeners
  -node.no-notif false                            disable desktop notifications
  -node.rebuild-db false                          reconstruct messenger DB from OrbitDB logs
  -p2p.ipfs-port 0                                IPFS listening port
  -p2p.local-discovery true                       local discovery
  -p2p.max-backoff 1m0s                           maximum p2p backoff duration
  -p2p.min-backoff 1s                             minimum p2p backoff duration
  -p2p.rdvp :dev:                                 rendezvous point maddr
  -store.dir /home/moul/.config/berty-tech/berty  root datastore directory
  -store.inmem false                              disable datastore persistence

foo@bar:~$ berty mini -h
USAGE
  berty [global flags] mini [flags]

FLAGS
  -mini.group ...                                 group to join, leave empty to create a new group
  -node.display-name moul (cli)                   display name
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc    gRPC API listeners
  -node.no-notif false                            disable desktop notifications
  -node.rebuild-db false                          reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                           remote Berty gRPC API address
  -p2p.ipfs-port 0                                IPFS listening port
  -p2p.local-discovery true                       local discovery
  -p2p.max-backoff 1m0s                           maximum p2p backoff duration
  -p2p.min-backoff 1s                             minimum p2p backoff duration
  -p2p.rdvp :dev:                                 rendezvous point maddr
  -store.dir /home/moul/.config/berty-tech/berty  root datastore directory
  -store.inmem false                              disable datastore persistence

foo@bar:~$ berty banner -h
USAGE
  berty [global flags] banner [flags]

FLAGS
  -light false   light mode
  -random false  pick a random quote

foo@bar:~$ berty version -h
USAGE
  version

foo@bar:~$ berty info -h
USAGE
  berty [global flags] info [flags]

FLAGS
  -info.refresh 0s                                refresh every DURATION (0: no refresh)
  -node.display-name moul (cli)                   display name
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc    gRPC API listeners
  -node.no-notif false                            disable desktop notifications
  -node.rebuild-db false                          reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                           remote Berty gRPC API address
  -p2p.ipfs-port 0                                IPFS listening port
  -p2p.local-discovery true                       local discovery
  -p2p.max-backoff 1m0s                           maximum p2p backoff duration
  -p2p.min-backoff 1s                             minimum p2p backoff duration
  -p2p.rdvp :dev:                                 rendezvous point maddr
  -store.dir /home/moul/.config/berty-tech/berty  root datastore directory
  -store.inmem false                              disable datastore persistence

foo@bar:~$ berty groupinit -h
USAGE
  groupinit

foo@bar:~$ berty share-invite -h
USAGE
  berty [global flags] share-invite [flags]

FLAGS
  -dev-channel false                              post qrcode on dev channel
  -no-term false                                  do not print the QR code in terminal
  -node.display-name moul (cli)                   display name
  -node.listeners /ip4/127.0.0.1/tcp/9091/grpc    gRPC API listeners
  -node.no-notif false                            disable desktop notifications
  -node.rebuild-db false                          reconstruct messenger DB from OrbitDB logs
  -node.remote-addr ...                           remote Berty gRPC API address
  -p2p.ipfs-port 0                                IPFS listening port
  -p2p.local-discovery true                       local discovery
  -p2p.max-backoff 1m0s                           maximum p2p backoff duration
  -p2p.min-backoff 1s                             minimum p2p backoff duration
  -p2p.rdvp :dev:                                 rendezvous point maddr
  -store.dir /home/moul/.config/berty-tech/berty  root datastore directory
  -store.inmem false                              disable datastore persistence

foo@bar:~$ berty token-server -h
USAGE
  berty [global flags] token-server [flags]

FLAGS
  -l 8080      http listener
  -s ...       comma separated list of supported services as name@ip:port
  -secret ...  base64 encoded secret
  -sk ...      base64 encoded signature key
```
