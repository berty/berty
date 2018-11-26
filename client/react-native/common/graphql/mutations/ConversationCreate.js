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
    // {
    //   updater: (store, data) => {
    //     updaters.conversationList.forEach(updater =>
    //       updater(store)
    //         .add('ConversationEdge', data.ConversationCreate.id)
    //         .after()
    //     )
    //   },
    //   ...configs,
    // }
    configs
  )
