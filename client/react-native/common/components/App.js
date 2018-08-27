import React, { PureComponent } from 'react'
import Screens from './Screens'
import { commit } from '../relay'
import { mutations } from '../graphql'

export default class App extends PureComponent {
  async componentDidMount () {
    try {
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
