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
    `
  )
