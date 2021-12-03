import { Buffer } from 'buffer'

import beapi from '@berty-tech/api'
import { Service } from '@berty-tech/grpc-bridge'
import rpcBridge from '@berty-tech/grpc-bridge/rpc/rpc.bridge'

const accountService = Service(beapi.account.AccountService, rpcBridge, null)

const setItem = async (key: string, value: string) => {
	await accountService.appStoragePut({ key, value: Buffer.from(value, 'utf-8') })
}

const removeItem = async (key: string) => {
	await accountService.appStorageRemove({ key })
}

const getItem = async (key: string) => {
	try {
		const reply = await accountService.appStorageGet({ key })
		return Buffer.from(reply.value).toString('utf-8')
	} catch (e) {
		if ((e as Error).message.includes('datastore: key not found')) {
			return ''
		}
		throw e
	}
}

const persistStorage = {
	setItem,
	removeItem,
	getItem,
}

export default persistStorage
