import { isEqual } from 'lodash'

import beapi from '@berty-tech/api'

import { MessengerState, reducerAction } from '../types'
import { ParsedInteraction } from '../types.gen'
import { parseInteraction, pbDateToNum } from '../convert'

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
		if (!isEqual(m[i.cid], i)) {
			m[i.cid] = i
		}
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

export const eventStreamReducerActions: {
	[key: string]: (oldState: MessengerState, action: reducerAction) => MessengerState
} = {
	[beapi.messenger.StreamEvent.Type.TypeConversationUpdated]: (oldState, action) => {
		const interactionsRewrite: { [key: string]: ParsedInteraction[] } = {}

		// TODO: dig why action.payload.conversation is null
		if (!action?.payload?.conversation) {
			return {
				...oldState,
			}
		}
		if (!action?.payload?.conversation?.isOpen) {
			const newestInteraction = newestMeaningfulInteraction(
				(oldState.interactions || {})[action.payload.conversation.publicKey] || [],
			)

			if (newestInteraction) {
				interactionsRewrite[action.payload.conversation.publicKey] = [newestInteraction]
			}
		}

		let newConv = action.payload.conversation
		const prevConv = oldState.conversations[action.payload.conversation.publicKey]
		if (isEqual(prevConv, newConv)) {
			newConv = prevConv
		}

		return {
			...oldState,
			conversations: {
				...oldState.conversations,
				[action.payload.conversation.publicKey]: newConv,
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
					...((oldState.members || {})[member.conversationPublicKey] || {}),
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
		return eventStreamReducerActions[beapi.messenger.StreamEvent.Type.TypeConversationPartialLoad](
			oldState,
			{
				...action,
				payload: {
					conversationPk: action.payload.interaction.conversationPublicKey,
					interactions: [action.payload.interaction],
				},
			},
		)
	},

	[beapi.messenger.StreamEvent.Type.TypeDeviceUpdated]: (oldState, __) => {
		console.info('ignored event type TypeDeviceUpdated')
		return oldState
	},
}

export const eventStreamReducer = (
	oldState: MessengerState,
	action: reducerAction,
): MessengerState => {
	if (eventStreamReducerActions[action.type]) {
		const newState = eventStreamReducerActions[action.type](oldState, action)

		/*if (!isExpectedAppStateChange(oldState.appState, newState.appState)) {
			console.warn(`unexpected app state change from ${oldState.appState} to ${newState.appState}`)
		}*/

		return newState
	}

	console.warn('Unknown action type', action.type)
	return oldState
}
