import React from 'react'
import ReactDOM from 'react-dom'
import { Platform, AppRegistry } from 'react-native'
import App from './components/App'
import webServiceWorker from '../web/src/registerServiceWorker'

if (Platform.OS === 'web') {
  ReactDOM.render(<App />, document.getElementById('root'))
  webServiceWorker()
} else {
  AppRegistry.registerComponent('root', () => App)
}
