import { Linking, Platform, Animated, Easing } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import React, { PureComponent } from 'react'
import { parse as parseUrl } from '../helpers/url'
import LottieView from 'lottie-react-native'
import { Flex } from './Library'
import FlashMessage from 'react-native-flash-message'
import Accounts from './Screens/Accounts'
import { colors } from './../constants'
import { I18nextProvider } from 'react-i18next'
import ReactNativeLanguages from 'react-native-languages'
import i18n from '../i18n'
import { btoa } from 'b64-lite'

export default class App extends PureComponent {
  state = {
    loading: true,
    showAnim: (process.env['ENVIRONMENT'] !== 'integration_test'),
    duration: 4000,
    progress: new Animated.Value(0),
    deepLink: {
      routeName: 'main',
      params: {},
    },
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
    if (this.state.showAnim === true) { this.startAnimation() }
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
    let url = parseUrl(event.url.replace('berty://', 'https://berty.tech/'))

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

  startAnimation () {
    Animated.timing(this.state.progress, {
      toValue: 1,
      duration: this.state.duration,
      easing: Easing.linear,
    }).start(({ finished }) => {
      if (finished) {
        this.setState({ showAnim: false })
      }
    })
  }

  clearDeepLink () {
    this.setState({ deepLink: null })
  }

  setDeepLink (deepLink) {
    this.setState({ deepLink })
  }

  render () {
    const { loading, deepLink, showAnim, progress } = this.state
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
                progress={progress}
                loop={false}
                style={{ 'width': 320 }}
                autoSize
              />
            </Flex.Rows>
            : null }
          { !loading
            ? <Accounts
              ref={nav => {
                this.navigation = nav
              }}
              screenProps={{
                deepLink,
                setDeepLink: (deepLink) => this.setDeepLink(deepLink),
                clearDeepLink: () => this.clearDeepLink(),
              }}
            /> : null }
          <FlashMessage position='top' />
          {Platform.OS === 'ios' && <KeyboardSpacer />}
        </SafeAreaView>
      </I18nextProvider>
    )
  }
}
