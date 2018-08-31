import React, { PureComponent } from 'react'
import Screens from './Screens'
import { commit } from '../relay'
import { mutations } from '../graphql'
import { NativeModules } from 'react-native'

const { CoreModule } = NativeModules

export default class App extends PureComponent {
  state = {
    port: '0',
  }

  async componentDidMount () {
    try {
      await CoreModule.start()
      this.setState({ port: await CoreModule.getPort() })
      console.log(
        await commit(mutations.ContactRequest, {
          contactID: 'Bla',
          introText: 'Hello World !',
        })
      )
    } catch (err) {
      console.error(err)
    }
  }

  render () {
    return <Screens />
  }
}
