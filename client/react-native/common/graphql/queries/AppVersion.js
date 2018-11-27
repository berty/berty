import { fetchQuery, graphql } from 'relay-runtime'

const query = graphql`
  query AppVersionQuery($t: Bool!) {
    AppVersion(T: $t) {
      version
    }
  }
`

export default context => ({
  graphql: query,
  fetch: () => fetchQuery(context.environment, query, { t: true }),
})
