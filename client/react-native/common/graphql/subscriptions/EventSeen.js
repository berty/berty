import { parseEmbedded } from '../../helpers/json'
import EventStream from './EventStream'

export default context => ({
  ...EventStream(context),
  subscribe: ({ updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        (async (store, data) => {
          if (data.EventStream.kind === 104) {
            const attributes = parseEmbedded(data.EventStream.attributes)

            // update all messages
            const events = []
            attributes.ids &&
              attributes.ids.forEach(async id => {
                try {
                  events.push(await context.queries.Event.fetch({ id }))
                } catch (err) {
                  console.warn(err)
                }
              })

            // update all conversations
            events.reduce((conversations, event) => {
              if (conversations[event.targetAddr]) {
                return conversations
              }
              const promise = context.queries.Conversation.fetch({
                id: data.EventStream.targetAddr,
              })
              conversations[event.targetAddr] = promise
              return conversations
            }, {})
          }
        }),
    }),
})
