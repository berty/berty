import { graphql } from 'react-relay'
import { commit } from '../../relay'

const EventSeenMutation = graphql`
  mutation EventSeenMutation($id: ID!) {
    EventSeen(id: $id) {
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

export default context => (input, configs) =>
  commit(context.environment, EventSeenMutation, 'EventSeen', input, configs)
