import React, { PureComponent } from 'react'
import { colors } from '../../../constants'
import { View } from 'react-native'
import { Menu, Flex, Text } from '../../Library'
import { padding, borderBottom } from '../../../styles'

const Header = ({ navigation }) => (
  <View
    style={[
      { backgroundColor: colors.white, height: 72 },
      borderBottom,
      padding,
    ]}
  >
    <Flex.Cols size={1} align='start' space='between'>
      <Text icon='settings' large color={colors.black}>
        Settings
      </Text>
    </Flex.Cols>
  </View>
)

export default class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} />,
    tabBarVisible: false,
  })
  render () {
    return (
      <Menu absolute>
        <Menu.Section>
          <Menu.Item
            icon='user'
            title='My account'
            onPress={() => console.log('Account')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='lock'
            title='Security & Privacy'
            onPress={() => console.log('Security')}
          />
          <Menu.Item
            icon='send'
            title='Message settings'
            onPress={() => console.log('Message')}
          />
          <Menu.Item
            icon='bell'
            title='Notifications'
            onPress={() => console.log('Notifications')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='info'
            title='About Berty'
            onPress={() => console.log('About')}
          />
          <Menu.Item
            icon='activity'
            title='News'
            onPress={() => console.log('News')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='life-buoy'
            title='Support'
            onPress={() => console.log('Support')}
          />
          <Menu.Item
            icon='layers'
            title='Legal mentions'
            onPress={() => console.log('Legal')}
          />
        </Menu.Section>
      </Menu>
    )
  }
}
