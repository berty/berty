import { Buffer } from 'buffer'

import { accountClient } from '@berty/utils/accounts/accountClient'

const setItem = async (key: string, value: string) => {
	await accountClient.appStoragePut({ key, value: Buffer.from(value, 'utf-8') })
}

const removeItem = async (key: string) => {
	await accountClient.appStorageRemove({ key })
}

const getItem = async (key: string) => {
	try {
		const reply = await accountClient.appStorageGet({ key })
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
