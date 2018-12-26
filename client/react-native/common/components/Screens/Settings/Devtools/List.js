import {
  ActivityIndicator,
  NativeModules,
  Switch,
  Alert,
  Platform,
} from 'react-native'
import React, { PureComponent } from 'react'

import { Flex, Header, Menu, Screen, Text } from '../../../Library'
import { colors } from '../../../../constants'

const { CoreModule } = NativeModules

export default class List extends PureComponent {
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
    this.props.navigation.setParams({ restartDaemon: true })
    this.setState({ restartDaemon: true }, async () => {
      try {
        await CoreModule.restart()
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
    this.props.navigation.setParams({ testPanic: true })
    this.setState({ testPanic: true }, async () => {
      if (Platform.OS === 'web') {
        await this.props.screenProps.queries.TestPanic.fetch()
      } else {
        CoreModule.panic()
      }
      this.props.navigation.setParams({
        testPanic: false,
      })
      this.setState({ testPanic: false })
    })
  }

  testError = async () => {
    this.props.navigation.setParams({ testError: true })
    this.setState({ testError: true }, async () => {
      if (Platform.OS === 'web') {
        await this.props.screenProps.queries.TestError.fetch() // FIXME: the 'kind' should be selectable
      } else {
        CoreModule.error()
      }
      this.props.navigation.setParams({
        testError: false,
      })
      this.setState({ testError: false })
    })
  }

  testLogBackgroundError = async () => {
    this.props.navigation.setParams({ testLogBackgroundError: true })
    this.setState({ testLogBackgroundError: true }, async () => {
      await this.props.screenProps.queries.TestLogBackgroundError.fetch()
      this.props.navigation.setParams({
        testLogBackgroundError: false,
      })
      this.setState({ testLogBackgroundError: false })
    })
  }

  testLogBackgroundWarn = async () => {
    this.props.navigation.setParams({ testLogBackgroundWarn: true })
    this.setState({ testLogBackgroundWarn: true }, async () => {
      await this.props.screenProps.queries.TestLogBackgroundWarn.fetch()
      this.props.navigation.setParams({
        testLogBackgroundWarn: false,
      })
      this.setState({ testLogBackgroundWarn: false })
    })
  }

  testLogBackgroundDebug = async () => {
    this.props.navigation.setParams({ testLogBackgroundDebug: true })
    this.setState({ testLogBackgroundDebug: true }, async () => {
      await this.props.screenProps.queries.TestLogBackgroundDebug.fetch()
      this.props.navigation.setParams({
        testLogBackgroundDebug: false,
      })
      this.setState({ testLogBackgroundDebug: false })
    })
  }

  getBotState = async () => {
    let running = await CoreModule.isBotRunning()

    this.setState({
      botRunning: running,
      botStateLoaded: true,
    })
  }

  antispamBot = false

  toggleBotState = async () => {
    if (!this.antispamBot) {
      this.antispamBot = true
      try {
        if (this.state.botRunning === true) {
          await CoreModule.stopBot()
        } else {
          await CoreModule.startBot()
        }

        this.setState({ botRunning: !this.state.botRunning })
        this.antispamBot = false
      } catch (err) {
        Alert.alert('Error', `${err}`)
        this.antispamBot = false
      }
    }
  }

  getLocalGRPCState = async () => {
    let json = await CoreModule.getLocalGRPCInfos()
    let infos = JSON.parse(json)

    this.setState({
      localGRPCRunning: infos.IsRunning,
      localGRPCAddress: infos.LocalAddr,
    })
  }

  antispamLocalGRPC = false

  toggleLocalGRPCState = async () => {
    if (!this.antispamLocalGRPC) {
      this.antispamLocalGRPC = true
      try {
        if (this.state.localGRPCRunning === true) {
          await CoreModule.stopLocalGRPC()
        } else {
          await CoreModule.startLocalGRPC()
        }

        this.setState({ localGRPCRunning: !this.state.localGRPCRunning })
        this.antispamLocalGRPC = false
      } catch (err) {
        Alert.alert('Error', `${err}`)
        this.antispamLocalGRPC = false
      }
    }
  }

  componentDidMount () {
    if (Platform.OS !== 'web') {
      this.getBotState()
      this.getLocalGRPCState()
    }
  }

  throwNativeException = () => {
    CoreModule.throwException()
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
        <Menu.Section customMarginTop={1}>
          <Menu.Item
            icon='info'
            title='Device infos'
            onPress={() => navigation.push('devtools/deviceinfos')}
          />
        </Menu.Section>
        <Menu.Section>
          {Platform.OS !== 'web' && (
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
          )}
          <Menu.Item
            icon='globe'
            title='Language'
            onPress={() => navigation.push('devtools/language')}
          />
          <Menu.Item
            icon='refresh-ccw'
            title='Restart daemon'
            onPress={this.restartDaemon}
          />
          <Menu.Item icon='alert-triangle' title='Panic' onPress={this.testPanic} />
          <Menu.Item icon='alert-triangle' title='Error' onPress={this.testError} />
          <Menu.Item icon='info' title='Log bg Error' onPress={this.testLogBackgroundError} />
          <Menu.Item icon='info' title='Log bg Warn' onPress={this.testLogBackgroundWarn} />
          <Menu.Item icon='info' title='Log bg Debug' onPress={this.testLogBackgroundDebug} />
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
          <Menu.Item
            icon='list'
            title='List events'
            onPress={() => navigation.push('devtools/eventlist')}
          />
        </Menu.Section>
        <Menu.Section>
          {Platform.OS !== 'web' && (
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
          )}
          {Platform.OS !== 'android' && (
            <Menu.Item
              icon='file-text'
              title='Console logs'
              onPress={() => navigation.push('devtools/logs')}
            />
          )}
          {Platform.OS === 'android' && (
            <Menu.Item
              icon='file-text'
              title='Console logs (crash on Android cf. #627)'
            />
          )}
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='database'
            title='Database'
            onPress={() => navigation.push('devtools/database')}
          />
          <Menu.Item
            icon='activity'
            title='Network'
            onPress={() => navigation.push('devtools/network')}
          />
          <Menu.Item
            icon='check-circle'
            title='Integration tests'
            onPress={() => navigation.push('devtools/tests')}
          />
        </Menu.Section>
      </Menu>
    )
  }
}
