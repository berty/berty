import pickBy from 'lodash/pickBy'
import mapValues from 'lodash/mapValues'

import beapi from '@berty-tech/api'
import { pbDateToNum } from '@berty-tech/components/helpers'

import {
	initialState,
	isExpectedAppStateChange,
	MessengerActions,
	MessengerAppState,
	MsgrState,
	reducerAction,
} from './context'
import { parseInteraction } from './utils'
import { ParsedInteraction } from './types.gen'

/*
TODO: remove the sort, @n0izn0iz and @glouvigny agreed that the best store representation should be something like
{
    sortedInteraction: []{id: string, sentAt: int},
    interactions: {[key: string]: Interaction},
}
we keep a sorted reference array to avoid sorting on every map update
but we also keep a dict of the actual states to get O(~1) on interaction updates and lookup
*/
const mergeInteractions = (existing: Array<ParsedInteraction>, toAdd: Array<ParsedInteraction>) => {
	const m = {} as { [key: string]: ParsedInteraction }
	for (const i of [...existing, ...toAdd]) {
		if (!i.conversationPublicKey || !i.cid) {
			continue
		}
		m[i.cid] = i
	}
	const l = Object.values(m)
	return sortInteractions(l)
}

const applyAcksToInteractions = (interactions: ParsedInteraction[], acks: ParsedInteraction[]) => {
	for (let ack of acks) {
		const found = interactions.find(value => value.cid === ack.targetCid)
		if (found === undefined) {
			continue
		}

		found.acknowledged = true
	}

	return interactions
}

const sortInteractions = (interactions: ParsedInteraction[]) =>
	interactions.sort((a, b) => pbDateToNum(b.sentDate) - pbDateToNum(a.sentDate))

const parseInteractions = (rawInteractions: beapi.messenger.Interaction[]) =>
	rawInteractions.map(parseInteraction).filter((i: ParsedInteraction) => i.payload !== undefined)

const newestMeaningfulInteraction = (interactions: ParsedInteraction[]) =>
	interactions.find(i => i.type === beapi.messenger.AppMessage.Type.TypeUserMessage)

export const reducerActions: {
	[key: string]: (oldState: MsgrState, action: reducerAction) => MsgrState
} = {
	[beapi.messenger.StreamEvent.Type.TypeConversationUpdated]: (oldState, action) => {
		const interactionsRewrite: { [key: string]: ParsedInteraction[] } = {}

		if (!action.payload.conversation.isOpen) {
			const newestInteraction = newestMeaningfulInteraction(
				oldState.interactions[action.payload.conversation.publicKey] || [],
			)

			if (newestInteraction) {
				interactionsRewrite[action.payload.conversation.publicKey] = [newestInteraction]
			}
		}

		return {
			...oldState,
			conversations: {
				...oldState.conversations,
				[action.payload.conversation.publicKey]: action.payload.conversation,
			},
			interactions: {
				...oldState.interactions,
				...interactionsRewrite,
			},
		}
	},

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

	[beapi.messenger.StreamEvent.Type.TypeInteractionDeleted]: (oldState, _) => {
		// const { [action.payload.cid]: _, ...withoutDeletedInteraction } = oldState.interactions
		// previous code was likely failing
		// TODO: add relevant conversation to payload along cid

		return {
			...oldState,
			interactions: {
				...oldState.interactions,
			},
		}
	},

	[beapi.messenger.StreamEvent.Type.TypeListEnded]: (oldState, _) => ({
		...oldState,
		initialListComplete: true,
	}),

	[beapi.messenger.StreamEvent.Type.TypeConversationPartialLoad]: (oldState, action) => {
		const gpk = action.payload.conversationPk
		const rawInteractions: Array<beapi.messenger.Interaction> = action.payload.interactions || []
		const medias: Array<beapi.messenger.Media> = action.payload.medias || []

		const interactions = sortInteractions(parseInteractions(rawInteractions))
		const mergedInteractions = mergeInteractions(
			oldState.interactions[gpk] || [],
			interactions.filter(i => i.type !== beapi.messenger.AppMessage.Type.TypeAcknowledge),
		)

		const ackInteractions = interactions.filter(
			i => i.type === beapi.messenger.AppMessage.Type.TypeAcknowledge,
		)

		return {
			...oldState,
			interactions: {
				...oldState.interactions,
				[gpk]: applyAcksToInteractions(mergedInteractions, ackInteractions),
			},
			medias: {
				...oldState.medias,
				...medias.reduce<{ [key: string]: beapi.messenger.Media }>(
					(all, m) => ({
						...all,
						[m.cid]: m,
					}),
					{},
				),
			},
		}
	},

	[beapi.messenger.StreamEvent.Type.TypeInteractionUpdated]: (oldState, action) => {
		return reducerActions[beapi.messenger.StreamEvent.Type.TypeConversationPartialLoad](oldState, {
			...action,
			payload: {
				conversationPk: action.payload.interaction.conversationPublicKey,
				interactions: [action.payload.interaction],
			},
		})
	},

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
			return reducer(ret, { type: MessengerActions.SetStateOpening })
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

		return reducer(ret, { type: MessengerActions.SetStateClosed })
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
				inh => inh != action.payload.inhibitor,
			),
		}
	},

	[beapi.messenger.StreamEvent.Type.TypeDeviceUpdated]: (oldState, __) => {
		console.info('ignored event type TypeDeviceUpdated')
		return oldState
	},

	[MessengerActions.SetCreatedAccount]: (oldState, action) => {
		return reducer(
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
