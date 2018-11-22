import EventStream from './EventStream'

export default context => ({
  ...EventStream(context),
  subscribe: ({ iterator, updater }) =>
    EventStream(context).subscribe({
      iterator:
        iterator &&
        function * () {
          try {
            while (true) {
              const response = yield
              if (response.EventStream.kind === 201) {
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
          if (data.EventStream.kind === 201) {
            return updater(store, data.EventStream)
          }
        }),
    }),
})
