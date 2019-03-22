import { graphql } from 'react-relay'
import { commit } from '../../relay'

const ConversationReadMutation = graphql`
  mutation ConversationReadMutation($id: ID!) {
    ConversationRead(id: $id) {
      id
      readAt
      title
      topic
     infos
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
    ConversationReadMutation,
    'ConversationRead',
    input,
    configs
  )
