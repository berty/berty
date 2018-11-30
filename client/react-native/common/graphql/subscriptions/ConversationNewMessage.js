import EventStream from './EventStream'
import { queries } from '..'

export default context => ({
  ...EventStream(context),
  subscribe: ({ updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        (async (store, data) => {
          if (data.EventStream.kind === 302) {
            const conversation = await queries(context).Conversation.fetch({
              id: data.EventStream.conversationId,
            })
            console.log('ConversationNewMessage: conversation:', conversation)
            return updater(store, conversation)
          }
        }),
    }),
})
