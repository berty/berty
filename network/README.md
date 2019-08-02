<h1 align="center">
  <img src="https://berty.tech/img/berty.svg" alt="The Berty Project" height="300px"><br />
  Berty Network
</h1>

<h3 align="center">Berty is a secure peer-to-peer messaging app that works with or without internet access, cellular data or trust in the network.</h3>

<p align="center"><b>
    <a href="https://berty.tech">berty.tech</a> •
    <a href="https://twitter.com/berty">Twitter</a> •
    <a href="https://github.com/berty">GitHub</a>
</b></p>

## Documentation

#### :warning: This repo is heavily linked with Berty and still under heavy development. :warning:

The main components are:

* `BertyHost`, a wrapper around a libp2p Host, and has some optimisations made to work on mobile first.
* `Network`, the networking part of berty, a bridge that link berty to the IPFS world.
* and the rest, small helpers etc

See the [`./docs/`](./docs/) folder.

## Our plan for this preview repo

* Extract some generic packages in the following days and make them open-source:
  * The future `go-libp2p-ble-transport` which is actually located [here](https://github.com/berty/network/tree/dev/cleanup/transport/ble)
  * The future `gomobile-ipfs` helpers that are mainly located around the current `BertyHost`
* Then, when all the missing code will be Berty oriented, we will invest some time to refactor most of the code and return back this repo in our monorepo.

**We need your help to give us guide/help us in the extraction of the generic lib that will be useful for the IPFS community**

## Know limitations

* `Network` currently doesn't work on the IFPS Network, this is due to the fact that we use a custom record validator over the DHT, we will certainly change this in a near futur
