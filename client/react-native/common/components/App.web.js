import { Linking } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import React, { PureComponent } from 'react'
import { parse as parseUrl } from '../helpers/url'
import FlashMessage from 'react-native-flash-message'

import { Loader } from './Library'
import Accounts from './Screens/Accounts'
import { I18nextProvider } from 'react-i18next'
import i18n from '../i18n'

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
            routeName: 'modal/contacts/card',
            params: {
              data: {
                id: url.hashParts['public-key'] || '',
                displayName: url.hashParts['display-name'] || '',
              },
            },
          },
        })
        break
      default:
        console.warn(`Unhandled deep link, URL: ${event.url}`)
        break
    }
  }

  clearDeepLink () {
    this.setState({ deepLink: null })
  }

  render () {
    const { loading, deepLink } = this.state
    if (loading) {
      return <Loader />
    }
    return (
      <I18nextProvider i18n={i18n}>
        <SafeAreaView style={{ flex: 1 }} forceInset={{ bottom: 'never' }}>
          <Accounts
            ref={nav => {
              this.navigation = nav
            }}
            screenProps={{
              deepLink,
              clearDeepLink: () => this.clearDeepLink(),
            }}
          />
          <KeyboardSpacer />
          <FlashMessage position='top' />
        </SafeAreaView>
      </I18nextProvider>
    )
  }
}
