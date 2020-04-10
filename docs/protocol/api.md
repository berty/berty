# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [bertyprotocol.proto](#bertyprotocol.proto)
  
  
  
    - [ProtocolService](#berty.protocol.ProtocolService)
  

- [bertytypes.proto](#bertytypes.proto)
    - [Account](#berty.types.Account)
    - [AccountContactBlocked](#berty.types.AccountContactBlocked)
    - [AccountContactRequestAccepted](#berty.types.AccountContactRequestAccepted)
    - [AccountContactRequestDisabled](#berty.types.AccountContactRequestDisabled)
    - [AccountContactRequestDiscarded](#berty.types.AccountContactRequestDiscarded)
    - [AccountContactRequestEnabled](#berty.types.AccountContactRequestEnabled)
    - [AccountContactRequestEnqueued](#berty.types.AccountContactRequestEnqueued)
    - [AccountContactRequestReceived](#berty.types.AccountContactRequestReceived)
    - [AccountContactRequestReferenceReset](#berty.types.AccountContactRequestReferenceReset)
    - [AccountContactRequestSent](#berty.types.AccountContactRequestSent)
    - [AccountContactUnblocked](#berty.types.AccountContactUnblocked)
    - [AccountGroupJoined](#berty.types.AccountGroupJoined)
    - [AccountGroupLeft](#berty.types.AccountGroupLeft)
    - [ActivateGroup](#berty.types.ActivateGroup)
    - [ActivateGroup.Reply](#berty.types.ActivateGroup.Reply)
    - [ActivateGroup.Request](#berty.types.ActivateGroup.Request)
    - [AppMessageSend](#berty.types.AppMessageSend)
    - [AppMessageSend.Reply](#berty.types.AppMessageSend.Reply)
    - [AppMessageSend.Request](#berty.types.AppMessageSend.Request)
    - [AppMetadata](#berty.types.AppMetadata)
    - [AppMetadataSend](#berty.types.AppMetadataSend)
    - [AppMetadataSend.Reply](#berty.types.AppMetadataSend.Reply)
    - [AppMetadataSend.Request](#berty.types.AppMetadataSend.Request)
    - [ContactAddAliasKey](#berty.types.ContactAddAliasKey)
    - [ContactAliasKeySend](#berty.types.ContactAliasKeySend)
    - [ContactAliasKeySend.Reply](#berty.types.ContactAliasKeySend.Reply)
    - [ContactAliasKeySend.Request](#berty.types.ContactAliasKeySend.Request)
    - [ContactBlock](#berty.types.ContactBlock)
    - [ContactBlock.Reply](#berty.types.ContactBlock.Reply)
    - [ContactBlock.Request](#berty.types.ContactBlock.Request)
    - [ContactRequestAccept](#berty.types.ContactRequestAccept)
    - [ContactRequestAccept.Reply](#berty.types.ContactRequestAccept.Reply)
    - [ContactRequestAccept.Request](#berty.types.ContactRequestAccept.Request)
    - [ContactRequestDisable](#berty.types.ContactRequestDisable)
    - [ContactRequestDisable.Reply](#berty.types.ContactRequestDisable.Reply)
    - [ContactRequestDisable.Request](#berty.types.ContactRequestDisable.Request)
    - [ContactRequestDiscard](#berty.types.ContactRequestDiscard)
    - [ContactRequestDiscard.Reply](#berty.types.ContactRequestDiscard.Reply)
    - [ContactRequestDiscard.Request](#berty.types.ContactRequestDiscard.Request)
    - [ContactRequestEnable](#berty.types.ContactRequestEnable)
    - [ContactRequestEnable.Reply](#berty.types.ContactRequestEnable.Reply)
    - [ContactRequestEnable.Request](#berty.types.ContactRequestEnable.Request)
    - [ContactRequestReference](#berty.types.ContactRequestReference)
    - [ContactRequestReference.Reply](#berty.types.ContactRequestReference.Reply)
    - [ContactRequestReference.Request](#berty.types.ContactRequestReference.Request)
    - [ContactRequestResetReference](#berty.types.ContactRequestResetReference)
    - [ContactRequestResetReference.Reply](#berty.types.ContactRequestResetReference.Reply)
    - [ContactRequestResetReference.Request](#berty.types.ContactRequestResetReference.Request)
    - [ContactRequestSend](#berty.types.ContactRequestSend)
    - [ContactRequestSend.Reply](#berty.types.ContactRequestSend.Reply)
    - [ContactRequestSend.Request](#berty.types.ContactRequestSend.Request)
    - [ContactUnblock](#berty.types.ContactUnblock)
    - [ContactUnblock.Reply](#berty.types.ContactUnblock.Reply)
    - [ContactUnblock.Request](#berty.types.ContactUnblock.Request)
    - [DeactivateGroup](#berty.types.DeactivateGroup)
    - [DeactivateGroup.Reply](#berty.types.DeactivateGroup.Reply)
    - [DeactivateGroup.Request](#berty.types.DeactivateGroup.Request)
    - [DeviceSecret](#berty.types.DeviceSecret)
    - [EventContext](#berty.types.EventContext)
    - [Group](#berty.types.Group)
    - [GroupAddAdditionalRendezvousSeed](#berty.types.GroupAddAdditionalRendezvousSeed)
    - [GroupAddDeviceSecret](#berty.types.GroupAddDeviceSecret)
    - [GroupAddMemberDevice](#berty.types.GroupAddMemberDevice)
    - [GroupEnvelope](#berty.types.GroupEnvelope)
    - [GroupInfo](#berty.types.GroupInfo)
    - [GroupInfo.Reply](#berty.types.GroupInfo.Reply)
    - [GroupInfo.Request](#berty.types.GroupInfo.Request)
    - [GroupMessageEvent](#berty.types.GroupMessageEvent)
    - [GroupMessageList](#berty.types.GroupMessageList)
    - [GroupMessageList.Request](#berty.types.GroupMessageList.Request)
    - [GroupMessageSubscribe](#berty.types.GroupMessageSubscribe)
    - [GroupMessageSubscribe.Request](#berty.types.GroupMessageSubscribe.Request)
    - [GroupMetadata](#berty.types.GroupMetadata)
    - [GroupMetadataEvent](#berty.types.GroupMetadataEvent)
    - [GroupMetadataList](#berty.types.GroupMetadataList)
    - [GroupMetadataList.Request](#berty.types.GroupMetadataList.Request)
    - [GroupMetadataSubscribe](#berty.types.GroupMetadataSubscribe)
    - [GroupMetadataSubscribe.Request](#berty.types.GroupMetadataSubscribe.Request)
    - [GroupRemoveAdditionalRendezvousSeed](#berty.types.GroupRemoveAdditionalRendezvousSeed)
    - [InstanceExportData](#berty.types.InstanceExportData)
    - [InstanceExportData.Reply](#berty.types.InstanceExportData.Reply)
    - [InstanceExportData.Request](#berty.types.InstanceExportData.Request)
    - [InstanceGetConfiguration](#berty.types.InstanceGetConfiguration)
    - [InstanceGetConfiguration.Reply](#berty.types.InstanceGetConfiguration.Reply)
    - [InstanceGetConfiguration.Request](#berty.types.InstanceGetConfiguration.Request)
    - [MessageEnvelope](#berty.types.MessageEnvelope)
    - [MessageHeaders](#berty.types.MessageHeaders)
    - [MultiMemberGrantAdminRole](#berty.types.MultiMemberGrantAdminRole)
    - [MultiMemberGroupAddAliasResolver](#berty.types.MultiMemberGroupAddAliasResolver)
    - [MultiMemberGroupAdminRoleGrant](#berty.types.MultiMemberGroupAdminRoleGrant)
    - [MultiMemberGroupAdminRoleGrant.Reply](#berty.types.MultiMemberGroupAdminRoleGrant.Reply)
    - [MultiMemberGroupAdminRoleGrant.Request](#berty.types.MultiMemberGroupAdminRoleGrant.Request)
    - [MultiMemberGroupAliasResolverDisclose](#berty.types.MultiMemberGroupAliasResolverDisclose)
    - [MultiMemberGroupAliasResolverDisclose.Reply](#berty.types.MultiMemberGroupAliasResolverDisclose.Reply)
    - [MultiMemberGroupAliasResolverDisclose.Request](#berty.types.MultiMemberGroupAliasResolverDisclose.Request)
    - [MultiMemberGroupCreate](#berty.types.MultiMemberGroupCreate)
    - [MultiMemberGroupCreate.Reply](#berty.types.MultiMemberGroupCreate.Reply)
    - [MultiMemberGroupCreate.Request](#berty.types.MultiMemberGroupCreate.Request)
    - [MultiMemberGroupInvitationCreate](#berty.types.MultiMemberGroupInvitationCreate)
    - [MultiMemberGroupInvitationCreate.Reply](#berty.types.MultiMemberGroupInvitationCreate.Reply)
    - [MultiMemberGroupInvitationCreate.Request](#berty.types.MultiMemberGroupInvitationCreate.Request)
    - [MultiMemberGroupJoin](#berty.types.MultiMemberGroupJoin)
    - [MultiMemberGroupJoin.Reply](#berty.types.MultiMemberGroupJoin.Reply)
    - [MultiMemberGroupJoin.Request](#berty.types.MultiMemberGroupJoin.Request)
    - [MultiMemberGroupLeave](#berty.types.MultiMemberGroupLeave)
    - [MultiMemberGroupLeave.Reply](#berty.types.MultiMemberGroupLeave.Reply)
    - [MultiMemberGroupLeave.Request](#berty.types.MultiMemberGroupLeave.Request)
    - [MultiMemberInitialMember](#berty.types.MultiMemberInitialMember)
    - [ShareableContact](#berty.types.ShareableContact)
  
    - [ContactState](#berty.types.ContactState)
    - [EventType](#berty.types.EventType)
    - [GroupType](#berty.types.GroupType)
    - [InstanceGetConfiguration.SettingState](#berty.types.InstanceGetConfiguration.SettingState)
  
  
  

- [Scalar Value Types](#scalar-value-types)

<a name="bertyprotocol.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## bertyprotocol.proto

 

 

 

<a name="berty.protocol.ProtocolService"></a>

### ProtocolService
ProtocolService is the top-level API to manage an instance of the Berty Protocol.
Each Berty Protocol Instance is considered as a Berty device and is associated with a Berty user.

| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| InstanceExportData | [.berty.types.InstanceExportData.Request](#berty.types.InstanceExportData.Request) | [.berty.types.InstanceExportData.Reply](#berty.types.InstanceExportData.Reply) | InstanceExportData exports instance data |
| InstanceGetConfiguration | [.berty.types.InstanceGetConfiguration.Request](#berty.types.InstanceGetConfiguration.Request) | [.berty.types.InstanceGetConfiguration.Reply](#berty.types.InstanceGetConfiguration.Reply) | InstanceGetConfiguration gets current configuration of this protocol instance |
| ContactRequestReference | [.berty.types.ContactRequestReference.Request](#berty.types.ContactRequestReference.Request) | [.berty.types.ContactRequestReference.Reply](#berty.types.ContactRequestReference.Reply) | ContactRequestReference retrieves the information required to create a reference (types.ie. included in a shareable link) to the current account |
| ContactRequestDisable | [.berty.types.ContactRequestDisable.Request](#berty.types.ContactRequestDisable.Request) | [.berty.types.ContactRequestDisable.Reply](#berty.types.ContactRequestDisable.Reply) | ContactRequestDisable disables incoming contact requests |
| ContactRequestEnable | [.berty.types.ContactRequestEnable.Request](#berty.types.ContactRequestEnable.Request) | [.berty.types.ContactRequestEnable.Reply](#berty.types.ContactRequestEnable.Reply) | ContactRequestEnable enables incoming contact requests |
| ContactRequestResetReference | [.berty.types.ContactRequestResetReference.Request](#berty.types.ContactRequestResetReference.Request) | [.berty.types.ContactRequestResetReference.Reply](#berty.types.ContactRequestResetReference.Reply) | ContactRequestResetReference changes the contact request reference |
| ContactRequestSend | [.berty.types.ContactRequestSend.Request](#berty.types.ContactRequestSend.Request) | [.berty.types.ContactRequestSend.Reply](#berty.types.ContactRequestSend.Reply) | ContactRequestSend attempt to send a contact request |
| ContactRequestAccept | [.berty.types.ContactRequestAccept.Request](#berty.types.ContactRequestAccept.Request) | [.berty.types.ContactRequestAccept.Reply](#berty.types.ContactRequestAccept.Reply) | ContactRequestAccept accepts a contact request |
| ContactRequestDiscard | [.berty.types.ContactRequestDiscard.Request](#berty.types.ContactRequestDiscard.Request) | [.berty.types.ContactRequestDiscard.Reply](#berty.types.ContactRequestDiscard.Reply) | ContactRequestDiscard ignores a contact request, without informing the other user |
| ContactBlock | [.berty.types.ContactBlock.Request](#berty.types.ContactBlock.Request) | [.berty.types.ContactBlock.Reply](#berty.types.ContactBlock.Reply) | ContactBlock blocks a contact from sending requests |
| ContactUnblock | [.berty.types.ContactUnblock.Request](#berty.types.ContactUnblock.Request) | [.berty.types.ContactUnblock.Reply](#berty.types.ContactUnblock.Reply) | ContactUnblock unblocks a contact from sending requests |
| ContactAliasKeySend | [.berty.types.ContactAliasKeySend.Request](#berty.types.ContactAliasKeySend.Request) | [.berty.types.ContactAliasKeySend.Reply](#berty.types.ContactAliasKeySend.Reply) | ContactAliasKeySend send an alias key to a contact, the contact will be able to assert that your account is being present on a multi-member group |
| MultiMemberGroupCreate | [.berty.types.MultiMemberGroupCreate.Request](#berty.types.MultiMemberGroupCreate.Request) | [.berty.types.MultiMemberGroupCreate.Reply](#berty.types.MultiMemberGroupCreate.Reply) | MultiMemberGroupCreate creates a new multi-member group |
| MultiMemberGroupJoin | [.berty.types.MultiMemberGroupJoin.Request](#berty.types.MultiMemberGroupJoin.Request) | [.berty.types.MultiMemberGroupJoin.Reply](#berty.types.MultiMemberGroupJoin.Reply) | MultiMemberGroupJoin joins a multi-member group |
| MultiMemberGroupLeave | [.berty.types.MultiMemberGroupLeave.Request](#berty.types.MultiMemberGroupLeave.Request) | [.berty.types.MultiMemberGroupLeave.Reply](#berty.types.MultiMemberGroupLeave.Reply) | MultiMemberGroupLeave leaves a multi-member group |
| MultiMemberGroupAliasResolverDisclose | [.berty.types.MultiMemberGroupAliasResolverDisclose.Request](#berty.types.MultiMemberGroupAliasResolverDisclose.Request) | [.berty.types.MultiMemberGroupAliasResolverDisclose.Reply](#berty.types.MultiMemberGroupAliasResolverDisclose.Reply) | MultiMemberGroupAliasResolverDisclose discloses your alias resolver key |
| MultiMemberGroupAdminRoleGrant | [.berty.types.MultiMemberGroupAdminRoleGrant.Request](#berty.types.MultiMemberGroupAdminRoleGrant.Request) | [.berty.types.MultiMemberGroupAdminRoleGrant.Reply](#berty.types.MultiMemberGroupAdminRoleGrant.Reply) | MultiMemberGroupAdminRoleGrant grants an admin role to a group member |
| MultiMemberGroupInvitationCreate | [.berty.types.MultiMemberGroupInvitationCreate.Request](#berty.types.MultiMemberGroupInvitationCreate.Request) | [.berty.types.MultiMemberGroupInvitationCreate.Reply](#berty.types.MultiMemberGroupInvitationCreate.Reply) | MultiMemberGroupInvitationCreate creates an invitation to a multi-member group |
| AppMetadataSend | [.berty.types.AppMetadataSend.Request](#berty.types.AppMetadataSend.Request) | [.berty.types.AppMetadataSend.Reply](#berty.types.AppMetadataSend.Reply) | AppMetadataSend adds an app event to the metadata store, the message is encrypted using a symmetric key and readable by future group members |
| AppMessageSend | [.berty.types.AppMessageSend.Request](#berty.types.AppMessageSend.Request) | [.berty.types.AppMessageSend.Reply](#berty.types.AppMessageSend.Reply) | AppMessageSend adds an app event to the message store, the message is encrypted using a derived key and readable by current group members |
| GroupMetadataSubscribe | [.berty.types.GroupMetadataSubscribe.Request](#berty.types.GroupMetadataSubscribe.Request) | [.berty.types.GroupMetadataEvent](#berty.types.GroupMetadataEvent) stream | GroupMetadataSubscribe subscribes to a group metadata updates (types.or it can also retrieve the history) |
| GroupMessageSubscribe | [.berty.types.GroupMessageSubscribe.Request](#berty.types.GroupMessageSubscribe.Request) | [.berty.types.GroupMessageEvent](#berty.types.GroupMessageEvent) stream | GroupMessageSubscribe subscribes to a group message updates (types.or it can also retrieve the history) |
| GroupMetadataList | [.berty.types.GroupMetadataList.Request](#berty.types.GroupMetadataList.Request) | [.berty.types.GroupMetadataEvent](#berty.types.GroupMetadataEvent) stream | GroupMetadataList replays metadata events from the group |
| GroupMessageList | [.berty.types.GroupMessageList.Request](#berty.types.GroupMessageList.Request) | [.berty.types.GroupMessageEvent](#berty.types.GroupMessageEvent) stream | GroupMessageList replays message events from the group |
| GroupInfo | [.berty.types.GroupInfo.Request](#berty.types.GroupInfo.Request) | [.berty.types.GroupInfo.Reply](#berty.types.GroupInfo.Reply) | GroupInfo retrieves information about a group |
| ActivateGroup | [.berty.types.ActivateGroup.Request](#berty.types.ActivateGroup.Request) | [.berty.types.ActivateGroup.Reply](#berty.types.ActivateGroup.Reply) | ActivateGroup explicitly opens a group, groups are automatically enabled when actions are performed on them |
| DeactivateGroup | [.berty.types.DeactivateGroup.Request](#berty.types.DeactivateGroup.Request) | [.berty.types.DeactivateGroup.Reply](#berty.types.DeactivateGroup.Reply) | DeactivateGroup closes a group |

 

<a name="bertytypes.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## bertytypes.proto

<a name="berty.types.Account"></a>

### Account
Account describes all the secrets that identifies an Account

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.types.Group) |  | group specifies which group is used to manage the account |
| account_private_key | [bytes](#bytes) |  | account_private_key, private part is used to signs handshake, signs device, create contacts group keys via ECDH -- public part is used to have a shareable identity |
| alias_private_key | [bytes](#bytes) |  | alias_private_key, private part is use to derive group members private keys, signs alias proofs, public part can be shared to contacts to prove identity |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed, rendezvous seed used for direct communication |

<a name="berty.types.AccountContactBlocked"></a>

### AccountContactBlocked
AccountContactBlocked indicates that a contact is blocked

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact blocked |

<a name="berty.types.AccountContactRequestAccepted"></a>

### AccountContactRequestAccepted
This event should be followed by an AccountGroupJoined event
This event should be followed by GroupAddMemberDevice and GroupAddDeviceSecret events within the AccountGroup
AccountContactRequestAccepted indicates that a contact request has been accepted

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact whom request is accepted |
| group_pk | [bytes](#bytes) |  | group_pk is the 1to1 group with the requester user |

<a name="berty.types.AccountContactRequestDisabled"></a>

### AccountContactRequestDisabled
AccountContactRequestDisabled indicates that the account should not be advertised on a public rendezvous point

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |

<a name="berty.types.AccountContactRequestDiscarded"></a>

### AccountContactRequestDiscarded
AccountContactRequestDiscarded indicates that a contact request has been refused

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact whom request is refused |

<a name="berty.types.AccountContactRequestEnabled"></a>

### AccountContactRequestEnabled
AccountContactRequestDisabled indicates that the account should be advertised on a public rendezvous point

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |

<a name="berty.types.AccountContactRequestEnqueued"></a>

### AccountContactRequestEnqueued
This event should be followed by an AccountGroupJoined event
This event should be followed by a GroupAddMemberDevice event within the AccountGroup
This event should be followed by a GroupAddDeviceSecret event within the AccountGroup
AccountContactRequestEnqueued indicates that the account will attempt to send a contact request when a matching peer is discovered

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| group_pk | [bytes](#bytes) |  | group_pk is the 1to1 group with the requested user |
| contact | [ShareableContact](#berty.types.ShareableContact) |  | contact is a message describing how to connect to the other account |

<a name="berty.types.AccountContactRequestReceived"></a>

### AccountContactRequestReceived
AccountContactRequestReceived indicates that the account has received a new contact request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the account event (which received the contact request), signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the account sending the request |
| contact_rendezvous_seed | [bytes](#bytes) |  | TODO: is this necessary? contact_rendezvous_seed is the rendezvous seed of the contact sending the request |
| contact_metadata | [bytes](#bytes) |  | TODO: is this necessary? contact_metadata is the metadata specific to the app to identify the contact for the request |

<a name="berty.types.AccountContactRequestReferenceReset"></a>

### AccountContactRequestReferenceReset
AccountContactRequestDisabled indicates that the account should be advertised on different public rendezvous points

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the new rendezvous point seed |

<a name="berty.types.AccountContactRequestSent"></a>

### AccountContactRequestSent
AccountContactRequestSent indicates that the account has sent a contact request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the account event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contacted account |

<a name="berty.types.AccountContactUnblocked"></a>

### AccountContactUnblocked
AccountContactUnblocked indicates that a contact is unblocked

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact unblocked |

<a name="berty.types.AccountGroupJoined"></a>

### AccountGroupJoined
AccountGroupJoined indicates that the account is now part of a new group

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| group | [Group](#berty.types.Group) |  | group describe the joined group |

<a name="berty.types.AccountGroupLeft"></a>

### AccountGroupLeft
AccountGroupJoined indicates that the account has left a group

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| group_pk | [bytes](#bytes) |  | group_pk references the group left |

<a name="berty.types.ActivateGroup"></a>

### ActivateGroup

<a name="berty.types.ActivateGroup.Reply"></a>

### ActivateGroup.Reply

<a name="berty.types.ActivateGroup.Request"></a>

### ActivateGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.types.AppMessageSend"></a>

### AppMessageSend

<a name="berty.types.AppMessageSend.Reply"></a>

### AppMessageSend.Reply

<a name="berty.types.AppMessageSend.Request"></a>

### AppMessageSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| payload | [bytes](#bytes) |  | payload is the payload to send |

<a name="berty.types.AppMetadata"></a>

### AppMetadata
AppMetadata is an app defined message, accessible to future group members

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| message | [bytes](#bytes) |  | message is the payload |

<a name="berty.types.AppMetadataSend"></a>

### AppMetadataSend

<a name="berty.types.AppMetadataSend.Reply"></a>

### AppMetadataSend.Reply

<a name="berty.types.AppMetadataSend.Request"></a>

### AppMetadataSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| payload | [bytes](#bytes) |  | payload is the payload to send |

<a name="berty.types.ContactAddAliasKey"></a>

### ContactAddAliasKey
ContactAddAliasKey is an event type where ones shares their alias public key

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| alias_pk | [bytes](#bytes) |  | alias_pk is the alias key which will be used to verify a contact identity |

<a name="berty.types.ContactAliasKeySend"></a>

### ContactAliasKeySend

<a name="berty.types.ContactAliasKeySend.Reply"></a>

### ContactAliasKeySend.Reply

<a name="berty.types.ContactAliasKeySend.Request"></a>

### ContactAliasKeySend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to send the alias public key to |

<a name="berty.types.ContactBlock"></a>

### ContactBlock

<a name="berty.types.ContactBlock.Reply"></a>

### ContactBlock.Reply

<a name="berty.types.ContactBlock.Request"></a>

### ContactBlock.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to block |

<a name="berty.types.ContactRequestAccept"></a>

### ContactRequestAccept

<a name="berty.types.ContactRequestAccept.Reply"></a>

### ContactRequestAccept.Reply

<a name="berty.types.ContactRequestAccept.Request"></a>

### ContactRequestAccept.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to accept the request from |

<a name="berty.types.ContactRequestDisable"></a>

### ContactRequestDisable

<a name="berty.types.ContactRequestDisable.Reply"></a>

### ContactRequestDisable.Reply

<a name="berty.types.ContactRequestDisable.Request"></a>

### ContactRequestDisable.Request

<a name="berty.types.ContactRequestDiscard"></a>

### ContactRequestDiscard

<a name="berty.types.ContactRequestDiscard.Reply"></a>

### ContactRequestDiscard.Reply

<a name="berty.types.ContactRequestDiscard.Request"></a>

### ContactRequestDiscard.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to ignore the request from |

<a name="berty.types.ContactRequestEnable"></a>

### ContactRequestEnable

<a name="berty.types.ContactRequestEnable.Reply"></a>

### ContactRequestEnable.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the rendezvous seed used by the current account |

<a name="berty.types.ContactRequestEnable.Request"></a>

### ContactRequestEnable.Request

<a name="berty.types.ContactRequestReference"></a>

### ContactRequestReference

<a name="berty.types.ContactRequestReference.Reply"></a>

### ContactRequestReference.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the rendezvous seed used by the current account |
| enabled | [bool](#bool) |  | enabled indicates if incoming contact requests are enabled |

<a name="berty.types.ContactRequestReference.Request"></a>

### ContactRequestReference.Request

<a name="berty.types.ContactRequestResetReference"></a>

### ContactRequestResetReference

<a name="berty.types.ContactRequestResetReference.Reply"></a>

### ContactRequestResetReference.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the rendezvous seed used by the current account |

<a name="berty.types.ContactRequestResetReference.Request"></a>

### ContactRequestResetReference.Request

<a name="berty.types.ContactRequestSend"></a>

### ContactRequestSend

<a name="berty.types.ContactRequestSend.Reply"></a>

### ContactRequestSend.Reply

<a name="berty.types.ContactRequestSend.Request"></a>

### ContactRequestSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact | [ShareableContact](#berty.types.ShareableContact) |  | contact is a message describing how to connect to the other account |

<a name="berty.types.ContactUnblock"></a>

### ContactUnblock

<a name="berty.types.ContactUnblock.Reply"></a>

### ContactUnblock.Reply

<a name="berty.types.ContactUnblock.Request"></a>

### ContactUnblock.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to unblock |

<a name="berty.types.DeactivateGroup"></a>

### DeactivateGroup

<a name="berty.types.DeactivateGroup.Reply"></a>

### DeactivateGroup.Reply

<a name="berty.types.DeactivateGroup.Request"></a>

### DeactivateGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.types.DeviceSecret"></a>

### DeviceSecret
DeviceSecret is encrypted for a specific member of the group

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| chain_key | [bytes](#bytes) |  | chain_key is the current value of the chain key of the group device |
| counter | [uint64](#uint64) |  | counter is the current value of the counter of the group device |

<a name="berty.types.EventContext"></a>

### EventContext
EventContext adds context (its id and its parents) to an event

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [bytes](#bytes) |  | id is the CID of the underlying OrbitDB event |
| parent_ids | [bytes](#bytes) | repeated | id are the the CIDs of the underlying parents of the OrbitDB event |
| group_pk | [bytes](#bytes) |  | group_pk receiving the event |

<a name="berty.types.Group"></a>

### Group
Group define a group and is enough to invite someone to it

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [bytes](#bytes) |  | public_key is the identifier of the group, it signs the group secret and the initial member of a multi-member group |
| secret | [bytes](#bytes) |  | secret is the symmetric secret of the group, which is used to encrypt the metadata |
| secret_sig | [bytes](#bytes) |  | secret_sig is the signature of the secret used to ensure the validity of the group |
| group_type | [GroupType](#berty.types.GroupType) |  | group_type specifies the type of the group |

<a name="berty.types.GroupAddAdditionalRendezvousSeed"></a>

### GroupAddAdditionalRendezvousSeed
GroupAddAdditionalRendezvousSeed indicates that an additional rendezvous point should be used for data synchronization

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message, must be the device of an admin of the group |
| seed | [bytes](#bytes) |  | seed is the additional rendezvous point seed which should be used |

<a name="berty.types.GroupAddDeviceSecret"></a>

### GroupAddDeviceSecret
GroupAddDeviceSecret is an event which indicates to a group member a device secret

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| dest_member_pk | [bytes](#bytes) |  | dest_member_pk is the member who should receive the secret |
| payload | [bytes](#bytes) |  | payload is the serialization of Payload encrypted for the specified member |

<a name="berty.types.GroupAddMemberDevice"></a>

### GroupAddMemberDevice
GroupAddMemberDevice is an event which indicates to a group a new device (and eventually a new member) is joining it
When added on AccountGroup, this event should be followed by appropriate GroupAddMemberDevice and GroupAddDeviceSecret events

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| member_pk | [bytes](#bytes) |  | member_pk is the member sending the event |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| member_sig | [bytes](#bytes) |  | member_sig is used to prove the ownership of the member pk

TODO: signature of what ??? ensure it can&#39;t be replayed |

<a name="berty.types.GroupEnvelope"></a>

### GroupEnvelope
GroupEnvelope is a publicly exposed structure containing a group metadata event

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| nonce | [bytes](#bytes) |  | nonce is used to encrypt the message |
| event | [bytes](#bytes) |  | event is encrypted using a symmetric key shared among group members |

<a name="berty.types.GroupInfo"></a>

### GroupInfo

<a name="berty.types.GroupInfo.Reply"></a>

### GroupInfo.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.types.Group) |  | group is the group invitation, containing the group pk and its type |
| member_pk | [bytes](#bytes) |  | member_pk is the identifier of the current member in the group |
| device_pk | [bytes](#bytes) |  | member_pk is the identifier of the current device in the group |

<a name="berty.types.GroupInfo.Request"></a>

### GroupInfo.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact |

<a name="berty.types.GroupMessageEvent"></a>

### GroupMessageEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event_context | [EventContext](#berty.types.EventContext) |  | event_context contains context information about the event |
| headers | [MessageHeaders](#berty.types.MessageHeaders) |  | headers contains headers of the secure message |
| message | [bytes](#bytes) |  | message contains the secure message payload |

<a name="berty.types.GroupMessageList"></a>

### GroupMessageList

<a name="berty.types.GroupMessageList.Request"></a>

### GroupMessageList.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.types.GroupMessageSubscribe"></a>

### GroupMessageSubscribe

<a name="berty.types.GroupMessageSubscribe.Request"></a>

### GroupMessageSubscribe.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| since | [bytes](#bytes) |  | since is the lower ID bound used to filter events |
| until | [bytes](#bytes) |  | until is the upper ID bound used to filter events |
| go_backwards | [bool](#bool) |  | go_backwards indicates whether the events should be returned in reverse order |

<a name="berty.types.GroupMetadata"></a>

### GroupMetadata
GroupMetadata is used in GroupEnvelope and only readable by invited group members

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event_type | [EventType](#berty.types.EventType) |  | event_type defines which event type is used |
| payload | [bytes](#bytes) |  | the serialization depends on event_type, event is symmetrically encrypted |
| sig | [bytes](#bytes) |  | sig is the signature of the payload, it depends on the event_type for the used key |

<a name="berty.types.GroupMetadataEvent"></a>

### GroupMetadataEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event_context | [EventContext](#berty.types.EventContext) |  | event_context contains context information about the event |
| metadata | [GroupMetadata](#berty.types.GroupMetadata) |  | metadata contains the newly available metadata |
| event | [bytes](#bytes) |  | event_clear clear bytes for the event |

<a name="berty.types.GroupMetadataList"></a>

### GroupMetadataList

<a name="berty.types.GroupMetadataList.Request"></a>

### GroupMetadataList.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.types.GroupMetadataSubscribe"></a>

### GroupMetadataSubscribe

<a name="berty.types.GroupMetadataSubscribe.Request"></a>

### GroupMetadataSubscribe.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| since | [bytes](#bytes) |  | since is the lower ID bound used to filter events |
| until | [bytes](#bytes) |  | until is the upper ID bound used to filter events |
| go_backwards | [bool](#bool) |  | go_backwards indicates whether the events should be returned in reverse order |

<a name="berty.types.GroupRemoveAdditionalRendezvousSeed"></a>

### GroupRemoveAdditionalRendezvousSeed
GroupRemoveAdditionalRendezvousSeed indicates that a previously added rendezvous point should be removed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message, must be the device of an admin of the group |
| seed | [bytes](#bytes) |  | seed is the additional rendezvous point seed which should be removed |

<a name="berty.types.InstanceExportData"></a>

### InstanceExportData

<a name="berty.types.InstanceExportData.Reply"></a>

### InstanceExportData.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| exported_data | [bytes](#bytes) |  |  |

<a name="berty.types.InstanceExportData.Request"></a>

### InstanceExportData.Request

<a name="berty.types.InstanceGetConfiguration"></a>

### InstanceGetConfiguration

<a name="berty.types.InstanceGetConfiguration.Reply"></a>

### InstanceGetConfiguration.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| account_pk | [bytes](#bytes) |  | account_pk is the public key of the current account |
| device_pk | [bytes](#bytes) |  | device_pk is the public key of the current device |
| account_group_pk | [bytes](#bytes) |  | account_group_pk is the public key of the account group |
| peer_id | [string](#string) |  |  |
| listeners | [string](#string) | repeated |  |
| ble_enabled | [InstanceGetConfiguration.SettingState](#berty.types.InstanceGetConfiguration.SettingState) |  |  |
| wifi_p2p_enabled | [InstanceGetConfiguration.SettingState](#berty.types.InstanceGetConfiguration.SettingState) |  | MultiPeerConnectivity for Darwin and Nearby for Android |
| mdns_enabled | [InstanceGetConfiguration.SettingState](#berty.types.InstanceGetConfiguration.SettingState) |  |  |
| relay_enabled | [InstanceGetConfiguration.SettingState](#berty.types.InstanceGetConfiguration.SettingState) |  |  |

<a name="berty.types.InstanceGetConfiguration.Request"></a>

### InstanceGetConfiguration.Request

<a name="berty.types.MessageEnvelope"></a>

### MessageEnvelope
MessageEnvelope is a publicly exposed structure containing a group secure message

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| message_headers | [bytes](#bytes) |  | message_headers is an encrypted serialization using a symmetric key of a MessageHeaders message |
| message | [bytes](#bytes) |  | message is an encrypted message, only readable by group members who previously received the appropriate chain key |
| nonce | [bytes](#bytes) |  | nonce is a nonce for message headers |

<a name="berty.types.MessageHeaders"></a>

### MessageHeaders
MessageHeaders is used in MessageEnvelope and only readable by invited group members

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| counter | [uint64](#uint64) |  | counter is the current counter value for the specified device |
| device_pk | [bytes](#bytes) |  | device_pk is the public key of the device sending the message |
| sig | [bytes](#bytes) |  | sig is the signature of the encrypted message using the device&#39;s private key |

<a name="berty.types.MultiMemberGrantAdminRole"></a>

### MultiMemberGrantAdminRole
MultiMemberGrantAdminRole indicates that a group admin allows another group member to act as an admin

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message, must be the device of an admin of the group |
| grantee_member_pk | [bytes](#bytes) |  | grantee_member_pk is the member public key of the member granted of the admin role |

<a name="berty.types.MultiMemberGroupAddAliasResolver"></a>

### MultiMemberGroupAddAliasResolver
MultiMemberGroupAddAliasResolver indicates that a group member want to disclose their presence in the group to their contacts

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| alias_resolver | [bytes](#bytes) |  | alias_resolver allows contact of an account to resolve the real identity behind an alias (Multi-Member Group Member) Generated by both contacts and account independently using: hmac(aliasPK, GroupID) |
| alias_proof | [bytes](#bytes) |  | alias_proof ensures that the associated alias_resolver has been issued by the right account Generated using aliasSKSig(GroupID) |

<a name="berty.types.MultiMemberGroupAdminRoleGrant"></a>

### MultiMemberGroupAdminRoleGrant

<a name="berty.types.MultiMemberGroupAdminRoleGrant.Reply"></a>

### MultiMemberGroupAdminRoleGrant.Reply

<a name="berty.types.MultiMemberGroupAdminRoleGrant.Request"></a>

### MultiMemberGroupAdminRoleGrant.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| member_pk | [bytes](#bytes) |  | member_pk is the identifier of the member which will be granted the admin role |

<a name="berty.types.MultiMemberGroupAliasResolverDisclose"></a>

### MultiMemberGroupAliasResolverDisclose

<a name="berty.types.MultiMemberGroupAliasResolverDisclose.Reply"></a>

### MultiMemberGroupAliasResolverDisclose.Reply

<a name="berty.types.MultiMemberGroupAliasResolverDisclose.Request"></a>

### MultiMemberGroupAliasResolverDisclose.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.types.MultiMemberGroupCreate"></a>

### MultiMemberGroupCreate

<a name="berty.types.MultiMemberGroupCreate.Reply"></a>

### MultiMemberGroupCreate.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the newly created group |

<a name="berty.types.MultiMemberGroupCreate.Request"></a>

### MultiMemberGroupCreate.Request

<a name="berty.types.MultiMemberGroupInvitationCreate"></a>

### MultiMemberGroupInvitationCreate

<a name="berty.types.MultiMemberGroupInvitationCreate.Reply"></a>

### MultiMemberGroupInvitationCreate.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.types.Group) |  | group is the invitation to the group |

<a name="berty.types.MultiMemberGroupInvitationCreate.Request"></a>

### MultiMemberGroupInvitationCreate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.types.MultiMemberGroupJoin"></a>

### MultiMemberGroupJoin

<a name="berty.types.MultiMemberGroupJoin.Reply"></a>

### MultiMemberGroupJoin.Reply

<a name="berty.types.MultiMemberGroupJoin.Request"></a>

### MultiMemberGroupJoin.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.types.Group) |  | group is the information of the group to join |

<a name="berty.types.MultiMemberGroupLeave"></a>

### MultiMemberGroupLeave

<a name="berty.types.MultiMemberGroupLeave.Reply"></a>

### MultiMemberGroupLeave.Reply

<a name="berty.types.MultiMemberGroupLeave.Request"></a>

### MultiMemberGroupLeave.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  |  |

<a name="berty.types.MultiMemberInitialMember"></a>

### MultiMemberInitialMember
MultiMemberInitialMember indicates that a member is the group creator, this event is signed using the group ID private key

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| member_pk | [bytes](#bytes) |  | member_pk is the public key of the member who is the group creator |

<a name="berty.types.ShareableContact"></a>

### ShareableContact

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| pk | [bytes](#bytes) |  | pk is the account to send a contact request to |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the rendezvous seed used by the account to send a contact request to |
| metadata | [bytes](#bytes) |  | metadata is the metadata specific to the app to identify the contact for the request |

 

<a name="berty.types.ContactState"></a>

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

<a name="berty.types.EventType"></a>

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

<a name="berty.types.GroupType"></a>

### GroupType

| Name | Number | Description |
| ---- | ------ | ----------- |
| GroupTypeUndefined | 0 | GroupTypeUndefined indicates that the value has not been set. Should not happen. |
| GroupTypeAccount | 1 | GroupTypeAccount is the group managing an account, available to all its devices. |
| GroupTypeContact | 2 | GroupTypeContact is the group created between two accounts, available to all their devices. |
| GroupTypeMultiMember | 3 | GroupTypeMultiMember is a group containing an undefined number of members. |

<a name="berty.types.InstanceGetConfiguration.SettingState"></a>

### InstanceGetConfiguration.SettingState

| Name | Number | Description |
| ---- | ------ | ----------- |
| Unknown | 0 |  |
| Enabled | 1 |  |
| Disabled | 2 |  |
| Unavailable | 3 |  |

 

 

 

## Scalar Value Types

| .proto Type | Notes | C++ Type | Java Type | Python Type |
| ----------- | ----- | -------- | --------- | ----------- |
| <a name="double" /> double |  | double | double | float |
| <a name="float" /> float |  | float | float | float |
| <a name="int32" /> int32 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint32 instead. | int32 | int | int |
| <a name="int64" /> int64 | Uses variable-length encoding. Inefficient for encoding negative numbers – if your field is likely to have negative values, use sint64 instead. | int64 | long | int/long |
| <a name="uint32" /> uint32 | Uses variable-length encoding. | uint32 | int | int/long |
| <a name="uint64" /> uint64 | Uses variable-length encoding. | uint64 | long | int/long |
| <a name="sint32" /> sint32 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int32s. | int32 | int | int |
| <a name="sint64" /> sint64 | Uses variable-length encoding. Signed int value. These more efficiently encode negative numbers than regular int64s. | int64 | long | int/long |
| <a name="fixed32" /> fixed32 | Always four bytes. More efficient than uint32 if values are often greater than 2^28. | uint32 | int | int |
| <a name="fixed64" /> fixed64 | Always eight bytes. More efficient than uint64 if values are often greater than 2^56. | uint64 | long | int/long |
| <a name="sfixed32" /> sfixed32 | Always four bytes. | int32 | int | int |
| <a name="sfixed64" /> sfixed64 | Always eight bytes. | int64 | long | int/long |
| <a name="bool" /> bool |  | bool | boolean | boolean |
| <a name="string" /> string | A string must always contain UTF-8 encoded or 7-bit ASCII text. | string | String | str/unicode |
| <a name="bytes" /> bytes | May contain any arbitrary sequence of bytes. | string | ByteString | str |

