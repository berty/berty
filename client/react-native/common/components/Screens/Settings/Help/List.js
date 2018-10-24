import React, { PureComponent } from 'react'
import { View, Image } from 'react-native'
import { Header, Menu } from '../../../Library'

export default class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title='Help' backBtn />,
    tabBarVisible: false,
  })

  render () {
    const { navigation } = this.props
    return (
      <View style={{ flex: 1 }}>
        <Image
          resizeMode='contain'
          style={{ flex: 3, width: null, height: null, marginTop: 42 }}
          source={require('../../../../static/img/square_help.png')}
        />
        <Menu>
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
      </View>
    )
  }
}
