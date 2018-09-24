import { graphql } from 'react-relay'
import { commit } from '../../relay'

const ConversationInviteMutation = graphql`
  mutation ConversationInviteMutation($input: ConversationInviteInput!) {
    ConversationInvite(input: $input) {
      clientMutationId
      bertyEntityConversation {
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
  }
`

export default {
  commit: input =>
    commit(ConversationInviteMutation, 'ConversationInvite', input),
}
