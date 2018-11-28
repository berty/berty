import { graphql } from 'react-relay'

import { commit } from '../../relay'

const DebugRequeueEventMutation = graphql`
  mutation DebugRequeueEventMutation($eventId: ID!) {
    DebugRequeueEvent(eventId: $eventId) {
      id
      senderId
      createdAt
      updatedAt
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

export default context => (input, configs) =>
  commit(
    context.environment,
    DebugRequeueEventMutation,
    'DebugRequeueEvent',
    input,
    configs
  )
