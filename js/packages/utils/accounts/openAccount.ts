import { Platform } from 'react-native'

import beapi from '@berty/api'
import {
	setStateStreamInProgress,
	setStreamError,
	setStreamDone,
} from '@berty/redux/reducers/ui.reducer'
import { AppDispatch, persistor } from '@berty/redux/store'
import { accountClient, storageGet } from '@berty/utils/accounts/accountClient'
import { defaultCLIArgs } from '@berty/utils/accounts/defaultCLIArgs'
import { GlobalPersistentOptionsKeys } from '@berty/utils/persistent-options/types'
import { StreamWithProgressType } from '@berty/utils/protocol/progress.types'

const openAccountWithProgress = async (
	cliArgs: string[],
	selectedAccount: string | null,
	dispatch: AppDispatch,
) =>
	new Promise<void>(async (resolve, reject) => {
		try {
			const stream = await accountClient.openAccountWithProgress({
				args: cliArgs,
				accountId: selectedAccount?.toString(),
				sessionKind: Platform.OS === 'web' ? 'desktop-electron' : null,
			})
			stream.onMessage((msg, err) => {
				if (err?.EOF) {
					console.log('activating persist with account:', selectedAccount?.toString())
					persistor.persist()
					console.log('opening account: stream closed')
					dispatch(setStreamDone())
					resolve()
				} else if (err && !err.OK) {
					console.warn('open account error:', err.error.errorCode)
					dispatch(setStreamError({ error: new Error(`Failed to start node: ${err}`) }))
					reject(err)
				}
				if (msg?.progress?.state !== 'done') {
					const progress = msg?.progress
					if (progress) {
						const payload: StreamWithProgressType = {
							msg: progress,
							stream: 'Open account',
						}
						dispatch(setStateStreamInProgress(payload))
					}
				}
			})
			await stream.start()
			console.log('node is opened')
		} catch (err) {
			dispatch(setStreamError({ error: new Error(`Failed to start node: ${err}`) }))
			reject(err)
		}
	})

export const openAccount = async (selectedAccount: string | null, dispatch: AppDispatch) => {
	if (selectedAccount === null) {
		console.warn('no account opened')
		return
	}

	let tyberHost = ''
	try {
		tyberHost = (await storageGet(GlobalPersistentOptionsKeys.TyberHost)) || ''
		if (tyberHost !== '') {
			console.warn(`connecting to ${tyberHost}`)
		}
	} catch (e) {
		console.warn(e)
	}

	// FIXME: pass tyber host as arg
	const cliArgs = defaultCLIArgs

	let openedAccount: beapi.account.GetOpenedAccount.Reply

	try {
		openedAccount = await accountClient.getOpenedAccount({})

		if (openedAccount.accountId !== selectedAccount) {
			if (openedAccount.accountId !== '') {
				await accountClient.closeAccount({})
			}

			await openAccountWithProgress(cliArgs, selectedAccount, dispatch)
		}
	} catch (e) {
		console.log(`account seems to be unopened yet ${e}`)
	}
}
