import { TextInput, View, Text, TouchableOpacity, Platform } from 'react-native'
import { hook } from 'cavy'
import { withNamespaces } from 'react-i18next'
import React, { PureComponent } from 'react'

import { Animation, Flex, Loader, Screen } from '@berty/component'
import { colors } from '@berty/common/constants'
import { defaultUsername } from '@berty/common/helpers/contacts'
// import { getAvailableUpdate } from '@berty/update'
import NavigationService from '@berty/common/helpers/NavigationService'
import sleep from '@berty/common/helpers/sleep'
import { withUpdateContext } from '@berty/update/context'
import { withBridgeContext } from '@berty/bridge/Context'
import { rpc, service, middleware } from '@berty/bridge'
import { getAvailableUpdate } from '@berty/update'

@withBridgeContext
@withUpdateContext
@withNamespaces()
@hook
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
      var url = new URL(window.location.href)
      return (
        url.searchParams.get('node-host') ||
        url.searchParams.get('host') ||
        '127.0.0.1'
      )
    }
    return '127.0.0.1'
  }

  getPort = async () => {
    const { bridge } = this.props

    try {
      return await bridge.daemon.getPort({})
    } catch (error) {
      console.warn(error, 'retrying to get port')
      await sleep(1000)
      return this.getPort()
    }
  }

  list = async () => {
    const { t, bridge } = this.props
    this.setState({ loading: true, message: t('core.account-listing') })
    try {
      const { accounts } = await bridge.daemon.listAccounts({})
      this.setState({ accounts })
      return accounts
    } catch (err) {
      console.warn('list account', err)
      return {}
    }
  }

  start = async nickname => {
    const { t, bridge } = this.props

    this.setState({ loading: true, message: t('daemon.initializing') })
    try {
      await bridge.daemon.start({ nickname })
    } catch (error) {
      console.warn(error)
    }
  }

  open = async (nickname, options) => {
    let { firstLaunch } = options || {}

    if (nickname == null) {
      const list = await this.list()
      if (list.length <= 0) {
        const deviceName = defaultUsername()

        this.setState({ loading: false, message: null, nickname: deviceName })
        this.nicknameInput.blur()

        return
      }
      nickname = list[0] || defaultUsername()
    }

    await this.start(nickname) // @FIXME: implement this later

    const { grpcWebPort } = await this.getPort()
    const nodeService = service.create(
      service.NodeService,
      rpc.grpcWebWithHostname(`http://${await this.getIp()}:${grpcWebPort}`),
      middleware.chain(
        __DEV__ ? middleware.logger.create('NODE-SERVICE') : null // eslint-disable-line
      )
    )

    const bridge = {
      ...this.props.bridge,
      node: {
        service: nodeService,
      },
    }

    getAvailableUpdate(bridge).then(update => {
      this.props.updateContext.setState(update)
    })

    this.props.bridge.setContext(bridge)

    this.props.navigation.navigate('switch/picker', {
      firstLaunch,
    })
  }

  authNewUser = () => {
    this.open(this.state.nickname, { firstLaunch: true }).then(() => {})
  }

  async componentDidMount() {
    if (Platform.OS === 'web') {
      NavigationService.setTopLevelNavigator(this.props.navigation)
    }

    this.open()
  }

  render() {
    const { t } = this.props
    const { loading, message, current } = this.state

    if (loading === true) {
      return ['ios', 'android'].some(_ => _ === Platform.OS) ? (
        <Flex.Rows
          align="center"
          justify="center"
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
          <Flex.Cols align="center">
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
                value={this.state.nickname || ''}
              />
              <TouchableOpacity
                onPress={() => this.authNewUser()}
                disabled={
                  this.state.nickname == null ||
                  this.state.nickname.length === 0
                }
                ref={this.props.generateTestHook('Auth.Button')}
              >
                <Text
                  style={{
                    color: colors.white,
                    backgroundColor: colors.blue,
                    opacity:
                      this.state.nickname == null &&
                      this.state.nickname.length === 0
                        ? 0.3
                        : 1,
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

export default Auth
