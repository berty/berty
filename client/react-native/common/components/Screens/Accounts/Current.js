import { NavigationActions } from 'react-navigation'
import { Platform, NativeModules } from 'react-native'
import sleep from '../../../helpers/sleep'
import React, { PureComponent } from 'react'

import { Loader } from '../../Library'
import { environment, RelayContext, contextValue } from '../../../relay'
import { queries, mutations, subscriptions, updaters } from '../../../graphql'
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
      return CoreModule.getPort()
    } catch (error) {
      console.warn(error, 'retrying to get port')
      await sleep(1000)
      return this.getPort()
    }
  }

  componentDidMount () {
    this.setRelayContext()
  }

  setRelayContext = async () => {
    const {
      screenProps: { deepLink },
    } = this.props
    this.setState(
      {
        context: contextValue({
          environment: await environment.setup({
            getIp: this.getIp,
            getPort: this.getPort,
          }),
          mutations,
          subscriptions,
          queries,
          updaters,
        }),
        loading: false,
      },
      () => {
        this.mainNav.dispatch(NavigationActions.navigate(deepLink))
      }
    )
  }

  render () {
    const { loading, context } = this.state
    if (loading) {
      return <Loader message='Setting up berty :)' />
    }
    return (
      <RelayContext.Provider value={context}>
        <Main
          ref={nav => (this.mainNav = nav)}
          screenProps={{ ...this.props.screenProps, context }}
        />
      </RelayContext.Provider>
    )
  }
}
