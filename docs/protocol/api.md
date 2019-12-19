# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [bertyprotocol.proto](#bertyprotocol.proto)
    - [AccountAppendAppSpecificEvent](#berty.protocol.AccountAppendAppSpecificEvent)
    - [AccountAppendAppSpecificEvent.Reply](#berty.protocol.AccountAppendAppSpecificEvent.Reply)
    - [AccountAppendAppSpecificEvent.Request](#berty.protocol.AccountAppendAppSpecificEvent.Request)
    - [AccountStoreEvent](#berty.protocol.AccountStoreEvent)
    - [AccountSubscribe](#berty.protocol.AccountSubscribe)
    - [AccountSubscribe.Reply](#berty.protocol.AccountSubscribe.Reply)
    - [AccountSubscribe.Request](#berty.protocol.AccountSubscribe.Request)
    - [ContactBlock](#berty.protocol.ContactBlock)
    - [ContactBlock.Reply](#berty.protocol.ContactBlock.Reply)
    - [ContactBlock.Request](#berty.protocol.ContactBlock.Request)
    - [ContactRemove](#berty.protocol.ContactRemove)
    - [ContactRemove.Reply](#berty.protocol.ContactRemove.Reply)
    - [ContactRemove.Request](#berty.protocol.ContactRemove.Request)
    - [ContactRequestAccept](#berty.protocol.ContactRequestAccept)
    - [ContactRequestAccept.Reply](#berty.protocol.ContactRequestAccept.Reply)
    - [ContactRequestAccept.Request](#berty.protocol.ContactRequestAccept.Request)
    - [ContactRequestDisable](#berty.protocol.ContactRequestDisable)
    - [ContactRequestDisable.Reply](#berty.protocol.ContactRequestDisable.Reply)
    - [ContactRequestDisable.Request](#berty.protocol.ContactRequestDisable.Request)
    - [ContactRequestEnable](#berty.protocol.ContactRequestEnable)
    - [ContactRequestEnable.Reply](#berty.protocol.ContactRequestEnable.Reply)
    - [ContactRequestEnable.Request](#berty.protocol.ContactRequestEnable.Request)
    - [ContactRequestEnqueue](#berty.protocol.ContactRequestEnqueue)
    - [ContactRequestEnqueue.Reply](#berty.protocol.ContactRequestEnqueue.Reply)
    - [ContactRequestEnqueue.Request](#berty.protocol.ContactRequestEnqueue.Request)
    - [ContactRequestReference](#berty.protocol.ContactRequestReference)
    - [ContactRequestReference.Reply](#berty.protocol.ContactRequestReference.Reply)
    - [ContactRequestReference.Request](#berty.protocol.ContactRequestReference.Request)
    - [ContactRequestResetLink](#berty.protocol.ContactRequestResetLink)
    - [ContactRequestResetLink.Reply](#berty.protocol.ContactRequestResetLink.Reply)
    - [ContactRequestResetLink.Request](#berty.protocol.ContactRequestResetLink.Request)
    - [ContactUnblock](#berty.protocol.ContactUnblock)
    - [ContactUnblock.Reply](#berty.protocol.ContactUnblock.Reply)
    - [ContactUnblock.Request](#berty.protocol.ContactUnblock.Request)
    - [DevicePair](#berty.protocol.DevicePair)
    - [DevicePair.Reply](#berty.protocol.DevicePair.Reply)
    - [DevicePair.Request](#berty.protocol.DevicePair.Request)
    - [EventBase](#berty.protocol.EventBase)
    - [GroupCreate](#berty.protocol.GroupCreate)
    - [GroupCreate.Reply](#berty.protocol.GroupCreate.Reply)
    - [GroupCreate.Request](#berty.protocol.GroupCreate.Request)
    - [GroupInvite](#berty.protocol.GroupInvite)
    - [GroupInvite.Reply](#berty.protocol.GroupInvite.Reply)
    - [GroupInvite.Request](#berty.protocol.GroupInvite.Request)
    - [GroupJoin](#berty.protocol.GroupJoin)
    - [GroupJoin.Reply](#berty.protocol.GroupJoin.Reply)
    - [GroupJoin.Request](#berty.protocol.GroupJoin.Request)
    - [GroupLeave](#berty.protocol.GroupLeave)
    - [GroupLeave.Reply](#berty.protocol.GroupLeave.Reply)
    - [GroupLeave.Request](#berty.protocol.GroupLeave.Request)
    - [GroupMemberStoreEvent](#berty.protocol.GroupMemberStoreEvent)
    - [GroupMemberSubscribe](#berty.protocol.GroupMemberSubscribe)
    - [GroupMemberSubscribe.Reply](#berty.protocol.GroupMemberSubscribe.Reply)
    - [GroupMemberSubscribe.Request](#berty.protocol.GroupMemberSubscribe.Request)
    - [GroupMessageSend](#berty.protocol.GroupMessageSend)
    - [GroupMessageSend.Reply](#berty.protocol.GroupMessageSend.Reply)
    - [GroupMessageSend.Request](#berty.protocol.GroupMessageSend.Request)
    - [GroupMessageStoreEvent](#berty.protocol.GroupMessageStoreEvent)
    - [GroupMessageSubscribe](#berty.protocol.GroupMessageSubscribe)
    - [GroupMessageSubscribe.Reply](#berty.protocol.GroupMessageSubscribe.Reply)
    - [GroupMessageSubscribe.Request](#berty.protocol.GroupMessageSubscribe.Request)
    - [GroupSettingSetGroup](#berty.protocol.GroupSettingSetGroup)
    - [GroupSettingSetGroup.Reply](#berty.protocol.GroupSettingSetGroup.Reply)
    - [GroupSettingSetGroup.Request](#berty.protocol.GroupSettingSetGroup.Request)
    - [GroupSettingSetMember](#berty.protocol.GroupSettingSetMember)
    - [GroupSettingSetMember.Reply](#berty.protocol.GroupSettingSetMember.Reply)
    - [GroupSettingSetMember.Request](#berty.protocol.GroupSettingSetMember.Request)
    - [GroupSettingStoreEvent](#berty.protocol.GroupSettingStoreEvent)
    - [GroupSettingStoreSubscribe](#berty.protocol.GroupSettingStoreSubscribe)
    - [GroupSettingStoreSubscribe.Reply](#berty.protocol.GroupSettingStoreSubscribe.Reply)
    - [GroupSettingStoreSubscribe.Request](#berty.protocol.GroupSettingStoreSubscribe.Request)
    - [GroupStoreEvent](#berty.protocol.GroupStoreEvent)
    - [InstanceExportData](#berty.protocol.InstanceExportData)
    - [InstanceExportData.Reply](#berty.protocol.InstanceExportData.Reply)
    - [InstanceExportData.Request](#berty.protocol.InstanceExportData.Request)
    - [InstanceGetConfiguration](#berty.protocol.InstanceGetConfiguration)
    - [InstanceGetConfiguration.Reply](#berty.protocol.InstanceGetConfiguration.Reply)
    - [InstanceGetConfiguration.Request](#berty.protocol.InstanceGetConfiguration.Request)
  
    - [AccountEventType](#berty.protocol.AccountEventType)
    - [GroupSettingStoreSettingType](#berty.protocol.GroupSettingStoreSettingType)
    - [InstanceGetConfiguration.SettingState](#berty.protocol.InstanceGetConfiguration.SettingState)
  
  
    - [ProtocolService](#berty.protocol.ProtocolService)
  

- [Scalar Value Types](#scalar-value-types)

<a name="bertyprotocol.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## bertyprotocol.proto

<a name="berty.protocol.AccountAppendAppSpecificEvent"></a>

### AccountAppendAppSpecificEvent

<a name="berty.protocol.AccountAppendAppSpecificEvent.Reply"></a>

### AccountAppendAppSpecificEvent.Reply

<a name="berty.protocol.AccountAppendAppSpecificEvent.Request"></a>

### AccountAppendAppSpecificEvent.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| payload | [bytes](#bytes) |  |  |

<a name="berty.protocol.AccountStoreEvent"></a>

### AccountStoreEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| subject_public_key_bytes | [bytes](#bytes) |  |  |
| data | [bytes](#bytes) |  |  |

<a name="berty.protocol.AccountSubscribe"></a>

### AccountSubscribe

<a name="berty.protocol.AccountSubscribe.Reply"></a>

### AccountSubscribe.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event | [AccountStoreEvent](#berty.protocol.AccountStoreEvent) |  |  |

<a name="berty.protocol.AccountSubscribe.Request"></a>

### AccountSubscribe.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| since | [bytes](#bytes) |  |  |
| until | [bytes](#bytes) |  |  |
| go_backwards | [bool](#bool) |  |  |

<a name="berty.protocol.ContactBlock"></a>

### ContactBlock

<a name="berty.protocol.ContactBlock.Reply"></a>

### ContactBlock.Reply

<a name="berty.protocol.ContactBlock.Request"></a>

### ContactBlock.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pub_key | [bytes](#bytes) |  |  |

<a name="berty.protocol.ContactRemove"></a>

### ContactRemove

<a name="berty.protocol.ContactRemove.Reply"></a>

### ContactRemove.Reply

<a name="berty.protocol.ContactRemove.Request"></a>

### ContactRemove.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pub_key | [bytes](#bytes) |  |  |

<a name="berty.protocol.ContactRequestAccept"></a>

### ContactRequestAccept

<a name="berty.protocol.ContactRequestAccept.Reply"></a>

### ContactRequestAccept.Reply

<a name="berty.protocol.ContactRequestAccept.Request"></a>

### ContactRequestAccept.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pub_key | [bytes](#bytes) |  |  |

<a name="berty.protocol.ContactRequestDisable"></a>

### ContactRequestDisable

<a name="berty.protocol.ContactRequestDisable.Reply"></a>

### ContactRequestDisable.Reply

<a name="berty.protocol.ContactRequestDisable.Request"></a>

### ContactRequestDisable.Request

<a name="berty.protocol.ContactRequestEnable"></a>

### ContactRequestEnable

<a name="berty.protocol.ContactRequestEnable.Reply"></a>

### ContactRequestEnable.Reply

<a name="berty.protocol.ContactRequestEnable.Request"></a>

### ContactRequestEnable.Request

<a name="berty.protocol.ContactRequestEnqueue"></a>

### ContactRequestEnqueue

<a name="berty.protocol.ContactRequestEnqueue.Reply"></a>

### ContactRequestEnqueue.Reply

<a name="berty.protocol.ContactRequestEnqueue.Request"></a>

### ContactRequestEnqueue.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| reference | [bytes](#bytes) |  |  |
| meta | [bytes](#bytes) |  |  |

<a name="berty.protocol.ContactRequestReference"></a>

### ContactRequestReference

<a name="berty.protocol.ContactRequestReference.Reply"></a>

### ContactRequestReference.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| reference | [bytes](#bytes) |  |  |

<a name="berty.protocol.ContactRequestReference.Request"></a>

### ContactRequestReference.Request

<a name="berty.protocol.ContactRequestResetLink"></a>

### ContactRequestResetLink

<a name="berty.protocol.ContactRequestResetLink.Reply"></a>

### ContactRequestResetLink.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| reference | [bytes](#bytes) |  |  |

<a name="berty.protocol.ContactRequestResetLink.Request"></a>

### ContactRequestResetLink.Request

<a name="berty.protocol.ContactUnblock"></a>

### ContactUnblock

<a name="berty.protocol.ContactUnblock.Reply"></a>

### ContactUnblock.Reply

<a name="berty.protocol.ContactUnblock.Request"></a>

### ContactUnblock.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_pub_key | [bytes](#bytes) |  |  |

<a name="berty.protocol.DevicePair"></a>

### DevicePair

<a name="berty.protocol.DevicePair.Reply"></a>

### DevicePair.Reply

<a name="berty.protocol.DevicePair.Request"></a>

### DevicePair.Request

<a name="berty.protocol.EventBase"></a>

### EventBase

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [bytes](#bytes) |  |  |
| parent_ids | [bytes](#bytes) | repeated |  |

<a name="berty.protocol.GroupCreate"></a>

### GroupCreate

<a name="berty.protocol.GroupCreate.Reply"></a>

### GroupCreate.Reply

<a name="berty.protocol.GroupCreate.Request"></a>

### GroupCreate.Request

<a name="berty.protocol.GroupInvite"></a>

### GroupInvite

<a name="berty.protocol.GroupInvite.Reply"></a>

### GroupInvite.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| reference | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupInvite.Request"></a>

### GroupInvite.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pub_key | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupJoin"></a>

### GroupJoin

<a name="berty.protocol.GroupJoin.Reply"></a>

### GroupJoin.Reply

<a name="berty.protocol.GroupJoin.Request"></a>

### GroupJoin.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| reference | [bytes](#bytes) |  |  |
| meta | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupLeave"></a>

### GroupLeave

<a name="berty.protocol.GroupLeave.Reply"></a>

### GroupLeave.Reply

<a name="berty.protocol.GroupLeave.Request"></a>

### GroupLeave.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pub_key | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupMemberStoreEvent"></a>

### GroupMemberStoreEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_store_event | [GroupStoreEvent](#berty.protocol.GroupStoreEvent) |  |  |

<a name="berty.protocol.GroupMemberSubscribe"></a>

### GroupMemberSubscribe

<a name="berty.protocol.GroupMemberSubscribe.Reply"></a>

### GroupMemberSubscribe.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event | [GroupMemberStoreEvent](#berty.protocol.GroupMemberStoreEvent) |  |  |

<a name="berty.protocol.GroupMemberSubscribe.Request"></a>

### GroupMemberSubscribe.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pub_key | [bytes](#bytes) |  |  |
| since | [bytes](#bytes) |  |  |
| until | [bytes](#bytes) |  |  |
| go_backwards | [bool](#bool) |  |  |

<a name="berty.protocol.GroupMessageSend"></a>

### GroupMessageSend

<a name="berty.protocol.GroupMessageSend.Reply"></a>

### GroupMessageSend.Reply

<a name="berty.protocol.GroupMessageSend.Request"></a>

### GroupMessageSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pub_key | [bytes](#bytes) |  |  |
| payload | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupMessageStoreEvent"></a>

### GroupMessageStoreEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_store_event | [GroupStoreEvent](#berty.protocol.GroupStoreEvent) |  |  |
| payload | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupMessageSubscribe"></a>

### GroupMessageSubscribe

<a name="berty.protocol.GroupMessageSubscribe.Reply"></a>

### GroupMessageSubscribe.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event | [GroupMessageStoreEvent](#berty.protocol.GroupMessageStoreEvent) |  |  |

<a name="berty.protocol.GroupMessageSubscribe.Request"></a>

### GroupMessageSubscribe.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pub_key | [bytes](#bytes) |  |  |
| since | [bytes](#bytes) |  |  |
| until | [bytes](#bytes) |  |  |
| go_backwards | [bool](#bool) |  |  |

<a name="berty.protocol.GroupSettingSetGroup"></a>

### GroupSettingSetGroup

<a name="berty.protocol.GroupSettingSetGroup.Reply"></a>

### GroupSettingSetGroup.Reply

<a name="berty.protocol.GroupSettingSetGroup.Request"></a>

### GroupSettingSetGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pub_key | [bytes](#bytes) |  |  |
| key | [string](#string) |  |  |
| value | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupSettingSetMember"></a>

### GroupSettingSetMember

<a name="berty.protocol.GroupSettingSetMember.Reply"></a>

### GroupSettingSetMember.Reply

<a name="berty.protocol.GroupSettingSetMember.Request"></a>

### GroupSettingSetMember.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pub_key | [bytes](#bytes) |  |  |
| key | [string](#string) |  |  |
| value | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupSettingStoreEvent"></a>

### GroupSettingStoreEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_store_event | [GroupStoreEvent](#berty.protocol.GroupStoreEvent) |  |  |
| setting_type | [GroupSettingStoreSettingType](#berty.protocol.GroupSettingStoreSettingType) |  |  |
| key | [string](#string) |  |  |
| value | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupSettingStoreSubscribe"></a>

### GroupSettingStoreSubscribe

<a name="berty.protocol.GroupSettingStoreSubscribe.Reply"></a>

### GroupSettingStoreSubscribe.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event | [GroupSettingStoreEvent](#berty.protocol.GroupSettingStoreEvent) |  |  |

<a name="berty.protocol.GroupSettingStoreSubscribe.Request"></a>

### GroupSettingStoreSubscribe.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pub_key | [bytes](#bytes) |  |  |
| since | [bytes](#bytes) |  |  |
| until | [bytes](#bytes) |  |  |
| go_backwards | [bool](#bool) |  |  |

<a name="berty.protocol.GroupStoreEvent"></a>

### GroupStoreEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event_base | [EventBase](#berty.protocol.EventBase) |  |  |
| group_pub_key | [bytes](#bytes) |  |  |
| group_member_pub_key | [bytes](#bytes) |  |  |
| group_device_pub_key | [bytes](#bytes) |  |  |
| account_pub_key | [bytes](#bytes) |  |  |

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
| peer_id | [string](#string) |  |  |
| listeners | [string](#string) | repeated |  |
| ble_enabled | [InstanceGetConfiguration.SettingState](#berty.protocol.InstanceGetConfiguration.SettingState) |  |  |
| wifi_p2p_enabled | [InstanceGetConfiguration.SettingState](#berty.protocol.InstanceGetConfiguration.SettingState) |  | MultiPeerConnectivity for Darwin and Nearby for Android |
| mdns_enabled | [InstanceGetConfiguration.SettingState](#berty.protocol.InstanceGetConfiguration.SettingState) |  |  |
| relay_enabled | [InstanceGetConfiguration.SettingState](#berty.protocol.InstanceGetConfiguration.SettingState) |  |  |

<a name="berty.protocol.InstanceGetConfiguration.Request"></a>

### InstanceGetConfiguration.Request

 

<a name="berty.protocol.AccountEventType"></a>

### AccountEventType

| Name | Number | Description |
| ---- | ------ | ----------- |
| AccountEventType_Undefined | 0 |  |
| AccountEventType_GroupJoined | 1 |  |
| AccountEventType_GroupLeft | 2 |  |
| AccountEventType_DevicePaired | 3 |  |
| AccountEventType_ContactRequestDisabled | 4 |  |
| AccountEventType_ContactRequestEnabled | 5 |  |
| AccountEventType_ContactRequestReferenceReset | 6 |  |
| AccountEventType_ContactRequestEnqueued | 7 | TODO: ⚠️ figure how to overcome issues with having requests sent and received by multiple devices simultaneously, secret definition should not conflict |
| AccountEventType_ContactRequested | 8 |  |
| AccountEventType_ContactAccepted | 9 |  |
| AccountEventType_ContactRemoved | 10 |  |
| AccountEventType_ContactBlocked | 11 | TODO: privacy-wise we will still announce our presence on our public rendezvous point but ignore contact requests from the blocked contact (performing the handshake but ignoring the request received), so they will still know that we are online, we should be clear in the UI of the implications of blocking someone |
| AccountEventType_ContactUnblocked | 12 |  |
| AccountEventType_AppSpecified | 13 |  |

<a name="berty.protocol.GroupSettingStoreSettingType"></a>

### GroupSettingStoreSettingType

| Name | Number | Description |
| ---- | ------ | ----------- |
| Unknown | 0 |  |
| Group | 1 |  |
| Member | 2 |  |

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
| GroupCreate | [GroupCreate.Request](#berty.protocol.GroupCreate.Request) | [GroupCreate.Reply](#berty.protocol.GroupCreate.Reply) | GroupCreate initiates a new group and joins it |
| GroupJoin | [GroupJoin.Request](#berty.protocol.GroupJoin.Request) | [GroupJoin.Reply](#berty.protocol.GroupJoin.Reply) | GroupJoin joins an existing group |
| GroupLeave | [GroupLeave.Request](#berty.protocol.GroupLeave.Request) | [GroupLeave.Reply](#berty.protocol.GroupLeave.Reply) | GroupLeave leaves a group |
| GroupInvite | [GroupInvite.Request](#berty.protocol.GroupInvite.Request) | [GroupInvite.Reply](#berty.protocol.GroupInvite.Reply) | GroupInvite generates an invitation to a group |
| DevicePair | [DevicePair.Request](#berty.protocol.DevicePair.Request) | [DevicePair.Reply](#berty.protocol.DevicePair.Reply) | DevicePair pairs a new device to the current account |
| ContactRequestReference | [ContactRequestReference.Request](#berty.protocol.ContactRequestReference.Request) | [ContactRequestReference.Reply](#berty.protocol.ContactRequestReference.Reply) | ContactRequestReference retrieves the necessary information to create a contact link |
| ContactRequestDisable | [ContactRequestDisable.Request](#berty.protocol.ContactRequestDisable.Request) | [ContactRequestDisable.Reply](#berty.protocol.ContactRequestDisable.Reply) | ContactRequestDisable disables incoming contact requests |
| ContactRequestEnable | [ContactRequestEnable.Request](#berty.protocol.ContactRequestEnable.Request) | [ContactRequestEnable.Reply](#berty.protocol.ContactRequestEnable.Reply) | ContactRequestEnable enables incoming contact requests |
| ContactRequestResetReference | [ContactRequestResetLink.Request](#berty.protocol.ContactRequestResetLink.Request) | [ContactRequestResetLink.Reply](#berty.protocol.ContactRequestResetLink.Reply) | ContactRequestResetReference generates a new contact request reference |
| ContactRequestEnqueue | [ContactRequestEnqueue.Request](#berty.protocol.ContactRequestEnqueue.Request) | [ContactRequestEnqueue.Reply](#berty.protocol.ContactRequestEnqueue.Reply) | ContactRequestEnqueue enqueues a new contact request to be sent |
| ContactRequestAccept | [ContactRequestAccept.Request](#berty.protocol.ContactRequestAccept.Request) | [ContactRequestAccept.Reply](#berty.protocol.ContactRequestAccept.Reply) | ContactRequestAccept accepts a contact request |
| ContactRemove | [ContactRemove.Request](#berty.protocol.ContactRemove.Request) | [ContactRemove.Reply](#berty.protocol.ContactRemove.Reply) | ContactRemove removes a contact |
| ContactBlock | [ContactBlock.Request](#berty.protocol.ContactBlock.Request) | [ContactBlock.Reply](#berty.protocol.ContactBlock.Reply) | ContactBlock blocks a contact, stops advertising on its rendezvous point |
| ContactUnblock | [ContactUnblock.Request](#berty.protocol.ContactUnblock.Request) | [ContactUnblock.Reply](#berty.protocol.ContactUnblock.Reply) | ContactUnblock unblocks a contact, resumes advertising on its rendezvous point |
| GroupSettingSetGroup | [GroupSettingSetGroup.Request](#berty.protocol.GroupSettingSetGroup.Request) | [GroupSettingSetGroup.Reply](#berty.protocol.GroupSettingSetGroup.Reply) | GroupSettingSetGroup sets a setting for a group |
| GroupSettingSetMember | [GroupSettingSetMember.Request](#berty.protocol.GroupSettingSetMember.Request) | [GroupSettingSetMember.Reply](#berty.protocol.GroupSettingSetMember.Reply) | GroupSettingSetGroup sets a setting for own group member |
| GroupMessageSend | [GroupMessageSend.Request](#berty.protocol.GroupMessageSend.Request) | [GroupMessageSend.Reply](#berty.protocol.GroupMessageSend.Reply) | GroupMessageSend sends a message to the group |
| AccountAppendAppSpecificEvent | [AccountAppendAppSpecificEvent.Request](#berty.protocol.AccountAppendAppSpecificEvent.Request) | [AccountAppendAppSpecificEvent.Reply](#berty.protocol.AccountAppendAppSpecificEvent.Reply) | AppendAccountSpecificEvent adds an event to account event store |
| AccountSubscribe | [AccountSubscribe.Request](#berty.protocol.AccountSubscribe.Request) | [AccountSubscribe.Reply](#berty.protocol.AccountSubscribe.Reply) stream | AccountSubscribe subscribes to the account events |
| GroupSettingSubscribe | [GroupSettingStoreSubscribe.Request](#berty.protocol.GroupSettingStoreSubscribe.Request) | [GroupSettingStoreSubscribe.Reply](#berty.protocol.GroupSettingStoreSubscribe.Reply) stream | GroupSettingSubscribe subscribes to the setting events for a group |
| GroupMessageSubscribe | [GroupMessageSubscribe.Request](#berty.protocol.GroupMessageSubscribe.Request) | [GroupMessageSubscribe.Reply](#berty.protocol.GroupMessageSubscribe.Reply) stream | GroupMessageSubscribe subscribes to the message events for a group |
| GroupMemberSubscribe | [GroupMemberSubscribe.Request](#berty.protocol.GroupMemberSubscribe.Request) | [GroupMemberSubscribe.Reply](#berty.protocol.GroupMemberSubscribe.Reply) stream | GroupMemberSubscribe subscribes to the member events for a group |

 

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

