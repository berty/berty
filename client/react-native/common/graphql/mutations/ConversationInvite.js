import { graphql } from 'react-relay'

import { commit } from '../../relay'
import { updaters } from '..'

const ConversationInviteMutation = graphql`
  mutation ConversationInviteMutation(
    $conversation: BertyEntityConversationInput
    $members: [BertyEntityConversationMemberInput]
  ) {
    ConversationInvite(conversation: $conversation, members: $members) {
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
    ConversationInviteMutation,
    'ConversationInvite',
    input,
    {
      updater: (store, data) => {
        updaters.conversationList.forEach(updater =>
          updater(store)
            .add('ConversationEdge', data.ConversationInvite.id)
            .after()
        )
      },
      ...configs,
    }
  )
