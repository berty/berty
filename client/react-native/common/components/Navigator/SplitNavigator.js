import React from 'react'
import { View } from 'react-native'
import createTabNavigator from 'react-navigation-tabs/src/utils/createTabNavigator'
import { createSwitchNavigator, createBottomTabNavigator } from 'react-navigation'

class SplitterView extends React.PureComponent {
  render () {
    const { renderScene } = this.props
    const { navigation } = this.props
    const { state } = navigation

    return <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ width: 400 }}>
        {renderScene({ route: state.routes[0] })}
      </View>
      <View style={{ flex: 1 }}>
        {renderScene({ route: state.routes[1] })}
      </View>
    </View>
  }
}

const SplitNavigator = createTabNavigator(SplitterView)

export const createSplitNavigator = (routeConfigs, sideRouteConfigs, config = {}, sideConfig = {}) => {
  const navigator = SplitNavigator({
    'side': createBottomTabNavigator(sideRouteConfigs, sideConfig),
    'content': createSwitchNavigator(routeConfigs, {
      ...config,
      // headerMode: 'none',
    }),
  }, {
    lazy: false,
    backBehavior: 'none',
  })

  navigator.router.isSplitNavigator = true

  return navigator
}
