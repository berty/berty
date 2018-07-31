# go-reuseport-transport

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![GoDoc](https://godoc.org/github.com/libp2p/go-reuseport-transport?status.svg)](https://godoc.org/github.com/libp2p/go-reuseport-transport)
[![Coverage Status](https://coveralls.io/repos/github/libp2p/go-reuseport-transport/badge.svg?branch=master)](https://coveralls.io/github/libp2p/go-reuseport-transport?branch=master)
[![Build Status](https://travis-ci.org/libp2p/go-reuseport-transport.svg?branch=master)](https://travis-ci.org/libp2p/go-reuseport-transport)

> Basic reuseport TCP transport

This package provides a basic transport for automatically (and intelligently) reusing TCP ports.

To use, construct a new `Transport` (the zero value is safe to use) and configure any listeners (`tr.Listen(...)`).

Then, when dialing (`tr.Dial(...)`), the transport will attempt to reuse the ports it's currently listening on, choosing the best one depending on the destination address.


NOTE: Currently, we don't make any attempts to prevent two reusport transports from interfering with each other (reusing each other's ports). However, we reserve the right to fix this in the future.

## Install

`go-reuseport-transport` is a standard Go module which can be installed with:

```sh
go get github.com/libp2p/go-reuseport-transport
```

Note that `go-reuseport-transport` is packaged with Gx, so it is recommended to use Gx to install and use it (see the Usage section).

## Usage

This module is packaged with [Gx](https://github.com/whyrusleeping/gx). In order to use it in your own project it is recommended that you:

```sh
go get -u github.com/whyrusleeping/gx
go get -u github.com/whyrusleeping/gx-go
cd <your-project-repository>
gx init
gx import github.com/libp2p/go-reuseport-transport
gx install --global
gx-go --rewrite
```

Please check [Gx](https://github.com/whyrusleeping/gx) and [Gx-go](https://github.com/whyrusleeping/gx-go) documentation for more information.

This package is *currently* used by the [go-tcp-transport](https://github.com/libp2p/go-tcp-transport) libp2p transport and will likely be used by more libp2p transports in the future.

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/libp2p/go-reuseport-transport/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/libp2p/community/blob/master/code-of-conduct.md).

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

MIT
