import { graphql } from 'react-relay'

export default graphql`
  query EventListQuery($limit: Uint32!, $filter: BertyP2pEventInput) {
    EventList(limit: $limit, filter: $filter) {
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
