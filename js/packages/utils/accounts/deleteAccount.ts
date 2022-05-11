import beapi from '@berty/api'
import { setStateOnBoarding, setSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { AppDispatch } from '@berty/redux/store'

import { accountClient } from './accountClient'
import { refreshAccountList } from './accountUtils'

export const deleteAccount = async (selectedAccount: string | null, dispatch: AppDispatch) => {
	let accounts: beapi.account.IAccountMetadata[] = []
	if (selectedAccount !== null) {
		// delete account service and account data storage
		await accountClient.deleteAccount({ accountId: selectedAccount })
		accounts = await refreshAccountList()
	} else {
		console.warn('state.selectedAccount is null and this should not occur')
	}

	if (!Object.values(accounts).length) {
		// reset to OnBoarding
		dispatch(setStateOnBoarding())
	} else {
		// open the last opened if an other account exist
		let accountSelected: beapi.account.IAccountMetadata | null = null
		for (const account of accounts) {
			if (!accountSelected) {
				accountSelected = account
			} else if (
				accountSelected &&
				accountSelected.lastOpened &&
				account.lastOpened &&
				accountSelected.lastOpened < account.lastOpened
			) {
				accountSelected = account
			}
		}
		dispatch(setSelectedAccount(accountSelected?.accountId))
	}
}
