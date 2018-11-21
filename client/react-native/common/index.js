import './helpers/crash-handler.js'
import './helpers/patch-web.js'

import { Platform, AppRegistry } from 'react-native'
import React from 'react'
import ReactDOM from 'react-dom'

import App from './components/App'

if (Platform.OS === 'web') {
  ReactDOM.render(<App />, document.getElementById('root'))
  import('./registerServiceWorker').then()
} else {
  AppRegistry.registerComponent('root', () => App)
}
