import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, select, takeEvery, put, call, take } from 'redux-saga/effects'
import * as protocol from '../protocol'
import { berty } from '@berty-tech/api'
import { AppMessageType } from './AppMessage'
import { makeDefaultCommandsSagas, strToBuf, bufToStr, bufToJSON, createCommands } from '../utils'
import { commands as groupsCommands } from '../groups'
import {
	ConversationKind,
	transactions as conversationTransactions,
	queries as conversationQueries,
	events as conversationEvents,
} from './conversation'

export const ContactRequestType = {
	Incoming: 'Incoming',
	Outgoing: 'Outgoing',
}

const initialState = {
	entities: {},
}

const commandsSlice = createCommands('messenger/contact/command', initialState, [
	'acceptRequest',
	'discardRequest',
	'delete',
	'deleteAll',
	'initiateRequest',
])

const eventHandler = createSlice({
	name: 'messenger/contact/event',
	initialState,
	reducers: {
		deleted: (state, { payload: { contactPk } }) => {
			delete state.entities[contactPk]
			return state
		},
		outgoingContactRequestAccepted: (state, { payload: { contactPk } }) => {
			const contact = state.entities[contactPk]
			if (contact && contact.request.type === ContactRequestType.Outgoing) {
				contact.request.accepted = true
			}
			return state
		},
		outgoingContactRequestEnqueued: (state, { payload }) => {
			const { contactPk, groupPk, metadata, addedDate, uid } = payload
			if (!contactPk) {
				return state
			}
			if (!state.entities[contactPk]) {
				state.entities[contactPk] = {
					id: contactPk,
					name: metadata.name,
					publicKey: contactPk,
					groupPk,
					request: {
						type: ContactRequestType.Outgoing,
						accepted: false,
						discarded: false,
						state: 'enqueued',
						uid,
					},
					addedDate,
				}
			}
			return state
		},
		outgoingContactRequestSent: (state, { payload: { id, date, groupPk } }) => {
			const contact = state.entities[id]
			if (!contact || contact.request.type !== ContactRequestType.Outgoing) {
				return state
			}
			contact.request = { ...contact.request, state: 'sent', sentDate: date }
			if (!contact.groupPk) {
				contact.groupPk = groupPk
			}
			return state
		},
		created: (state, { payload }) => {
			const { id } = payload
			if (!state.entities[id]) {
				state.entities[id] = payload
			}
			return state
		},
		requestInitiated: (state, { payload: { bertyId, error, now } }) => {
			try {
				if (!bertyId || error) {
					throw error || new Error('Unknown.')
				}
				if (!(bertyId.accountPk && bertyId.publicRendezvousSeed)) {
					throw new Error('Invalid payload.')
				}
				const contactPk = bufToStr(bertyId.accountPk)
				if (state.entities[contactPk]) {
					throw new Error('Contact already added.')
				}
				const name = bertyId.displayName || 'anon#1337'
				state.requestDraft = {
					contactId: contactPk,
					contactName: name,
					contactRdvSeed: bufToStr(bertyId.publicRendezvousSeed),
					contactPublicKey: contactPk,
				}
				state.entities[contactPk] = {
					id: contactPk,
					name,
					publicKey: contactPk,
					request: {
						type: ContactRequestType.Outgoing,
						accepted: false,
						discarded: false,
						state: 'initiated',
					},
					addedDate: now,
				}
			} catch (e) {
				state.requestDraft = {
					error: e.toString(),
				}
			}
			return state
		},
		draftReset: (state) => {
			delete state.requestDraft
			return state
		},
		incomingContactRequestAccepted: (state, action) => {
			const {
				payload: { contactPk, groupPk },
			} = action
			const contact = state.entities[contactPk]
			if (contact && contact.request.type === ContactRequestType.Incoming) {
				contact.request.accepted = true
				contact.groupPk = groupPk
			}
			return state
		},
		requestAccepted: (state, { payload }) => {
			const contact = state.entities[payload.id]
			if (contact) {
				contact.request.accepted = true
			}
			return state
		},
	},
	extraReducers: {
		[protocol.events.client.accountContactRequestIncomingDiscarded.type]: (state, { payload }) => {
			const {
				event: { contactPk },
			} = payload
			const contact = state.entities[bufToStr(contactPk)]
			if (contact && contact.request.type === ContactRequestType.Incoming) {
				contact.request.discarded = true
			}
			return state
		},
		deleted: (state, { payload }) => {
			delete state.entities[payload.aggregateId]
			return state
		},
	},
})

