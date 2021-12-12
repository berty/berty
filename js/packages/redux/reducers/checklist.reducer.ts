import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { clone } from 'lodash'

/**
 *
 * State
 *
 */

export const sliceName = 'checklist'

const makeRoot = <T>(val: T) => ({
	[sliceName]: val,
})

// This is the source of truth for valid checklist items keys
export const checklistItems = {
	avatar: {},
	relay: {},
	contact: {},
	group: {},
	message: {},
	'ble-message': {},
}

export type ChecklistItemKey = keyof typeof checklistItems

export type ChecklistItem = {
	done?: boolean
}

export type ChecklistState = {
	expanded?: boolean
	seen?: boolean
	items: { [key in ChecklistItemKey]: ChecklistItem }
}

const newChecklistState = (): ChecklistState => ({
	items: clone(checklistItems),
})

const initialState = newChecklistState()

type LocalState = typeof initialState
const rootInitialState = makeRoot(initialState)
type LocalRootState = typeof rootInitialState

/**
 *
 * Selectors
 *
 */

const selectSlice = (state: LocalRootState) => state[sliceName]

export const selectChecklistItems = (state: LocalRootState) => selectSlice(state).items

export const selectChecklistSeen = (state: LocalRootState) => !!selectSlice(state).seen

export const selectChecklistExpanded = (state: LocalRootState) => !!selectSlice(state).expanded

/**
 *
 * Actions
 *
 */

const slice = createSlice({
	name: 'checklist',
	initialState,
	reducers: {
		setChecklistItemDone(
			state: LocalState,
			{ payload: { key } }: PayloadAction<{ key: ChecklistItemKey }>,
		) {
			const item = state.items[key]
			if (!item) {
				return
			}
			item.done = true
		},
		toggleChecklist(state: LocalState) {
			state.expanded = !state.expanded
			if (state.expanded) {
				state.seen = true
			}
		},
	},
})

export const { setChecklistItemDone, toggleChecklist } = slice.actions

export default makeRoot(slice.reducer)
