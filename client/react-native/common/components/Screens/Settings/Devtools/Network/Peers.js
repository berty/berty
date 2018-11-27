import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
} from 'react-native'
import Accordion from 'react-native-collapsible/Accordion'
import React, { Component } from 'react'

import { Header, SearchBar, Text as LibText } from '../../../../Library'
import { RelayContext } from '../../../../../relay'
import {
  bold,
  textLeft,
  padding,
  textCenter,
  largeText,
  mediumText,
  smallText,
} from '../../../../../styles'
import { colors } from '../../../../../constants'

const Connection = {
  NOT_CONNECTED: 0,
  CONNECTED: 1,
  CAN_CONNECT: 2,
  CANNOT_CONNECT: 3,
}

const ConnectionType = c => {
  switch (c) {
    case Connection.NOT_CONNECTED:
      return 'NotConnected'
    case Connection.CONNECTED:
      return 'Connected'
    case Connection.CAN_CONNECT:
      return 'CanConnect'
    case Connection.CANNOT_CONNECT:
      return 'CannotConnect'
    default:
      return 'Unknow'
  }
}

export default class Peers extends Component {
  static contextType = RelayContext

  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Peers List'
        titleIcon='list'
        searchBar={
          <SearchBar onChangeText={navigation.getParam('peerFilter')}>
            <LibText size={0} height={34} padding middle large />
          </SearchBar>
        }
        backBtn
      />
    ),
  })

  peerFilter = filter => this.setState({ filter })

  state = {
    peers: [],
    opened: [],
    filter: '',
    watchdog: false,
  }

  componentWillMount () {
    this.subscriber = this.context.subscriptions.monitorPeers.subscribe({
      iterator: undefined,
      updater: (store, data) => {
        const peer = data.MonitorPeers
        this.addPeer(peer)
      },
    })
  }

  componentDidMount () {
    this.props.navigation.setParams({
      peerFilter: this.peerFilter,
    })

    this.fetchPeers()
  }

  componentWillUnmount () {
    this.subscriber.unsubscribe()
  }

  fetchPeers = () => {
    this.context.queries.Peers.fetch().then(data =>
      this.updatePeers(data.Peers.list)
    )
  }

  updatePeers = peers => {
    this.setState({ peers })
  }

  addPeer = peer => {
    this.setState(prevState => ({
      peers: [...prevState.peers.filter(p => p.id !== peer.id), peer],
    }))
  }

  renderPeer = peer => {
    return (
      <View style={styles.peer}>
        {peer.connection === Connection.CONNECTED ? (
          <Text style={styles.connected}>
            {peer.id.slice(0, 30)}
            ...
          </Text>
        ) : (
          <Text style={styles.notConnected}>
            {peer.id.slice(0, 30)}
            ...
          </Text>
        )}
      </View>
    )
  }

  renderPeerInfo = (peer, index) => {
    if (this.state.opened.indexOf(index) > -1) {
      return (
        <View>
          <TouchableOpacity style={styles.peerInfos}>
            <Text style={styles.peerInfoField}>Connection</Text>
            <Text style={styles.peerInfoValue}>
              {ConnectionType(peer.connection)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.peerInfos}>
            <Text style={styles.peerInfoField}>addrs:</Text>
            {peer.addrs.map((addr, i) => (
              <Text style={styles.peerInfoValue} key={i}>{`${addr.slice(
                0,
                30
              )}${addr.length > 30 ? '...' : ''}`}</Text>
            ))}
          </TouchableOpacity>
        </View>
      )
    }

    return false
  }

  updateOpened = opened => {
    this.setState({ opened })
  }

  filteredPeers = () => {
    const { peers } = this.state

    if (this.state.filter.length === 0) {
      return peers.filter(peer => peer.connection === Connection.CONNECTED)
    }

    const matchAddr = peer =>
      peer.addrs.reduce(
        (acc, addr) => addr.indexOf(this.state.filter) > -1 || acc,
        false
      )
    const matchID = peer => peer.id.indexOf(this.state.filter) > -1

    return peers.filter(peer => matchID(peer) || matchAddr(peer))
  }

  render () {
    const filteredPeers = this.filteredPeers()
    const isFiltered = !!this.state.filter.length

    return (
      <ScrollView style={{ backgroundColor: colors.background }}>
        <View style={styles.peer}>
          <Text style={styles.title}>
            {!isFiltered
              ? `Connected Peers: ${filteredPeers.length}/${
                this.state.peers.length
              }`
              : `Matched Peers: ${filteredPeers.length}/${
                this.state.peers.length
              }`}
          </Text>
        </View>
        <Accordion
          sections={filteredPeers.slice(0, 100)}
          activeSections={this.state.opened}
          renderHeader={this.renderPeer}
          renderContent={this.renderPeerInfo}
          onChange={this.updateOpened}
        />
        {filteredPeers.length > 100 && (
          <View style={styles.peer}>
            <Text>...</Text>
          </View>
        )}
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  title: {
    ...textCenter,
    ...largeText,
  },
  peer: {
    ...padding,
    backgroundColor: colors.white,
    borderBottomColor: '#bbb',
    borderBottomWidth: 1,
  },
  peerInfos: {
    ...textLeft,
    ...padding,
    backgroundColor: colors.grey8,
    borderBottomColor: '#bbb',
    borderBottomWidth: 1,
  },
  peerInfoField: {
    ...textLeft,
    ...smallText,
    ...bold,
  },
  peerInfoValue: {
    ...textLeft,
    ...smallText,
  },
  connected: {
    ...mediumText,
    ...textLeft,
    color: colors.green,
  },
  notConnected: {
    ...mediumText,
    ...textLeft,
    color: colors.red,
  },
})
