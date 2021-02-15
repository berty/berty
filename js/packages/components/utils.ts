import { Buffer } from 'buffer'
import { WelshMessengerServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'
import RNFS from 'react-native-fs'
import { Platform } from 'react-native'
import path from 'path'

export const base64ToURLBase64 = (str: string) =>
	str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '')

export const pathToPlatformSource = (p: string) => {
	if (Platform.OS == 'android') {
		return 'file://' + p
	}
	return p
}

const fetchSource = async (
	client: WelshMessengerServiceClient,
	tmpDest: string,
	cid: string,
): Promise<string> => {
	console.log('fetchSource', cid)
	const stream = await client.mediaRetrieve({ cid })
	await new Promise<void>((resolve, reject) => {
		let i = 0
		stream.onMessage(async (msg, err) => {
			if (err?.EOF) {
				resolve()
				return
			}
			if (err) {
				reject(err)
				return
			}
			if (msg?.block) {
				await RNFS.write(tmpDest, Buffer.from(msg.block).toString('binary'), i, 'ascii')
				i += msg.block.length
			}
		})
		stream.start()
	})
	const ret = pathToPlatformSource(tmpDest)
	console.log('final path for', cid, ':', ret)
	try {
		const s = await RNFS.stat(tmpDest) // RNFS.exists is weird on iOS
		console.log('did stat', s)
	} catch (e) {
		console.error('failed to stat after fetch:', e)
		// stat failed, do nothing with error and fetch source
	}
	return ret
}

const fetchMap: { [key: string]: Promise<string> } = {}

export const getSource = async (
	client: WelshMessengerServiceClient,
	cid: string,
): Promise<string> => {
	console.log('getSource', cid)

	if (!fetchMap.hasOwnProperty(cid)) {
		fetchMap[cid] = new Promise<string>(async (resolve, reject) => {
			let tmpDest = path.join(RNFS.TemporaryDirectoryPath, cid)
			if (Platform.OS == 'ios') {
				// react-native's Image adds ".png" to the file path for no reason
				tmpDest += '.png'
			}
			try {
				await RNFS.stat(tmpDest) // RNFS.exists is weird on iOS
				resolve(pathToPlatformSource(tmpDest))
			} catch (e) {
				// stat failed, do nothing with error and fetch source
			}
			fetchSource(client, tmpDest, cid).then(resolve).catch(reject)
		})
		fetchMap[cid].finally(() => {
			delete fetchMap[cid]
		})
	}

	return fetchMap[cid]
}
