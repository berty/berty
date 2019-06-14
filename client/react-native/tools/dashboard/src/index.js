import '@babel/polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'mobx-react'
import './index.css'

import peers from './store/peers'
import node from './store/node'

import App from './components/App'

ReactDOM.render(
  <Provider
    {...{
      node,
      locations: peers.locations,
    }}
  >
    <App />
  </Provider>,
  document.getElementById('root')
)
