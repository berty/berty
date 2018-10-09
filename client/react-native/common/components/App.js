import React, { PureComponent } from 'react'
import Screens from './Screens'
import { NativeModules, Platform, ActivityIndicator } from 'react-native'
import { Flex } from './Library'
import { subscriptions } from '../graphql'
import { SafeAreaView } from 'react-navigation'
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
  }

  componentWillUnmount () {
    subscriptions.eventStream.dispose()
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
        {success && <Screens />}
        {Platform.OS === 'ios' && <KeyboardSpacer />}
      </SafeAreaView>
    )
  }
}
