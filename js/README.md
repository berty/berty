# Berty Messenger

## Introduction

This folder contains most of the Typescript and Javascript code needed for the Berty Messenger mobile app. The code is **organized into packages** in [./packages](./packages). Only some of them are freestanding.

## Run the app

💡 First, verify you have the relevant [requirements](#Setup) 😉

Build and serve mobile UI:

```bash
$ make metro.start
```

Run iOS app in debug mode:

```bash
# Generate dependencies (Xcode files, gomobile, etc.):
$ make ios.app_deps

$ make ios.debug
# or setting the device id:
$ IOS_DEVICE="your-emulator-id" make ios.debug

# 💡 You can check available virtual iOS devices with
$ xcrun xctrace list devices
```

Run Android in debug mode:

```bash
# Generate dependencies (Android files, gomobile, etc.):
$ make android.app_deps

$ make android.debug
# Optional if using only one device
# Run this with different Android device IDs
$ ANDROID_DEVICE="your-emulator-id" make android.debug

# 💡 You can check available Android Virtual Devices with
$ adb devices
```

```bash
# Optional if not modifying any .proto file
# Generate files using protobuf
$ make generate

# Optional if using only one device
# Run this with different ports to test with multiple devices
$ BERTY_DAEMON_PORT=1337 make daemon.start
$ BERTY_DAEMON_PORT=1338 make daemon.start

# Web
# Run Berty daemon for the web app
make web.daemon.start
# Run web app in debug mode
$ make web.debug
# Open http://localhost:3002/#/ip4/127.0.0.1/tcp/9092/grpcws in your browser
```

List of all available commands:

```bash
$ make help
```

## Setup

### The Berty Messenger installation involves:

1. Installing the common dependencies
2. Installing the dependencies for IOS
3. Installing the dependencies for Android

<details><summary>Install the common dependencies (mandatory)</summary>

1. Install `asdf` tool version manager following its [tutorial](https://asdf-vm.com/guide/getting-started.html).

> **Warning**: if you are using `nvm` you may face some incompatibility issues with `asdf` during the build process.

2. Run the initial setup script in the root project's folder:

   ```bash
   $ cd berty # root folder

   $ make asdf.install_tools
   ```

   If you have an issue related with gpg, eg:
   "Missing one or more of the following dependencies: tar, gpg"
   You can try solve this issue using: `$ brew install gpg`

3. [Docker Desktop](https://docs.docker.com/docker-for-mac/install/)

</details>

<details><summary>IOS dev requirements</summary>

- Mac OS X
- [XCode _14.x_](https://developer.apple.com/download/all/?q=Xcode)

Run:

```bash
$ cd js

$ make ios.app_deps
```

</details>

<details><summary>Android dev requirements</summary>

- An Android app **development environment**, e.g. [Android Studio](https://developer.android.com/studio/install) (Tested with Chipmunk 2021.2.1 .)
  - **IMPORTANT NOTE**: There is a known issue to [Support the latest Android Studio (Jellyfish)](https://github.com/berty/berty/issues/4753). To solve this we will need to update to the latest React Native version. This could be a lengthy operation and until then, although undesirable, you can mitigate this bug by using Android Studio Chipmunk.
- **Android SDK**, with the following enabled (in Android Studio Code in `Tools --> SDK Manager`):
  - SDK Platform "Android 11.0 (R)"
  - Android SDK Build-Tools
  - LLDB
  - NDK version 23.1.7779620 (`export ANDROID_NDK_HOME="$ANDROID_HOME/ndk/23.1.7779620"`)
  - Cmake
  - Android SDK Command-line Tools
- A physical or virtual **Android device** (in Android Studio, `Tools --> AVD Manager`)

💡 Check you can run all the commands `sdkmanager`, `emulator`, `ndk-bundle`, and `adb` (these are binaries in `$ANDROID_HOME` subfolders)

Run:

```bash
$ cd js

$ make android.app_deps
```

</details>

##

## 🗂️ Directory layout

| directory                                                          | description                                                                                    |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| [api/](https://github.com/berty/berty/tree/master/js/packages/api) | Interfaces with the [Berty golang services](https://github.com/berty/berty/tree/master/go/pkg) |
| [messenger-app/](./packages/messenger-app/)                        | Berty Messenger react root                                                                     |
| [i18n/](./packages/i18n)                                           | Locale support files                                                                           |
| [components](./packages/components)                                | React Native components                                                                        |
| [go-bridge/](./packages/native-modules/GoBridge)                   | Berty daemon native module                                                                     |
| [grpc-bridge/](./packages/grpc-bridge)                             | Collection of grpc utilities used to interface with the daemon                                 |
| [navigation/](./packages/navigation)                               | Berty Messenger + react-native-navigation                                                      |
| [redux/](./packages/redux)                                         | App state control using React hooks and Context                                                |
| [styles/](./packages/contexts/styles/)                             | Generates StyleSheet utilities and styles that conform to our design specs                     |

## Storybook 🎨

We added Storybook into this project to facilitate UI component development and testing.
Running Storybook is as simple as executing the command:

```bash
$ cd js
$ make storybook
```

💡 If you encounter a blank page after running the Storybook command, it is recommended to follow these steps:

1. Stop metro and close the emulator.
2. Open the emulator an the App within it. Press 'R'.
3. Run the Storybook command `$ make storybook`.
4. And then reload the app within the emulator pressing the key 'R'. It will force the app load the new bundle.

## Flipper

Flipper is a tool for debugging iOS, Android and React Native apps.
We use it for profiling the app and to recuperate some logs that we don't have in metro.

To allow all features, you have to install flipper `0.162.0` version.
⚠️ When you upgrade react-native you have to find the correct version to run with.

To run it you just have to run the flipper desktop app and select the device application you want.
A known issue is that we are unable to connect our android device. Just verify in the settings of flipper your `platform-tools` path is good (`https://stackoverflow.com/a/72608113/10961298`).

This is a short video on what it can be expected for the profiler feature (`https://www.loom.com/share/0b0353df7e6445ecbbfd6e2e8cca784d`).
In this video we profile the debug app, but we really advise you to profile the release app.
