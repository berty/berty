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

export default class App extends PureComponent {
  state = {
    loading: true,
    hide: true,
    duration: 4000,
    progress: new Animated.Value(0),
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
    this.startAnimation()
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

  startAnimation () {
    Animated.timing(this.state.progress, {
      toValue: 1,
      duration: this.state.duration,
      easing: Easing.linear,
    }).start(({ finished }) => {
      if (finished) {
        this.setState({ hide: false })
      }
    })
  }

  render () {
    console.log(this.onAnimationFinished)
    const { loading, deepLink, hide, progress } = this.state
    return (
      <SafeAreaView style={{ flex: 1 }} forceInset={{ bottom: 'never' }}>
        { hide && Platform.OS !== 'web'
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
            }}
          /> : null }
        <Accounts
          ref={nav => {
            this.navigation = nav
          }}
          screenProps={{
            deepLink,
          }}
        />
        <FlashMessage position='top' />
        {Platform.OS === 'ios' && <KeyboardSpacer />}
      </SafeAreaView>
    )
  }
}
