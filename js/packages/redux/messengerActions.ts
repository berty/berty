import { Buffer } from 'buffer'

import beapi from '@berty/api'

import { messengerActions } from './messengerActions.gen'

type MessengerAction = ReturnType<typeof messengerActions[keyof typeof messengerActions]>

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
	const eventPayload = pl ? pbobj.decode(pl).toJSON() : {}
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
