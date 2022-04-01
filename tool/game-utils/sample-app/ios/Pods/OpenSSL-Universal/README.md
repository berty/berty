# OpenSSL-Universal

OpenSSL [CocoaPods](https://cocoapods.org/), [Carthage](https://github.com/Carthage/Carthage) and [Swift Package Manager](https://swift.org/package-manager/) package for iOS and macOS. Complete solution to OpenSSL on iOS and macOS. Package came with precompiled libraries, and include script to build newer version if necessary.

Current version contains binaries build with latest iOS SDK iOS (target 7.0), and latest macOS SDK (target 10.10) for all supported architectures (including macOS Catalyst).

### Support

It takes some time to keep it all for your convenience, so maybe spare $1, so I can keep working on that. There are more than 8000 clones daily. If I'd get $1/month from each company that uses my work here, I'd say we're even. Hurry up, find the [Sponsorship](https://github.com/users/krzyzanowskim/sponsorship) button, and fulfill your duty.

### Architectures

- iOS with architectures: armv7, armv7s, arm64 + simulator (x86_64, arm64)
- macOS with architectures: x86_64, arm64

#### Output Formats

- Static library [libcrypto.a, libssl.a](iphoneos/lib/)
- [OpenSSL.framework](Frameworks/)
- [OpenSSL.xcframework](Frameworks/)

### Why?

[Apple says](https://developer.apple.com/library/mac/documentation/security/Conceptual/cryptoservices/GeneralPurposeCrypto/GeneralPurposeCrypto.html):
"Although OpenSSL is commonly used in the open source community, OpenSSL does not provide a stable API from version to version. For this reason, although OS X provides OpenSSL libraries, the OpenSSL libraries in OS X are deprecated, and OpenSSL has never been provided as part of iOS."

### Installation

#### Build

You don't have to use pre-build binaries I provider. You can build it locally on your trusted machine.

```
$ git clone https://github.com/krzyzanowskim/OpenSSL.git
$ cd OpenSSL
$ make
```

The result of build process is put inside [Frameworks](Frameworks/) directory.

### Hardened Runtime (macOS) and Xcode

Binary `OpenSSL.xcframework` (Used by the Swift Package Manager package integration) won't load properly in your app if the app uses **Sign to Run Locally**  Signing Certificate with Hardened Runtime enabled. It is possible to setup Xcode like this. To solve the problem you have two options:
- Use proper Signing Certificate, eg. *Development* <- this is the proper action
- Use `Disable Library Validation` aka `com.apple.security.cs.disable-library-validation` entitlement

### Swift Package Manager

```
dependencies: [
    .package(url: "https://github.com/krzyzanowskim/OpenSSL.git", .upToNextMinor(from: "1.1.180"))
]
```

### CocoaPods

````
pod 'OpenSSL-Universal'
````

### Carthage

```
github "krzyzanowskim/OpenSSL"
```

### Authors

[Marcin Krzyżanowski](https://twitter.com/krzyzanowskim)

## FAQ etc.
#### Where can I use OpenSSL-Universal?
These libraries work for both iOS and macOS. There are two OpenSSL static libraries; `libcrypto.a` and `libssl.a` Do NOT expect these OpenSSL files to work on every CPU architecture in the world. It is your prerogative to check. Ask yourself, are you trying to write an app for old devices? new devices only? all iOS devices? only macOS?, etc ::

#### Fat Binaries
The OpenSSL-Universal Framework is a Fat Binary. That means it supports multiple CPU architectures in a single file. To understand this, return to `Terminal`.  Navigate to your OpenSSL-Universal macOS files and run the command `file libcrypto.a`  This will tell you architecture the file is compiled against `x86_64`.  If you tried the iOS OpenSSL-Universal files it would have said `armv7`, `armv7s`, `arm64` + Simulators (`x86_64`).

#### Xcode Setup
You want to ensure Xcode knows;

1. Where the OpenSSL static libraries are located.
2. Where the OpenSSL header files are located for the C include statements.
Inside your workspace, go to the Target (not the Project).  The Target is the C app that is produced after a successful build. Select `Build Phases` and `Link Binary With Libraries`.  Select `+` and navigate to the static OpenSSL libraries that was included in the framework.  The magical result was, your `Target` and `Building Settings` `Library Search Paths` were populated without you typing anything. Now go to the  Target.  In `Build Settings` set the `Always Search User Paths` to `Yes`. Then add a new entry to the `User Header Search Paths`. This should be the location of the OpenSSL header files that were included in OpenSSLUniversal.