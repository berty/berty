import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import beapi from '@berty/api'

/**
 *
 * Types
 *
 */

type GroupCreationState = {
	members: beapi.messenger.IContact[]
}

/**
 *
 * State
 *
 */

export const sliceName = 'groupCreationForm'

const makeRoot = <T>(val: T) => ({
	[sliceName]: val,
})

const initialState: GroupCreationState = {
	members: [],
}

const rootInitialState = makeRoot(initialState)
type LocalRootState = typeof rootInitialState

/**
 *
 * Actions
 *
 */

const slice = createSlice({
	name: sliceName,
	initialState,
	reducers: {
		addMemberToInvitationList(
			{ members }: GroupCreationState,
			{ payload: contact }: PayloadAction<beapi.messenger.IContact>,
		) {
			if (!members.find(member => member.publicKey === contact.publicKey)) {
				members.push(contact)
			}
		},
		removeMemberFromInvitationListById(
			state: GroupCreationState,
			{ payload: id }: PayloadAction<string>,
		) {
			const filtered = state.members.filter(member => member.publicKey !== id)
			if (filtered.length !== state.members.length) {
				state.members = filtered
			}
		},
		resetInvitationList() {
			return initialState
		},
	},
})

/**
 *
 * Selectors
 *
 */

const selectSlice = (state: LocalRootState) => state[sliceName]

export const selectInvitationListMembers = (state: LocalRootState): beapi.messenger.IContact[] =>
	selectSlice(state).members

export const {
	addMemberToInvitationList,
	removeMemberFromInvitationListById,
	resetInvitationList,
} = slice.actions

export default makeRoot(slice.reducer)
