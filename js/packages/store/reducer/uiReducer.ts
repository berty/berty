import pickBy from 'lodash/pickBy'
import mapValues from 'lodash/mapValues'

import { initialState, isExpectedAppStateChange } from '../context'
import { MessengerAppState, MessengerActions, MessengerState, reducerAction } from '../types'

export const uiReducerActions: {
	[key: string]: (oldState: MessengerState, action: reducerAction) => MessengerState
} = {
	[MessengerActions.SetStreamError]: (oldState, action) => ({
		...oldState,
		streamError: action.payload.error,
	}),

	[MessengerActions.AddFakeData]: (oldState, action) => {
		let fakeInteractions: { [key: string]: any[] } = {}
		for (const inte of action.payload.interactions || []) {
			if (!fakeInteractions[inte.conversationPublicKey]) {
				fakeInteractions[inte.conversationPublicKey] = []

				fakeInteractions[inte.conversationPublicKey].push(inte)
			}
		}

		return {
			...oldState,
			conversations: { ...oldState.conversations, ...action.payload.conversations },
			contacts: { ...oldState.contacts, ...action.payload.contacts },
			interactions: { ...oldState.interactions, ...fakeInteractions },
			members: { ...oldState.members, ...action.payload.members },
		}
	},

	[MessengerActions.DeleteFakeData]: (oldState, _) => ({
		...oldState,
		conversations: pickBy(oldState.conversations, conv => !(conv as any).fake),
		contacts: pickBy(oldState.contacts, contact => !(contact as any).fake),
		// TODO:
		// interactions: mapValues(oldState.interactions, (intes) =>
		// 	pickBy(intes, (inte) => !(inte as any).fake),
		// ),
		members: mapValues(oldState.members, members =>
			pickBy(members, member => !(member as any).fake),
		),
	}),

	[MessengerActions.SetDaemonAddress]: (oldState, action) => ({
		...oldState,
		daemonAddress: action.payload.value,
	}),

	[MessengerActions.SetPersistentOption]: (oldState, action) => ({
		...oldState,
		persistentOptions: action.payload,
	}),

	[MessengerActions.SetStateOpeningListingEvents]: (oldState, action) => ({
		...oldState,
		client: action.payload.messengerClient || oldState.client,
		protocolClient: action.payload.protocolClient || oldState.protocolClient,
		clearClients: action.payload.clearClients || oldState.clearClients,
		appState: MessengerAppState.OpeningListingEvents,
	}),

	[MessengerActions.SetStateClosed]: (oldState, _) => {
		const ret = {
			...initialState,
			accounts: oldState.accounts,
			embedded: oldState.embedded,
			daemonAddress: oldState.daemonAddress,
			appState: MessengerAppState.Closed,
			nextSelectedAccount: oldState.embedded ? oldState.nextSelectedAccount : '0',
		}

		if (ret.nextSelectedAccount !== null) {
			return uiReducer(ret, { type: MessengerActions.SetStateOpening })
		}

		return ret
	},

	[MessengerActions.SetNextAccount]: (oldState, action) => {
		if (action.payload === null || action.payload === undefined || !oldState.embedded) {
			return oldState
		}

		const ret = {
			...oldState,
			nextSelectedAccount: action.payload,
		}

		return uiReducer(ret, { type: MessengerActions.SetStateClosed })
	},

	[MessengerActions.SetStateOpening]: (oldState, _action) => {
		if (oldState.nextSelectedAccount === null) {
			return oldState
		}
		return {
			...oldState,
			selectedAccount: oldState.nextSelectedAccount,
			nextSelectedAccount: null,
			appState: oldState.embedded
				? MessengerAppState.OpeningWaitingForDaemon
				: MessengerAppState.OpeningWaitingForClients,
		}
	},

	[MessengerActions.SetStateOpeningClients]: (oldState, _action) => ({
		...oldState,
		appState: MessengerAppState.OpeningWaitingForClients,
	}),

	[MessengerActions.SetStateOpeningGettingLocalSettings]: (oldState, _action) => ({
		...oldState,
		appState: MessengerAppState.OpeningGettingLocalSettings,
	}),

	[MessengerActions.SetStateOpeningMarkConversationsClosed]: (oldState, _) => ({
		...oldState,
		appState: MessengerAppState.OpeningMarkConversationsAsClosed,
	}),

	[MessengerActions.SetStatePreReady]: (oldState, _) => ({
		...oldState,
		appState: MessengerAppState.PreReady,
	}),

	[MessengerActions.SetStateReady]: (oldState, _) => {
		return {
			...oldState,
			appState: MessengerAppState.Ready,
		}
	},

	[MessengerActions.SetAccounts]: (oldState, action) => ({
		...oldState,
		accounts: action.payload,
	}),

	[MessengerActions.BridgeClosed]: (oldState, _) => {
		if (oldState.appState === MessengerAppState.DeletingClosingDaemon) {
			return {
				...oldState,
				appState: MessengerAppState.DeletingClearingStorage,
			}
		}
		return uiReducer(oldState, { type: MessengerActions.SetStateClosed })
	},

	[MessengerActions.AddNotificationInhibitor]: (oldState, action) => {
		if (oldState.notificationsInhibitors.includes(action.payload.inhibitor)) {
			return oldState
		}
		return {
			...oldState,
			notificationsInhibitors: [...oldState.notificationsInhibitors, action.payload.inhibitor],
		}
	},

	[MessengerActions.RemoveNotificationInhibitor]: (oldState, action) => {
		if (!oldState.notificationsInhibitors.includes(action.payload.inhibitor)) {
			return oldState
		}
		return {
			...oldState,
			notificationsInhibitors: oldState.notificationsInhibitors.filter(
				inh => inh !== action.payload.inhibitor,
			),
		}
	},

	[MessengerActions.SetCreatedAccount]: (oldState, action) => {
		return uiReducer(
			{
				...oldState,
				nextSelectedAccount: action?.payload?.accountId,
				appState: MessengerAppState.OpeningWaitingForClients,
			},
			{ type: MessengerActions.SetStateClosed },
		)
	},

	[MessengerActions.SetStateStreamInProgress]: (oldState, action) => ({
		...oldState,
		streamInProgress: action.payload,
	}),

	[MessengerActions.SetStateStreamDone]: (oldState, _) => ({
		...oldState,
		appState: MessengerAppState.StreamDone,
		streamInProgress: null,
	}),
	[MessengerActions.SetStateOnBoardingReady]: (oldState, _) => ({
		...oldState,
		appState: MessengerAppState.GetStarted,
	}),
	[MessengerActions.SetConvsTextInputValue]: (oldState, action) => ({
		...oldState,
		convsTextInputValue: {
			...oldState.convsTextInputValue,
			[action.payload.key]: action.payload.value,
		},
	}),
}

export const uiReducer = (oldState: MessengerState, action: reducerAction): MessengerState => {
	if (uiReducerActions[action.type]) {
		const newState = uiReducerActions[action.type](oldState, action)

		if (!isExpectedAppStateChange(oldState.appState, newState.appState)) {
			console.warn(`unexpected app state change from ${oldState.appState} to ${newState.appState}`)
		}

		return newState
	}

	console.warn('Unknown action type', action.type)
	return oldState
}
