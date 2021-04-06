import beapi from '@berty-tech/api'

import { accountService, MessengerActions, reducerAction } from './context'

export const closeAccountWithProgress = async (dispatch: (arg0: reducerAction) => void) => {
	await accountService
		.closeAccountWithProgress({})
		.then(async (stream) => {
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
		.catch((err) => {
			dispatch({
				type: MessengerActions.SetStreamError,
				payload: { error: new Error(`Failed to close node: ${err}`) },
			})
		})
}

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

export const createAccount = async (embedded: boolean, dispatch: (arg0: reducerAction) => void) => {
	let resp: beapi.account.CreateAccount.Reply
	try {
		resp = await accountService.createAccount({})
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
	clearClients?: any,
) => {
	if (!embedded) {
		return
	}

	if (clearClients) {
		await clearClients()
		console.log('createNewAccount: clearClients')
	}

	try {
		await closeAccountWithProgress(dispatch)
		await createAccount(embedded, dispatch)
	} catch (e) {
		console.warn('unable to close account', e)
		return
	}
}
