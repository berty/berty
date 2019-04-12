import { graphql } from 'react-relay'

import { commit } from '@berty/relay'
import { conversation } from '@berty/common/utils'
import { merge } from '@berty/common/helpers'

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
