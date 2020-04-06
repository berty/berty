# Berty `js/`

**Please, read the main [`README.md`](../README.md) file first.**

This folder contains most of the Typescript and Javascript code needed for the Berty Chat mobile apps.

## Run Berty Chat (macOS)

### 1. Requirements

The installation list may look daunting, but if you have some experience in mobile development, you likely have most of them already!

In addition to the _General requirements for React Native_ below, you'll need:

- An installation of [golang](https://golang.org/dl/), plus:
  - Your `$GOPATH` explicitly set to your golang directory (usually `$HOME/go`)
  - The gomobile package: `go get golang.org/x/mobile/cmd/gomobile/... && gomobile init`
- [Bazel](https://docs.bazel.build/versions/master/install-os-x.html#install-with-installer-mac-os-x)
- _Android only:_ Java 8. If you already have another version of Java, you can use a version manager and Homebrew to add another installation. Some nice instructions are given [here](https://java.christmas/2019/16).

### 2. Run required services

`make start.metro`

`make start.grpc-bridge.orbitdb`

### 3. Build for Android and iOS

#### iOS

`device="[iPhone 11]|[your-device-name]" make run.ios.debug`

#### Android

`device="[your device name]" make run.android.debug`

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

`make run.storybook.ios`

#### Android

`make run.storybook.android`

## Known issues

- `make run.storybook.*` outputs error `Error: => Create a storybook config file in "./.storybook/config.{ext}".` during build
- gRPC errors on iOS and Android views
