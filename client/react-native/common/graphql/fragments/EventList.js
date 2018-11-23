import { graphql } from 'react-relay'

export default graphql`
  fragment EventList on Query
    @argumentDefinitions(
      filter: { type: BertyP2pEventInput }
      orderBy: { type: "String!" }
      orderDesc: { type: "Bool!" }
      count: { type: "Int32" }
      cursor: { type: "String" }
      onlyWithoutAckedAt: { type: "Enum" }
    ) {
    EventList(
      filter: $filter
      orderBy: $orderBy
      orderDesc: $orderDesc
      first: $count
      after: $cursor
      onlyWithoutAckedAt: $onlyWithoutAckedAt
    ) @connection(key: "EventList_EventList") {
      edges {
        cursor
        node {
          id
          ...Event
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
