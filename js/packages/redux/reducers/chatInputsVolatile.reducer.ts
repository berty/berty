import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { resetChatInput } from './chatInputs.reducer'

/**
 *
 * State
 *
 */

export const sliceName = 'chatInputsVolatile'

type ChatInputVolatileState = {
	id: string
	sending: boolean
}

const newChatInputVolatileState: (convPK: string) => ChatInputVolatileState = convPK => ({
	id: convPK,
	sending: false,
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

export const selectChatInputSending = (state: LocalRootState, convPk: string) =>
	selectors.selectById(state, convPk)?.sending || false

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
			adapter.updateOne(state, { id: convPK, changes: { sending: value } })
		},
	},
	extraReducers: builder => {
		builder.addCase(resetChatInput, adapter.removeOne)
	},
})

export const { setChatInputSending } = slice.actions

export default makeRoot(slice.reducer)
