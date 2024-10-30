import beapi from '@berty/api'
import { ScreensParams } from '@berty/navigation/types'
import { refreshAccountList } from '@berty/utils/accounts/accountUtils'

export const goToLogInOrCreate = async (
	isCreate: boolean,
	selectedAccountID: string | null,
): Promise<{ name: keyof ScreensParams; params?: any }> => {
	const accounts = await refreshAccountList()

	const lengthAccounts = Object.keys(accounts).length
	if (lengthAccounts > 0 && !isCreate) {
		if (selectedAccountID) {
			return {
				name: 'Account.Opening',
				params: { selectedAccount: selectedAccountID },
			}
		}
		let selectedAccount: beapi.account.IAccountMetadata = {}
		Object.values(accounts).forEach(account => {
			if (!selectedAccount.accountId) {
				selectedAccount = account
			} else if (
				selectedAccount &&
				selectedAccount.lastOpened &&
				selectedAccount.lastOpened < (account.lastOpened || 0)
			) {
				selectedAccount = account
			}
		})

		return {
			name: 'Account.Opening',
			params: { selectedAccount: selectedAccount.accountId },
		}
	} else {
		return { name: 'Onboarding.GetStarted' }
	}
}
