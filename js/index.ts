/**
 * @format
 */

import 'node-libs-react-native/globals'
import 'react-native-gesture-handler'
import { AppRegistry, NativeModules } from 'react-native'

import App from './packages/messenger-app/App'
import { name as appName } from './packages/messenger-app/app.json'
import BridgeLogger from './packages/go-bridge/logger'

if (typeof Buffer === 'undefined') {
	global.Buffer = require('buffer').Buffer
}

// if dev mode, redirect console output to native logger
if (!__DEV__) {
	global.console = BridgeLogger(NativeModules.GoBridge)
	global.console.info('native bridge logger enabled')
}

AppRegistry.registerComponent(appName, () => App)
