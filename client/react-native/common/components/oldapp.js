import { Linking, Platform, Animated, Easing } from 'react-native'
import { SafeAreaView, createAppContainer } from 'react-navigation'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import React, { PureComponent } from 'react'
import { parse as parseUrl } from '../helpers/url'
import LottieView from 'lottie-react-native'
import { Flex } from './Library'
import FlashMessage from 'react-native-flash-message'
import { BASE_WEBSITE_URL, colors } from './../constants'
import { I18nextProvider } from 'react-i18next'
import ReactNativeLanguages from 'react-native-languages'
import i18n from '../i18n'
import Instabug from 'instabug-reactnative'
import { btoa } from 'b64-lite'
import Config from 'react-native-config'
import NavigationService from './../helpers/NavigationService'
import { AppNavigator } from './Navigator/AppNavigator'
import { RelayContext } from '../relay'
const AppContainer = createAppContainer(AppNavigator)

export default class App extends PureComponent {
  state = {
    loading: true,
    showAnim: (process.env['ENVIRONMENT'] !== 'integration_test'),
    relayContext: null,
    deepLink: {
      routeName: 'main',
      params: {},
    },
  }

  constructor (props) {
    super(props)

    Instabug.setIntroMessageEnabled(false)

    if (Platform.OS === 'ios') {
      Instabug.startWithToken(
        Config.INSTABUG_TOKEN,
        [__DEV__ ? Instabug.invocationEvent.none : Instabug.invocationEvent.shake],
      )
    }

    if (__DEV__) {
      const DevMenu = require('react-native-dev-menu')
      DevMenu.addItem('Show Instabug', () => Instabug.invoke())
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

  _onLanguageChange = ({ language, languages }) => {
    i18n.changeLanguage(language)
  }

  handleOpenURL (event) {
    let url = parseUrl(event.url.replace('berty://', `${BASE_WEBSITE_URL}/`))

    switch (url.pathname) {
      case '/conversation':
        this.setState({
          deepLink: {
            routeName: 'chats/detail',
            params: {
              conversation: {
                title: '',
                id: btoa('conversation:' + url.hashParts['id']),
              },
            },
          },
        })
        break
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

  setDeepLink (deepLink) {
    this.setState({ deepLink })
  }

  setStateBis = (i, f) => {
    this.setState(i, f)
  }

  render () {
    const { loading, deepLink, showAnim, progress, relayContext } = this.state
    console.log('rerendering all')
    return (
      <I18nextProvider i18n={i18n}>
        <SafeAreaView style={{ flex: 1 }} forceInset={{ bottom: 'never' }}>
          { showAnim && Platform.OS !== 'web'
            ? <Flex.Rows
              align='center'
              justify='center'
              style={{ 'width': '100%',  height: '100%', zIndex: 1000, position: 'absolute', backgroundColor: colors.white }}
            >
              <LottieView
                source={require('./../static/animation/BertyAnimation.json')}
                autoPlay={true}
                loop={false}
                onAnimationFinish={() => this.setState({ showAnim: false })}
                style={{ 'width': 320 }}
                autoSize
              />
            </Flex.Rows>
            : null }
          { !loading
            ?
              <RelayContext.Provider value={{...relayContext, setStateBis: this.setStateBis}}>
                <AppContainer
                  ref={nav => {
                    this.navigation = nav
                    NavigationService.setTopLevelNavigator(nav)
                  }}
                  screenProps={{
                    deepLink,
                    setDeepLink: (deepLink) => this.setDeepLink(deepLink),
                    clearDeepLink: () => this.clearDeepLink(),
                  }}
                />
               </RelayContext.Provider> : null }
          <FlashMessage position='top' />
          {Platform.OS === 'ios' && <KeyboardSpacer />}
        </SafeAreaView>
      </I18nextProvider>
    )
  }
}
