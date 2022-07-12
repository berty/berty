import { createAsyncThunk, createEntityAdapter, createSlice, EntityState } from '@reduxjs/toolkit'
import cloneDeep from 'lodash/cloneDeep'
import Long from 'long'

import beapi from '@berty/api'
import { ParsedInteraction } from '@berty/utils/api'
import { pbDateToNum } from '@berty/utils/convert/time'
import { getDevicesForConversationAndMember } from '@berty/utils/messenger/devices'
import { parseInteraction } from '@berty/utils/messenger/interactions'

import { messengerActions } from '../messengerActions.gen'
import { RootState } from '../store'
import { selectMessengerClient } from './ui.reducer'

/**
 *
 * Types
 *
 */

const conversationsAdapter = createEntityAdapter<beapi.messenger.IConversation>({
	selectId: conversation => conversation.publicKey || '',
	sortComparer: (a, b) =>
		pbDateToNum(b.lastUpdate || b.createdDate) - pbDateToNum(a.lastUpdate || a.createdDate),
})

const conversationsSelectors = conversationsAdapter.getSelectors()

const contactsAdapter = createEntityAdapter<beapi.messenger.IContact>({
	selectId: contact => contact.publicKey || '',
})

const contactsSelectors = contactsAdapter.getSelectors()

const interactionsAdapter = createEntityAdapter<ParsedInteraction>({
	selectId: inte => inte.cid || '',
	sortComparer: (a, b) => pbDateToNum(b.sentDate) - pbDateToNum(a.sentDate),
})

export const interactionsSelectors = interactionsAdapter.getSelectors()

type InteractionsBucket = {
	conversationPublicKey: string
	interactions: EntityState<ParsedInteraction>
}

const interactionsBucketsAdapter = createEntityAdapter<InteractionsBucket>({
	selectId: bucket => bucket.conversationPublicKey,
})

const interactionsBucketsSelectors = interactionsBucketsAdapter.getSelectors()

const membersAdapter = createEntityAdapter<beapi.messenger.IMember>({
	selectId: member => member.publicKey || '',
	sortComparer: (a, b) => (a.displayName || '').localeCompare(b.displayName || ''),
})

const membersSelectors = membersAdapter.getSelectors()

type MembersBucket = {
	conversationPublicKey: string
	members: EntityState<beapi.messenger.IMember>
}

const membersBucketsAdapter = createEntityAdapter<MembersBucket>({
	selectId: bucket => bucket.conversationPublicKey,
})

const membersBucketsSelectors = membersBucketsAdapter.getSelectors()

const { selectById: selectMembersBucket } = membersBucketsAdapter.getSelectors()

// NOTE: media is already plural of medium but is used as singular, hence the 's'
const mediasAdapter = createEntityAdapter<beapi.messenger.IMedia>({
	selectId: media => media.cid || '',
})

const mediasSelectors = mediasAdapter.getSelectors()

// Peer network status
export type GroupsDevicesToPeer = {
	id: string // with groupPK-devicePK format
	peerID: string
}

export type PeerNetworkStatus = {
	id: string // PeerID
	transport: beapi.messenger.StreamEvent.PeerStatusConnected.Transport
	connectionStatus: beapi.protocol.GroupDeviceStatus.Type
}

const groupsDevicesToPeerAdapter = createEntityAdapter<GroupsDevicesToPeer>()
const groupsDevicesToPeerSelectors = groupsDevicesToPeerAdapter.getSelectors()

const peerNetworkStatusAdapter = createEntityAdapter<PeerNetworkStatus>()
const peerNetworkStatusSelectors = peerNetworkStatusAdapter.getSelectors()

export const selectGroupsDevicesToPeerDict = (state: LocalRootState) => {
	return groupsDevicesToPeerSelectors.selectEntities(selectSlice(state).groupsDevicesToPeer)
}
export const selectPeerIdFromDevicePK = (
	state: LocalRootState,
	groupPK: string,
	devicePK: string,
) => {
	const group = groupsDevicesToPeerSelectors.selectById(
		selectSlice(state).groupsDevicesToPeer,
		`${groupPK}-${devicePK}`,
	)
	if (!group) {
		return
	}
	return group?.peerID
}

