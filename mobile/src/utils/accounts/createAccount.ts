import { NavigationProp } from '@react-navigation/native'

import beapi from '@berty/api'
import { ScreensParams } from '@berty/navigation/types'
import { persistor } from '@berty/redux/store'

import { accountClient } from './accountClient'
import { refreshAccountList } from './accountUtils'

export const createAccount = async (
	reset: NavigationProp<ScreensParams>['reset'],
	config?: beapi.account.INetworkConfig,
) => {
	let resp: beapi.account.CreateAccount.Reply
	try {
		let networkConfig
		if (!config) {
			const defaultConfig = await accountClient.networkConfigGet({ accountId: '' })
			networkConfig = defaultConfig.currentConfig
		} else {
			networkConfig = config
		}
		resp = await accountClient.createAccount({
			networkConfig,
		})
		// this line can cause error like AppStorageGet: datastore key not found
		// this error is triggered when it's the first time that the account is persisted, and it's normal
		persistor.persist()
	} catch (e) {
		console.warn('unable to create account', e)
		return
	}
	if (!resp.accountMetadata?.accountId) {
		throw new Error('no account id returned')
	}

	await refreshAccountList()
	reset({
		routes: [
			{
				name: 'Account.Opening',
				params: {
					selectedAccount: resp.accountMetadata.accountId,
					isNewAccount: true,
				},
			},
		],
	})
}
