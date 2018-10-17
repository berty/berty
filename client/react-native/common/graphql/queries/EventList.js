import { graphql } from 'react-relay'

export default graphql`
  query EventListQuery($filter: BertyP2pEventInput) {
    EventList(filter: $filter) {
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
