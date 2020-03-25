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
				reference: Uint8Array
				contactMetadata: Uint8Array
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
				group: api.berty.protocol.IGroup
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
export type Events<State> = {
	undefined: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {}
			}
		},
	) => State
	groupMemberDeviceAdded: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// GroupMemberDeviceAdded seems event of type GroupAddMemberDevice
					memberPk: Uint8Array
					devicePk: Uint8Array
					memberSig: Uint8Array
				}
			}
		},
	) => State
	groupDeviceSecretAdded: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// GroupDeviceSecretAdded seems event of type GroupAddDeviceSecret
					devicePk: Uint8Array
					destMemberPk: Uint8Array
					payload: Uint8Array
				}
			}
		},
	) => State
	accountGroupJoined: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// AccountGroupJoined seems event of type AccountGroupJoined
					devicePk: Uint8Array
					group: api.berty.protocol.IGroup
				}
			}
		},
	) => State
	accountGroupLeft: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// AccountGroupLeft seems event of type AccountGroupLeft
					devicePk: Uint8Array
					groupPk: Uint8Array
				}
			}
		},
	) => State
	accountContactRequestDisabled: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// AccountContactRequestDisabled seems event of type AccountContactRequestDisabled
					devicePk: Uint8Array
				}
			}
		},
	) => State
	accountContactRequestEnabled: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// AccountContactRequestEnabled seems event of type AccountContactRequestEnabled
					devicePk: Uint8Array
				}
			}
		},
	) => State
	accountContactRequestReferenceReset: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// AccountContactRequestReferenceReset seems event of type AccountContactRequestReferenceReset
					devicePk: Uint8Array
					rendezvousSeed: Uint8Array
				}
			}
		},
	) => State
	accountContactRequestOutgoingEnqueued: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// AccountContactRequestOutgoingEnqueued seems event of type AccountContactRequestEnqueued
					devicePk: Uint8Array
					contactPk: Uint8Array
					groupPk: Uint8Array
					contactRendezvousSeed: Uint8Array
					contactMetadata: Uint8Array
				}
			}
		},
	) => State
	accountContactRequestOutgoingSent: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// AccountContactRequestOutgoingSent seems event of type AccountContactRequestSent
					devicePk: Uint8Array
					contactPk: Uint8Array
				}
			}
		},
	) => State
	accountContactRequestIncomingReceived: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// AccountContactRequestIncomingReceived seems event of type AccountContactRequestReceived
					devicePk: Uint8Array
					contactPk: Uint8Array
					contactRendezvousSeed: Uint8Array
					contactMetadata: Uint8Array
				}
			}
		},
	) => State
	accountContactRequestIncomingDiscarded: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// AccountContactRequestIncomingDiscarded seems event of type AccountContactRequestDiscarded
					devicePk: Uint8Array
					contactPk: Uint8Array
				}
			}
		},
	) => State
	accountContactRequestIncomingAccepted: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// AccountContactRequestIncomingAccepted seems event of type AccountContactRequestAccepted
					devicePk: Uint8Array
					contactPk: Uint8Array
					groupPk: Uint8Array
				}
			}
		},
	) => State
	accountContactBlocked: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// AccountContactBlocked seems event of type AccountContactBlocked
					devicePk: Uint8Array
					contactPk: Uint8Array
				}
			}
		},
	) => State
	accountContactUnblocked: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// AccountContactUnblocked seems event of type AccountContactUnblocked
					devicePk: Uint8Array
					contactPk: Uint8Array
				}
			}
		},
	) => State
	contactAliasKeyAdded: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// ContactAliasKeyAdded seems event of type ContactAddAliasKey
					devicePk: Uint8Array
					aliasPk: Uint8Array
				}
			}
		},
	) => State
	multiMemberGroupAliasResolverAdded: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// MultiMemberGroupAliasResolverAdded seems event of type MultiMemberGroupAddAliasResolver
					devicePk: Uint8Array
					aliasResolver: Uint8Array
					aliasProof: Uint8Array
				}
			}
		},
	) => State
	multiMemberGroupInitialMemberAnnounced: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {}
			}
		},
	) => State
	multiMemberGroupAdminRoleGranted: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {
					// MultiMemberGroupAdminRoleGranted seems event of type MultiMemberGroupAdminRoleGrant
				}
			}
		},
	) => State
	groupMetadataPayloadSent: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.protocol.IEventContext
				metadata: api.berty.protocol.IGroupMetadata
				event: {}
			}
		},
	) => State
}
