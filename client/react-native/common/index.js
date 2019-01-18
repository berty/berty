import './helpers/crash-handler.js'
import './helpers/patch-web.js'

import { Platform, AppRegistry } from 'react-native'
import React from 'react'
import ReactDOM from 'react-dom'

import App from './components/App'

if (process.env['ENVIRONMENT'] === 'integration_test') {
  console.error('LOLOLOLOLOL')
}
// import { Tester, TestHookStore } from 'cavy'
// import AppSpec from './specs/AppSpec'
//
// const testHookStore = new TestHookStore()
//
// class AppWrapper extends Component {
//   render() {
//     return (
//       <Tester specs={[AppSpec]} store={testHookStore} waitTime={4000}>
//         <App />
//       </Tester>
//     )
//   }
// }
//

if (Platform.OS === 'web') {
  console.error('LILILI')
  import('./helpers/patch-web.js')
  ReactDOM.render(<App />, document.getElementById('root'))
  import('./registerServiceWorker').then()
} else {
  AppRegistry.registerComponent('root', () => App)
}
