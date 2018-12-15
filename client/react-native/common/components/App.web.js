import { Linking, Platform } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import React, { PureComponent } from 'react'
import { parse as parseUrl } from '../helpers/url'

import { Loader } from './Library'
import Accounts from './Screens/Accounts'

export default class App extends PureComponent {
  state = {
    loading: true,
    deepLink: {
      routeName: 'main',
      params: {},
    },
  }

  componentDidMount () {
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

  componentWillUnmount () {
    if (this._handleOpenURL !== undefined) {
      Linking.removeEventListener('url', this._handleOpenURL)
    }
  }

  handleOpenURL (event) {
    let url = parseUrl(event.url.replace('berty://', 'https://berty.tech/'))

    switch (url.pathname) {
      case '/add-contact':
        this.setState({
          deepLink: {
            routeName: 'modal/contacts/add/by-public-key',
            params: {
              initialKey: url.hashParts['public-key'] || '',
              initialName: url.hashParts['display-name'] || '',
            },
          },
        })
        break
      default:
        console.warn(`Unhandled deep link, URL: ${event.url}`)
        break
    }
  }

  render () {
    const { loading, deepLink } = this.state
    if (loading) {
      return <Loader />
    }
    return (
      <SafeAreaView style={{ flex: 1 }} forceInset={{ bottom: 'never' }}>
        <Accounts
          ref={nav => {
            this.navigation = nav
          }}
          screenProps={{
            deepLink,
          }}
        />
        {Platform.OS === 'ios' && <KeyboardSpacer />}
      </SafeAreaView>
    )
  }
}
