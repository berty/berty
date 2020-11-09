import { messenger as messengerpb } from '@berty-tech/api'
import {
	initialState,
	isExpectedAppStateChange,
	MessengerActions,
	MessengerAppState,
	MsgrState,
} from '@berty-tech/store/context'
import pickBy from 'lodash/pickBy'
import mapValues from 'lodash/mapValues'
import { berty } from '@berty-tech/api/index.pb'

export declare type reducerAction = {
	type: berty.messenger.v1.StreamEvent.Type | MessengerActions
	payload?: any
	name?: string
}

export const reducerActions: {
	[key: string]: (oldState: MsgrState, action: reducerAction) => MsgrState
} = {
	[messengerpb.StreamEvent.Type.TypeConversationUpdated]: (oldState, action) => ({
		...oldState,
		conversations: {
			...oldState.conversations,
			[action.payload.conversation.publicKey]: action.payload.conversation,
		},
	}),

	[messengerpb.StreamEvent.Type.TypeAccountUpdated]: (oldState, action) => ({
		...oldState,
		account: action.payload.account,
	}),

	[messengerpb.StreamEvent.Type.TypeContactUpdated]: (oldState, action) => ({
		...oldState,
		contacts: {
			...oldState.contacts,
			[action.payload.contact.publicKey]: action.payload.contact,
		},
	}),

	[messengerpb.StreamEvent.Type.TypeMemberUpdated]: (oldState, action) => {
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

	[messengerpb.StreamEvent.Type.TypeInteractionDeleted]: (oldState, action) => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { [action.payload.cid]: _, ...withoutDeletedInteraction } = oldState.interactions

		return {
			...oldState,
			interactions: withoutDeletedInteraction,
		}
	},

	[messengerpb.StreamEvent.Type.TypeListEnded]: (oldState, _) => ({
		...oldState,
		initialListComplete: true,
	}),

	[messengerpb.StreamEvent.Type.TypeInteractionUpdated]: (oldState, action) => {
		try {
			const inte = action.payload.interaction
			const gpk = inte.conversationPublicKey
			const typeName = Object.keys(messengerpb.AppMessage.Type).find(
				(name) => messengerpb.AppMessage.Type[name] === inte.type,
			)
			const name = typeName?.substr('Type'.length)
			const pbobj = messengerpb.AppMessage[name]
			if (!pbobj) {
				throw new Error('failed to find a protobuf object matching the event type')
			}
			inte.name = name
			inte.payload = pbobj.decode(inte.payload).toJSON()
			console.log('jsoned payload', inte.payload)
			console.log('received inte', inte)

			if (inte.type === messengerpb.AppMessage.Type.TypeAcknowledge) {
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

	[MessengerActions.SetPersistentOption]: (oldState, action) => {
		return {
			...oldState,
			persistentOptions: action.payload,
		}
	},

	[MessengerActions.SetStateOpeningListingEvents]: (oldState, action) => ({
		...oldState,
		client: action.payload.messengerClient || oldState.client,
		protocolClient: action.payload.protocolClient || oldState.protocolClient,
		clearClients: action.payload.unmountClients || oldState.clearClients,
		appState: MessengerAppState.OpeningListingEvents,
	}),

	[MessengerActions.SetStateClosed]: (oldState, _) => {
		const ret = {
			...initialState,
			embedded: oldState.embedded,
			daemonAddress: oldState.daemonAddress,
			appState: MessengerAppState.Closed,
			nextSelectedAccount: 0,
			// TODO: multi-account and/or logged-out state
			// nextSelectedAccount: oldState.embedded ? oldState.nextSelectedAccount : 0,
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
		}

		if (oldState.appState === MessengerAppState.Closed) {
			return reducer(ret, { type: MessengerActions.SetStateOpening })
		}

		return ret
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

	[MessengerActions.SetStateOpeningClients]: (oldState, action) => ({
		...oldState,
		appState: MessengerAppState.OpeningWaitingForClients,
		clearDaemon: action.payload.clearDaemon || oldState.clearDaemon,
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
			!oldState.account || !oldState.account.displayName
				? MessengerAppState.GetStarted
				: MessengerAppState.Ready,
	}),

	[MessengerActions.SetStateClosing]: (oldState, _) => {
		if (!oldState.embedded) {
			return oldState
		}

		return {
			...oldState,
			appState:
				oldState.appState === MessengerAppState.OpeningWaitingForDaemon
					? MessengerAppState.Closed
					: MessengerAppState.ClosingDaemon,
			clearDaemon: null,
			clearClients: null,
		}
	},

	[MessengerActions.Restart]: (oldState, _) => {
		if (!oldState.embedded) {
			return oldState
		}

		if (oldState.appState === MessengerAppState.ClosingDaemon) {
			return reducer(oldState, { type: MessengerActions.SetStateClosed })
		}

		return {
			...oldState,
			nextSelectedAccount: oldState.selectedAccount,
			appState: MessengerAppState.ClosingDaemon,
			clearDaemon: null,
			clearClients: null,
		}
	},

	[MessengerActions.SetStateDeleting]: (oldState, _) => {
		return {
			...oldState,
			appState:
				oldState.selectedAccount === null
					? MessengerAppState.Closed
					: oldState.embedded
					? MessengerAppState.DeletingClosingDaemon
					: MessengerAppState.DeletingClearingStorage,
			clearDaemon: null,
			clearClients: null,
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

		return reducer(oldState, { type: MessengerActions.SetStateClosed })
	},

	[messengerpb.StreamEvent.Type.TypeDeviceUpdated]: (oldState, __) => {
		console.info('ignored event type TypeDeviceUpdated')
		return oldState
	},
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
