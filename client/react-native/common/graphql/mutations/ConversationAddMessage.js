import { graphql } from 'react-relay'

import { commit } from '../../relay'
import { conversation } from '../../utils'
import { merge } from '../../helpers'
import { updaters } from '..'

const ConversationAddMessageMutation = graphql`
  mutation ConversationAddMessageMutation(
    $conversation: BertyEntityConversationInput
    $message: BertyEntityMessageInput
  ) {
    ConversationAddMessage(conversation: $conversation, message: $message) {
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

export default context => (input, configs) =>
  commit(
    context.environment,
    ConversationAddMessageMutation,
    'ConversationAddMessage',
    merge([
      { conversation: conversation.default, message: { text: '' } },
      input,
    ]),
    {
      updater: (store, data) => {
        updaters.eventList[0](store, {
          filter: {
            conversationId: data.ConversationAddMessage.conversationId,
            kind: data.ConversationAddMessage.kind,
          },
        })
          .add('EventEdge', data.ConversationAddMessage.id)
          .before()
      },
      ...configs,
    }
  )
