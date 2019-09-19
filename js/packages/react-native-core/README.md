# react-native-core

## Dependencies

```sh
cd client
make deps.react-native-core.android
```

## Installation

`lerna add --scope=your-pkg-name @berty/react-native-core`

Make sure you configure the metro resolver correctly and add react-native-core to metro watchFolders
This should look like this (minus other local dependencies)

```js
const path = require("path");

{
  //...metroConfig,
  resolver: {
    //...resolverConfig
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => path.join(process.cwd(), `node_modules/${name}`),
      },
    ),
  },
  watchFolders: [
    path.join(process.cwd(), '../react-native-core');
    //path.join(process.cwd(), '../other-berty-rn-package');
  ]
}
```

## Usage
```javascript
import BertyCore from 'react-native-core';

BertyCore.invoke("/berty.daemon.Daemon/Start", "TODO");
```
