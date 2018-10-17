import { graphql } from 'react-relay'

export default graphql`
  query ContactListQuery(
    $filter: BertyEntityContactInput
    $count: Int32
    $cursor: String
  ) {
    ...ContactList @arguments(filter: $filter, count: $count, cursor: $cursor)
  }
`
