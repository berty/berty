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

const { CoreModule } = NativeModules

export default class App extends PureComponent {
  state = {
    loading: true,
    success: false,
    error: false,
    nickname: null,
  }

  setStateLoading = () =>
    this.setState({ loading: true, success: false, error: false })
  setStateSuccess = () =>
    this.setState({ loading: false, success: true, error: false })
  setStateError = () =>
    this.setState({ loading: false, success: false, error: true })

  init = async () => {
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

  async componentDidMount () {
    this.init()
  }

  componentWillUnmount () {
    subscriptions.eventStream.dispose()

    if (this._handleOpenURL !== undefined) {
      Linking.removeEventListener('url', this._handleOpenURL)
    }
  }

  handleOpenURL (event) {
    const prefixes = ['https://berty.tech/', 'berty://']

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

      this.navigation.dispatch(
        NavigationActions.navigate({
          routeName: 'modal/contacts/add/by-public-key',
          params: { initialKey: initialKey },
        })
      )
    }
  }

  render () {
    const { loading, success, nickname } = this.state
    return (
      <SafeAreaView style={{ flex: 1 }}>
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
                      this.start()
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