export const selectPeerNetworkStatusDict = (state: LocalRootState) => {
	return peerNetworkStatusSelectors.selectEntities(selectSlice(state).peersNetworkStatus)
}
export const selectPeerFromPeerID = (state: LocalRootState, peerID: string) => {
	const peer = peerNetworkStatusSelectors.selectById(selectSlice(state).peersNetworkStatus, peerID)
	if (!peer) {
		return
	}
	return peer
}

// thunk to get a peer from a member
export const getPeerFromMemberPK = createAsyncThunk(
	'messenger/getPeerFromMemberPK',
	async (
		arg: {
			memberPK: string | null | undefined
			convPK: string | null | undefined
		},
		{ getState },
	) => {
		const { memberPK, convPK } = arg
		// typing createAsyncThunk is a nightmare 👻
		const state: RootState = getState() as any
		const messengerClient = selectMessengerClient(state)

		if (messengerClient === null) {
			console.warn('messenger client is null:', messengerClient)
			return
		}
		if (!convPK) {
			console.warn('No convPK found for memberPK:', memberPK)
			return
		}

		// recup all devices to a specific member from a group
		const devices = await getDevicesForConversationAndMember(messengerClient, convPK, memberPK)
		// for the moment we don't support multi device so only devices[0] is filled
		const devicePK = devices[0].publicKey
		if (!devicePK) {
			console.warn('No devices found for memberPK:', memberPK)
			return
		}

		const peerID = selectPeerIdFromDevicePK(state, convPK, devicePK)
		if (!peerID) {
			console.warn('No peerID found for devicePK:', devicePK)
			return
		}
		const peer = selectPeerFromPeerID(state, peerID)
		return peer
	},
)

const getEntitiesInitialState = () => ({
	conversations: conversationsAdapter.getInitialState(),
	contacts: contactsAdapter.getInitialState(),
	interactionsBuckets: interactionsBucketsAdapter.getInitialState(),
	membersBuckets: membersBucketsAdapter.getInitialState(),
	medias: mediasAdapter.getInitialState(),
	groupsDevicesToPeer: groupsDevicesToPeerAdapter.getInitialState(),
	peersNetworkStatus: peerNetworkStatusAdapter.getInitialState(),
})

export type MessengerState = ReturnType<typeof getEntitiesInitialState> & {
	account: beapi.messenger.IAccount
	// value that will set to true when messenger EventsStream finished to list events
}

const initialState: MessengerState = {
	...getEntitiesInitialState(),
	account: {},
}

/**
 *
 * State
 *
 */

const sliceName = 'messenger'

const makeRoot = <T>(val: T) => ({
	[sliceName]: val,
})

const rootInitialState = makeRoot(initialState)
type LocalRootState = typeof rootInitialState

/**
 *
 * Actions
 *
 */

const defaultDisplayName = (seed: string | null | undefined) => {
	let suffix = '1337'
	if (seed) {
		suffix = seed.substring(0, 4)
	}
	return `anon#${suffix}`
}

