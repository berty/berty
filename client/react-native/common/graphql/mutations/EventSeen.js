import { graphql } from 'react-relay'
import { commit } from '../../relay'
import { merge } from '../../helpers'
import { conversation } from '../../utils'

const EventSeenMutation = graphql`
  mutation EventSeenMutation($eventId: ID!) {
    EventSeen(eventId: $eventId) {
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

export default context => (input, configs) =>
  commit(
    context.environment,
    EventSeenMutation,
    'EventSeen',
    merge([
      { conversation: conversation.default, message: { text: '' } },
      input,
    ]),
    configs
  )
