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
import { queries } from '../../../../graphql'

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
        await queries.Panic.fetch()
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

  antispam = false

  toggleBotState = async () => {
    if (!this.antispam) {
      this.antispam = true
      try {
        if (this.state.botRunning === true) {
          await CoreModule.stopBot()
        } else {
          await CoreModule.startBot()
        }

        this.setState({ botRunning: !this.state.botRunning })
        this.antispam = false
      } catch (err) {
        Alert.alert('Error', `${err}`)
        this.antispam = false
      }
    }
  }

  componentDidMount () {
    this.getBotState()
  }

  throwNativeException = () => {
    CoreModule.throwException()
  }

  throwJsException = () => {
    throw new Error('thrown exception')
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
            icon='list'
            title='List events'
            onPress={() => navigation.push('devtools/eventlist')}
          />
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
