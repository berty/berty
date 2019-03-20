import React from 'react'
import { Dimensions, View } from 'react-native'
import createTabNavigator from 'react-navigation-tabs/src/utils/createTabNavigator'
import { createSwitchNavigator, createBottomTabNavigator } from 'react-navigation'

import colors from '../../constants/colors'

class SplitterView extends React.PureComponent {
  constructor (props) {
    super(props)

    this.state = this.getDims()
  }

  getDims () {
    return Dimensions.get('window') || Dimensions.get('screen') || { height: 0, width: 0 }
  }

  componentDidMount () {
    if (this._screenSizeWatcher === undefined) {
      this._screenSizeWatcher = (...args) => this.screenSizeWatcher(...args)
    }
    Dimensions.addEventListener('change', this._screenSizeWatcher)
  }

  componentWillUnmount () {
    Dimensions.removeEventListener('change', this._screenSizeWatcher)
  }

  screenSizeWatcher () {
    this.setState(this.getDims())
  }

  render () {
    const { renderScene } = this.props
    const { navigation } = this.props
    const { state } = navigation

    const narrow = this.state.width <= 750
    const isPlaceholder = state.routes[1].routes[state.routes[1].index].routeName === 'placeholder'

    return <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{
        borderRightColor: colors.borderGrey,
        borderStyle: 'solid',
        borderRightWidth: narrow ? 0 : 1,
        width: narrow ? '100%' : 350,
        display: narrow && !isPlaceholder ? 'none' : 'flex',
      }}>
        {renderScene({ route: state.routes[0] })}
      </View>
      <View style={{ flex: 1, display: narrow && isPlaceholder ? 'none' : 'flex' }}>
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
