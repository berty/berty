import NavigationService from '@berty/common/helpers/NavigationService'
import React, { PureComponent } from 'react'

import { Platform } from 'react-native'
import { atob } from 'b64-lite'

import AppNavigator from './AppNavigator'
import { NavigatorContext } from './NavigatorContext'
import { StoreContext } from '@berty/store/context'
import App from '@berty/screen/App'

const getActiveRoute = navigationState => {
  if (!navigationState) {
    return null
  }
  const route = navigationState.routes[navigationState.index]
  // dive into nested navigators
  if (route.routes) {
    return getActiveRoute(route)
  }
  return route
}

const getURIFromRoute = route => {
  // get uri fragment from react-navigation params
  const fragment = Object.keys(route.params || {}).reduce((fragment, key) => {
    const paramType = typeof route.params[key]
    if (
      paramType === 'string' ||
      paramType === 'number' ||
      paramType === 'boolean'
    ) {
      let val = route.params[key]
      try {
        if (key === 'id') {
          val = atob(val)
          val = val.match(/:(.*)$/)
          val = val[1]
        }
      } catch (err) {
        val = route.params[key]
      }
      fragment += fragment.length > 0 ? `,${key}=${val}` : `#${key}=${val}`
    }
    return fragment
  }, '')
  return route.routeName + fragment
}

class RootNavigator extends PureComponent {
  static router = AppNavigator.router

  state = {}

  render () {
    const { navigation } = this.props

    return (
      <NavigatorContext.Provider value={this.state}>
        <App>
          <StoreContext.Consumer>
            {store => (
              <AppNavigator
                {...this.props}
                ref={() => {
                  if (Platform.OS !== 'web') {
                    this.navigation = navigation
                    NavigationService.setTopLevelNavigator(navigation)
                  }
                }}
                onNavigationStateChange={(prevState, currentState) => {
                  const currentRoute = getActiveRoute(currentState)
                  const prevRoute = getActiveRoute(prevState)
                  if (prevRoute !== currentRoute) {
                    store.daemon.setCurrentRoute({
                      route: getURIFromRoute(currentRoute),
                    })
                    this.setState(currentRoute)
                  }
                }}
              />
            )}
          </StoreContext.Consumer>
        </App>
      </NavigatorContext.Provider>
    )
  }
}

export default RootNavigator
