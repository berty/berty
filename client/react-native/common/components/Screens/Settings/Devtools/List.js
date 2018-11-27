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

  panic = async () => {
    this.props.navigation.setParams({ panic: true })
    this.setState({ panic: true }, async () => {
      if (Platform.OS === 'web') {
        await this.props.screenProps.queries.Panic.fetch()
      } else {
        CoreModule.panic()
      }
      this.props.navigation.setParams({
        panic: false,
      })
      this.setState({ panic: false })
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
            icon='refresh-ccw'
            title='Restart daemon'
            onPress={this.restartDaemon}
          />
          <Menu.Item icon='alert-triangle' title='Panic' onPress={this.panic} />
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
