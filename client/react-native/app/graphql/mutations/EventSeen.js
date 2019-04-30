import { graphql } from 'react-relay'
import { commit } from '../../relay'

const EventSeenMutation = graphql`
  mutation EventSeenMutation($id: ID!) {
    EventSeen(id: $id) {
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
  commit(context.environment, EventSeenMutation, 'EventSeen', input, configs)
