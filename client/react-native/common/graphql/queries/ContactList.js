import { fetchQuery, graphql } from 'react-relay'

import { contact } from '../../utils'
import { merge } from '../../helpers'

const query = graphql`
  query ContactListQuery(
    $filter: BertyEntityContactInput
    $orderBy: String!
    $orderDesc: Bool!
    $count: Int32
    $cursor: String
  ) {
    ...ContactList
      @arguments(
        filter: $filter
        orderBy: $orderBy
        orderDesc: $orderDesc
        count: $count
        cursor: $cursor
      )
  }
`
const defaultVariables = {
  filter: contact.default,
  orderBy: '',
  orderDesc: false,
  count: 10,
  cursor: '',
}

export default context => ({
  graphql: query,
  defaultVariables,
  fetch: variables =>
    fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    ),
})
