import { Switch } from 'react-native'
import React, { PureComponent } from 'react'
import { withBridgeContext } from '@berty/bridge/Context'

import { Header, Loader, Menu } from '@berty/component'

class Network extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    const updating =
      (navigation.state.params && navigation.state.params.updating) || false
    return {
      header: (
        <Header
          navigation={navigation}
          title="Network configuration"
          titleIcon="sliders"
          rightBtnIcon={updating ? 'refresh-ccw' : 'save'}
          onPressRightBtn={() =>
            navigation.state.params && navigation.state.params.onSave()
          }
          backBtn={!updating}
        />
      ),
    }
  }

  state = null

  async componentDidMount() {
    const { bridge } = this.props

    const config = await bridge.daemon.getNetworkConfig({})
    console.warn(config.json)
    this.setState(JSON.parse(config.json))
    this.props.navigation.setParams({
      onSave: this.saveConfig.bind(this),
    })
  }

  updateConfig = config => {
    this.setState(config)
  }

  saveConfig = async config => {
    const { bridge } = this.props

    this.props.navigation.setParams({ updating: true })
    try {
      await bridge.daemon.updateNetworkConfig({
        json: JSON.stringify(this.state),
      })
    } catch (err) {
      console.error(err)
    }
    this.props.navigation.setParams({ updating: false })
  }

  render() {
    if (this.state == null) {
      return <Loader message="Loading network configuration ..." />
    }
    return (
      <Menu>
        <Menu.Section title="Discovery">
          <Menu.Item
            title="Multicast DNS"
            customRight={
              <Switch
                justify="end"
                value={this.state.MDNS}
                onValueChange={MDNS => this.updateConfig({ MDNS })}
              />
            }
          />
        </Menu.Section>
        <Menu.Section title="Transports" customMarginTop={24}>
          <Menu.Item
            title="TCP"
            customRight={
              <Switch
                justify="end"
                value={this.state.TCP}
                onValueChange={TCP => this.updateConfig({ TCP })}
              />
            }
          />
          <Menu.Item
            title="QUIC"
            customRight={
              <Switch
                justify="end"
                value={this.state.QUIC}
                onValueChange={QUIC => this.updateConfig({ QUIC })}
              />
            }
          />
          <Menu.Item
            title="Bluetooth"
            customRight={
              <Switch
                justify="end"
                value={this.state.BLE}
                onValueChange={BLE => this.updateConfig({ BLE })}
              />
            }
          />
          <Menu.Item
            title="Websocket"
            customRight={
              <Switch
                justify="end"
                value={this.state.WS}
                onValueChange={WS => this.updateConfig({ WS })}
              />
            }
          />
        </Menu.Section>
        <Menu.Section title="Connections">
          <Menu.Item
            title="Peer cache"
            customRight={
              <Switch
                justify="end"
                value={this.state.PeerCache}
                onValueChange={PeerCache => this.updateConfig({ PeerCache })}
              />
            }
          />
        </Menu.Section>
        <Menu.Section title="Bootstrap">
          <Menu.Item
            title="Default bootstrap"
            customRight={
              <Switch
                justify="end"
                value={this.state.DefaultBootstrap}
                onValueChange={DefaultBootstrap =>
                  this.updateConfig({ DefaultBootstrap })
                }
              />
            }
          />
          <Menu.Item
            title="IPFS bootstrap (not implem.)"
            customRight={<Switch justify="end" disaBLEd value={false} />}
          />
          <Menu.Item
            title="Custom bootstrap (not implem.)"
            onPress={() => {}}
          />
        </Menu.Section>
        <Menu.Section title="Relay">
          <Menu.Item
            title="Relay HOP"
            customRight={<Switch justify="end" value={this.state.HOP} />}
          />
          <Menu.Item
            title="DHT Bucket"
            customRight={
              <Switch
                justify="end"
                value={this.state.DHT}
                onValueChange={DHT => this.updateConfig({ DHT })}
              />
            }
          />
        </Menu.Section>
      </Menu>
    )
  }
}

export default withBridgeContext(Network)
