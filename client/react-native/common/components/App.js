import { I18nextProvider } from 'react-i18next'
import { Linking, Platform, View } from 'react-native'
import { SafeAreaView, createAppContainer } from 'react-navigation'
import FlashMessage from 'react-native-flash-message'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import ReactNativeLanguages from 'react-native-languages'
import React, { PureComponent } from 'react'
import Config from 'react-native-config'

import { contact, conversation } from '../utils'
import { parse as parseUrl } from '../helpers/url'
import { Flex, Animation, MovableView, DebugStateBar } from './Library'
import Instabug from '../helpers/Instabug'
import { BASE_WEBSITE_URL, colors } from './../constants'
import i18n from '../i18n'
import NavigationService from './../helpers/NavigationService'
import { AppNavigator } from './Navigator/AppNavigator'
import { RelayContext } from '../relay'

let AppContainer = {}
if (Platform.OS !== 'web') {
  AppContainer = createAppContainer(AppNavigator)
} else {
  AppContainer = AppNavigator
}

export default class App extends PureComponent {
  state = {
    loading: true,
    showAnim:
      process.env['ENVIRONMENT'] !== 'integration_test' &&
      Platform.OS !== 'web',
    relayContext: null,
    deepLink: {
      routeName: 'main',
      params: {},
    },
  }

  constructor (props) {
    super(props)

    if (Platform.OS !== 'web') {
      Instabug.setIntroMessageEnabled(false)
      if (Platform.OS === 'ios') {
        Instabug.startWithToken(Config.INSTABUG_TOKEN, [
          // eslint-disable-next-line
          __DEV__
            ? Instabug.invocationEvent.none
            : Instabug.invocationEvent.shake,
        ])
      }
      // eslint-disable-next-line
      if (__DEV__) {
        const DevMenu = require('react-native-dev-menu')
        DevMenu.addItem('Show Instabug', () => Instabug.invoke())
      }
    }
  }

  componentDidMount () {
    ReactNativeLanguages.addEventListener('change', this._onLanguageChange)

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
    ReactNativeLanguages.removeEventListener('change', this._onLanguageChange)

    if (this._handleOpenURL !== undefined) {
      Linking.removeEventListener('url', this._handleOpenURL)
    }
  }

  _onLanguageChange = ({ language } = {}) => {
    language != null && i18n.changeLanguage(language)
  }

  handleOpenURL (event) {
    let url = parseUrl(
      event.url.replace('berty://berty.chat/', `${BASE_WEBSITE_URL}/`)
    )
    switch (url.pathname) {
      case '/chats/detail':
        if (url.hashParts['id']) {
          url.hashParts['id'] = conversation.getRelayID(url.hashParts['id'])
        }
        this.setState({
          deepLink: {
            routeName: 'chats/detail',
            params: url.hashParts,
          },
        })
        break
      case '/contacts/add':
        if (url.hashParts['id']) {
          url.hashParts['id'] = contact.getRelayID(url.hashParts['id'])
        }
        this.setState({
          deepLink: {
            routeName: 'modal/contacts/card',
            params: url.hashParts,
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

  setDeepLink (deepLink) {
    this.setState({ deepLink })
  }

  setStateBis = (i, f) => {
    console.log('asdasdasd', i, f)
    this.setState(i, f)
  }

  render () {
    const { loading, deepLink, showAnim, relayContext } = this.state
    console.log('rerendering all')
    return (
      <I18nextProvider i18n={i18n}>
        <SafeAreaView style={{ flex: 1 }} forceInset={{ bottom: 'never' }}>
          {showAnim ? (
            <Flex.Rows
              align='center'
              justify='center'
              style={{
                width: '100%',
                height: '100%',
                zIndex: 1000,
                position: 'absolute',
                backgroundColor: colors.white,
              }}
            >
              <Animation onFinish={() => this.setState({ showAnim: false })} />
            </Flex.Rows>
          ) : null }
          { !loading
            ? <RelayContext.Provider value={{ ...relayContext, setStateBis: this.setStateBis }}>
              <AppContainer
                ref={nav => {
                  this.navigation = nav
                  NavigationService.setTopLevelNavigator(nav)
                }}
                screenProps={{
                  deepLink,
                  setDeepLink: (deepLink) => this.setDeepLink(deepLink),
                  clearDeepLink: () => this.clearDeepLink(),
                  onRelayContextCreated: context => this.setState({
                    debugBar: <DebugStateBar context={context} />,
                  }),
                }}
              />
            </RelayContext.Provider>
            : null }
          <FlashMessage position='top' />
          <View style={{ zIndex: 1, position: 'absolute', top: 30, right: 48, padding: 5 }}>
            <MovableView>
              {this.state.debugBar}
            </MovableView>
          </View>
          {Platform.OS === 'ios' && <KeyboardSpacer />}
        </SafeAreaView>
      </I18nextProvider>
    )
  }
}
