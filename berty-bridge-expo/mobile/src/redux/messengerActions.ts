import { Buffer } from 'buffer'

import beapi from '@berty/api'

import { messengerActions } from './messengerActions.gen'

type MessengerAction = ReturnType<typeof messengerActions[keyof typeof messengerActions]>

// Same as protobufjs' toJSON() (longs and bytes as strings, so payloads stay serializable in
// the store), except enums: the app compares them against the numeric `beapi` enums
// (e.g. conversation.type === Conversation.Type.MultiMemberType), so keep them as numbers.
// With toJSON()'s enum names, every group was treated as a one-to-one conversation.
const storeObjectOptions = { longs: String, enums: Number, bytes: String, json: true }

export const streamEventToAction: (
	evt: beapi.messenger.IStreamEvent,
) => MessengerAction | undefined = evt => {
	if (!evt || evt.type === null || evt.type === undefined) {
		console.warn('received empty or unknown event', evt)
		return
	}

	const enumName = beapi.messenger.StreamEvent.Type[evt.type]
	if (!enumName) {
		console.warn('failed to get event type name', evt.type)
		return
	}

	const payloadName = enumName.substring('Type'.length)
	const pbobj = (beapi.messenger.StreamEvent as any)[payloadName]
	if (!pbobj) {
		console.warn('failed to find a protobuf object matching the event type', payloadName)
		return
	}
	let pl = evt.payload
	if (typeof pl === 'string') {
		pl = Buffer.from(pl, 'base64')
	}
	const eventPayload = pl ? pbobj.toObject(pbobj.decode(pl), storeObjectOptions) : {}
	if (!eventPayload) {
		console.warn('failed to decode payload', payloadName, pl)
		return
	}
	console.log('eventPayload', eventPayload)
	return {
		type: `messenger/${payloadName}` as any,
		payload: eventPayload,
	}
}
