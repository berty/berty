import '@berty/common/helpers/crash-handler.js'
import '@berty/common/helpers/patch-web.js'
import '@berty/common/helpers/patch-electron.js'
import 'node-libs-react-native/globals'

import { Platform, AppRegistry } from 'react-native'
import React from 'react'
import ReactDOM from 'react-dom'

import App from '@berty/navigation'
import AppTest from './integration/AppWrapper'

const isIntegrationMode = process.env['ENVIRONMENT'] === 'integration_test'

if (Platform.Desktop === undefined) {
  Platform.Desktop = false
}

if (Platform.OS === 'web') {
  if (
    process !== undefined &&
    process.versions !== undefined &&
    process.versions['electron'] !== undefined
  ) {
    import('@berty/common/helpers/patch-electron.js')
  } else {
    import('@berty/common/helpers/patch-web.js')
  }
  ReactDOM.render(
    isIntegrationMode === true ? <AppTest /> : <App />,
    document.getElementById('root')
  )
  import('./registerServiceWorker').then()
} else {
  AppRegistry.registerComponent(
    'root',
    isIntegrationMode === true ? <AppTest /> : <App />
  )
}
