import EventStream from './EventStream'

export default conversation => ({
  ...EventStream,
  subscribe: ({ updater }) =>
    EventStream.subscribe({
      updater: (store, data) => {
        console.log('RECEIVED_EVENT')
        if (
          data.EventStream.kind === 302 &&
          data.EventStream.conversationId === conversation.id
        ) {
          return updater && updater(store, data.EventStream)
        }
      },
    }),
})
