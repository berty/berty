import EventStream from './EventStream'

export default context => ({
  ...EventStream(context),
  subscribe: ({ updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        (async (store, data) => {
          if (data.EventStream.kind === 202) {
            const [
              senderId,
              // receiverId,
            ] = [
              btoa('contact:' + data.EventStream.senderId),
              // btoa('contact:', data.EventStream.receiverId),
            ]
            updater(store, { id: senderId }, true)
            // updater(store, { id: receiverId }, true)
            await context.queries.Contact.fetch({
              filter: { id: senderId },
            })
          }
        }),
    }),
})
