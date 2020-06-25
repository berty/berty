# Berty `js/`

**Please, read the main [`README.md`](../README.md) file first.**

This folder contains most of the Typescript and Javascript code needed for the Berty Chat mobile apps.

## Run Berty Chat (macOS)

### Requirements

The installation list may look daunting, but if you have some experience in mobile development, you likely have most of them already!

In addition to the _**General requirements for React Native**_ below, you'll need:

- An installation of [golang](https://golang.org/dl/), plus:
  - Your `$GOPATH` explicitly set to your golang directory (usually `$HOME/go`)
  - The gomobile package: `go get golang.org/x/mobile/cmd/gomobile/... && gomobile init`
- [Bazel](https://docs.bazel.build/versions/master/install-os-x.html#install-with-installer-mac-os-x)
- _Android only:_ Java 8. If you already have another version of Java, you can use a version manager and Homebrew to add another installation. Some nice instructions are given [here](https://java.christmas/2019/16).

### 1. Run required services

Run JS bundler:

`make metro.start`

Run two nodes so you can run two app instances and use network protocol functionality:

`make bridge.start

### 2. Launch in device simulators

_Run two simulators so you can use chat features._

#### Run on iOS

`make ios.run`

_You'll have some errors, don't worry about them for now._

#### Run on Android

⚠️ Android build currently not maintained.

`make android.run`

### 3. Create accounts in simulators and choose a bridge

Click get started in the app UI. In the second text field, enter the port chosen when you launched the bridges in the commands above.

### Troubleshooting in iOS

You may need to clear the app state if you continue getting GRPC warnings in your iOS simulator. Do this in iOS simulator with Cmd+D, then select 'Refresh async state.'

## General requirements for React Native

- `yarn` to install Nodejs dependencies
- Homebrew or package manager of choice

### Requirements for iOS

- OS X
- Xcode _(latest stable)_
- Node & Watchman (`brew install node`, `brew install watchman`)
- CocoaPods (`sudo gem install cocoapods` or follow official [sudo-less instructions](https://guides.cocoapods.org/using/getting-started.html#sudo-less-installation))

### Requirements for Android

- An Android app development environment, for e.g [Android Studio](https://developer.android.com/studio/install)
- A valid SDK (Add it from Android Studio's SDK Manager GUI -> `Appearance and Behavior -> System Settings -> Android SDK`)
  - In `SDK Platforms` tab, select some recent SDK
  - In `SDK Tools` tab, check Android SDK Build-Tools, LLDB, NDK, CMake, Android Emulator, Android SDK
- Environment variables:
  - `$ANDROID_HOME` must be set to some directory in your `$PATH` and point to an SDK platform (make sure `ANDROID_HOME=/Users/You/Library/Android/sdk` exists and has stuff in it).
  - You should be able to run `emulator` and `adb` (these are binaries in \$ANDROID_HOME subfolders)

## UI component development

Storybook enables isolated development of UI component libraries. Examples and source code are in the [packages](./packages) subfolder.

### Launch Storybook components in an emulator

#### iOS

`make storybook.ios`

#### Android

`make storybook.android`

## Run the web dev app

### 1. Requirements

- `yarn`

### 2. Run required services

- `cd packages/web-dev-app && yarn && yarn start`
- `BERBY_BRIDGE_PORT=1337 make bridge.start`
- `BERTY_BRIDGE_PORT=1338 make bridge.start`

### 3. Navigate to the app

`yarn start` should have opened a browser tab already but if that's not the case, navigate to `localhost:3000`

### 4. Create an account and choose a bridge

In the app's ui, you have to choose a bridge port when you create your account, if you started the services using the commands above, you will have a service on port `1337` and one on port `1338`

You can use one normal tab and one private tab to have two accounts at the same time

## Known issues

- `make storybook.*` outputs error `Error: => Create a storybook config file in "./.storybook/config.{ext}".` during build

- gRPC errors on iOS and Android views

- `make metro.start` outputs `warning: the transform cache was reset. Loading dependency graph...'config.server.enableVisualizer' is enabled but the 'metro-visualizer' package was not found - have you installed it?`
