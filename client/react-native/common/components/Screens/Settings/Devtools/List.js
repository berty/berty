import { ActivityIndicator, NativeModules } from 'react-native'
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
  }

  restartDaemon = async () => {
    this.props.navigation.setParams({ restartDaemon: true })
    this.setState({ restartDaemon: true }, async () => {
      try {
        await CoreModule.restart()
        await CoreModule.getPort()
        this.props.navigation.setParams({
          restartDaemon: false,
        })
        this.setState({ restartDaemon: false })
      } catch (err) {
        console.error(err)
      }
    })
  }

  panic = async () => {
    this.props.navigation.setParams({ panic: true })
    this.setState({ panic: true }, async () => {
      try {
        queries.Panic.fetch()
        await CoreModule.getPort()
        this.props.navigation.setParams({
          panic: false,
        })
        this.setState({ panic: false })
      } catch (err) {
        console.error(err)
      }
    })
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
            icon='refresh-ccw'
            title='Restart daemon'
            onPress={this.restartDaemon}
          />
          <Menu.Item icon='alert-triangle' title='Panic' onPress={this.panic} />
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
