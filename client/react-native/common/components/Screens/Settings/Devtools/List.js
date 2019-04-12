import React, { PureComponent } from 'react'
import { ActivityIndicator, Switch, Alert, Platform } from 'react-native'

import { Flex, Header, Menu, Screen, Text } from '../../../Library'
import { colors } from '../../../../constants'
import withRelayContext from '../../../../helpers/withRelayContext'
import withBridgeContext from '../../../../helpers/withBridgeContext'

class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header:
      navigation.getParam('restartDaemon') ||
      navigation.getParam('panic') ? null : (
          <Header
            navigation={navigation}
            title='Developer Tools'
            titleIcon='terminal'
            backBtn
          />
        ),
    tabBarVisible: false,
  })

  state = {
    restartDaemon: false,
    panic: false,
    botStateLoaded: false,
    botRunning: false,
    localGRPCRunning: false,
    localGRPCAddress: '',
  }

  restartDaemon = async () => {
    const { bridge } = this.props

    this.props.navigation.setParams({ restartDaemon: true })
    this.setState({ restartDaemon: true }, async () => {
      try {
        await bridge.restart({})
      } catch (err) {
        console.error(err)
      }
      this.props.navigation.setParams({
        restartDaemon: false,
      })
      this.setState({ restartDaemon: false })
    })
  }

  testPanic = async () => {
    const { bridge } = this.props

    this.props.navigation.setParams({ testPanic: true })
    this.setState({ testPanic: true }, async () => {
      await bridge.panic({})

      this.props.navigation.setParams({
        testPanic: false,
      })
      this.setState({ testPanic: false })
    })
  }

  testError = async () => {
    const { bridge } = this.props

    this.props.navigation.setParams({ testError: true })
    this.setState({ testError: true }, async () => {
      await bridge.error({})

      this.props.navigation.setParams({
        testError: false,
      })
      this.setState({ testError: false })
    })
  }

  testLogBackgroundError = async () => {
    this.props.navigation.setParams({ testLogBackgroundError: true })
    this.setState({ testLogBackgroundError: true }, async () => {
      await this.props.context.queries.TestLogBackgroundError.fetch()
      this.props.navigation.setParams({
        testLogBackgroundError: false,
      })
      this.setState({ testLogBackgroundError: false })
    })
  }

  testLogBackgroundWarn = async () => {
    this.props.navigation.setParams({ testLogBackgroundWarn: true })
    this.setState({ testLogBackgroundWarn: true }, async () => {
      await this.props.context.queries.TestLogBackgroundWarn.fetch()
      this.props.navigation.setParams({
        testLogBackgroundWarn: false,
      })
      this.setState({ testLogBackgroundWarn: false })
    })
  }

  testLogBackgroundDebug = async () => {
    this.props.navigation.setParams({ testLogBackgroundDebug: true })
    this.setState({ testLogBackgroundDebug: true }, async () => {
      await this.props.context.queries.TestLogBackgroundDebug.fetch()
      this.props.navigation.setParams({
        testLogBackgroundDebug: false,
      })
      this.setState({ testLogBackgroundDebug: false })
    })
  }

  getBotState = async () => {
    const { bridge } = this.props

    try {
      const { isBotRunning } = await bridge.getBotState({})

      this.setState({
        botRunning: isBotRunning,
        botStateLoaded: true,
      })
    } catch (err) {
      console.warn(err)
    }
  }

  antispamBot = false

  toggleBotState = async () => {
    const { bridge } = this.props

    if (!this.antispamBot) {
      this.antispamBot = true
      try {
        if (this.state.botRunning === true) {
          await bridge.stopBot({})
        } else {
          await bridge.startBot({})
        }

        this.setState({ botRunning: !this.state.botRunning })
        this.antispamBot = false
      } catch (err) {
        console.warn(err)
        this.antispamBot = false
      }
    }
  }

  getLocalGRPCState = async () => {
    const { bridge } = this.props

    try {
      let config = await bridge.getLocalGrpcInfos({})
      let infos = JSON.parse(config.json)

      this.setState({
        localGRPCRunning: infos.IsRunning,
        localGRPCAddress: infos.LocalAddr,
      })
    } catch (err) {
      console.warn(err)
    }
  }

  antispamLocalGRPC = false

  toggleLocalGRPCState = async () => {
    const { bridge } = this.props

    if (!this.antispamLocalGRPC) {
      this.antispamLocalGRPC = true
      try {
        if (this.state.localGRPCRunning === true) {
          await bridge.stopLocalGRPC({})
        } else {
          await bridge.startLocalGRPC({})
        }

        this.setState({ localGRPCRunning: !this.state.localGRPCRunning })
        this.antispamLocalGRPC = false
      } catch (err) {
        console.warn(err)
        this.antispamLocalGRPC = false
      }
    }
  }

  componentDidMount () {
    this.getBotState()
    this.getLocalGRPCState()
  }

  throwNativeException = () => {
    const { bridge } = this.props
    bridge.throwException({}).catch(err => {
      Alert.alert('Error', `${err}`)
    })
  }

  throwJsException = () => {
    throw new Error('thrown exception')
  }

  jsConsoleError = () => {
    console.error('console error')
  }

  render () {
    const { navigation } = this.props
    const { restartDaemon, panic } = this.state

    if (restartDaemon || panic) {
      return (
        <Screen style={{ backgroundColor: colors.white }}>
          <Flex.Rows align='center'>
            <Flex.Cols align='end'>
              <ActivityIndicator size='large' />
            </Flex.Cols>
            <Text center margin align='start'>
              {restartDaemon && 'Daemon is restarting, please wait ...'}
              {panic && 'Daemon has been panicked, please wait ...'}
            </Text>
          </Flex.Rows>
        </Screen>
      )
    }
    return (
      <Menu>
        <Menu.Section>
          <Menu.Item
            icon='cpu'
            title='Bot mode'
            customRight={
              <Switch
                justify='end'
                disabled={!this.state.botStateLoaded}
                value={this.state.botRunning}
                onValueChange={this.toggleBotState}
              />
            }
          />
          <Menu.Item
            icon='refresh-ccw'
            title='Restart daemon'
            onPress={this.restartDaemon}
          />
          <Menu.Item
            icon='server'
            title={
              'Local gRPC (' +
              (this.state.localGRPCAddress === ''
                ? 'no private IP'
                : this.state.localGRPCAddress) +
              ')'
            }
            customRight={
              <Switch
                justify='end'
                disabled={this.state.localGRPCAddress === ''}
                value={this.state.localGRPCRunning}
                onValueChange={this.toggleLocalGRPCState}
              />
            }
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='info'
            title='Device infos'
            onPress={() => navigation.navigate('devtools/deviceinfos')}
          />
          <Menu.Item
            icon='globe'
            title='Language'
            onPress={() => navigation.navigate('devtools/language')}
          />
          <Menu.Item
            icon='database'
            title='Database'
            onPress={() => navigation.navigate('devtools/database')}
          />
          <Menu.Item
            icon='activity'
            title='Network'
            onPress={() => navigation.navigate('devtools/network')}
          />
          <Menu.Item
            icon='list'
            title='List events'
            onPress={() => navigation.navigate('devtools/eventlist')}
          />
          {Platform.OS !== 'android' && (
            <Menu.Item
              icon='file-text'
              title='Console logs'
              onPress={() => navigation.navigate('devtools/logs')}
            />
          )}
          {Platform.OS === 'android' && (
            <Menu.Item
              icon='file-text'
              title='Console logs (crash on Android cf. #627)'
            />
          )}
          <Menu.Item
            icon='bell'
            title={'Notifications'}
            onPress={() => navigation.navigate('devtools/notifications')}
          />
          <Menu.Item
            icon='sunrise'
            title='Show onboarding'
            onPress={() => navigation.navigate('switch/onboarding')}
          />
          <Menu.Item
            icon='check-circle'
            title='Integration tests'
            onPress={() => navigation.navigate('devtools/tests')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='alert-triangle'
            title='Panic'
            onPress={this.testPanic}
          />
          <Menu.Item
            icon='alert-triangle'
            title='Error'
            onPress={this.testError}
          />
          <Menu.Item
            icon='info'
            title='Log bg Error'
            onPress={this.testLogBackgroundError}
          />
          <Menu.Item
            icon='info'
            title='Log bg Warn'
            onPress={this.testLogBackgroundWarn}
          />
          <Menu.Item
            icon='info'
            title='Log bg Debug'
            onPress={this.testLogBackgroundDebug}
          />
          <Menu.Item
            icon='slash'
            title='Throw native exception'
            onPress={this.throwNativeException}
          />
          <Menu.Item
            icon='slash'
            title='Throw JS exception'
            onPress={this.throwJsException}
          />
          <Menu.Item
            icon='slash'
            title='JS console error'
            onPress={this.jsConsoleError}
          />
        </Menu.Section>
      </Menu>
    )
  }
}

export default withBridgeContext(withRelayContext(List))
