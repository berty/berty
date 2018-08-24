import React from 'react'
import ReactDOM from 'react-dom'
import { Platform, AppRegistry } from 'react-native'
import App from './components/App'

if (Platform.OS === 'web') {
  ReactDOM.render(<App />, document.getElementById('root'))
  require('./registerServiceWorker')()
} else {
  AppRegistry.registerComponent('root', () => App)
}
