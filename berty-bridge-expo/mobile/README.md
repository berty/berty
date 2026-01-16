# Berty Messenger

This is the Berty Messenger app.

## Building the Expo module and app

Open a terminal in the parent folder and follow its [README](../README.md) to build the bertybridge Expo module.

### CLI build

Open a terminal in this folder and run:

```
npm install
npx expo prebuild --clean # optional
npx expo run:ios # or npx expo run:android
```

### Xcode build (macOS)

If you prefer to compile with Xcode, open a new terminal in this folder and run::

```
npm install
npx expo prebuild --clean
npm start
```

Then open `ios/BertyDebug.xcworkspace` with Xcode and compile the project.
