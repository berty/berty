import EventStream from './EventStream'

export default context => ({
  ...EventStream(context),
  subscribe: ({ updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        (async (store, data) => {
          if (data.EventStream.kind === 303) {
            await context.queries.Conversation.fetch({
              id: data.EventStream.conversationId,
            })
            await context.queries.EventList.fetch({
              filter: {
                conversationId: data.EventStream.conversationId,
                kind: 302,
              },
            })
          }
        }),
    }),
})
