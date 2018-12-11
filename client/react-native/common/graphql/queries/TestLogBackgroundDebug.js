import { fetchQuery, graphql } from 'react-relay'

const query = graphql`
  query TestLogBackgroundDebugQuery {
    TestLogBackgroundDebug(T: true) {
      T
    }
  }
`

export default context => ({
  graphql: query,
  fetch: async (variables = {}) =>
    (await fetchQuery(context.environment, query, variables)).TestLogBackgroundDebug,
})
