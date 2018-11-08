import { graphql } from 'react-relay'
import { subscriber } from '../../relay'

const MonitorPeers = graphql`
  subscription MonitorPeersSubscription {
    MonitorPeers (T: true) {
      id
      addrs
      connection
    }
  }
`

export default subscriber({ subscription: MonitorPeers })
