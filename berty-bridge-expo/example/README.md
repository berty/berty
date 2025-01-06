# berty-bridge-expo

This is the bertybridge Expo module.

## Building the Expo module example app

Open a terminal in this folder and run:

```
cd .. # cd to the parent folder
npm install
make ios.gomobile
npm run build
npm run build plugin
```

Open a second terminal in this folder and run:

```
npm install
npx expo prebuild --clean # optional
npx expo run:ios # or npx expo run:android
```
