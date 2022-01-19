import beapi from '@berty-tech/api'
import rnutil from '@berty-tech/rnutil'
import { persistor, resetAccountStore } from '@berty-tech/redux/store'
import { useAppDispatch } from '@berty-tech/react-redux'

import { reducerAction, MessengerActions, StreamInProgress } from './types'
import { ServiceClientType } from '@berty-tech/grpc-bridge/welsh-clients.gen'

export const closeAccountWithProgress = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	dispatch: (arg0: reducerAction) => void,
	reduxDispatch: ReturnType<typeof useAppDispatch>,
) => {
	await accountClient
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
					dispatch({
						type: MessengerActions.SetStateStreamDone,
					})
					return
				}
				if (msg?.progress?.state !== 'done') {
					const progress = msg?.progress
					if (progress) {
						const payload: StreamInProgress = {
							msg: progress,
							stream: 'Close account',
						}
						dispatch({
							type: MessengerActions.SetStateStreamInProgress,
							payload,
						})
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
	accountClient: ServiceClientType<beapi.account.AccountService>,
	path: string,
	dispatch: (arg0: reducerAction) => void,
) =>
	new Promise<beapi.account.ImportAccountWithProgress.Reply | null>(resolve => {
		let metaMsg: beapi.account.ImportAccountWithProgress.Reply | null = null
		accountClient
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
							dispatch({
								type: MessengerActions.SetStateStreamInProgress,
								payload,
							})
						}
					} else {
						dispatch({
							type: MessengerActions.SetStateStreamDone,
						})
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
	accountClient: ServiceClientType<beapi.account.AccountService>,
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
): Promise<beapi.account.IAccountMetadata[]> => {
	try {
		if (embedded) {
			const resp = await accountClient.listAccounts({})

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

export const getNetworkConfigurationFromPreset = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	preset: beapi.account.NetworkConfigPreset | null | undefined,
): Promise<beapi.account.INetworkConfig> => {
	const hasBluetoothPermission =
		(await rnutil.checkPermissions('p2p', null, { navigateToPermScreenOnProblem: false })) ===
		'granted'

	const configForPreset = await accountClient.networkConfigGetPreset({
		preset: preset || beapi.account.NetworkConfigPreset.Undefined,
		hasBluetoothPermission: hasBluetoothPermission,
	})

	if (configForPreset.config) {
		return configForPreset.config
	}

	return {}
}

export const createAccount = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	newConfig?: beapi.account.INetworkConfig,
) => {
	let resp: beapi.account.CreateAccount.Reply
	try {
		const netConf: beapi.account.INetworkConfig = await getNetworkConfigurationFromPreset(
			accountClient,
			beapi.account.NetworkConfigPreset.Performance,
		)

		resp = await accountClient.createAccount({
			networkConfig: newConfig || { ...netConf, staticRelay: [] },
		})
		persistor.persist()
	} catch (e) {
		console.warn('unable to create account', e)
		return
	}
	if (!resp.accountMetadata?.accountId) {
		throw new Error('no account id returned')
	}

	await refreshAccountList(accountClient, embedded, dispatch)
	dispatch({
		type: MessengerActions.SetCreatedAccount,
		payload: {
			accountId: resp.accountMetadata.accountId,
		},
	})
}

export const createNewAccount = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
	newConfig?: beapi.account.INetworkConfig,
) => {
	if (!embedded) {
		return
	}

	try {
		await createAccount(accountClient, embedded, dispatch, newConfig)
	} catch (e) {
		console.warn('unable to create account', e)
		return
	}
}

export const getUsername = async (
	accountClient: ServiceClientType<beapi.account.AccountService>,
) => {
	const username = await accountClient.getUsername({})
	return username || null
}
