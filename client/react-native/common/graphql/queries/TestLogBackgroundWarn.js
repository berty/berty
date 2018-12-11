import { fetchQuery, graphql } from 'react-relay'

const query = graphql`
  query TestLogBackgroundWarnQuery {
    TestLogBackgroundWarn(T: true) {
      T
    }
  }
`

export default context => ({
  graphql: query,
  fetch: async (variables = {}) =>
    (await fetchQuery(context.environment, query, variables)).TestLogBackgroundWarn,
})
