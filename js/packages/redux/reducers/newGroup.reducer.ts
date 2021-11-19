import { berty } from '@berty-tech/api/root.pb'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../store'

/**
 *
 * Types
 *
 */

type stateType = {
	members: berty.messenger.v1.IContact[]
}

/**
 *
 * State
 *
 */

const initialState: stateType = {
	members: [],
}

/**
 *
 * Actions
 *
 */

const slice = createSlice({
	name: 'newGroup',
	initialState,
	reducers: {
		addMemberToInvitationList(
			{ members }: stateType,
			{ payload: contact }: PayloadAction<berty.messenger.v1.IContact>,
		) {
			if (!members.find(member => member.publicKey === contact.publicKey)) {
				members.push(contact)
			}
		},
		removeMemberFromInvitationListById(state: stateType, { payload: id }: PayloadAction<string>) {
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

export const selectInvitationListMembers = (state: RootState): berty.messenger.v1.IContact[] =>
	state.newGroup.members

export const {
	addMemberToInvitationList,
	removeMemberFromInvitationListById,
	resetInvitationList,
} = slice.actions

export default slice.reducer
