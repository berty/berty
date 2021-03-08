import beapi from '@berty-tech/api'
import { ParsedInteraction } from '@berty-tech/store/types.gen'

export const parseInteraction = (i: beapi.messenger.Interaction): ParsedInteraction => {
	const typeName = Object.keys(beapi.messenger.AppMessage.Type).find(
		(name) => beapi.messenger.AppMessage.Type[name as any] === i.type,
	)
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
		payload: pbobj.decode(i.payload),
	}
}
