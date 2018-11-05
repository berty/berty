import React, { PureComponent } from 'react'
import Screens from './Screens'
import {
  NativeModules,
  Platform,
  ActivityIndicator,
  Linking,
} from 'react-native'
import { Flex } from './Library'
import { subscriptions } from '../graphql'
import { SafeAreaView, NavigationActions } from 'react-navigation'
import KeyboardSpacer from 'react-native-keyboard-spacer'

const { CoreModule } = NativeModules

export default class App extends PureComponent {
  state = {
    loading: true,
    success: false,
    error: false,
  }

  async componentDidMount () {
    try {
      await CoreModule.start()
      await CoreModule.getPort()
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

  componentWillUnmount () {
    subscriptions.eventStream.dispose()

    if (this._handleOpenURL !== undefined) {
      Linking.removeEventListener('url', this._handleOpenURL)
    }
  }

  handleOpenURL (event) {
    const prefixes = ['berty://']
    let url = event.url

    for (let prefix of prefixes) {
      if (url.indexOf(prefix) === 0) {
        url = url.substr(prefix.length)
        break
      }
    }

    const urlParts = url.split('/')

    if (
      urlParts.length === 3 &&
      urlParts[0] === 'add-contact' &&
      urlParts[1] === 'public-key'
    ) {
      console.log('Adding new contact via public key')

      this.navigation.dispatch(
        NavigationActions.navigate({
          routeName: 'modal/contacts/add/by-public-key',
          params: { initialKey: urlParts[2] },
        })
      )
    }
  }

  render () {
    const { loading, success } = this.state
    return (
      <SafeAreaView style={{ flex: 1 }}>
        {loading && (
          <Flex.Rows align='center'>
            <ActivityIndicator size='large' />
          </Flex.Rows>
        )}
        {success && (
          <Screens
            ref={nav => {
              this.navigation = nav
            }}
          />
        )}
        {Platform.OS === 'ios' && <KeyboardSpacer />}
      </SafeAreaView>
    )
  }
}
