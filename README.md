<h1 align="center">
  <img src="https://berty.tech/img/berty.svg" alt="Berty" title="Berty" height="300px" />
</h1>

<h3 align="center">💬 Berty is a secure peer-to-peer messaging app that works with or without internet access, cellular data or trust in the network</h3>

<p align="center">
    <a href="https://berty.tech"><img alt="berty.tech" src="https://img.shields.io/badge/berty.tech-2845a7?logo=internet-explorer&style=flat" /></a>
    <a href="https://crpt.fyi/berty-discord"><img alt="discord" src="https://img.shields.io/badge/discord-gray?logo=discord" /></a>
    <a href="https://github.com/berty"><img alt="github" src="https://img.shields.io/badge/@berty-471961?logo=github" /></a>
    <a href="https://twitter.com/berty"><img alt="twitter" src="https://img.shields.io/twitter/follow/berty?label=%40berty&style=flat&logo=twitter" /></a>
</p>
<p align="center">
    <a href="https://github.com/berty/berty/actions?query=workflow%3AJS"><img src="https://github.com/berty/berty/workflows/JS/badge.svg" /></a>
    <a href="https://github.com/berty/berty/actions?query=workflow%3AGo"><img src="https://github.com/berty/berty/workflows/Go/badge.svg" /></a>
    <a href="https://github.com/berty/berty/actions?query=workflow%3AProtobuf"><img src="https://github.com/berty/berty/workflows/Protobuf/badge.svg" /></a>
    <a href="https://github.com/berty/berty/actions?query=workflow%3ARelease"><img src="https://github.com/berty/berty/workflows/Release/badge.svg" /></a>
    <a href="https://github.com/berty/berty/actions?query=workflow%3AAndroid"><img src="https://github.com/berty/berty/workflows/Android/badge.svg" /></a>
    <a href="https://github.com/berty/berty/actions?query=workflow%3AiOS"><img src="https://github.com/berty/berty/workflows/iOS/badge.svg" /></a>
    <a href="https://github.com/berty/berty/actions?query=workflow%3AIntegration"><img src="https://github.com/berty/berty/workflows/Integration/badge.svg" /></a>
</p>
<p align="center">
  <a href="https://pkg.go.dev/berty.tech/berty/v2/go?tab=subdirectories"><img alt="GoDoc" src="https://img.shields.io/badge/go.dev-reference-007d9c?logo=go&logoColor=white" /></a>
  <a title="Crowdin" href="https://translate.berty.community"><img src="https://badges.crowdin.net/e/a4cb8d931040fbe4a794322b86de6721/localized.svg"></a>
  <a href="https://github.com/berty/berty/releases"><img alt="GitHub release" src="https://img.shields.io/github/v/release/berty/berty" /></a>
  <a href="https://www.codefactor.io/repository/github/berty/berty"><img src="https://www.codefactor.io/repository/github/berty/berty/badge?s=bf5885a3b2782ead81d91cd423915f2e9ddc9196" alt="CodeFactor" /></a>
  <!--<a href="https://goreportcard.com/report/berty/berty"><img src="https://goreportcard.com/badge/berty/berty" alt="Go Report Card"></a>-->
  <!--<a href="https://bump.sh/doc/berty-messenger"/><img src="https://img.shields.io/badge/bump.sh-messenger%20api-black" /></a>-->
  <!--<a href="https://bump.sh/doc/berty-protocol"/><img src="https://img.shields.io/badge/bump.sh-protocol%20api-black" /></a>-->
</p>

---

## Introduction

**Berty** is an anonymous, secure, peer-to-peer protocol that doesn't need an internet connection to function.

There is a **protocol** that uses advanced cryptography and a **messenger app** that is built on top of the protocol.

- No phone number or email required to create an account
- End-to-end encryption used to encrypt all conversations
- Focus on leaking as little metadata as possible
- Decentralized, distributed, serverless
- No consensus, no blockchain
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

The current Berty Messenger implementation is using the Berty Protocol. Which means the encryption is safe and it's a P2P app!
Berty Messenger has not been hardened yet so avoid using it on devices with weak sandboxes.
If you're trying to roll your own app based on the protocol, beware that the app layer protocols used by Berty Messenger might change in the future.

The current Berty Protocol is _partially implemented_. The API will certainly change in a near future, so be prepared to have breaking changes if you start using it right now.

_We will open betas for the different packages and apps soon, so anyone will be able to give it a try even without the coding skills. Subscribe to our newsletter if you want to be notified._

**Note: this is an ongoing work. The repos are being opened progressively, and there will be more changes and updates.**

## Under the hood

<!-- _TODO: add a high-level schema of how things are connected together_ -->

