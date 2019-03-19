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
    `
  )
