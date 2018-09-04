import React, { PureComponent } from 'react'
import Screens from './Screens'
import { NativeModules } from 'react-native'

const { CoreModule } = NativeModules

export default class App extends PureComponent {
  async componentDidMount () {
    try {
      await CoreModule.start()
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return <Screens />
  }
}
