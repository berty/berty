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
      receivedAt
      ackedAt
      direction
      apiVersion
      kind
      attributes
      seenAt
      ackStatus
      dispatches {
        eventId
        deviceId
        contactId
        sentAt
        ackedAt
        seenAt
        ackMedium
        seenMedium
      }
      sourceContactId
      targetType
      targetAddr
      metadata {
        key
        values
      }
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
