import React, { PureComponent } from 'react'
import { Platform } from 'react-native'
import { Menu, Header } from '../../../../Library'

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
              navigation.push('network/peers')
            }}
          />
        </Menu.Section>
        {Platform.OS !== 'web' && (
          <Menu.Section>
            <Menu.Item
              icon='sliders'
              title='Network configuration'
              onPress={() => {
                navigation.push('network/config')
              }}
            />
          </Menu.Section>
        )}
      </Menu>
    )
  }
}
