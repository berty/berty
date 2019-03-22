import { graphql } from 'react-relay'

import { commit } from '../../relay'
// import { updaters } from '..'

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
    ConversationCreateMutation,
    'ConversationCreate',
    input,
    configs,
  )
