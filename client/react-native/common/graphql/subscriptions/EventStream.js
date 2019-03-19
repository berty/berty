import { graphql } from 'react-relay'

import { subscriber } from '../../relay'

const EventStream = graphql`
  subscription EventStreamSubscription {
    EventStream {
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
  }
`

let _subscriber = null

export default context => {
  if (_subscriber === null) {
    _subscriber = subscriber({
      environment: context.environment,
      subscription: EventStream,
    })
  }
  return _subscriber
}
