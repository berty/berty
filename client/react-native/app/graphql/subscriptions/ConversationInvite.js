import { parseEmbedded } from '@berty/common/helpers/json'
import EventStream from './EventStream'
import { btoa } from 'b64-lite'

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
            await context.queries.Conversation.fetch({
              id: attributes.conversation.id,
            })
          }
        }),
    }),
})
