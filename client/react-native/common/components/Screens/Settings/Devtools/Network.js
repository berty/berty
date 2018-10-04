import React, { PureComponent } from 'react'
import { Menu, Header } from '../../../Library'

export default class Network extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Network'
        titleIcon='activity'
        backBtn
      />
    ),
  })
  render () {
    return (
      <Menu absolute>
        <Menu.Section>
          <Menu.Item
            icon='list'
            title='List peers (not implemented)'
            onPress={() => {
              console.log('List')
            }}
          />
        </Menu.Section>
      </Menu>
    )
  }
}
