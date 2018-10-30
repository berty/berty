import { ActivityIndicator, NativeModules } from 'react-native'
import React, { PureComponent } from 'react'

import { Flex, Header, Menu, Screen, Text } from '../../../Library'
import { colors } from '../../../../constants'

const { CoreModule } = NativeModules

export default class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: navigation.getParam('restartDaemon') ? null : (
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
  }

  restartDaemon = async () => {
    this.props.navigation.setParams({ restartDaemon: true })
    this.setState({ restartDaemon: true }, async () => {
      try {
        await CoreModule.restart()
        this.props.navigation.setParams({
          restartDaemon: false,
        })
        this.setState({ restartDaemon: false })
      } catch (err) {
        console.error(err)
      }
    })
  }

  render () {
    const { navigation } = this.props
    console.log(navigation)
    const { restartDaemon } = this.state
    if (restartDaemon) {
      return (
        <Screen style={{ backgroundColor: colors.white }}>
          <Flex.Rows align='center'>
            <Flex.Cols align='end'>
              <ActivityIndicator size='large' />
            </Flex.Cols>
            <Text center margin align='start'>
              Daemon is restarting, please wait ...
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
