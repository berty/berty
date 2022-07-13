import { Buffer } from 'buffer'
import { Platform } from 'react-native'
import RNFS from 'react-native-fs'
import Share from 'react-native-share'

import beapi from '@berty/api'
import { GRPCError } from '@berty/grpc-bridge'
import { setAccounts } from '@berty/redux/reducers/ui.reducer'
import store from '@berty/redux/store'

import { createAndSaveFile } from '../react-native/file-system'
import { accountClient } from './accountClient'

/**
 * updates the AccountService account
 */
export const updateAccount = async (payload: any) => {
	try {
		let obj: beapi.account.UpdateAccount.IRequest = {
			accountId: payload.accountId,
		}
		if (payload.accountName) {
			obj.accountName = payload.accountName
		}
		if (payload.publicKey) {
			obj.publicKey = payload.publicKey
		}
		if (payload.avatarCid) {
			obj.avatarCid = payload.avatarCid
		}
		await accountClient.updateAccount(obj)
	} catch (e) {
		console.warn('unable to update account', e)
		return
	}

	await refreshAccountList()
}

export const refreshAccountList = async (): Promise<beapi.account.IAccountMetadata[]> => {
	try {
		const resp = await accountClient.listAccounts({})
		if (!resp.accounts) {
			return []
		}
		store.dispatch(setAccounts(resp.accounts))
		return resp.accounts
	} catch (e) {
		console.warn(e)
		return []
	}
}

export const exportLogfile = async (accountId: string | null) => {
	// tmp filename
	const fileName = `berty-log-${accountId}`
	const outFile = RNFS.TemporaryDirectoryPath + `/${fileName}` + '.log'

	// delete file if already exist
	await RNFS.unlink(outFile).catch(() => {})

	let destFileName = ''

	try {
		const stream = await accountClient.streamLogfile({ accountId: accountId })
		stream.onMessage(async (msg, err) => {
			if (err?.EOF) {
				console.log('streamLogFile: EOF')
			} else if (err && !err.OK) {
				console.warn('streamLogFile error:', err.error.errorCode)
			}

			if (msg != null) {
				if (msg.fileName !== '') {
					destFileName = msg.fileName.replace(/^.*[\\\/]/, '').replace(/\.[^/.]+$/, '')
				} else {
					const buff = Buffer.from(msg.line).toString('utf8') + '\n'
					await RNFS.write(outFile, buff, -1, 'utf8')
				}
			}
		})
		await stream.start()
		if (Platform.OS === 'android') {
			await createAndSaveFile(outFile, destFileName, 'log')
		} else {
			await Share.open({
				title: 'Berty log',
				url: `file://${outFile}`,
				type: 'text/plain',
			})
		}
	} catch (err) {
		if (!(err instanceof GRPCError && err?.EOF)) {
			console.warn(err)
		}
	}
}
