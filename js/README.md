# Berty `js/`

## Introduction

This folder contains most of the Typescript and Javascript code needed for the Berty Messenger mobile apps. The code is **organized into packages** in `./js/packages`. Only some of them are freestanding.

**Please, read the main [`README.md`](../README.md) file first.**

- [Berty `js/`](#berty--js--)
  - [Packages](#---packages)
  - [Usage](#usage)
    - [Running the mobile apps for development](#running-the-mobile-apps-for-development)
    - [Running the web dev app](#running-the-web-dev-app)
  - [Requirements](#requirements)
    - [Requirements for working on iOS and Android apps](#requirements-for-working-on-ios-and-android-apps)
    - [General React Native requirements](#general-react-native-requirements)
    - [iOS dev requirements](#ios-dev-requirements)
    - [Android dev requirements](#android-dev-requirements)
    - [web-dev-app requirements](#web-dev-app-requirements)
  - [Known issues and troubleshooting](#known-issues-and-troubleshooting)

## 📦 Packages

| directory                                                                   | description                                                                                                                                           |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [api/](https://github.com/berty/berty/tree/master/js/packages/api)          | Interfaces with the [Berty golang services](https://github.com/berty/berty/tree/master/go/pkg)                                                        |
| [babel-preset/](https://github.com/berty/berty/tree/master/js/packages/api) | Defines babel config                                                                                                                                  |
| [berty-app/](./packages/berty-app/)                                         | Core Berty Messenger code                                                                                                                             |
| [berty-i18n/](./packages/berty-i18n)                                        | Locale support files                                                                                                                                  |
| [codegen/](./packages/codegen)                                              | Creates types from api data structures                                                                                                                |  | [components](./packages/components) | React Native components |
| [eslint-config/](./packages/eslint-config)                                  | JavaScript/TypeScript linter config                                                                                                                   |
| [go-bridge/](./packages/go-bridge)                                          | Connects golang berty node codebase to native mobile code                                                                                             |
| [grpc-bridge/](./packages/grpc-bridge)                                      | Collection of grpc utilities                                                                                                                          |
| [hooks/](./packages/hooks)                                                  | React hooks that allow us to connect the app state to React components                                                                                |
| [navigation/](./packages/navigation)                                        | React Native navigation configuration                                                                                                                 |
| [prettier-config/](./packages/prettier-config)                              | [prettier](https://prettier.io/) code formatting config                                                                                               |
| [store/](./packages/store)                                                  | App state control using [React Redux sagas](https://redux-saga.js.org/)                                                                               |
| [storybook-mobile/](./packages/storybook-mobile)                            | Allows independent development of React Native components using [Storybook for Ract Native](https://storybook.js.org/docs/guides/guide-react-native/) |
| [storybook-web/](./packages/storybook-web)                                  | Same goal as `storybook-mobile`, but allows component development in the browser                                                                      |
| [styles/](./packages/styles)                                                | Generates StyleSheet utilities and styles that conform to our design specs                                                                            |
| [web-dev-app/](./packages/web-dev-app)                                      | A minimal React web app that allows us to easily test our `hooks` and `store` functionality                                                           |

## 🔨 Usage

```shell
$ cd ./js
$ make help
```

### Running the mobile apps for development

💡 First, verify you have the [relevant Requirements](#requirements) 😉

```shell
$ make generate

## Mobile app development building
$ make metro.start

## Optional if using one device.
$ BERTY_BRIDGE_PORT=1337 make.bridge
## Run this with multiple different ports to test with multiple clients.
## $ BERTY_BRIDGE_PORT=1338 make.bridge

## iOS
IOS_DEVICE=__IOS_DEVICE_NAME__ make ios.run
## Run multiple devices to connect them to different running bridge ports!

## Android
$ emulator -avd __ANDROID DEVICE_NAME__
ANDROID_DEVICE=__ANDROID_DEVICE_ID__ make android.run
```

### Running the web dev app

🚧 This debugging tool is primarily used internally and not actively maintained except by developers for their own usage.

#### 1. Requirements

- `yarn`

#### 2. Run required services

- `cd packages/web-dev-app && yarn && yarn start`
- `BERBY_BRIDGE_PORT=1337 make bridge.start`
- `BERTY_BRIDGE_PORT=1338 make bridge.start`

#### 3. Navigate to the app

`yarn start` should have opened a browser tab already but if that's not the case, navigate to `localhost:3000`

#### 4. Create an account and choose a bridge

In the app's ui, you have to choose a bridge port when you create your account, if you started the services using the commands above, you will have a service on port `1337` and one on port `1338`

You can use one normal tab and one private tab to have two accounts at the same time

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
- CocoaPods (`sudo gem install cocoapods` or follow official [sudo-less instructions](https://guides.cocoapods.org/using/getting-started.html#sudo-less-installation))

💡 You can check available virtual iOS devices with `xcrun simctl list`

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
💡 Check there is at least one device in the output of `emulator -list-avds`

### web-dev-app requirements

- The [yarn package manager](https://classic.yarnpkg.com/en/)

## 🚧 Known issues and troubleshooting

- `make storybook.*` outputs error `Error: => Create a storybook config file in "./.storybook/config.{ext}".` during build
- gRPC errors on iOS and Android views (usually you can dismiss these and/or quit and re-open the app)
