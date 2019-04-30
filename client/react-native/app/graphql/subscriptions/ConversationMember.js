export default context => ({
  subscribe: ({ updater }) =>
    context.subscriptions.commitLogStream.subscribe({
      updater:
        updater &&
        ((store, data) => {
          const [operation, entity] = [
            data.CommitLogStream.operation,
            data.CommitLogStream.entity.conversationMember,
          ]
          if (entity != null) {
            console.log('conversation member', entity)
            // fix when contact doesn't exist in db
            const contact =
              store.get(entity.contactId) ||
              store.create(entity.contactId, 'BertyEntityContact')
            const conversationMember = store.get(entity.id)
            conversationMember.setLinkedRecord(contact, 'contact')
            updater && updater(store, entity, operation === 2)
          }
        }),
    }),
})
