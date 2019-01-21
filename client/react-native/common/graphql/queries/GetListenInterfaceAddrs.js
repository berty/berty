import { fetchQuery, graphql } from 'relay-runtime'

const query = graphql`
  query GetListenInterfaceAddrsQuery($t: Bool!) {
    GetListenInterfaceAddrs(T: $t) {
      addrs
    }
  }
`

export default context => ({
  graphql: query,
  fetch: async () => (await fetchQuery(context.environment, query, { t: true })).GetListenInterfaceAddrs,
})