### Berty Protocol

[![go.dev reference](https://img.shields.io/badge/go.dev-reference-007d9c?logo=go&logoColor=white)](https://pkg.go.dev/berty.tech/berty/v2/go/pkg/bertyprotocol?tab=doc)
[![Code coverage](https://codecov.io/gh/berty/berty/branch/master/graph/badge.svg?token=rBPpNHNNow&flag=go.unittests)](https://codecov.io/gh/berty/berty)

A generic SDK that allows developers to write P2P applications. It contains everything needed (encryption, identities, network routing, group management, account management, device management, application lifecycle) so you can just focus on the high-level features of your app.

The main concept of the _Berty Protocol_ is the "group", a virtual place where multiple devices can share messages and metadata using [OrbitDB](https://github.com/orbitdb), which itself relies on [IPFS](https://ipfs.io/).

<!-- _TODO: add usage examples_ -->

Get it:

```
git clone https://github.com/berty/berty
```

### Berty Messenger

[![Code coverage](https://codecov.io/gh/berty/berty/branch/master/graph/badge.svg?token=rBPpNHNNow&flag=js.unittests)](https://codecov.io/gh/berty/berty)

A messenger application written in [React Native](https://reactnative.dev/), that uses the Berty Protocol using [gomobile-ipfs](https://github.com/ipfs-shipyard/gomobile-ipfs), which, in its turn, is using [gomobile](https://github.com/golang/mobile).

## Main items in the repo

- [./go](go): Where all the Golang code belongs.
  - [./go/pkg/**bertyprotocol**](go/pkg/bertyprotocol): **Berty Protocol** _Golang SDK_ to create secure and autonomous groups using _IPFS_.
  - [./go/framework/bertybridge](go/framework/bertybridge): gomobile entrypoint.
  - [./go/cmd/**berty**](go/cmd/berty): Main **Berty CLI**, containing:
    - `berty daemon`: Runs the whole Berty Protocol instance.
    - `berty mini`: Simple CLI messenger app using Berty Protocol.
  - [./go/cmd/**rdvp**](go/cmd/rdvp): A Rendez-Vous Point server.
  - [./go/cmd/**betabot**](go/cmd/betabot): An onboarding bot used during the beta phase.
  - [./go/cmd/**testbot**](go/cmd/testbot): A bot used by integration tests and developers.
- [./js](js): Where all the Javascript/Typescript code belongs, containing:
  - The **Berty Messenger** application, written in React Native.
- [./docs](docs): Mostly auto-generated documentation.

## Philosophy

We want to contribute to the world of free, secure communication without fear of censorship and surveillance.

Open source is more secure, since anyone can examine the code, improve it and maintain it. Our ultimate goal is to completely lose control of Berty and have it evolve as a global community project.

More info on [berty/community](https://github.com/berty/community).

## Install

### Mobile

To compile and run the mobile app on your device, see [js/README.md](js/README.md).

### CLI

You can `go run` or `go install` the CLI tool located in `go/cmd/berty`.
The two main commands are:

- `berty mini`: CLI messenger app using Berty Protocol.
- `berty daemon`: full node manageable through Berty Protocol API.

## Contributing

![Contribute to Berty](https://assets.berty.tech/files/contribute-contribute_v2--Contribute-berty-ultra-light.gif)

We really welcome contributions. Your input is the most precious material. We're well aware of that and we thank you in advance. Everyone is encouraged to look at what they can do on their own scale; no effort is too small.

There are plenty of ways to get involved and act for our community. It has been divided into two distinct parts: everything that is related to the code and everything that is not.

To put it very simply:

- Code-related = Github
- Not code-related = Open task

Everything on contribution is sum up here: [CONTRIBUTING.MD](https://github.com/berty/community/blob/master/CONTRIBUTING.md)

## Stargazers over time

[![Stargazers over time](https://starchart.cc/berty/berty.svg)](https://starchart.cc/berty/berty)

## Other resources

- Official website: https://berty.tech
- Assets: https://assets.berty.tech/
- App assets & mockups: https://assets.berty.tech/categories/app__v2.4/

## Contact

Take a look at our [community repo](https://github.com/berty/community/).

See all our available contact methods on the [contact page](https://berty.tech/contact) of our website.

## Licensing

© 2018-2021 [Berty Technologies](https://berty.tech)
h0

Licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0) ([`LICENSE-APACHE`](LICENSE-APACHE)) or the [MIT license](https://opensource.org/licenses/MIT) ([`LICENSE-MIT`](LICENSE-MIT)), at your option. See the [`COPYRIGHT`](COPYRIGHT) file for more details.
