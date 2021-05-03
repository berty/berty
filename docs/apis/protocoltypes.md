# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [protocoltypes.proto](#protocoltypes.proto)
    - [Account](#berty.protocol.v1.Account)
    - [AccountContactBlocked](#berty.protocol.v1.AccountContactBlocked)
    - [AccountContactRequestAccepted](#berty.protocol.v1.AccountContactRequestAccepted)
    - [AccountContactRequestDisabled](#berty.protocol.v1.AccountContactRequestDisabled)
    - [AccountContactRequestDiscarded](#berty.protocol.v1.AccountContactRequestDiscarded)
    - [AccountContactRequestEnabled](#berty.protocol.v1.AccountContactRequestEnabled)
    - [AccountContactRequestEnqueued](#berty.protocol.v1.AccountContactRequestEnqueued)
    - [AccountContactRequestReceived](#berty.protocol.v1.AccountContactRequestReceived)
    - [AccountContactRequestReferenceReset](#berty.protocol.v1.AccountContactRequestReferenceReset)
    - [AccountContactRequestSent](#berty.protocol.v1.AccountContactRequestSent)
    - [AccountContactUnblocked](#berty.protocol.v1.AccountContactUnblocked)
    - [AccountGroupJoined](#berty.protocol.v1.AccountGroupJoined)
    - [AccountGroupLeft](#berty.protocol.v1.AccountGroupLeft)
    - [AccountServiceTokenAdded](#berty.protocol.v1.AccountServiceTokenAdded)
    - [AccountServiceTokenRemoved](#berty.protocol.v1.AccountServiceTokenRemoved)
    - [ActivateGroup](#berty.protocol.v1.ActivateGroup)
    - [ActivateGroup.Reply](#berty.protocol.v1.ActivateGroup.Reply)
    - [ActivateGroup.Request](#berty.protocol.v1.ActivateGroup.Request)
    - [AppMessageSend](#berty.protocol.v1.AppMessageSend)
    - [AppMessageSend.Reply](#berty.protocol.v1.AppMessageSend.Reply)
    - [AppMessageSend.Request](#berty.protocol.v1.AppMessageSend.Request)
    - [AppMetadata](#berty.protocol.v1.AppMetadata)
    - [AppMetadataSend](#berty.protocol.v1.AppMetadataSend)
    - [AppMetadataSend.Reply](#berty.protocol.v1.AppMetadataSend.Reply)
    - [AppMetadataSend.Request](#berty.protocol.v1.AppMetadataSend.Request)
    - [AttachmentPrepare](#berty.protocol.v1.AttachmentPrepare)
    - [AttachmentPrepare.Reply](#berty.protocol.v1.AttachmentPrepare.Reply)
    - [AttachmentPrepare.Request](#berty.protocol.v1.AttachmentPrepare.Request)
    - [AttachmentRetrieve](#berty.protocol.v1.AttachmentRetrieve)
    - [AttachmentRetrieve.Reply](#berty.protocol.v1.AttachmentRetrieve.Reply)
    - [AttachmentRetrieve.Request](#berty.protocol.v1.AttachmentRetrieve.Request)
    - [AuthServiceCompleteFlow](#berty.protocol.v1.AuthServiceCompleteFlow)
    - [AuthServiceCompleteFlow.Reply](#berty.protocol.v1.AuthServiceCompleteFlow.Reply)
    - [AuthServiceCompleteFlow.Request](#berty.protocol.v1.AuthServiceCompleteFlow.Request)
    - [AuthServiceInitFlow](#berty.protocol.v1.AuthServiceInitFlow)
    - [AuthServiceInitFlow.Reply](#berty.protocol.v1.AuthServiceInitFlow.Reply)
    - [AuthServiceInitFlow.Request](#berty.protocol.v1.AuthServiceInitFlow.Request)
    - [ContactAddAliasKey](#berty.protocol.v1.ContactAddAliasKey)
    - [ContactAliasKeySend](#berty.protocol.v1.ContactAliasKeySend)
    - [ContactAliasKeySend.Reply](#berty.protocol.v1.ContactAliasKeySend.Reply)
    - [ContactAliasKeySend.Request](#berty.protocol.v1.ContactAliasKeySend.Request)
    - [ContactBlock](#berty.protocol.v1.ContactBlock)
    - [ContactBlock.Reply](#berty.protocol.v1.ContactBlock.Reply)
    - [ContactBlock.Request](#berty.protocol.v1.ContactBlock.Request)
    - [ContactRequestAccept](#berty.protocol.v1.ContactRequestAccept)
    - [ContactRequestAccept.Reply](#berty.protocol.v1.ContactRequestAccept.Reply)
    - [ContactRequestAccept.Request](#berty.protocol.v1.ContactRequestAccept.Request)
    - [ContactRequestDisable](#berty.protocol.v1.ContactRequestDisable)
    - [ContactRequestDisable.Reply](#berty.protocol.v1.ContactRequestDisable.Reply)
    - [ContactRequestDisable.Request](#berty.protocol.v1.ContactRequestDisable.Request)
    - [ContactRequestDiscard](#berty.protocol.v1.ContactRequestDiscard)
    - [ContactRequestDiscard.Reply](#berty.protocol.v1.ContactRequestDiscard.Reply)
    - [ContactRequestDiscard.Request](#berty.protocol.v1.ContactRequestDiscard.Request)
    - [ContactRequestEnable](#berty.protocol.v1.ContactRequestEnable)
    - [ContactRequestEnable.Reply](#berty.protocol.v1.ContactRequestEnable.Reply)
    - [ContactRequestEnable.Request](#berty.protocol.v1.ContactRequestEnable.Request)
    - [ContactRequestReference](#berty.protocol.v1.ContactRequestReference)
    - [ContactRequestReference.Reply](#berty.protocol.v1.ContactRequestReference.Reply)
    - [ContactRequestReference.Request](#berty.protocol.v1.ContactRequestReference.Request)
    - [ContactRequestResetReference](#berty.protocol.v1.ContactRequestResetReference)
    - [ContactRequestResetReference.Reply](#berty.protocol.v1.ContactRequestResetReference.Reply)
    - [ContactRequestResetReference.Request](#berty.protocol.v1.ContactRequestResetReference.Request)
    - [ContactRequestSend](#berty.protocol.v1.ContactRequestSend)
    - [ContactRequestSend.Reply](#berty.protocol.v1.ContactRequestSend.Reply)
    - [ContactRequestSend.Request](#berty.protocol.v1.ContactRequestSend.Request)
    - [ContactUnblock](#berty.protocol.v1.ContactUnblock)
    - [ContactUnblock.Reply](#berty.protocol.v1.ContactUnblock.Reply)
    - [ContactUnblock.Request](#berty.protocol.v1.ContactUnblock.Request)
    - [DeactivateGroup](#berty.protocol.v1.DeactivateGroup)
    - [DeactivateGroup.Reply](#berty.protocol.v1.DeactivateGroup.Reply)
    - [DeactivateGroup.Request](#berty.protocol.v1.DeactivateGroup.Request)
    - [DebugGroup](#berty.protocol.v1.DebugGroup)
    - [DebugGroup.Reply](#berty.protocol.v1.DebugGroup.Reply)
    - [DebugGroup.Request](#berty.protocol.v1.DebugGroup.Request)
    - [DebugInspectGroupStore](#berty.protocol.v1.DebugInspectGroupStore)
    - [DebugInspectGroupStore.Reply](#berty.protocol.v1.DebugInspectGroupStore.Reply)
    - [DebugInspectGroupStore.Request](#berty.protocol.v1.DebugInspectGroupStore.Request)
    - [DebugListGroups](#berty.protocol.v1.DebugListGroups)
    - [DebugListGroups.Reply](#berty.protocol.v1.DebugListGroups.Reply)
    - [DebugListGroups.Request](#berty.protocol.v1.DebugListGroups.Request)
    - [DeviceSecret](#berty.protocol.v1.DeviceSecret)
    - [EncryptedMessage](#berty.protocol.v1.EncryptedMessage)
    - [EventContext](#berty.protocol.v1.EventContext)
    - [Group](#berty.protocol.v1.Group)
    - [GroupAddAdditionalRendezvousSeed](#berty.protocol.v1.GroupAddAdditionalRendezvousSeed)
    - [GroupAddDeviceSecret](#berty.protocol.v1.GroupAddDeviceSecret)
    - [GroupAddMemberDevice](#berty.protocol.v1.GroupAddMemberDevice)
    - [GroupEnvelope](#berty.protocol.v1.GroupEnvelope)
    - [GroupHeadsExport](#berty.protocol.v1.GroupHeadsExport)
    - [GroupInfo](#berty.protocol.v1.GroupInfo)
    - [GroupInfo.Reply](#berty.protocol.v1.GroupInfo.Reply)
    - [GroupInfo.Request](#berty.protocol.v1.GroupInfo.Request)
    - [GroupMessageEvent](#berty.protocol.v1.GroupMessageEvent)
    - [GroupMessageList](#berty.protocol.v1.GroupMessageList)
    - [GroupMessageList.Request](#berty.protocol.v1.GroupMessageList.Request)
    - [GroupMetadata](#berty.protocol.v1.GroupMetadata)
    - [GroupMetadataEvent](#berty.protocol.v1.GroupMetadataEvent)
    - [GroupMetadataList](#berty.protocol.v1.GroupMetadataList)
    - [GroupMetadataList.Request](#berty.protocol.v1.GroupMetadataList.Request)
    - [GroupRemoveAdditionalRendezvousSeed](#berty.protocol.v1.GroupRemoveAdditionalRendezvousSeed)
    - [GroupReplicating](#berty.protocol.v1.GroupReplicating)
    - [InstanceExportData](#berty.protocol.v1.InstanceExportData)
    - [InstanceExportData.Reply](#berty.protocol.v1.InstanceExportData.Reply)
    - [InstanceExportData.Request](#berty.protocol.v1.InstanceExportData.Request)
    - [InstanceGetConfiguration](#berty.protocol.v1.InstanceGetConfiguration)
    - [InstanceGetConfiguration.Reply](#berty.protocol.v1.InstanceGetConfiguration.Reply)
    - [InstanceGetConfiguration.Request](#berty.protocol.v1.InstanceGetConfiguration.Request)
    - [MessageEnvelope](#berty.protocol.v1.MessageEnvelope)
    - [MessageHeaders](#berty.protocol.v1.MessageHeaders)
    - [MessageHeaders.MetadataEntry](#berty.protocol.v1.MessageHeaders.MetadataEntry)
    - [MonitorGroup](#berty.protocol.v1.MonitorGroup)
    - [MonitorGroup.EventMonitor](#berty.protocol.v1.MonitorGroup.EventMonitor)
    - [MonitorGroup.EventMonitorAdvertiseGroup](#berty.protocol.v1.MonitorGroup.EventMonitorAdvertiseGroup)
    - [MonitorGroup.EventMonitorPeerFound](#berty.protocol.v1.MonitorGroup.EventMonitorPeerFound)
    - [MonitorGroup.EventMonitorPeerJoin](#berty.protocol.v1.MonitorGroup.EventMonitorPeerJoin)
    - [MonitorGroup.EventMonitorPeerLeave](#berty.protocol.v1.MonitorGroup.EventMonitorPeerLeave)
    - [MonitorGroup.Reply](#berty.protocol.v1.MonitorGroup.Reply)
    - [MonitorGroup.Request](#berty.protocol.v1.MonitorGroup.Request)
    - [MultiMemberGrantAdminRole](#berty.protocol.v1.MultiMemberGrantAdminRole)
    - [MultiMemberGroupAddAliasResolver](#berty.protocol.v1.MultiMemberGroupAddAliasResolver)
    - [MultiMemberGroupAdminRoleGrant](#berty.protocol.v1.MultiMemberGroupAdminRoleGrant)
    - [MultiMemberGroupAdminRoleGrant.Reply](#berty.protocol.v1.MultiMemberGroupAdminRoleGrant.Reply)
    - [MultiMemberGroupAdminRoleGrant.Request](#berty.protocol.v1.MultiMemberGroupAdminRoleGrant.Request)
    - [MultiMemberGroupAliasResolverDisclose](#berty.protocol.v1.MultiMemberGroupAliasResolverDisclose)
    - [MultiMemberGroupAliasResolverDisclose.Reply](#berty.protocol.v1.MultiMemberGroupAliasResolverDisclose.Reply)
    - [MultiMemberGroupAliasResolverDisclose.Request](#berty.protocol.v1.MultiMemberGroupAliasResolverDisclose.Request)
    - [MultiMemberGroupCreate](#berty.protocol.v1.MultiMemberGroupCreate)
    - [MultiMemberGroupCreate.Reply](#berty.protocol.v1.MultiMemberGroupCreate.Reply)
    - [MultiMemberGroupCreate.Request](#berty.protocol.v1.MultiMemberGroupCreate.Request)
    - [MultiMemberGroupInvitationCreate](#berty.protocol.v1.MultiMemberGroupInvitationCreate)
    - [MultiMemberGroupInvitationCreate.Reply](#berty.protocol.v1.MultiMemberGroupInvitationCreate.Reply)
    - [MultiMemberGroupInvitationCreate.Request](#berty.protocol.v1.MultiMemberGroupInvitationCreate.Request)
    - [MultiMemberGroupJoin](#berty.protocol.v1.MultiMemberGroupJoin)
    - [MultiMemberGroupJoin.Reply](#berty.protocol.v1.MultiMemberGroupJoin.Reply)
    - [MultiMemberGroupJoin.Request](#berty.protocol.v1.MultiMemberGroupJoin.Request)
    - [MultiMemberGroupLeave](#berty.protocol.v1.MultiMemberGroupLeave)
    - [MultiMemberGroupLeave.Reply](#berty.protocol.v1.MultiMemberGroupLeave.Reply)
    - [MultiMemberGroupLeave.Request](#berty.protocol.v1.MultiMemberGroupLeave.Request)
    - [MultiMemberInitialMember](#berty.protocol.v1.MultiMemberInitialMember)
    - [PeerList](#berty.protocol.v1.PeerList)
    - [PeerList.Peer](#berty.protocol.v1.PeerList.Peer)
    - [PeerList.Reply](#berty.protocol.v1.PeerList.Reply)
    - [PeerList.Request](#berty.protocol.v1.PeerList.Request)
    - [PeerList.Route](#berty.protocol.v1.PeerList.Route)
    - [PeerList.Stream](#berty.protocol.v1.PeerList.Stream)
    - [Progress](#berty.protocol.v1.Progress)
    - [ProtocolMetadata](#berty.protocol.v1.ProtocolMetadata)
    - [ReplicationServiceRegisterGroup](#berty.protocol.v1.ReplicationServiceRegisterGroup)
    - [ReplicationServiceRegisterGroup.Reply](#berty.protocol.v1.ReplicationServiceRegisterGroup.Reply)
    - [ReplicationServiceRegisterGroup.Request](#berty.protocol.v1.ReplicationServiceRegisterGroup.Request)
    - [ReplicationServiceReplicateGroup](#berty.protocol.v1.ReplicationServiceReplicateGroup)
    - [ReplicationServiceReplicateGroup.Reply](#berty.protocol.v1.ReplicationServiceReplicateGroup.Reply)
    - [ReplicationServiceReplicateGroup.Request](#berty.protocol.v1.ReplicationServiceReplicateGroup.Request)
    - [ServiceToken](#berty.protocol.v1.ServiceToken)
    - [ServiceTokenSupportedService](#berty.protocol.v1.ServiceTokenSupportedService)
    - [ServicesTokenCode](#berty.protocol.v1.ServicesTokenCode)
    - [ServicesTokenList](#berty.protocol.v1.ServicesTokenList)
    - [ServicesTokenList.Reply](#berty.protocol.v1.ServicesTokenList.Reply)
    - [ServicesTokenList.Request](#berty.protocol.v1.ServicesTokenList.Request)
    - [ShareableContact](#berty.protocol.v1.ShareableContact)
    - [SystemInfo](#berty.protocol.v1.SystemInfo)
    - [SystemInfo.OrbitDB](#berty.protocol.v1.SystemInfo.OrbitDB)
    - [SystemInfo.OrbitDB.ReplicationStatus](#berty.protocol.v1.SystemInfo.OrbitDB.ReplicationStatus)
    - [SystemInfo.P2P](#berty.protocol.v1.SystemInfo.P2P)
    - [SystemInfo.Process](#berty.protocol.v1.SystemInfo.Process)
    - [SystemInfo.Reply](#berty.protocol.v1.SystemInfo.Reply)
    - [SystemInfo.Request](#berty.protocol.v1.SystemInfo.Request)
  
    - [ContactState](#berty.protocol.v1.ContactState)
    - [DebugInspectGroupLogType](#berty.protocol.v1.DebugInspectGroupLogType)
    - [Direction](#berty.protocol.v1.Direction)
    - [EventType](#berty.protocol.v1.EventType)
    - [GroupType](#berty.protocol.v1.GroupType)
    - [InstanceGetConfiguration.SettingState](#berty.protocol.v1.InstanceGetConfiguration.SettingState)
    - [MonitorGroup.TypeEventMonitor](#berty.protocol.v1.MonitorGroup.TypeEventMonitor)
    - [PeerList.Feature](#berty.protocol.v1.PeerList.Feature)
  
    - [ProtocolService](#berty.protocol.v1.ProtocolService)
  
- [Scalar Value Types](#scalar-value-types)

<a name="protocoltypes.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## protocoltypes.proto

<a name="berty.protocol.v1.Account"></a>

### Account
Account describes all the secrets that identifies an Account

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.protocol.v1.Group) |  | group specifies which group is used to manage the account |
| account_private_key | [bytes](#bytes) |  | account_private_key, private part is used to signs handshake, signs device, create contacts group keys via ECDH -- public part is used to have a shareable identity |
| alias_private_key | [bytes](#bytes) |  | alias_private_key, private part is use to derive group members private keys, signs alias proofs, public part can be shared to contacts to prove identity |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed, rendezvous seed used for direct communication |

<a name="berty.protocol.v1.AccountContactBlocked"></a>

### AccountContactBlocked
AccountContactBlocked indicates that a contact is blocked

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact blocked |

<a name="berty.protocol.v1.AccountContactRequestAccepted"></a>

### AccountContactRequestAccepted
This event should be followed by an AccountGroupJoined event
This event should be followed by GroupAddMemberDevice and GroupAddDeviceSecret events within the AccountGroup
AccountContactRequestAccepted indicates that a contact request has been accepted

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact whom request is accepted |
| group_pk | [bytes](#bytes) |  | group_pk is the 1to1 group with the requester user |

<a name="berty.protocol.v1.AccountContactRequestDisabled"></a>

### AccountContactRequestDisabled
AccountContactRequestDisabled indicates that the account should not be advertised on a public rendezvous point

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |

<a name="berty.protocol.v1.AccountContactRequestDiscarded"></a>

### AccountContactRequestDiscarded
AccountContactRequestDiscarded indicates that a contact request has been refused

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact whom request is refused |

<a name="berty.protocol.v1.AccountContactRequestEnabled"></a>

### AccountContactRequestEnabled
AccountContactRequestDisabled indicates that the account should be advertised on a public rendezvous point

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |

<a name="berty.protocol.v1.AccountContactRequestEnqueued"></a>

### AccountContactRequestEnqueued
This event should be followed by an AccountGroupJoined event
This event should be followed by a GroupAddMemberDevice event within the AccountGroup
This event should be followed by a GroupAddDeviceSecret event within the AccountGroup
AccountContactRequestEnqueued indicates that the account will attempt to send a contact request when a matching peer is discovered

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| group_pk | [bytes](#bytes) |  | group_pk is the 1to1 group with the requested user |
| contact | [ShareableContact](#berty.protocol.v1.ShareableContact) |  | contact is a message describing how to connect to the other account |
| own_metadata | [bytes](#bytes) |  | own_metadata is the identifying metadata that will be shared to the other account |

<a name="berty.protocol.v1.AccountContactRequestReceived"></a>

### AccountContactRequestReceived
AccountContactRequestReceived indicates that the account has received a new contact request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the account event (which received the contact request), signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the account sending the request |
| contact_rendezvous_seed | [bytes](#bytes) |  | TODO: is this necessary? contact_rendezvous_seed is the rendezvous seed of the contact sending the request |
| contact_metadata | [bytes](#bytes) |  | TODO: is this necessary? contact_metadata is the metadata specific to the app to identify the contact for the request |

<a name="berty.protocol.v1.AccountContactRequestReferenceReset"></a>

### AccountContactRequestReferenceReset
AccountContactRequestDisabled indicates that the account should be advertised on different public rendezvous points

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the new rendezvous point seed |

<a name="berty.protocol.v1.AccountContactRequestSent"></a>

### AccountContactRequestSent
AccountContactRequestSent indicates that the account has sent a contact request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the account event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contacted account |

<a name="berty.protocol.v1.AccountContactUnblocked"></a>

### AccountContactUnblocked
AccountContactUnblocked indicates that a contact is unblocked

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact unblocked |

<a name="berty.protocol.v1.AccountGroupJoined"></a>

### AccountGroupJoined
AccountGroupJoined indicates that the account is now part of a new group

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| group | [Group](#berty.protocol.v1.Group) |  | group describe the joined group |

<a name="berty.protocol.v1.AccountGroupLeft"></a>

### AccountGroupLeft
AccountGroupJoined indicates that the account has left a group

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| group_pk | [bytes](#bytes) |  | group_pk references the group left |

<a name="berty.protocol.v1.AccountServiceTokenAdded"></a>

### AccountServiceTokenAdded
AccountServiceTokenAdded indicates a token has been added to the account

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| service_token | [ServiceToken](#berty.protocol.v1.ServiceToken) |  |  |

<a name="berty.protocol.v1.AccountServiceTokenRemoved"></a>

### AccountServiceTokenRemoved
AccountServiceTokenRemoved indicates a token has removed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| token_id | [string](#string) |  |  |

<a name="berty.protocol.v1.ActivateGroup"></a>

### ActivateGroup

<a name="berty.protocol.v1.ActivateGroup.Reply"></a>

### ActivateGroup.Reply

<a name="berty.protocol.v1.ActivateGroup.Request"></a>

### ActivateGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| local_only | [bool](#bool) |  | local_only will open the group without enabling network interactions with other members |

<a name="berty.protocol.v1.AppMessageSend"></a>

### AppMessageSend

<a name="berty.protocol.v1.AppMessageSend.Reply"></a>

### AppMessageSend.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| cid | [bytes](#bytes) |  |  |

<a name="berty.protocol.v1.AppMessageSend.Request"></a>

### AppMessageSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| payload | [bytes](#bytes) |  | payload is the payload to send |
| attachment_cids | [bytes](#bytes) | repeated | attachment_cids is a list of attachment cids |

<a name="berty.protocol.v1.AppMetadata"></a>

### AppMetadata
AppMetadata is an app defined message, accessible to future group members

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| message | [bytes](#bytes) |  | message is the payload |

<a name="berty.protocol.v1.AppMetadataSend"></a>

### AppMetadataSend

<a name="berty.protocol.v1.AppMetadataSend.Reply"></a>

### AppMetadataSend.Reply

<a name="berty.protocol.v1.AppMetadataSend.Request"></a>

### AppMetadataSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| payload | [bytes](#bytes) |  | payload is the payload to send |
| attachment_cids | [bytes](#bytes) | repeated | attachment_cids is a list of attachment cids |

<a name="berty.protocol.v1.AttachmentPrepare"></a>

### AttachmentPrepare

<a name="berty.protocol.v1.AttachmentPrepare.Reply"></a>

### AttachmentPrepare.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| attachment_cid | [bytes](#bytes) |  | attachment_cid is the cid of the (encrypted) file |

<a name="berty.protocol.v1.AttachmentPrepare.Request"></a>

### AttachmentPrepare.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| block | [bytes](#bytes) |  | block is a plaintext block to append |
| disable_encryption | [bool](#bool) |  | disable_encryption tells the protocol to store the file as plain text |

<a name="berty.protocol.v1.AttachmentRetrieve"></a>

### AttachmentRetrieve

<a name="berty.protocol.v1.AttachmentRetrieve.Reply"></a>

### AttachmentRetrieve.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| block | [bytes](#bytes) |  | block is a plaintext block to append |

<a name="berty.protocol.v1.AttachmentRetrieve.Request"></a>

### AttachmentRetrieve.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| attachment_cid | [bytes](#bytes) |  | attachment_cid is the cid of the (encrypted) file |

<a name="berty.protocol.v1.AuthServiceCompleteFlow"></a>

### AuthServiceCompleteFlow

<a name="berty.protocol.v1.AuthServiceCompleteFlow.Reply"></a>

### AuthServiceCompleteFlow.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| token_id | [string](#string) |  |  |

<a name="berty.protocol.v1.AuthServiceCompleteFlow.Request"></a>

### AuthServiceCompleteFlow.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| callback_url | [string](#string) |  |  |

<a name="berty.protocol.v1.AuthServiceInitFlow"></a>

### AuthServiceInitFlow

<a name="berty.protocol.v1.AuthServiceInitFlow.Reply"></a>

### AuthServiceInitFlow.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| url | [string](#string) |  |  |
| secure_url | [bool](#bool) |  |  |

<a name="berty.protocol.v1.AuthServiceInitFlow.Request"></a>

### AuthServiceInitFlow.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| auth_url | [string](#string) |  |  |

<a name="berty.protocol.v1.ContactAddAliasKey"></a>

### ContactAddAliasKey
ContactAddAliasKey is an event type where ones shares their alias public key

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| alias_pk | [bytes](#bytes) |  | alias_pk is the alias key which will be used to verify a contact identity |

<a name="berty.protocol.v1.ContactAliasKeySend"></a>

### ContactAliasKeySend

<a name="berty.protocol.v1.ContactAliasKeySend.Reply"></a>

### ContactAliasKeySend.Reply

<a name="berty.protocol.v1.ContactAliasKeySend.Request"></a>

### ContactAliasKeySend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to send the alias public key to |

<a name="berty.protocol.v1.ContactBlock"></a>

### ContactBlock

<a name="berty.protocol.v1.ContactBlock.Reply"></a>

### ContactBlock.Reply

<a name="berty.protocol.v1.ContactBlock.Request"></a>

### ContactBlock.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to block |

<a name="berty.protocol.v1.ContactRequestAccept"></a>

### ContactRequestAccept

<a name="berty.protocol.v1.ContactRequestAccept.Reply"></a>

### ContactRequestAccept.Reply

<a name="berty.protocol.v1.ContactRequestAccept.Request"></a>

### ContactRequestAccept.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to accept the request from |

<a name="berty.protocol.v1.ContactRequestDisable"></a>

### ContactRequestDisable

<a name="berty.protocol.v1.ContactRequestDisable.Reply"></a>

### ContactRequestDisable.Reply

<a name="berty.protocol.v1.ContactRequestDisable.Request"></a>

### ContactRequestDisable.Request

<a name="berty.protocol.v1.ContactRequestDiscard"></a>

### ContactRequestDiscard

<a name="berty.protocol.v1.ContactRequestDiscard.Reply"></a>

### ContactRequestDiscard.Reply

<a name="berty.protocol.v1.ContactRequestDiscard.Request"></a>

### ContactRequestDiscard.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to ignore the request from |

<a name="berty.protocol.v1.ContactRequestEnable"></a>

### ContactRequestEnable

<a name="berty.protocol.v1.ContactRequestEnable.Reply"></a>

### ContactRequestEnable.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the rendezvous seed used by the current account |

<a name="berty.protocol.v1.ContactRequestEnable.Request"></a>

### ContactRequestEnable.Request

<a name="berty.protocol.v1.ContactRequestReference"></a>

### ContactRequestReference

<a name="berty.protocol.v1.ContactRequestReference.Reply"></a>

### ContactRequestReference.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the rendezvous seed used by the current account |
| enabled | [bool](#bool) |  | enabled indicates if incoming contact requests are enabled |

<a name="berty.protocol.v1.ContactRequestReference.Request"></a>

### ContactRequestReference.Request

<a name="berty.protocol.v1.ContactRequestResetReference"></a>

### ContactRequestResetReference

<a name="berty.protocol.v1.ContactRequestResetReference.Reply"></a>

### ContactRequestResetReference.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the rendezvous seed used by the current account |

<a name="berty.protocol.v1.ContactRequestResetReference.Request"></a>

### ContactRequestResetReference.Request

<a name="berty.protocol.v1.ContactRequestSend"></a>

### ContactRequestSend

<a name="berty.protocol.v1.ContactRequestSend.Reply"></a>

### ContactRequestSend.Reply

<a name="berty.protocol.v1.ContactRequestSend.Request"></a>

### ContactRequestSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact | [ShareableContact](#berty.protocol.v1.ShareableContact) |  | contact is a message describing how to connect to the other account |
| own_metadata | [bytes](#bytes) |  | own_metadata is the identifying metadata that will be shared to the other account |

<a name="berty.protocol.v1.ContactUnblock"></a>

### ContactUnblock

<a name="berty.protocol.v1.ContactUnblock.Reply"></a>

### ContactUnblock.Reply

<a name="berty.protocol.v1.ContactUnblock.Request"></a>

### ContactUnblock.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact to unblock |

<a name="berty.protocol.v1.DeactivateGroup"></a>

### DeactivateGroup

<a name="berty.protocol.v1.DeactivateGroup.Reply"></a>

### DeactivateGroup.Reply

<a name="berty.protocol.v1.DeactivateGroup.Request"></a>

### DeactivateGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.protocol.v1.DebugGroup"></a>

### DebugGroup

<a name="berty.protocol.v1.DebugGroup.Reply"></a>

### DebugGroup.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| peer_ids | [string](#string) | repeated | peer_ids is the list of peer ids connected to the same group |

<a name="berty.protocol.v1.DebugGroup.Request"></a>

### DebugGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.protocol.v1.DebugInspectGroupStore"></a>

### DebugInspectGroupStore

<a name="berty.protocol.v1.DebugInspectGroupStore.Reply"></a>

### DebugInspectGroupStore.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| cid | [bytes](#bytes) |  | cid is the CID of the IPFS log entry |
| parent_cids | [bytes](#bytes) | repeated | parent_cids is the list of the parent entries |
| metadata_event_type | [EventType](#berty.protocol.v1.EventType) |  | event_type metadata event type if subscribed to metadata events |
| device_pk | [bytes](#bytes) |  | device_pk is the public key of the device signing the entry |
| payload | [bytes](#bytes) |  | payload is the un encrypted entry payload if available |

<a name="berty.protocol.v1.DebugInspectGroupStore.Request"></a>

### DebugInspectGroupStore.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| log_type | [DebugInspectGroupLogType](#berty.protocol.v1.DebugInspectGroupLogType) |  | log_type is the log to inspect |

<a name="berty.protocol.v1.DebugListGroups"></a>

### DebugListGroups

<a name="berty.protocol.v1.DebugListGroups.Reply"></a>

### DebugListGroups.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the public key of the group |
| group_type | [GroupType](#berty.protocol.v1.GroupType) |  | group_type is the type of the group |
| contact_pk | [bytes](#bytes) |  | contact_pk is the contact public key if appropriate |

<a name="berty.protocol.v1.DebugListGroups.Request"></a>

### DebugListGroups.Request

<a name="berty.protocol.v1.DeviceSecret"></a>

### DeviceSecret
DeviceSecret is encrypted for a specific member of the group

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| chain_key | [bytes](#bytes) |  | chain_key is the current value of the chain key of the group device |
| counter | [uint64](#uint64) |  | counter is the current value of the counter of the group device |

<a name="berty.protocol.v1.EncryptedMessage"></a>

### EncryptedMessage
EncryptedMessage is used in MessageEnvelope and only readable by groups members that joined before the message was sent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| plaintext | [bytes](#bytes) |  | plaintext is the app layer data |
| protocol_metadata | [ProtocolMetadata](#berty.protocol.v1.ProtocolMetadata) |  | protocol_metadata is protocol layer data |

<a name="berty.protocol.v1.EventContext"></a>

### EventContext
EventContext adds context (its id, its parents and its attachments) to an event

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [bytes](#bytes) |  | id is the CID of the underlying OrbitDB event |
| parent_ids | [bytes](#bytes) | repeated | id are the the CIDs of the underlying parents of the OrbitDB event |
| group_pk | [bytes](#bytes) |  | group_pk receiving the event |
| attachment_cids | [bytes](#bytes) | repeated | attachment_cids is a list of attachment that can be retrieved |

<a name="berty.protocol.v1.Group"></a>

### Group
Group define a group and is enough to invite someone to it

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [bytes](#bytes) |  | public_key is the identifier of the group, it signs the group secret and the initial member of a multi-member group |
| secret | [bytes](#bytes) |  | secret is the symmetric secret of the group, which is used to encrypt the metadata |
| secret_sig | [bytes](#bytes) |  | secret_sig is the signature of the secret used to ensure the validity of the group |
| group_type | [GroupType](#berty.protocol.v1.GroupType) |  | group_type specifies the type of the group, used to determine how device secrets are generated |
| sign_pub | [bytes](#bytes) |  | sign_pub is the signature public key used to verify entries, not required when secret and secret_sig are provided |
| updates_key | [bytes](#bytes) |  | updates_key is the secret key used to exchange group updates |

<a name="berty.protocol.v1.GroupAddAdditionalRendezvousSeed"></a>

### GroupAddAdditionalRendezvousSeed
GroupAddAdditionalRendezvousSeed indicates that an additional rendezvous point should be used for data synchronization

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message, must be the device of an admin of the group |
| seed | [bytes](#bytes) |  | seed is the additional rendezvous point seed which should be used |

<a name="berty.protocol.v1.GroupAddDeviceSecret"></a>

### GroupAddDeviceSecret
GroupAddDeviceSecret is an event which indicates to a group member a device secret

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| dest_member_pk | [bytes](#bytes) |  | dest_member_pk is the member who should receive the secret |
| payload | [bytes](#bytes) |  | payload is the serialization of Payload encrypted for the specified member |

<a name="berty.protocol.v1.GroupAddMemberDevice"></a>

### GroupAddMemberDevice
GroupAddMemberDevice is an event which indicates to a group a new device (and eventually a new member) is joining it
When added on AccountGroup, this event should be followed by appropriate GroupAddMemberDevice and GroupAddDeviceSecret events

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| member_pk | [bytes](#bytes) |  | member_pk is the member sending the event |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| member_sig | [bytes](#bytes) |  | member_sig is used to prove the ownership of the member pk

TODO: signature of what ??? ensure it can&#39;t be replayed |

<a name="berty.protocol.v1.GroupEnvelope"></a>

### GroupEnvelope
GroupEnvelope is a publicly exposed structure containing a group metadata event

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| nonce | [bytes](#bytes) |  | nonce is used to encrypt the message |
| event | [bytes](#bytes) |  | event is encrypted using a symmetric key shared among group members |
| encrypted_attachment_cids | [bytes](#bytes) | repeated | encrypted_attachment_cids is a list of attachment CIDs encrypted specifically for replication services |

<a name="berty.protocol.v1.GroupHeadsExport"></a>

### GroupHeadsExport

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [bytes](#bytes) |  | public_key is the identifier of the group, it signs the group secret and the initial member of a multi-member group |
| sign_pub | [bytes](#bytes) |  | sign_pub is the signature public key used to verify entries |
| metadata_heads_cids | [bytes](#bytes) | repeated | metadata_heads_cids are the heads of the metadata store that should be restored from an export |
| messages_heads_cids | [bytes](#bytes) | repeated | messages_heads_cids are the heads of the metadata store that should be restored from an export |
| updates_key | [bytes](#bytes) |  | updates_key |

<a name="berty.protocol.v1.GroupInfo"></a>

### GroupInfo

<a name="berty.protocol.v1.GroupInfo.Reply"></a>

### GroupInfo.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.protocol.v1.Group) |  | group is the group invitation, containing the group pk and its type |
| member_pk | [bytes](#bytes) |  | member_pk is the identifier of the current member in the group |
| device_pk | [bytes](#bytes) |  | device_pk is the identifier of the current device in the group |

<a name="berty.protocol.v1.GroupInfo.Request"></a>

### GroupInfo.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| contact_pk | [bytes](#bytes) |  | contact_pk is the identifier of the contact |

<a name="berty.protocol.v1.GroupMessageEvent"></a>

### GroupMessageEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event_context | [EventContext](#berty.protocol.v1.EventContext) |  | event_context contains context information about the event |
| headers | [MessageHeaders](#berty.protocol.v1.MessageHeaders) |  | headers contains headers of the secure message |
| message | [bytes](#bytes) |  | message contains the secure message payload |

<a name="berty.protocol.v1.GroupMessageList"></a>

### GroupMessageList

<a name="berty.protocol.v1.GroupMessageList.Request"></a>

### GroupMessageList.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| since_id | [bytes](#bytes) |  | since is the lower ID bound used to filter events if not set, will return events since the beginning |
| since_now | [bool](#bool) |  | since_now will list only new event to come since_id must not be set |
| until_id | [bytes](#bytes) |  | until is the upper ID bound used to filter events if not set, will subscribe to new events to come |
| until_now | [bool](#bool) |  | until_now will not list new event to come until_id must not be set |
| reverse_order | [bool](#bool) |  | reverse_order indicates whether the previous events should be returned in reverse chronological order |

<a name="berty.protocol.v1.GroupMetadata"></a>

### GroupMetadata
GroupMetadata is used in GroupEnvelope and only readable by invited group members

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event_type | [EventType](#berty.protocol.v1.EventType) |  | event_type defines which event type is used |
| payload | [bytes](#bytes) |  | the serialization depends on event_type, event is symmetrically encrypted |
| sig | [bytes](#bytes) |  | sig is the signature of the payload, it depends on the event_type for the used key |
| protocol_metadata | [ProtocolMetadata](#berty.protocol.v1.ProtocolMetadata) |  | protocol_metadata is protocol layer data |

<a name="berty.protocol.v1.GroupMetadataEvent"></a>

### GroupMetadataEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event_context | [EventContext](#berty.protocol.v1.EventContext) |  | event_context contains context information about the event |
| metadata | [GroupMetadata](#berty.protocol.v1.GroupMetadata) |  | metadata contains the newly available metadata |
| event | [bytes](#bytes) |  | event_clear clear bytes for the event |

<a name="berty.protocol.v1.GroupMetadataList"></a>

### GroupMetadataList

<a name="berty.protocol.v1.GroupMetadataList.Request"></a>

### GroupMetadataList.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| since_id | [bytes](#bytes) |  | since is the lower ID bound used to filter events if not set, will return events since the beginning |
| since_now | [bool](#bool) |  | since_now will list only new event to come since_id must not be set |
| until_id | [bytes](#bytes) |  | until is the upper ID bound used to filter events if not set, will subscribe to new events to come |
| until_now | [bool](#bool) |  | until_now will not list new event to come until_id must not be set |
| reverse_order | [bool](#bool) |  | reverse_order indicates whether the previous events should be returned in reverse chronological order |

<a name="berty.protocol.v1.GroupRemoveAdditionalRendezvousSeed"></a>

### GroupRemoveAdditionalRendezvousSeed
GroupRemoveAdditionalRendezvousSeed indicates that a previously added rendezvous point should be removed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message, must be the device of an admin of the group |
| seed | [bytes](#bytes) |  | seed is the additional rendezvous point seed which should be removed |

<a name="berty.protocol.v1.GroupReplicating"></a>

### GroupReplicating

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| authentication_url | [string](#string) |  | authentication_url indicates which server has been used for authentication |
| replication_server | [string](#string) |  | replication_server indicates which server will be used for replication |

<a name="berty.protocol.v1.InstanceExportData"></a>

### InstanceExportData

<a name="berty.protocol.v1.InstanceExportData.Reply"></a>

### InstanceExportData.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| exported_data | [bytes](#bytes) |  |  |

<a name="berty.protocol.v1.InstanceExportData.Request"></a>

### InstanceExportData.Request

<a name="berty.protocol.v1.InstanceGetConfiguration"></a>

### InstanceGetConfiguration

<a name="berty.protocol.v1.InstanceGetConfiguration.Reply"></a>

### InstanceGetConfiguration.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| account_pk | [bytes](#bytes) |  | account_pk is the public key of the current account |
| device_pk | [bytes](#bytes) |  | device_pk is the public key of the current device |
| account_group_pk | [bytes](#bytes) |  | account_group_pk is the public key of the account group |
| peer_id | [string](#string) |  |  |
| listeners | [string](#string) | repeated |  |
| ble_enabled | [InstanceGetConfiguration.SettingState](#berty.protocol.v1.InstanceGetConfiguration.SettingState) |  |  |
| wifi_p2p_enabled | [InstanceGetConfiguration.SettingState](#berty.protocol.v1.InstanceGetConfiguration.SettingState) |  | MultiPeerConnectivity for Darwin and Nearby for Android |
| mdns_enabled | [InstanceGetConfiguration.SettingState](#berty.protocol.v1.InstanceGetConfiguration.SettingState) |  |  |
| relay_enabled | [InstanceGetConfiguration.SettingState](#berty.protocol.v1.InstanceGetConfiguration.SettingState) |  |  |

<a name="berty.protocol.v1.InstanceGetConfiguration.Request"></a>

### InstanceGetConfiguration.Request

<a name="berty.protocol.v1.MessageEnvelope"></a>

### MessageEnvelope
MessageEnvelope is a publicly exposed structure containing a group secure message

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| message_headers | [bytes](#bytes) |  | message_headers is an encrypted serialization using a symmetric key of a MessageHeaders message |
| message | [bytes](#bytes) |  | message is an encrypted message, only readable by group members who previously received the appropriate chain key |
| nonce | [bytes](#bytes) |  | nonce is a nonce for message headers |
| encrypted_attachment_cids | [bytes](#bytes) | repeated | encrypted_attachment_cids is a list of attachment CIDs encrypted specifically for replication services |

<a name="berty.protocol.v1.MessageHeaders"></a>

### MessageHeaders
MessageHeaders is used in MessageEnvelope and only readable by invited group members

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| counter | [uint64](#uint64) |  | counter is the current counter value for the specified device |
| device_pk | [bytes](#bytes) |  | device_pk is the public key of the device sending the message |
| sig | [bytes](#bytes) |  | sig is the signature of the encrypted message using the device&#39;s private key |
| metadata | [MessageHeaders.MetadataEntry](#berty.protocol.v1.MessageHeaders.MetadataEntry) | repeated | metadata allow to pass custom informations |

<a name="berty.protocol.v1.MessageHeaders.MetadataEntry"></a>

### MessageHeaders.MetadataEntry

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| key | [string](#string) |  |  |
| value | [string](#string) |  |  |

<a name="berty.protocol.v1.MonitorGroup"></a>

### MonitorGroup

<a name="berty.protocol.v1.MonitorGroup.EventMonitor"></a>

### MonitorGroup.EventMonitor

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| type | [MonitorGroup.TypeEventMonitor](#berty.protocol.v1.MonitorGroup.TypeEventMonitor) |  |  |
| advertise_group | [MonitorGroup.EventMonitorAdvertiseGroup](#berty.protocol.v1.MonitorGroup.EventMonitorAdvertiseGroup) |  |  |
| peer_found | [MonitorGroup.EventMonitorPeerFound](#berty.protocol.v1.MonitorGroup.EventMonitorPeerFound) |  |  |
| peer_join | [MonitorGroup.EventMonitorPeerJoin](#berty.protocol.v1.MonitorGroup.EventMonitorPeerJoin) |  |  |
| peer_leave | [MonitorGroup.EventMonitorPeerLeave](#berty.protocol.v1.MonitorGroup.EventMonitorPeerLeave) |  |  |

<a name="berty.protocol.v1.MonitorGroup.EventMonitorAdvertiseGroup"></a>

### MonitorGroup.EventMonitorAdvertiseGroup

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| peer_id | [string](#string) |  | local peer id advertised |
| maddrs | [string](#string) | repeated | maddrs should describe peer maddrs |
| driver_name | [string](#string) |  | driver_name used to advertise the peer |
| topic | [string](#string) |  | event topic |

<a name="berty.protocol.v1.MonitorGroup.EventMonitorPeerFound"></a>

### MonitorGroup.EventMonitorPeerFound

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| peer_id | [string](#string) |  | peer_id of the peer in this context |
| maddrs | [string](#string) | repeated | maddrs of the peer in this context |
| driver_name | [string](#string) |  | driver_name used to found the peer |
| topic | [string](#string) |  | event topic |

<a name="berty.protocol.v1.MonitorGroup.EventMonitorPeerJoin"></a>

### MonitorGroup.EventMonitorPeerJoin

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| peer_id | [string](#string) |  | peer_id of the peer in this context |
| maddrs | [string](#string) | repeated | maddrs of the peer in this context |
| topic | [string](#string) |  | event topic |
| is_self | [bool](#bool) |  | is_self indecitate if the given peer is you |

<a name="berty.protocol.v1.MonitorGroup.EventMonitorPeerLeave"></a>

### MonitorGroup.EventMonitorPeerLeave

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| peer_id | [string](#string) |  | peer_id of the peer in this context |
| topic | [string](#string) |  | event topic |
| is_self | [bool](#bool) |  | is_self indecitate if the given peer is you |

<a name="berty.protocol.v1.MonitorGroup.Reply"></a>

### MonitorGroup.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event | [MonitorGroup.EventMonitor](#berty.protocol.v1.MonitorGroup.EventMonitor) |  | monitor event |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.protocol.v1.MonitorGroup.Request"></a>

### MonitorGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | filter_group_pk, if set, will filter event by group PK |

<a name="berty.protocol.v1.MultiMemberGrantAdminRole"></a>

### MultiMemberGrantAdminRole
MultiMemberGrantAdminRole indicates that a group admin allows another group member to act as an admin

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message, must be the device of an admin of the group |
| grantee_member_pk | [bytes](#bytes) |  | grantee_member_pk is the member public key of the member granted of the admin role |

<a name="berty.protocol.v1.MultiMemberGroupAddAliasResolver"></a>

### MultiMemberGroupAddAliasResolver
MultiMemberGroupAddAliasResolver indicates that a group member want to disclose their presence in the group to their contacts

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pk | [bytes](#bytes) |  | device_pk is the device sending the event, signs the message |
| alias_resolver | [bytes](#bytes) |  | alias_resolver allows contact of an account to resolve the real identity behind an alias (Multi-Member Group Member) Generated by both contacts and account independently using: hmac(aliasPK, GroupID) |
| alias_proof | [bytes](#bytes) |  | alias_proof ensures that the associated alias_resolver has been issued by the right account Generated using aliasSKSig(GroupID) |

<a name="berty.protocol.v1.MultiMemberGroupAdminRoleGrant"></a>

### MultiMemberGroupAdminRoleGrant

<a name="berty.protocol.v1.MultiMemberGroupAdminRoleGrant.Reply"></a>

### MultiMemberGroupAdminRoleGrant.Reply

<a name="berty.protocol.v1.MultiMemberGroupAdminRoleGrant.Request"></a>

### MultiMemberGroupAdminRoleGrant.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |
| member_pk | [bytes](#bytes) |  | member_pk is the identifier of the member which will be granted the admin role |

<a name="berty.protocol.v1.MultiMemberGroupAliasResolverDisclose"></a>

### MultiMemberGroupAliasResolverDisclose

<a name="berty.protocol.v1.MultiMemberGroupAliasResolverDisclose.Reply"></a>

### MultiMemberGroupAliasResolverDisclose.Reply

<a name="berty.protocol.v1.MultiMemberGroupAliasResolverDisclose.Request"></a>

### MultiMemberGroupAliasResolverDisclose.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.protocol.v1.MultiMemberGroupCreate"></a>

### MultiMemberGroupCreate

<a name="berty.protocol.v1.MultiMemberGroupCreate.Reply"></a>

### MultiMemberGroupCreate.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the newly created group |

<a name="berty.protocol.v1.MultiMemberGroupCreate.Request"></a>

### MultiMemberGroupCreate.Request

<a name="berty.protocol.v1.MultiMemberGroupInvitationCreate"></a>

### MultiMemberGroupInvitationCreate

<a name="berty.protocol.v1.MultiMemberGroupInvitationCreate.Reply"></a>

### MultiMemberGroupInvitationCreate.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.protocol.v1.Group) |  | group is the invitation to the group |

<a name="berty.protocol.v1.MultiMemberGroupInvitationCreate.Request"></a>

### MultiMemberGroupInvitationCreate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  | group_pk is the identifier of the group |

<a name="berty.protocol.v1.MultiMemberGroupJoin"></a>

### MultiMemberGroupJoin

<a name="berty.protocol.v1.MultiMemberGroupJoin.Reply"></a>

### MultiMemberGroupJoin.Reply

<a name="berty.protocol.v1.MultiMemberGroupJoin.Request"></a>

### MultiMemberGroupJoin.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.protocol.v1.Group) |  | group is the information of the group to join |

<a name="berty.protocol.v1.MultiMemberGroupLeave"></a>

### MultiMemberGroupLeave

<a name="berty.protocol.v1.MultiMemberGroupLeave.Reply"></a>

### MultiMemberGroupLeave.Reply

<a name="berty.protocol.v1.MultiMemberGroupLeave.Request"></a>

### MultiMemberGroupLeave.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  |  |

<a name="berty.protocol.v1.MultiMemberInitialMember"></a>

### MultiMemberInitialMember
MultiMemberInitialMember indicates that a member is the group creator, this event is signed using the group ID private key

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| member_pk | [bytes](#bytes) |  | member_pk is the public key of the member who is the group creator |

<a name="berty.protocol.v1.PeerList"></a>

### PeerList

<a name="berty.protocol.v1.PeerList.Peer"></a>

### PeerList.Peer

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  | id is the libp2p.PeerID. |
| routes | [PeerList.Route](#berty.protocol.v1.PeerList.Route) | repeated | routes are the list of active and known maddr. |
| errors | [string](#string) | repeated | errors is a list of errors related to the peer. |
| features | [PeerList.Feature](#berty.protocol.v1.PeerList.Feature) | repeated | Features is a list of available features. |
| min_latency | [int64](#int64) |  | MinLatency is the minimum latency across all the peer routes. |
| is_active | [bool](#bool) |  | IsActive is true if at least one of the route is active. |
| direction | [Direction](#berty.protocol.v1.Direction) |  | Direction is the aggregate of all the routes&#39;s direction. |

<a name="berty.protocol.v1.PeerList.Reply"></a>

### PeerList.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| peers | [PeerList.Peer](#berty.protocol.v1.PeerList.Peer) | repeated |  |

<a name="berty.protocol.v1.PeerList.Request"></a>

### PeerList.Request

<a name="berty.protocol.v1.PeerList.Route"></a>

### PeerList.Route

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| is_active | [bool](#bool) |  | IsActive indicates whether the address is currently used or just known. |
| address | [string](#string) |  | Address is the multiaddress via which we are connected with the peer. |
| direction | [Direction](#berty.protocol.v1.Direction) |  | Direction is which way the connection was established. |
| latency | [int64](#int64) |  | Latency is the last known round trip time to the peer in ms. |
| streams | [PeerList.Stream](#berty.protocol.v1.PeerList.Stream) | repeated | Streams returns list of streams established with the peer. |

<a name="berty.protocol.v1.PeerList.Stream"></a>

### PeerList.Stream

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [string](#string) |  | id is an identifier used to write protocol headers in streams. |

<a name="berty.protocol.v1.Progress"></a>

### Progress
Progress define a generic object that can be used to display a progress bar for long-running actions.

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| state | [string](#string) |  |  |
| doing | [string](#string) |  |  |
| progress | [float](#float) |  |  |
| completed | [uint64](#uint64) |  |  |
| total | [uint64](#uint64) |  |  |
| delay | [uint64](#uint64) |  |  |

<a name="berty.protocol.v1.ProtocolMetadata"></a>

### ProtocolMetadata

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| attachments_secrets | [bytes](#bytes) | repeated | attachments_secrets is a list of secret keys used retrieve attachments |

<a name="berty.protocol.v1.ReplicationServiceRegisterGroup"></a>

### ReplicationServiceRegisterGroup

<a name="berty.protocol.v1.ReplicationServiceRegisterGroup.Reply"></a>

### ReplicationServiceRegisterGroup.Reply

<a name="berty.protocol.v1.ReplicationServiceRegisterGroup.Request"></a>

### ReplicationServiceRegisterGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| token_id | [string](#string) |  |  |
| group_pk | [bytes](#bytes) |  |  |

<a name="berty.protocol.v1.ReplicationServiceReplicateGroup"></a>

### ReplicationServiceReplicateGroup

<a name="berty.protocol.v1.ReplicationServiceReplicateGroup.Reply"></a>

### ReplicationServiceReplicateGroup.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| ok | [bool](#bool) |  |  |

<a name="berty.protocol.v1.ReplicationServiceReplicateGroup.Request"></a>

### ReplicationServiceReplicateGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [Group](#berty.protocol.v1.Group) |  |  |

<a name="berty.protocol.v1.ServiceToken"></a>

### ServiceToken

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| token | [string](#string) |  |  |
| authentication_url | [string](#string) |  |  |
| supported_services | [ServiceTokenSupportedService](#berty.protocol.v1.ServiceTokenSupportedService) | repeated |  |
| expiration | [int64](#int64) |  |  |

<a name="berty.protocol.v1.ServiceTokenSupportedService"></a>

### ServiceTokenSupportedService

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| service_type | [string](#string) |  |  |
| service_endpoint | [string](#string) |  |  |

<a name="berty.protocol.v1.ServicesTokenCode"></a>

### ServicesTokenCode

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| services | [string](#string) | repeated |  |
| code_challenge | [string](#string) |  |  |
| token_id | [string](#string) |  |  |

<a name="berty.protocol.v1.ServicesTokenList"></a>

### ServicesTokenList

<a name="berty.protocol.v1.ServicesTokenList.Reply"></a>

### ServicesTokenList.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| token_id | [string](#string) |  |  |
| service | [ServiceToken](#berty.protocol.v1.ServiceToken) |  |  |

<a name="berty.protocol.v1.ServicesTokenList.Request"></a>

### ServicesTokenList.Request

<a name="berty.protocol.v1.ShareableContact"></a>

### ShareableContact

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| pk | [bytes](#bytes) |  | pk is the account to send a contact request to |
| public_rendezvous_seed | [bytes](#bytes) |  | public_rendezvous_seed is the rendezvous seed used by the account to send a contact request to |
| metadata | [bytes](#bytes) |  | metadata is the metadata specific to the app to identify the contact for the request |

<a name="berty.protocol.v1.SystemInfo"></a>

### SystemInfo

<a name="berty.protocol.v1.SystemInfo.OrbitDB"></a>

### SystemInfo.OrbitDB

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| account_metadata | [SystemInfo.OrbitDB.ReplicationStatus](#berty.protocol.v1.SystemInfo.OrbitDB.ReplicationStatus) |  |  |

<a name="berty.protocol.v1.SystemInfo.OrbitDB.ReplicationStatus"></a>

### SystemInfo.OrbitDB.ReplicationStatus

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| progress | [int64](#int64) |  |  |
| maximum | [int64](#int64) |  |  |
| buffered | [int64](#int64) |  |  |
| queued | [int64](#int64) |  |  |

<a name="berty.protocol.v1.SystemInfo.P2P"></a>

### SystemInfo.P2P

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| connected_peers | [int64](#int64) |  |  |

<a name="berty.protocol.v1.SystemInfo.Process"></a>

### SystemInfo.Process

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| version | [string](#string) |  |  |
| vcs_ref | [string](#string) |  |  |
| uptime_ms | [int64](#int64) |  |  |
| user_cpu_time_ms | [int64](#int64) |  |  |
| system_cpu_time_ms | [int64](#int64) |  |  |
| started_at | [int64](#int64) |  |  |
| rlimit_cur | [uint64](#uint64) |  |  |
| num_goroutine | [int64](#int64) |  |  |
| nofile | [int64](#int64) |  |  |
| too_many_open_files | [bool](#bool) |  |  |
| num_cpu | [int64](#int64) |  |  |
| go_version | [string](#string) |  |  |
| operating_system | [string](#string) |  |  |
| host_name | [string](#string) |  |  |
| arch | [string](#string) |  |  |
| rlimit_max | [uint64](#uint64) |  |  |
| pid | [int64](#int64) |  |  |
| ppid | [int64](#int64) |  |  |
| priority | [int64](#int64) |  |  |
| uid | [int64](#int64) |  |  |
| working_dir | [string](#string) |  |  |
| system_username | [string](#string) |  |  |

<a name="berty.protocol.v1.SystemInfo.Reply"></a>

### SystemInfo.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| process | [SystemInfo.Process](#berty.protocol.v1.SystemInfo.Process) |  |  |
| p2p | [SystemInfo.P2P](#berty.protocol.v1.SystemInfo.P2P) |  |  |
| orbitdb | [SystemInfo.OrbitDB](#berty.protocol.v1.SystemInfo.OrbitDB) |  |  |
| warns | [string](#string) | repeated |  |

<a name="berty.protocol.v1.SystemInfo.Request"></a>

### SystemInfo.Request

 

<a name="berty.protocol.v1.ContactState"></a>

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

<a name="berty.protocol.v1.DebugInspectGroupLogType"></a>

### DebugInspectGroupLogType

| Name | Number | Description |
| ---- | ------ | ----------- |
| DebugInspectGroupLogTypeUndefined | 0 |  |
| DebugInspectGroupLogTypeMessage | 1 |  |
| DebugInspectGroupLogTypeMetadata | 2 |  |

<a name="berty.protocol.v1.Direction"></a>

### Direction

| Name | Number | Description |
| ---- | ------ | ----------- |
| UnknownDir | 0 |  |
| InboundDir | 1 |  |
| OutboundDir | 2 |  |
| BiDir | 3 |  |

<a name="berty.protocol.v1.EventType"></a>

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
| EventTypeAccountServiceTokenAdded | 401 | EventTypeAccountServiceTokenAdded indicates that a new service provider has been registered for this account |
| EventTypeAccountServiceTokenRemoved | 402 | EventTypeAccountServiceTokenRemoved indicates that a service provider is not available anymore |
| EventTypeGroupReplicating | 403 | EventTypeGroupReplicating indicates that the group has been registered for replication on a server |
| EventTypeGroupMetadataPayloadSent | 1001 | EventTypeGroupMetadataPayloadSent indicates the payload includes an app specific event, unlike messages stored on the message store it is encrypted using a static key |

<a name="berty.protocol.v1.GroupType"></a>

### GroupType

| Name | Number | Description |
| ---- | ------ | ----------- |
| GroupTypeUndefined | 0 | GroupTypeUndefined indicates that the value has not been set. For example, happens if group is replicated. |
| GroupTypeAccount | 1 | GroupTypeAccount is the group managing an account, available to all its devices. |
| GroupTypeContact | 2 | GroupTypeContact is the group created between two accounts, available to all their devices. |
| GroupTypeMultiMember | 3 | GroupTypeMultiMember is a group containing an undefined number of members. |

<a name="berty.protocol.v1.InstanceGetConfiguration.SettingState"></a>

### InstanceGetConfiguration.SettingState

| Name | Number | Description |
| ---- | ------ | ----------- |
| Unknown | 0 |  |
| Enabled | 1 |  |
| Disabled | 2 |  |
| Unavailable | 3 |  |

<a name="berty.protocol.v1.MonitorGroup.TypeEventMonitor"></a>

### MonitorGroup.TypeEventMonitor

| Name | Number | Description |
| ---- | ------ | ----------- |
| TypeEventMonitorUndefined | 0 |  |
| TypeEventMonitorAdvertiseGroup | 1 |  |
| TypeEventMonitorPeerFound | 2 |  |
| TypeEventMonitorPeerJoin | 3 |  |
| TypeEventMonitorPeerLeave | 4 |  |

<a name="berty.protocol.v1.PeerList.Feature"></a>

### PeerList.Feature

| Name | Number | Description |
| ---- | ------ | ----------- |
| UnknownFeature | 0 |  |
| BertyFeature | 1 |  |
| BLEFeature | 2 |  |
| LocalFeature | 3 |  |
| TorFeature | 4 |  |
| QuicFeature | 5 |  |

 

 

<a name="berty.protocol.v1.ProtocolService"></a>

### ProtocolService
ProtocolService is the top-level API to manage an instance of the Berty Protocol.
Each Berty Protocol Instance is considered as a Berty device and is associated with a Berty user.

| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| InstanceExportData | [InstanceExportData.Request](#berty.protocol.v1.InstanceExportData.Request) | [InstanceExportData.Reply](#berty.protocol.v1.InstanceExportData.Reply) stream | InstanceExportData exports instance data |
| InstanceGetConfiguration | [InstanceGetConfiguration.Request](#berty.protocol.v1.InstanceGetConfiguration.Request) | [InstanceGetConfiguration.Reply](#berty.protocol.v1.InstanceGetConfiguration.Reply) | InstanceGetConfiguration gets current configuration of this protocol instance |
| ContactRequestReference | [ContactRequestReference.Request](#berty.protocol.v1.ContactRequestReference.Request) | [ContactRequestReference.Reply](#berty.protocol.v1.ContactRequestReference.Reply) | ContactRequestReference retrieves the information required to create a reference (ie. included in a shareable link) to the current account |
| ContactRequestDisable | [ContactRequestDisable.Request](#berty.protocol.v1.ContactRequestDisable.Request) | [ContactRequestDisable.Reply](#berty.protocol.v1.ContactRequestDisable.Reply) | ContactRequestDisable disables incoming contact requests |
| ContactRequestEnable | [ContactRequestEnable.Request](#berty.protocol.v1.ContactRequestEnable.Request) | [ContactRequestEnable.Reply](#berty.protocol.v1.ContactRequestEnable.Reply) | ContactRequestEnable enables incoming contact requests |
| ContactRequestResetReference | [ContactRequestResetReference.Request](#berty.protocol.v1.ContactRequestResetReference.Request) | [ContactRequestResetReference.Reply](#berty.protocol.v1.ContactRequestResetReference.Reply) | ContactRequestResetReference changes the contact request reference |
| ContactRequestSend | [ContactRequestSend.Request](#berty.protocol.v1.ContactRequestSend.Request) | [ContactRequestSend.Reply](#berty.protocol.v1.ContactRequestSend.Reply) | ContactRequestSend attempt to send a contact request |
| ContactRequestAccept | [ContactRequestAccept.Request](#berty.protocol.v1.ContactRequestAccept.Request) | [ContactRequestAccept.Reply](#berty.protocol.v1.ContactRequestAccept.Reply) | ContactRequestAccept accepts a contact request |
| ContactRequestDiscard | [ContactRequestDiscard.Request](#berty.protocol.v1.ContactRequestDiscard.Request) | [ContactRequestDiscard.Reply](#berty.protocol.v1.ContactRequestDiscard.Reply) | ContactRequestDiscard ignores a contact request, without informing the other user |
| ContactBlock | [ContactBlock.Request](#berty.protocol.v1.ContactBlock.Request) | [ContactBlock.Reply](#berty.protocol.v1.ContactBlock.Reply) | ContactBlock blocks a contact from sending requests |
| ContactUnblock | [ContactUnblock.Request](#berty.protocol.v1.ContactUnblock.Request) | [ContactUnblock.Reply](#berty.protocol.v1.ContactUnblock.Reply) | ContactUnblock unblocks a contact from sending requests |
| ContactAliasKeySend | [ContactAliasKeySend.Request](#berty.protocol.v1.ContactAliasKeySend.Request) | [ContactAliasKeySend.Reply](#berty.protocol.v1.ContactAliasKeySend.Reply) | ContactAliasKeySend send an alias key to a contact, the contact will be able to assert that your account is being present on a multi-member group |
| MultiMemberGroupCreate | [MultiMemberGroupCreate.Request](#berty.protocol.v1.MultiMemberGroupCreate.Request) | [MultiMemberGroupCreate.Reply](#berty.protocol.v1.MultiMemberGroupCreate.Reply) | MultiMemberGroupCreate creates a new multi-member group |
| MultiMemberGroupJoin | [MultiMemberGroupJoin.Request](#berty.protocol.v1.MultiMemberGroupJoin.Request) | [MultiMemberGroupJoin.Reply](#berty.protocol.v1.MultiMemberGroupJoin.Reply) | MultiMemberGroupJoin joins a multi-member group |
| MultiMemberGroupLeave | [MultiMemberGroupLeave.Request](#berty.protocol.v1.MultiMemberGroupLeave.Request) | [MultiMemberGroupLeave.Reply](#berty.protocol.v1.MultiMemberGroupLeave.Reply) | MultiMemberGroupLeave leaves a multi-member group |
| MultiMemberGroupAliasResolverDisclose | [MultiMemberGroupAliasResolverDisclose.Request](#berty.protocol.v1.MultiMemberGroupAliasResolverDisclose.Request) | [MultiMemberGroupAliasResolverDisclose.Reply](#berty.protocol.v1.MultiMemberGroupAliasResolverDisclose.Reply) | MultiMemberGroupAliasResolverDisclose discloses your alias resolver key |
| MultiMemberGroupAdminRoleGrant | [MultiMemberGroupAdminRoleGrant.Request](#berty.protocol.v1.MultiMemberGroupAdminRoleGrant.Request) | [MultiMemberGroupAdminRoleGrant.Reply](#berty.protocol.v1.MultiMemberGroupAdminRoleGrant.Reply) | MultiMemberGroupAdminRoleGrant grants an admin role to a group member |
| MultiMemberGroupInvitationCreate | [MultiMemberGroupInvitationCreate.Request](#berty.protocol.v1.MultiMemberGroupInvitationCreate.Request) | [MultiMemberGroupInvitationCreate.Reply](#berty.protocol.v1.MultiMemberGroupInvitationCreate.Reply) | MultiMemberGroupInvitationCreate creates an invitation to a multi-member group |
| AppMetadataSend | [AppMetadataSend.Request](#berty.protocol.v1.AppMetadataSend.Request) | [AppMetadataSend.Reply](#berty.protocol.v1.AppMetadataSend.Reply) | AppMetadataSend adds an app event to the metadata store, the message is encrypted using a symmetric key and readable by future group members |
| AppMessageSend | [AppMessageSend.Request](#berty.protocol.v1.AppMessageSend.Request) | [AppMessageSend.Reply](#berty.protocol.v1.AppMessageSend.Reply) | AppMessageSend adds an app event to the message store, the message is encrypted using a derived key and readable by current group members |
| GroupMetadataList | [GroupMetadataList.Request](#berty.protocol.v1.GroupMetadataList.Request) | [GroupMetadataEvent](#berty.protocol.v1.GroupMetadataEvent) stream | GroupMetadataList replays previous and subscribes to new metadata events from the group |
| GroupMessageList | [GroupMessageList.Request](#berty.protocol.v1.GroupMessageList.Request) | [GroupMessageEvent](#berty.protocol.v1.GroupMessageEvent) stream | GroupMessageList replays previous and subscribes to new message events from the group |
| GroupInfo | [GroupInfo.Request](#berty.protocol.v1.GroupInfo.Request) | [GroupInfo.Reply](#berty.protocol.v1.GroupInfo.Reply) | GroupInfo retrieves information about a group |
| ActivateGroup | [ActivateGroup.Request](#berty.protocol.v1.ActivateGroup.Request) | [ActivateGroup.Reply](#berty.protocol.v1.ActivateGroup.Reply) | ActivateGroup explicitly opens a group |
| DeactivateGroup | [DeactivateGroup.Request](#berty.protocol.v1.DeactivateGroup.Request) | [DeactivateGroup.Reply](#berty.protocol.v1.DeactivateGroup.Reply) | DeactivateGroup closes a group |
| MonitorGroup | [MonitorGroup.Request](#berty.protocol.v1.MonitorGroup.Request) | [MonitorGroup.Reply](#berty.protocol.v1.MonitorGroup.Reply) stream | Monitor Group events |
| DebugListGroups | [DebugListGroups.Request](#berty.protocol.v1.DebugListGroups.Request) | [DebugListGroups.Reply](#berty.protocol.v1.DebugListGroups.Reply) stream |  |
| DebugInspectGroupStore | [DebugInspectGroupStore.Request](#berty.protocol.v1.DebugInspectGroupStore.Request) | [DebugInspectGroupStore.Reply](#berty.protocol.v1.DebugInspectGroupStore.Reply) stream |  |
| DebugGroup | [DebugGroup.Request](#berty.protocol.v1.DebugGroup.Request) | [DebugGroup.Reply](#berty.protocol.v1.DebugGroup.Reply) |  |
| SystemInfo | [SystemInfo.Request](#berty.protocol.v1.SystemInfo.Request) | [SystemInfo.Reply](#berty.protocol.v1.SystemInfo.Reply) |  |
| AuthServiceInitFlow | [AuthServiceInitFlow.Request](#berty.protocol.v1.AuthServiceInitFlow.Request) | [AuthServiceInitFlow.Reply](#berty.protocol.v1.AuthServiceInitFlow.Reply) | AuthServiceInitFlow Initialize an authentication flow |
| AuthServiceCompleteFlow | [AuthServiceCompleteFlow.Request](#berty.protocol.v1.AuthServiceCompleteFlow.Request) | [AuthServiceCompleteFlow.Reply](#berty.protocol.v1.AuthServiceCompleteFlow.Reply) | AuthServiceCompleteFlow Completes an authentication flow |
| ServicesTokenList | [ServicesTokenList.Request](#berty.protocol.v1.ServicesTokenList.Request) | [ServicesTokenList.Reply](#berty.protocol.v1.ServicesTokenList.Reply) stream | ServicesTokenList Retrieves the list of services tokens |
| ReplicationServiceRegisterGroup | [ReplicationServiceRegisterGroup.Request](#berty.protocol.v1.ReplicationServiceRegisterGroup.Request) | [ReplicationServiceRegisterGroup.Reply](#berty.protocol.v1.ReplicationServiceRegisterGroup.Reply) | ReplicationServiceRegisterGroup Asks a replication service to distribute a group contents |
| PeerList | [PeerList.Request](#berty.protocol.v1.PeerList.Request) | [PeerList.Reply](#berty.protocol.v1.PeerList.Reply) | PeerList returns a list of P2P peers |
| AttachmentPrepare | [AttachmentPrepare.Request](#berty.protocol.v1.AttachmentPrepare.Request) stream | [AttachmentPrepare.Reply](#berty.protocol.v1.AttachmentPrepare.Reply) | AttachmentPrepare ... |
| AttachmentRetrieve | [AttachmentRetrieve.Request](#berty.protocol.v1.AttachmentRetrieve.Request) | [AttachmentRetrieve.Reply](#berty.protocol.v1.AttachmentRetrieve.Reply) stream | AttachmentRetrieve returns an attachment data |

 

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