const slice = createSlice({
	name: 'messenger',
	initialState,
	reducers: {},
	extraReducers: builder => {
		// Peer network status reducers
		builder.addCase(
			messengerActions[beapi.messenger.StreamEvent.Type.TypePeerStatusConnected],
			(state, { payload }) => {
				if (!payload.peerId || payload.transport === undefined || payload.transport === null) {
					console.warn('PeerStatusConnected action without peerID or transport', payload)
					return
				}
				peerNetworkStatusAdapter.upsertOne(state.peersNetworkStatus, {
					id: payload.peerId,
					transport: payload.transport,
					connectionStatus: beapi.protocol.GroupDeviceStatus.Type.TypePeerConnected,
				})
			},
		)
		builder.addCase(
			messengerActions[beapi.messenger.StreamEvent.Type.TypePeerStatusDisconnected],
			(state, { payload }) => {
				if (!payload.peerId) {
					console.warn('PeerStatusDisconnected action without peerID', payload)
					return
				}
				peerNetworkStatusAdapter.removeOne(state.peersNetworkStatus, payload.peerId)
			},
		)
		builder.addCase(
			messengerActions[beapi.messenger.StreamEvent.Type.TypePeerStatusReconnecting],
			(state, { payload }) => {
				if (!payload.peerId) {
					console.warn('PeerStatusReconnecting action without peerID', payload)
					return
				}
				peerNetworkStatusAdapter.updateOne(state.peersNetworkStatus, {
					id: payload.peerId,
					changes: { connectionStatus: beapi.protocol.GroupDeviceStatus.Type.TypePeerReconnecting },
				})
			},
		)
		builder.addCase(
			messengerActions[beapi.messenger.StreamEvent.Type.TypePeerStatusGroupAssociated],
			(state, { payload }) => {
				if (!payload.peerId || !payload.groupPk || !payload.devicePk) {
					console.warn(
						'PeerStatusGroupAssociated action without peerID or groupPK or devicePK',
						payload,
					)
					return
				}
				groupsDevicesToPeerAdapter.upsertOne(state.groupsDevicesToPeer, {
					id: `${payload.groupPk}-${payload.devicePk}`,
					peerID: payload.peerId,
				})
			},
		)
		builder.addCase(
			messengerActions[beapi.messenger.StreamEvent.Type.TypeAccountUpdated],
			(state, { payload }) => {
				if (!payload.account) {
					console.warn('AccountUpdated action without account', payload)
					return
				}
				state.account = payload.account
			},
		)
		builder.addCase(
			messengerActions[beapi.messenger.StreamEvent.Type.TypeContactUpdated],
			(state, { payload }) => {
				if (!payload.contact?.publicKey) {
					console.warn('ContactUpdated action without id', payload)
					return
				}
				contactsAdapter.upsertOne(state.contacts, payload.contact)
			},
		)
		builder.addCase(
			messengerActions[beapi.messenger.StreamEvent.Type.TypeConversationUpdated],
			(state, { payload }) => {
				if (!payload.conversation?.publicKey) {
					console.warn('ConversationUpdated action without id', payload)
					return
				}

				// console.log('updating conv', payload)

				conversationsAdapter.upsertOne(state.conversations, {
					...payload.conversation,
					isOpen: !!payload.conversation.isOpen,
					unreadCount: payload.conversation.unreadCount || 0,
					mutedUntil: payload.conversation.mutedUntil || Long.fromInt(0),
				})

				const convPk = payload.conversation.publicKey

				if (!payload.conversation.isOpen) {
					const bucket = interactionsBucketsSelectors.selectById(state.interactionsBuckets, convPk)
					if (bucket) {
						const newestInteractions =
							bucket &&
							interactionsSelectors
								.selectAll(bucket.interactions)
								.filter(
									i =>
										i.type === beapi.messenger.AppMessage.Type.TypeUserMessage ||
										i.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation,
								)
								.slice(0, 10)
						if (newestInteractions) {
							let interactions = interactionsAdapter.removeAll(bucket.interactions)
							interactions = interactionsAdapter.addMany(interactions, newestInteractions)
							interactionsBucketsAdapter.updateOne(state.interactionsBuckets, {
								id: bucket.conversationPublicKey,
								changes: { interactions },
							})
						}
					}
				}
			},
		)
		builder.addCase(
			messengerActions[beapi.messenger.StreamEvent.Type.TypeMediaUpdated],
			(state, { payload }) => {
				if (!payload.media) {
					console.warn('MediaUpdated action without id', payload)
					return
				}
				mediasAdapter.upsertOne(state.medias, payload.media)
			},
		)
		builder.addCase(
			messengerActions[beapi.messenger.StreamEvent.Type.TypeMemberUpdated],
			(state, { payload }) => {
				if (
					!(payload?.member && payload.member.conversationPublicKey && payload.member.publicKey)
				) {
					console.warn('MemberUpdated action without id(s)', payload)
					return
				}

				const member = cloneDeep(payload.member)
				if (!member.displayName) {
					member.displayName = defaultDisplayName(member.publicKey)
				}

				const membersBucket = selectMembersBucket(
					state.membersBuckets,
					payload.member.conversationPublicKey,
				)

				if (!membersBucket) {
					let members = membersAdapter.getInitialState()
					members = membersAdapter.addOne(members, member)
					membersBucketsAdapter.addOne(state.membersBuckets, {
						conversationPublicKey: payload.member.conversationPublicKey,
						members,
					})
					return
				}

				membersBucketsAdapter.updateOne(state.membersBuckets, {
					id: membersBucket.conversationPublicKey,
					changes: { members: membersAdapter.upsertOne(membersBucket.members, member) },
				})
			},
		)
		builder.addCase(
			messengerActions[beapi.messenger.StreamEvent.Type.TypeInteractionDeleted],
			(state, { payload }) => {
				if (!(payload.conversationPublicKey && payload.cid)) {
					console.warn('InteractionDeleted action without id(s)', payload)
					return
				}
				const bucket = interactionsBucketsSelectors.selectById(
					state.interactionsBuckets,
					payload.conversationPublicKey,
				)
				if (!bucket) {
					return
				}
				interactionsAdapter.removeOne(bucket.interactions, payload.cid)
			},
		)
		builder.addCase(
			messengerActions[beapi.messenger.StreamEvent.Type.TypeInteractionUpdated],
			(state, { payload }) => {
				if (
					!(
						payload.interaction &&
						payload.interaction.cid &&
						payload.interaction.conversationPublicKey
					)
				) {
					console.warn('InteractionUpdated action without id(s)', payload)
					return
				}

				const bucket = interactionsBucketsSelectors.selectById(
					state.interactionsBuckets,
					payload.interaction.conversationPublicKey,
				)

				if (!bucket) {
					let interactions = interactionsAdapter.getInitialState()
					const inte = parseInteraction(payload.interaction)
					interactions = interactionsAdapter.addOne(interactions, inte)
					interactionsBucketsAdapter.addOne(state.interactionsBuckets, {
						conversationPublicKey: payload.interaction.conversationPublicKey,
						interactions: interactions,
					})
					return
				}

				const inte = parseInteraction(payload.interaction)

				interactionsBucketsAdapter.updateOne(state.interactionsBuckets, {
					id: bucket.conversationPublicKey,
					changes: {
						interactions: interactionsAdapter.upsertOne(bucket.interactions, {
							...inte,
							reactions: inte.reactions,
							outOfStoreMessage: !!inte?.outOfStoreMessage,
						}),
					},
				})
			},
		)
		builder.addCase(
			messengerActions[beapi.messenger.StreamEvent.Type.TypeConversationPartialLoad],
			(state, { payload }) => {
				if (!payload.conversationPk) {
					console.warn('ConversationPartialLoad action without id', payload)
					return
				}

				if (payload.medias) {
					mediasAdapter.upsertMany(state.medias, payload.medias)
				}

				const interactionsBucket = interactionsBucketsSelectors.selectById(
					state.interactionsBuckets,
					payload.conversationPk,
				)
				const parsedInteractions = (payload.interactions || [])
					.map(parseInteraction)
					.filter(i => i.type !== beapi.messenger.AppMessage.Type.TypeAcknowledge)

				if (!interactionsBucket) {
					let interactions = interactionsAdapter.getInitialState()
					interactions = interactionsAdapter.addMany(interactions, parsedInteractions)
					interactionsBucketsAdapter.addOne(state.interactionsBuckets, {
						conversationPublicKey: payload.conversationPk,
						interactions,
					})
					return
				}

				interactionsBucketsAdapter.updateOne(state.interactionsBuckets, {
					id: interactionsBucket.conversationPublicKey,
					changes: {
						interactions: interactionsAdapter.upsertMany(
							interactionsBucket.interactions,
							parsedInteractions,
						),
					},
				})
			},
		)
	},
})

