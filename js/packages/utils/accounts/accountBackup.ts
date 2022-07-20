import { Buffer } from 'buffer'
import { cacheDirectory, deleteAsync, EncodingType, writeAsStringAsync } from 'expo-file-system'
import { shareAsync } from 'expo-sharing'
import { Platform } from 'react-native'
import DocumentPicker from 'react-native-document-picker'

import beapi from '@berty/api'
import { createServiceClient } from '@berty/grpc-bridge'
import * as middleware from '@berty/grpc-bridge/middleware'
import rpcBridge from '@berty/grpc-bridge/rpc/rpc.bridge'

import { copyToCache } from '../react-native/file-system'

export const importAccountFromDocumentPicker = async () => {
	try {
		const res = await DocumentPicker.pickSingle({
			type: Platform.OS === 'android' ? ['application/x-tar'] : ['public.tar-archive'],
		})
		const replaced = Platform.OS === 'android' ? await copyToCache(res.uri) : res.uri
		const filePath = decodeURI(replaced).replace(/^file:\/\//, '')
		console.log('backup file path:', filePath)
		return filePath
	} catch (err: any) {
		if (DocumentPicker.isCancel(err)) {
			// ignore
		} else {
			console.error(err)
		}
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
	const outFile = `${cacheDirectory}${fileName}.tar`

	// delete file if already exist
	await deleteAsync(outFile).catch(() => {})

	const stream = await messengerClient.instanceExportData({})

	await new Promise<void>((resolve, reject) => {
		let buf = Buffer.from('')
		stream.onMessage(async (res, err) => {
			if (err) {
				if (err.EOF) {
					await writeAsStringAsync(outFile, buf.toString('base64'), {
						encoding: EncodingType.Base64,
					})
					console.log('wrote backup at', outFile)
					resolve()
					return
				}
				reject(err)
				return
			}
			if (!res?.exportedData) {
				return
			}
			console.log('got', res.exportedData.length, 'bytes')
			buf = Buffer.concat([buf, res.exportedData])
		})
		stream.start()
	})

	await shareAsync(outFile, {
		dialogTitle: 'Berty backup',
		mimeType: 'application/x-tar',
		UTI: 'public.tar-archive',
	})
}
