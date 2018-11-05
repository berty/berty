import { graphql } from 'react-relay'
import { subscriber } from '../../relay'

const MonitorPeers = graphql`
  subscription MonitorPeersSubscription {
    MonitorPeers {
      id
      addrs
      connection
    }
  }
`

export default subscriber({ subscription: MonitorPeers })
