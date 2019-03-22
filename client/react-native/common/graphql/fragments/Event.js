import { graphql, createFragmentContainer } from 'react-relay'

export default component =>
  createFragmentContainer(
    component,
    graphql`
      fragment Event on BertyEntityEvent {
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
    `
  )
