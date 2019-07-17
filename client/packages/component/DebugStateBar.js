import React, { PureComponent } from 'react'
import { colors } from '@berty/common/constants'
import Flex from './Flex'
import Text from './Text'
import { View, Platform } from 'react-native'
import Icon from './Icon'
import NavigationService from '@berty/common/helpers/NavigationService'
import promiseWithTimeout from '@berty/common/helpers/promiseWithTimeout'

const daemonStateValues = {
  down: 0,
  connecting: 1,
  connected: 2,
}

class DebugStateBar extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      watchTime: 10000,
      listenAddrs: [],
      listenInterfaceAddrs: [],
      timeouted: false,
      requestTimeout: 5000,
      listenAddrTimer: null,
      InterfaceAddrTimer: null,
      bertyColor: colors.lightGrey,
      bleColor: colors.lightGrey,
      bgBertyColor: colors.inputGrey,
      bgBleColor: colors.inputGrey,
      bleText: 'off',
      bleState: false,
      bertyText: 'no daemon',

      daemonState: daemonStateValues.down,
      peers: [],
      compact: true,
      collapsed: true,
    }
  }

  monitorPeers = null

  async componentDidMount() {
    this.fetchListenAddrs()
    this.fetchListenInterfaceAddrs()

    this.fetchPeers()

    this.monitorPeers = await this.props.context.node.service.monitorPeers()
    this.monitorPeers.on('data', this.addPeer)
  }

  componentWillUnmount() {
    const { listenAddrTimer, InterfaceAddrTimer } = this.state

    if (listenAddrTimer !== null) {
      clearTimeout(listenAddrTimer)
    }

    if (InterfaceAddrTimer !== null) {
      clearTimeout(InterfaceAddrTimer)
    }

    this.monitorPeers.destroy()
  }

  timeoutPromise = () => {
    return new Promise((resolve, reject) => {
      this.setState({ timeouted: true }, this.setColor)
      reject(new Error('Request timed out'))
    })
  }

  addPeer = peer => {
    this.setState(prevState => ({
      peers: [...prevState.peers.filter(p => p.id !== peer.id), peer],
    }))
  }

  fetchPeers = () => {
    this.props.context.node.service
      .peers()
      .then(data => this.setState({ peers: data.list }))
  }

  fetchListenAddrs = async () => {
    const { context } = this.props
    const { watchTime, requestTimeout, timeouted } = this.state
    try {
      const e = await promiseWithTimeout(
        context.node.service.getListenAddrs(),
        requestTimeout,
        this.timeoutPromise
      )
      const timer = setTimeout(this.fetchListenAddrs, watchTime)
      // if we previously timeouted we need to refetch peers
      if (timeouted === true) {
        this.fetchPeers()
      }
      this.setState(
        {
          listenAddrs: e.addrs,
          timeouted: false,
          listenAddrTimer: timer,
        },
        this.setColor
      )
    } catch (err) {
      const timer = setTimeout(this.fetchListenAddrs, watchTime)
      this.setState({
        listenAddrTimer: timer,
        timeouted: true,
        listenAddrs: [],
      })
      // console.warn('err listen address', err)
    }
  }

  fetchListenInterfaceAddrs = async () => {
    const { context } = this.props
    const { watchTime, requestTimeout, timeouted } = this.state
    try {
      const e = await promiseWithTimeout(
        context.node.service.getListenInterfaceAddrs(),
        requestTimeout,
        this.timeoutPromise
      )
      const timer = setTimeout(this.fetchListenInterfaceAddrs, watchTime)
      // if we previously timeouted we need to refetch peers
      if (timeouted === true) {
        this.fetchPeers()
      }
      this.setState(
        {
          listenInterfaceAddrs: e.addrs,
          timeouted: false,
          InterfaceAddrTimer: timer,
        },
        this.setColor
      )
    } catch (err) {
      const timer = setTimeout(this.fetchListenInterfaceAddrs, watchTime)
      this.setState(
        {
          InterfaceAddrTimer: timer,
          timeouted: true,
          listenInterfaceAddrs: [],
        },
        this.setColor
      )
      // console.warn('err Listen address', err)
    }
  }

  setColor = () => {
    const { listenAddrs, listenInterfaceAddrs, timeouted } = this.state
    let bertyColor = colors.orange
    let bgBertyColor = colors.orange25
    let bertyText = 'connecting'
    let daemonState = daemonStateValues.connecting
    let bleColor = colors.lightGrey
    let bgBleColor = colors.inputGrey
    let bleText = 'off'
    let bleState = false

    if (listenAddrs.length > 0 && listenInterfaceAddrs.length > 0) {
      listenAddrs.forEach((v, i, arr) => {
        try {
          const splited = v.split('/')
          if (splited[1] === 'ip4' && splited[2] !== '127.0.0.1') {
            bertyColor = colors.green
            bgBertyColor = colors.green25
            bertyText = 'connected'
            daemonState = daemonStateValues.connected
          }
          if (
            splited[1] === 'ble'
            // && splited[2] !== '00000000-0000-0000-0000-000000000000'
          ) {
            bleColor = colors.green
            bgBleColor = colors.green25
            bleText = 'on'
            bleState = true
          }
        } catch (e) {
          // Silence error since /p2p-circuit isn't valid
          // console.log(e)
        }
      })
    }

    if (timeouted) {
      bertyColor = colors.pink
      bgBertyColor = colors.pink25
      bertyText = 'no daemon'
      daemonState = daemonStateValues.down
    }
    this.setState({
      bertyColor,
      bgBertyColor,
      bertyText,
      bleText,
      bleState,
      bleColor,
      bgBleColor,
      daemonState,
    })
  }

  getPeersColor = peers => {
    if (peers.length > 0) {
      return {
        bgPeerColor: colors.blue25,
        peerColor: colors.blue,
      }
    }
    return {
      bgPeerColor: colors.inputGrey,
      peerColor: colors.lightGrey,
    }
  }

  render() {
    const {
      bertyColor,
      bleColor,
      bleText,
      bertyText,
      peers,
      bgBertyColor,
      bgBleColor,
    } = this.state
    const { bgPeerColor, peerColor } = this.getPeersColor(peers)
    const count = peers.reduce(
      (acc, cur) => (cur.connection === 1 ? acc + 1 : acc),
      0
    )

    return (
      <Flex.Cols
        size={1}
        style={[{ backgroundColor: '#EAF0FCee', padding: 8, borderRadius: 8 }]}
      >
        {!this.state.collapsed && (
          <View style={{ marginRight: 2 }}>
            <Text
              icon="berty-berty_picto"
              size={5}
              padding={5}
              rounded
              small
              background={bgBertyColor}
              color={bertyColor}
            >
              {this.state.compact ? (
                <Icon
                  name={
                    this.state.daemonState === daemonStateValues.connected
                      ? 'check'
                      : this.state.daemonState === daemonStateValues.down
                      ? 'x-circle'
                      : 'more-horizontal'
                  }
                  color={bertyColor}
                />
              ) : (
                bertyText.toLocaleUpperCase()
              )}
            </Text>
          </View>
        )}
        {!this.state.collapsed && (
          <View style={{ marginRight: 2 }}>
            <Text
              icon="berty-chart-network-solid"
              size={5}
              padding={5}
              rounded
              small
              background={bgPeerColor}
              color={peerColor}
              onPress={() => NavigationService.navigate('network/peers')}
            >
              {count.toString()}
            </Text>
          </View>
        )}
        {!this.state.collapsed && (
          <View style={{ marginRight: 2 }}>
            <Text
              icon="bluetooth"
              size={5}
              padding={5}
              rounded
              small
              background={bgBleColor}
              color={bleColor}
              onPress={() => NavigationService.navigate('network/config')}
            >
              {bleText.toLocaleUpperCase()}
            </Text>
          </View>
        )}
        {!this.state.collapsed && (
          <View style={{ marginRight: 2 }}>
            <Text
              icon="settings"
              size={5}
              padding={5}
              rounded
              small
              background={colors.darkGrey}
              color={colors.inputGrey}
              onPress={() => NavigationService.navigate('devtools/list')}
            />
          </View>
        )}
        <View style={{ marginRight: 2 }}>
          <Text
            icon={this.state.collapsed ? 'chevrons-left' : 'chevrons-right'}
            size={5}
            padding={5}
            rounded
            small
            background={this.state.collapsed ? bgBertyColor : colors.inputGrey}
            color={this.state.collapsed ? bertyColor : colors.darkGrey}
            onPress={() => this.setState({ collapsed: !this.state.collapsed })}
          />
        </View>
        {Platform.OS !== 'android' && (
          <View style={{ marginRight: 2 }} {...this.props.panHandlers}>
            <Text icon={'menu'} large padding />
          </View>
        )}
      </Flex.Cols>
    )
  }
}

export default DebugStateBar
