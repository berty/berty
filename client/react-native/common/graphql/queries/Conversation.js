import { fetchQuery, graphql } from 'react-relay'

import { merge } from '../../helpers'

const query = graphql`
  query ConversationQuery($id: ID!) {
    Conversation(id: $id) {
      id
      createdAt
      updatedAt
      readAt
      title
      topic
      members {
        id
        createdAt
        updatedAt
        status
        contact {
          id
          createdAt
          updatedAt
          sigchain
          status
          devices {
            id
            createdAt
            updatedAt
            name
            status
            apiVersion
            contactId
          }
          displayName
          displayStatus
          overrideDisplayName
          overrideDisplayStatus
        }
        conversationId
        contactId
      }
      ...Conversation
    }
  }
`

const defaultVariables = {
  id: '',
}

export default context => ({
  graphql: query,
  defaultVariables,
  fetch: async variables =>
    (await fetchQuery(
      context.environment,
      query,
      merge([defaultVariables, variables])
    )).GetConversation,
})
