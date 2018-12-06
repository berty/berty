import EventStream from './EventStream'

export default context => ({
  ...EventStream(context),
  subscribe: ({ iterator, updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        (async (store, data) => {
          if (data.EventStream.kind === 301) {
            updater(store, { id: data.EventStream.conversationId })
            await context.queries.Conversation.fetch({
              id: data.EventStream.conversationId,
            })
          }
        }),
    }),
})
