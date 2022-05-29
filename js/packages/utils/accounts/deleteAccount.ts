import { NavigationProp } from '@react-navigation/native'

import beapi from '@berty/api'
import { ScreensParams } from '@berty/navigation/types'

import { accountClient } from './accountClient'
import { refreshAccountList } from './accountUtils'

export const deleteAccount = async (
	reset: NavigationProp<ScreensParams>['reset'],
	selectedAccount: string | null,
) => {
	console.log('deleteAccount', selectedAccount)
	let accounts: beapi.account.IAccountMetadata[] = []
	if (selectedAccount !== null) {
		// delete account service and account data storage
		await accountClient.deleteAccount({ accountId: selectedAccount })
		accounts = await refreshAccountList()
	} else {
		console.warn('state.selectedAccount is null and this should not occur')
	}

	if (!Object.values(accounts).length) {
		// navigate to OnBoarding
		reset({
			routes: [
				{
					name: 'Onboarding.GetStarted',
				},
			],
		})
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
		// navigate to OpeningAccount
		reset({
			routes: [
				{
					name: 'Account.Opening',
					params: { selectedAccount: accountSelected?.accountId },
				},
			],
		})
	}
}
