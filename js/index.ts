/**
 * @format
 */

import 'node-libs-react-native/globals'
import 'string.fromcodepoint'

import protobuf from 'protobufjs'
import { AppRegistry, NativeModules } from 'react-native'

import { initI18N } from '@berty/i18n'
import App from '@berty/messenger-app/App'
import { name as appName } from '@berty/messenger-app/app.json'
import BridgeLogger from '@berty/native-modules/GoBridge/logger'

protobuf.util.toJSONOptions = { longs: String, enums: Number, json: true }

if (typeof Buffer === 'undefined') {
	global.Buffer = require('buffer').Buffer
}

if (!__DEV__) {
	global.console = BridgeLogger(NativeModules.GoBridge)
	global.console.info('native bridge logger enabled')
}

initI18N()

if (__DEV__ && process.env.STORYBOOK) {
	const Storybook = require('./.storybook').default
	AppRegistry.registerComponent(appName, () => Storybook)
} else {
	AppRegistry.registerComponent(appName, () => App)
}
