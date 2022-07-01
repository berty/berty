import beapi from '@berty/api'
import { GoBridge } from '@berty/native-modules/GoBridge'
import { ScreensParams } from '@berty/navigation/types'
import { refreshAccountList } from '@berty/utils/accounts/accountUtils'

const initBridge = async () => {
	try {
		console.log('bridge methods: ', Object.keys(GoBridge))
		await GoBridge.initBridge()
		console.log('bridge init done')
	} catch (err: any) {
		if (err?.message?.indexOf('already started') === -1) {
			console.error('unable to init bridge: ', err)
		} else {
			console.log('bridge already started: ', err)
		}
	}
}

export const initialLaunch = async (): Promise<{ name: keyof ScreensParams; params?: any }> => {
	await initBridge()
	const accounts = await refreshAccountList()

	const lengthAccounts = Object.keys(accounts).length
	if (lengthAccounts > 0) {
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
