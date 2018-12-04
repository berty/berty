import EventStream from './EventStream'

export default context => ({
  ...EventStream(context),
  subscribe: ({ iterator, updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        (async (store, data) => {
          if (data.EventStream.kind === 301) {
            console.log(data.EventStream)
            const conversation = await context.queries.Conversation.fetch({
              id: data.EventStream.conversationId,
            })

            console.log('ConversationInvite: conversation: ', conversation)
            return updater && updater(store, conversation)
          }
        }),
    }),
})
