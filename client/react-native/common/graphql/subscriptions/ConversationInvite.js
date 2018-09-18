import EventStream from './EventStream'

export default {
  ...EventStream,
  subscribe: ({ iterator, updater }) =>
    EventStream.subscribe({
      iterator:
        iterator &&
        function * () {
          try {
            while (true) {
              const response = yield
              if (response.EventStream.kind === 'ConversationInvite') {
                iterator.next(response.EventStream)
              }
            }
          } catch (error) {
            iterator.error(error)
          }
          iterator.return()
        },
      updater:
        updater &&
        ((store, data) => {
          if (data.EventStream.kind === 'ConversationInvite') {
            return updater(store, data.EventStream)
          }
        }),
    }),
}
