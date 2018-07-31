# go-conn-security-multistream

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![GoDoc](https://godoc.org/github.com/libp2p/go-conn-security-multistream?status.svg)](https://godoc.org/github.com/libp2p/go-conn-security-multistream)
[![Coverage Status](https://coveralls.io/repos/github/libp2p/go-conn-security-multistream/badge.svg?branch=master)](https://coveralls.io/github/libp2p/go-conn-security-multistream?branch=master)
[![Build Status](https://travis-ci.org/libp2p/go-conn-security-multistream.svg?branch=master)](https://travis-ci.org/libp2p/go-conn-security-multistream)

> Connection security multistream multiplexer

This package provides a multistream multiplexed [security transport](https://github.com/libp2p/go-conn-security). It:

1. Selects a security security transport using multistream-select.
2. Secures the stream using the selected transport.

Known libp2p security transports include:

* [go-libp2p-secio](https://github.com/libp2p/go-libp2p-secio)

## Install

`go-conn-security-multistream` is a standard Go module which can be installed with:

```sh
go get github.com/libp2p/go-conn-security-multistream
```

Note that `go-conn-security-multistream` is packaged with Gx, so it is recommended to use Gx to install and use it (see the Usage section).

## Usage

This module is packaged with [Gx](https://github.com/whyrusleeping/gx). In order to use it in your own project it is recommended that you:

```sh
go get -u github.com/whyrusleeping/gx
go get -u github.com/whyrusleeping/gx-go
cd <your-project-repository>
gx init
gx import github.com/libp2p/go-conn-security-multistream
gx install --global
gx-go --rewrite
```

Please check [Gx](https://github.com/whyrusleeping/gx) and [Gx-go](https://github.com/whyrusleeping/gx-go) documentation for more information.

For more information about how `go-conn-security-multistream` is used in the libp2p context, you can see the [go-libp2p-conn](https://github.com/libp2p/go-libp2p-conn) module.

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/libp2p/go-conn-security-multistream/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/libp2p/community/blob/master/code-of-conduct.md).

### Want to hack on IPFS?

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

MIT
