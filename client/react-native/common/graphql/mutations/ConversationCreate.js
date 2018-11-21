import { graphql } from 'react-relay'
import { commit } from '../../relay'

const ConversationCreateMutation = graphql`
  mutation ConversationCreateMutation(
    $title: String!
    $topic: String!
    $contacts: [BertyEntityContactInput]
  ) {
    ConversationCreate(title: $title, topic: $topic, contacts: $contacts) {
      id
      createdAt
      updatedAt
      deletedAt
      title
      topic
      members {
        id
        createdAt
        updatedAt
        deletedAt
        status
        contact {
          id
          createdAt
          updatedAt
          deletedAt
          sigchain
          status
          devices {
            id
            createdAt
            updatedAt
            deletedAt
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
    ConversationCreateMutation,
    'ConversationCreate',
    input,
    configs
  )
