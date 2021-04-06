import beapi from '@berty-tech/api'
import { ParsedInteraction } from '@berty-tech/store/types.gen'

type TypeNameDict = { [key: string]: beapi.messenger.AppMessage.Type | undefined }

export const parseInteraction = (i: beapi.messenger.Interaction): ParsedInteraction => {
	const typeName = Object.keys(beapi.messenger.AppMessage.Type).find((name) => {
		return ((beapi.messenger.AppMessage.Type as unknown) as TypeNameDict)[name] === i.type
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
		payload: pbobj.decode(i.payload),
	}
}
