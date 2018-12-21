export default context => ({
  subscribe: ({ updater }) =>
    context.subscriptions.commitLogStream.subscribe({
      updater:
        updater &&
        ((store, data) => {
          const [operation, entity] = [
            data.CommitLogStream.operation,
            data.CommitLogStream.entity.conversation,
          ]
          if (entity != null) {
            updater(store, entity, operation === 2)
            operation !== 2 &&
              context.queries.Conversation.fetch({ id: entity.id })
          }
        }),
    }),
})
