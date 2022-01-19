import { Buffer } from 'buffer'

import beapi from '@berty-tech/api'
import { ServiceClientType } from '@berty-tech/grpc-bridge/welsh-clients.gen'

export const storageSet = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	key: string,
	value: string,
) => {
	await accountClient.appStoragePut({ key, value: Buffer.from(value, 'utf-8'), global: true })
}

export const storageRemove = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	key: string,
) => {
	await accountClient.appStorageRemove({ key, global: true })
}

export const storageGet = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	key: string,
) => {
	try {
		const reply = await accountClient.appStorageGet({ key, global: true })
		return Buffer.from(reply.value).toString('utf-8')
	} catch (e) {
		if ((e as Error).message.includes('datastore: key not found')) {
			return ''
		}
		throw e
	}
}
