import { NavigationActions } from 'react-navigation'
import { Platform, NativeModules } from 'react-native'
import sleep from '../../../helpers/sleep'
import React, { PureComponent } from 'react'
import { getAvailableUpdate } from '../../../helpers/update'

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

export default class Current extends PureComponent {
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
      screenProps: { deepLink },
    } = this.props
    this.mainNav.dispatch(NavigationActions.navigate(deepLink))
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

  render () {
    const { loading, context, availableUpdate } = this.state
    if (loading) {
      return <Loader message='Setting up berty :)' />
    }
    return (
      <RelayContext.Provider value={context}>
        <Main
          ref={nav => (this.mainNav = nav)}
          screenProps={{
            ...this.props.screenProps,
            context,
            availableUpdate,
          }}
        />
      </RelayContext.Provider>
    )
  }
}
