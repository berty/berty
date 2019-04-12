import { TextInput, View, Text, TouchableOpacity, Platform } from 'react-native'
import { hook } from 'cavy'
import { withNamespaces } from 'react-i18next'
import React, { PureComponent } from 'react'

import { Animation, Flex, Loader, Screen } from '@berty/view/component'
import { colors } from '@berty/common/constants'
import { defaultUsername } from '@berty/common/helpers/contacts'
import { environment, contextValue } from '@berty/relay'
import { getAvailableUpdate } from '@berty/common/update'
import {
  queries,
  mutations,
  subscriptions,
  fragments,
  updaters,
} from '@berty/graphql'
import NavigationService from '@berty/common/helpers/NavigationService'
import sleep from '@berty/common/helpers/sleep'
import withDeepLinkHandler from '@berty/common/helpers/withDeepLinkHandler'
import withRelayContext from '@berty/common/helpers/withRelayContext'
import withUpdateContext from '@berty/common/helpers/withUpdateContext'
import withBridgeContext from '@berty/common/helpers/withBridgeContext'

class Auth extends PureComponent {
  state = {
    list: [],
    current: null,
    loading: true,
    message: null,
    nickname: '',
  }

  getIp = async () => {
    if (Platform.OS === 'web' && !Platform.Desktop) {
      return window.location.hostname || '127.0.0.1'
    }
    return '127.0.0.1'
  }

  getPort = async () => {
    const { bridge } = this.props

    try {
      const { port } = await bridge.getPort({})
      return port
    } catch (error) {
      console.warn(error, 'retrying to get port')
      await sleep(1000)
      return this.getPort()
    }
  }

  openDeepLink = () => {
    const {
      deepLinkHandler: { deepLink },
      navigation,
    } = this.props
    navigation.navigate(deepLink)
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

  init = async config => {
    const { t, bridge } = this.props

    this.setState({ loading: true, message: t('core.initializing') })
    try {
      await bridge.initialize(config)
    } catch (err) {
      console.warn('initialize', err)
    }
  }

  list = async () => {
    const { t, bridge } = this.props

    this.setState({ loading: true, message: t('core.account-listing') })
    try {
      const { accounts } = await bridge.listAccounts({})
      this.setState({ accounts })
      return accounts
    } catch (err) {
      console.warn('list account', err)
    }
  }

  start = async nickname => {
    const { t, bridge } = this.props

    this.setState({ loading: true, message: t('daemon.initializing') })
    try {
      await bridge.start({ nickname })
    } catch (error) {
      console.warn(error)
    }
  }

  open = async (nickname, options) => {
    let { firstLaunch } = options || {}

    if (nickname == null) {
      // await this.init() @FIXME: remove this ?
      const list = await this.list()
      if (list.length <= 0) {
        const deviceName = defaultUsername()

        this.setState({ loading: false, message: null, nickname: deviceName })
        this.nicknameInput.blur()

        return
      }
      nickname = list[0]
    }

    await this.start(nickname) // @FIXME: implement this later
    const context = await this.getRelayContext()
    getAvailableUpdate(context).then(update => {
      this.props.updateContext.setState(update)
    })
    this.props.context.setState(
      {
        relayContext: context,
        loading: false,
      },
      () => {
        this.openDeepLink()
      }
    )

    this.props.navigation.navigate('switch/picker', {
      firstLaunch,
      deepLink: this.props.deepLinkHandler.deepLink,
    })
  }

  authNewUser = () => {
    this.open(this.state.nickname, { firstLaunch: true }).then(() => {})
  }

  async componentDidMount () {
    if (Platform.OS === 'web') {
      NavigationService.setTopLevelNavigator(this.props.navigation)
    }

    this.open()
  }

  render () {
    const { t } = this.props
    const { loading, message, current } = this.state

    if (loading === true) {
      return ['ios', 'android'].some(_ => _ === Platform.OS) ? (
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
          <>
            <Animation />
            <Text bottom tiny>
              {message}
            </Text>
          </>
        </Flex.Rows>
      ) : (
        <Loader message={message} />
      )
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
                ref={this.props.generateTestHook(
                  'Auth.TextInput',
                  nicknameInput => {
                    this.nicknameInput = nicknameInput
                  }
                )}
                textContentType={'name'}
                onChangeText={nickname => this.setState({ nickname })}
                onKeyPress={e => {
                  if (Platform.Desktop && e.key === 'Enter') {
                    this.authNewUser()
                  }
                  e.preventDefault()
                }}
                value={this.state.nickname}
              />
              <TouchableOpacity
                onPress={() => this.authNewUser()}
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

// const withBridgeContext = Component => (
//   <BridgeContext.Consumer>
//     {bridge => <Component bridgeContext={bridge} />}
//   </BridgeContext.Consumer>
// )
export default withDeepLinkHandler(
  withBridgeContext(
    withRelayContext(withUpdateContext(withNamespaces()(hook(Auth))))
  )
)
