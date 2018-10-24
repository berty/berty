import React, { PureComponent } from 'react'
import { View, Image } from 'react-native'
import { Header, Menu } from '../../../Library'

export default class List extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: <Header navigation={navigation} title='Legal terms' backBtn />,
    tabBarVisible: false,
  })

  render () {
    const { navigation } = this.props
    return (
      <View style={{ flex: 1 }}>
        <Image
          resizeMode='contain'
          style={{ flex: 3, width: null, height: null, marginTop: 42 }}
          source={require('../../../../static/img/square_legal.png')}
        />
        <Menu>
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
      </View>
    )
  }
}
