go-ipfs-addr
==================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://libp2p.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Coverage Status](https://coveralls.io/repos/github/ipfs/go-ipfs-addr/badge.svg?branch=master)](https://coveralls.io/github/ipfs/go-ipfs-addr?branch=master)
[![Travis CI](https://travis-ci.org/ipfs/go-ipfs-addr.svg?branch=master)](https://travis-ci.org/ipfs/go-ipfs-addr)

> A parsing utility for ipfs multiaddrs.


## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)

## Install

```sh
make install
```

## Examples

```go
import "github.com/ipfs/go-ipfs-addr"

addrstr := "/ip4/104.131.131.82/tcp/4001/ipfs/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ"
a, _ := ipfsaddr.ParseString(addr)

fmt.Println("peer id: ", a.ID())
fmt.Println("transport multiaddr: ", a.Transport())
```

## Contribute

PRs are welcome!

Small note: If editing the Readme, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © Whyrusleeping
