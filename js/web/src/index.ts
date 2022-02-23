import { AppRegistry } from 'react-native'
import protobuf from 'protobufjs'

import App from '../../packages/messenger-app/App'
import { name as appName } from '../../packages/messenger-app/app.json'

protobuf.util.toJSONOptions = { longs: String, enums: Number, json: true }

if (typeof Buffer === 'undefined') {
	global.Buffer = require('buffer').Buffer
}

AppRegistry.registerComponent(appName, () => App)
AppRegistry.runApplication(appName, { rootTag: document.getElementById('root') })
