import { Platform } from 'react-native'

import beapi from '@berty/api'
import { setSelectedAccount, setIsNewAccount } from '@berty/redux/reducers/ui.reducer'
import { AppDispatch } from '@berty/redux/store'

import { accountClient } from './accountClient'
import { refreshAccountList } from './accountUtils'

export const createAccount = async (
	dispatch: AppDispatch,
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
			sessionKind: Platform.OS === 'web' ? 'desktop-electron' : null,
		})
		// TODO: dig why this line cause error on AppStorageGet: datastore key not found
		// persistor.persist()
	} catch (e) {
		console.warn('unable to create account', e)
		return
	}
	if (!resp.accountMetadata?.accountId) {
		throw new Error('no account id returned')
	}

	await refreshAccountList()
	dispatch(setIsNewAccount(true))
	dispatch(setSelectedAccount(resp.accountMetadata.accountId))
}
