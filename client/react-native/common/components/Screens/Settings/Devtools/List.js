import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { RNRestart } from 'react-native-restart'
import { Header, Menu } from '../../../Library'

export default class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Developer Tools'
        titleIcon='terminal'
        backBtn
      />
    ),
    tabBarVisible: false,
  })

  render () {
    const { navigation } = this.props
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
              icon='refresh-ccw'
              title='Restart app'
              onPress={() => {
                RNRestart.Restart()
              }}
            />
          )}
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
