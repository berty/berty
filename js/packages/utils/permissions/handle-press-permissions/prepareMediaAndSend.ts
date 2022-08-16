import beapi from '@berty/api'

import { PrepareMediaAndSendProps } from './interfaces'

const amap = async <T extends any, C extends (value: T) => any>(arr: T[], cb: C) =>
	Promise.all(arr.map(cb))

export const prepareMediaAndSend: (props: PrepareMediaAndSendProps) => void = async ({
	setSending,
	messengerClient,
	onClose,
	res,
}) => {
	try {
		setSending(true)

		const medias = await amap(res, async doc => {
			if (!messengerClient) {
				throw new Error('no messenger client')
			}

			const stream = await messengerClient.mediaPrepare({})
			await stream.emit({
				info: {
					filename: doc.filename,
					mimeType: doc.mimeType,
					displayName: doc.displayName || doc.filename || 'document',
				},
				uri: doc.uri,
			})
			const reply = await stream.stopAndRecv()
			const optimisticMedia: beapi.messenger.IMedia = {
				cid: reply.cid,
				filename: doc.filename,
				mimeType: doc.mimeType,
				displayName: doc.displayName || doc.filename || 'document',
			}
			return optimisticMedia
		})

		await onClose(medias)
	} catch (err) {
		console.warn('failed to prepare media and send message:', err)
	}
	setSending(false)
}
