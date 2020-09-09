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
2020-09-09T13:40:08Z	WARN 	bty               	Messenger started without database, creating a volatile one in memory
2020-09-09T13:40:08Z	INFO 	bty               	client initialized	{"peer-id": "QmZPBHJwHfi4Kqp39UQ85GxmBVbxb5gEEwAisEf8kEsSAs", "listeners": ["/p2p-circuit", "/mc/QmZPBHJwHfi4Kqp39UQ85GxmBVbxb5gEEwAisEf8kEsSAs", "/ip4/127.0.0.1/tcp/37119", "/ip4/172.17.0.3/tcp/37119", "/ip4/127.0.0.1/udp/37750/quic", "/ip4/172.17.0.3/udp/37750/quic"]}
2020-09-09T13:40:08Z	INFO 	bty               	serving	{"maddr": "/ip4/127.0.0.1/tcp/9091/grpc"}
...
```

Now you can interact with the daemon API.

### Mini

TODO

### Share Invite

[embedmd]:# (.tmp/share-invite.txt console)
```console
foo@bar:~$ berty share-invite
█████████████████████████████████████████████████
█████████████████████████████████████████████████
████ ▄▄▄▄▄ ██▄█▀▀▄▀▀█  ▀█▀ ▀▀██▀▀█ ▀▀█ ▄▄▄▄▄ ████
████ █   █ █▄█▄▄▄  ▄ █▀█▄█▀█ ▀ ▀██ █ █ █   █ ████
████ █▄▄▄█ ███ ▀▄ ▄▀ ▄  ▀▀▄▀▀▀  █▀▄▀██ █▄▄▄█ ████
████▄▄▄▄▄▄▄█ █▄▀▄▀ ▀▄▀▄▀ ▀ ▀▄▀ █ ▀ ▀▄█▄▄▄▄▄▄▄████
████▄▄▄█ ▄▄ ▄█▀█ ▀▀█▀▄ ██▄██▀▄██  ██   ▀█▀▄▀▀████
████ ▀█▀▄▀▄ ▄ █▄ ▀ █  ▀▀   ▀▄▀▄█▀▀ ██▀▄█▄██▄▄████
████▄ ▀▀  ▄▄██▀  ▀ ▀ ▀▄█ ▄▄▄█ ███▀██▀▄ ▄█▄██▀████
█████▄█▄█▀▄▀▄▄ ▄ ▀▀▄   ▀  ▄▀█▀ █▀ ███▄▀██▄▄▄▄████
████ ▄▄ ▄ ▄██▄█▄▀▄█ ▀███▀▀█    ███▀▀ ▀ ██▄▄▄▄████
████  ▀ ▄▀▄██  ▀ ▄█▀█▄█▀▄ █▀█  ▀█▀ ▀▀▀▄  █▄▄ ████
████▀▄█ ██▄█▀▀▀▀█▀█ █▀█▄ ▄███ ██ ▀█▄   █▄ ▀  ████
█████▄ ██ ▄▀▄█▄▀█▀▀▀█ ▀▀▀  █▀▀▀▀█  ▀ █   ██  ████
█████ ▀  ▄▄██▄ █  █▀▀ █▄▀▄ █ ▄█ ▀ ███  ██  █ ████
██████ ▀ █▄ ▄▄▄▀█▀ █ ▀ ▀▄ ██ ▀█▀█▀ ▀██ ▄▀ ▄  ████
████▄▄▄██ ▄▄▀  ▀ █ ▀ █ ▄█ █▄█  ▄ ▀█▄  ▄ █▄▀  ████
████▄▀  ▄ ▄█▄▀▄▄ ▀▄▄   ▀▀▀ ▀█ █▀▀ ▄▀██▀▄█▄█▄▄████
████▄█▄██▄▄▄▀▄█▄▀██▄ ▄▀▀  ▀   ▀█▀▀█▄ ▄▄▄ ▀ ▄ ████
████ ▄▄▄▄▄ █ ▀▄█▀▄██ ▄██▀▀ █▀▀▀▀ ▀█▄ █▄█ ▀█▄▄████
████ █   █ █▄▀▀▀███▀████  ██ ▀▀█  ██▄▄▄  ███▀████
████ █▄▄▄█ █  ▀▀█▀ ▀█▀ ▀▀ ▀█▀▀ ▀▄ ▄  ▀▀█ ▄▄ ▄████
████▄▄▄▄▄▄▄█▄█▄█▄▄██▄██▄▄▄█▄█▄█▄▄▄█▄▄█▄▄█▄█▄▄████
█████████████████████████████████████████████████
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
deeplink: berty://id/#key=CiAfSbBdyQ7eUa5fqwNaHyAjK1wgHxt8N3GkyFfYVzYUehIgqdyvwYeZ_Ew9FppcHidcpVaIADheig6bHcl5_i791Uk&name=demo
html url: https://berty.tech/id#key=CiAfSbBdyQ7eUa5fqwNaHyAjK1wgHxt8N3GkyFfYVzYUehIgqdyvwYeZ_Ew9FppcHidcpVaIADheig6bHcl5_i791Uk&name=demo
```

### Info

[embedmd]:# (.tmp/info.txt console)
```console
foo@bar:~$ berty info
{
  "rlimitCur": "1024",
  "numGoroutine": "472",
  "connectedPeers": "8",
  "nofile": "48",
  "startedAt": "1599658804",
  "numCpu": "12",
  "goVersion": "go1.15",
  "operatingSystem": "linux",
  "hostName": "fwrz",
  "arch": "amd64",
  "version": "v2.135.0-1-g38eb5dc5",
  "vcsRef": "38eb5dc5",
  "buildTime": "1599658786",
  "selfRusage": "{\"Utime\":{\"Sec\":0,\"Usec\":909526},\"Stime\":{\"Sec\":0,\"Usec\":224478},\"Maxrss\":75988,\"Ixrss\":0,\"Idrss\":0,\"Isrss\":0,\"Minflt\":7992,\"Majflt\":0,\"Nswap\":0,\"Inblock\":0,\"Oublock\":0,\"Msgsnd\":0,\"Msgrcv\":0,\"Nsignals\":0,\"Nvcsw\":7862,\"Nivcsw\":21}",
  "childrenRusage": "{\"Utime\":{\"Sec\":1,\"Usec\":637886},\"Stime\":{\"Sec\":0,\"Usec\":298984},\"Maxrss\":28636,\"Ixrss\":0,\"Idrss\":0,\"Isrss\":0,\"Minflt\":10305,\"Majflt\":0,\"Nswap\":0,\"Inblock\":0,\"Oublock\":0,\"Msgsnd\":0,\"Msgrcv\":0,\"Nsignals\":0,\"Nvcsw\":12846,\"Nivcsw\":376}",
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
  daemon        start a full Berty instance
  mini          start a terminal-based mini berty client (not fully compatible with the app)
  banner        print the ascii Berty banner of the day
  version       print software version
  info          display system info
  groupinit     initialize a new multi-member group
  share-invite  share invite link to Discord dedicated channel
  token-server  token server, a basic token server issuer without auth or logging

FLAGS
  -localdiscovery true                      local discovery
  -logfile stderr                           if specified, will log everything in JSON into a file and nothing on stderr
  -logfilters info,warn:bty,bty.* error+:*  logged namespaces
  -logformat color                          if specified, will override default log format
  -tracer ...                               specify "stdout" to output tracing on stdout or <hostname:port> to trace on jaeger

foo@bar:~$ berty daemon -h
USAGE
  berty daemon

FLAGS
  -d :memory:                                                                       datastore base directory
  -force-rdvp false                                                                 force connect to rendezvous point
  -l /ip4/127.0.0.1/tcp/9091/grpc                                                   client listeners
  -rdvp /dnsaddr/rdvp.berty.io/ipfs/QmdT7AmhhnbuwvCpa5PH1ySK9HJVB82jr3fo1bxMxBPW6p  rendezvous point maddr

foo@bar:~$ berty mini -h
USAGE
  mini

FLAGS
  -d :memory:                                                                       datastore base directory
  -g ...                                                                            group to join, leave empty to create a new group
  -inmem false                                                                      disable persistence
  -no-notif false                                                                   disable notification
  -p 0                                                                              default IPFS listen port
  -r ...                                                                            remote berty daemon
  -rdvp /dnsaddr/rdvp.berty.io/ipfs/QmdT7AmhhnbuwvCpa5PH1ySK9HJVB82jr3fo1bxMxBPW6p  rendezvous point maddr
  -replay false                                                                     reconstruct DB from orbitDB logs
  -s :memory:                                                                       sqlite base directory

foo@bar:~$ berty banner -h
USAGE
  banner

FLAGS
  -light false   light mode
  -random false  pick a random quote

foo@bar:~$ berty version -h
USAGE
  version

foo@bar:~$ berty info -h
USAGE
  info

FLAGS
  -d :memory:  datastore base directory
  -refresh 0s  refresh every DURATION (0: no refresh)

foo@bar:~$ berty groupinit -h
USAGE
  groupinit

foo@bar:~$ berty share-invite -h
USAGE
  share-invite

FLAGS
  -d :memory:               datastore base directory
  -dev-channel false        post qrcode on dev channel
  -display-name moul (cli)  display name to share
  -no-term false            do not print the QR code in terminal
  -reset false              reset contact reference

foo@bar:~$ berty token-server -h
USAGE
  token-server

FLAGS
  -l :8080     http listener
  -s ...       comma separated list of supported services as name@ip:port
  -secret ...  base64 encoded secret
  -sk ...      base64 encoded signature key
```
