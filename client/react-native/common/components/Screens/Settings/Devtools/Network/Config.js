import React, { PureComponent } from 'react'
import { Switch, NativeModules } from 'react-native'
import { Menu, Header } from '../../../../Library'

export default class Network extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    return {
      header: (
        <Header
          navigation={navigation}
          title='Network configuration'
          titleIcon='sliders'
          rightBtnIcon={'save'}
          onPressRightBtn={
            navigation.state.params && navigation.state.params.updateConfig
          }
          backBtn
        />
      ),
    }
  }

  state = {
    loaded: false,
    default_trans: false,
    bluetooth_trans: false,
    default_bootstrap: false,
    ipfs_bootstrap: false,
    custom_bootstrap: [],
    mdns: false,
    relay: false,
  }

  currentConfig = undefined

  hasConfigChanged = () => {
    if (
      this.currentConfig !== undefined &&
      (this.state.default_trans !== this.currentConfig.DefaultTransport ||
        this.state.bluetooth_trans !== this.currentConfig.BluetoothTransport ||
        this.state.default_bootstrap !== this.currentConfig.DefaultBootstrap ||
        this.state.ipfs_bootstrap !== this.currentConfig.IPFSBootstrap ||
        this.state.custom_bootstrap !== this.currentConfig.CustomBootstrap ||
        this.state.mdns !== this.currentConfig.MDNS ||
        this.state.relay !== this.currentConfig.Relay)
    ) {
      this.props.navigation.setParams({
        updateConfig: this.updateConfig,
      })
    } else {
      this.props.navigation.setParams({
        updateConfig: undefined,
      })
    }
  }

  updateConfig = async () => {
    try {
      let config = {
        DefaultTransport: this.state.default_trans,
        BluetoothTransport: this.state.bluetooth_trans,
        DefaultBootstrap: this.state.default_bootstrap,
        IPFSBootstrap: this.state.ipfs_bootstrap,
        CustomBootstrap: this.state.custom_bootstrap,
        MDNS: this.state.mdns,
        Relay: this.state.relay,
      }
      let json = JSON.stringify(config)

      await NativeModules.CoreModule.updateNetworkConfig(json)

      this.currentConfig = config
      this.props.navigation.setParams({
        updateConfig: undefined,
      })
    } catch (err) {
      console.error(err)
    }
  }

  getCurrentConfig = async () => {
    let json = await NativeModules.CoreModule.getNetworkConfig()
    this.currentConfig = JSON.parse(json)

    this.setState({
      loaded: true,
      default_trans: this.currentConfig.DefaultTransport,
      bluetooth_trans: this.currentConfig.BluetoothTransport,
      default_bootstrap: this.currentConfig.DefaultBootstrap,
      ipfs_bootstrap: this.currentConfig.IPFSBootstrap,
      custom_bootstrap: this.currentConfig.CustomBootstrap,
      mdns: this.currentConfig.MDNS,
      relay: this.currentConfig.Relay,
    })
  }

  componentDidMount () {
    this.getCurrentConfig()
  }

  render () {
    return (
      <Menu>
        <Menu.Section title='Transports' customMarginTop={24}>
          <Menu.Item
            title='Default (TCP and Websocket)'
            customRight={
              <Switch
                justify='end'
                disabled={!this.state.loaded}
                value={this.state.default_trans}
                onValueChange={value => {
                  this.setState({ default_trans: value }, () => {
                    this.hasConfigChanged()
                  })
                }}
              />
            }
          />
          <Menu.Item
            title='Bluetooth (unstable if on/off multiple time #629/630)'
            customRight={
              <Switch
                justify='end'
                disabled={!this.state.loaded}
                value={this.state.bluetooth_trans}
                onValueChange={value => {
                  this.setState({ bluetooth_trans: value }, () => {
                    this.hasConfigChanged()
                  })
                }}
              />
            }
          />
        </Menu.Section>
        <Menu.Section title='Bootstrap'>
          <Menu.Item
            title='Default bootstrap'
            customRight={
              <Switch
                justify='end'
                disabled={!this.state.loaded}
                value={this.state.default_bootstrap}
                onValueChange={value => {
                  this.setState({ default_bootstrap: value }, () => {
                    this.hasConfigChanged()
                  })
                }}
              />
            }
          />
          <Menu.Item
            title='IPFS bootstrap'
            customRight={
              <Switch
                justify='end'
                disabled={!this.state.loaded}
                value={this.state.ipfs_bootstrap}
                onValueChange={value => {
                  this.setState({ ipfs_bootstrap: value }, () => {
                    this.hasConfigChanged()
                  })
                }}
              />
            }
          />
          <Menu.Item
            title='Custom bootstrap (not implem.)'
            onPress={() => this.hasConfigChanged()}
          />
        </Menu.Section>
        <Menu.Section title='Miscellaneous'>
          <Menu.Item
            title='Multicast DNS'
            customRight={
              <Switch
                justify='end'
                disabled={!this.state.loaded}
                value={this.state.mdns}
                onValueChange={value => {
                  this.setState({ mdns: value }, () => {
                    this.hasConfigChanged()
                  })
                }}
              />
            }
          />
          <Menu.Item
            title='Berty relay'
            customRight={
              <Switch
                justify='end'
                disabled={!this.state.loaded}
                value={this.state.relay}
                onValueChange={value => {
                  this.setState({ relay: value }, () => {
                    this.hasConfigChanged()
                  })
                }}
              />
            }
          />
        </Menu.Section>
      </Menu>
    )
  }
}
