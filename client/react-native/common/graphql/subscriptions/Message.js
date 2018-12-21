export default context => ({
  subscribe: ({ updater }) =>
    context.subscriptions.commitLogStream.subscribe({
      updater:
        updater &&
        ((store, data) => {
          const [operation, entity] = [
            data.CommitLogStream.operation,
            data.CommitLogStream.entity.event,
          ]
          if (entity != null && entity.kind === 302) {
            updater(store, entity, operation === 2)
          }
        }),
    }),
})
