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

const defaultVariables = {
  filter: contact.default,
  orderBy: '',
  orderDesc: false,
  count: 1,
  cursor: '',
}

export default context => ({
  graphql: query,
  defaultVariables,
  fetch: async variables =>
    (await fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    )).ContactList,
})
