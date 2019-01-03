export default context => ({
  subscribe: ({ updater }) =>
    context.subscriptions.commitLogStream.subscribe({
      updater:
        updater &&
        ((store, data) => {
          const [operation, conversation] = [
            data.CommitLogStream.operation,
            data.CommitLogStream.entity.conversation,
          ]
          if (conversation != null) {
            if (operation !== 2) {
              // fix when contact doesn't exist in db
              conversation.members.forEach(member => {
                if (member.contact == null) {
                  member = { ...member, contact: { id: member.contactId } }
                  const contact =
                    store.get(member.contactId) ||
                    store.create(member.contactId, 'BertyEntityContactPayload')
                  store.get(member.id).setLinkedRecord(contact, 'contact')
                }
              })
            }
            updater(store, conversation, operation === 2)
          }
        }),
    }),
})
