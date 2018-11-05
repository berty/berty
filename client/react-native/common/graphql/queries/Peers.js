import { graphql } from 'react-relay'

export default graphql`
  query PeersListQuery {
    Peers(T: true) {
      list {
        id
        addrs
      }
    }
  }
`
