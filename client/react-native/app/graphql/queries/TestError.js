import { fetchQuery, graphql } from 'react-relay'

const query = graphql`
  query TestErrorQuery($kind: String!) {
    TestError(kind: $kind) {
      T
    }
  }
`

export default context => ({
  graphql: query,
  fetch: async (variables = {}) =>
    (await fetchQuery(context.environment, query, variables)).TestError,
})
