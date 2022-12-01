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
IOS_APP=<path-to-the-app> node e2e-tests/src/tests/testName.js
```

#### Environment

Instead of passing variables, you can either create a .env file and set variables in it

Example

```js
MAX_TYPING_FREQUENCY = 20 // Maximum frequency of keystrokes for typing and clear. Defaults to 60 keystrokes per minute
IOS_APP =
	'/Users/norman/Library/Developer/Xcode/DerivedData/Berty-fhgkrmolfophlogtwrazqwhipyex/Build/Products/AppStore Release-iphonesimulator/Berty.app' // Full path to the application to be tested
ANDROID_APP = '' // Full path to the application to be tested
IOS_VERSION = '15.5' // The platform version of an emulator or a real device
IOS_DEVICE = 'iPhone 11' // The name of the device under test
```

## Known errors

### AccountService init fails due to missing secure keystore entitlement

The AccountService init fails with error

```
[ERROR] Error while Initializing AccountService	{"tyberLogType": "step", "step": {"parentTraceID":"3eb6463a-6640-406a-8059-178da420fe18","details":[{"name":"Error","description":"TODO(#666): ErrKeystorePut(#401): The operation couldn’t be completed. (SecItemCopyMatching failed: A required entitlement isn't present. error 0.); The operation couldn’t be completed. (SecItemAdd failed: A required entitlement isn't present. error 0.)"},{"name":"RootDir","description":"/Users/norman/Library/Developer/CoreSimulator/Devices/9F9EF88A-B5CB-434F-AB6B-D22F40A28F33/data/Containers/Shared/AppGroup/8A717BC2-9AF4-476D-B6FA-3FA0C4FFDA7A/berty"}],"status":"failed","endTrace":true,"updateTraceName":"","forceReopen":false}}
```

This means the app is not properly signed, one way to fix this without a proper cert is to directly build the app with a simulator as destination (like `react-native run-ios` does)
