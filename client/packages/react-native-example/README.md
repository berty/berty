# react-native-example

## Getting started

`$ npm install react-native-example --save`

### Mostly automatic installation

`$ react-native link react-native-example`

### Manual installation


#### iOS

1. In XCode, in the project navigator, right click `Libraries` ➜ `Add Files to [your project's name]`
2. Go to `node_modules` ➜ `react-native-example` and add `BertyExample.xcodeproj`
3. In XCode, in the project navigator, select your project. Add `libBertyExample.a` to your project's `Build Phases` ➜ `Link Binary With Libraries`
4. Run your project (`Cmd+R`)<

#### Android

1. Open up `android/app/src/main/java/[...]/MainApplication.java`
  - Add `import tech.berty.example.BertyExamplePackage;` to the imports at the top of the file
  - Add `new BertyExamplePackage()` to the list returned by the `getPackages()` method
2. Append the following lines to `android/settings.gradle`:
  	```
  	include ':react-native-example'
  	project(':react-native-example').projectDir = new File(rootProject.projectDir, 	'../node_modules/react-native-example/android')
  	```
3. Insert the following lines inside the dependencies block in `android/app/build.gradle`:
  	```
      compile project(':react-native-example')
  	```


## Usage
```javascript
import BertyExample from 'react-native-example';

// TODO: What to do with the module?
BertyExample;
```
