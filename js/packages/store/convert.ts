import { Buffer } from 'buffer'
import Long from 'long'

import beapi from '@berty-tech/api'

import { ParsedInteraction } from './types.gen'
import { reducerAction } from './types'

export const streamEventToAction: (evt: beapi.messenger.IStreamEvent) => reducerAction | undefined =
	evt => {
		if (!evt || evt.type === null || evt.type === undefined) {
			console.warn('received empty event')
			return
		}

		const enumName = beapi.messenger.StreamEvent.Type[evt.type]
		if (!enumName) {
			console.warn('failed to get event type name')
			return
		}

		const payloadName = enumName.substr('Type'.length)
		const pbobj = (beapi.messenger.StreamEvent as any)[payloadName]
		if (!pbobj) {
			console.warn('failed to find a protobuf object matching the event type')
			return
		}
		let pl = evt.payload
		if (typeof pl === 'string') {
			pl = Buffer.from(pl, 'base64')
		}
		const eventPayload = pbobj.decode(pl)
		return {
			type: evt.type,
			name: payloadName,
			payload: eventPayload || {},
		}
	}

type TypeNameDict = { [key: string]: beapi.messenger.AppMessage.Type | undefined }

export const parseInteraction = (i: beapi.messenger.Interaction): ParsedInteraction => {
	try {
		const typeName = Object.keys(beapi.messenger.AppMessage.Type).find(name => {
			return (beapi.messenger.AppMessage.Type as unknown as TypeNameDict)[name] === i.type
		})
		const name = typeName?.substr('Type'.length)
		const pbobj = (beapi.messenger.AppMessage as any)[name as any]

		if (!pbobj) {
			return {
				...i,
				type: beapi.messenger.AppMessage.Type.Undefined,
				payload: undefined,
			}
		}

		return {
			...i,
			payload: i.payload && pbobj.decode(i.payload),
		}
	} catch (err) {
		console.log('failed to parse interaction:', err)
		return { ...i, payload: undefined }
	}
}

export const pbDateToNum = (pbTimestamp?: number | Long | string | null): number => {
	try {
		return !pbTimestamp ? 0 : parseInt(pbTimestamp as string, 10)
	} catch (e) {
		console.warn(`Error parsing date ${pbTimestamp}; returning zero`)
		return 0
	}
}
