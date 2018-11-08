import React, { PureComponent } from 'react'
import { Text, View, ActivityIndicator } from 'react-native'
import { Header, Screen } from '../../../../Library'
import { QueryReducer } from '../../../../../relay'
import { queries, subscriptions } from '../../../../../graphql'
import { colors } from '../../../../../constants'

const Connection = {
  'NOT_CONNECTED': 0,
  'CONNECTED': 1,
  'CAN_CONNECT': 2,
  'CANNOT_CONNECT': 3,
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
  }

  componentWillMount() {
    subscriptions.monitorPeers.subscribe({
      iterator: undefined,
      updater: (store, data) => {
        console.log(data)
        const peer = data.MonitorPeers

        switch (peer.connection) {
        case Connection.CONNECTED:
          this.addPeer(peer)
          break
        case Connection.NOT_CONNECTED:
          this.removePeer(peer)
          break
        default:
          break
        }
      },
    })

    subscriptions.monitorPeers.start()
  }

  componentDidMount() {
    queries.Peers.fetch().then(data => {
      this.setState({
        peers: data.Peers.list,
      })
    })
  }

  removePeer = peer => {
    this.setState(prevState => ({
      peers: prevState.peers.filter(p => p.id !== peer.id),
    }))
  }

  addPeer = peer => {
    this.setState(prevState => ({
      peers: [peer, ...prevState.peers],
    }))
  }


  render () {
    console.log(this.state.peers)
    return (
      <Screen style={[{ backgroundColor: colors.white }]}>
        <Text>Number of Peers: {this.state.peers.length}</Text>
        <View>
          {this.state.peers.map((peer, i) => (
            <Text key={i}>{peer.id}</Text>
          ))}
        </View>
      </Screen>
    )
  }
}