/**
 *
 * Selectors
 *
 */

const selectSlice = (state: LocalRootState) => state[sliceName]

const emptyList: [] = []

export const selectConversationInteractions = (state: LocalRootState, convPk: string) => {
	const slice = selectSlice(state)
	const bucket = interactionsBucketsSelectors.selectById(slice.interactionsBuckets, convPk)
	if (!bucket) {
		return emptyList
	}
	return interactionsSelectors.selectAll(bucket.interactions)
}

export const selectAllInteractionsBuckets = (state: LocalRootState) => {
	const slice = selectSlice(state)
	return interactionsBucketsSelectors.selectAll(slice.interactionsBuckets)
}

const initialMembers = membersAdapter.getInitialState()

export const selectConversationMembersDict = (state: LocalRootState, convPk: string) => {
	const slice = selectSlice(state)
	const bucket = membersBucketsSelectors.selectById(slice.membersBuckets, convPk)
	return membersSelectors.selectEntities(bucket?.members || initialMembers)
}

export const selectConversationMembers = (state: LocalRootState, convPk: string) => {
	const slice = selectSlice(state)
	const bucket = membersBucketsSelectors.selectById(slice.membersBuckets, convPk)
	const result = membersSelectors.selectAll(bucket?.members || initialMembers)

	return result.sort((a, b) => {
		if (a.isMe) {
			return -1
		}
		if (b.isMe) {
			return 1
		}
		return 0
	})
}

