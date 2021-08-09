import beapi from '@berty-tech/api'
import Shake, { ShakeFile } from '@shakebugs/react-native-shake'

import { ParsedInteraction } from '@berty-tech/store/types.gen'

import { accountService } from './context'

type TypeNameDict = { [key: string]: beapi.messenger.AppMessage.Type | undefined }

export const parseInteraction = (i: beapi.messenger.Interaction): ParsedInteraction => {
	const typeName = Object.keys(beapi.messenger.AppMessage.Type).find((name) => {
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
		payload: pbobj.decode(i.payload),
	}
}

export const updateShakeAttachments = async () => {
	try {
		const reply = await accountService.logfileList({ latest: true })
		if (reply.entries.length <= 0) {
			return
		}
		Shake.setMetadata('logfileList', JSON.stringify(reply.entries, null, 2))
		Shake.setShakeReportData(
			reply.entries
				.filter((entry) => !!entry.path && entry.latest)
				.map((entry) => ShakeFile.create(entry.path as string)),
		)
	} catch (e) {
		console.warn('Failed to update shake attachments:', e)
	}
}
