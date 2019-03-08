import { I18nextProvider } from 'react-i18next'
import { Linking, Platform, View, NativeModules } from 'react-native'
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
import { UpdateContext } from '../update'

const { CoreModule } = NativeModules

class HandleDeepLink extends PureComponent {
  static router = AppNavigator.router

  async componentDidUpdate (nextProps) {
    if (nextProps.screenProps.deepLink !== this.props.screenProps.deepLink) {
      this.openDeepLink()
    }
  }

  getActiveRouteName = navigationState => {
    if (!navigationState) {
      return null
    }
    const route = navigationState.routes[navigationState.index]
    // dive into nested navigators
    if (route.routes) {
      return this.getActiveRouteName(route)
    }

    // get fragment from react-navigation params
    const fragment = Object.keys(route.params || {}).reduce((fragment, key) => {
      const paramType = typeof route.params[key]
      if (
        paramType === 'string' ||
        paramType === 'number' ||
        paramType === 'boolean'
      ) {
        let val = route.params[key]
        if (key === 'id') {
          try {
            val = atob(val)
            val = val.match(/:(.*)$/)
            val = val[1]
          } catch {
            val = route.params[key]
          }
        }
        fragment += fragment.length > 0 ? `,${key}=${val}` : `#${key}=${val}`
      }
      return fragment
    }, '')
    return route.routeName + fragment
  }

  openDeepLink = () => {
    const {
      screenProps: { deepLink, clearDeepLink },
    } = this.props

    if (!deepLink) {
      return
    }

    this.props.navigation.navigate(deepLink)
    clearDeepLink()
  }

  render () {
    const { navigation } = this.props
    return (
      <AppNavigator
        {...this.props}
        ref={() => {
          if (Platform.OS !== 'web') {
            this.navigation = navigation
            NavigationService.setTopLevelNavigator(navigation)
          }
        }}
        onNavigationStateChange={(prevState, currentState) => {
          const currentRoute = this.getActiveRouteName(currentState)
          const prevRoute = this.getActiveRouteName(prevState)

          if (prevRoute !== currentRoute) {
            CoreModule.setCurrentRoute(currentRoute)
          }
        }}
      />
    )
  }
}

let AppContainer = {}
if (Platform.OS !== 'web') {
  AppContainer = createAppContainer(HandleDeepLink)
} else {
  AppContainer = HandleDeepLink
}

export default class App extends PureComponent {
  state = {
    loading: true,
    showAnim:
      process.env['ENVIRONMENT'] !== 'integration_test' &&
      Platform.OS !== 'web',
    relayContext: null,
    availableUpdate: null,
    deepLink: {
      routeName: 'main',
      params: {},
    },
  }

  constructor (props) {
    super(props)

    if (Platform.OS !== 'web') {
      Instabug.setWelcomeMessageMode(Instabug.welcomeMessageMode.disabled)
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
        DevMenu.addItem('Show Instabug', () => Instabug.BugReporting.invoke())
      }
    }
  }

  componentDidMount () {
    ReactNativeLanguages.addEventListener('change', this._onLanguageChange)

    if (this._handleOpenURL === undefined) {
      this._handleOpenURL = this.handleOpenURL.bind(this)
    }

    Linking.addEventListener('url', this._handleOpenURL)

    Linking.getInitialURL()
      .then(url => {
        if (url !== null) {
          this.handleOpenURL({ url })
        }
      })
      .catch(() => {})

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

  setStateContext = (i, f) => {
    this.setState(i, () => {
      if (i.relayContext !== null && i.loading === false) {
        this.setState({
          debugBar: <DebugStateBar />,
        })
      }
      f()
    })
  }

  setStateUpdate = update => {
    this.setState({ availableUpdate: update })
  }

  render () {
    const { loading, deepLink, showAnim, relayContext, availableUpdate } = this.state

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
            ? <RelayContext.Provider value={{ ...relayContext, setState: this.setStateContext }}>
              <UpdateContext.Provider value={{ availableUpdate, setState: this.setStateUpdate }}>
                <AppContainer
                  screenProps={{
                    deepLink,
                    setDeepLink: (deepLink) => this.setDeepLink(deepLink),
                    clearDeepLink: () => this.clearDeepLink(),
                  }}
                />
                <FlashMessage position='top' />
                <View style={{ zIndex: 1, position: 'absolute', top: 30, right: 48, padding: 5 }}>
                  <MovableView>
                    {this.state.debugBar}
                  </MovableView>
                </View>
              </UpdateContext.Provider>
            </RelayContext.Provider>
            : null }
          {Platform.OS === 'ios' && <KeyboardSpacer />}
        </SafeAreaView>
      </I18nextProvider>
    )
  }
}
