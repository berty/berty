# Welcome

## Introduction

Berty's Network Labs aims to provide a set of guidelines, code examples and libraries to help developers implement a libp2p-based network more easily.

This section is still under construction and we are currently only giving access to a raw version of our network codebase.

Our short to medium term plan is to propose the following tools/libraries/documentation:
- A custom IPFS node for mobile platforms, which aims to best adapt to the constraints inherent in these devices:
  - Low CPU / RAM / Bandwidth / Battery resources
  - Frequent connectivity switches between Wifi and Cellular
  - Difficulties with incoming access in cellular mode
  - OS processes lifecycle management: background/foreground switching, connections closing, etc...
- A BLE transport for libp2p compatible with Darwin (iOS / macOS) and Android
