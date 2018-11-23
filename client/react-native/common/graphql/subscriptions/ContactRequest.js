import EventStream from './EventStream'

export default context => ({
  ...EventStream(context),
  subscribe: ({ updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        ((store, data) => {
          if (data.EventStream.kind === 201) {
            return updater && updater(store, data.EventStream.attributes.me)
          }
        }),
    }),
})
