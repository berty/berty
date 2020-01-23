/**
 * @format
 */

import 'node-libs-react-native/globals'

import { AppRegistry } from 'react-native'
import App from './App.tsx'
import { name as appName } from './app.json'

// Disable warnings
console.disableYellowBox = true

AppRegistry.registerComponent(appName, () => App)
