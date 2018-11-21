import { NavigationActions } from 'react-navigation'
import { Platform, NativeModules } from 'react-native'
import { sleep } from 'sleep'
import React, { PureComponent } from 'react'

import { Loader } from '../../Library'
import { environment, RelayContext, contextValue } from '../../../relay'
import { mutations } from '../../../graphql'
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
      sleep(1)
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
          environment: environment.setup({
            ip: await this.getIp(),
            port: await this.getPort(),
          }),
          mutations,
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
