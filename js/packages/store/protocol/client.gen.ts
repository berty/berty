import * as api from '@berty-tech/api'

export type Commands<State> = {
	instanceExportData: (
		state: State,
		action: {
			payload: {
				id: string
			}
		},
	) => State
	instanceGetConfiguration: (
		state: State,
		action: {
			payload: {
				id: string
			}
		},
	) => State
	contactRequestReference: (
		state: State,
		action: {
			payload: {
				id: string
			}
		},
	) => State
	contactRequestDisable: (
		state: State,
		action: {
			payload: {
				id: string
			}
		},
	) => State
	contactRequestEnable: (
		state: State,
		action: {
			payload: {
				id: string
			}
		},
	) => State
	contactRequestResetReference: (
		state: State,
		action: {
			payload: {
				id: string
			}
		},
	) => State
	contactRequestSend: (
		state: State,
		action: {
			payload: {
				id: string
				contact: api.berty.types.IShareableContact
			}
		},
	) => State
	contactRequestAccept: (
		state: State,
		action: {
			payload: {
				id: string
				contactPk: Uint8Array
			}
		},
	) => State
	contactRequestDiscard: (
		state: State,
		action: {
			payload: {
				id: string
				contactPk: Uint8Array
			}
		},
	) => State
	contactBlock: (
		state: State,
		action: {
			payload: {
				id: string
				contactPk: Uint8Array
			}
		},
	) => State
	contactUnblock: (
		state: State,
		action: {
			payload: {
				id: string
				contactPk: Uint8Array
			}
		},
	) => State
	contactAliasKeySend: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
			}
		},
	) => State
	multiMemberGroupCreate: (
		state: State,
		action: {
			payload: {
				id: string
			}
		},
	) => State
	multiMemberGroupJoin: (
		state: State,
		action: {
			payload: {
				id: string
				group: api.berty.types.IGroup
			}
		},
	) => State
	multiMemberGroupLeave: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
			}
		},
	) => State
	multiMemberGroupAliasResolverDisclose: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
			}
		},
	) => State
	multiMemberGroupAdminRoleGrant: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
				memberPk: Uint8Array
			}
		},
	) => State
	multiMemberGroupInvitationCreate: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
			}
		},
	) => State
	appMetadataSend: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
				payload: Uint8Array
			}
		},
	) => State
	appMessageSend: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
				payload: Uint8Array
			}
		},
	) => State
	groupMetadataSubscribe: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
				since: Uint8Array
				until: Uint8Array
				goBackwards: boolean
			}
		},
	) => State
	groupMessageSubscribe: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
				since: Uint8Array
				until: Uint8Array
				goBackwards: boolean
			}
		},
	) => State
	groupMetadataList: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
			}
		},
	) => State
	groupMessageList: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
			}
		},
	) => State
	groupInfo: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
				contactPk: Uint8Array
			}
		},
	) => State
	activateGroup: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
			}
		},
	) => State
	deactivateGroup: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: Uint8Array
			}
		},
	) => State
}
