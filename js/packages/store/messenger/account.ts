import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { fork, put, all, select, call, take } from 'redux-saga/effects'
import GoBridge from '@berty-tech/go-bridge'
import { berty } from '@berty-tech/api'
import { makeDefaultReducers, makeDefaultCommandsSagas, strToBuf, jsonToBuf } from '../utils'

import { commands as groupsCommands } from '../groups'
import * as protocol from '../protocol'
import { events as mainSettingsEvents } from '../settings/main'
import {
	events as conversationEvents,
	transactions as conversationTransactions,
} from './conversation'
import * as contact from './contact'

export type LinkKind = 'group' | 'contact' | 'unknown'

export type State = {
	deepLinkStatus?: { link: string; error?: string; kind?: LinkKind }
	name: string
	onboarded: boolean
} | null

export type GlobalState = {
	messenger: {
		account: State
	}
}

export namespace Command {
	export type Generate = void
	export type Create = { name: string; nodeConfig: protocol.client.BertyNodeConfig }
	export type Delete = void
	export type SendContactRequest = {
		contactName: string
		contactRdvSeed: string
		contactPublicKey: string
	}
	export type Replay = void
	export type Open = void
	export type Onboard = void
	export type HandleDeepLink = { url: string }
}

export namespace Event {
	export type Created = { name: string }
	export type Deleted = void
	export type Onboarded = void
	export type HandleDeepLinkError = { link: string; error: string }
	export type HandleDeepLinkDone = { link: string; kind: LinkKind }
	export type Unboarded = void
}

type SimpleCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type CommandsReducer = {
	generate: SimpleCaseReducer<Command.Generate>
	create: SimpleCaseReducer<Command.Create>
	delete: SimpleCaseReducer<Command.Delete>
	sendContactRequest: SimpleCaseReducer<Command.SendContactRequest>
	replay: SimpleCaseReducer<Command.Replay>
	open: SimpleCaseReducer<Command.Open>
	onboard: SimpleCaseReducer<Command.Onboard>
	handleDeepLink: SimpleCaseReducer<Command.HandleDeepLink>
}

export type Queries = {
	get: (state: GlobalState) => State
	getRequestRdvSeed: (state: protocol.client.GlobalState) => string | undefined
}

export type EventsReducer = {
	created: SimpleCaseReducer<Event.Created>
	deleted: SimpleCaseReducer<Event.Deleted>
	onboarded: SimpleCaseReducer<Event.Onboarded>
	unboarded: SimpleCaseReducer<Event.Unboarded>
	handleDeepLinkError: SimpleCaseReducer<Event.HandleDeepLinkError>
	handleDeepLinkDone: SimpleCaseReducer<Event.HandleDeepLinkDone>
}

export type Transactions = {
	[K in keyof CommandsReducer]: CommandsReducer[K] extends SimpleCaseReducer<infer TPayload>
		? (payload: TPayload) => Generator
		: never
}

const initialState = null

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'messenger/account/command',
	initialState,
	// this is stupid but getting https://github.com/kimamula/ts-transformer-keys in might be a headache
	// maybe move commands and events definitions in .protos
	reducers: makeDefaultReducers([
		'generate',
		'create',
		'delete',
		'sendContactRequest',
		'replay',
		'open',
		'onboard',
		'handleDeepLink',
	]),
})