export const reducer = composeReducers(commandsSlice.reducer, eventHandler.reducer)
export const commands = commandsSlice.actions
export const events = eventHandler.actions
export const queries = {
	list: (state) => Object.values(state.messenger.contact.entities),
	get: (state, { id }) => state.messenger.contact.entities[id],
	getRequestDraft: (state) => state.messenger.contact.requestDraft,
	getLength: (state) => queries.list(state).length,
	search: (state, { searchText }) =>
		searchText
			? queries
					.list(state)
					.filter((contact) => contact.name.toLowerCase().includes(searchText.toLowerCase()))
			: [],
	getWithId: (state, { contactPk }) => state.messenger.contact.entities[bufToStr(contactPk)],
}

export const transactions = {
	delete: function* ({ id }) {
		const contact = yield* getContact(id)
		if (contact) {
			const groupPk = yield* contactPkToGroupPk({ contactPk: contact.publicKey })
			if (groupPk) {
				const gpkStr = bufToStr(groupPk)
				if (gpkStr) {
					yield put(
						groupsCommands.unsubscribe({
							publicKey: gpkStr,
							metadata: true,
							messages: true,
						}),
					)
				}
			}
			const convs = yield select((state) => conversationQueries.list(state))
			const idsToDelete = convs
				.filter((c) => c.kind === ConversationKind.OneToOne && c.contactId === id)
				.map((c) => c.id)
			for (const i of idsToDelete) {
				yield call(conversationTransactions.delete, { id: i })
			}
			yield put(events.deleted({ contactPk: contact.publicKey }))
		}
	},
	acceptRequest: function* ({ id }) {
		const contact = yield select((state: GlobalState) => queries.get(state, { id }))
		if (!contact) {
			return
		}
		yield put(
			protocol.commands.client.contactRequestAccept({
				contactPk: strToBuf(contact.publicKey),
			}),
		)
	},
	discardRequest: function* ({ id }) {
		const contact = yield select((state: GlobalState) => queries.get(state, { id }))
		if (!contact) {
			return
		}
		const contactPk = strToBuf(contact.publicKey)
		yield call(protocol.client.transactions.contactBlock, { contactPk })
		while (true) {
			const { payload } = yield take(events.deleted)
			if (payload.contactPk === contact.publicKey) {
				yield call(protocol.client.transactions.contactUnblock, { contactPk })
				break
			}
		}
	},
	deleteAll: function* () {
		const contacts = yield select(queries.list)
		for (const contact of contacts) {
			yield* transactions.delete({ id: contact.id })
		}
	},
	initiateRequest: function* ({ url }) {
		try {
			const data = yield call(protocol.client.transactions.parseDeepLink, {
				link: url,
			})
			if (!(data && data.bertyId && data.bertyId.accountPk)) {
				throw new Error('Internal: Invalid node response.')
			}
			const client = yield select(protocol.queries.client.get)
			if (!client) {
				return
			}
			const contactPk = bufToStr(data.bertyId.accountPk)
			if (contactPk === client.accountPk) {
				throw new Error("Can't send a contact request to yourself.")
			}
			const contacts = yield select((state) => queries.list(state))
			if (contacts.find((c) => c.publicKey === contactPk)) {
				throw new Error('Contact already added.')
			}
			yield put(events.requestInitiated({ bertyId: data.bertyId, now: Date.now() }))
		} catch (e) {
			if (e.name === 'GRPCError') {
				yield put(
					events.requestInitiated({
						error: new Error('Corrupted deep link.'),
						now: Date.now(),
					}),
				)
			} else {
				yield put(events.requestInitiated({ error: e.toString(), now: Date.now() }))
			}
		}
	},
}

