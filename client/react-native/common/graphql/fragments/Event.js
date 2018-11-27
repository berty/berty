import { graphql, createFragmentContainer } from 'react-relay'

export default component =>
  createFragmentContainer(
    component,
    graphql`
      fragment Event on BertyP2pEvent {
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
    `
  )
