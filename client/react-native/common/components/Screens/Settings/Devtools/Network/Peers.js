import React, { PureComponent } from 'react'
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native'
import { Header } from '../../../../Library'
import { queries, subscriptions } from '../../../../../graphql'
import { colors } from '../../../../../constants'
import {
  bold,
  textLeft,
  padding,
  textCenter,
  largeText,
  mediumText,
  smallText,
} from '../../../../../styles'
import Accordion from 'react-native-collapsible/Accordion'

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

export default class Peers extends PureComponent {
  static navigationOptions = ({ navigation }) => ({
    header: (
      <Header
        navigation={navigation}
        title='Peers List'
        titleIcon='list'
        backBtn
      />
    ),
  })

  state = {
    peers: [],
    opened: [],
  }

  componentWillMount () {
    subscriptions.monitorPeers.subscribe({
      iterator: undefined,
      updater: (store, data) => {
        const peer = data.MonitorPeers
        this.addPeer(peer)
      },
    })
  }

  componentDidMount () {
    queries.Peers.fetch().then(data => this.updatePeers(data.Peers.list))
    subscriptions.monitorPeers.start()
  }

  updatePeers = peers => {
    this.setState({ peers })
  }

  addPeer = peer => {
    this.setState(prevState => ({
      peers: [peer, ...prevState.peers.filter(p => p.id !== peer.id)],
    }))
  }

  renderPeer = peer => {
    return (
      <View style={styles.peer}>
        {peer.connection === Connection.CONNECTED ? (
          <Text style={styles.connected}>{peer.id.slice(0, 30)}...</Text>
        ) : (
          <Text style={styles.notConnected}>{peer.id.slice(0, 30)}...</Text>
        )}
      </View>
    )
  }

  renderPeerInfo = peer => {
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
            <Text style={styles.peerInfoValue} key={i}>{`${addr.slice(0, 30)}${
              addr.length > 30 ? '...' : ''
            }`}</Text>
          ))}
        </TouchableOpacity>
      </View>
    )
  }

  updateOpened = opened => {
    this.setState({ opened })
  }

  render () {
    console.log(this.state.peers)
    return (
      <ScrollView style={{ backgroundColor: colors.background }}>
        <View style={styles.peer}>
          <Text style={styles.title}>
            Number of Peers: {this.state.peers.length}
          </Text>
        </View>
        <Accordion
          sections={this.state.peers}
          activeSections={this.state.opened}
          renderHeader={this.renderPeer}
          renderContent={this.renderPeerInfo}
          onChange={this.updateOpened}
        />
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
