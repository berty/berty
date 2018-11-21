import { NativeModules, TextInput } from 'react-native'
import React, { PureComponent } from 'react'

import { Flex, Loader, Screen } from '../../Library'
import { colors } from '../../../constants'

const { CoreModule } = NativeModules

export default class Auth extends PureComponent {
  state = {
    list: [],
    current: null,
    loading: true,
    message: null,
  }

  init = async () => {
    this.setState({ loading: true, message: 'Initialize core' })
    try {
      await CoreModule.initialize()
    } catch (error) {
      throw error
    }
  }

  list = async () => {
    this.setState({ loading: true, message: 'Retrieving accounts' })
    try {
      const list = await CoreModule.listAccounts()
      this.setState({ list })
      return list
    } catch (error) {
      throw error
    }
  }

  start = async nickname => {
    this.setState({ loading: true, message: 'Starting daemon' })
    try {
      await CoreModule.start(nickname)
    } catch (error) {
      throw error
    }
  }

  open = async nickname => {
    const {
      navigation,
      screenProps: { deepLink },
    } = this.props
    if (nickname == null) {
      await this.init()
      const list = await this.list()
      if (list.length <= 0) {
        this.setState({ loading: false, message: null })
        return
      }
      nickname = list[0]
    }
    await this.start(nickname)
    navigation.navigate(deepLink.routeName, deepLink.params)
  }

  async componentDidMount () {
    this.open()
  }

  async componentDidUpdate (nextProps) {
    if (nextProps.screenProps.deepLink !== this.props.screenProps.deepLink) {
      this.open(this.state.list[0])
    }
  }

  render () {
    const { loading, message, current } = this.state

    if (loading === true) {
      return <Loader message={message} />
    }
    if (current === null) {
      return (
        <Screen style={{ backgroundColor: colors.white }}>
          <Flex.Rows align='center' justify='center'>
            <Flex.Cols align='center' justify='center'>
              <TextInput
                style={{ flex: 1 }}
                placeholder='Enter a nickname'
                onSubmitEditing={({ nativeEvent }) =>
                  this.open(nativeEvent.text)
                }
              />
            </Flex.Cols>
          </Flex.Rows>
        </Screen>
      )
    }
    return null
  }
}
