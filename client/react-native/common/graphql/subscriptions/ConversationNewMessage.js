import EventStream from './EventStream'

export default context => ({
  ...EventStream(context),
  subscribe: ({ updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        (async (store, data) => {
          if (data.EventStream.kind === 302) {
            console.log('new message', data.EventStream)
            const conversation = await context.queries.Conversation.fetch({
              id: data.EventStream.conversationId,
            })
            console.log('ConversationNewMessage: conversation:', conversation)
            return updater(store, conversation)
          }
        }),
    }),
})
