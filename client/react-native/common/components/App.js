import { Linking, Platform } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import { URL, URLSearchParams } from 'whatwg-url'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import React, { PureComponent } from 'react'

import { Loader } from './Library'
import { getAvailableUpdate } from '../helpers/update'
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
    getAvailableUpdate().then(availableUpdate =>
      this.setState({ availableUpdate })
    )

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
    let url = new URL(event.url.replace('berty://', 'https://berty.tech/'))
    let params = new URLSearchParams(url.hash.replace('#', ''))

    switch (url.pathname) {
      case '/add-contact':
        this.setState({
          deepLink: {
            routeName: 'modal/contacts/add/by-public-key',
            params: {
              initialKey: params.get('public-key'),
              initialName: params.get('display-name'),
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
            availableUpdate: this.state.availableUpdate,
          }}
        />
        {Platform.OS === 'ios' && <KeyboardSpacer />}
      </SafeAreaView>
    )
  }
}