const eventHandler = createSlice<State, EventsReducer>({
	name: 'messenger/account/event',
	initialState,
	reducers: {
		created: (state, { payload }) => {
			if (!state) {
				state = {
					name: payload.name,
					onboarded: false,
				}
			}
			return state
		},
		deleted: () => {
			return null
		},
		onboarded: (state) => {
			if (state) {
				state.onboarded = true
			}
			return state
		},
		unboarded: (state) => {
			if (state) {
				state.onboarded = false
			}
			return state
		},
		handleDeepLinkError: (state, { payload: { link, error } }) => {
			if (state) {
				state.deepLinkStatus = { link, error }
			}
			return state
		},
		handleDeepLinkDone: (state, { payload: { link, kind } }) => {
			if (state) {
				state.deepLinkStatus = { link, kind }
			}
			return state
		},
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: Queries = {
	get: (state) => state.messenger.account,
	getRequestRdvSeed: (state) => {
		const account = protocol.queries.client.get(state)
		return (account && account.contactRequestRdvSeed) || undefined
	},
}

export const transactions: Transactions = {
	open: function* () {
		const acc = (yield select(queries.get)) as ReturnType<typeof queries.get>
		if (!acc) {
			throw new Error("tried to open the account while it's undefined")
		}

		yield put(conversationEvents.appInit())

		yield put(groupsCommands.open())
		yield take('GROUPS_OPENED')

		const client = yield* protocol.client.getProtocolClient()

		yield put(groupsCommands.subscribe({ publicKey: client.accountGroupPk, metadata: true }))

		yield call(protocol.transactions.client.instanceShareableBertyID, {
			reset: false,
			displayName: acc.name,
		})

		yield call(protocol.transactions.client.contactRequestReference)
	},
	generate: function* () {
		throw new Error('not implemented')
		//yield* transactions.create({ name: faker.name.firstName(), config: {} })
	},
	create: function* ({ name, nodeConfig }) {
		yield put(mainSettingsEvents.created({ nodeConfig }))
		yield put(events.created({ name }))
	},
	delete: function* () {
		yield put(events.unboarded())
		yield* protocol.client.transactions.stop()
		yield call(GoBridge.clearStorage)
		yield put({ type: 'CLEAR_STORE' })
	},
	replay: function* () {
		throw new Error('not implemented')
	},
	sendContactRequest: function* (payload) {
		const account = (yield select(queries.get)) as ReturnType<typeof queries.get>
		if (account == null) {
			throw new Error("account doesn't exist")
		}

		const metadata: contact.ContactRequestMetadata = {
			name: payload.contactName,
		}

		console.log(
			'sending contact request with\npk:',
			payload.contactPublicKey,
			'\ncrs:',
			payload.contactRdvSeed,
			'\nmetadata:',
			metadata,
		)

		const ownMetadata: contact.ContactRequestMetadata = {
			name: account.name,
		}

		const contact: berty.types.v1.IShareableContact = {
			pk: strToBuf(payload.contactPublicKey),
			publicRendezvousSeed: strToBuf(payload.contactRdvSeed),
			metadata: jsonToBuf(metadata),
		}

		yield* protocol.transactions.client.contactRequestSend({
			contact,
			ownMetadata: jsonToBuf(ownMetadata),
		})

		console.log('contactRequestSend done')
	},
	onboard: function* () {
		yield put(events.onboarded())
	},
	handleDeepLink: function* ({ url }) {
		if (!protocol.client.services) {
			yield take('APP_READY')
		}
		try {
			const data = (yield call(protocol.client.transactions.parseDeepLink, {
				link: url,
			})) as berty.messenger.v1.ParseDeepLink.IReply
			if (!(data && (data.bertyId || data.bertyGroup))) {
				throw new Error('Internal: Invalid node response.')
			}
			let kind: LinkKind
			if (data.bertyGroup) {
				kind = 'group'
				yield* conversationTransactions.join({ link: url })
			} else if (data.bertyId) {
				kind = 'contact'
				yield* contact.transactions.initiateRequest({ url })
			} else {
				kind = 'unknown'
			}
			yield put(events.handleDeepLinkDone({ link: url, kind }))
		} catch (e) {
			if (e.name === 'GRPCError') {
				const error = new Error('Corrupted deep link.').toString()
				yield put(events.handleDeepLinkError({ link: url, error }))
			} else {
				yield put(events.handleDeepLinkError({ link: url, error: e.toString() }))
			}
		}
	},
}

export function* orchestrator() {
	yield all([...makeDefaultCommandsSagas(commands, transactions)])
}
