import EventStream from './EventStream'
import { btoa } from 'b64-lite'

export default context => ({
  ...EventStream(context),
  subscribe: ({ updater }) =>
    EventStream(context).subscribe({
      updater:
        updater &&
        (async (store, data) => {
          if (data.EventStream.kind === 202) {
            const [
              sourceDeviceId,
              // receiverId,
            ] = [
              btoa('contact:' + data.EventStream.sourceDeviceId),
              // btoa('contact:', data.EventStream.receiverId),
            ]
            updater(store, { id: sourceDeviceId }, true)
            // updater(store, { id: receiverId }, true)
            await context.queries.Contact.fetch({
              filter: { id: sourceDeviceId },
            })
          }
        }),
    }),
})
