import { graphql } from 'react-relay'

import { enums } from '..'
import { subscriber } from '../../relay'

const EventStream = graphql`
  subscription EventStreamSubscription {
    EventStream {
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
  }
`

let _subscriber = null

export default context => {
  if (_subscriber === null) {
    _subscriber = subscriber({
      environment: context.environment,
      subscription: EventStream,
    })
    _subscriber.subscribe({
      updater: (store, data) => {
        console.log(enums.ValueBertyP2pKindInputKind[data.EventStream.kind])
      },
    })
  }
  return _subscriber
}
