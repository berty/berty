import { Dictionary } from '@reduxjs/toolkit'

import beapi from '@berty/api'
import {
	ServiceClientType,
	WelshMessengerServiceClient,
} from '@berty/grpc-bridge/welsh-clients.gen'
import { resetTheme } from '@berty/redux/reducers/theme.reducer'
import { setIsNewAccount, setStateReady } from '@berty/redux/reducers/ui.reducer'
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

	// TODO: fix flow of asking permissions
	// const config = await accountService.networkConfigGet({ accountId: selectedAccount })
	// if (config.currentConfig?.staticRelay && config.currentConfig?.staticRelay[0] === ':default:') {
	// 	await servicesAuthViaURL(protocolClient, bertyOperatedServer)
	// }
}

export const prepareAccount = async (
	isNewAccount: boolean,
	messengerClient: WelshMessengerServiceClient | null,
	selectedAccount: string | null,
	account: beapi.messenger.IAccount,
	conversations: Dictionary<beapi.messenger.IConversation>,
	dispatch: AppDispatch,
	navigate: any,
) => {
	// messenger service keep conversations open on restart, so we close all after open app
	await closeConvos(messengerClient, conversations)

	console.log('prepare Account isNewAccount', isNewAccount)
	if (isNewAccount) {
		await updateAccountOnClients(messengerClient, selectedAccount, account)
		// reset ui theme
		dispatch(resetTheme())
		dispatch(setStateReady())
		navigate('Onboarding.SetupFinished')
	} else {
		dispatch(setIsNewAccount(false))
		dispatch(setStateReady())
		navigate('Chat.Home')
	}
}
