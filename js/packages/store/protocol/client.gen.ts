import * as api from '@berty-tech/api'
import { PayloadAction, CaseReducer } from '@reduxjs/toolkit'

export type Commands<State> = {
	instanceExportData: CaseReducer<
		State,
		PayloadAction<{
			id: string
		}>
	>
	instanceGetConfiguration: CaseReducer<
		State,
		PayloadAction<{
			id: string
		}>
	>
	contactRequestReference: CaseReducer<
		State,
		PayloadAction<{
			id: string
		}>
	>
	contactRequestDisable: CaseReducer<
		State,
		PayloadAction<{
			id: string
		}>
	>
	contactRequestEnable: CaseReducer<
		State,
		PayloadAction<{
			id: string
		}>
	>
	contactRequestResetReference: CaseReducer<
		State,
		PayloadAction<{
			id: string
		}>
	>
	contactRequestSend: CaseReducer<
		State,
		PayloadAction<{
			id: string
			contact: api.berty.types.IShareableContact
			ownMetadata: Uint8Array
		}>
	>
	contactRequestAccept: CaseReducer<
		State,
		PayloadAction<{
			id: string
			contactPk: Uint8Array
		}>
	>
	contactRequestDiscard: CaseReducer<
		State,
		PayloadAction<{
			id: string
			contactPk: Uint8Array
		}>
	>
	contactBlock: CaseReducer<
		State,
		PayloadAction<{
			id: string
			contactPk: Uint8Array
		}>
	>
	contactUnblock: CaseReducer<
		State,
		PayloadAction<{
			id: string
			contactPk: Uint8Array
		}>
	>
	contactAliasKeySend: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
		}>
	>
	multiMemberGroupCreate: CaseReducer<
		State,
		PayloadAction<{
			id: string
		}>
	>
	multiMemberGroupJoin: CaseReducer<
		State,
		PayloadAction<{
			id: string
			group: api.berty.types.IGroup
		}>
	>
	multiMemberGroupLeave: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
		}>
	>
	multiMemberGroupAliasResolverDisclose: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
		}>
	>
	multiMemberGroupAdminRoleGrant: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
			memberPk: Uint8Array
		}>
	>
	multiMemberGroupInvitationCreate: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
		}>
	>
	appMetadataSend: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
			payload: Uint8Array
		}>
	>
	appMessageSend: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
			payload: Uint8Array
		}>
	>
	groupMetadataSubscribe: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
			since: Uint8Array
			until: Uint8Array
			goBackwards: boolean
		}>
	>
	groupMessageSubscribe: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
			since: Uint8Array
			until: Uint8Array
			goBackwards: boolean
		}>
	>
	groupMetadataList: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
		}>
	>
	groupMessageList: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
		}>
	>
	groupInfo: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
			contactPk: Uint8Array
		}>
	>
	activateGroup: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
		}>
	>
	deactivateGroup: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
		}>
	>
	debugListGroups: CaseReducer<
		State,
		PayloadAction<{
			id: string
		}>
	>
	debugInspectGroupStore: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
			logType: api.berty.types.DebugInspectGroupLogType
		}>
	>
	debugGroup: CaseReducer<
		State,
		PayloadAction<{
			id: string
			groupPk: Uint8Array
		}>
	>
}

export enum Methods {
	instanceExportData = 'instanceExportData',
	instanceGetConfiguration = 'instanceGetConfiguration',
	contactRequestReference = 'contactRequestReference',
	contactRequestDisable = 'contactRequestDisable',
	contactRequestEnable = 'contactRequestEnable',
	contactRequestResetReference = 'contactRequestResetReference',
	contactRequestSend = 'contactRequestSend',
	contactRequestAccept = 'contactRequestAccept',
	contactRequestDiscard = 'contactRequestDiscard',
	contactBlock = 'contactBlock',
	contactUnblock = 'contactUnblock',
	contactAliasKeySend = 'contactAliasKeySend',
	multiMemberGroupCreate = 'multiMemberGroupCreate',
	multiMemberGroupJoin = 'multiMemberGroupJoin',
	multiMemberGroupLeave = 'multiMemberGroupLeave',
	multiMemberGroupAliasResolverDisclose = 'multiMemberGroupAliasResolverDisclose',
	multiMemberGroupAdminRoleGrant = 'multiMemberGroupAdminRoleGrant',
	multiMemberGroupInvitationCreate = 'multiMemberGroupInvitationCreate',
	appMetadataSend = 'appMetadataSend',
	appMessageSend = 'appMessageSend',
	groupMetadataSubscribe = 'groupMetadataSubscribe',
	groupMessageSubscribe = 'groupMessageSubscribe',
	groupMetadataList = 'groupMetadataList',
	groupMessageList = 'groupMessageList',
	groupInfo = 'groupInfo',
	activateGroup = 'activateGroup',
	deactivateGroup = 'deactivateGroup',
	debugListGroups = 'debugListGroups',
	debugInspectGroupStore = 'debugInspectGroupStore',
	debugGroup = 'debugGroup',
}
