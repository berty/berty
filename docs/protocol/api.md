# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [bertyprotocol.proto](#bertyprotocol.proto)
    - [ProtocolService](#berty.protocol.v1.ProtocolService)
  
- [bertytypes.proto](#bertytypes.proto)
    - [Account](#berty.types.v1.Account)
    - [AccountContactBlocked](#berty.types.v1.AccountContactBlocked)
    - [AccountContactRequestAccepted](#berty.types.v1.AccountContactRequestAccepted)
    - [AccountContactRequestDisabled](#berty.types.v1.AccountContactRequestDisabled)
    - [AccountContactRequestDiscarded](#berty.types.v1.AccountContactRequestDiscarded)
    - [AccountContactRequestEnabled](#berty.types.v1.AccountContactRequestEnabled)
    - [AccountContactRequestEnqueued](#berty.types.v1.AccountContactRequestEnqueued)
    - [AccountContactRequestReceived](#berty.types.v1.AccountContactRequestReceived)
    - [AccountContactRequestReferenceReset](#berty.types.v1.AccountContactRequestReferenceReset)
    - [AccountContactRequestSent](#berty.types.v1.AccountContactRequestSent)
    - [AccountContactUnblocked](#berty.types.v1.AccountContactUnblocked)
    - [AccountGroupJoined](#berty.types.v1.AccountGroupJoined)
    - [AccountGroupLeft](#berty.types.v1.AccountGroupLeft)
    - [ActivateGroup](#berty.types.v1.ActivateGroup)
    - [ActivateGroup.Reply](#berty.types.v1.ActivateGroup.Reply)
    - [ActivateGroup.Request](#berty.types.v1.ActivateGroup.Request)
    - [AppMessageSend](#berty.types.v1.AppMessageSend)
    - [AppMessageSend.Reply](#berty.types.v1.AppMessageSend.Reply)
    - [AppMessageSend.Request](#berty.types.v1.AppMessageSend.Request)
    - [AppMetadata](#berty.types.v1.AppMetadata)
    - [AppMetadataSend](#berty.types.v1.AppMetadataSend)
    - [AppMetadataSend.Reply](#berty.types.v1.AppMetadataSend.Reply)
    - [AppMetadataSend.Request](#berty.types.v1.AppMetadataSend.Request)
    - [ContactAddAliasKey](#berty.types.v1.ContactAddAliasKey)
    - [ContactAliasKeySend](#berty.types.v1.ContactAliasKeySend)
    - [ContactAliasKeySend.Reply](#berty.types.v1.ContactAliasKeySend.Reply)
    - [ContactAliasKeySend.Request](#berty.types.v1.ContactAliasKeySend.Request)
    - [ContactBlock](#berty.types.v1.ContactBlock)
    - [ContactBlock.Reply](#berty.types.v1.ContactBlock.Reply)
    - [ContactBlock.Request](#berty.types.v1.ContactBlock.Request)
    - [ContactRequestAccept](#berty.types.v1.ContactRequestAccept)
    - [ContactRequestAccept.Reply](#berty.types.v1.ContactRequestAccept.Reply)
    - [ContactRequestAccept.Request](#berty.types.v1.ContactRequestAccept.Request)
    - [ContactRequestDisable](#berty.types.v1.ContactRequestDisable)
    - [ContactRequestDisable.Reply](#berty.types.v1.ContactRequestDisable.Reply)
    - [ContactRequestDisable.Request](#berty.types.v1.ContactRequestDisable.Request)
    - [ContactRequestDiscard](#berty.types.v1.ContactRequestDiscard)
    - [ContactRequestDiscard.Reply](#berty.types.v1.ContactRequestDiscard.Reply)
    - [ContactRequestDiscard.Request](#berty.types.v1.ContactRequestDiscard.Request)
    - [ContactRequestEnable](#berty.types.v1.ContactRequestEnable)
    - [ContactRequestEnable.Reply](#berty.types.v1.ContactRequestEnable.Reply)
    - [ContactRequestEnable.Request](#berty.types.v1.ContactRequestEnable.Request)
    - [ContactRequestReference](#berty.types.v1.ContactRequestReference)
    - [ContactRequestReference.Reply](#berty.types.v1.ContactRequestReference.Reply)
    - [ContactRequestReference.Request](#berty.types.v1.ContactRequestReference.Request)
    - [ContactRequestResetReference](#berty.types.v1.ContactRequestResetReference)
    - [ContactRequestResetReference.Reply](#berty.types.v1.ContactRequestResetReference.Reply)
    - [ContactRequestResetReference.Request](#berty.types.v1.ContactRequestResetReference.Request)
    - [ContactRequestSend](#berty.types.v1.ContactRequestSend)
    - [ContactRequestSend.Reply](#berty.types.v1.ContactRequestSend.Reply)
    - [ContactRequestSend.Request](#berty.types.v1.ContactRequestSend.Request)
    - [ContactUnblock](#berty.types.v1.ContactUnblock)
    - [ContactUnblock.Reply](#berty.types.v1.ContactUnblock.Reply)
    - [ContactUnblock.Request](#berty.types.v1.ContactUnblock.Request)
    - [DeactivateGroup](#berty.types.v1.DeactivateGroup)
    - [DeactivateGroup.Reply](#berty.types.v1.DeactivateGroup.Reply)
    - [DeactivateGroup.Request](#berty.types.v1.DeactivateGroup.Request)
    - [DebugGroup](#berty.types.v1.DebugGroup)
    - [DebugGroup.Reply](#berty.types.v1.DebugGroup.Reply)
    - [DebugGroup.Request](#berty.types.v1.DebugGroup.Request)
    - [DebugInspectGroupStore](#berty.types.v1.DebugInspectGroupStore)
    - [DebugInspectGroupStore.Reply](#berty.types.v1.DebugInspectGroupStore.Reply)
    - [DebugInspectGroupStore.Request](#berty.types.v1.DebugInspectGroupStore.Request)
    - [DebugListGroups](#berty.types.v1.DebugListGroups)
    - [DebugListGroups.Reply](#berty.types.v1.DebugListGroups.Reply)
    - [DebugListGroups.Request](#berty.types.v1.DebugListGroups.Request)
    - [DeviceSecret](#berty.types.v1.DeviceSecret)
    - [EventContext](#berty.types.v1.EventContext)
    - [Group](#berty.types.v1.Group)
    - [GroupAddAdditionalRendezvousSeed](#berty.types.v1.GroupAddAdditionalRendezvousSeed)
    - [GroupAddDeviceSecret](#berty.types.v1.GroupAddDeviceSecret)
    - [GroupAddMemberDevice](#berty.types.v1.GroupAddMemberDevice)
    - [GroupEnvelope](#berty.types.v1.GroupEnvelope)
    - [GroupInfo](#berty.types.v1.GroupInfo)
    - [GroupInfo.Reply](#berty.types.v1.GroupInfo.Reply)
    - [GroupInfo.Request](#berty.types.v1.GroupInfo.Request)
    - [GroupMessageEvent](#berty.types.v1.GroupMessageEvent)
    - [GroupMessageList](#berty.types.v1.GroupMessageList)
    - [GroupMessageList.Request](#berty.types.v1.GroupMessageList.Request)
    - [GroupMessageSubscribe](#berty.types.v1.GroupMessageSubscribe)
    - [GroupMessageSubscribe.Request](#berty.types.v1.GroupMessageSubscribe.Request)
    - [GroupMetadata](#berty.types.v1.GroupMetadata)
    - [GroupMetadataEvent](#berty.types.v1.GroupMetadataEvent)
    - [GroupMetadataList](#berty.types.v1.GroupMetadataList)
    - [GroupMetadataList.Request](#berty.types.v1.GroupMetadataList.Request)
    - [GroupMetadataSubscribe](#berty.types.v1.GroupMetadataSubscribe)
    - [GroupMetadataSubscribe.Request](#berty.types.v1.GroupMetadataSubscribe.Request)
    - [GroupRemoveAdditionalRendezvousSeed](#berty.types.v1.GroupRemoveAdditionalRendezvousSeed)
    - [InstanceExportData](#berty.types.v1.InstanceExportData)
    - [InstanceExportData.Reply](#berty.types.v1.InstanceExportData.Reply)
    - [InstanceExportData.Request](#berty.types.v1.InstanceExportData.Request)
    - [InstanceGetConfiguration](#berty.types.v1.InstanceGetConfiguration)
    - [InstanceGetConfiguration.Reply](#berty.types.v1.InstanceGetConfiguration.Reply)
    - [InstanceGetConfiguration.Request](#berty.types.v1.InstanceGetConfiguration.Request)
    - [MessageEnvelope](#berty.types.v1.MessageEnvelope)
    - [MessageHeaders](#berty.types.v1.MessageHeaders)
    - [MessageHeaders.MetadataEntry](#berty.types.v1.MessageHeaders.MetadataEntry)
    - [MultiMemberGrantAdminRole](#berty.types.v1.MultiMemberGrantAdminRole)
    - [MultiMemberGroupAddAliasResolver](#berty.types.v1.MultiMemberGroupAddAliasResolver)
    - [MultiMemberGroupAdminRoleGrant](#berty.types.v1.MultiMemberGroupAdminRoleGrant)
    - [MultiMemberGroupAdminRoleGrant.Reply](#berty.types.v1.MultiMemberGroupAdminRoleGrant.Reply)
    - [MultiMemberGroupAdminRoleGrant.Request](#berty.types.v1.MultiMemberGroupAdminRoleGrant.Request)
    - [MultiMemberGroupAliasResolverDisclose](#berty.types.v1.MultiMemberGroupAliasResolverDisclose)
    - [MultiMemberGroupAliasResolverDisclose.Reply](#berty.types.v1.MultiMemberGroupAliasResolverDisclose.Reply)
    - [MultiMemberGroupAliasResolverDisclose.Request](#berty.types.v1.MultiMemberGroupAliasResolverDisclose.Request)
    - [MultiMemberGroupCreate](#berty.types.v1.MultiMemberGroupCreate)
    - [MultiMemberGroupCreate.Reply](#berty.types.v1.MultiMemberGroupCreate.Reply)
    - [MultiMemberGroupCreate.Request](#berty.types.v1.MultiMemberGroupCreate.Request)
    - [MultiMemberGroupInvitationCreate](#berty.types.v1.MultiMemberGroupInvitationCreate)
    - [MultiMemberGroupInvitationCreate.Reply](#berty.types.v1.MultiMemberGroupInvitationCreate.Reply)
    - [MultiMemberGroupInvitationCreate.Request](#berty.types.v1.MultiMemberGroupInvitationCreate.Request)
    - [MultiMemberGroupJoin](#berty.types.v1.MultiMemberGroupJoin)
    - [MultiMemberGroupJoin.Reply](#berty.types.v1.MultiMemberGroupJoin.Reply)
    - [MultiMemberGroupJoin.Request](#berty.types.v1.MultiMemberGroupJoin.Request)
    - [MultiMemberGroupLeave](#berty.types.v1.MultiMemberGroupLeave)
    - [MultiMemberGroupLeave.Reply](#berty.types.v1.MultiMemberGroupLeave.Reply)
    - [MultiMemberGroupLeave.Request](#berty.types.v1.MultiMemberGroupLeave.Request)
    - [MultiMemberInitialMember](#berty.types.v1.MultiMemberInitialMember)
    - [ShareableContact](#berty.types.v1.ShareableContact)
  
    - [ContactState](#berty.types.v1.ContactState)
    - [DebugInspectGroupLogType](#berty.types.v1.DebugInspectGroupLogType)
    - [EventType](#berty.types.v1.EventType)
    - [GroupType](#berty.types.v1.GroupType)
    - [InstanceGetConfiguration.SettingState](#berty.types.v1.InstanceGetConfiguration.SettingState)
  
- [Scalar Value Types](#scalar-value-types)

<a name="bertyprotocol.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## bertyprotocol.proto

 

 

 

<a name="berty.protocol.v1.ProtocolService"></a>

### ProtocolService
ProtocolService is the top-level API to manage an instance of the Berty Protocol.
Each Berty Protocol Instance is considered as a Berty device and is associated with a Berty user.

| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| InstanceExportData | [.berty.types.v1.InstanceExportData.Request](#berty.types.v1.InstanceExportData.Request) | [.berty.types.v1.InstanceExportData.Reply](#berty.types.v1.InstanceExportData.Reply) | InstanceExportData exports instance data |
| InstanceGetConfiguration | [.berty.types.v1.InstanceGetConfiguration.Request](#berty.types.v1.InstanceGetConfiguration.Request) | [.berty.types.v1.InstanceGetConfiguration.Reply](#berty.types.v1.InstanceGetConfiguration.Reply) | InstanceGetConfiguration gets current configuration of this protocol instance |
| ContactRequestReference | [.berty.types.v1.ContactRequestReference.Request](#berty.types.v1.ContactRequestReference.Request) | [.berty.types.v1.ContactRequestReference.Reply](#berty.types.v1.ContactRequestReference.Reply) | ContactRequestReference retrieves the information required to create a reference (types.v1.ie. included in a shareable link) to the current account |
| ContactRequestDisable | [.berty.types.v1.ContactRequestDisable.Request](#berty.types.v1.ContactRequestDisable.Request) | [.berty.types.v1.ContactRequestDisable.Reply](#berty.types.v1.ContactRequestDisable.Reply) | ContactRequestDisable disables incoming contact requests |
| ContactRequestEnable | [.berty.types.v1.ContactRequestEnable.Request](#berty.types.v1.ContactRequestEnable.Request) | [.berty.types.v1.ContactRequestEnable.Reply](#berty.types.v1.ContactRequestEnable.Reply) | ContactRequestEnable enables incoming contact requests |
| ContactRequestResetReference | [.berty.types.v1.ContactRequestResetReference.Request](#berty.types.v1.ContactRequestResetReference.Request) | [.berty.types.v1.ContactRequestResetReference.Reply](#berty.types.v1.ContactRequestResetReference.Reply) | ContactRequestResetReference changes the contact request reference |
| ContactRequestSend | [.berty.types.v1.ContactRequestSend.Request](#berty.types.v1.ContactRequestSend.Request) | [.berty.types.v1.ContactRequestSend.Reply](#berty.types.v1.ContactRequestSend.Reply) | ContactRequestSend attempt to send a contact request |
| ContactRequestAccept | [.berty.types.v1.ContactRequestAccept.Request](#berty.types.v1.ContactRequestAccept.Request) | [.berty.types.v1.ContactRequestAccept.Reply](#berty.types.v1.ContactRequestAccept.Reply) | ContactRequestAccept accepts a contact request |
| ContactRequestDiscard | [.berty.types.v1.ContactRequestDiscard.Request](#berty.types.v1.ContactRequestDiscard.Request) | [.berty.types.v1.ContactRequestDiscard.Reply](#berty.types.v1.ContactRequestDiscard.Reply) | ContactRequestDiscard ignores a contact request, without informing the other user |
| ContactBlock | [.berty.types.v1.ContactBlock.Request](#berty.types.v1.ContactBlock.Request) | [.berty.types.v1.ContactBlock.Reply](#berty.types.v1.ContactBlock.Reply) | ContactBlock blocks a contact from sending requests |
| ContactUnblock | [.berty.types.v1.ContactUnblock.Request](#berty.types.v1.ContactUnblock.Request) | [.berty.types.v1.ContactUnblock.Reply](#berty.types.v1.ContactUnblock.Reply) | ContactUnblock unblocks a contact from sending requests |
| ContactAliasKeySend | [.berty.types.v1.ContactAliasKeySend.Request](#berty.types.v1.ContactAliasKeySend.Request) | [.berty.types.v1.ContactAliasKeySend.Reply](#berty.types.v1.ContactAliasKeySend.Reply) | ContactAliasKeySend send an alias key to a contact, the contact will be able to assert that your account is being present on a multi-member group |
| MultiMemberGroupCreate | [.berty.types.v1.MultiMemberGroupCreate.Request](#berty.types.v1.MultiMemberGroupCreate.Request) | [.berty.types.v1.MultiMemberGroupCreate.Reply](#berty.types.v1.MultiMemberGroupCreate.Reply) | MultiMemberGroupCreate creates a new multi-member group |
| MultiMemberGroupJoin | [.berty.types.v1.MultiMemberGroupJoin.Request](#berty.types.v1.MultiMemberGroupJoin.Request) | [.berty.types.v1.MultiMemberGroupJoin.Reply](#berty.types.v1.MultiMemberGroupJoin.Reply) | MultiMemberGroupJoin joins a multi-member group |
| MultiMemberGroupLeave | [.berty.types.v1.MultiMemberGroupLeave.Request](#berty.types.v1.MultiMemberGroupLeave.Request) | [.berty.types.v1.MultiMemberGroupLeave.Reply](#berty.types.v1.MultiMemberGroupLeave.Reply) | MultiMemberGroupLeave leaves a multi-member group |
| MultiMemberGroupAliasResolverDisclose | [.berty.types.v1.MultiMemberGroupAliasResolverDisclose.Request](#berty.types.v1.MultiMemberGroupAliasResolverDisclose.Request) | [.berty.types.v1.MultiMemberGroupAliasResolverDisclose.Reply](#berty.types.v1.MultiMemberGroupAliasResolverDisclose.Reply) | MultiMemberGroupAliasResolverDisclose discloses your alias resolver key |
| MultiMemberGroupAdminRoleGrant | [.berty.types.v1.MultiMemberGroupAdminRoleGrant.Request](#berty.types.v1.MultiMemberGroupAdminRoleGrant.Request) | [.berty.types.v1.MultiMemberGroupAdminRoleGrant.Reply](#berty.types.v1.MultiMemberGroupAdminRoleGrant.Reply) | MultiMemberGroupAdminRoleGrant grants an admin role to a group member |
| MultiMemberGroupInvitationCreate | [.berty.types.v1.MultiMemberGroupInvitationCreate.Request](#berty.types.v1.MultiMemberGroupInvitationCreate.Request) | [.berty.types.v1.MultiMemberGroupInvitationCreate.Reply](#berty.types.v1.MultiMemberGroupInvitationCreate.Reply) | MultiMemberGroupInvitationCreate creates an invitation to a multi-member group |
| AppMetadataSend | [.berty.types.v1.AppMetadataSend.Request](#berty.types.v1.AppMetadataSend.Request) | [.berty.types.v1.AppMetadataSend.Reply](#berty.types.v1.AppMetadataSend.Reply) | AppMetadataSend adds an app event to the metadata store, the message is encrypted using a symmetric key and readable by future group members |
| AppMessageSend | [.berty.types.v1.AppMessageSend.Request](#berty.types.v1.AppMessageSend.Request) | [.berty.types.v1.AppMessageSend.Reply](#berty.types.v1.AppMessageSend.Reply) | AppMessageSend adds an app event to the message store, the message is encrypted using a derived key and readable by current group members |
| GroupMetadataSubscribe | [.berty.types.v1.GroupMetadataSubscribe.Request](#berty.types.v1.GroupMetadataSubscribe.Request) | [.berty.types.v1.GroupMetadataEvent](#berty.types.v1.GroupMetadataEvent) stream | GroupMetadataSubscribe subscribes to a group metadata updates (types.v1.or it can also retrieve the history) |
| GroupMessageSubscribe | [.berty.types.v1.GroupMessageSubscribe.Request](#berty.types.v1.GroupMessageSubscribe.Request) | [.berty.types.v1.GroupMessageEvent](#berty.types.v1.GroupMessageEvent) stream | GroupMessageSubscribe subscribes to a group message updates (types.v1.or it can also retrieve the history) |
| GroupMetadataList | [.berty.types.v1.GroupMetadataList.Request](#berty.types.v1.GroupMetadataList.Request) | [.berty.types.v1.GroupMetadataEvent](#berty.types.v1.GroupMetadataEvent) stream | GroupMetadataList replays metadata events from the group |
| GroupMessageList | [.berty.types.v1.GroupMessageList.Request](#berty.types.v1.GroupMessageList.Request) | [.berty.types.v1.GroupMessageEvent](#berty.types.v1.GroupMessageEvent) stream | GroupMessageList replays message events from the group |
| GroupInfo | [.berty.types.v1.GroupInfo.Request](#berty.types.v1.GroupInfo.Request) | [.berty.types.v1.GroupInfo.Reply](#berty.types.v1.GroupInfo.Reply) | GroupInfo retrieves information about a group |
| ActivateGroup | [.berty.types.v1.ActivateGroup.Request](#berty.types.v1.ActivateGroup.Request) | [.berty.types.v1.ActivateGroup.Reply](#berty.types.v1.ActivateGroup.Reply) | ActivateGroup explicitly opens a group, groups are automatically enabled when actions are performed on them |
| DeactivateGroup | [.berty.types.v1.DeactivateGroup.Request](#berty.types.v1.DeactivateGroup.Request) | [.berty.types.v1.DeactivateGroup.Reply](#berty.types.v1.DeactivateGroup.Reply) | DeactivateGroup closes a group |
| DebugListGroups | [.berty.types.v1.DebugListGroups.Request](#berty.types.v1.DebugListGroups.Request) | [.berty.types.v1.DebugListGroups.Reply](#berty.types.v1.DebugListGroups.Reply) stream |  |
| DebugInspectGroupStore | [.berty.types.v1.DebugInspectGroupStore.Request](#berty.types.v1.DebugInspectGroupStore.Request) | [.berty.types.v1.DebugInspectGroupStore.Reply](#berty.types.v1.DebugInspectGroupStore.Reply) stream |  |
| DebugGroup | [.berty.types.v1.DebugGroup.Request](#berty.types.v1.DebugGroup.Request) | [.berty.types.v1.DebugGroup.Reply](#berty.types.v1.DebugGroup.Reply) |  |

 

<a name="bertytypes.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## bertytypes.proto

<a name="berty.types.v1.Account"></a>

### Account
Account describes all the secrets that identifies an Account

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.types.v1.Group) |  | group specifies which group is used to manage the account |
| account_private_key | [bytes](#bytes) |  | account_private_key, private part is used to signs handshake, signs device, create contacts group keys via ECDH -- public part is used to have a shareable identity |
| alias_private_key | [bytes](#bytes) |  | alias_private_key, private part is use to derive group members private keys, signs alias proofs, public part can be shared to contacts to prove identity |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed, rendezvous seed used for direct communication |

<a name="berty.types.v1.AccountContactBlocked"></a>

### AccountContactBlocked
AccountContactBlocked indicates that a contact is blocked

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact blocked |

<a name="berty.types.v1.AccountContactRequestAccepted"></a>

### AccountContactRequestAccepted
This event should be followed by an AccountGroupJoined event
This event should be followed by GroupAddMemberDevice and GroupAddDeviceSecret events within the AccountGroup
AccountContactRequestAccepted indicates that a contact request has been accepted

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact whom request is accepted |
| group_pk | [bytes](#bytes) |  | group_pk is the 1to1 group with the requester user |

<a name="berty.types.v1.AccountContactRequestDisabled"></a>

### AccountContactRequestDisabled
AccountContactRequestDisabled indicates that the account should not be advertised on a public rendezvous point

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |

<a name="berty.types.v1.AccountContactRequestDiscarded"></a>

### AccountContactRequestDiscarded
AccountContactRequestDiscarded indicates that a contact request has been refused

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact whom request is refused |

<a name="berty.types.v1.AccountContactRequestEnabled"></a>

### AccountContactRequestEnabled
AccountContactRequestDisabled indicates that the account should be advertised on a public rendezvous point

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |

<a name="berty.types.v1.AccountContactRequestEnqueued"></a>

### AccountContactRequestEnqueued
This event should be followed by an AccountGroupJoined event
This event should be followed by a GroupAddMemberDevice event within the AccountGroup
This event should be followed by a GroupAddDeviceSecret event within the AccountGroup
AccountContactRequestEnqueued indicates that the account will attempt to send a contact request when a matching peer is discovered

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| group_pk | [bytes](#bytes) |  | group_pk is the 1to1 group with the requested user |
| contact | [ShareableContact](#berty.types.v1.ShareableContact) |  | contact is a message describing how to connect to the other account |
| own_metadata | [bytes](#bytes) |  | own_metadata is the identifying metadata that will be shared to the other account |

<a name="berty.types.v1.AccountContactRequestReceived"></a>

### AccountContactRequestReceived
AccountContactRequestReceived indicates that the account has received a new contact request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the account event (which received the contact request), signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the account sending the request |
| contact_rendezvous_seed | [bytes](#bytes) |  | TODO: is this necessary? contact_rendezvous_seed is the rendezvous seed of the contact sending the request |
| contact_metadata | [bytes](#bytes) |  | TODO: is this necessary? contact_metadata is the metadata specific to the app to identify the contact for the request |

<a name="berty.types.v1.AccountContactRequestReferenceReset"></a>

### AccountContactRequestReferenceReset
AccountContactRequestDisabled indicates that the account should be advertised on different public rendezvous points

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the new rendezvous point seed |

<a name="berty.types.v1.AccountContactRequestSent"></a>

### AccountContactRequestSent
AccountContactRequestSent indicates that the account has sent a contact request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the account event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contacted account |

<a name="berty.types.v1.AccountContactUnblocked"></a>

### AccountContactUnblocked
AccountContactUnblocked indicates that a contact is unblocked

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact unblocked |

<a name="berty.types.v1.AccountGroupJoined"></a>

### AccountGroupJoined
AccountGroupJoined indicates that the account is now part of a new group

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| group | [Group](#berty.types.v1.Group) |  | group describe the joined group |

<a name="berty.types.v1.AccountGroupLeft"></a>

### AccountGroupLeft
AccountGroupJoined indicates that the account has left a group

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| group_pk | [bytes](#bytes) |  | group_pk references the group left |

<a name="berty.types.v1.ActivateGroup"></a>

### ActivateGroup

<a name="berty.types.v1.ActivateGroup.Reply"></a>

### ActivateGroup.Reply

<a name="berty.types.v1.ActivateGroup.Request"></a>

### ActivateGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.types.v1.AppMessageSend"></a>

### AppMessageSend

<a name="berty.types.v1.AppMessageSend.Reply"></a>

### AppMessageSend.Reply

<a name="berty.types.v1.AppMessageSend.Request"></a>

### AppMessageSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| payload | [bytes](#bytes) |  | payload is the payload to send |

<a name="berty.types.v1.AppMetadata"></a>

### AppMetadata
AppMetadata is an app defined message, accessible to future group members

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| message | [bytes](#bytes) |  | message is the payload |

<a name="berty.types.v1.AppMetadataSend"></a>

### AppMetadataSend

<a name="berty.types.v1.AppMetadataSend.Reply"></a>

### AppMetadataSend.Reply

<a name="berty.types.v1.AppMetadataSend.Request"></a>

### AppMetadataSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| payload | [bytes](#bytes) |  | payload is the payload to send |

<a name="berty.types.v1.ContactAddAliasKey"></a>

### ContactAddAliasKey
ContactAddAliasKey is an event type where ones shares their alias public key

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| alias_pk | [bytes](#bytes) |  | alias_pk is the alias key which will be used to verify a contact identity |

<a name="berty.types.v1.ContactAliasKeySend"></a>

### ContactAliasKeySend

<a name="berty.types.v1.ContactAliasKeySend.Reply"></a>

### ContactAliasKeySend.Reply

<a name="berty.types.v1.ContactAliasKeySend.Request"></a>

### ContactAliasKeySend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to send the alias public key to |

<a name="berty.types.v1.ContactBlock"></a>

### ContactBlock

<a name="berty.types.v1.ContactBlock.Reply"></a>

### ContactBlock.Reply

<a name="berty.types.v1.ContactBlock.Request"></a>

### ContactBlock.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to block |

<a name="berty.types.v1.ContactRequestAccept"></a>

### ContactRequestAccept

<a name="berty.types.v1.ContactRequestAccept.Reply"></a>

### ContactRequestAccept.Reply

<a name="berty.types.v1.ContactRequestAccept.Request"></a>

### ContactRequestAccept.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to accept the request from |

<a name="berty.types.v1.ContactRequestDisable"></a>

### ContactRequestDisable

<a name="berty.types.v1.ContactRequestDisable.Reply"></a>

### ContactRequestDisable.Reply

<a name="berty.types.v1.ContactRequestDisable.Request"></a>

### ContactRequestDisable.Request

<a name="berty.types.v1.ContactRequestDiscard"></a>

### ContactRequestDiscard

<a name="berty.types.v1.ContactRequestDiscard.Reply"></a>

### ContactRequestDiscard.Reply

<a name="berty.types.v1.ContactRequestDiscard.Request"></a>

### ContactRequestDiscard.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to ignore the request from |

<a name="berty.types.v1.ContactRequestEnable"></a>

### ContactRequestEnable

<a name="berty.types.v1.ContactRequestEnable.Reply"></a>

### ContactRequestEnable.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the rendezvous seed used by the current account |

<a name="berty.types.v1.ContactRequestEnable.Request"></a>

### ContactRequestEnable.Request

<a name="berty.types.v1.ContactRequestReference"></a>

### ContactRequestReference

<a name="berty.types.v1.ContactRequestReference.Reply"></a>

### ContactRequestReference.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the rendezvous seed used by the current account |
| enabled | [bool](#bool) |  | enabled indicates if incoming contact requests are enabled |

<a name="berty.types.v1.ContactRequestReference.Request"></a>

### ContactRequestReference.Request

<a name="berty.types.v1.ContactRequestResetReference"></a>

### ContactRequestResetReference

<a name="berty.types.v1.ContactRequestResetReference.Reply"></a>

### ContactRequestResetReference.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the rendezvous seed used by the current account |

<a name="berty.types.v1.ContactRequestResetReference.Request"></a>

### ContactRequestResetReference.Request

<a name="berty.types.v1.ContactRequestSend"></a>

### ContactRequestSend

<a name="berty.types.v1.ContactRequestSend.Reply"></a>

### ContactRequestSend.Reply

<a name="berty.types.v1.ContactRequestSend.Request"></a>

### ContactRequestSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact | [ShareableContact](#berty.types.v1.ShareableContact) |  | contact is a message describing how to connect to the other account |
| own_metadata | [bytes](#bytes) |  | own_metadata is the identifying metadata that will be shared to the other account |

<a name="berty.types.v1.ContactUnblock"></a>

### ContactUnblock

<a name="berty.types.v1.ContactUnblock.Reply"></a>

### ContactUnblock.Reply

<a name="berty.types.v1.ContactUnblock.Request"></a>

### ContactUnblock.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to unblock |

<a name="berty.types.v1.DeactivateGroup"></a>

### DeactivateGroup

<a name="berty.types.v1.DeactivateGroup.Reply"></a>

### DeactivateGroup.Reply

<a name="berty.types.v1.DeactivateGroup.Request"></a>

### DeactivateGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.types.v1.DebugGroup"></a>

### DebugGroup

<a name="berty.types.v1.DebugGroup.Reply"></a>

### DebugGroup.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| peer_ids | [string](#string) | repeated | peer_ids is the list of peer ids connected to the same group |

<a name="berty.types.v1.DebugGroup.Request"></a>

### DebugGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.types.v1.DebugInspectGroupStore"></a>

### DebugInspectGroupStore

<a name="berty.types.v1.DebugInspectGroupStore.Reply"></a>

### DebugInspectGroupStore.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| cid | [bytes](#bytes) |  | cid is the CID of the IPFS log entry |
| parent_cids | [bytes](#bytes) | repeated | parent_cids is the list of the parent entries |
| metadata_event_type | [EventType](#berty.types.v1.EventType) |  | event_type metadata event type if subscribed to metadata events |
| device_pk | [bytes](#bytes) |  | device_pk is the public key of the device signing the entry |
| payload | [bytes](#bytes) |  | payload is the un encrypted entry payload if available |

<a name="berty.types.v1.DebugInspectGroupStore.Request"></a>

### DebugInspectGroupStore.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| log_type | [DebugInspectGroupLogType](#berty.types.v1.DebugInspectGroupLogType) |  | log_type is the log to inspect |

<a name="berty.types.v1.DebugListGroups"></a>

### DebugListGroups

<a name="berty.types.v1.DebugListGroups.Reply"></a>

### DebugListGroups.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the public key of the group |
| group_type | [GroupType](#berty.types.v1.GroupType) |  | group_type is the type of the group |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact public key if appropriate |

<a name="berty.types.v1.DebugListGroups.Request"></a>

### DebugListGroups.Request

<a name="berty.types.v1.DeviceSecret"></a>

### DeviceSecret
DeviceSecret is encrypted for a specific member of the group

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| chain_key | [bytes](#bytes) |  | chain_key is the current value of the chain key of the group device |
| counter | [uint64](#uint64) |  | counter is the current value of the counter of the group device |

<a name="berty.types.v1.EventContext"></a>

### EventContext
EventContext adds context (its id and its parents) to an event

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [bytes](#bytes) |  | id is the CID of the underlying OrbitDB event |
| parent_ids | [bytes](#bytes) | repeated | id are the the CIDs of the underlying parents of the OrbitDB event |
| group_pk | [bytes](#bytes) |  | group_pk receiving the event |

<a name="berty.types.v1.Group"></a>

### Group
Group define a group and is enough to invite someone to it

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [bytes](#bytes) |  | public_key is the identifier of the group, it signs the group secret and the initial member of a multi-member group |
| secret | [bytes](#bytes) |  | secret is the symmetric secret of the group, which is used to encrypt the metadata |
| secret_sig | [bytes](#bytes) |  | secret_sig is the signature of the secret used to ensure the validity of the group |
| group_type | [GroupType](#berty.types.v1.GroupType) |  | group_type specifies the type of the group |

<a name="berty.types.v1.GroupAddAdditionalRendezvousSeed"></a>

### GroupAddAdditionalRendezvousSeed
GroupAddAdditionalRendezvousSeed indicates that an additional rendezvous point should be used for data synchronization

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message, must be the device of an admin of the group |
| seed | [bytes](#bytes) |  | seed is the additional rendezvous point seed which should be used |

<a name="berty.types.v1.GroupAddDeviceSecret"></a>

### GroupAddDeviceSecret
GroupAddDeviceSecret is an event which indicates to a group member a device secret

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| dest_member_pk | [bytes](#bytes) |  | dest_member_pk is the member who should receive the secret |
| payload | [bytes](#bytes) |  | payload is the serialization of Payload encrypted for the specified member |

<a name="berty.types.v1.GroupAddMemberDevice"></a>

### GroupAddMemberDevice
GroupAddMemberDevice is an event which indicates to a group a new device (and eventually a new member) is joining it
When added on AccountGroup, this event should be followed by appropriate GroupAddMemberDevice and GroupAddDeviceSecret events

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| member_pk | [bytes](#bytes) |  | member_pk is the member sending the event |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| member_sig | [bytes](#bytes) |  | member_sig is used to prove the ownership of the member pk

TODO: signature of what ??? ensure it can&#39;t be replayed |

<a name="berty.types.v1.GroupEnvelope"></a>

### GroupEnvelope
GroupEnvelope is a publicly exposed structure containing a group metadata event

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| nonce | [bytes](#bytes) |  | nonce is used to encrypt the message |
| event | [bytes](#bytes) |  | event is encrypted using a symmetric key shared among group members |

<a name="berty.types.v1.GroupInfo"></a>

### GroupInfo

<a name="berty.types.v1.GroupInfo.Reply"></a>

### GroupInfo.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.types.v1.Group) |  | group is the group invitation, containing the group pk and its type |
| member_pk | [bytes](#bytes) |  | member_pk is the identifier of the current member in the group |
| device_pk | [bytes](#bytes) |  | member_pk is the identifier of the current device in the group |

<a name="berty.types.v1.GroupInfo.Request"></a>

### GroupInfo.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact |

<a name="berty.types.v1.GroupMessageEvent"></a>

### GroupMessageEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event_context | [EventContext](#berty.types.v1.EventContext) |  | event_context contains context information about the event |
| headers | [MessageHeaders](#berty.types.v1.MessageHeaders) |  | headers contains headers of the secure message |
| message | [bytes](#bytes) |  | message contains the secure message payload |

<a name="berty.types.v1.GroupMessageList"></a>

### GroupMessageList

<a name="berty.types.v1.GroupMessageList.Request"></a>

### GroupMessageList.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.types.v1.GroupMessageSubscribe"></a>

### GroupMessageSubscribe

<a name="berty.types.v1.GroupMessageSubscribe.Request"></a>

### GroupMessageSubscribe.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| since | [bytes](#bytes) |  | since is the lower ID bound used to filter events |
| until | [bytes](#bytes) |  | until is the upper ID bound used to filter events |
| go_backwards | [bool](#bool) |  | go_backwards indicates whether the events should be returned in reverse order |

<a name="berty.types.v1.GroupMetadata"></a>

### GroupMetadata
GroupMetadata is used in GroupEnvelope and only readable by invited group members

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event_type | [EventType](#berty.types.v1.EventType) |  | event_type defines which event type is used |
| payload | [bytes](#bytes) |  | the serialization depends on event_type, event is symmetrically encrypted |
| sig | [bytes](#bytes) |  | sig is the signature of the payload, it depends on the event_type for the used key |

<a name="berty.types.v1.GroupMetadataEvent"></a>

### GroupMetadataEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event_context | [EventContext](#berty.types.v1.EventContext) |  | event_context contains context information about the event |
| metadata | [GroupMetadata](#berty.types.v1.GroupMetadata) |  | metadata contains the newly available metadata |
| event | [bytes](#bytes) |  | event_clear clear bytes for the event |

<a name="berty.types.v1.GroupMetadataList"></a>

### GroupMetadataList

<a name="berty.types.v1.GroupMetadataList.Request"></a>

### GroupMetadataList.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.types.v1.GroupMetadataSubscribe"></a>

### GroupMetadataSubscribe

<a name="berty.types.v1.GroupMetadataSubscribe.Request"></a>

### GroupMetadataSubscribe.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| since | [bytes](#bytes) |  | since is the lower ID bound used to filter events |
| until | [bytes](#bytes) |  | until is the upper ID bound used to filter events |
| go_backwards | [bool](#bool) |  | go_backwards indicates whether the events should be returned in reverse order |

<a name="berty.types.v1.GroupRemoveAdditionalRendezvousSeed"></a>

### GroupRemoveAdditionalRendezvousSeed
GroupRemoveAdditionalRendezvousSeed indicates that a previously added rendezvous point should be removed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message, must be the device of an admin of the group |
| seed | [bytes](#bytes) |  | seed is the additional rendezvous point seed which should be removed |

<a name="berty.types.v1.InstanceExportData"></a>

### InstanceExportData

<a name="berty.types.v1.InstanceExportData.Reply"></a>

### InstanceExportData.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| exported_data | [bytes](#bytes) |  |  |

<a name="berty.types.v1.InstanceExportData.Request"></a>

### InstanceExportData.Request

<a name="berty.types.v1.InstanceGetConfiguration"></a>

### InstanceGetConfiguration

<a name="berty.types.v1.InstanceGetConfiguration.Reply"></a>

### InstanceGetConfiguration.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| account_pk | [bytes](#bytes) |  | account_pk is the public key of the current account |
| device_pk | [bytes](#bytes) |  | device_pk is the public key of the current device |
| account_group_pk | [bytes](#bytes) |  | account_group_pk is the public key of the account group |
| peer_id | [string](#string) |  |  |
| listeners | [string](#string) | repeated |  |
| ble_enabled | [InstanceGetConfiguration.SettingState](#berty.types.v1.InstanceGetConfiguration.SettingState) |  |  |
| wifi_p2p_enabled | [InstanceGetConfiguration.SettingState](#berty.types.v1.InstanceGetConfiguration.SettingState) |  | MultiPeerConnectivity for Darwin and Nearby for Android |
| mdns_enabled | [InstanceGetConfiguration.SettingState](#berty.types.v1.InstanceGetConfiguration.SettingState) |  |  |
| relay_enabled | [InstanceGetConfiguration.SettingState](#berty.types.v1.InstanceGetConfiguration.SettingState) |  |  |

<a name="berty.types.v1.InstanceGetConfiguration.Request"></a>

### InstanceGetConfiguration.Request

<a name="berty.types.v1.MessageEnvelope"></a>

### MessageEnvelope
MessageEnvelope is a publicly exposed structure containing a group secure message

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| message_headers | [bytes](#bytes) |  | message_headers is an encrypted serialization using a symmetric key of a MessageHeaders message |
| message | [bytes](#bytes) |  | message is an encrypted message, only readable by group members who previously received the appropriate chain key |
| nonce | [bytes](#bytes) |  | nonce is a nonce for message headers |

<a name="berty.types.v1.MessageHeaders"></a>

### MessageHeaders
MessageHeaders is used in MessageEnvelope and only readable by invited group members

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| counter | [uint64](#uint64) |  | counter is the current counter value for the specified device |
| device_pk | [bytes](#bytes) |  | device_pk is the public key of the device sending the message |
| sig | [bytes](#bytes) |  | sig is the signature of the encrypted message using the device&#39;s private key |
| metadata | [MessageHeaders.MetadataEntry](#berty.types.v1.MessageHeaders.MetadataEntry) | repeated | metadata allow to pass custom informations |

<a name="berty.types.v1.MessageHeaders.MetadataEntry"></a>

### MessageHeaders.MetadataEntry

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| key | [string](#string) |  |  |
| value | [string](#string) |  |  |

<a name="berty.types.v1.MultiMemberGrantAdminRole"></a>

### MultiMemberGrantAdminRole
MultiMemberGrantAdminRole indicates that a group admin allows another group member to act as an admin

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message, must be the device of an admin of the group |
| grantee_member_pk | [bytes](#bytes) |  | grantee_member_pk is the member public key of the member granted of the admin role |

<a name="berty.types.v1.MultiMemberGroupAddAliasResolver"></a>

### MultiMemberGroupAddAliasResolver
MultiMemberGroupAddAliasResolver indicates that a group member want to disclose their presence in the group to their contacts

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| alias_resolver | [bytes](#bytes) |  | alias_resolver allows contact of an account to resolve the real identity behind an alias (Multi-Member Group Member) Generated by both contacts and account independently using: hmac(aliasPK, GroupID) |
| alias_proof | [bytes](#bytes) |  | alias_proof ensures that the associated alias_resolver has been issued by the right account Generated using aliasSKSig(GroupID) |

<a name="berty.types.v1.MultiMemberGroupAdminRoleGrant"></a>

### MultiMemberGroupAdminRoleGrant

<a name="berty.types.v1.MultiMemberGroupAdminRoleGrant.Reply"></a>

### MultiMemberGroupAdminRoleGrant.Reply

<a name="berty.types.v1.MultiMemberGroupAdminRoleGrant.Request"></a>

### MultiMemberGroupAdminRoleGrant.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| member_pk | [bytes](#bytes) |  | member_pk is the identifier of the member which will be granted the admin role |

<a name="berty.types.v1.MultiMemberGroupAliasResolverDisclose"></a>

### MultiMemberGroupAliasResolverDisclose

<a name="berty.types.v1.MultiMemberGroupAliasResolverDisclose.Reply"></a>

### MultiMemberGroupAliasResolverDisclose.Reply

<a name="berty.types.v1.MultiMemberGroupAliasResolverDisclose.Request"></a>

### MultiMemberGroupAliasResolverDisclose.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.types.v1.MultiMemberGroupCreate"></a>

### MultiMemberGroupCreate

<a name="berty.types.v1.MultiMemberGroupCreate.Reply"></a>

### MultiMemberGroupCreate.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the newly created group |

<a name="berty.types.v1.MultiMemberGroupCreate.Request"></a>

### MultiMemberGroupCreate.Request

<a name="berty.types.v1.MultiMemberGroupInvitationCreate"></a>

### MultiMemberGroupInvitationCreate

<a name="berty.types.v1.MultiMemberGroupInvitationCreate.Reply"></a>

### MultiMemberGroupInvitationCreate.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.types.v1.Group) |  | group is the invitation to the group |

<a name="berty.types.v1.MultiMemberGroupInvitationCreate.Request"></a>

### MultiMemberGroupInvitationCreate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.types.v1.MultiMemberGroupJoin"></a>

### MultiMemberGroupJoin

<a name="berty.types.v1.MultiMemberGroupJoin.Reply"></a>

### MultiMemberGroupJoin.Reply

<a name="berty.types.v1.MultiMemberGroupJoin.Request"></a>

### MultiMemberGroupJoin.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.types.v1.Group) |  | group is the information of the group to join |

<a name="berty.types.v1.MultiMemberGroupLeave"></a>

### MultiMemberGroupLeave

<a name="berty.types.v1.MultiMemberGroupLeave.Reply"></a>

### MultiMemberGroupLeave.Reply

<a name="berty.types.v1.MultiMemberGroupLeave.Request"></a>

### MultiMemberGroupLeave.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  |  |

<a name="berty.types.v1.MultiMemberInitialMember"></a>

### MultiMemberInitialMember
MultiMemberInitialMember indicates that a member is the group creator, this event is signed using the group ID private key

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| member_pk | [bytes](#bytes) |  | member_pk is the public key of the member who is the group creator |

<a name="berty.types.v1.ShareableContact"></a>

### ShareableContact

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| pk | [bytes](#bytes) |  | pk is the account to send a contact request to |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the rendezvous seed used by the account to send a contact request to |
| metadata | [bytes](#bytes) |  | metadata is the metadata specific to the app to identify the contact for the request |

 

<a name="berty.types.v1.ContactState"></a>

### ContactState

| Name | Number | Description |
| ---- | ------ | ----------- |
| ContactStateUndefined | 0 |  |
| ContactStateToRequest | 1 |  |
| ContactStateReceived | 2 |  |
| ContactStateAdded | 3 |  |
| ContactStateRemoved | 4 |  |
| ContactStateDiscarded | 5 |  |
| ContactStateBlocked | 6 |  |

<a name="berty.types.v1.DebugInspectGroupLogType"></a>

### DebugInspectGroupLogType

| Name | Number | Description |
| ---- | ------ | ----------- |
| DebugInspectGroupLogTypeUndefined | 0 |  |
| DebugInspectGroupLogTypeMessage | 1 |  |
| DebugInspectGroupLogTypeMetadata | 2 |  |

<a name="berty.types.v1.EventType"></a>

### EventType

| Name | Number | Description |
| ---- | ------ | ----------- |
| EventTypeUndefined | 0 | EventTypeUndefined indicates that the value has not been set. Should not happen. |
| EventTypeGroupMemberDeviceAdded | 1 | EventTypeGroupMemberDeviceAdded indicates the payload includes that a member has added their device to the group |
| EventTypeGroupDeviceSecretAdded | 2 | EventTypeGroupDeviceSecretAdded indicates the payload includes that a member has sent their device secret to another member |
| EventTypeAccountGroupJoined | 101 | EventTypeAccountGroupJoined indicates the payload includes that the account has joined a group |
| EventTypeAccountGroupLeft | 102 | EventTypeAccountGroupLeft indicates the payload includes that the account has left a group |
| EventTypeAccountContactRequestDisabled | 103 | EventTypeAccountContactRequestDisabled indicates the payload includes that the account has disabled incoming contact requests |
| EventTypeAccountContactRequestEnabled | 104 | EventTypeAccountContactRequestEnabled indicates the payload includes that the account has enabled incoming contact requests |
| EventTypeAccountContactRequestReferenceReset | 105 | EventTypeAccountContactRequestReferenceReset indicates the payload includes that the account has a new contact request rendezvous seed |
| EventTypeAccountContactRequestOutgoingEnqueued | 106 | EventTypeAccountContactRequestEnqueued indicates the payload includes that the account will attempt to send a new contact request |
| EventTypeAccountContactRequestOutgoingSent | 107 | EventTypeAccountContactRequestSent indicates the payload includes that the account has sent a contact request |
| EventTypeAccountContactRequestIncomingReceived | 108 | EventTypeAccountContactRequestReceived indicates the payload includes that the account has received a contact request |
| EventTypeAccountContactRequestIncomingDiscarded | 109 | EventTypeAccountContactRequestIncomingDiscarded indicates the payload includes that the account has ignored a contact request |
| EventTypeAccountContactRequestIncomingAccepted | 110 | EventTypeAccountContactRequestAccepted indicates the payload includes that the account has accepted a contact request |
| EventTypeAccountContactBlocked | 111 | EventTypeAccountContactBlocked indicates the payload includes that the account has blocked a contact |
| EventTypeAccountContactUnblocked | 112 | EventTypeAccountContactUnblocked indicates the payload includes that the account has unblocked a contact |
| EventTypeContactAliasKeyAdded | 201 | EventTypeContactAliasKeyAdded indicates the payload includes that the contact group has received an alias key |
| EventTypeMultiMemberGroupAliasResolverAdded | 301 | EventTypeMultiMemberGroupAliasResolverAdded indicates the payload includes that a member of the group sent their alias proof |
| EventTypeMultiMemberGroupInitialMemberAnnounced | 302 | EventTypeMultiMemberGroupInitialMemberAnnounced indicates the payload includes that a member has authenticated themselves as the group owner |
| EventTypeMultiMemberGroupAdminRoleGranted | 303 | EventTypeMultiMemberGroupAdminRoleGranted indicates the payload includes that an admin of the group granted another member as an admin |
| EventTypeGroupMetadataPayloadSent | 1001 | EventTypeGroupMetadataPayloadSent indicates the payload includes an app specific event, unlike messages stored on the message store it is encrypted using a static key |

<a name="berty.types.v1.GroupType"></a>

### GroupType

| Name | Number | Description |
| ---- | ------ | ----------- |
| GroupTypeUndefined | 0 | GroupTypeUndefined indicates that the value has not been set. Should not happen. |
| GroupTypeAccount | 1 | GroupTypeAccount is the group managing an account, available to all its devices. |
| GroupTypeContact | 2 | GroupTypeContact is the group created between two accounts, available to all their devices. |
| GroupTypeMultiMember | 3 | GroupTypeMultiMember is a group containing an undefined number of members. |

<a name="berty.types.v1.InstanceGetConfiguration.SettingState"></a>

### InstanceGetConfiguration.SettingState

| Name | Number | Description |
| ---- | ------ | ----------- |
| Unknown | 0 |  |
| Enabled | 1 |  |
| Disabled | 2 |  |
| Unavailable | 3 |  |

 

 

 

## Scalar Value Types

| .proto Type | Notes | C++ | Java | Python | Go | C# | PHP | Ruby |
| ----------- | ----- | --- | ---- | ------ | -- | -- | --- | ---- |
| <a name="double" /> double |  | double | double | float | float64 | double | float | Float |
| <a name="float" /> float |  | float | float | float | float32 | float | float | Float |
| <a name="int32" /> int32 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint32 instead. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="int64" /> int64 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint64 instead. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="uint32" /> uint32 | Uses variable-length encoding. | uint32 | int | int/long | uint32 | uint | integer | Bignum or Fixnum (as required) |
| <a name="uint64" /> uint64 | Uses variable-length encoding. | uint64 | long | int/long | uint64 | ulong | integer/string | Bignum or Fixnum (as required) |
| <a name="sint32" /> sint32 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int32s. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="sint64" /> sint64 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int64s. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="fixed32" /> fixed32 | Always four bytes. More efficient than uint32 if values are often greater than 2^28. | uint32 | int | int | uint32 | uint | integer | Bignum or Fixnum (as required) |
| <a name="fixed64" /> fixed64 | Always eight bytes. More efficient than uint64 if values are often greater than 2^56. | uint64 | long | int/long | uint64 | ulong | integer/string | Bignum |
| <a name="sfixed32" /> sfixed32 | Always four bytes. | int32 | int | int | int32 | int | integer | Bignum or Fixnum (as required) |
| <a name="sfixed64" /> sfixed64 | Always eight bytes. | int64 | long | int/long | int64 | long | integer/string | Bignum |
| <a name="bool" /> bool |  | bool | boolean | boolean | bool | bool | boolean | TrueClass/FalseClass |
| <a name="string" /> string | A string must always contain UTF-8 encoded or 7-bit ASCII text. | string | String | str/unicode | string | string | string | String (UTF-8) |
| <a name="bytes" /> bytes | May contain any arbitrary sequence of bytes. | string | ByteString | str | []byte | ByteString | string | String (ASCII-8BIT) |

