import { btoa } from 'b64-lite'

import { parseEmbedded } from '../../helpers/json'
import { queries } from '..'
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
            await queries(context).Conversation.fetch({
              id: attributes.converastion.id,
            })
            return updater && updater(store, attributes.conversation)
          }
        }),
    }),
})
