# go-libp2p-transport

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](https://protocol.ai)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](https://webchat.freenode.net/?channels=%23ipfs)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](https://libp2p.io/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![GoDoc](https://godoc.org/github.com/libp2p/go-libp2p-transport?status.svg)](https://godoc.org/github.com/libp2p/go-libp2p-transport)
[![Coverage Status](https://img.shields.io/codecov/c/github/libp2p/go-libp2p-transport.svg?style=flat-square&branch=master)](https://codecov.io/github/libp2p/go-libp2p-transport?branch=master)
[![Build Status](https://travis-ci.org/libp2p/go-libp2p-transport.svg?branch=master)](https://travis-ci.org/libp2p/go-libp2p-transport)

> libp2p transport code

A common interface for network transports.

This is the 'base' layer for any transport that wants to be used by libp2p and ipfs. If you want to make 'ipfs work over X', the first thing you'll want to do is to implement the `Transport` interface for 'X'.

Transports are:

* Encrypted: Connections must be end-to-end encrypted.
* Authenticated: The endpoints, RemotePeer and LocalPeer, must be authenticated.
* Multiplexed: It must be possible to multiplex multiple reliable streams over a single transport connection.

## Install

```sh
> gx install --global
> gx-go rewrite
```

## Usage

To actually *use* a transport, you'll likely want to register it with a `transport.Network` (e.g., [go-libp2p-swarm](https://github.com/libp2p/go-libp2p-swarm)). However, you're probably more interested in *implementing* transports.

Transports construct fully featured, encrypted, multiplexed connections. However, there's a fairly good chance your transport won't meet all of those requirements. To make life easier, we've created a helper library called [go-libp2p-transport-upgrader](https://github.com/libp2p/go-libp2p-transport-upgrader) for upgrading simple stream transports to fully-featured (encrypted, authenticated, multiplexed) transports. Check out that packages [README]([go-libp2p-transport-upgrader](https://github.com/libp2p/go-libp2p-transport-upgrader/blob/master/README.md) for an example.

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/libp2p/go-libp2p-transport/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

MIT
