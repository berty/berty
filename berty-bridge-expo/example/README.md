# berty-bridge-expo

This is the bertybridge Expo module.

## Building the Expo module example app

Open a terminal in this folder and run:

```
cd .. # cd to the parent folder
make ios.gomobile # or make android.gomobile
```

For development, you can also run in new terminals:

```
npm run build
npm run build plugin
```

### CLI build

In this folder run:

```
npm install
npx expo prebuild --clean # optional
npx expo run:ios # or npx expo run:android
```

### Xcode build

If you prefer to compile with Xcode, open a new terminal in this folder and run::

```
npm install
npx expo prebuild --clean
```

Then open `ios/bertybridgeexpoexample.xcworkspace` with Xcode and compile the project.
