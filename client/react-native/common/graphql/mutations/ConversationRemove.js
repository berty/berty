import { graphql } from 'react-relay'
import { commit } from '../../relay'

const ConversationRemoveMutation = graphql`
  mutation ConversationRemoveMutation($id: ID!) {
    ConversationRemove(id: $id) {
      id
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
    }
  }
`

export default context => (input, configs) =>
  commit(
    context.environment,
    ConversationRemoveMutation,
    'ConversationRemove',
    input,
    configs
  )
