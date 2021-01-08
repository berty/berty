import pickBy from 'lodash/pickBy'
import mapValues from 'lodash/mapValues'

import beapi from '@berty-tech/api'
import {
	initialState,
	isExpectedAppStateChange,
	MessengerActions,
	MessengerAppState,
	MsgrState,
} from './context'

export declare type reducerAction = {
	type: beapi.messenger.StreamEvent.Type | MessengerActions
	payload?: any
	name?: string
}

export const reducerActions: {
	[key: string]: (oldState: MsgrState, action: reducerAction) => MsgrState
} = {
	[beapi.messenger.StreamEvent.Type.TypeConversationUpdated]: (oldState, action) => ({
		...oldState,
		conversations: {
			...oldState.conversations,
			[action.payload.conversation.publicKey]: action.payload.conversation,
		},
	}),

	[beapi.messenger.StreamEvent.Type.TypeAccountUpdated]: (oldState, action) => ({
		...oldState,
		account: action.payload.account,
	}),

	[beapi.messenger.StreamEvent.Type.TypeContactUpdated]: (oldState, action) => ({
		...oldState,
		contacts: {
			...oldState.contacts,
			[action.payload.contact.publicKey]: action.payload.contact,
		},
	}),

	[beapi.messenger.StreamEvent.Type.TypeMediaUpdated]: (oldState, action) => ({
		...oldState,
		medias: {
			...oldState.medias,
			[action.payload.media.cid]: action.payload.media,
		},
	}),

	[beapi.messenger.StreamEvent.Type.TypeMemberUpdated]: (oldState, action) => {
		const member = action.payload.member

		return {
			...oldState,
			members: {
				...oldState.members,
				[member.conversationPublicKey]: {
					...(oldState.members[member.conversationPublicKey] || {}),
					[member.publicKey]: member,
				},
			},
		}
	},

	[beapi.messenger.StreamEvent.Type.TypeInteractionDeleted]: (oldState, action) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { [action.payload.cid]: _, ...withoutDeletedInteraction } = oldState.interactions

		return {
			...oldState,
			interactions: withoutDeletedInteraction,
		}
	},

	[beapi.messenger.StreamEvent.Type.TypeListEnded]: (oldState, _) => ({
		...oldState,
		initialListComplete: true,
	}),

	[beapi.messenger.StreamEvent.Type.TypeInteractionUpdated]: (oldState, action) => {
		try {
			const inte = action.payload.interaction
			const gpk = inte.conversationPublicKey
			const typeName = Object.keys(beapi.messenger.AppMessage.Type).find(
				(name) => beapi.messenger.AppMessage.Type[name as any] === inte.type,
			)
			const name = typeName?.substr('Type'.length)
			const pbobj = (beapi.messenger.AppMessage as any)[name as any]
			if (!pbobj) {
				throw new Error('failed to find a protobuf object matching the event type')
			}
			inte.name = name

			inte.payload = pbobj.decode(inte.payload)
			console.log('jsoned payload', inte.payload)
			console.log('received inte', inte)

			if (inte.type === beapi.messenger.AppMessage.Type.TypeAcknowledge) {
				if ((oldState.interactions[gpk] || {})[inte.payload.target]) {
					return {
						...oldState,
						interactions: {
							...oldState.interactions,
							[gpk]: {
								...(oldState.interactions[gpk] || {}),
								[inte.payload.target]: {
									...(oldState.interactions[gpk] || {})[inte.payload.target],
									acknowledged: true,
								},
							},
						},
					}
				}
			}

			return {
				...oldState,
				interactions: {
					...oldState.interactions,
					[gpk]: {
						...(oldState.interactions[gpk] || {}),
						[inte.cid]: inte,
					},
				},
			}
		} catch (e) {
			console.warn('failed to reduce interaction', e)
			return oldState
		}
	},

	[MessengerActions.SetStreamError]: (oldState, action) => ({
		...oldState,
		streamError: action.payload.error,
	}),

	[MessengerActions.AddFakeData]: (oldState, action) => {
		let fakeInteractions: { [key: string]: { [key: string]: any } } = {}
		for (const inte of action.payload.interactions || []) {
			if (!fakeInteractions[inte.conversationPublicKey]) {
				fakeInteractions[inte.conversationPublicKey] = {}
			}
			fakeInteractions[inte.conversationPublicKey][inte.cid] = inte
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
		conversations: pickBy(oldState.conversations, (conv) => !(conv as any).fake),
		contacts: pickBy(oldState.contacts, (contact) => !(contact as any).fake),
		interactions: mapValues(oldState.interactions, (intes) =>
			pickBy(intes, (inte) => !(inte as any).fake),
		),
		members: mapValues(oldState.members, (members) =>
			pickBy(members, (member) => !(member as any).fake),
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
		let accountSelected: any = null
		Object.values(oldState.accounts).forEach((account) => {
			if (!accountSelected) {
				accountSelected = account
			} else if (accountSelected && accountSelected.lastOpened < account.lastOpened) {
				accountSelected = account
			}
		})

		const ret = {
			...initialState,
			accounts: oldState.accounts,
			embedded: oldState.embedded,
			daemonAddress: oldState.daemonAddress,
			appState: MessengerAppState.Closed,
			nextSelectedAccount: oldState.embedded ? oldState.nextSelectedAccount : '0',
		}

		if (ret.nextSelectedAccount !== null) {
			return reducer(ret, { type: MessengerActions.SetStateOpening })
		}

		return ret
	},

	[MessengerActions.SetStateOnBoarding]: (oldState, _) => ({
		...oldState,
		appState: oldState.account ? MessengerAppState.OnBoarding : oldState.appState,
	}),

	[MessengerActions.SetNextAccount]: (oldState, action) => {
		if (
			action.payload === null ||
			action.payload === undefined ||
			!oldState.embedded ||
			action.payload === oldState.selectedAccount
		) {
			return oldState
		}

		const ret = {
			...oldState,
			nextSelectedAccount: action.payload,
			isNewAccount: false,
		}

		if (oldState.appState === MessengerAppState.Init) {
			return reducer(ret, { type: MessengerActions.SetStateOpening })
		}

		return reducer(ret, { type: MessengerActions.SetStateOpeningClients })
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

	[MessengerActions.SetStateReady]: (oldState, _) => ({
		...oldState,
		appState:
			!oldState.account || !oldState.account.displayName || oldState.isNewAccount
				? MessengerAppState.GetStarted
				: MessengerAppState.Ready,
		isNewAccount: null,
	}),

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
		return reducer(oldState, { type: MessengerActions.SetStateClosed })
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
				(inh) => inh != action.payload.inhibitor,
			),
		}
	},

	[beapi.messenger.StreamEvent.Type.TypeDeviceUpdated]: (oldState, __) => {
		console.info('ignored event type TypeDeviceUpdated')
		return oldState
	},

	[MessengerActions.SetCreatedAccount]: (oldState, action) => ({
		...oldState,
		selectedAccount: action?.payload?.accountId,
		isNewAccount: true,
		appState: MessengerAppState.OpeningWaitingForClients,
	}),

	[MessengerActions.SetStateStreamInProgress]: (oldState, action) => ({
		...oldState,
		streamInProgress: action.payload,
	}),

	[MessengerActions.SetStateStreamDone]: (oldState, _) => ({
		...oldState,
		appState: MessengerAppState.StreamDone,
		streamInProgress: null,
	}),
}

export const reducer = (oldState: MsgrState, action: reducerAction): MsgrState => {
	if (reducerActions[action.type]) {
		const newState = reducerActions[action.type](oldState, action)

		if (!isExpectedAppStateChange(oldState.appState, newState.appState)) {
			console.warn(`unexpected app state change from ${oldState.appState} to ${newState.appState}`)
		}

		return newState
	}

	console.warn('Unknown action type', action.type)
	return oldState
}
