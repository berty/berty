import { btoa } from 'b64-lite'

import EventStream from './EventStream'
import { parseEmbedded } from '../../helpers/json'

export default context => ({
  ...EventStream(context),
  subscribe: ({ iterator, updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        ((store, data) => {
          if (data.EventStream.kind === 301) {
            const attributes = parseEmbedded(data.EventStream.attributes)
            attributes.conversation.id = btoa(
              'conversation:' + attributes.conversation.id
            )
            return updater && updater(store, attributes.conversation)
          }
        }),
    }),
})
