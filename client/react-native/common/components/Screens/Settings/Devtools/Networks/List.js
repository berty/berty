import React, { PureComponent } from 'react'
import { Header, Menu } from '../../../../Library'

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
      <Menu absolute>
        <Menu.Section>
          <Menu.Item
            icon='list'
            title='List peers (not implemented)'
            onPress={() => {
              navigation.push('networks/peers')
            }}
          />
        </Menu.Section>
      </Menu>
    )
  }
}
