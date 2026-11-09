# berty-bridge-expo

This is the bertybridge Expo module.

## Prerequisites

* Required on macOS: Xcode 26.4+ (macOS 26.2+), the minimum for Expo SDK 58
* Required to build for Android: Android Studio

Berty is based on weshnet. Follow its [install instructions](https://github.com/berty/weshnet/blob/main/INSTALL.md)
to set up `asdf`.

First time only (or after updating ../.tool-versions), in a terminal enter:

```
make -C .. asdf.install_tools
```

### Install Android Studio for macOS 15 and macOS 26

Download and install the latest
android-studio-{version}-mac.dmg from <https://developer.android.com/studio> .
(Tested with Panda 2025.3.1 .)

To set the environment variable, in the build terminal enter:

```sh
export ANDROID_HOME="$HOME/Library/Android/sdk"
```

### Install Android Studio for Ubuntu 24.04

To install Android Studio, download the latest
android-studio-{version}-linux.tar.gz from
<https://developer.android.com/studio> . (Tested with Panda 2025.3.1 .)
In a terminal, enter the following with the correct {version}:

```sh
sudo tar -C /usr/local -xzf android-studio-{version}-linux.tar.gz
```

Also set the environment variable:

```sh
export ANDROID_HOME="$HOME/Android/Sdk"
```

To launch Android Studio, in a terminal enter:

```sh
/usr/local/android-studio/bin/studio.sh &
```

## Building the Expo module

### (First time only) Set up the Android NDK

- In Android Studio, accept the default startup options.
- Open the SDK Manager.
- In the "SDK Platforms" tab, check "Android 15.0".
- In the "SDK Tools" tab, click "Show Package Details". Expand
  "NDK (Side by side)" and check "27.1.12297006".
- Click OK to install and close the SDK Manager.

### Build the Expo module

Open a terminal in this folder and run:

```
make ios.gomobile # or make android.gomobile
```
