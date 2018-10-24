import { graphql } from 'react-relay'
import { commit } from '../../relay'

const ConversationAddMessageMutation = graphql`
  mutation ConversationAddMessageMutation(
    $conversation: BertyEntityConversationInput
    $message: BertyEntityMessageInput
  ) {
    ConversationAddMessage(conversation: $conversation, message: $message) {
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
`

export default {
  commit: (input, configs) =>
    commit(
      ConversationAddMessageMutation,
      'ConversationAddMessage',
      input,
      configs
    ),
}
