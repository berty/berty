import { createEntityAdapter, createSlice, EntityId, PayloadAction } from '@reduxjs/toolkit'

import { resetChatInput } from './chatInputs.reducer'

/**
 *
 * State
 *
 */

const sliceName = 'chatInputsVolatile'

type ChatInputSelectionType = { start: number; end: number } | null

type ChatInputVolatileState = {
	id: string
	isSending: boolean
	selection: ChatInputSelectionType
	isFocused: boolean
}

const newChatInputVolatileState: (convPK: string) => ChatInputVolatileState = convPK => ({
	id: convPK,
	isSending: false,
	selection: null,
	isFocused: false,
})

const adapter = createEntityAdapter<ChatInputVolatileState>()

const initialState = adapter.getInitialState()

/**
 *
 * Generic
 *
 */

const makeRoot = <T>(val: T) => ({
	[sliceName]: val,
})

type LocalState = typeof initialState
const rootInitialState = makeRoot(initialState)
type LocalRootState = typeof rootInitialState
const selectSlice = (state: LocalRootState) => state[sliceName]

function ensureEntityExists(state: LocalState, convPK: string): ChatInputVolatileState {
	let ent = state.entities[convPK]
	if (!ent) {
		ent = newChatInputVolatileState(convPK)
		adapter.addOne(state, ent)
	}
	return ent
}

/**
 *
 * Selectors
 *
 */

const selectors = adapter.getSelectors(selectSlice)

export const selectChatInputSelection = (
	state: LocalRootState,
	convPk: string,
): ChatInputSelectionType => selectors.selectById(state, convPk)?.selection || null

export const selectChatInputIsFocused = (state: LocalRootState, convPk: string): boolean =>
	selectors.selectById(state, convPk)?.isFocused || false

export const selectChatInputIsSending = (state: LocalRootState, convPk: string) =>
	selectors.selectById(state, convPk)?.isSending || false

/**
 *
 * Actions
 *
 */

const slice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		setChatInputSending(state, { payload }: PayloadAction<{ convPK: string; value: boolean }>) {
			const { convPK, value } = payload
			ensureEntityExists(state, convPK)
			adapter.updateOne(state, { id: convPK, changes: { isSending: value } })
		},
		setChatInputSelection(
			state,
			{
				payload: { convPK, selection },
			}: PayloadAction<{ convPK: string; selection: ChatInputSelectionType }>,
		) {
			ensureEntityExists(state, convPK)
			adapter.updateOne(state, { id: convPK, changes: { selection } })
		},
		setChatInputIsFocused(
			state,
			{ payload: { convPK, isFocused } }: PayloadAction<{ convPK: string; isFocused: boolean }>,
		) {
			ensureEntityExists(state, convPK)
			adapter.updateOne(state, { id: convPK, changes: { isFocused } })
		},
		setChatInputIsSending(
			state,
			{ payload: { convPK, isSending } }: PayloadAction<{ convPK: string; isSending: boolean }>,
		) {
			ensureEntityExists(state, convPK)
			adapter.updateOne(state, { id: convPK, changes: { isSending } })
		},
	},
	extraReducers: builder => {
		builder.addCase(resetChatInput, (state, { payload: convPK }: PayloadAction<EntityId>) =>
			adapter.updateOne(state, { id: convPK, changes: { isSending: false } }),
		)
	},
})

export const { setChatInputSelection, setChatInputIsFocused, setChatInputIsSending } = slice.actions

export default makeRoot(slice.reducer)
