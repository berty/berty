import './helpers/crash-handler.js'
import './helpers/patch-web.js'

import { Platform, AppRegistry } from 'react-native'
import React from 'react'
import ReactDOM from 'react-dom'

import App from './components/App'
import AppTest from './integration/AppWrapper'

const isIntegrationMode = (process.env['ENVIRONMENT'] === 'integration_test')

if (Platform.OS === 'web') {
  import('./helpers/patch-web.js')
  ReactDOM.render(isIntegrationMode === true ? <AppTest /> : <App />, document.getElementById('root'))
  import('./registerServiceWorker').then()
} else {
  AppRegistry.registerComponent('root', () => isIntegrationMode === true ? AppTest : App)
}
