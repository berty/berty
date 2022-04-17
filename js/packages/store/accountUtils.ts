import { Platform } from 'react-native'

import beapi from '@berty/api'
import {
	setAccounts,
	setCreatedAccount,
	setNextAccount,
	setStateOnBoardingReady,
	setStateStreamDone,
	setStateStreamInProgress,
	setStreamError,
} from '@berty/redux/reducers/ui.reducer'
import {
	PersistentOptionsKeys,
	setPersistentOption,
} from '@berty/redux/reducers/persistentOptions.reducer'
import store, { AppDispatch, persistor, resetAccountStore } from '@berty/redux/store'

import { storageKeyForAccount } from './utils'
import { Maybe } from './hooks'
import { accountService, storageRemove } from './accountService'
import { StreamInProgress } from './types'

export const importAccount = async (embedded: boolean, path: string) => {
	if (!embedded) {
		return
	}

	// TODO: check if bridge is running
	let resp: beapi.account.ImportAccountWithProgress.Reply | null

	try {
		await closeAccountWithProgress(store.dispatch)
		resp = await importAccountWithProgress(path, store.dispatch)
		store.dispatch(
			setPersistentOption({
				type: PersistentOptionsKeys.OnBoardingFinished,
				payload: {
					isFinished: true,
				},
			}),
		)
	} catch (e) {
		console.warn('unable to import account', e)
		return
	}

	if (!resp) {
		throw new Error('no account returned')
	}

	if (!resp.accountMetadata?.accountId) {
		throw new Error('no account id returned')
	}

	await refreshAccountList(embedded)

	store.dispatch(setNextAccount(resp.accountMetadata.accountId))
}

/**
 * updates the AccountService account
 */
export const updateAccount = async (embedded: boolean, payload: any) => {
	if (!embedded) {
		return
	}

	try {
		let obj: any = {
			accountId: payload.accountId,
		}
		if (payload.accountName) {
			obj.accountName = payload.accountName
		}
		if (payload.publicKey) {
			obj.publicKey = payload.publicKey
		}
		if (payload.avatarCid) {
			obj.avatarCid = payload.avatarCid
		}
		await accountService.updateAccount(obj)
	} catch (e) {
		console.warn('unable to update account', e)
		return
	}

	await refreshAccountList(embedded)
}

export const switchAccount = async (
	embedded: boolean,
	accountID: string,
	dispatch: AppDispatch,
) => {
	if (!embedded) {
		return
	}

	try {
		await closeAccountWithProgress(dispatch)
	} catch (e) {
		console.warn('unable to close account', e)
		return
	}
	dispatch(setNextAccount(accountID))
}

export const deleteAccount = async (
	embedded: boolean,
	selectedAccount: string | null,
	dispatch: AppDispatch,
) => {
	if (!embedded) {
		return
	}
	// close current account service
	await closeAccountWithProgress(dispatch)
	let accounts: beapi.account.IAccountMetadata[] = []
	if (selectedAccount !== null) {
		// delete account service and account data storage
		await accountService.deleteAccount({ accountId: selectedAccount })
		await storageRemove(storageKeyForAccount(selectedAccount))
		accounts = await refreshAccountList(embedded)
	} else {
		console.warn('state.selectedAccount is null and this should not occur')
	}

	if (!Object.values(accounts).length) {
		// reset to OnBoarding
		dispatch(setStateOnBoardingReady())
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
		dispatch(setNextAccount(accountSelected?.accountId))
	}
}

export const restart = async (
	embedded: boolean,
	accountID: Maybe<string>,
	dispatch: AppDispatch,
) => {
	if (!embedded) {
		return
	}

	try {
		await closeAccountWithProgress(dispatch)
	} catch (e) {
		console.warn('unable to close account')
		return
	}
	dispatch(setNextAccount(accountID))
}

