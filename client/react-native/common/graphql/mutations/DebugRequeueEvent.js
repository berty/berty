import { graphql } from 'react-relay'

import { commit } from '../../relay'

const DebugRequeueEventMutation = graphql`
  mutation DebugRequeueEventMutation($eventId: ID!) {
    DebugRequeueEvent(eventId: $eventId) {
      id
      sourceDeviceId
      createdAt
      updatedAt
      sentAt
      seenAt
      receivedAt
      ackedAt
      direction
      apiVersion
      destinationDeviceId
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
