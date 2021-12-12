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

export type MediaBytesReply = { info: beapi.messenger.IMedia; data: Buffer }

export const retrieveMediaBytes = async (
	client: WelshMessengerServiceClient,
	cid: string,
): Promise<MediaBytesReply> => {
	const stream = await client.mediaRetrieve({ cid })
	const prom = new Promise<MediaBytesReply>((resolve, reject) => {
		let data = Buffer.alloc(0)
		let info: beapi.messenger.IMedia | undefined
		stream.onMessage((msg, err) => {
			if (err?.EOF) {
				if (!info) {
					reject(new Error('no info'))
					return
				}
				resolve({ info, data })
				return
			}
			if (err && !err.OK) {
				reject(err)
				return
			}
			if (msg?.info) {
				info = msg.info
			}
			if (msg?.block && msg.block.length > 0) {
				console.log('will add', msg.block.length / 1000, 'kB')
				data = Buffer.concat([data, msg.block])
			}
		})
	})
	await stream.start()
	return prom
}

export const storageKeyForAccount = (accountID: string) => `storage_${accountID}`
