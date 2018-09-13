import { graphql } from 'react-relay'

export default graphql`
  query EventListQuery(
    $limit: Int
    $kind: BertyP2pKind
    $conversationID: String
  ) {
    EventList(limit: $limit, kind: $kind, conversationID: $conversationID) {
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
