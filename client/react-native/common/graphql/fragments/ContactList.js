import { graphql } from 'react-relay'

const fragment = graphql`
  fragment ContactList on Query
    @argumentDefinitions(
      filter: { type: BertyEntityContactInput }
      orderBy: { type: "String!" }
      orderDesc: { type: "Bool!" }
      count: { type: "Int32" }
      cursor: { type: "String" }
    ) {
    ContactList(
      filter: $filter
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderDesc: $orderDesc
    ) @connection(key: "ContactList_ContactList") {
      edges {
        cursor
        node {
          id
          ...Contact
        }
      }
      pageInfo {
        count
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
    }
  }
`

export default fragment
