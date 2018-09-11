import React, { PureComponent } from 'react'
import Screens from './Screens'
import { NativeModules } from 'react-native'
import { subscriptions } from '../graphql'

const { CoreModule } = NativeModules

export default class App extends PureComponent {
  async componentDidMount () {
    try {
      await CoreModule.start()
      subscriptions.EventStream.subscribe({
        iterator: function * () {
          try {
            while (true) {
              console.log(yield)
            }
          } catch (error) {
            console.error(error)
          }
        },
        updater: undefined,
      })
      subscriptions.EventStream.start()
    } catch (err) {
      console.error(err)
      subscriptions.EventStream.dispose()
    }
  }

  componentWillUnmount () {
    subscriptions.EventStream.dispose()
  }

  render () {
    return <Screens />
  }
}
