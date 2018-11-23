import { fetchQuery, graphql } from 'react-relay'

import { contact } from '../../utils'
import { merge } from '../../helpers'

const query = graphql`
  query ContactQuery($filter: BertyEntityContactInput) {
    ContactList(
      filter: $filter
      first: 1
      after: ""
      orderBy: ""
      orderDesc: false
    ) {
      edges {
        node {
          ...Contact
        }
      }
    }
  }
`

export default context => ({
  graphql: query,
  fetch: variables =>
    fetchQuery(context.environment, query, merge([contact, variables])),
})
