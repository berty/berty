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
              if (response.kind === 'ContactRequest') {
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
          if (data.kind === 'ContactRequest') {
            return updater(store, data)
          }
        }),
    }),
}
