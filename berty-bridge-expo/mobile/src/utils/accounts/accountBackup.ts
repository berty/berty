import { Buffer } from 'buffer'
import { Platform } from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'

import beapi from '@berty/api'
import { createServiceClient } from '@berty/grpc-bridge'
import * as middleware from '@berty/grpc-bridge/middleware'
import rpcBridge from '@berty/grpc-bridge/rpc/rpc.bridge'

import { createAndSaveFile, getPath } from '../react-native/file-system'

export const importAccountFromDocumentPicker = async () => {
	try {
		const res = await DocumentPicker.getDocumentAsync({
			type: Platform.OS === 'android' ? ['application/x-tar'] : ['public.tar-archive'],
			copyToCacheDirectory: false,
		})

		if (res.canceled) {
		return
	}
		// `res.assets` is an array, even for a single file
		const uri = res.assets?.[0]?.uri
		if (!uri) throw new Error('No URI found in result')

		const replaced = Platform.OS === 'android' ? await getPath(uri) : uri
		return replaced.replace(/^file:\/\//, '')
	} catch (err: any) {
			console.warn(err)
	}
}

export const exportAccountToFile = async (accountId: string | null) => {
	const messengerMiddlewares = middleware.chain(
		__DEV__ ? middleware.logger.create('MESSENGER') : null,
	)

	const messengerClient = createServiceClient(
		beapi.messenger.MessengerService,
		rpcBridge,
		messengerMiddlewares,
	)

	const fileName = `berty-backup-${accountId}`
	const outFile = RNFS.TemporaryDirectoryPath + `/${fileName}` + '.tar'

	// delete file if already exist
	await RNFS.unlink(outFile).catch(() => {})

	await messengerClient
		.instanceExportData({})
		.then(stream => {
			stream.onMessage(async res => {
				if (!res || !res.exportedData) {
					return
				}
				const buff = Buffer.from(res.exportedData).toString('base64')
				await RNFS.write(outFile, buff, -1, 'base64')
			})
			return stream.start()
		})
		.then(async () => {
			Platform.OS === 'android'
				? await createAndSaveFile(outFile, fileName)
				: await Share.open({
						title: 'Berty backup',
						url: `file://${outFile}`,
						type: 'application/x-tar',
				  })
		})
		.catch(async err => {
			if (err?.EOF) {
			} else {
				console.warn(err)
			}
		})
}
