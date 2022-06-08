## Basic test

To run the test you need to:

```sh
cd ..
```

### Start appium

```sh
npx appium
```

### Build the app

```sh
make ios.release
```

You can close the simulator that started since we only want to build the app

Then grab the app path from the `info Installing` line in the command output, for example:
```
info Installing "/Users/norman/Library/Developer/Xcode/DerivedData/Berty-fhgkrmolfophlogtwrazqwhipyex/Build/Products/AppStore Release-iphonesimulator/Berty.app"
```

### Run the test script

```sh
IOS_APP=<path-to-the-app> node e2e-tests/basic.js
```
