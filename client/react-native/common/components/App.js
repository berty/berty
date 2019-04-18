import { I18nextProvider } from 'react-i18next'
import { Platform, View } from 'react-native'
import { SafeAreaView } from 'react-navigation'
import Config from 'react-native-config'
import FlashMessage from 'react-native-flash-message'
import KeyboardSpacer from 'react-native-keyboard-spacer'
import React, { PureComponent } from 'react'
import ReactNativeLanguages from 'react-native-languages'

import { MovableView, DebugStateBar } from './Library'
import { RelayContext } from '../relay'
import { UpdateContext } from '../update'
import Instabug from '../helpers/Instabug'
import * as KeyboardContext from '../helpers/KeyboardContext'
import Mousetrap from '../helpers/Mousetrap'
import NavigationService from './../helpers/NavigationService'
import Navigator from './Navigator'
import i18n from '../i18n'
import BridgeContext, { rpc, service, middleware } from '../bridge'

const bridgeMiddlewares = middleware.chain(
  __DEV__ ? middleware.logger.create('DAEMON') : null, // eslint-disable-line
)

export default class App extends PureComponent {
  state = {
    loading: true,
    showAnim:
      process.env['ENVIRONMENT'] !== 'integration_test' &&
      Platform.OS !== 'web',
    relayContext: null,
    availableUpdate: null,
    bridge: service.create(service.Daemon, rpc.defaultPlatform, bridgeMiddlewares),
  }

  constructor (props) {
    super(props)

    if (Platform.OS !== 'web') {
      Instabug.setWelcomeMessageMode(Instabug.welcomeMessageMode.disabled)
      if (Platform.OS === 'ios') {
        Instabug.startWithToken(Config.INSTABUG_TOKEN, [
          // eslint-disable-next-line
          __DEV__
            ? Instabug.invocationEvent.none
            : Instabug.invocationEvent.shake,
        ])
      }
      // eslint-disable-next-line
      if (__DEV__) {
        const DevMenu = require('react-native-dev-menu')
        DevMenu.addItem('Show Instabug', () => Instabug.BugReporting.invoke())
      }
    }
  }

  componentDidMount () {
    ReactNativeLanguages.addEventListener('change', this._onLanguageChange)

    if (Platform.OS === 'web') {
      if (this._showQuickSwitch === undefined) {
        this._showQuickSwitch = () => this.showQuickSwitch()
      }

      Mousetrap.prototype.stopCallback = () => {}
      Mousetrap.bind(
        ['command+k', 'ctrl+k', 'command+t', 'ctrl+t'],
        this._showQuickSwitch
      )
    }

    this.setState({ loading: false })
  }

  componentWillUnmount () {
    ReactNativeLanguages.removeEventListener('change', this._onLanguageChange)

    if (Platform.OS === 'web') {
      Mousetrap.unbind(['command+k', 'ctrl+k'], this._showQuickSwitch)
    }
  }

  showQuickSwitch () {
    NavigationService.navigate('modal/chats/switcher')
    return false
  }

  _onLanguageChange = ({ language } = {}) => {
    language != null && i18n.changeLanguage(language)
  }

  setStateContext = (i, f) => {
    this.setState(i, () => {
      if (i.relayContext !== null && i.loading === false) {
        this.setState({
          debugBar: <DebugStateBar />,
        })
      }
      f()
    })
  }

  setStateUpdate = update => {
    this.setState({ availableUpdate: update })
  }

  setStateBridge = bridge => {
    this.setState({ bridge })
  }

  render () {
    const { relayContext, availableUpdate, bridge } = this.state
    return (
      <BridgeContext.Provider value={bridge}>
        <KeyboardContext.Provider>
          <I18nextProvider i18n={i18n}>
            <SafeAreaView style={{ flex: 1 }} forceInset={{ bottom: 'never' }}>
              <RelayContext.Provider
                value={{ ...relayContext, setState: this.setStateContext }}
              >
                <UpdateContext.Provider
                  value={{ availableUpdate, setState: this.setStateUpdate }}
                >
                  <BridgeContext.Consumer>
                    {() => <Navigator />}
                  </BridgeContext.Consumer>

                  <FlashMessage position='top' />
                  <View
                    style={{
                      zIndex: 1,
                      position: 'absolute',
                      top: 30,
                      right: 48,
                      padding: 5,
                    }}
                  >
                    <MovableView>{this.state.debugBar}</MovableView>
                  </View>
                </UpdateContext.Provider>
              </RelayContext.Provider>
              {Platform.OS === 'ios' && <KeyboardSpacer />}
            </SafeAreaView>
          </I18nextProvider>
        </KeyboardContext.Provider>
      </BridgeContext.Provider>
    )
  }
}