export const closeAccountWithProgress = async (dispatch: AppDispatch) => {
	try {
		console.log('flushing redux persistence')
		await persistor.flush()
		console.log('flushed redux persistence')
		persistor.pause()
		console.log('paused redux persistence')
		const stream = await accountService.closeAccountWithProgress({})
		stream.onMessage((msg, err) => {
			if (err) {
				if (err.EOF) {
					console.log('Node is closed')
				} else {
					console.warn('Error while closing node:', err)
				}
				dispatch(resetAccountStore())
				dispatch(setStateStreamDone())
				return
			}
			if (msg?.progress?.state !== 'done') {
				const progress = msg?.progress
				if (progress) {
					const payload: StreamInProgress = {
						msg: progress,
						stream: 'Close account',
					}
					dispatch(setStateStreamInProgress(payload))
				}
			}
		})
		await stream.start()
	} catch (err) {
		console.warn('Failed to close node:', err)
		dispatch(resetAccountStore())
		dispatch(setStreamError({ error: new Error(`Failed to close node: ${err}`) }))
	}
}

const importAccountWithProgress = (path: string, dispatch: AppDispatch) =>
	new Promise<beapi.account.ImportAccountWithProgress.Reply | null>(async resolve => {
		let metaMsg: beapi.account.ImportAccountWithProgress.Reply | null = null
		let done = false
		try {
			const stream = await accountService.importAccountWithProgress({ backupPath: path })
			stream.onMessage(async (msg, _) => {
				if (msg?.progress?.state !== 'done') {
					const progress = msg?.progress
					if (progress) {
						const payload: StreamInProgress = {
							msg: progress,
							stream: 'Import account',
						}
						dispatch(setStateStreamInProgress(payload))
					}
				}

				metaMsg = msg?.accountMetadata ? msg : metaMsg
				done = msg?.progress?.state === 'done' || done

				if (done && metaMsg) {
					dispatch(setStateStreamDone())
					resolve(metaMsg)
				}
			})
			await stream.start()
		} catch (err) {
			dispatch(setStreamError({ error: new Error(`Failed to import account: ${err}`) }))
			resolve(null)
		}
	})

export const refreshAccountList = async (
	embedded: boolean,
): Promise<beapi.account.IAccountMetadata[]> => {
	try {
		if (embedded) {
			const resp = await accountService.listAccounts({})

			if (!resp.accounts) {
				return []
			}

			store.dispatch(setAccounts(resp.accounts))

			return resp.accounts
		}

		let accounts = [{ accountId: '0', name: 'remote server account' }]

		store.dispatch(setAccounts(accounts))

		return accounts
	} catch (e) {
		console.warn(e)
		return []
	}
}

const createAccount = async (
	embedded: boolean,
	dispatch: AppDispatch,
	config?: beapi.account.INetworkConfig,
) => {
	let resp: beapi.account.CreateAccount.Reply
	try {
		let networkConfig
		if (!config) {
			const defaultConfig = await accountService.networkConfigGet({ accountId: '' })
			networkConfig = defaultConfig.currentConfig
		} else {
			networkConfig = config
		}
		resp = await accountService.createAccount({
			networkConfig,
			sessionKind: Platform.OS === 'web' ? 'desktop-electron' : null,
		})
		persistor.persist()
	} catch (e) {
		console.warn('unable to create account', e)
		return
	}
	if (!resp.accountMetadata?.accountId) {
		throw new Error('no account id returned')
	}

	await refreshAccountList(embedded)
	dispatch(
		setCreatedAccount({
			accountId: resp.accountMetadata.accountId,
		}),
	)
}

export const createNewAccount = async (
	embedded: boolean,
	dispatch: AppDispatch,
	config?: beapi.account.INetworkConfig,
) => {
	if (!embedded) {
		return
	}

	try {
		await createAccount(embedded, dispatch, config)
	} catch (e) {
		console.warn('unable to create account', e)
		return
	}
}
