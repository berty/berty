import { URL, URLSearchParams } from 'whatwg-url'
import {
  ActivityIndicator,
  Linking,
  NativeModules,
  Platform,
  TextInput,
} from 'react-native'
import { SafeAreaView, NavigationActions } from 'react-navigation'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import React, { PureComponent } from 'react'

import { Flex, Screen } from './Library'
import { colors } from '../constants'
import { subscriptions } from '../graphql'
import Screens from './Screens'
import { getAvailableUpdate } from '../helpers/update'

const { CoreModule } = NativeModules

export default class App extends PureComponent {
  state = {
    loading: true,
    success: false,
    error: false,
    nickname: null,
    availableUpdate: null,
  }

  setStateLoading = () =>
    this.setState({ loading: true, success: false, error: false })
  setStateSuccess = () =>
    this.setState({ loading: false, success: true, error: false })
  setStateError = () =>
    this.setState({ loading: false, success: false, error: true })

  initialize = async () => {
    if (Platform.OS === 'web') {
      this.setState({ nickname: '' })
      return this.start()
    }
    try {
      await CoreModule.initialize()
      let accounts = await CoreModule.listAccounts()
      if (accounts === '') {
        accounts = []
      } else {
        accounts = accounts.split(':')
      }

      getAvailableUpdate().then(availableUpdate => this.setState({ availableUpdate }))

      const nickname = accounts.length > 0 ? accounts[0] : null
      this.setState({
        nickname,
      })
      if (nickname != null) {
        await this.start(nickname)
      } else {
        this.setStateSuccess()
      }
    } catch (error) {
      console.error(error)
      this.setStateError()
    }
  }

  start = async () => {
    this.setStateLoading()
    try {
      await CoreModule.start(this.state.nickname)
    } catch (err) {
      console.warn(err)
    }
    try {
      subscriptions.eventStream.subscribe({
        iterator: function * () {
          try {
            while (true) {
              console.log('EventStream: ', yield)
            }
          } catch (error) {
            console.error('EventStream: ', error)
          }
          console.log('EventStream: return')
        },
        updater: undefined,
      })
      subscriptions.eventStream.start()
      this.setState({
        loading: false,
        success: true,
        error: false,
      })
    } catch (err) {
      this.setState({
        loading: false,
        success: false,
        error: true,
      })
      console.error(err)
      subscriptions.eventStream.dispose()
    }

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
  }

  componentDidMount () {
    this.initialize()
  }

  componentWillUnmount () {
    subscriptions.eventStream.dispose()

    if (this._handleOpenURL !== undefined) {
      Linking.removeEventListener('url', this._handleOpenURL)
    }
  }

  handleOpenURL (event) {
    let url = new URL(event.url.replace('berty://', 'https://berty.tech/'))
    let params = new URLSearchParams(url.hash.replace('#', ''))

    switch (url.pathname) {
      case '/add-contact':
        this.navigation.dispatch(NavigationActions.navigate({
          routeName: 'modal/contacts/add/by-public-key',
          params: {
            initialKey: params.get('public-key'),
            initialName: params.get('display-name'),
          },
        }))
        break
      default:
        console.warn(`Unhandled deep link, URL: ${event.url}`)
        break
    }
  }

  render () {
    const { loading, success, nickname } = this.state
    return (
      <SafeAreaView style={{ flex: 1 }} forceInset={{ bottom: 'never' }}>
        {loading && (
          <Flex.Rows align='center'>
            <ActivityIndicator size='large' />
          </Flex.Rows>
        )}
        {success && nickname != null ? (
          <Screens
            ref={nav => {
              this.navigation = nav
            }}
            screenProps={{ availableUpdate: this.state.availableUpdate }}
          />
        ) : null}
        {success && nickname == null ? (
          <Screen style={{ backgroundColor: colors.white }}>
            <Flex.Rows align='center' justify='center'>
              <Flex.Cols align='center' justify='center'>
                <TextInput
                  style={{ flex: 1 }}
                  placeholder='Enter a nickname'
                  onSubmitEditing={({ nativeEvent }) =>
                    this.setState({ nickname: nativeEvent.text }, () =>
                      this.start(),
                    )
                  }
                />
              </Flex.Cols>
            </Flex.Rows>
          </Screen>
        ) : null}
        {Platform.OS === 'ios' && <KeyboardSpacer />}
      </SafeAreaView>
    )
  }
}
