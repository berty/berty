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

const { CoreModule } = NativeModules

class Current extends PureComponent {
  state = {
    loading: true,
    context: null,
  }

  static router = Main.router

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

    this.props.screenProps.onRelayContextCreated(context)
  }

  async componentDidUpdate (nextProps) {
    if (nextProps.screenProps.deepLink !== this.props.screenProps.deepLink) {
      this.openDeepLink()
    }
  }

  openDeepLink = () => {
    const {
      screenProps: {
        deepLink,
        clearDeepLink,
      },
      navigation,
    } = this.props

    if (!deepLink) {
      return
    }

    navigation.dispatch(NavigationActions.navigate(deepLink))
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
          val = atob(val)
          val = val.match(/:(.*)$/)
          val = val[1]
        }
        fragment += fragment.length > 0 ? `,${key}=${val}` : `#${key}=${val}`
      }
      return fragment
    }, '')
    return route.routeName + fragment
  }

  render () {
    const { t, navigation } = this.props
    const { loading, context, availableUpdate } = this.state
    if (loading) {
      return <Loader message={t('setting-up')} />
    }
    return (
      <RelayContext.Provider value={context}>
        <Main
          navigation={navigation}
          screenProps={{
            ...this.props.screenProps,
            context,
            availableUpdate,
            firstLaunch: navigation.getParam('firstLaunch', false),
          }}
          onNavigationStateChange={(prevState, currentState) => {
            const currentRoute = this.getActiveRouteName(currentState)
            const prevRoute = this.getActiveRouteName(prevState)

            if (prevRoute !== currentRoute) {
              CoreModule.setCurrentRoute(currentRoute)
            }
          }}
        />
      </RelayContext.Provider>
    )
  }
}

export default withNamespaces()(Current)
