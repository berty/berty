import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'

import { InteractionUserMessage } from '@berty/store'

/**
 *
 * State
 *
 */

export const sliceName = 'chatInputs'

const makeRoot = <T>(val: T) => ({
	[sliceName]: val,
})

export interface ReplyTargetInteraction extends InteractionUserMessage {
	backgroundColor: string
	textColor: string
}

type ChatInputState = {
	id: string
	text: string
	mediaList: string[] // cids
	activeReplyInteraction: ReplyTargetInteraction | null
}

const newChatInputState: (convPK: string) => ChatInputState = convPK => ({
	id: convPK,
	text: '',
	mediaList: [],
	activeReplyInteraction: null,
})

const adapter = createEntityAdapter<ChatInputState>()

const initialState = adapter.getInitialState()
type LocalState = typeof initialState
const rootInitialState = makeRoot(initialState)
type LocalRootState = typeof rootInitialState

function ensureEntityExists(state: LocalState, convPK: string): ChatInputState {
	let ent = state.entities[convPK]
	if (!ent) {
		ent = newChatInputState(convPK)
		adapter.addOne(state, ent)
	}
	return ent
}

/**
 *
 * Selectors
 *
 */

const selectSlice = (state: LocalRootState) => state[sliceName]

const selectors = adapter.getSelectors(selectSlice)

export const selectChatInputText = (state: LocalRootState, convPk: string) =>
	selectors.selectById(state, convPk)?.text || ''

// emptyList helps memo, `(emptyList === emptyList) === true` where `([] === []) === false`
const emptyList: never[] = []

export const selectChatInputMediaList = (state: LocalRootState, convPk: string) =>
	selectors.selectById(state, convPk)?.mediaList || emptyList

export const selectActiveReplyInteraction = (state: LocalRootState, convPk: string) =>
	selectors.selectById(state, convPk)?.activeReplyInteraction || null

/**
 *
 * Actions
 *
 */

const slice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		resetChatInput: adapter.removeOne,
		setChatInputText(state, { payload }: PayloadAction<{ convPK: string; text: string }>) {
			const { convPK, text } = payload
			ensureEntityExists(state, convPK)
			adapter.updateOne(state, { id: convPK, changes: { text } })
		},
		addChatInputMedia(state, { payload }: PayloadAction<{ convPK: string; cids: string[] }>) {
			const { convPK, cids } = payload
			const ent = ensureEntityExists(state, convPK)
			adapter.updateOne(state, {
				id: convPK,
				changes: {
					mediaList: [...ent.mediaList, ...cids],
				},
			})
		},
		setActiveReplyInteraction(
			state,
			{
				payload: { convPK, activeReplyInteraction },
			}: PayloadAction<{ convPK: string; activeReplyInteraction: ReplyTargetInteraction }>,
		) {
			ensureEntityExists(state, convPK)
			adapter.updateOne(state, { id: convPK, changes: { activeReplyInteraction } })
		},
		removeActiveReplyInteraction(
			state,
			{ payload: { convPK } }: PayloadAction<{ convPK: string }>,
		) {
			ensureEntityExists(state, convPK)
			adapter.updateOne(state, { id: convPK, changes: { activeReplyInteraction: null } })
		},
	},
})

export const {
	resetChatInput,
	setChatInputText,
	setActiveReplyInteraction,
	removeActiveReplyInteraction,
} = slice.actions

export default makeRoot(slice.reducer)
