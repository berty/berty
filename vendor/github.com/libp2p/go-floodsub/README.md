# go-floodsub

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-libp2p-blue.svg?style=flat-square)](http://github.com/libp2p/libp2p)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)

> A flooding pubsub system.

PubSub is a work in progress, with [floodsub](https://github.com/libp2p/go-floodsub/) as an initial protocol, followed by gossipsub, which is an alpha release as of May 2018.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [License](#license)

## Install

```
go get github.com/libp2p/go-floodsub
```

## Usage

```
TODO
```

## Implementations

See [this issue](https://github.com/libp2p/go-floodsub/issues/77) for an introduction to pubsub, gossipsub and floodsub, which is in the repo for go-floodsub. A PR for gossipsub with Go is [here](https://github.com/libp2p/go-floodsub/pull/67); see [gerbil-simsub](https://github.com/vyzo/gerbil-simsub) for a high-level literate specification, as well as [the libp2p spec for gossipsub](https://github.com/libp2p/specs/blob/master/pubsub/gossipsub/README.md).

The rust-libp2p implementation of floodsub is [here](https://github.com/libp2p/rust-libp2p/search?utf8=%E2%9C%93&q=floodsub&type=). Work is in progress on a gossipsub implementation for Rust with @jamesray1 from Drops of Diamond (which is developing sharding for Ethereum).

Here is a [Javascript](http://github.com/libp2p/js-libp2p-floodsub) implementation of floodsub.

## Contribute

Contributions welcome. Please check out [the issues](https://github.com/libp2p/go-floodsub/issues).

Check out our [contributing document](https://github.com/libp2p/community/blob/master/contributing.md) for more information on how we work, and about contributing in general. Please be aware that all interactions related to multiformats are subject to the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

[MIT](LICENSE) © Jeromy Johnson
