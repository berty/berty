import * as api from '@berty-tech/api'
import { PayloadAction, CaseReducer } from '@reduxjs/toolkit'

export const EventsNames = {
	undefined: 'undefined',
	groupMemberDeviceAdded: 'groupMemberDeviceAdded',
	groupDeviceSecretAdded: 'groupDeviceSecretAdded',
	accountGroupJoined: 'accountGroupJoined',
	accountGroupLeft: 'accountGroupLeft',
	accountContactRequestDisabled: 'accountContactRequestDisabled',
	accountContactRequestEnabled: 'accountContactRequestEnabled',
	accountContactRequestReferenceReset: 'accountContactRequestReferenceReset',
	accountContactRequestOutgoingEnqueued: 'accountContactRequestOutgoingEnqueued',
	accountContactRequestOutgoingSent: 'accountContactRequestOutgoingSent',
	accountContactRequestIncomingReceived: 'accountContactRequestIncomingReceived',
	accountContactRequestIncomingDiscarded: 'accountContactRequestIncomingDiscarded',
	accountContactRequestIncomingAccepted: 'accountContactRequestIncomingAccepted',
	accountContactBlocked: 'accountContactBlocked',
	accountContactUnblocked: 'accountContactUnblocked',
	contactAliasKeyAdded: 'contactAliasKeyAdded',
	multiMemberGroupAliasResolverAdded: 'multiMemberGroupAliasResolverAdded',
	multiMemberGroupInitialMemberAnnounced: 'multiMemberGroupInitialMemberAnnounced',
	multiMemberGroupAdminRoleGranted: 'multiMemberGroupAdminRoleGranted',
	groupMetadataPayloadSent: 'groupMetadataPayloadSent',
}
