import React, { PureComponent } from 'react'
import { Text, View, ActivityIndicator, StyleSheet, ListView } from 'react-native'
import { Header, Screen } from '../../../../Library'
import { QueryReducer } from '../../../../../relay'
import { queries, subscriptions } from '../../../../../graphql'
import { colors } from '../../../../../constants'
import Accordion from 'react-native-collapsible/Accordion';

const Connection = {
  'NOT_CONNECTED': 0,
  'CONNECTED': 1,
  'CAN_CONNECT': 2,
  'CANNOT_CONNECT': 3,
}

const ConnectionType = c => {
  switch (c) {
  case Connection.NOT_CONNECTED: return 'NotConnected'
  case Connection.CONNECTED: return 'Connected'
  case Connection.CAN_CONNECT: return 'CanConnect'
  case Connection.CANNOT_CONNECT: return 'CannotConnect'
  default: return 'Unknow'
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

  componentWillMount() {
    subscriptions.monitorPeers.subscribe({
      iterator: undefined,
      updater: (store, data) => {
        const peer = data.MonitorPeers
        this.addPeer(peer)
      },
    })
  }

  componentDidMount() {
    queries.Peers.fetch().then(data => this.updatePeers(data.Peers.list))
    subscriptions.monitorPeers.start()
  }

  updatePeers = peers => {
    this.setState({ peers })
  }

  removePeer = peer => {
    this.setState(prevState => ({
      peers: prevState.peers.filter(p => p.id !== peer.id),
    }))
  }

  addPeer = peer => {
    this.setState(prevState => ({
      peers: [peer, ...prevState.peers.filter(p => p.id !== peer.id)],
    }))
  }

  renderPeer = peer => {
    return (
      <View>
        {
          peer.connection === Connection.CONNECTED ?
            <Text style={styles.green}>{peer.id.slice(0, 20)}...</Text>
          : <Text style={styles.red}>{peer.id.slice(0, 20)}...</Text>
        }
      </View>
    )
  }

  renderPeerInfo = peer => {
    console.log(peer)
    return (
      <View>
        <Text>type: {ConnectionType(peer.connection)}</Text>
        <Text>addrs: [</Text>
        {
          peer.addrs.map((addr, i) => (
            <Text key={i}>{addr}</Text>
          ))
        }
        <Text>]</Text>
      </View>
    )
  }


  updateOpened = opened => {
    this.setState({ opened });
  };

  render () {
    console.log(this.state.peers)
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <Text>Number of Peers: {this.state.peers.length}</Text>
        <Accordion
          sections={this.state.peers}
          activeSections={this.state.opened}
          renderHeader={this.renderPeer}
          renderContent={this.renderPeerInfo}
          onChange={this.updateOpened}
        />
      </Screen>
    )
  }
}

const styles = StyleSheet.create({
  red: {
    color: '#FF0000',
  },
  green: {
    color: '#00FF00',
  },
  blue: {
    color: '#0000FF',
  },
})
