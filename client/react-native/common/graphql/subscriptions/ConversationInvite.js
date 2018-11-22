import EventStream from './EventStream'

export default context => ({
  ...EventStream(context),
  subscribe: ({ iterator, updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        ((store, data) => {
          if (data.EventStream.kind === 301) {
            return updater(store, data.EventStream)
          }
        }),
    }),
})
