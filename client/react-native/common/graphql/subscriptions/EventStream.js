import { graphql } from 'react-relay'
import { subscriber } from '../../relay'

const EventStream = graphql`
  subscription EventStreamSubscription {
    EventStream {
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

export default subscriber({ subscription: EventStream })
