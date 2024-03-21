<h1 align="center">
  <img src="https://berty.tech/img/berty.svg" alt="Berty" title="Berty" height="300px" />
</h1>

<h3 align="center"> Berty is an open, secure, offline-first, peer-to-peer and zero trust messaging app </h3>

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

## TLDR : Install it!

### Mobile

To use the latest released version, install it from [Google Play](https://play.google.com/store/apps/details?id=tech.berty.android)
or [Apple App Store](https://apps.apple.com/tt/app/berty/id1535500412).

To compile and run the mobile application on your device, see [js/README.md](js/README.md).

### CLI

You can `go run` or `go install` the CLI tool located in `go/cmd/berty`.
The two main command line utilities are:

- `berty mini`: a CLI messaging app using the Wesh Protocol.
- `berty daemon`: a full node manageable through the Wesh Protocol API.

## Introduction

> **Warning**: Berty is still under active development and should not yet be used to exchange sensitive data.

**[Berty](https://berty.tech/)** is a privacy-first messaging application built on top of [the Wesh Protocol](https://berty.tech/docs/protocol/).

- *Secure and private* :
    - Messages are end-to-end encrypted by default
    - Metadata is kept to a minimum
    - No phone number or email address is required to create an account
    - Built to retain its properties even when used on adversarial networks
- *Censorship-resilient*
    - Decentralized, distributed, peer-to-peer and serverless
    - No internet connection is required, thanks to [BLE technology](https://en.wikipedia.org/wiki/Bluetooth_Low_Energy) and [mDNS](https://en.wikipedia.org/wiki/Multicast_DNS).
- *Open* :
    - Free forever and open-source

**Berty** is designed to be used as a communication tool when all other traditional messengers fail. Berty Messenger serves the following use cases:

- When you need to share sensitive information over untrusted networks, for instance while traveling
- If you want to communicate anonymously
- If you want full control over your data and thus don't want to rely on third-party servers
- In countries that actively monitor and temper with their network, restricting its use and censoring some of its contents
- In areas with weak or no connection at all

Berty is currently developed by **[Berty Technologies](https://berty.tech/about)**, a French nonprofit organization.

**Note: this project is led by a small team made of humans, who make mistakes. Please do not hesitate to point out bugs or missing features.** _See the [contribute section](#contribute) below._

> We cannot promise we will offer you the best application, but we dedicate ourselves to doing our best to create a great one.

### The philosophy behind Berty

We want to contribute to a world where free and secure communications are common and fear of censorship or surveillance are not.

We believe that open-source is more secure, as anyone can examine the code and improve it: this is why we rely on and build open and free software.

As the founding team, our ultimate goal is to progressively relinquish control over Berty and to make it become a truly global community project.

More info on [berty/community](https://github.com/berty/community).

## Development Status

The current Berty implementation is using the [Wesh Protocol](https://berty.tech/docs/protocol/), which means the encryption technique is safe, and it works as a peer-to-peer app!

Alas, Berty has not yet been hardened, so please avoid using it on devices with weak sandboxes, such as unpatchable devices that use old Android versions.

The current Wesh Protocol is _partially implemented_.

The API will continue to evolve in the near future. As such, we cannot yet guarantee none-breaking changes, or any kind of API stability. Be prepared for a rough ride if you start rolling the Wesh Protocol in your application.

_[Subscribe](https://tech.us20.list-manage.com/subscribe/post?u=5ca3993c7f0b8f646dcda714b&id=4d7828715b) to our newsletter if you wish to be notified about the latest features and releases._

**Note: The repositories are being opened progressively, and there will be additional modifications and updates soon.**

## Under the hood

![Berty Messenger High Level Architecture](docs/architecture/Berty_Messenger_Architecture.jpg)

### Wesh Protocol

[![go.dev reference](https://img.shields.io/badge/go.dev-reference-007d9c?logo=go&logoColor=white)](https://pkg.go.dev/berty.tech/berty/v2/go/pkg/bertyprotocol?tab=doc)
[![Code coverage](https://codecov.io/gh/berty/berty/branch/master/graph/badge.svg?token=rBPpNHNNow&flag=go.unittests)](https://codecov.io/gh/berty/berty)

The Wesh Protocol comes with a generic, but full-featured SDK allowing developers to write peer-to-peer applications. You can just focus on high-level features for your app, we will take care of the rest (encryption, identities, network routing, group management, account management, device management, application lifecycle).

The main concept of the _Wesh Protocol_ is called the "group", a virtual place where multiple devices can share messages and metadata using [OrbitDB](https://github.com/orbitdb), which itself relies on the InterPlanetary File System ([IPFS](https://en.wikipedia.org/wiki/InterPlanetary_File_System))

<!-- _TODO: add usage examples_ -->

Get it:

```
git clone https://github.com/berty/berty
```

### The Berty Messenger

[![Code coverage](https://codecov.io/gh/berty/berty/branch/master/graph/badge.svg?token=rBPpNHNNow&flag=js.unittests)](https://codecov.io/gh/berty/berty)

The Berty Messenger, or simply Berty, is a messaging application written in [React Native](https://reactnative.dev/), that uses the Wesh Protocol through [gomobile-ipfs](https://github.com/ipfs-shipyard/gomobile-ipfs), which, in turns, is using [gomobile](https://github.com/golang/mobile).

## Main items in the repo

- [./go](go): Where all the Golang code lies.
  - [./go/framework/bertybridge](go/framework/bertybridge): The gomobile entrypoint.
  - [./go/cmd/**berty**](go/cmd/berty): The main **Berty CLI**:
    - `berty daemon`: Runs the whole Wesh Protocol instance.
    - `berty mini`: Simple CLI messenger application using Wesh Protocol.
  - [./go/cmd/**rdvp**](go/cmd/rdvp): A Rendez-Vous Point server.
  - [./go/cmd/**welcomebot**](go/cmd/welcomebot): An onboarding bot used during the early phase.
  - [./go/cmd/**testbot**](go/cmd/testbot): A bot used by integration tests and developers.
- [./js](js): Where all the Javascript/Typescript code lies:
  - The **Berty Messenger** application, written in React Native.
- [./docs](docs): Mostly auto-generated documentation.

## Contributing

![Contribute to Berty](https://assets.berty.tech/files/contribute-contribute_v2--Contribute-berty-ultra-light.gif)

We welcome contributions! Your input is deeply appreciated and extremely valuable to us. We thank you in advance for it.

There is no small feat: everyone is encouraged to do what they can to help, based on their ability and interest.

There are plenty of ways to get involved and to help our community, which can roughly be divided in two distinct parts: everything that is related to the code and everything that is not.

To put it simply:

- Code-related = GitHub
- Not code-related = Open a task

Everything about contribution is summed up here: [CONTRIBUTING.MD](https://github.com/berty/community/blob/master/CONTRIBUTING.md)

## Stargazers over time

[![Star History Chart](https://api.star-history.com/svg?repos=berty/berty&type=Date)](https://star-history.com/#berty/berty&Date)

## Other resources

- Official website: https://berty.tech
- Assets: https://assets.berty.tech/
- Application assets & mockups: https://assets.berty.tech/categories/app__v2.4/

## Contact

For a direct contact, see our [contact page](https://berty.tech/contact) of our website. Alternatively, take a look at our [community repository](https://github.com/berty/community/).

## Licensing

© 2018-2023 [Berty Technologies](https://berty.tech)

Licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0) ([`LICENSE-APACHE`](LICENSE-APACHE)) or the [MIT license](https://opensource.org/licenses/MIT) ([`LICENSE-MIT`](LICENSE-MIT)), at your discretion. See the [`COPYRIGHT`](COPYRIGHT) file for more details.
