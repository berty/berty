import { fetchQuery, graphql } from 'react-relay'

import { environment } from '../../relay'

const query = graphql`
  query PanicQuery {
    Panic(T: true) {
      T
    }
  }
`

export default {
  ...query,
  fetch: (variables = {}) => fetchQuery(environment, query, variables),
}
