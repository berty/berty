import { graphql } from 'react-relay'
import { commit } from '../../relay'

const EventSeenMutation = graphql`
  mutation EventSeenMutation($id: ID!) {
    EventSeen(id: $id) {
      id
      senderId
      createdAt
      updatedAt
      sentAt
      seenAt
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

export default context => (input, configs) =>
  commit(context.environment, EventSeenMutation, 'EventSeen', input, configs)
