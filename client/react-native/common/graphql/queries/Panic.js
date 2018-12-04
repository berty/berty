import { fetchQuery, graphql } from 'react-relay'

const query = graphql`
  query PanicQuery {
    Panic(T: true) {
      T
    }
  }
`

export default context => ({
  graphql: query,
  fetch: async (variables = {}) =>
    (await fetchQuery(context.environment, query, variables)).Panic,
})
