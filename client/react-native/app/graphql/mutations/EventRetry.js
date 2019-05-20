import { graphql } from 'react-relay'
import { commit } from '../../relay'

const EventRetryMutation = graphql`
  mutation EventRetryMutation($id: ID!) {
    EventRetry(id: $id) {
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
        sendErrorMessage
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
  commit(context.environment, EventRetryMutation, 'EventRetry', input, configs)
