## Basic test

To run the test you need to:

```sh
cd ..
```

### Start appium

```sh
make e2e-tests.server
```

### Environment

Example

```js
MAX_TYPING_FREQUENCY = 20 // Maximum frequency of keystrokes for typing and clear. Defaults to 60 keystrokes per minute
IOS_APP =
	'/Users/norman/Library/Developer/Xcode/DerivedData/Berty-fhgkrmolfophlogtwrazqwhipyex/Build/Products/AppStore Release-iphonesimulator/Berty.app' // Full path to the application to be tested
ANDROID_APP =
	'/Users/lucasdecurtis/berty_fork/js/android/app/build/outputs/apk/debug/app-x86-debug.apk' // Full path to the apk to be tested
IOS_VERSION = '15.5' // The platform version of an emulator or a real device
IOS_DEVICE = 'iPhone 11' // The name of the device under test
IS_DEBUG = 'true' // Tell appium to handle the SelectNode screen that will show up when app is in debug mode
```

### Build the app

#### For IOS

```sh
make ios.release
```

You can close the simulator that started since we only want to build the app

Then grab the app path from the `info Installing` line in the command output and add it in the .env file, for example:

```
info Installing "/Users/norman/Library/Developer/Xcode/DerivedData/Berty-fhgkrmolfophlogtwrazqwhipyex/Build/Products/AppStore Release-iphonesimulator/Berty.app"
```

#### For Android

```sh
make android.release
```

You then need to get the path to apk which can be found in folder "js/android/app/build/outputs/apk" and add it in the .env file

### Run the test script

```sh
make e2e-tests.tests
```

## Known errors

### AccountService init fails due to missing secure keystore entitlement

The AccountService init fails with error

```
[ERROR] Error while Initializing AccountService	{"tyberLogType": "step", "step": {"parentTraceID":"3eb6463a-6640-406a-8059-178da420fe18","details":[{"name":"Error","description":"TODO(#666): ErrKeystorePut(#401): The operation couldn’t be completed. (SecItemCopyMatching failed: A required entitlement isn't present. error 0.); The operation couldn’t be completed. (SecItemAdd failed: A required entitlement isn't present. error 0.)"},{"name":"RootDir","description":"/Users/norman/Library/Developer/CoreSimulator/Devices/9F9EF88A-B5CB-434F-AB6B-D22F40A28F33/data/Containers/Shared/AppGroup/8A717BC2-9AF4-476D-B6FA-3FA0C4FFDA7A/berty"}],"status":"failed","endTrace":true,"updateTraceName":"","forceReopen":false}}
```

This means the app is not properly signed, one way to fix this without a proper cert is to directly build the app with a simulator as destination (like `react-native run-ios` does)
