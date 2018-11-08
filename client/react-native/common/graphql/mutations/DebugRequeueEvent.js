import { graphql } from 'react-relay'

import { commit } from '../../relay'

const DebugRequeueEventMutation = graphql`
  mutation DebugRequeueEventMutation(
  $eventId: ID!
  ) {
    DebugRequeueEvent(eventId: $eventId) {
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
  commit: (input, configs) => commit(DebugRequeueEventMutation, 'DebugRequeueEvent', input, configs),
}
