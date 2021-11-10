import Shake, { ShakeFile } from '@shakebugs/react-native-shake'
import { Buffer } from 'buffer'

import beapi from '@berty-tech/api'
import { WelshMessengerServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'

import { accountService } from './accountService'

export const updateShakeAttachments = async () => {
	try {
		const reply = await accountService.logfileList({ latest: true })
		if (reply.entries.length <= 0) {
			return
		}
		Shake.setMetadata('logfileList', JSON.stringify(reply.entries, null, 2))
		Shake.setShakeReportData(
			reply.entries
				.filter(entry => !!entry.path && entry.latest)
				.map(entry => ShakeFile.create(entry.path as string)),
		)
	} catch (e) {
		console.warn('Failed to update shake attachments:', e)
	}
}

export const prepareMediaBytes = async (
	client: WelshMessengerServiceClient,
	info: beapi.messenger.IMedia,
	bytes: Buffer,
): Promise<string> => {
	const stream = await client.mediaPrepare({})
	await stream.emit({ info })
	const blockSize = 4 * 1024
	while (bytes.length > 0) {
		let end = blockSize
		if (bytes.length < end) {
			end = bytes.length
		}
		const block = bytes.slice(0, end)
		await stream.emit({ block })
		bytes = bytes.slice(blockSize)
	}
	const resp = await stream.stopAndRecv()
	return resp.cid
}
