/**
 * @format
 */

import 'node-libs-react-native/globals'
import 'react-native-gesture-handler'
import { AppRegistry } from 'react-native'

import App from '@berty-tech/messenger-app/App'
import { name as appName } from '@berty-tech/messenger-app/app.json'

import BridgeLogger from '@berty-tech/go-bridge/logger'
import { NativeModules } from 'react-native'

if (typeof Buffer === 'undefined') {
	global.Buffer = require('buffer').Buffer
}

// if dev mode, redirect console output to native logger
if (!__DEV__) {
	global.console = BridgeLogger(NativeModules.GoBridge)
	global.console.info('native bridge logger enabled')
}

AppRegistry.registerComponent(appName, () => App)
