import React, { PureComponent } from 'react'
import { Image } from 'react-native'
import { Header, Menu, Flex } from '../../../Library'

export default class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title='Help' backBtn />,
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
              source={require('../../../../static/img/square_help.png')}
            />
          </Flex.Rows>
        </Flex.Cols>
        <Menu.Section>
          <Menu.Item
            icon='book-open'
            title='Read the FAQ'
            onPress={() => navigation.push('help/faq')}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='message-circle'
            title='Contact us'
            onPress={() => navigation.push('help/contact')}
          />
        </Menu.Section>
      </Menu>
    )
  }
}
