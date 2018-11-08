import { graphql, fetchQuery } from 'relay-runtime'
import environment from '../../relay/environment'

const query = graphql`
  query PeersListQuery($t: Bool!) {
    Peers(T: $t) {
      list {
        id
        addrs
        connection
      }
    }
  }
`


export default {
  ...query,
  fetch: (variables = {}) =>
    fetchQuery(environment, query, { t: true, ...variables }),
}
