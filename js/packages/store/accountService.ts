import { Buffer } from 'buffer'

import beapi from '@berty-tech/api'
import { Service } from '@berty-tech/grpc-bridge'
import rpcBridge from '@berty-tech/grpc-bridge/rpc/rpc.bridge'

export const accountService = Service(beapi.account.AccountService, rpcBridge, null)

export const storageSet = async (key: string, value: string) => {
	await accountService.appStoragePut({ key, value: Buffer.from(value, 'utf-8') })
}

export const storageRemove = async (key: string) => {
	await accountService.appStorageRemove({ key })
}

export const storageGet = async (key: string) => {
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
