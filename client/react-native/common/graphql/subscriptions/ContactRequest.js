import { btoa } from 'b64-lite'

import EventStream from './EventStream'
import { parseEmbedded } from '../../helpers/json'

export default context => ({
  ...EventStream(context),
  subscribe: ({ updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        (async (store, data) => {
          if (data.EventStream.kind === 201) {
            const attributes = parseEmbedded(data.EventStream.attributes)
            const contact = await context.queries.Contact.fetch({
              id: btoa('contact:' + attributes.me.id),
            })
            return updater(store, contact)
          }
        }),
    }),
})
