import { Buffer } from 'buffer'

import beapi from '@berty/api'

import { ParsedInteraction } from '../api'

export const parseInteraction = (
	i: beapi.messenger.IInteraction | beapi.messenger.Interaction,
): ParsedInteraction => {
	try {
		if (typeof (i as any).toJSON === 'function') {
			i = (i as any).toJSON()
		}
		const rawType = i.type || beapi.messenger.AppMessage.Type.Undefined

		if (!rawType) {
			console.warn('failed to get AppMessage type name', i.type)
			return { ...i, type: beapi.messenger.AppMessage.Type.Undefined, payload: undefined }
		}

		// `type` may be a numeric enum (optimistic interactions) or its string key; normalize to string.
		const typeName =
			typeof rawType === 'number'
				? ((beapi.messenger.AppMessage.Type as any)[rawType] as string)
				: rawType

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
