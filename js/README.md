# Berty `js/`

## Introduction

This folder contains most of the Typescript and Javascript code needed for the Berty Messenger mobile apps. The code is **organized into packages** in `./js/packages`. Only some of them are freestanding.

**Please, read the main [`README.md`](../README.md) file first.**

- [Berty `js/`](#berty--js--)
  - [Packages](#---packages)
  - [Usage](#usage)
    - [Running the mobile apps for development](#running-the-mobile-apps-for-development)
  - [Requirements](#requirements)
    - [Requirements for working on iOS and Android apps](#requirements-for-working-on-ios-and-android-apps)
    - [General React Native requirements](#general-react-native-requirements)
    - [iOS dev requirements](#ios-dev-requirements)
    - [Android dev requirements](#android-dev-requirements)
  - [Known issues and troubleshooting](#known-issues-and-troubleshooting)

## 📦 Packages

| directory                                                                   | description                                                                                    |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| [api/](https://github.com/berty/berty/tree/master/js/packages/api)          | Interfaces with the [Berty golang services](https://github.com/berty/berty/tree/master/go/pkg) |
| [messenger-app/](./packages/messenger-app/)                                         | Berty Messenger react root                                                                 |
| [i18n/](./packages/i18n)                                        | Locale support files                                                                           |
| [components](./packages/components) | React Native components |
| [go-bridge/](./packages/go-bridge)                                          | Berty daemon native module
| [grpc-bridge/](./packages/grpc-bridge)                                      | Collection of grpc utilities used to interface with the daemon                                                                   |
| [navigation/](./packages/navigation)                                        | Berty Messenger + react-native-navigation                                                     |
| [store/](./packages/store)                                                  | App state control using React hooks and Context |
| [styles/](./packages/styles)                                                | Generates StyleSheet utilities and styles that conform to our design specs                     |

## 🔨 Usage

```shell
$ cd ./js
$ make help
```

### Running the mobile apps for development

💡 First, verify you have the [relevant Requirements](#requirements) 😉

```console
## Optional if not modifying any .proto file
## Generate files using protobuf
$ make generate

## Build and serve UI
$ make metro.start

## Optional if using only one device
## Run this with different ports to test with multiple devices
$ BERTY_DAEMON_PORT=1337 make daemon.start
$ BERTY_DAEMON_PORT=1338 make daemon.start

## iOS
## Run iOS app in debug mode
$ make ios.debug
## Optional if using only one device
## Run this with different iOS device names
$ IOS_DEVICE=__IOS_DEVICE_NAME_1__ make ios.debug
$ IOS_DEVICE=__IOS_DEVICE_NAME_2__ make ios.debug

💡 You can check available virtual iOS devices with `xcrun simctl list`

## Android
## Run Android app in debug mode
$ make android.debug
## Optional if using only one device
## Run this with different Android device IDs
$ ANDROID_DEVICE=__ANDROID_DEVICE_ID_1__ make android.debug
$ ANDROID_DEVICE=__ANDROID_DEVICE_ID_2__ make android.debug

💡 You can check available Android Virtual Devices with `adb devices`
```

## 🧳 Requirements

### Requirements for working on iOS and Android apps

- The [General React Native requirements](#general-react-native-requirements)
- [iOS dev reqs](#ios-dev-requirements) **and/or** [Android dev reqs](#android-dev-requirements)
- [Watchman](https://facebook.github.io/watchman/docs/install/) to enable live reloading
- [Docker Desktop](https://docs.docker.com/docker-for-mac/install/)
- The [gomobile package](https://godoc.org/golang.org/x/mobile/cmd/gomobile): `go get golang.org/x/mobile/cmd/gomobile/... && gomobile init`

💡 `$GOPATH` may need to be set explicitly (usually `$HOME/go`)

### General React Native requirements

- Homebrew or package manager of choice
- Node >= 12.x
- The [yarn package manager](https://classic.yarnpkg.com/en/)

### iOS dev requirements

- Mac OS X
- XCode _(latest stable)_

### Android dev requirements

- An Android app **development environment**, e.g. [Android Studio](https://developer.android.com/studio/install)
- **Android SDK**, with the following enabled (in Android Studio Code in `Tools --> SDK Manager`):
  - Android SDK Build-Tools
  - LLDB
  - NDK
  - Cmake
  - Android SDK Command-line Tools
- A physical or virtual **Android device** (in Android Studio, `Tools --> AVD Manager`)
- **Java 8**. If you already have another version of Java, you can use a version manager and Homebrew to add another installation. Some nice instructions are given [here](https://java.christmas/2019/16).

💡 Check you can run all the commands `sdkmanager`, `emulator`, `ndk-bundle`, and `adb` (these are binaries in `$ANDROID_HOME` subfolders)
