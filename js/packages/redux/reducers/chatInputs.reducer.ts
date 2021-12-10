import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit'

/**
 *
 * State
 *
 */

export const sliceName = 'chatInputs'

const makeRoot = <T>(val: T) => ({
	[sliceName]: val,
})

type ChatInputState = {
	id: string
	text: string
	mediaList: string[] // cids
	replyTarget?: string // cid
}

const newChatInputState: (convPK: string) => ChatInputState = convPK => ({
	id: convPK,
	text: '',
	mediaList: [],
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
		startChatInputReply(state, { payload }: PayloadAction<{ convPK: string; cid: string }>) {
			const { convPK, cid } = payload
			ensureEntityExists(state, convPK)
			adapter.updateOne(state, { id: convPK, changes: { replyTarget: cid } })
		},
	},
})

export const { resetChatInput, setChatInputText, addChatInputMedia } = slice.actions

export default makeRoot(slice.reducer)