export const selectMember = (state: LocalRootState, convPk: string, memberPk: string) => {
	const slice = selectSlice(state)
	const bucket = membersBucketsSelectors.selectById(slice.membersBuckets, convPk)
	if (!bucket) {
		return undefined
	}
	return membersSelectors.selectById(bucket?.members, memberPk)
}

export const selectConversationsDict = (state: LocalRootState) => {
	const slice = selectSlice(state)
	return conversationsSelectors.selectEntities(slice.conversations)
}

export const selectAllConversations = (state: LocalRootState) => {
	const slice = selectSlice(state)
	return conversationsSelectors.selectAll(slice.conversations)
}

export const selectConversation = (state: LocalRootState, convPk: string) =>
	conversationsSelectors.selectById(selectSlice(state).conversations, convPk)

export const selectContactsDict = (state: LocalRootState) => {
	return contactsSelectors.selectEntities(selectSlice(state).contacts)
}

export const selectAllContacts = (state: LocalRootState) => {
	return contactsSelectors.selectAll(selectSlice(state).contacts)
}

export const selectContact = (state: LocalRootState, contactPk: string) => {
	return contactsSelectors.selectById(selectSlice(state).contacts, contactPk)
}

export const selectConversationContact = (state: LocalRootState, convPk: string) => {
	const conv = selectConversation(state, convPk)
	if (!conv?.contactPublicKey) {
		return undefined
	}
	return selectContact(state, conv.contactPublicKey)
}

export const selectContactConversation = (state: LocalRootState, contactPk: string) => {
	const contact = selectContact(state, contactPk)
	if (!contact?.conversationPublicKey) {
		return undefined
	}
	return selectConversation(state, contact.conversationPublicKey)
}

export const selectMedia = (state: LocalRootState, cid: string) => {
	return mediasSelectors.selectById(selectSlice(state).medias, cid)
}

export const selectMedias = (state: LocalRootState, cids: string[]) => {
	return cids.map(cid => selectMedia(state, cid))
}

export const selectInteraction = (state: LocalRootState, convPk: string, cid: string) => {
	const bucket = interactionsBucketsSelectors.selectById(
		selectSlice(state).interactionsBuckets,
		convPk,
	)
	if (!bucket) {
		return
	}
	return interactionsSelectors.selectById(bucket.interactions, cid)
}

export const selectAccount = (state: LocalRootState) => {
	return selectSlice(state).account
}

export const selectInteractionAuthor = (state: LocalRootState, convPk: string, cid: string) => {
	const inte = selectInteraction(state, convPk, cid)
	if (!inte) {
		return
	}
	const conv = selectConversation(state, convPk)
	switch (conv?.type) {
		case beapi.messenger.Conversation.Type.MultiMemberType:
			return selectMember(state, convPk, inte.memberPublicKey || '')
		case beapi.messenger.Conversation.Type.ContactType:
			return inte.isMine ? selectAccount(state) : selectContact(state, conv.contactPublicKey || '')
	}
}

export default makeRoot(slice.reducer)
