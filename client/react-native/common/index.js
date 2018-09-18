import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { NativeModules, Platform, AppRegistry } from 'react-native'
import App from './components/App'

if (Platform.OS === 'web') {
  NativeModules.CoreModule = {
    start: async () => {},
    getPort: async () => '8700',
    getUnixSockPath: async () => 'localhost:8700',
  }
  ReactDOM.render(<App />, document.getElementById('root'))
  import('./registerServiceWorker').then()
} else {
  AppRegistry.registerComponent('root', () => App)
}
