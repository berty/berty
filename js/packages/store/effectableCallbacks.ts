import beapi from '@berty-tech/api'

import { updateShakeAttachments } from './utils'
import {
	accountService,
	GlobalPersistentOptionsKeys,
	MessengerActions,
	reducerAction,
} from './context'
import AsyncStorage from '@react-native-community/async-storage'
import { checkBluetoothPermission } from '@berty-tech/components/settings/Bluetooth'

export const closeAccountWithProgress = async (dispatch: (arg0: reducerAction) => void) => {
	await accountService
		.closeAccountWithProgress({})
		.then(async stream => {
			stream.onMessage((msg, _) => {
				if (msg?.progress?.state !== 'done') {
					dispatch({
						type: MessengerActions.SetStateStreamInProgress,
						payload: {
							msg: msg,
							stream: 'Close account',
						},
					})
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
) => {
	let resp: beapi.account.ImportAccountWithProgress.Reply | null = null
	await accountService
		.importAccountWithProgress({ backupPath: path })
		.then(async stream => {
			stream.onMessage(async (msg, _) => {
				if (msg?.progress?.state !== 'done') {
					dispatch({
						type: MessengerActions.SetStateStreamInProgress,
						payload: {
							msg: msg,
							stream: 'Import account',
						},
					})
				} else {
					dispatch({
						type: MessengerActions.SetStateStreamDone,
					})
				}
				if (msg?.accountMetadata) {
					resp = msg
				}
				return
			})
			await stream.start()
		})
		.catch(err => {
			dispatch({
				type: MessengerActions.SetStreamError,
				payload: { error: new Error(`Failed to close node: ${err}`) },
			})
		})
	return resp
}

export const refreshAccountList = async (
	embedded: boolean,
	dispatch: (arg0: reducerAction) => void,
): Promise<beapi.account.IAccountMetadata[]> => {
	try {
		if (embedded) {
			const resp = await accountService.listAccounts({})

			updateShakeAttachments()

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
	const hasBluetoothPermission = (await checkBluetoothPermission()) === 'granted'

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
		const preset = await AsyncStorage.getItem(GlobalPersistentOptionsKeys.Preset)
		const netConf: beapi.account.INetworkConfig = await getNetworkConfigurationFromPreset(
			parseInt(preset || '0', 10),
		)

		resp = await accountService.createAccount({ networkConfig: netConf })
		console.log('createNewAccount: createAccount')
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
