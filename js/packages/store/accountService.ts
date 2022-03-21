import { Buffer } from 'buffer'

import beapi from '@berty-tech/api'
import { Service } from '@berty-tech/grpc-bridge'
import { logger } from '@berty-tech/grpc-bridge/middleware'
import rpcBridge from '@berty-tech/grpc-bridge/rpc/rpc.bridge'

export const accountService = Service(
	beapi.account.AccountService,
	rpcBridge,
	logger.create('ACCOUNT'),
)

export const storageSet = async (key: string, value: string) => {
	await accountService.appStoragePut({ key, value: Buffer.from(value, 'utf-8'), global: true })
}

export const storageRemove = async (key: string) => {
	await accountService.appStorageRemove({ key, global: true })
}

export const storageGet = async (key: string) => {
	try {
		const reply = await accountService.appStorageGet({ key, global: true })
		return Buffer.from(reply.value).toString('utf-8')
	} catch (e) {
		if ((e as Error).message.includes('datastore: key not found')) {
			return ''
		}
		throw e
	}
}
