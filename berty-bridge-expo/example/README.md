# berty-bridge-expo example

This is the bertybridge Expo module.

## Building the Expo module and example app

Open a terminal in the parent folder and follow its [README](../README.md) to build the bertybridge Expo module.

For development, you can also run in new terminals:

```
npm run build
npm run build plugin
```

### CLI build

Open a terminal in this folder and run:

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
npm start
```

Then open `ios/bertybridgeexpoexample.xcworkspace` with Xcode and compile the project.
