import { MessengerActions, MessengerState, reducerAction } from '../types'

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
			// conversations: { ...oldState.conversations, ...action.payload.conversations },
			// contacts: { ...oldState.contacts, ...action.payload.contacts },
			// interactions: { ...oldState.interactions, ...fakeInteractions },
			// members: { ...oldState.members, ...action.payload.members },
		}
	},

	[MessengerActions.DeleteFakeData]: (oldState, _) => ({
		...oldState,
		// conversations: pickBy(oldState.conversations, conv => !(conv as any).fake),
		// contacts: pickBy(oldState.contacts, contact => !(contact as any).fake),
		// TODO:
		// interactions: mapValues(oldState.interactions, (intes) =>
		// 	pickBy(intes, (inte) => !(inte as any).fake),
		// ),
		/*members: mapValues(oldState.members, members =>
			pickBy(members, member => !(member as any).fake),
		),*/
	}),

	[MessengerActions.SetDaemonAddress]: (oldState, action) => ({
		...oldState,
		daemonAddress: action.payload.value,
	}),

	[MessengerActions.SetPersistentOption]: (oldState, action) => ({
		...oldState,
		persistentOptions: action.payload,
	}),
	[MessengerActions.SetAccounts]: (oldState, action) => ({
		...oldState,
		accounts: action.payload,
	}),
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
}
