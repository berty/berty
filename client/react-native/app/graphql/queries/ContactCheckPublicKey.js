import { fetchQuery, graphql } from 'react-relay'

const query = graphql`
  query ContactCheckPublicKeyQuery($filter: BertyEntityContactInput) {
    ContactCheckPublicKey(filter: $filter) {
      ret
    }
  }
`

export default context => ({
  graphql: query,
  fetch: async (variables = {}) =>
    (await fetchQuery(context.environment, query, variables))
      .ContactCheckPublicKey,
})
