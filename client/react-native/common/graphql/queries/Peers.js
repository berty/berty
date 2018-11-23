import { graphql, fetchQuery } from 'relay-runtime'

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

export default context => ({
  graphql: query,
  fetch: () => fetchQuery(context.environment, query, { t: true }),
})
