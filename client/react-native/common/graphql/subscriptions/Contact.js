export default context => ({
  subscribe: ({ updater }) =>
    context.subscriptions.commitLogStream.subscribe({
      updater:
        updater &&
        ((store, data) => {
          const [operation, entity] = [
            data.CommitLogStream.operation,
            data.CommitLogStream.entity.contact,
          ]
          if (entity != null) {
            updater(store, entity, operation === 2)
            operation !== 2 &&
              context.queries.Contact.fetch({ filter: { id: entity.id } })
          }
        }),
    }),
})
