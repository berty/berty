import RNFS from 'react-native-fs'

import { GoBridge } from '@berty/native-modules/GoBridge'
import { setNextAccount, setStateOnBoardingReady } from '@berty/redux/reducers/ui.reducer'
import { AppDispatch } from '@berty/redux/store'
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

export const initialLaunch = async (dispatch: AppDispatch) => {
	await initBridge()
	const f = async () => {
		const accounts = await refreshAccountList()

		if (Object.keys(accounts).length > 0) {
			let accountSelected: any = null
			Object.values(accounts).forEach(account => {
				if (!accountSelected) {
					accountSelected = account
				} else if (accountSelected && accountSelected.lastOpened < (account.lastOpened || 0)) {
					accountSelected = account
				}
			})

			// Delete berty-backup account
			const outFile =
				RNFS.TemporaryDirectoryPath + `/berty-backup-${accountSelected.accountId}` + '.tar'
			RNFS.unlink(outFile)
				.then(() => {
					console.log('File deleted')
				})
				.catch(() => {
					console.log('File berty backup does not exist') // here
				})

			dispatch(setNextAccount(accountSelected.accountId))

			return
		} else {
			// this is the first account that will be created
			dispatch(setStateOnBoardingReady())
		}
	}

	f().catch(e => console.warn(e))
}
