![](https://i.imgur.com/ZwCkje3.gif)

<p align="center"><b>
  <a href="https://berty.tech">berty.tech</a> •
  <a href="https://twitter.com/berty">Twitter</a> •
  <a href="http://crpt.fyi/berty-discord">Discord</a> •
  <a href="https://github.com/berty">GitHub</a>
</b></p>

# Contributing Guidelines


Do you want to help Berty? That's awesome! There are lots of ways of doing so. Here's a little comprehensive guide to get everything together more effectively! Please tell us if something is missing/incorrect. We would be happy to update and improve this document. 

At any time, community members are invited to: 
- ask any questions they have
- report bugs 
- contribute to long-term strategic discussions
- suggest new features
- increase the geographic reach of the community
- raise awareness of privacy issues among the general public

## Table of Contents

[TOC]


## The Berty Technologies Organization

Berty Technologies is an NGO based in Paris, France. The main aim is to defend privacy and fight against censorship and surveillance. If these topics mean something to you, you are in the right place!


1. `Berty Messenger`: An application that makes it possible to communicate anonymously and securely, with or without internet access.
2. `Berty Protocol`: A new protocol for distributed and secure communication that can be used by anyone. 
3. `Berty Fighter Programs`: A set of actions to educate, prevent, and combat mass surveillance and censorship.

### Berty Repos

* Our main repo: [Berty Repo](https://github.com/berty/berty)
* Community & Meeting Notes: [Berty Community](https://github.com/berty/community)
* Website, blog, and more: [Berty Website](https://github.com/berty/www.berty.tech)
* All our assets: [Berty Assets](https://github.com/berty/assets) 

> Exhaustive list of all our repo: [Berty Organization](https://github.com/berty)
> All our project (not only in our organization): [Berty Topics](https://github.com/topics/berty)


### Berty Documentation

* Documentation: [Berty Docs](https://berty.tech/docs/)

## Security Issues

Berty's staff takes security and privacy issues seriously. If you discover a potential point of failure, please bring it to their attention immediately!

**Please DO NOT file a public issue, but rather send your report privately to security@berty.tech.**

Security reports are very much appreciated, and we thank you publicly, although we will keep your name confidential if you request it. We also like sending gifts - if you like stickers/caps/hoodies, be sure to let us know. We do not currently offer a paid security premium program, but we will not exclude it in the future.

Read more: [SECURITY.md](https://github.com/berty/community/blob/master/SECURITY.md)

## Community Guidelines

### Code of Conduct 

This repository falls under the Berty [Code of Conduct](https://github.com/berty/community/blob/master/CODE_OF_CONDUCT.md)

We hope that our community will act according to these guidelines, and that participants will hold each other to these high standards. If you have any questions or are worried that the code isn't being followed, please contact the owner of the repository.

### Language

The development language is **English**. All comments and documentation should be written in English, so we can share our knowledge with developers around the world.

### Community 

* See https://berty.tech/community

### Connected as Peers

  - Join us on Discord - https://crpt.fyi/berty-discord
  - Blog - https://berty.tech/blog
  - Twitter - [@Berty](https://twitter.com/berty)
  - Medium - https://medium.com/berty-tech
  - Github - https://github.com/berty 

### Have a question?

* Ask the community on [Discord](https://crpt.fyi/berty-discord)

## Ways to contribute

There are many ways to contribute, even if you’re not a technical person.

### Quick Dive in!

Please Contribute! Look at the available [issues](https://github.com/issues?q=is%3Aissue+is%3Aopen+org%3Aberty+archived%3Afalse+sort%3Aupdated-desc++label%3A%22help+wanted%22)


### Bug report

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/berty/berty/issues/new). It's that easy! Don't forget to check if this has been reported before ([current `bug` labeled issues](https://github.com/berty/berty/issues?q=is%3Aissue+is%3Aopen+label%3Abug))


Please provide as much information as you possibly can:
* A quick summary and/or background
* Steps to follow
   * Be specific!
   * Give sample code if you can.
* What you expected would happen
* What actually happens
* Notes (possibly including why you think this might be happening, or stuff you tried that didn't work).

### Suggest a feature

[Open a new issue](https://github.com/berty/berty/issues/new).

### Hack Berty

If you want to hack Berty (and we'll be very happy if you do), check out the contribution code section of this page! 


### Translation [In Progress]

We are currently looking for a way to support multiple languages on the Berty Website & App. Join the discussion: https://github.com/berty/berty/issues/1820

### Community Involvment

We aim to have a growing and caring community. Everyone is welcomed! 

All discussions around the community are done on a dedicated [`berty/community`](https://github.com/berty/community) repo GitHub. 

Everyone is free to participate in discussions or to propose [new ideas](https://github.com/berty/community/issues/new).

> If you want to discuss/chat with the Berty community, join us on Discord! 


## Code Contributions

We’re really happy to accept contributions from the community, that’s the main reason why we open-sourced it!

### Workflow

We’re using an _even more simplified_ version of the [simplified Github workflow](http://scottchacon.com/2011/08/31/github-flow.html):
1. ~~Create an issue related to the problem you want to fix (good for traceability and cross-reference)~~ _(cool but optional)_
2. Fork the repository
3. Create a branch
4. Hack hack hack
5. Submit a pull-request against the master branch of this repository

### Pull requests are always welcome

We are always thrilled to receive pull-requests, and do our best to process them as fast as possible. Not sure if that typo is worth a pull-request? Do it! We will appreciate it.

If your pull-request is not accepted on the first try, don't be
discouraged! If there's a problem with the implementation, hopefully you will receive feedback on what to improve.

### Commits

We use the [conventional commit](https://www.conventionalcommits.org/en/v1.0.0/), configured on [Angular's Commit Message Guidelines](https://github.com/angular/angular/blob/22b96b9/CONTRIBUTING.md#-commit-message-guidelines).

### Create issues...

Any significant improvement should be documented as [a GitHub issue](https://github.com/berty/berty/issues) before anybody starts working on it.

### ...but check for existing issues first!

Please take a moment to check that your bug report or enhancement proposal has not already been mentioned. If so, quickly add a "+1" or "I have this problem too". This will greatly help us prioritize the most common problems and requests.

### Conventions

Each repository will have its own code and test conventions. Please make sure to review those before jumping in. Some general conventions are listed below.

#### Go

Please look at the [Go Contribution Guidelines](./CONTRIBUTING_GO.md).

#### JavaScript

Please look at the [JS Contribution Guidelines](./CONTRIBUTING_JS.md).

#### Git

We use a simple git branching model:

- `master` must always work
- create feature-branches to merge into `master`
- all commits must pass testing so that git bisect is easy to run

Just stay current with master (rebase).

### Use a Consistent Coding Style

Write clean code. Universally formatted code promotes ease of writing, reading, and maintenance.

### Merge approval

Berty staff use built-in GitHub review systems and/or in comments like LGTM (looks good to me) on the code review to indicate acceptance.



## Certificate of Origin

By contributing to this project, you agree to the [Developer Certificate of Origin (DCO)](DCO). This document was created by the Linux Kernel community and is a simple statement that you, as a contributor, have the legal right to make the contribution.

In order to show your agreement with the DCO you should include at the end of commit message, the following line: `Signed-off-by: John Doe <john.doe@example.com>`, using your real name.

This can be done easily using the [`-s`](https://github.com/git/git/blob/b2c150d3aa82f6583b9aadfecc5f8fa1c74aca09/Documentation/git-commit.txt#L154-L161) flag on the `git commit`.


### Small patch exception

There are several exceptions for the signing requirement. Currently these are:

* Your patch fixes spelling or grammar errors.
* Your patch is a single line change to documentation.

### License

Licensing is described in each repo.

In most cases:

* Most of the time, it falls under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0) ([`LICENSE-APACHE`](LICENSE-APACHE)) or the [MIT license](https://opensource.org/licenses/MIT) ([`LICENSE-MIT`](LICENSE-MIT)), at your option. See [Licensing](https://github.com/berty/berty/blob/master/README.md#licensing) of the main Berty Repo for more details.
* Documentation falls under a Creative Commons — Attribution-ShareAlike 4.0 International License.

> Feel free to contact the Berty staff if that's a concern.


## Authors

* **Pierre FERMEY** - *Initial work* - [@pierreboc](https://github.com/pierreboc)
* **zôÖma** - *Initial work* - [@zooma2k18](https://github.com/zooma2k18)

See also the list of [contributors](https://github.com/berty/berty/contributors) who participated in this project. Berty is an open source project with a community that grows every day. We will be happy to add your name to the list of contributors.

## Credits

This document is based on:

* [Contributing to Docker](https://github.com/docker/docker/blob/master/CONTRIBUTING.md)
* [IPFS Contribution Guidelines](https://github.com/ipfs/community/blob/master/CONTRIBUTING.md#dive-right-in)
* [Facebook Contributing to Draft.js](https://github.com/facebook/draft-js/blob/a9316a723f9e918afde44dea68b5f9f39b7d9b00/CONTRIBUTING.md)
* [source{d} Contributing Guidelines](https://github.com/src-d/guide/blob/master/engineering/documents/CONTRIBUTING.md)

## Appendix and FAQ

> **Find this document incomplete?** Open an issue!
