import { graphql } from 'react-relay'

import { conversation } from '../../utils'
import { merge } from '../../helpers'
import { updater as updaterHelper } from '../../relay'

export const defaultArguments = {
  default: {
    filter: conversation.default,
    orderBy: '',
    orederDesc: false,
  },
}

export const updater = {
  default: (store, args = {}) =>
    updaterHelper(store).connection(
      'ConversationList_ConversationList',
      merge([defaultArguments.default, args])
    ),
}

const Default = graphql`
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
`

export default Default
