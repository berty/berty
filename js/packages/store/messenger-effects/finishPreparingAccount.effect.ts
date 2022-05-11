import { Dictionary } from '@reduxjs/toolkit'
import i18next from 'i18next'

import beapi from '@berty/api'
import { ServiceClientType } from '@berty/grpc-bridge/welsh-clients.gen'
import { detectOSLanguage } from '@berty/i18n'
import { MessengerState } from '@berty/redux/reducers/messenger.reducer'
import { resetTheme } from '@berty/redux/reducers/theme.reducer'
import { setStateReady, setStateSetupFinished, UiState } from '@berty/redux/reducers/ui.reducer'
import { AppDispatch } from '@berty/redux/store'
import { storageGet, storageRemove } from '@berty/utils/accounts/accountClient'
import { updateAccount } from '@berty/utils/accounts/accountUtils'
import { GlobalPersistentOptionsKeys } from '@berty/utils/persistent-options/types'

const closeConvos = async (
	client: ServiceClientType<beapi.messenger.MessengerService> | null,
	conversations: { [key: string]: beapi.messenger.IConversation | undefined },
) => {
	if (client === null) {
		console.warn('client is null')
		return
	}

	for (const conv of Object.values(conversations).filter(conv => conv?.isOpen) as any) {
		client.conversationClose({ groupPk: conv.publicKey }).catch((e: any) => {
			console.warn(`failed to close conversation "${conv.displayName}",`, e)
		})
	}
}

const updateAccountOnClients = async (
	messengerClient: ServiceClientType<beapi.messenger.MessengerService> | null,
	selectedAccount: string | null,
	account: beapi.messenger.IAccount | null | undefined,
) => {
	try {
		// remove the displayName value that was set at the creation of the account
		const displayName = await storageGet(GlobalPersistentOptionsKeys.DisplayName)
		await storageRemove(GlobalPersistentOptionsKeys.DisplayName)
		if (displayName) {
			// update account in messenger client
			await messengerClient?.accountUpdate({ displayName })
			// update account in account client
			await updateAccount({
				accountName: displayName,
				accountId: selectedAccount,
				publicKey: account?.publicKey,
			})
		}
	} catch (err) {
		console.warn(err)
	}

	// TODO: fix flow of asking permissions
	// const config = await accountService.networkConfigGet({ accountId: selectedAccount })
	// if (config.currentConfig?.staticRelay && config.currentConfig?.staticRelay[0] === ':default:') {
	// 	await servicesAuthViaURL(protocolClient, bertyOperatedServer)
	// }
}

export const finishPreparingAccount = async (
	ui: UiState,
	messenger: MessengerState,
	conversations: Dictionary<beapi.messenger.IConversation>,
	dispatch: AppDispatch,
) => {
	try {
		await closeConvos(ui.messengerClient, conversations)

		await i18next.changeLanguage(detectOSLanguage())

		if (ui.isNewAccount) {
			await updateAccountOnClients(ui.messengerClient, ui.selectedAccount, messenger.account)
			// reset ui theme
			dispatch(resetTheme())
			dispatch(setStateSetupFinished())
		} else {
			dispatch(setStateReady())
		}
	} catch (err) {
		console.warn(err)
	}
}
