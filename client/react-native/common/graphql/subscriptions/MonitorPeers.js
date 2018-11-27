import { graphql } from 'react-relay'
import { subscriber } from '../../relay'

const MonitorPeers = graphql`
  subscription MonitorPeersSubscription {
    MonitorPeers(T: true) {
      id
      addrs
      connection
    }
  }
`

export default context =>
  subscriber({ environment: context.environment, subscription: MonitorPeers })
