import { Switch } from 'react-native'
import React, { PureComponent } from 'react'
import { withBridgeContext } from '@berty/bridge/Context'

import { Header, Loader, Menu } from '@berty/component'

const transports = {
  TCP: '/ip4/0.0.0.0/tcp/0',
  BLE: '/ble/00000000-0000-0000-0000-000000000000',
  QUIC: '/ip4/0.0.0.0/udp/0/quic',
}

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
    console.warn(config)
    this.setState(config)
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
      await bridge.daemon.updateNetworkConfig(this.state)
    } catch (err) {
      console.error(err)
    }
    this.props.navigation.setParams({ updating: false })
  }

  isTransportEnable = (matchPatern) => {
    return this.state.bindP2P.reduce((acc, currentTransport) => {
      return acc || currentTransport.indexOf(matchPatern) >= 0
    })
  }

  removeTransport = (matchPatern) => {
    return this.state.bindP2P.filter((currentTransport) => {
      return currentTransport.indexOf(matchPatern) >= 0
    })
  }

  addTransport = (transport) => {
    return this.state.bindP2P.concat(transport)
  }

  render() {
    if (this.state == null) {
      return <Loader message="Loading network configuration ..." />
    }
    return (
      <Menu>
        <Menu.Section title="Global">
          <Menu.Item
            title="Mobile Mode"
            customRight={
              <Switch
                justify="end"
                value={this.state.mobile}
                onValueChange={peerCache => this.updateConfig({ mobile })}
              />
            }
          />
        </Menu.Section>

        <Menu.Section title="Discovery">
          <Menu.Item
            title="Multicast DNS"
            customRight={
              <Switch
                justify="end"
                value={this.state.Mdns}
                onValueChange={MDNS => this.updateConfig({ Mdns })}
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
                value={this.isTransportEnable('tcp')}
                onValueChange={enable => {
                  if (enable) {
                    const bindP2P = this.addTransport(transports.TCP)
                    this.updateConfig({ bindP2P })
                  } else {
                    const bindP2P = this.removeTransport('tcp')
                    this.updateConfig({ bindP2P })
                  }
                }}
              />
            }
          />
          <Menu.Item
            title="QUIC"
            customRight={
              <Switch
                justify="end"
                value={this.isTransportEnable('quic')}
                onValueChange={enable => {
                  if (enable) {
                    const bindP2P = this.addTransport(transports.TCP)
                    this.updateConfig({ bindP2P })
                  } else {
                    const bindP2P = this.removeTransport('quic')
                    this.updateConfig({ bindP2P })
                  }
                }}
              />
            }
          />
          <Menu.Item
            title="Bluetooth"
            customRight={
              <Switch
                justify="end"
                value={this.isTransportEnable('ble')}
                onValueChange={enable => {
                  if (enable) {
                    const bindP2P = this.addTransport(transports.TCP)
                    this.updateConfig({ bindP2P })
                  } else {
                    const bindP2P = this.removeTransport('ble')
                    this.updateConfig({ bindP2P })
                  }
                }}
              />
            }
          />
          {/* <Menu.Item */}
          {/*   title="Websocket" */}
          {/*   customRight={ */}
          {/*     <Switch */}
          {/*       justify="end" */}
          {/*       value={this.state.WS} */}
          {/*       onValueChange={WS => this.updateConfig({ WS })} */}
          {/*     /> */}
          {/*   } */}
          {/* /> */}
        </Menu.Section>

        <Menu.Section title="Connections">
          <Menu.Item
            title="Peer cache"
            customRight={
              <Switch
                justify="end"
                value={this.state.peerCache}
                onValueChange={peerCache => this.updateConfig({ peerCache })}
              />
            }
          />
        </Menu.Section>

        <Menu.Section title="Bootstrap">
          {/* <Menu.Item */}
          {/*   title="Default bootstrap" */}
          {/*   customRight={ */}
          {/*     <Switch */}
          {/*       justify="end" */}
          {/*       value={this.state.bootstrap} */}
          {/*       onValueChange={bootstrap => */}
          {/*         this.updateConfig({ bootstrap }) */}
          {/*       } */}
          {/*     /> */}
          {/*   } */}
          {/* /> */}
          <Menu.Item
            title="IPFS bootstrap (not implem.)"
            customRight={<Switch justify="end" disaBLEd value={false} />}
          />
          <Menu.Item
            title="Custom bootstrap (not implem.)"
            onPress={() => {}}
          />
        </Menu.Section>

        {/* <Menu.Section title="Relay"> */}
        {/*   <Menu.Item */}
        {/*     title="Relay HOP" */}
        {/*     customRight={<Switch justify="end" value={this.state.HOP} />} */}
        {/*   /> */}
        {/*   <Menu.Item */}
        {/*     title="DHT Bucket" */}
        {/*     customRight={ */}
        {/*       <Switch */}
        {/*         justify="end" */}
        {/*         value={this.state.DHT} */}
        {/*         onValueChange={DHT => this.updateConfig({ DHT })} */}
        {/*       /> */}
        {/*     } */}
        {/*   /> */}
        {/* </Menu.Section> */}
      </Menu>
    )
  }
}

export default withBridgeContext(Network)
