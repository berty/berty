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

let _context = null
let _subscriber = null

export default context => {
  if (subscriber === null || context !== _context) {
    return (_subscriber = subscriber({
      environment: context.environment,
      subscription: EventStream,
    }))
  }
  return _subscriber
}
