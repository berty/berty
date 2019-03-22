import { graphql } from 'react-relay'

import { commit } from '../../relay'
import { conversation } from '../../utils'
import { merge } from '../../helpers'
// import { updaters } from '..'

const ConversationAddMessageMutation = graphql`
  mutation ConversationAddMessageMutation(
    $conversation: BertyEntityConversationInput
    $message: BertyEntityMessageInput
  ) {
    ConversationAddMessage(conversation: $conversation, message: $message) {
      id
      sourceDeviceId
      createdAt
      updatedAt
      sentAt
      receivedAt
      ackedAt
      direction
      apiVersion
      kind
      attributes
      seenAt
      ackStatus
      dispatches {
        eventId
        deviceId
        contactId
        sentAt
        ackedAt
        seenAt
        ackMedium
        seenMedium
      }
      sourceContactId
      targetType
      targetAddr
      metadata {
        key
        values
      }
    }
  }
`

export default context => (input, configs) =>
  commit(
    context.environment,
    ConversationAddMessageMutation,
    'ConversationAddMessage',
    merge([
      { conversation: conversation.default, message: { text: '' } },
      input,
    ]),
    configs
  )
