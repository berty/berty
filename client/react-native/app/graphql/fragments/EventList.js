import { graphql } from 'react-relay'

export default graphql`
  fragment EventList on Query
    @argumentDefinitions(
      filter: { type: BertyEntityEventInput }
      orderBy: { type: "String!" }
      orderDesc: { type: "Bool!" }
      count: { type: "Int32" }
      cursor: { type: "String" }
      onlyWithoutAckedAt: { type: "Enum" }
      onlyWithoutSeenAt: { type: "Enum" }
    ) {
    EventList(
      filter: $filter
      orderBy: $orderBy
      orderDesc: $orderDesc
      first: $count
      after: $cursor
      onlyWithoutAckedAt: $onlyWithoutAckedAt
      onlyWithoutSeenAt: $onlyWithoutSeenAt
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
