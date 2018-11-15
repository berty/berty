import { fragments } from '..'
import EventStream from './EventStream'

export default conversation => ({
  ...EventStream,
  subscribe: () =>
    EventStream.subscribe({
      updater: (store, data) => {
        console.log('RECEIVED_EVENT')
        if (
          data.EventStream.kind === 302 &&
          data.EventStream.conversationId === conversation.id
        ) {
          fragments.EventList.updater(store, {
            filter: {
              conversationId: data.EventStream.conversationId,
              kind: data.EventStream.kind,
            },
          })
            .add('EventEdge', data.EventStream.id)
            .before(data.EventStream.createdAt)
        }
      },
    }),
})
