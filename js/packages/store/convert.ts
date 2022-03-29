import { Buffer } from 'buffer'
import Long from 'long'

import beapi from '@berty/api'

import { ParsedInteraction } from './types.gen'

export const parseInteraction = (
	i: beapi.messenger.IInteraction | beapi.messenger.Interaction,
): ParsedInteraction => {
	try {
		if (typeof (i as any).toJSON === 'function') {
			i = (i as any).toJSON()
		}
		const typeName =
			beapi.messenger.AppMessage.Type[i.type || beapi.messenger.AppMessage.Type.Undefined]

		if (!typeName) {
			console.warn('failed to get AppMessage type name', i.type)
			return { ...i, type: beapi.messenger.AppMessage.Type.Undefined, payload: undefined }
		}
		const name = typeName.substring('Type'.length)
		const pbobj = (beapi.messenger.AppMessage as any)[name as any]

		if (!pbobj) {
			throw new Error(`pbobj not found for ${typeName}`)
		}

		let pl = i.payload
		if (typeof pl === 'string') {
			pl = Buffer.from(pl, 'base64')
		}

		const { member, conversation, ...rest } = i // eslint-disable-line @typescript-eslint/no-unused-vars

		return {
			...rest,
			type:
				(beapi.messenger.AppMessage.Type[typeName as any] as unknown as number) ||
				beapi.messenger.AppMessage.Type.Undefined,
			payload: pl && pbobj.decode(pl).toJSON(),
		}
	} catch (err) {
		console.log('failed to parse interaction:', i, err)
		return { ...i, type: beapi.messenger.AppMessage.Type.Undefined, payload: undefined }
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
