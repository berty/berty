import { parseEmbedded } from '../../helpers/json'
import EventStream from './EventStream'

export default context => ({
  ...EventStream(context),
  subscribe: ({ iterator, updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        (async (store, data) => {
          if (data.EventStream.kind === 301) {
            const attributes = parseEmbedded(data.EventStream.attributes)
            attributes.conversation.id = btoa(
              'conversation:' + attributes.conversation.id
            )
            updater(store, attributes.conversation)
            console.log('ConversationInvite', attributes)
            await context.queries.Conversation.fetch({
              id: attributes.conversation.id,
            })
          }
        }),
    }),
})
