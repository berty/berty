# berty-bridge-expo

This is the bertybridge Expo module.

## Building the Expo module example app

Open a terminal in this folder and run:

```
cd .. # cd to the parent folder
make ios.gomobile
npm run build
npm run build plugin
```

### CLI build

Open a second terminal in this folder and run:

```
npm install
npx expo run:ios # or npx expo run:android
npx expo prebuild --clean # optional
```

### Xcode build

If you prefer to compile with Xcode, open a second terminal in this folder and run::

```
npm install
npx expo prebuild --clean
```

Then open `ios/bertybridgeexpoexample.xcworkspace` with Xcode and compile the project.
