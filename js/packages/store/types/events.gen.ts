import * as api from '@berty-tech/api'

export type Events<State> = {
	undefined: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
				event: {}
			}
		},
	) => State
	groupMemberDeviceAdded: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
				event: {
					// AccountGroupJoined seems event of type AccountGroupJoined
					devicePk: Uint8Array
					group: api.berty.types.IGroup
				}
			}
		},
	) => State
	accountGroupLeft: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
				event: {
					// AccountContactRequestReferenceReset seems event of type AccountContactRequestReferenceReset
					devicePk: Uint8Array
					publicRendezvousSeed: Uint8Array
				}
			}
		},
	) => State
	accountContactRequestOutgoingEnqueued: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
				event: {
					// AccountContactRequestOutgoingEnqueued seems event of type AccountContactRequestEnqueued
					devicePk: Uint8Array
					groupPk: Uint8Array
					contact: api.berty.types.IShareableContact
				}
			}
		},
	) => State
	accountContactRequestOutgoingSent: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
				event: {}
			}
		},
	) => State
	multiMemberGroupAdminRoleGranted: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
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
				eventContext: api.berty.types.IEventContext
				metadata: api.berty.types.IGroupMetadata
				event: {}
			}
		},
	) => State
}
