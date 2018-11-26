import EventStream from './EventStream'

export default context => ({
  ...EventStream(context),
  subscribe: ({ iterator, updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        ((store, data) => {
          if (data.EventStream.kind === 301) {
            const attributes = JSON.parse(
              String.fromCharCode.apply(null, data.EventStream.attributes)
            )
            attributes.conversation.id = btoa(
              'conversation:' + attributes.conversation.id
            )
            return updater && updater(store, attributes.conversation)
          }
        }),
    }),
})
