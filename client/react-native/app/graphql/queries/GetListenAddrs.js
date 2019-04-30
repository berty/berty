import { fetchQuery, graphql } from 'relay-runtime'

const query = graphql`
  query GetListenAddrsQuery($t: Bool!) {
    GetListenAddrs(T: $t) {
      addrs
    }
  }
`

export default context => ({
  graphql: query,
  fetch: async () =>
    (await fetchQuery(context.environment, query, { t: true })).GetListenAddrs,
})
