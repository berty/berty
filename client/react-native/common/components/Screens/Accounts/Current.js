import { NavigationActions } from 'react-navigation'
import { Platform, NativeModules } from 'react-native'
import sleep from '../../../helpers/sleep'
import React, { PureComponent } from 'react'
import { getAvailableUpdate } from '../../../helpers/update'
import { withNamespaces } from 'react-i18next'

import { atob } from 'b64-lite'
import { Loader } from '../../Library'
import { environment, RelayContext, contextValue } from '../../../relay'
import {
  queries,
  mutations,
  subscriptions,
  fragments,
  updaters,
} from '../../../graphql'
import Main from '../Main'
import NavigationService from '../../../helpers/NavigationService'

const { CoreModule } = NativeModules

class Current extends PureComponent {
  state = {
    loading: true,
    context: null,
  }

  getIp = async () => {
    if (Platform.OS === 'web') {
      return window.location.hostname
    }
    return '127.0.0.1'
  }

  getPort = async () => {
    try {
      const port = await CoreModule.getPort()
      console.log('get port', port)
      return port
    } catch (error) {
      console.warn(error, 'retrying to get port')
      await sleep(1000)
      return this.getPort()
    }
  }

  async componentDidMount () {
    const context = await this.getRelayContext()
    const availableUpdate = await getAvailableUpdate(context)
    this.setState(
      {
        context,
        availableUpdate,
        loading: false,
      },
      () => {
        this.openDeepLink()
      }
    )
  }

  async componentDidUpdate (nextProps) {
    if (nextProps.screenProps.deepLink !== this.props.screenProps.deepLink) {
      this.openDeepLink()
    }
  }

  openDeepLink = () => {
    const {
      screenProps: { deepLink, clearDeepLink },
    } = this.props

    if (!deepLink) {
      return
    }

    this.mainNav.dispatch(NavigationActions.navigate(deepLink))
    clearDeepLink()
  }

  getRelayContext = async () =>
    contextValue({
      environment: await environment.setup({
        getIp: this.getIp,
        getPort: this.getPort,
      }),
      mutations,
      subscriptions,
      queries,
      fragments,
      updaters,
    })

  getActiveRouteName = navigationState => {
    if (!navigationState) {
      return null
    }
    const route = navigationState.routes[navigationState.index]
    // dive into nested navigators
    if (route.routes) {
      return this.getActiveRouteName(route)
    }

    console.log(route)
    // get fragment from react-navigation params
    const fragment = Object.keys(route.params || {}).reduce((fragment, key) => {
      const paramType = typeof route.params[key]
      if (
        paramType === 'string' ||
        paramType === 'number' ||
        paramType === 'boolean'
      ) {
        let val = route.params[key]
        if (key === 'id') {
          val = atob(val).match(/:(.*)$/)[1]
          console.log(val)
        }
        fragment += fragment.length > 0 ? `,${key}=${val}` : `#${key}=${val}`
      }
      return fragment
    }, '')
    return route.routeName + fragment
  }

  render () {
    const { t } = this.props
    const { loading, context, availableUpdate } = this.state
    if (loading) {
      return <Loader message={t('setting-up')} />
    }
    return (
      <RelayContext.Provider value={context}>
        <Main
          ref={nav => {
            this.mainNav = nav
            NavigationService.setTopLevelNavigator(nav)
          }}
          screenProps={{
            ...this.props.screenProps,
            context,
            availableUpdate,
            firstLaunch: this.props.navigation.getParam('firstLaunch', false),
          }}
          onNavigationStateChange={(prevState, currentState) => {
            const currentRoute = this.getActiveRouteName(currentState)
            const prevRoute = this.getActiveRouteName(prevState)

            if (prevRoute !== currentRoute) {
              console.log(currentRoute)
              CoreModule.setCurrentRoute(currentRoute)
            }
          }}
        />
      </RelayContext.Provider>
    )
  }
}

export default withNamespaces()(Current)
