import React, { PureComponent } from 'react'
import { createStackNavigator } from 'react-navigation'

export const createSubStackNavigator = (routeConfig, stackNavigatorConfig) => {
  const Stack = createStackNavigator(routeConfig, stackNavigatorConfig)
  class StackWrapper extends PureComponent {
    static navigationOptions = { header: null }
    render () {
      return <Stack screenProps={{ parent: this.props }} />
    }
  }
  return StackWrapper
}
