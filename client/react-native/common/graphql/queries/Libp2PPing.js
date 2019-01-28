import { fetchQuery, graphql } from 'react-relay'

const query = graphql`
  query Libp2PPingQuery($str: String!) {
    Libp2PPing(str: $str) {
      ret
    }
  }
`

export default context => ({
  graphql: query,
  fetch: async variables =>
    (await fetchQuery(context.environment, query, variables)).Libp2PPing,
})
