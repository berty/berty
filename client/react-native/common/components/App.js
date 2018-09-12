import React, { PureComponent } from 'react'
import Screens from './Screens'
import { NativeModules } from 'react-native'
import { subscriptions } from '../graphql'

const { CoreModule } = NativeModules

export default class App extends PureComponent {
  async componentDidMount () {
    try {
      await CoreModule.start()
      subscriptions.eventStream.subscribe({
        iterator: function * () {
          try {
            while (true) {
              console.log('EventStream: ', yield)
            }
          } catch (error) {
            console.error('EventStream: ', error)
          }
          console.log('EventStream: return')
        },
        updater: undefined,
      })
      subscriptions.eventStream.start()
    } catch (err) {
      console.error(err)
      subscriptions.eventStream.dispose()
    }
  }

  componentWillUnmount () {
    subscriptions.eventStream.dispose()
  }

  render () {
    return <Screens />
  }
}
