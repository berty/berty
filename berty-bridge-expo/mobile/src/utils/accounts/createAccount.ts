import { NavigationProp } from '@react-navigation/native'

import beapi from '@berty/api'
import { ScreensParams } from '@berty/navigation/types'

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
		// Redux persistence is not enabled here: it uses account-scoped app storage, which
		// is only available once the account is opened (openAccount enables it then).
		resp = await accountClient.createAccount({
			networkConfig,
		})
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
