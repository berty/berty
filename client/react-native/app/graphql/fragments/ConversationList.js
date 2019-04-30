import { graphql } from 'react-relay'

export default graphql`
  fragment ConversationList on Query
    @argumentDefinitions(
      filter: { type: BertyEntityConversationInput }
      orderBy: { type: "String!" }
      orderDesc: { type: "Bool!" }
      count: { type: "Int32" }
      cursor: { type: "String" }
    ) {
    ConversationList(
      filter: $filter
      first: $count
      after: $cursor
      orderBy: $orderBy
      orderDesc: $orderDesc
    ) @connection(key: "ConversationList_ConversationList") {
      edges {
        cursor
        node {
          id
          ...Conversation
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
