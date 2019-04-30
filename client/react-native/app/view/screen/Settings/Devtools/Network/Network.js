import React, { PureComponent } from 'react'
import { Menu, Header } from '@berty/view/component'

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
    const { navigation } = this.props
    return (
      <Menu>
        <Menu.Section customMarginTop={1}>
          <Menu.Item
            icon='list'
            title='List peers'
            onPress={() => {
              navigation.navigate('network/peers')
            }}
          />
        </Menu.Section>
        <Menu.Section>
          <Menu.Item
            icon='sliders'
            title='Network configuration'
            onPress={() => {
              navigation.navigate('network/config')
            }}
          />
        </Menu.Section>
      </Menu>
    )
  }
}
