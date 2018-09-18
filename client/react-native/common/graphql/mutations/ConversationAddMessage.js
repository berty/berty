import { graphql } from 'react-relay'
import { commit } from '../../relay'

const ConversationAddMessageMutation = graphql`
  mutation ConversationAddMessageMutation(
    $input: ConversationAddMessageInput!
  ) {
    ConversationAddMessage(input: $input) {
      clientMutationId
      bertyP2pEvent {
        id
        senderId
        createdAt
        updatedAt
        deletedAt
        sentAt
        receivedAt
        ackedAt
        direction
        senderApiVersion
        receiverApiVersion
        receiverId
        kind
        attributes
        conversationId
      }
    }
  }
`

export default {
  commit: input =>
    commit(ConversationAddMessageMutation, 'ConversationAddMessage', input),
}
