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
              if (response.kind === 'ContactAcceptRequest') {
                iterator.next(response)
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
          if (data.kind === 'ContactAcceptRequest') {
            return updater(store, data)
          }
        }),
    }),
}