export function* getContact(id: string | Uint8Array) {
	return yield select((state: GlobalState) =>
		queries.get(state, { id: typeof id === 'string' ? id : bufToStr(id) }),
	)
}

export function* contactPkToGroupPk({ contactPk }) {
	try {
		const groupInfo = yield call(protocol.transactions.client.groupInfo, {
			contactPk: typeof contactPk === 'string' ? strToBuf(contactPk) : contactPk,
		})
		const { group } = groupInfo
		if (!group) {
			return
		}
		const { publicKey: groupPk } = group
		return groupPk || undefined
	} catch (e) {
		console.warn(e)
	}
}

export function* orchestrator() {
	yield all([
		...makeDefaultCommandsSagas(commands, transactions),
		takeEvery(protocol.events.client.accountContactRequestOutgoingEnqueued, function* (action) {
			const contactPk = action.payload.event.contact.pk
			if (!contactPk) {
				throw new Error('No contact pk in AccountContactRequestOutgoingEnqueued')
			}
			const groupPk = yield* contactPkToGroupPk({ contactPk })
			if (!groupPk) {
				return
			}
			const contactPkStr = bufToStr(contactPk)
			const groupPkStr = bufToStr(groupPk)
			const mtdt = action.payload.event.contact.metadata
			const metadata: ContactRequestMetadata = mtdt && bufToJSON(mtdt)
			const uid = action.payload.eventContext?.id && bufToStr(action.payload.eventContext.id)
			yield put(
				events.outgoingContactRequestEnqueued({
					uid: uid || undefined,
					contactPk: contactPkStr,
					groupPk: groupPkStr,
					metadata,
					addedDate: Date.now(),
				}),
			)
			yield call(protocol.client.transactions.activateGroup, { groupPk })
			yield put(
				groupsCommands.subscribe({
					publicKey: groupPkStr,
					metadata: true,
					messages: true,
				}),
			)
		}),
		takeEvery(protocol.events.client.accountContactRequestIncomingReceived, function* ({
			payload,
		}) {
			const {
				event: { contactPk, contactMetadata },
			} = payload
			const contact = yield* getContact(contactPk)
			if (!contact) {
				let metadata
				try {
					metadata = bufToJSON(contactMetadata)
				} catch (e) {
					console.warn('Invalid contact metadata')
					return
				}
				const pkstr = bufToStr(contactPk)
				yield put(
					events.created({
						id: pkstr,
						publicKey: pkstr,
						name: metadata.name,
						request: {
							type: ContactRequestType.Incoming,
							accepted: false,
							discarded: false,
						},
						addedDate: Date.now(),
					}),
				)
			}
		}),
		takeEvery(protocol.events.client.accountContactRequestIncomingAccepted, function* ({
			payload,
		}) {
			const {
				event: { groupPk, contactPk },
			} = payload
			let realGroupPk = groupPk
			let groupPkStr = bufToStr(groupPk)
			if (!groupPkStr) {
				realGroupPk = yield* contactPkToGroupPk({ contactPk })
				groupPkStr = bufToStr(realGroupPk)
			}
			const contactPkStr = bufToStr(contactPk)
			if (!groupPkStr) {
				console.warn("Can't find groupPk for accepted contact request")
				yield* transactions.delete({ id: contactPkStr })
			}
			const contact = yield select((state) => queries.get(state, { id: contactPkStr }))
			if (contact) {
				yield call(conversationTransactions.createOneToOne, {
					kind: ConversationKind.OneToOne,
					contactId: contactPkStr,
					title: contact.name,
					pk: groupPkStr,
					now: Date.now(),
				})
				yield call(protocol.client.transactions.activateGroup, { groupPk: realGroupPk })
				yield put(
					groupsCommands.subscribe({
						publicKey: groupPkStr,
						messages: true,
						metadata: true,
					}),
				)
				yield put(
					events.incomingContactRequestAccepted({
						groupPk: groupPkStr,
						contactPk: bufToStr(contactPk),
					}),
				)
			}
		}),
		takeEvery(protocol.events.client.accountContactRequestOutgoingSent, function* ({ payload }) {
			const { event } = payload
			const { contactPk } = event
			if (!contactPk) {
				return
			}
			const contact = yield* getContact(contactPk)
			if (!contact || contact.request.type !== ContactRequestType.Outgoing) {
				return
			}

			const groupPk = yield* contactPkToGroupPk({ contactPk })

			yield put(
				events.outgoingContactRequestSent({
					id: bufToStr(contactPk),
					date: Date.now(),
					groupPk: groupPk && bufToStr(groupPk),
				}),
			)

			if (groupPk && contact.request.state === 'initiated') {
				yield call(conversationTransactions.createOneToOne, {
					kind: ConversationKind.OneToOne,
					contactId: contact.id,
					title: contact.name,
					pk: bufToStr(groupPk),
					now: Date.now(),
				})
				yield call(protocol.client.transactions.activateGroup, { groupPk })
				yield put(
					groupsCommands.subscribe({
						publicKey: bufToStr(groupPk),
						messages: true,
						metadata: true,
					}),
				)
			}
		}),
		takeEvery('protocol/GroupMessageEvent', function* ({ payload }) {
			console.log('got groupMetadataPayloadSent')
			if (!payload.message) {
				return
			}
			const event = bufToJSON(payload.message) // <--- Not secure
			if (
				event &&
				event.type === AppMessageType.GroupInvitation &&
				event.group.groupType === berty.types.v1.GroupType.GroupTypeMultiMember
			) {
				console.log('found group invitation')

				const group = {
					publicKey: strToBuf(event.group.publicKey),
					secret: strToBuf(event.group.secret),
					secretSig: strToBuf(event.group.secretSig),
					groupType: berty.types.v1.GroupType.GroupTypeMultiMember,
				}

				yield put(
					conversationEvents.created({
						kind: ConversationKind.MultiMember,
						title: event.name,
						pk: event.group.publicKey,
						now: Date.now(),
					}),
				)

				try {
					yield* protocol.client.transactions.multiMemberGroupJoin({ group })
				} catch (e) {
					console.warn('Failed to join multi-member group:', e)
				}

				yield put(
					groupsCommands.subscribe({
						publicKey: event.group.publicKey,
						metadata: true,
						messages: true,
					}),
				)
			}
		}),
		takeEvery(protocol.events.client.groupMemberDeviceAdded, function* ({ payload }) {
			// This is the only way to know if an outgoing contact request has been accepted without receiving a message
			const {
				eventContext: { groupPk },
				event: { memberPk },
			} = payload
			if (!groupPk) {
				return
			}
			const client = yield select((state) => protocol.queries.client.get(state))
			if (!client) {
				return
			}
			// noop if the event comes from our devices
			if (bufToStr(memberPk) === client.accountPk) {
				// TODO: multidevice
				return
			}
			const groupPkStr = bufToStr(groupPk)

			const contacts = yield select((state) => queries.list(state))
			const contact = contacts.find(
				(c) => c.request.type === ContactRequestType.Outgoing && c.groupPk === groupPkStr,
			)
			if (contact && !contact.request.accepted) {
				yield put(events.outgoingContactRequestAccepted({ contactPk: contact.publicKey }))
			}
		}),
		takeEvery(protocol.client.events.accountContactBlocked, function* ({ payload }) {
			const {
				event: { contactPk },
			} = payload
			yield call(transactions.delete, { id: bufToStr(contactPk) })
		}),
	])
}
