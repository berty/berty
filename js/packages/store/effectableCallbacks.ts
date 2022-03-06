import beapi from '@berty-tech/api'
import { persistor, resetAccountStore } from '@berty-tech/redux/store'
import { useAppDispatch } from '@berty-tech/react-redux'

import { reducerAction, MessengerActions, StreamInProgress, NetworkConfigFront } from './types'
import { accountService } from './accountService'
import {
	setCreatedAccount,
	setStateStreamDone,
	setStateStreamInProgress,
} from '@berty-tech/redux/reducers/ui.reducer'
import { setNetworkConfig } from '@berty-tech/redux/reducers/networkConfig.reducer'

export const closeAccountWithProgress = async (
	dispatch: (arg0: reducerAction) => void,
	reduxDispatch: ReturnType<typeof useAppDispatch>,
) => {
	await accountService
		.closeAccountWithProgress({})
		.then(async stream => {
			stream.onMessage((msg, err) => {
				if (err) {
					if (err.EOF) {
						console.log('Node is closed')
					} else {
						console.warn('Error while closing node:', err)
					}
					reduxDispatch(resetAccountStore())
					reduxDispatch(setStateStreamDone())
					return
				}
				if (msg?.progress?.state !== 'done') {
					const progress = msg?.progress
					if (progress) {
						const payload: StreamInProgress = {
							msg: progress,
							stream: 'Close account',
						}
						reduxDispatch(setStateStreamInProgress(payload))
					}
				}
			})
			await persistor.flush()
			persistor.pause()
			await stream.start()
		})
		.catch(err => {
			console.warn('Failed to close node:', err)
			reduxDispatch(resetAccountStore())
			dispatch({
				type: MessengerActions.SetStreamError,
				payload: { error: new Error(`Failed to close node: ${err}`) },
			})
		})
}

export const importAccountWithProgress = async (
	path: string,
	dispatch: (arg0: reducerAction) => void,
	reduxDispatch: ReturnType<typeof useAppDispatch>,
) =>
	new Promise<beapi.account.ImportAccountWithProgress.Reply | null>(resolve => {
		let metaMsg: beapi.account.ImportAccountWithProgress.Reply | null = null
		accountService
			.importAccountWithProgress({ backupPath: path })
			.then(async stream => {
				stream.onMessage(async (msg, _) => {
					if (msg?.progress?.state !== 'done') {
						const progress = msg?.progress
						if (progress) {
							const payload: StreamInProgress = {
								msg: progress,
								stream: 'Import account',
							}
							reduxDispatch(setStateStreamInProgress(payload))
						}
					} else {
						reduxDispatch(setStateStreamDone)
						resolve(metaMsg)
					}
					if (msg?.accountMetadata) {
						metaMsg = msg
					}
				})
				await stream.start()
			})
			.catch(err => {
				dispatch({
					type: MessengerActions.SetStreamError,
					payload: { error: new Error(`Failed to import account: ${err}`) },
				})
				resolve(null)
			})
	})

export const refreshAccountList = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
): Promise<beapi.account.IAccountMetadata[]> => {
	try {
		if (embedded) {
			const resp = await accountService.listAccounts({})

			if (!resp.accounts) {
				return []
			}

			dispatch({ type: MessengerActions.SetAccounts, payload: resp.accounts })

			return resp.accounts
		}

		let accounts = [{ accountId: '0', name: 'remote server account' }]

		dispatch({ type: MessengerActions.SetAccounts, payload: accounts })

		return accounts
	} catch (e) {
		console.warn(e)
		return []
	}
}

export const handleNetworkConfigFront = (config?: NetworkConfigFront) => {
	if (!config) {
		return
	}
	const handledConfig: beapi.account.INetworkConfig = {
		...config,
		rendezvous: config.rendezvous?.map(item => item.enable && item.value),
		staticRelay: config.staticRelay?.map(item => item.enable && item.value),
		bootstrap: config.bootstrap?.map(item => item.enable && item.value),
	}

	return handledConfig
}

export const handleNetworkConfigBack = (config?: beapi.account.INetworkConfig | null) => {
	if (!config) {
		return
	}
	const handledConfig: NetworkConfigFront = {
		...config,
		rendezvous: config.rendezvous?.map(item => {
			return {
				value: item,
				enable: true,
			}
		}),
		staticRelay: config.staticRelay?.map(item => {
			return {
				value: item,
				enable: true,
			}
		}),
		bootstrap: config.bootstrap?.map(item => {
			return {
				value: item,
				enable: true,
			}
		}),
	}

	return handledConfig
}

export const createAccount = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	reduxDispatch: ReturnType<typeof useAppDispatch>,
	config?: NetworkConfigFront,
) => {
	let resp: beapi.account.CreateAccount.Reply
	try {
		let networkConfig
		if (!config) {
			const defaultConfig = await accountService.networkConfigGet({ accountId: '' })
			networkConfig = defaultConfig.currentConfig
		} else {
			networkConfig = handleNetworkConfigFront(config)
		}

		resp = await accountService.createAccount({
			networkConfig,
		})
		persistor.persist()
	} catch (e) {
		console.warn('unable to create account', e)
		return
	}
	if (!resp.accountMetadata?.accountId) {
		throw new Error('no account id returned')
	}

	await refreshAccountList(embedded, dispatch)
	reduxDispatch(
		setCreatedAccount({
			accountId: resp.accountMetadata.accountId,
		}),
	)
}

export const createNewAccount = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	reduxDispatch: ReturnType<typeof useAppDispatch>,
	config?: NetworkConfigFront,
) => {
	if (!embedded) {
		return
	}

	try {
		await createAccount(embedded, dispatch, reduxDispatch, config)
	} catch (e) {
		console.warn('unable to create account', e)
		return
	}
}

export const getUsername = async () => {
	const username = await accountService.getUsername({})
	return username || null
}
