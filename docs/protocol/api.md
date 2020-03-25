# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [bertyprotocol.proto](#bertyprotocol.proto)
    - [Account](#berty.protocol.Account)
    - [AccountContactBlocked](#berty.protocol.AccountContactBlocked)
    - [AccountContactRequestAccepted](#berty.protocol.AccountContactRequestAccepted)
    - [AccountContactRequestDisabled](#berty.protocol.AccountContactRequestDisabled)
    - [AccountContactRequestDiscarded](#berty.protocol.AccountContactRequestDiscarded)
    - [AccountContactRequestEnabled](#berty.protocol.AccountContactRequestEnabled)
    - [AccountContactRequestEnqueued](#berty.protocol.AccountContactRequestEnqueued)
    - [AccountContactRequestReceived](#berty.protocol.AccountContactRequestReceived)
    - [AccountContactRequestReferenceReset](#berty.protocol.AccountContactRequestReferenceReset)
    - [AccountContactRequestSent](#berty.protocol.AccountContactRequestSent)
    - [AccountContactUnblocked](#berty.protocol.AccountContactUnblocked)
    - [AccountGroupJoined](#berty.protocol.AccountGroupJoined)
    - [AccountGroupLeft](#berty.protocol.AccountGroupLeft)
    - [ActivateGroup](#berty.protocol.ActivateGroup)
    - [ActivateGroup.Reply](#berty.protocol.ActivateGroup.Reply)
    - [ActivateGroup.Request](#berty.protocol.ActivateGroup.Request)
    - [AppMessageSend](#berty.protocol.AppMessageSend)
    - [AppMessageSend.Reply](#berty.protocol.AppMessageSend.Reply)
    - [AppMessageSend.Request](#berty.protocol.AppMessageSend.Request)
    - [AppMetadata](#berty.protocol.AppMetadata)
    - [AppMetadataSend](#berty.protocol.AppMetadataSend)
    - [AppMetadataSend.Reply](#berty.protocol.AppMetadataSend.Reply)
    - [AppMetadataSend.Request](#berty.protocol.AppMetadataSend.Request)
    - [ContactAddAliasKey](#berty.protocol.ContactAddAliasKey)
    - [ContactAliasKeySend](#berty.protocol.ContactAliasKeySend)
    - [ContactAliasKeySend.Reply](#berty.protocol.ContactAliasKeySend.Reply)
    - [ContactAliasKeySend.Request](#berty.protocol.ContactAliasKeySend.Request)
    - [ContactBlock](#berty.protocol.ContactBlock)
    - [ContactBlock.Reply](#berty.protocol.ContactBlock.Reply)
    - [ContactBlock.Request](#berty.protocol.ContactBlock.Request)
    - [ContactRequestAccept](#berty.protocol.ContactRequestAccept)
    - [ContactRequestAccept.Reply](#berty.protocol.ContactRequestAccept.Reply)
    - [ContactRequestAccept.Request](#berty.protocol.ContactRequestAccept.Request)
    - [ContactRequestDisable](#berty.protocol.ContactRequestDisable)
    - [ContactRequestDisable.Reply](#berty.protocol.ContactRequestDisable.Reply)
    - [ContactRequestDisable.Request](#berty.protocol.ContactRequestDisable.Request)
    - [ContactRequestDiscard](#berty.protocol.ContactRequestDiscard)
    - [ContactRequestDiscard.Reply](#berty.protocol.ContactRequestDiscard.Reply)
    - [ContactRequestDiscard.Request](#berty.protocol.ContactRequestDiscard.Request)
    - [ContactRequestEnable](#berty.protocol.ContactRequestEnable)
    - [ContactRequestEnable.Reply](#berty.protocol.ContactRequestEnable.Reply)
    - [ContactRequestEnable.Request](#berty.protocol.ContactRequestEnable.Request)
    - [ContactRequestReference](#berty.protocol.ContactRequestReference)
    - [ContactRequestReference.Reply](#berty.protocol.ContactRequestReference.Reply)
    - [ContactRequestReference.Request](#berty.protocol.ContactRequestReference.Request)
    - [ContactRequestResetReference](#berty.protocol.ContactRequestResetReference)
    - [ContactRequestResetReference.Reply](#berty.protocol.ContactRequestResetReference.Reply)
    - [ContactRequestResetReference.Request](#berty.protocol.ContactRequestResetReference.Request)
    - [ContactRequestSend](#berty.protocol.ContactRequestSend)
    - [ContactRequestSend.Reply](#berty.protocol.ContactRequestSend.Reply)
    - [ContactRequestSend.Request](#berty.protocol.ContactRequestSend.Request)
    - [ContactUnblock](#berty.protocol.ContactUnblock)
    - [ContactUnblock.Reply](#berty.protocol.ContactUnblock.Reply)
    - [ContactUnblock.Request](#berty.protocol.ContactUnblock.Request)
    - [DeactivateGroup](#berty.protocol.DeactivateGroup)
    - [DeactivateGroup.Reply](#berty.protocol.DeactivateGroup.Reply)
    - [DeactivateGroup.Request](#berty.protocol.DeactivateGroup.Request)
    - [DeviceSecret](#berty.protocol.DeviceSecret)
    - [EventContext](#berty.protocol.EventContext)
    - [Group](#berty.protocol.Group)
    - [GroupAddAdditionalRendezvousSeed](#berty.protocol.GroupAddAdditionalRendezvousSeed)
    - [GroupAddDeviceSecret](#berty.protocol.GroupAddDeviceSecret)
    - [GroupAddMemberDevice](#berty.protocol.GroupAddMemberDevice)
    - [GroupEnvelope](#berty.protocol.GroupEnvelope)
    - [GroupInfo](#berty.protocol.GroupInfo)
    - [GroupInfo.Reply](#berty.protocol.GroupInfo.Reply)
    - [GroupInfo.Request](#berty.protocol.GroupInfo.Request)
    - [GroupMessageEvent](#berty.protocol.GroupMessageEvent)
    - [GroupMessageList](#berty.protocol.GroupMessageList)
    - [GroupMessageList.Request](#berty.protocol.GroupMessageList.Request)
    - [GroupMessageSubscribe](#berty.protocol.GroupMessageSubscribe)
    - [GroupMessageSubscribe.Request](#berty.protocol.GroupMessageSubscribe.Request)
    - [GroupMetadata](#berty.protocol.GroupMetadata)
    - [GroupMetadataEvent](#berty.protocol.GroupMetadataEvent)
    - [GroupMetadataList](#berty.protocol.GroupMetadataList)
    - [GroupMetadataList.Request](#berty.protocol.GroupMetadataList.Request)
    - [GroupMetadataSubscribe](#berty.protocol.GroupMetadataSubscribe)
    - [GroupMetadataSubscribe.Request](#berty.protocol.GroupMetadataSubscribe.Request)
    - [GroupRemoveAdditionalRendezvousSeed](#berty.protocol.GroupRemoveAdditionalRendezvousSeed)
    - [InstanceExportData](#berty.protocol.InstanceExportData)
    - [InstanceExportData.Reply](#berty.protocol.InstanceExportData.Reply)
    - [InstanceExportData.Request](#berty.protocol.InstanceExportData.Request)
    - [InstanceGetConfiguration](#berty.protocol.InstanceGetConfiguration)
    - [InstanceGetConfiguration.Reply](#berty.protocol.InstanceGetConfiguration.Reply)
    - [InstanceGetConfiguration.Request](#berty.protocol.InstanceGetConfiguration.Request)
    - [MessageEnvelope](#berty.protocol.MessageEnvelope)
    - [MessageHeaders](#berty.protocol.MessageHeaders)
    - [MultiMemberGrantAdminRole](#berty.protocol.MultiMemberGrantAdminRole)
    - [MultiMemberGroupAddAliasResolver](#berty.protocol.MultiMemberGroupAddAliasResolver)
    - [MultiMemberGroupAdminRoleGrant](#berty.protocol.MultiMemberGroupAdminRoleGrant)
    - [MultiMemberGroupAdminRoleGrant.Reply](#berty.protocol.MultiMemberGroupAdminRoleGrant.Reply)
    - [MultiMemberGroupAdminRoleGrant.Request](#berty.protocol.MultiMemberGroupAdminRoleGrant.Request)
    - [MultiMemberGroupAliasResolverDisclose](#berty.protocol.MultiMemberGroupAliasResolverDisclose)
    - [MultiMemberGroupAliasResolverDisclose.Reply](#berty.protocol.MultiMemberGroupAliasResolverDisclose.Reply)
    - [MultiMemberGroupAliasResolverDisclose.Request](#berty.protocol.MultiMemberGroupAliasResolverDisclose.Request)
    - [MultiMemberGroupCreate](#berty.protocol.MultiMemberGroupCreate)
    - [MultiMemberGroupCreate.Reply](#berty.protocol.MultiMemberGroupCreate.Reply)
    - [MultiMemberGroupCreate.Request](#berty.protocol.MultiMemberGroupCreate.Request)
    - [MultiMemberGroupInvitationCreate](#berty.protocol.MultiMemberGroupInvitationCreate)
    - [MultiMemberGroupInvitationCreate.Reply](#berty.protocol.MultiMemberGroupInvitationCreate.Reply)
    - [MultiMemberGroupInvitationCreate.Request](#berty.protocol.MultiMemberGroupInvitationCreate.Request)
    - [MultiMemberGroupJoin](#berty.protocol.MultiMemberGroupJoin)
    - [MultiMemberGroupJoin.Reply](#berty.protocol.MultiMemberGroupJoin.Reply)
    - [MultiMemberGroupJoin.Request](#berty.protocol.MultiMemberGroupJoin.Request)
    - [MultiMemberGroupLeave](#berty.protocol.MultiMemberGroupLeave)
    - [MultiMemberGroupLeave.Reply](#berty.protocol.MultiMemberGroupLeave.Reply)
    - [MultiMemberGroupLeave.Request](#berty.protocol.MultiMemberGroupLeave.Request)
    - [MultiMemberInitialMember](#berty.protocol.MultiMemberInitialMember)
    - [ShareableContact](#berty.protocol.ShareableContact)
  
    - [ContactState](#berty.protocol.ContactState)
    - [EventType](#berty.protocol.EventType)
    - [GroupType](#berty.protocol.GroupType)
    - [InstanceGetConfiguration.SettingState](#berty.protocol.InstanceGetConfiguration.SettingState)
  
  
    - [ProtocolService](#berty.protocol.ProtocolService)
  

- [Scalar Value Types](#scalar-value-types)

<a name="bertyprotocol.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## bertyprotocol.proto

<a name="berty.protocol.Account"></a>

### Account
Account describes all the secrets that identifies an Account

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.protocol.Group) |  | group specifies which group is used to manage the account |
| account_private_key | [bytes](#bytes) |  | account_private_key, private part is used to signs handshake, signs device, create contacts group keys via ECDH -- public part is used to have a shareable identity |
| alias_private_key | [bytes](#bytes) |  | alias_private_key, private part is use to derive group members private keys, signs alias proofs, public part can be shared to contacts to prove identity |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed, rendezvous seed used for direct communication |

<a name="berty.protocol.AccountContactBlocked"></a>

### AccountContactBlocked
AccountContactBlocked indicates that a contact is blocked

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact blocked |

<a name="berty.protocol.AccountContactRequestAccepted"></a>

### AccountContactRequestAccepted
This event should be followed by an AccountGroupJoined event
This event should be followed by GroupAddMemberDevice and GroupAddDeviceSecret events within the AccountGroup
AccountContactRequestAccepted indicates that a contact request has been accepted

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact whom request is accepted |
| group_pk | [bytes](#bytes) |  | group_pk is the 1to1 group with the requester user |

<a name="berty.protocol.AccountContactRequestDisabled"></a>

### AccountContactRequestDisabled
AccountContactRequestDisabled indicates that the account should not be advertised on a public rendezvous point

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |

<a name="berty.protocol.AccountContactRequestDiscarded"></a>

### AccountContactRequestDiscarded
AccountContactRequestDiscarded indicates that a contact request has been refused

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact whom request is refused |

<a name="berty.protocol.AccountContactRequestEnabled"></a>

### AccountContactRequestEnabled
AccountContactRequestDisabled indicates that the account should be advertised on a public rendezvous point

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |

<a name="berty.protocol.AccountContactRequestEnqueued"></a>

### AccountContactRequestEnqueued
This event should be followed by an AccountGroupJoined event
This event should be followed by a GroupAddMemberDevice event within the AccountGroup
This event should be followed by a GroupAddDeviceSecret event within the AccountGroup
AccountContactRequestEnqueued indicates that the account will attempt to send a contact request when a matching peer is discovered

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the account to send a contact request to |
| group_pk | [bytes](#bytes) |  | group_pk is the 1to1 group with the requested user |
| contact_rendezvous_seed | [bytes](#bytes) |  | contact_rendezvous_seed is the rendezvous seed used by the other account |
| contact_metadata | [bytes](#bytes) |  | TODO: is this necessary? contact_metadata is the metadata specific to the app to identify the contact for the request |

<a name="berty.protocol.AccountContactRequestReceived"></a>

### AccountContactRequestReceived
AccountContactRequestReceived indicates that the account has received a new contact request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the account event (which received the contact request), signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the account sending the request |
| contact_rendezvous_seed | [bytes](#bytes) |  | TODO: is this necessary? contact_rendezvous_seed is the rendezvous seed of the contact sending the request |
| contact_metadata | [bytes](#bytes) |  | TODO: is this necessary? contact_metadata is the metadata specific to the app to identify the contact for the request |

<a name="berty.protocol.AccountContactRequestReferenceReset"></a>

### AccountContactRequestReferenceReset
AccountContactRequestDisabled indicates that the account should be advertised on different public rendezvous points

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| rendezvous_seed | [bytes](#bytes) |  | rendezvous_seed is the new rendezvous point seed |

<a name="berty.protocol.AccountContactRequestSent"></a>

### AccountContactRequestSent
AccountContactRequestSent indicates that the account has sent a contact request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the account event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contacted account |

<a name="berty.protocol.AccountContactUnblocked"></a>

### AccountContactUnblocked
AccountContactUnblocked indicates that a contact is unblocked

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact unblocked |

<a name="berty.protocol.AccountGroupJoined"></a>

### AccountGroupJoined
AccountGroupJoined indicates that the account is now part of a new group

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| group | [Group](#berty.protocol.Group) |  | group describe the joined group |

<a name="berty.protocol.AccountGroupLeft"></a>

### AccountGroupLeft
AccountGroupJoined indicates that the account has left a group

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| group_pk | [bytes](#bytes) |  | group_pk references the group left |

<a name="berty.protocol.ActivateGroup"></a>

### ActivateGroup

<a name="berty.protocol.ActivateGroup.Reply"></a>

### ActivateGroup.Reply

<a name="berty.protocol.ActivateGroup.Request"></a>

### ActivateGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.protocol.AppMessageSend"></a>

### AppMessageSend

<a name="berty.protocol.AppMessageSend.Reply"></a>

### AppMessageSend.Reply

<a name="berty.protocol.AppMessageSend.Request"></a>

### AppMessageSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| payload | [bytes](#bytes) |  | payload is the payload to send |

<a name="berty.protocol.AppMetadata"></a>

### AppMetadata
AppMetadata is an app defined message, accessible to future group members

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| message | [bytes](#bytes) |  | message is the payload |

<a name="berty.protocol.AppMetadataSend"></a>

### AppMetadataSend

<a name="berty.protocol.AppMetadataSend.Reply"></a>

### AppMetadataSend.Reply

<a name="berty.protocol.AppMetadataSend.Request"></a>

### AppMetadataSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| payload | [bytes](#bytes) |  | payload is the payload to send |

<a name="berty.protocol.ContactAddAliasKey"></a>

### ContactAddAliasKey
ContactAddAliasKey is an event type where ones shares their alias public key

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| alias_pk | [bytes](#bytes) |  | alias_pk is the alias key which will be used to verify a contact identity |

<a name="berty.protocol.ContactAliasKeySend"></a>

### ContactAliasKeySend

<a name="berty.protocol.ContactAliasKeySend.Reply"></a>

### ContactAliasKeySend.Reply

<a name="berty.protocol.ContactAliasKeySend.Request"></a>

### ContactAliasKeySend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to send the alias public key to |

<a name="berty.protocol.ContactBlock"></a>

### ContactBlock

<a name="berty.protocol.ContactBlock.Reply"></a>

### ContactBlock.Reply

<a name="berty.protocol.ContactBlock.Request"></a>

### ContactBlock.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to block |

<a name="berty.protocol.ContactRequestAccept"></a>

### ContactRequestAccept

<a name="berty.protocol.ContactRequestAccept.Reply"></a>

### ContactRequestAccept.Reply

<a name="berty.protocol.ContactRequestAccept.Request"></a>

### ContactRequestAccept.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to accept the request from |

<a name="berty.protocol.ContactRequestDisable"></a>

### ContactRequestDisable

<a name="berty.protocol.ContactRequestDisable.Reply"></a>

### ContactRequestDisable.Reply

<a name="berty.protocol.ContactRequestDisable.Request"></a>

### ContactRequestDisable.Request

<a name="berty.protocol.ContactRequestDiscard"></a>

### ContactRequestDiscard

<a name="berty.protocol.ContactRequestDiscard.Reply"></a>

### ContactRequestDiscard.Reply

<a name="berty.protocol.ContactRequestDiscard.Request"></a>

### ContactRequestDiscard.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to ignore the request from |

<a name="berty.protocol.ContactRequestEnable"></a>

### ContactRequestEnable

<a name="berty.protocol.ContactRequestEnable.Reply"></a>

### ContactRequestEnable.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| reference | [bytes](#bytes) |  | reference is an opaque message describing how to connect to the current account |

<a name="berty.protocol.ContactRequestEnable.Request"></a>

### ContactRequestEnable.Request

<a name="berty.protocol.ContactRequestReference"></a>

### ContactRequestReference

<a name="berty.protocol.ContactRequestReference.Reply"></a>

### ContactRequestReference.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| reference | [bytes](#bytes) |  | reference is an opaque message describing how to connect to the current account |
| enabled | [bool](#bool) |  | enabled indicates if incoming contact requests are enabled |

<a name="berty.protocol.ContactRequestReference.Request"></a>

### ContactRequestReference.Request

<a name="berty.protocol.ContactRequestResetReference"></a>

### ContactRequestResetReference

<a name="berty.protocol.ContactRequestResetReference.Reply"></a>

### ContactRequestResetReference.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| reference | [bytes](#bytes) |  | reference is an opaque message describing how to connect to the current account |

<a name="berty.protocol.ContactRequestResetReference.Request"></a>

### ContactRequestResetReference.Request

<a name="berty.protocol.ContactRequestSend"></a>

### ContactRequestSend

<a name="berty.protocol.ContactRequestSend.Reply"></a>

### ContactRequestSend.Reply

<a name="berty.protocol.ContactRequestSend.Request"></a>

### ContactRequestSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| reference | [bytes](#bytes) |  | reference is an opaque message describing how to connect to the other account |
| contact_metadata | [bytes](#bytes) |  | contact_metadata is the metadata specific to the app to identify the contact for the request |

<a name="berty.protocol.ContactUnblock"></a>

### ContactUnblock

<a name="berty.protocol.ContactUnblock.Reply"></a>

### ContactUnblock.Reply

<a name="berty.protocol.ContactUnblock.Request"></a>

### ContactUnblock.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to unblock |

<a name="berty.protocol.DeactivateGroup"></a>

### DeactivateGroup

<a name="berty.protocol.DeactivateGroup.Reply"></a>

### DeactivateGroup.Reply

<a name="berty.protocol.DeactivateGroup.Request"></a>

### DeactivateGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.protocol.DeviceSecret"></a>

### DeviceSecret
DeviceSecret is encrypted for a specific member of the group

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| chain_key | [bytes](#bytes) |  | chain_key is the current value of the chain key of the group device |
| counter | [uint64](#uint64) |  | counter is the current value of the counter of the group device |

<a name="berty.protocol.EventContext"></a>

### EventContext
EventContext adds context (its id and its parents) to an event

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [bytes](#bytes) |  | id is the CID of the underlying OrbitDB event |
| parent_ids | [bytes](#bytes) | repeated | id are the the CIDs of the underlying parents of the OrbitDB event |
| group_pk | [bytes](#bytes) |  | group_pk receiving the event |

<a name="berty.protocol.Group"></a>

### Group
Group define a group and is enough to invite someone to it

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [bytes](#bytes) |  | public_key is the identifier of the group, it signs the group secret and the initial member of a multi-member group |
| secret | [bytes](#bytes) |  | secret is the symmetric secret of the group, which is used to encrypt the metadata |
| secret_sig | [bytes](#bytes) |  | secret_sig is the signature of the secret used to ensure the validity of the group |
| group_type | [GroupType](#berty.protocol.GroupType) |  | group_type specifies the type of the group |

<a name="berty.protocol.GroupAddAdditionalRendezvousSeed"></a>

### GroupAddAdditionalRendezvousSeed
GroupAddAdditionalRendezvousSeed indicates that an additional rendezvous point should be used for data synchronization

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message, must be the device of an admin of the group |
| seed | [bytes](#bytes) |  | seed is the additional rendezvous point seed which should be used |

<a name="berty.protocol.GroupAddDeviceSecret"></a>

### GroupAddDeviceSecret
GroupAddDeviceSecret is an event which indicates to a group member a device secret

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| dest_member_pk | [bytes](#bytes) |  | dest_member_pk is the member who should receive the secret |
| payload | [bytes](#bytes) |  | payload is the serialization of Payload encrypted for the specified member |

<a name="berty.protocol.GroupAddMemberDevice"></a>

### GroupAddMemberDevice
GroupAddMemberDevice is an event which indicates to a group a new device (and eventually a new member) is joining it
When added on AccountGroup, this event should be followed by appropriate GroupAddMemberDevice and GroupAddDeviceSecret events

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| member_pk | [bytes](#bytes) |  | member_pk is the member sending the event |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| member_sig | [bytes](#bytes) |  | member_sig is used to prove the ownership of the member pk

TODO: signature of what ??? ensure it can&#39;t be replayed |

<a name="berty.protocol.GroupEnvelope"></a>

### GroupEnvelope
GroupEnvelope is a publicly exposed structure containing a group metadata event

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| nonce | [bytes](#bytes) |  | nonce is used to encrypt the message |
| event | [bytes](#bytes) |  | event is encrypted using a symmetric key shared among group members |

<a name="berty.protocol.GroupInfo"></a>

### GroupInfo

<a name="berty.protocol.GroupInfo.Reply"></a>

### GroupInfo.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.protocol.Group) |  | group is the group invitation, containing the group pk and its type |
| member_pk | [bytes](#bytes) |  | member_pk is the identifier of the current member in the group |
| device_pk | [bytes](#bytes) |  | member_pk is the identifier of the current device in the group |

<a name="berty.protocol.GroupInfo.Request"></a>

### GroupInfo.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact |

<a name="berty.protocol.GroupMessageEvent"></a>

### GroupMessageEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event_context | [EventContext](#berty.protocol.EventContext) |  | event_context contains context information about the event |
| headers | [MessageHeaders](#berty.protocol.MessageHeaders) |  | headers contains headers of the secure message |
| message | [bytes](#bytes) |  | message contains the secure message payload |

<a name="berty.protocol.GroupMessageList"></a>

### GroupMessageList

<a name="berty.protocol.GroupMessageList.Request"></a>

### GroupMessageList.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.protocol.GroupMessageSubscribe"></a>

### GroupMessageSubscribe

<a name="berty.protocol.GroupMessageSubscribe.Request"></a>

### GroupMessageSubscribe.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| since | [bytes](#bytes) |  | since is the lower ID bound used to filter events |
| until | [bytes](#bytes) |  | until is the upper ID bound used to filter events |
| go_backwards | [bool](#bool) |  | go_backwards indicates whether the events should be returned in reverse order |

<a name="berty.protocol.GroupMetadata"></a>

### GroupMetadata
GroupMetadata is used in GroupEnvelope and only readable by invited group members

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event_type | [EventType](#berty.protocol.EventType) |  | event_type defines which event type is used |
| payload | [bytes](#bytes) |  | the serialization depends on event_type, event is symmetrically encrypted |
| sig | [bytes](#bytes) |  | sig is the signature of the payload, it depends on the event_type for the used key |

<a name="berty.protocol.GroupMetadataEvent"></a>

### GroupMetadataEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event_context | [EventContext](#berty.protocol.EventContext) |  | event_context contains context information about the event |
| metadata | [GroupMetadata](#berty.protocol.GroupMetadata) |  | metadata contains the newly available metadata |
| event | [bytes](#bytes) |  | event_clear clear bytes for the event |

<a name="berty.protocol.GroupMetadataList"></a>

### GroupMetadataList

<a name="berty.protocol.GroupMetadataList.Request"></a>

### GroupMetadataList.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.protocol.GroupMetadataSubscribe"></a>

### GroupMetadataSubscribe

<a name="berty.protocol.GroupMetadataSubscribe.Request"></a>

### GroupMetadataSubscribe.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| since | [bytes](#bytes) |  | since is the lower ID bound used to filter events |
| until | [bytes](#bytes) |  | until is the upper ID bound used to filter events |
| go_backwards | [bool](#bool) |  | go_backwards indicates whether the events should be returned in reverse order |

<a name="berty.protocol.GroupRemoveAdditionalRendezvousSeed"></a>

### GroupRemoveAdditionalRendezvousSeed
GroupRemoveAdditionalRendezvousSeed indicates that a previously added rendezvous point should be removed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message, must be the device of an admin of the group |
| seed | [bytes](#bytes) |  | seed is the additional rendezvous point seed which should be removed |

<a name="berty.protocol.InstanceExportData"></a>

### InstanceExportData

<a name="berty.protocol.InstanceExportData.Reply"></a>

### InstanceExportData.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| exported_data | [bytes](#bytes) |  |  |

<a name="berty.protocol.InstanceExportData.Request"></a>

### InstanceExportData.Request

<a name="berty.protocol.InstanceGetConfiguration"></a>

### InstanceGetConfiguration

<a name="berty.protocol.InstanceGetConfiguration.Reply"></a>

### InstanceGetConfiguration.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| account_pk | [bytes](#bytes) |  | account_pk is the public key of the current account |
| device_pk | [bytes](#bytes) |  | device_pk is the public key of the current device |
| account_group_pk | [bytes](#bytes) |  | account_group_pk is the public key of the account group |
| peer_id | [string](#string) |  |  |
| listeners | [string](#string) | repeated |  |
| ble_enabled | [InstanceGetConfiguration.SettingState](#berty.protocol.InstanceGetConfiguration.SettingState) |  |  |
| wifi_p2p_enabled | [InstanceGetConfiguration.SettingState](#berty.protocol.InstanceGetConfiguration.SettingState) |  | MultiPeerConnectivity for Darwin and Nearby for Android |
| mdns_enabled | [InstanceGetConfiguration.SettingState](#berty.protocol.InstanceGetConfiguration.SettingState) |  |  |
| relay_enabled | [InstanceGetConfiguration.SettingState](#berty.protocol.InstanceGetConfiguration.SettingState) |  |  |

<a name="berty.protocol.InstanceGetConfiguration.Request"></a>

### InstanceGetConfiguration.Request

<a name="berty.protocol.MessageEnvelope"></a>

### MessageEnvelope
MessageEnvelope is a publicly exposed structure containing a group secure message

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| message_headers | [bytes](#bytes) |  | message_headers is an encrypted serialization using a symmetric key of a MessageHeaders message |
| message | [bytes](#bytes) |  | message is an encrypted message, only readable by group members who previously received the appropriate chain key |
| nonce | [bytes](#bytes) |  | nonce is a nonce for message headers |

<a name="berty.protocol.MessageHeaders"></a>

### MessageHeaders
MessageHeaders is used in MessageEnvelope and only readable by invited group members

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| counter | [uint64](#uint64) |  | counter is the current counter value for the specified device |
| device_pk | [bytes](#bytes) |  | device_pk is the public key of the device sending the message |
| sig | [bytes](#bytes) |  | sig is the signature of the encrypted message using the device&#39;s private key |

<a name="berty.protocol.MultiMemberGrantAdminRole"></a>

### MultiMemberGrantAdminRole
MultiMemberGrantAdminRole indicates that a group admin allows another group member to act as an admin

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message, must be the device of an admin of the group |
| grantee_member_pk | [bytes](#bytes) |  | grantee_member_pk is the member public key of the member granted of the admin role |

<a name="berty.protocol.MultiMemberGroupAddAliasResolver"></a>

### MultiMemberGroupAddAliasResolver
MultiMemberGroupAddAliasResolver indicates that a group member want to disclose their presence in the group to their contacts

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| alias_resolver | [bytes](#bytes) |  | alias_resolver allows contact of an account to resolve the real identity behind an alias (Multi-Member Group Member) Generated by both contacts and account independently using: hmac(aliasPK, GroupID) |
| alias_proof | [bytes](#bytes) |  | alias_proof ensures that the associated alias_resolver has been issued by the right account Generated using aliasSKSig(GroupID) |

<a name="berty.protocol.MultiMemberGroupAdminRoleGrant"></a>

### MultiMemberGroupAdminRoleGrant

<a name="berty.protocol.MultiMemberGroupAdminRoleGrant.Reply"></a>

### MultiMemberGroupAdminRoleGrant.Reply

<a name="berty.protocol.MultiMemberGroupAdminRoleGrant.Request"></a>

### MultiMemberGroupAdminRoleGrant.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| member_pk | [bytes](#bytes) |  | member_pk is the identifier of the member which will be granted the admin role |

<a name="berty.protocol.MultiMemberGroupAliasResolverDisclose"></a>

### MultiMemberGroupAliasResolverDisclose

<a name="berty.protocol.MultiMemberGroupAliasResolverDisclose.Reply"></a>

### MultiMemberGroupAliasResolverDisclose.Reply

<a name="berty.protocol.MultiMemberGroupAliasResolverDisclose.Request"></a>

### MultiMemberGroupAliasResolverDisclose.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.protocol.MultiMemberGroupCreate"></a>

### MultiMemberGroupCreate

<a name="berty.protocol.MultiMemberGroupCreate.Reply"></a>

### MultiMemberGroupCreate.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the newly created group |

<a name="berty.protocol.MultiMemberGroupCreate.Request"></a>

### MultiMemberGroupCreate.Request

<a name="berty.protocol.MultiMemberGroupInvitationCreate"></a>

### MultiMemberGroupInvitationCreate

<a name="berty.protocol.MultiMemberGroupInvitationCreate.Reply"></a>

### MultiMemberGroupInvitationCreate.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.protocol.Group) |  | group is the invitation to the group |

<a name="berty.protocol.MultiMemberGroupInvitationCreate.Request"></a>

### MultiMemberGroupInvitationCreate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.protocol.MultiMemberGroupJoin"></a>

### MultiMemberGroupJoin

<a name="berty.protocol.MultiMemberGroupJoin.Reply"></a>

### MultiMemberGroupJoin.Reply

<a name="berty.protocol.MultiMemberGroupJoin.Request"></a>

### MultiMemberGroupJoin.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.protocol.Group) |  | group is the information of the group to join |

<a name="berty.protocol.MultiMemberGroupLeave"></a>

### MultiMemberGroupLeave

<a name="berty.protocol.MultiMemberGroupLeave.Reply"></a>

### MultiMemberGroupLeave.Reply

<a name="berty.protocol.MultiMemberGroupLeave.Request"></a>

### MultiMemberGroupLeave.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  |  |

<a name="berty.protocol.MultiMemberInitialMember"></a>

### MultiMemberInitialMember
MultiMemberInitialMember indicates that a member is the group creator, this event is signed using the group ID private key

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| member_pk | [bytes](#bytes) |  | member_pk is the public key of the member who is the group creator |

<a name="berty.protocol.ShareableContact"></a>

### ShareableContact

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| pk | [bytes](#bytes) |  | contact_pk is the account to send a contact request to |
| public_rendezvous_seed | [bytes](#bytes) |  | contact_rendezvous_seed is the rendezvous seed used by the other account |
| metadata | [bytes](#bytes) |  | contact_metadata is the metadata specific to the app to identify the contact for the request |

 

<a name="berty.protocol.ContactState"></a>

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

<a name="berty.protocol.EventType"></a>

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
| EventTypeAccountContactRequestReferenceReset | 105 | EventTypeAccountContactRequestReferenceReset indicates the payload includes that the account has a new contact request reference |
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

<a name="berty.protocol.GroupType"></a>

### GroupType

| Name | Number | Description |
| ---- | ------ | ----------- |
| GroupTypeUndefined | 0 | GroupTypeUndefined indicates that the value has not been set. Should not happen. |
| GroupTypeAccount | 1 | GroupTypeAccount is the group managing an account, available to all its devices. |
| GroupTypeContact | 2 | GroupTypeContact is the group created between two accounts, available to all their devices. |
| GroupTypeMultiMember | 3 | GroupTypeMultiMember is a group containing an undefined number of members. |

<a name="berty.protocol.InstanceGetConfiguration.SettingState"></a>

### InstanceGetConfiguration.SettingState

| Name | Number | Description |
| ---- | ------ | ----------- |
| Unknown | 0 |  |
| Enabled | 1 |  |
| Disabled | 2 |  |
| Unavailable | 3 |  |

 

 

<a name="berty.protocol.ProtocolService"></a>

### ProtocolService
ProtocolService is the top-level API to manage an instance of the Berty Protocol.
Each Berty Protocol Instance is considered as a Berty device and is associated with a Berty user.

| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| InstanceExportData | [InstanceExportData.Request](#berty.protocol.InstanceExportData.Request) | [InstanceExportData.Reply](#berty.protocol.InstanceExportData.Reply) | InstanceExportData exports instance data |
| InstanceGetConfiguration | [InstanceGetConfiguration.Request](#berty.protocol.InstanceGetConfiguration.Request) | [InstanceGetConfiguration.Reply](#berty.protocol.InstanceGetConfiguration.Reply) | InstanceGetConfiguration gets current configuration of this protocol instance |
| ContactRequestReference | [ContactRequestReference.Request](#berty.protocol.ContactRequestReference.Request) | [ContactRequestReference.Reply](#berty.protocol.ContactRequestReference.Reply) | ContactRequestReference retrieves the information required to create a reference (ie. included in a shareable link) to the current account |
| ContactRequestDisable | [ContactRequestDisable.Request](#berty.protocol.ContactRequestDisable.Request) | [ContactRequestDisable.Reply](#berty.protocol.ContactRequestDisable.Reply) | ContactRequestDisable disables incoming contact requests |
| ContactRequestEnable | [ContactRequestEnable.Request](#berty.protocol.ContactRequestEnable.Request) | [ContactRequestEnable.Reply](#berty.protocol.ContactRequestEnable.Reply) | ContactRequestEnable enables incoming contact requests |
| ContactRequestResetReference | [ContactRequestResetReference.Request](#berty.protocol.ContactRequestResetReference.Request) | [ContactRequestResetReference.Reply](#berty.protocol.ContactRequestResetReference.Reply) | ContactRequestResetReference changes the contact request reference |
| ContactRequestSend | [ContactRequestSend.Request](#berty.protocol.ContactRequestSend.Request) | [ContactRequestSend.Reply](#berty.protocol.ContactRequestSend.Reply) | ContactRequestSend attempt to send a contact request |
| ContactRequestAccept | [ContactRequestAccept.Request](#berty.protocol.ContactRequestAccept.Request) | [ContactRequestAccept.Reply](#berty.protocol.ContactRequestAccept.Reply) | ContactRequestAccept accepts a contact request |
| ContactRequestDiscard | [ContactRequestDiscard.Request](#berty.protocol.ContactRequestDiscard.Request) | [ContactRequestDiscard.Reply](#berty.protocol.ContactRequestDiscard.Reply) | ContactRequestDiscard ignores a contact request, without informing the other user |
| ContactBlock | [ContactBlock.Request](#berty.protocol.ContactBlock.Request) | [ContactBlock.Reply](#berty.protocol.ContactBlock.Reply) | ContactBlock blocks a contact from sending requests |
| ContactUnblock | [ContactUnblock.Request](#berty.protocol.ContactUnblock.Request) | [ContactUnblock.Reply](#berty.protocol.ContactUnblock.Reply) | ContactUnblock unblocks a contact from sending requests |
| ContactAliasKeySend | [ContactAliasKeySend.Request](#berty.protocol.ContactAliasKeySend.Request) | [ContactAliasKeySend.Reply](#berty.protocol.ContactAliasKeySend.Reply) | ContactAliasKeySend send an alias key to a contact, the contact will be able to assert that your account is being present on a multi-member group |
| MultiMemberGroupCreate | [MultiMemberGroupCreate.Request](#berty.protocol.MultiMemberGroupCreate.Request) | [MultiMemberGroupCreate.Reply](#berty.protocol.MultiMemberGroupCreate.Reply) | MultiMemberGroupCreate creates a new multi-member group |
| MultiMemberGroupJoin | [MultiMemberGroupJoin.Request](#berty.protocol.MultiMemberGroupJoin.Request) | [MultiMemberGroupJoin.Reply](#berty.protocol.MultiMemberGroupJoin.Reply) | MultiMemberGroupJoin joins a multi-member group |
| MultiMemberGroupLeave | [MultiMemberGroupLeave.Request](#berty.protocol.MultiMemberGroupLeave.Request) | [MultiMemberGroupLeave.Reply](#berty.protocol.MultiMemberGroupLeave.Reply) | MultiMemberGroupLeave leaves a multi-member group |
| MultiMemberGroupAliasResolverDisclose | [MultiMemberGroupAliasResolverDisclose.Request](#berty.protocol.MultiMemberGroupAliasResolverDisclose.Request) | [MultiMemberGroupAliasResolverDisclose.Reply](#berty.protocol.MultiMemberGroupAliasResolverDisclose.Reply) | MultiMemberGroupAliasResolverDisclose discloses your alias resolver key |
| MultiMemberGroupAdminRoleGrant | [MultiMemberGroupAdminRoleGrant.Request](#berty.protocol.MultiMemberGroupAdminRoleGrant.Request) | [MultiMemberGroupAdminRoleGrant.Reply](#berty.protocol.MultiMemberGroupAdminRoleGrant.Reply) | MultiMemberGroupAdminRoleGrant grants an admin role to a group member |
| MultiMemberGroupInvitationCreate | [MultiMemberGroupInvitationCreate.Request](#berty.protocol.MultiMemberGroupInvitationCreate.Request) | [MultiMemberGroupInvitationCreate.Reply](#berty.protocol.MultiMemberGroupInvitationCreate.Reply) | MultiMemberGroupInvitationCreate creates an invitation to a multi-member group |
| AppMetadataSend | [AppMetadataSend.Request](#berty.protocol.AppMetadataSend.Request) | [AppMetadataSend.Reply](#berty.protocol.AppMetadataSend.Reply) | AppMetadataSend adds an app event to the metadata store, the message is encrypted using a symmetric key and readable by future group members |
| AppMessageSend | [AppMessageSend.Request](#berty.protocol.AppMessageSend.Request) | [AppMessageSend.Reply](#berty.protocol.AppMessageSend.Reply) | AppMessageSend adds an app event to the message store, the message is encrypted using a derived key and readable by current group members |
| GroupMetadataSubscribe | [GroupMetadataSubscribe.Request](#berty.protocol.GroupMetadataSubscribe.Request) | [GroupMetadataEvent](#berty.protocol.GroupMetadataEvent) stream | GroupMetadataSubscribe subscribes to a group metadata updates (or it can also retrieve the history) |
| GroupMessageSubscribe | [GroupMessageSubscribe.Request](#berty.protocol.GroupMessageSubscribe.Request) | [GroupMessageEvent](#berty.protocol.GroupMessageEvent) stream | GroupMessageSubscribe subscribes to a group message updates (or it can also retrieve the history) |
| GroupMetadataList | [GroupMetadataList.Request](#berty.protocol.GroupMetadataList.Request) | [GroupMetadataEvent](#berty.protocol.GroupMetadataEvent) stream | GroupMetadataList replays metadata events from the group |
| GroupMessageList | [GroupMessageList.Request](#berty.protocol.GroupMessageList.Request) | [GroupMessageEvent](#berty.protocol.GroupMessageEvent) stream | GroupMessageList replays message events from the group |
| GroupInfo | [GroupInfo.Request](#berty.protocol.GroupInfo.Request) | [GroupInfo.Reply](#berty.protocol.GroupInfo.Reply) | GroupInfo retrieves information about a group |
| ActivateGroup | [ActivateGroup.Request](#berty.protocol.ActivateGroup.Request) | [ActivateGroup.Reply](#berty.protocol.ActivateGroup.Reply) | ActivateGroup explicitly opens a group, groups are automatically enabled when actions are performed on them |
| DeactivateGroup | [DeactivateGroup.Request](#berty.protocol.DeactivateGroup.Request) | [DeactivateGroup.Reply](#berty.protocol.DeactivateGroup.Reply) | DeactivateGroup closes a group |

 

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

