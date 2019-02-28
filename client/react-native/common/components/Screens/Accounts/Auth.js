import {
  NativeModules,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native'
import React, { PureComponent } from 'react'

import { Flex, Loader, Screen } from '../../Library'
import { colors } from '../../../constants'
import { defaultUsername } from '../../../helpers/contacts'
import withRelayContext from '../../../helpers/withRelayContext'
import sleep from '../../../helpers/sleep'
import { environment, contextValue } from '../../../relay'
import { getAvailableUpdate } from '../../../helpers/update'
import { withNamespaces } from 'react-i18next'
import {
  queries,
  mutations,
  subscriptions,
  fragments,
  updaters,
} from '../../../graphql'
import { hook } from 'cavy'

const { CoreModule } = NativeModules

class Auth extends PureComponent {
  state = {
    list: [],
    current: null,
    loading: true,
    message: null,
    nickname: '',
  }

  getIp = async () => {
    if (Platform.OS === 'web') {
      return window.location.hostname
    }
    return '127.0.0.1'
  }

  getPort = async () => {
    try {
      const port = await CoreModule.getPort()
      console.log('get port', port)
      return port
    } catch (error) {
      console.warn(error, 'retrying to get port')
      await sleep(1000)
      return this.getPort()
    }
  }

  openDeepLink = () => {
    const {
      screenProps: {
        deepLink,
        clearDeepLink,
      },
      navigation,
    } = this.props

    if (!deepLink || deepLink === 'undefined' || Platform.OS === 'web') {
      return
    }

    navigation.navigate(deepLink)
    clearDeepLink()
  }

  getRelayContext = async () => {
    const test = await contextValue({
      environment: await environment.setup({
        getIp: this.getIp,
        getPort: this.getPort,
      }),
      mutations,
      subscriptions,
      queries,
      fragments,
      updaters,
    })

    return test
  }

  init = async () => {
    const { t } = this.props

    this.setState({ loading: true, message: t('core.initializing') })
    try {
      await CoreModule.initialize()
    } catch (error) {
      throw error
    }
  }

  list = async () => {
    const { t } = this.props

    this.setState({ loading: true, message: t('core.account-listing') })
    try {
      let list = await CoreModule.listAccounts()
      if (list === '') {
        list = []
      } else {
        list = list.split(':')
      }
      this.setState({ list })
      return list
    } catch (error) {
      throw error
    }
  }

  start = async nickname => {
    const { t } = this.props

    this.setState({ loading: true, message: t('daemon.initializing') })
    try {
      await CoreModule.start(nickname)
    } catch (error) {
      throw error
    }
  }

  open = async (nickname, options) => {
    let { firstLaunch } = options || {}

    if (nickname == null) {
      await this.init()
      const list = await this.list()
      if (list.length <= 0) {
        const deviceName = defaultUsername()

        this.setState({ loading: false, message: null, nickname: deviceName })
        this.nicknameInput.blur()

        return
      }
      nickname = list[0]
    }
    await this.start(nickname)
    const context = await this.getRelayContext()
    const availableUpdate = await getAvailableUpdate(context)
    this.props.context.setState(
      {
        relayContext: context,
        availableUpdate: availableUpdate,
        loading: false,
      },
      () => {
        this.openDeepLink()
      }
    )

    if (this.props.screenProps !== 'undefined' &&
        (!this.props.screenProps.deepLink || this.props.screenProps.deepLink === 'undefined' || Platform.OS === 'web')) {
      this.props.navigation.navigate('switch/picker', { firstLaunch })
    }
  }

  async componentDidMount () {
    this.open()
  }

  async componentDidUpdate (nextProps) {
    if (nextProps.screenProps.deepLink !== this.props.screenProps.deepLink) {
      this.open(this.state.list[0])
    }
    // if ((nextProps.screenProps !== 'undefined' && this.props.screenProps === 'undefined') || (nextProps.screenProps !== 'undefined' && this.props.screenProps !== 'undefined' && nextProps.screenProps.deepLink !== this.props.screenProps.deepLink)) {
    //   this.openDeepLink()
    // }
  }

  render () {
    const { t } = this.props
    const { loading, message, current } = this.state

    if (loading === true) {
      return <Loader message={message} />
    }
    if (current === null) {
      return (
        <Screen style={{ backgroundColor: colors.background, flex: 1 }}>
          <Flex.Cols align='center'>
            <View
              style={{
                height: 320,
                padding: 20,
                backgroundColor: colors.background,
                width: '100%',
              }}
            >
              <Text
                style={{
                  color: colors.blue,
                  textAlign: 'center',
                  alignSelf: 'stretch',
                  fontSize: 24,
                }}
              >
                {t('auth.welcome-to-berty')}
              </Text>
              <Text
                style={{
                  color: colors.blue,
                  textAlign: 'center',
                  alignSelf: 'stretch',
                  marginTop: 5,
                }}
              >
                {t('auth.get-started')}
              </Text>
              <TextInput
                style={{
                  color: colors.fakeBlack,
                  borderColor: colors.borderGrey,
                  borderWidth: 1,
                  marginTop: 10,
                  padding: 10,
                }}
                placeholder={t('auth.nickname-placeholder')}
                ref={this.props.generateTestHook('Auth.TextInput', nicknameInput => {
                  this.nicknameInput = nicknameInput
                })}
                textContentType={'name'}
                onChangeText={nickname => this.setState({ nickname })}
                value={this.state.nickname}
              />
              <TouchableOpacity
                onPress={() => this.open(this.state.nickname, { firstLaunch: true })}
                disabled={this.state.nickname.length === 0}
                ref={this.props.generateTestHook('Auth.Button')}
              >
                <Text
                  style={{
                    color: colors.white,
                    backgroundColor: colors.blue,
                    opacity: this.state.nickname.length === 0 ? 0.3 : 1,
                    textAlign: 'center',
                    fontSize: 18,
                    marginTop: 10,
                    padding: 8,
                  }}
                >
                  {t('auth.lets-chat')}
                </Text>
              </TouchableOpacity>
            </View>
          </Flex.Cols>
        </Screen>
      )
    }
    return null
  }
}

export default withRelayContext(withNamespaces()(hook(Auth)))
