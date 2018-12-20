import { graphql } from 'react-relay'

import { commit } from '../../relay'

const ConversationInviteMutation = graphql`
  mutation ConversationInviteMutation(
    $conversation: BertyEntityConversationInput
    $members: [BertyEntityConversationMemberInput]
  ) {
    ConversationInvite(conversation: $conversation, members: $members) {
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
    ConversationInviteMutation,
    'ConversationInvite',
    input,
    configs,
  )
