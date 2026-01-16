# berty-bridge-expo

This is the bertybridge Expo module.

## Prerequisites

* Required on macOS: Xcode 26+ (macOS 15+)

Berty is based on weshnet. Follow its [install instructions](https://github.com/berty/weshnet/blob/main/INSTALL.md)
to set up `asdf`.

First time only (or after updating ../.tool-versions), in a terminal enter:

```
make -C .. asdf.install_tools
```

## Building the Expo module

Open a terminal in this folder and run:

```
make ios.gomobile # or make android.gomobile
```
