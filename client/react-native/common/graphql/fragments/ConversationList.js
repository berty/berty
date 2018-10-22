import { graphql, createPaginationContainer } from 'react-relay'

import { ConversationList } from '../queries'

export default component =>
  createPaginationContainer(
    component,
    graphql`
      fragment ConversationList on Query
        @argumentDefinitions(
          filter: { type: BertyEntityConversationInput }
          count: { type: "Int32" }
          cursor: { type: "String" }
        ) {
        ConversationList(
          filter: $filter
          first: $count
          after: $cursor
          orderBy: ""
          orderDesc: false
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
    `,
    {
      direction: 'forward',
      getConnectionFromProps (props) {
        return props.data.ConversationList
      },
      getFragmentVariables (prevVars, totalCount) {
        return {
          ...prevVars,
          count: totalCount,
        }
      },
      getVariables (props, { count, cursor }, fragmentVariables) {
        return { count, cursor }
      },
      query: ConversationList,
    }
  )
