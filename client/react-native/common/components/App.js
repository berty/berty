/* eslint-disable */

import {
  ActivityIndicator,
  Linking,
  NativeModules,
  Platform,
  TextInput,
} from 'react-native'
import { NavigationActions, SafeAreaView } from 'react-navigation'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import React, { PureComponent } from 'react'

import { Flex, Loader, Screen } from './Library'
import { colors } from '../constants'
import { subscriptions } from '../graphql'
import Screens from './Screens'

const { CoreModule } = NativeModules

export default class App extends PureComponent {
  state = {
    loading: true,
    deepLink: {
      routeName: 'main',
      params: {},
    },
  }

  componentDidMount() {
    Linking.getInitialURL()
      .then(url => {
        if (url !== null) {
          this.handleOpenURL({ url })
        }
      })
      .catch(() => {})

    if (this._handleOpenURL === undefined) {
      this._handleOpenURL = this.handleOpenURL.bind(this)
    }

    Linking.addEventListener('url', this._handleOpenURL)
    this.setState({ loading: false })
  }

  componentWillUnmount() {
    if (this._handleOpenURL !== undefined) {
      Linking.removeEventListener('url', this._handleOpenURL)
    }
  }

  handleOpenURL = event => {
    const prefixes = ['https://berty.tech/', 'berty://']
    if (Platform.OS === 'web') {
      prefixes.push('http://localhost:3000/')
    }

    let url = event.url

    for (let prefix of prefixes) {
      if (url.indexOf(prefix) === 0) {
        url = url.substr(prefix.length)
        break
      }
    }

    if (url.indexOf('add-contact#public-key=') === 0) {
      const initialKey = url.substr('add-contact#public-key='.length)
      console.log('Adding new contact via public key')

      this.setState({
        deepLink: {
          routeName: 'contacts/add/by-public-key',
          params: { initialKey },
        },
      })
    }
  }

  render() {
    const { loading, deepLink } = this.state

    if (loading) {
      return <Loader />
    }
    return (
      <SafeAreaView style={{ flex: 1 }} forceInset={{ bottom: 'never' }}>
        <Screens
          ref={nav => {
            this.navigation = nav
          }}
          screenProps={{ deepLink }}
        />
        {Platform.OS === 'ios' && <KeyboardSpacer />}
      </SafeAreaView>
    )
  }
}
