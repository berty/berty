import React, { PureComponent } from 'react'
import { Image } from 'react-native'
import { Header, Menu, Flex } from '../../../Library'

export default class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title='Legal terms' backBtn />,
    tabBarVisible: false,
  })

  render () {
    const { navigation } = this.props
    return (
      <Menu style={{ marginTop: 42 }}>
        <Flex.Cols size={1} align='center' justify='between'>
          <Flex.Rows size={1} align='center' justify='between'>
            <Image
              resizeMode='contain'
              style={{ width: 300, height: 300 }}
              source={require('../../../../static/img/square_legal.svg')}
            />
          </Flex.Rows>
        </Flex.Cols>
        <Menu.Section>
          <Menu.Item
            icon='book-open'
            title='Privacy policy'
            onPress={() => navigation.push('legal/privacy')}
          />
          <Menu.Item
            icon='book-open'
            title='Terms of service'
            onPress={() => navigation.push('legal/terms')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='layers'
            title='App credits'
            onPress={() => navigation.push('legal/credits')}
          />
          <Menu.Item
            icon='layers'
            title='Software license'
            onPress={() => navigation.push('legal/license')}
          />
        </Menu.Section>
      </Menu>
    )
  }
}
