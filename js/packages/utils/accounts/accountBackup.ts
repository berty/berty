import { Buffer } from 'buffer'
import { Platform } from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'

import beapi from '@berty/api'
import { createServiceClient } from '@berty/grpc-bridge'
import * as middleware from '@berty/grpc-bridge/middleware'
import rpcBridge from '@berty/grpc-bridge/rpc/rpc.bridge'

import { createAndSaveFile, getPath } from '../react-native/file-system'
import { importAccount } from './accountUtils'

export const importAccountFromDocumentPicker = async (embedded: boolean) => {
	try {
		const res = await DocumentPicker.pickSingle({
			type: Platform.OS === 'android' ? ['application/x-tar'] : ['public.tar-archive'],
		})
		const replaced = Platform.OS === 'android' ? await getPath(res.uri) : res.uri
		await importAccount(embedded, replaced.replace(/^file:\/\//, ''))
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
