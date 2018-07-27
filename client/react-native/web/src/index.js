import React from 'react'
import ReactDOM from 'react-dom'
import { App } from '@berty/common/react'
import registerServiceWorker from './registerServiceWorker'

ReactDOM.render(<App />, document.getElementById('root'))
registerServiceWorker()
