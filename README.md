<h1 align="center">
  <img src="https://berty.tech/img/berty.svg" alt="Berty" title="Berty" height="300px" />
</h1>

<h3 align="center">🤝 Anti-censorship and anti-surveillance communication protocol</h3>

<p align="center">
  <a href="https://buildkite.com/berty/main"><img src="https://badge.buildkite.com/331d828ccb643f90f6302b13ea77ab716ec78d6631af54c987.svg?branch=master" alt="Build Status"></a>
  <a href="https://www.codefactor.io/repository/github/berty/berty"><img src="https://www.codefactor.io/repository/github/berty/berty/badge?s=bf5885a3b2782ead81d91cd423915f2e9ddc9196" alt="CodeFactor" /></a>
  <!--<a href="https://goreportcard.com/report/berty/berty"><img src="https://goreportcard.com/badge/berty/berty" alt="Go Report Card"></a>-->
  <a href="https://github.com/berty/berty/releases"><img src="https://badge.fury.io/gh/berty%2Fberty.svg" alt="GitHub version"></a>
</p>

<p align="center"><b>
  <a href="https://berty.tech">berty.tech</a> •
  <a href="https://twitter.com/berty">Twitter</a> •
  <a href="http://crpt.fyi/berty-matrix">Matrix</a> •
  <a href="http://crpt.fyi/berty-discord">Discord</a> •
  <a href="https://github.com/berty">GitHub</a>
</b></p>

---

## Introduction

**Berty** is an anonymous, secure, peer-to-peer protocol that doesn't need an internet connection to function.

There is a **protocol** that uses advanced cryptography and a **messenger app** that is built on top of the protocol.

- No phone number or email required to create an account
- End-to-end encryption used to encrypt all conversations
- Focus on leaking as little metadata as possible
- Decentralized, distributed, serverless
- No concensus, no blockchain
- No internet connection required (uses the [BLE technology](https://en.wikipedia.org/wiki/Bluetooth_Low_Energy) and mDNS)
- Free forever, no data stored, transparent code, open-source

Berty is currently developed by **Berty Technologies**, a French non-profit organization.

Usages:
- When you need to share sensitive information.
- If you want to communicate with good anonymity.
- If you don't want to use servers, because you want full control of your data.
- In countries that have censorship and restrict network access and usage.
- In areas with weak or no connection or cell reception.
- When you travel and you want to communicate safely through insecure public connections.

**Note: the project is made by a small team of humans who are not experts and who make mistakes. Please, do not hesitate to point out if you notice a bug or something missing.** _See the [contribute section](#contribute) below._

> We cannot promise to give you the best app, but we can commit to doing our best in that direction.

## Development Status

**Berty is still under active development and should not be used to exchange important data**.

The current Berty Chat implementation is not using the Berty Protocol yet, but OrbitDB directly. Which means the encryption is not safe, but the good news is that the current Berty Chat app is already a P2P one!

The current Berty Protocol is _partially implemented_. The API will certainly change in a near future, so be prepared to have breaking changes if you start using it right now.

_We will open betas for the different packages and apps soon, so anyone will be able to give it a try even without the coding skills. Subscribe to our newsletter if you want to be notified._

**Note: this is an ongoing work. The repos are being opened progressively, and there will be more changes and updates.**


## Under the hood

_TODO: add a high-level schema of how things are connected together_

### Berty Protocol

[![go.dev reference](https://img.shields.io/badge/go.dev-reference-007d9c?logo=go&logoColor=white)](https://pkg.go.dev/berty.tech/berty/v2)
[![Code coverage](https://codecov.io/gh/berty/berty/branch/master/graph/badge.svg?token=rBPpNHNNow)](https://codecov.io/gh/berty/berty)


A generic SDK that allows developers to write P2P applications. It contains everything needed (encryption, identities, network routing, group management, account management, device management, application lifecycle) so you can just focus on the high-level features of your app.

The main concept of the _Berty Protocol_ is the "group", a virtual place where multiple devices can share messages and metadata using [OrbitDB](https://github.com/orbitdb), which itself relies on [IPFS](https://ipfs.io/).

_TODO: add usage examples_

Get it: `go get -u berty.tech/berty/v2`

### Berty Chat

A chat application written in [React Native](https://reactnative.dev/), that uses the Berty Protocol using [gomobile-ipfs](https://github.com/ipfs-shipyard/gomobile-ipfs), which, in its turn, is using [gomobile](https://github.com/golang/mobile).

## Main items in the repo

* [./go](go): Where all the Golang code belongs.
    * [./go/pkg/**bertyprotocol**](go/pkg/bertyprotocol): **Berty Protocol** _Golang SDK_ to create secure and autonomous groups using _IPFS_.
    * [./go/framework/bertybridge](go/framework/bertybridge): gomobile entrypoint.
    * [./go/cmd/**berty**](go/cmd/berty): Main **Berty CLI**, containing:
        * `berty daemon`: Runs the whole Berty Protocol instance.
        * `berty demo`: Development/debugging subcommand which aims to show the internal features more easily.
        * `berty mini`: Simple CLI chat app using Berty Protocol.
    * [./go/cmd/**rdvp**](go/cmd/rdvp): A Rendez-Vous Point server.
* [./js](js): Where all the Javascript/Typescript code belongs, containing:
    * The **Berty Chat** application, written in React Native.
* [./docs](docs): Mostly auto-generated documentation.

## Philosophy

We want to contribute to the world of free, secure communication without fear of censorship and surveillance.

Open source is more secure, since anyone can examine the code, improve it and maintain it. Our ultimate goal is to completely lose control of Berty and have it evolve as a global community project.

_TODO: add info about Berty community_

## Contributing

Please do!

> Use it, fork it, fix it - it's free.

If you like to code in Go, Typescript, Java, Swift, have a look at one of [our repos](https://github.com/berty).

If you code in any other language you can also help us by adding tooling, SDKs, bridges.

If you like to translate, draw, make videos or have ideas for the content, you can contribute on our repos, we have a dedicated [`assets` repo](https://github.com/berty/assets) for our medias.

_TODO: add info about beta testing_

We are currently setting up a goodies store and a donation page so you can help us with money if you don't have time.

And finally, you can help us by spreading the word about us to your peers.

---

Thank you, and feel free to [contact](#contact) us or open the GitHub issues if you want more details.

Read our [_contribute_ page](https://berty.tech/contribute) on berty.tech.

## Other resources

* Official website: https://berty.tech
* Assets: https://assets.berty.tech/
* _TODO: add link to mockups_

## Contact

_TODO: add community contact info_

See all our available contact methods on the [contact page](https://berty.tech/contact) of our website.

## Licensing

© 2018-2020 [Berty Technologies](https://berty.tech)
h0

Licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0) ([`LICENSE-APACHE`](LICENSE-APACHE)) or the [MIT license](https://opensource.org/licenses/MIT) ([`LICENSE-MIT`](LICENSE-MIT)), at your option. See the [`COPYRIGHT`](COPYRIGHT) file for more details.
