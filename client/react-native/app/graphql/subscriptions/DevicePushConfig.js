export default context => ({
  subscribe: ({ updater }) =>
    context.subscriptions.commitLogStream.subscribe({
      updater: (store, data) => {
        const [operation, entity] = [
          data.CommitLogStream.operation,
          data.CommitLogStream.entity.devicePushConfig,
        ]
        if (entity != null) {
          updater && updater(store, entity, operation === 2)
        }
      },
    }),
})
