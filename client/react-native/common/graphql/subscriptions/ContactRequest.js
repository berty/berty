import { btoa } from 'b64-lite'

import { parseEmbedded } from '../../helpers/json'
import EventStream from './EventStream'

export default context => ({
  ...EventStream(context),
  subscribe: ({ updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        (async (store, data) => {
          if (data.EventStream.kind === 201) {
            const attributes = parseEmbedded(data.EventStream.attributes)
            console.log(attributes)
            const id = btoa('contact:' + attributes.me.id)
            updater(store, { id })
            await context.queries.Contact.fetch({
              filter: { id },
            })
          }
        }),
    }),
})
