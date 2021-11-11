import beapi from '@berty-tech/api'
import rnutil from '@berty-tech/rnutil'

import { updateShakeAttachments } from './utils'
import { reducerAction, MessengerActions, StreamInProgress } from './types'
import { accountService } from './accountService'

export const closeAccountWithProgress = async (dispatch: (arg0: reducerAction) => void) => {
	await accountService
		.closeAccountWithProgress({})
		.then(async stream => {
			stream.onMessage((msg, _) => {
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
				} else {
					dispatch({
						type: MessengerActions.SetStateStreamDone,
					})
				}
				return
			})
			await stream.start()
			console.log('node is closed')
		})
		.catch(err => {
			dispatch({
				type: MessengerActions.SetStreamError,
				payload: { error: new Error(`Failed to close node: ${err}`) },
			})
		})
}

export const importAccountWithProgress = async (
	path: string,
	dispatch: (arg0: reducerAction) => void,
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
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
): Promise<beapi.account.IAccountMetadata[]> => {
	try {
		if (embedded) {
			const resp = await accountService.listAccounts({})

			await updateShakeAttachments()

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
	preset: beapi.account.NetworkConfigPreset | null | undefined,
): Promise<beapi.account.INetworkConfig> => {
	const hasBluetoothPermission =
		(await rnutil.checkPermissions('p2p', null, { isToNavigate: false })) === 'granted'

	const configForPreset = await accountService.networkConfigGetPreset({
		preset: preset || beapi.account.NetworkConfigPreset.Undefined,
		hasBluetoothPermission: hasBluetoothPermission,
	})

	if (configForPreset.config) {
		return configForPreset.config
	}

	return {}
}

export const createAccount = async (embedded: boolean, dispatch: (arg0: reducerAction) => void) => {
	let resp: beapi.account.CreateAccount.Reply
	try {
		const netConf: beapi.account.INetworkConfig = await getNetworkConfigurationFromPreset(
			beapi.account.NetworkConfigPreset.Performance,
		)

		resp = await accountService.createAccount({ networkConfig: netConf })
	} catch (e) {
		console.warn('unable to create account', e)
		return
	}
	if (!resp.accountMetadata?.accountId) {
		throw new Error('no account id returned')
	}

	await refreshAccountList(embedded, dispatch)
	dispatch({
		type: MessengerActions.SetCreatedAccount,
		payload: {
			accountId: resp.accountMetadata.accountId,
		},
	})
}

export const createNewAccount = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
) => {
	if (!embedded) {
		return
	}

	try {
		await createAccount(embedded, dispatch)
	} catch (e) {
		console.warn('unable to create account', e)
		return
	}
}

export const getUsername = async () => {
	const username = await accountService.getUsername({})
	return username || null
}
