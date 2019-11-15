# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [bertyprotocol.proto](#bertyprotocol.proto)
    - [AccountDisableIncomingContactRequest](#berty.protocol.AccountDisableIncomingContactRequest)
    - [AccountDisableIncomingContactRequest.Reply](#berty.protocol.AccountDisableIncomingContactRequest.Reply)
    - [AccountDisableIncomingContactRequest.Request](#berty.protocol.AccountDisableIncomingContactRequest.Request)
    - [AccountEnableIncomingContactRequest](#berty.protocol.AccountEnableIncomingContactRequest)
    - [AccountEnableIncomingContactRequest.Reply](#berty.protocol.AccountEnableIncomingContactRequest.Reply)
    - [AccountEnableIncomingContactRequest.Request](#berty.protocol.AccountEnableIncomingContactRequest.Request)
    - [AccountGetConfiguration](#berty.protocol.AccountGetConfiguration)
    - [AccountGetConfiguration.Reply](#berty.protocol.AccountGetConfiguration.Reply)
    - [AccountGetConfiguration.Request](#berty.protocol.AccountGetConfiguration.Request)
    - [AccountGetInformation](#berty.protocol.AccountGetInformation)
    - [AccountGetInformation.Reply](#berty.protocol.AccountGetInformation.Reply)
    - [AccountGetInformation.Request](#berty.protocol.AccountGetInformation.Request)
    - [AccountLinkNewDevice](#berty.protocol.AccountLinkNewDevice)
    - [AccountLinkNewDevice.Reply](#berty.protocol.AccountLinkNewDevice.Reply)
    - [AccountLinkNewDevice.Request](#berty.protocol.AccountLinkNewDevice.Request)
    - [AccountResetIncomingContactRequestLink](#berty.protocol.AccountResetIncomingContactRequestLink)
    - [AccountResetIncomingContactRequestLink.Reply](#berty.protocol.AccountResetIncomingContactRequestLink.Reply)
    - [AccountResetIncomingContactRequestLink.Request](#berty.protocol.AccountResetIncomingContactRequestLink.Request)
    - [Contact](#berty.protocol.Contact)
    - [ContactGet](#berty.protocol.ContactGet)
    - [ContactGet.Reply](#berty.protocol.ContactGet.Reply)
    - [ContactGet.Request](#berty.protocol.ContactGet.Request)
    - [ContactList](#berty.protocol.ContactList)
    - [ContactList.Reply](#berty.protocol.ContactList.Reply)
    - [ContactList.Request](#berty.protocol.ContactList.Request)
    - [ContactRemove](#berty.protocol.ContactRemove)
    - [ContactRemove.Reply](#berty.protocol.ContactRemove.Reply)
    - [ContactRemove.Request](#berty.protocol.ContactRemove.Request)
    - [ContactRequestAccept](#berty.protocol.ContactRequestAccept)
    - [ContactRequestAccept.Reply](#berty.protocol.ContactRequestAccept.Reply)
    - [ContactRequestAccept.Request](#berty.protocol.ContactRequestAccept.Request)
    - [ContactRequestDiscard](#berty.protocol.ContactRequestDiscard)
    - [ContactRequestDiscard.Reply](#berty.protocol.ContactRequestDiscard.Reply)
    - [ContactRequestDiscard.Request](#berty.protocol.ContactRequestDiscard.Request)
    - [ContactRequestLink](#berty.protocol.ContactRequestLink)
    - [ContactRequestListIncoming](#berty.protocol.ContactRequestListIncoming)
    - [ContactRequestListIncoming.Reply](#berty.protocol.ContactRequestListIncoming.Reply)
    - [ContactRequestListIncoming.Request](#berty.protocol.ContactRequestListIncoming.Request)
    - [ContactRequestListOutgoing](#berty.protocol.ContactRequestListOutgoing)
    - [ContactRequestListOutgoing.Reply](#berty.protocol.ContactRequestListOutgoing.Reply)
    - [ContactRequestListOutgoing.Request](#berty.protocol.ContactRequestListOutgoing.Request)
    - [ContactRequestSend](#berty.protocol.ContactRequestSend)
    - [ContactRequestSend.Reply](#berty.protocol.ContactRequestSend.Reply)
    - [ContactRequestSend.Request](#berty.protocol.ContactRequestSend.Request)
    - [Device](#berty.protocol.Device)
    - [EventSubscribe](#berty.protocol.EventSubscribe)
    - [EventSubscribe.BroadcastEvent](#berty.protocol.EventSubscribe.BroadcastEvent)
    - [EventSubscribe.ContactRequestEvent](#berty.protocol.EventSubscribe.ContactRequestEvent)
    - [EventSubscribe.GroupInvitationEvent](#berty.protocol.EventSubscribe.GroupInvitationEvent)
    - [EventSubscribe.MessageEvent](#berty.protocol.EventSubscribe.MessageEvent)
    - [EventSubscribe.Reply](#berty.protocol.EventSubscribe.Reply)
    - [EventSubscribe.Request](#berty.protocol.EventSubscribe.Request)
    - [GroupCreate](#berty.protocol.GroupCreate)
    - [GroupCreate.Reply](#berty.protocol.GroupCreate.Reply)
    - [GroupCreate.Request](#berty.protocol.GroupCreate.Request)
    - [GroupGenerateInviteLink](#berty.protocol.GroupGenerateInviteLink)
    - [GroupGenerateInviteLink.Reply](#berty.protocol.GroupGenerateInviteLink.Reply)
    - [GroupGenerateInviteLink.Request](#berty.protocol.GroupGenerateInviteLink.Request)
    - [GroupInfo](#berty.protocol.GroupInfo)
    - [GroupInvitationAccept](#berty.protocol.GroupInvitationAccept)
    - [GroupInvitationAccept.Reply](#berty.protocol.GroupInvitationAccept.Reply)
    - [GroupInvitationAccept.Request](#berty.protocol.GroupInvitationAccept.Request)
    - [GroupInvitationCreate](#berty.protocol.GroupInvitationCreate)
    - [GroupInvitationCreate.Reply](#berty.protocol.GroupInvitationCreate.Reply)
    - [GroupInvitationCreate.Request](#berty.protocol.GroupInvitationCreate.Request)
    - [GroupInvitationDiscard](#berty.protocol.GroupInvitationDiscard)
    - [GroupInvitationDiscard.Reply](#berty.protocol.GroupInvitationDiscard.Reply)
    - [GroupInvitationDiscard.Request](#berty.protocol.GroupInvitationDiscard.Request)
    - [GroupInvitationList](#berty.protocol.GroupInvitationList)
    - [GroupInvitationList.Reply](#berty.protocol.GroupInvitationList.Reply)
    - [GroupInvitationList.Request](#berty.protocol.GroupInvitationList.Request)
    - [GroupLeave](#berty.protocol.GroupLeave)
    - [GroupLeave.Reply](#berty.protocol.GroupLeave.Reply)
    - [GroupLeave.Request](#berty.protocol.GroupLeave.Request)
    - [GroupList](#berty.protocol.GroupList)
    - [GroupList.Reply](#berty.protocol.GroupList.Reply)
    - [GroupList.Request](#berty.protocol.GroupList.Request)
    - [GroupMember](#berty.protocol.GroupMember)
    - [GroupMessageCreate](#berty.protocol.GroupMessageCreate)
    - [GroupMessageCreate.Reply](#berty.protocol.GroupMessageCreate.Reply)
    - [GroupMessageCreate.Request](#berty.protocol.GroupMessageCreate.Request)
    - [GroupMessageList](#berty.protocol.GroupMessageList)
    - [GroupMessageList.Reply](#berty.protocol.GroupMessageList.Reply)
    - [GroupMessageList.Request](#berty.protocol.GroupMessageList.Request)
    - [GroupTopicPublish](#berty.protocol.GroupTopicPublish)
    - [GroupTopicPublish.Reply](#berty.protocol.GroupTopicPublish.Reply)
    - [GroupTopicPublish.Request](#berty.protocol.GroupTopicPublish.Request)
    - [GroupTopicSubscribe](#berty.protocol.GroupTopicSubscribe)
    - [GroupTopicSubscribe.Reply](#berty.protocol.GroupTopicSubscribe.Reply)
    - [GroupTopicSubscribe.Request](#berty.protocol.GroupTopicSubscribe.Request)
    - [InstanceExportData](#berty.protocol.InstanceExportData)
    - [InstanceExportData.Reply](#berty.protocol.InstanceExportData.Reply)
    - [InstanceExportData.Request](#berty.protocol.InstanceExportData.Request)
    - [InstanceGetConfiguration](#berty.protocol.InstanceGetConfiguration)
    - [InstanceGetConfiguration.Reply](#berty.protocol.InstanceGetConfiguration.Reply)
    - [InstanceGetConfiguration.Request](#berty.protocol.InstanceGetConfiguration.Request)
    - [Invitation](#berty.protocol.Invitation)
    - [StreamManagerAccept](#berty.protocol.StreamManagerAccept)
    - [StreamManagerAccept.Reply](#berty.protocol.StreamManagerAccept.Reply)
    - [StreamManagerAccept.Request](#berty.protocol.StreamManagerAccept.Request)
    - [StreamManagerRequestToContact](#berty.protocol.StreamManagerRequestToContact)
    - [StreamManagerRequestToContact.Reply](#berty.protocol.StreamManagerRequestToContact.Reply)
    - [StreamManagerRequestToContact.Request](#berty.protocol.StreamManagerRequestToContact.Request)
  
    - [Contact.TrustLevel](#berty.protocol.Contact.TrustLevel)
    - [EventSubscribe.Type](#berty.protocol.EventSubscribe.Type)
    - [GroupInfo.GroupAudience](#berty.protocol.GroupInfo.GroupAudience)
    - [InstanceGetConfiguration.SettingState](#berty.protocol.InstanceGetConfiguration.SettingState)
  
  
    - [ProtocolService](#berty.protocol.ProtocolService)
  

- [Scalar Value Types](#scalar-value-types)

<a name="bertyprotocol.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## bertyprotocol.proto

<a name="berty.protocol.AccountDisableIncomingContactRequest"></a>

### AccountDisableIncomingContactRequest

<a name="berty.protocol.AccountDisableIncomingContactRequest.Reply"></a>

### AccountDisableIncomingContactRequest.Reply

<a name="berty.protocol.AccountDisableIncomingContactRequest.Request"></a>

### AccountDisableIncomingContactRequest.Request

<a name="berty.protocol.AccountEnableIncomingContactRequest"></a>

### AccountEnableIncomingContactRequest

<a name="berty.protocol.AccountEnableIncomingContactRequest.Reply"></a>

### AccountEnableIncomingContactRequest.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_request_link | [ContactRequestLink](#berty.protocol.ContactRequestLink) |  |  |

<a name="berty.protocol.AccountEnableIncomingContactRequest.Request"></a>

### AccountEnableIncomingContactRequest.Request

<a name="berty.protocol.AccountGetConfiguration"></a>

### AccountGetConfiguration

<a name="berty.protocol.AccountGetConfiguration.Reply"></a>

### AccountGetConfiguration.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_requestable | [bool](#bool) |  |  |
| default_pinning_service | [bytes](#bytes) |  |  |
| metadata | [bytes](#bytes) |  |  |

<a name="berty.protocol.AccountGetConfiguration.Request"></a>

### AccountGetConfiguration.Request

<a name="berty.protocol.AccountGetInformation"></a>

### AccountGetInformation

<a name="berty.protocol.AccountGetInformation.Reply"></a>

### AccountGetInformation.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| account_pub_key | [bytes](#bytes) |  |  |
| devices | [Device](#berty.protocol.Device) | repeated |  |

<a name="berty.protocol.AccountGetInformation.Request"></a>

### AccountGetInformation.Request

<a name="berty.protocol.AccountLinkNewDevice"></a>

### AccountLinkNewDevice

<a name="berty.protocol.AccountLinkNewDevice.Reply"></a>

### AccountLinkNewDevice.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| invitation | [Invitation](#berty.protocol.Invitation) |  |  |

<a name="berty.protocol.AccountLinkNewDevice.Request"></a>

### AccountLinkNewDevice.Request

<a name="berty.protocol.AccountResetIncomingContactRequestLink"></a>

### AccountResetIncomingContactRequestLink

<a name="berty.protocol.AccountResetIncomingContactRequestLink.Reply"></a>

### AccountResetIncomingContactRequestLink.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_request_link | [ContactRequestLink](#berty.protocol.ContactRequestLink) |  | Reset rdv_point_seed and rotation_time_point |

<a name="berty.protocol.AccountResetIncomingContactRequestLink.Request"></a>

### AccountResetIncomingContactRequestLink.Request

<a name="berty.protocol.Contact"></a>

### Contact
Contact is the public version of protocolmodel.Contact and should stay in sync

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| account_pub_key | [bytes](#bytes) |  |  |
| one_to_one_group_pub_key | [bytes](#bytes) |  |  |
| trust_level | [Contact.TrustLevel](#berty.protocol.Contact.TrustLevel) |  |  |
| metadata | [bytes](#bytes) |  |  |
| blocked | [bool](#bool) |  |  |
| one_to_one_group | [GroupInfo](#berty.protocol.GroupInfo) |  |  |

<a name="berty.protocol.ContactGet"></a>

### ContactGet

<a name="berty.protocol.ContactGet.Reply"></a>

### ContactGet.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact | [Contact](#berty.protocol.Contact) |  |  |

<a name="berty.protocol.ContactGet.Request"></a>

### ContactGet.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_account_pub_key | [bytes](#bytes) |  |  |

<a name="berty.protocol.ContactList"></a>

### ContactList

<a name="berty.protocol.ContactList.Reply"></a>

### ContactList.Reply
streamed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact | [Contact](#berty.protocol.Contact) |  |  |

<a name="berty.protocol.ContactList.Request"></a>

### ContactList.Request

<a name="berty.protocol.ContactRemove"></a>

### ContactRemove

<a name="berty.protocol.ContactRemove.Reply"></a>

### ContactRemove.Reply

<a name="berty.protocol.ContactRemove.Request"></a>

### ContactRemove.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_account_pub_key | [bytes](#bytes) |  |  |

<a name="berty.protocol.ContactRequestAccept"></a>

### ContactRequestAccept

<a name="berty.protocol.ContactRequestAccept.Reply"></a>

### ContactRequestAccept.Reply

<a name="berty.protocol.ContactRequestAccept.Request"></a>

### ContactRequestAccept.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_account_pub_key | [bytes](#bytes) |  |  |

<a name="berty.protocol.ContactRequestDiscard"></a>

### ContactRequestDiscard

<a name="berty.protocol.ContactRequestDiscard.Reply"></a>

### ContactRequestDiscard.Reply

<a name="berty.protocol.ContactRequestDiscard.Request"></a>

### ContactRequestDiscard.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_account_pub_key | [bytes](#bytes) |  |  |

<a name="berty.protocol.ContactRequestLink"></a>

### ContactRequestLink

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| rendezvous_point_seed | [bytes](#bytes) |  |  |
| contact_account_pub_key | [bytes](#bytes) |  |  |
| metadata | [bytes](#bytes) |  |  |

<a name="berty.protocol.ContactRequestListIncoming"></a>

### ContactRequestListIncoming

<a name="berty.protocol.ContactRequestListIncoming.Reply"></a>

### ContactRequestListIncoming.Reply
streamed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact | [Contact](#berty.protocol.Contact) |  |  |

<a name="berty.protocol.ContactRequestListIncoming.Request"></a>

### ContactRequestListIncoming.Request

<a name="berty.protocol.ContactRequestListOutgoing"></a>

### ContactRequestListOutgoing

<a name="berty.protocol.ContactRequestListOutgoing.Reply"></a>

### ContactRequestListOutgoing.Reply
streamed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact | [Contact](#berty.protocol.Contact) |  |  |

<a name="berty.protocol.ContactRequestListOutgoing.Request"></a>

### ContactRequestListOutgoing.Request

<a name="berty.protocol.ContactRequestSend"></a>

### ContactRequestSend

<a name="berty.protocol.ContactRequestSend.Reply"></a>

### ContactRequestSend.Reply

<a name="berty.protocol.ContactRequestSend.Request"></a>

### ContactRequestSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_request_link | [ContactRequestLink](#berty.protocol.ContactRequestLink) |  |  |

<a name="berty.protocol.Device"></a>

### Device

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device_pub_key | [bytes](#bytes) |  |  |
| parent_device_pub_key | [bytes](#bytes) |  | Equal to account_pub_key for the first device |
| linked_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| ble_capable | [bool](#bool) |  |  |
| wifi_p2p_capable | [bool](#bool) |  |  |
| relay_capable | [bool](#bool) |  |  |

<a name="berty.protocol.EventSubscribe"></a>

### EventSubscribe

<a name="berty.protocol.EventSubscribe.BroadcastEvent"></a>

### EventSubscribe.BroadcastEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_id | [bytes](#bytes) |  |  |
| member_id | [bytes](#bytes) |  |  |
| topic_id | [bytes](#bytes) |  |  |

<a name="berty.protocol.EventSubscribe.ContactRequestEvent"></a>

### EventSubscribe.ContactRequestEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_account_pub_key | [bytes](#bytes) |  |  |
| metadata | [bytes](#bytes) |  |  |

<a name="berty.protocol.EventSubscribe.GroupInvitationEvent"></a>

### EventSubscribe.GroupInvitationEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_id | [bytes](#bytes) |  |  |
| inviter_pub_key | [bytes](#bytes) |  |  |
| metadata | [bytes](#bytes) |  |  |

<a name="berty.protocol.EventSubscribe.MessageEvent"></a>

### EventSubscribe.MessageEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_id | [bytes](#bytes) |  |  |
| member_id | [bytes](#bytes) |  |  |
| payload | [bytes](#bytes) |  |  |

<a name="berty.protocol.EventSubscribe.Reply"></a>

### EventSubscribe.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| type | [EventSubscribe.Type](#berty.protocol.EventSubscribe.Type) |  |  |
| event_id | [bytes](#bytes) |  |  |
| message_event | [EventSubscribe.MessageEvent](#berty.protocol.EventSubscribe.MessageEvent) |  |  |
| contact_request_event | [EventSubscribe.ContactRequestEvent](#berty.protocol.EventSubscribe.ContactRequestEvent) |  |  |
| group_invitation_event | [EventSubscribe.GroupInvitationEvent](#berty.protocol.EventSubscribe.GroupInvitationEvent) |  |  |
| broadcast_event | [EventSubscribe.BroadcastEvent](#berty.protocol.EventSubscribe.BroadcastEvent) |  |  |

<a name="berty.protocol.EventSubscribe.Request"></a>

### EventSubscribe.Request

<a name="berty.protocol.GroupCreate"></a>

### GroupCreate

<a name="berty.protocol.GroupCreate.Reply"></a>

### GroupCreate.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_info | [GroupInfo](#berty.protocol.GroupInfo) |  |  |

<a name="berty.protocol.GroupCreate.Request"></a>

### GroupCreate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact_account_pub_key | [bytes](#bytes) | repeated | Invitees |
| pinning_service | [bytes](#bytes) |  |  |
| metadata | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupGenerateInviteLink"></a>

### GroupGenerateInviteLink

<a name="berty.protocol.GroupGenerateInviteLink.Reply"></a>

### GroupGenerateInviteLink.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| invitation | [Invitation](#berty.protocol.Invitation) |  |  |

<a name="berty.protocol.GroupGenerateInviteLink.Request"></a>

### GroupGenerateInviteLink.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_id | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupInfo"></a>

### GroupInfo
GroupInfo is the public version of protocolmodel.GroupInfo and should stay in sync

group clashes with reserved SQL keyword

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pub_key | [bytes](#bytes) |  |  |
| metadata | [bytes](#bytes) |  |  |
| audience | [GroupInfo.GroupAudience](#berty.protocol.GroupInfo.GroupAudience) |  |  |
| version | [uint32](#uint32) |  |  |
| inviter_contact_pub_key | [bytes](#bytes) |  |  |
| members | [GroupMember](#berty.protocol.GroupMember) | repeated |  |
| inviter | [Contact](#berty.protocol.Contact) |  |  |

<a name="berty.protocol.GroupInvitationAccept"></a>

### GroupInvitationAccept

<a name="berty.protocol.GroupInvitationAccept.Reply"></a>

### GroupInvitationAccept.Reply

<a name="berty.protocol.GroupInvitationAccept.Request"></a>

### GroupInvitationAccept.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_id | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupInvitationCreate"></a>

### GroupInvitationCreate

<a name="berty.protocol.GroupInvitationCreate.Reply"></a>

### GroupInvitationCreate.Reply

<a name="berty.protocol.GroupInvitationCreate.Request"></a>

### GroupInvitationCreate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_id | [bytes](#bytes) |  |  |
| contact_account_pub_key | [bytes](#bytes) | repeated |  |

<a name="berty.protocol.GroupInvitationDiscard"></a>

### GroupInvitationDiscard

<a name="berty.protocol.GroupInvitationDiscard.Reply"></a>

### GroupInvitationDiscard.Reply

<a name="berty.protocol.GroupInvitationDiscard.Request"></a>

### GroupInvitationDiscard.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_id | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupInvitationList"></a>

### GroupInvitationList

<a name="berty.protocol.GroupInvitationList.Reply"></a>

### GroupInvitationList.Reply
streamed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| inviter_account_pub_key | [bytes](#bytes) |  |  |
| group_info | [GroupInfo](#berty.protocol.GroupInfo) |  |  |

<a name="berty.protocol.GroupInvitationList.Request"></a>

### GroupInvitationList.Request

<a name="berty.protocol.GroupLeave"></a>

### GroupLeave

<a name="berty.protocol.GroupLeave.Reply"></a>

### GroupLeave.Reply

<a name="berty.protocol.GroupLeave.Request"></a>

### GroupLeave.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_id | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupList"></a>

### GroupList

<a name="berty.protocol.GroupList.Reply"></a>

### GroupList.Reply
streamed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_info | [GroupInfo](#berty.protocol.GroupInfo) |  |  |

<a name="berty.protocol.GroupList.Request"></a>

### GroupList.Request

<a name="berty.protocol.GroupMember"></a>

### GroupMember
GroupMember is the public version of protocolmodel.GroupMember and should stay in sync

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_member_pub_key | [bytes](#bytes) |  |  |
| group_pub_key | [bytes](#bytes) |  |  |
| inviter_pub_key | [bytes](#bytes) |  | Will be null for first member of the group |
| contact_account_pub_key | [bytes](#bytes) |  |  |
| metadata | [bytes](#bytes) |  |  |
| group_info | [GroupInfo](#berty.protocol.GroupInfo) |  |  |
| inviter | [GroupMember](#berty.protocol.GroupMember) |  |  |
| contact | [Contact](#berty.protocol.Contact) |  |  |

<a name="berty.protocol.GroupMessageCreate"></a>

### GroupMessageCreate

<a name="berty.protocol.GroupMessageCreate.Reply"></a>

### GroupMessageCreate.Reply

<a name="berty.protocol.GroupMessageCreate.Request"></a>

### GroupMessageCreate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_id | [bytes](#bytes) |  |  |
| payload | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupMessageList"></a>

### GroupMessageList

<a name="berty.protocol.GroupMessageList.Reply"></a>

### GroupMessageList.Reply
streamed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| message_id | [bytes](#bytes) |  |  |
| member_id | [bytes](#bytes) |  |  |
| payload | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupMessageList.Request"></a>

### GroupMessageList.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_id | [bytes](#bytes) |  |  |
| from_index | [uint64](#uint64) |  |  |
| to_index | [uint64](#uint64) |  |  |

<a name="berty.protocol.GroupTopicPublish"></a>

### GroupTopicPublish

<a name="berty.protocol.GroupTopicPublish.Reply"></a>

### GroupTopicPublish.Reply

<a name="berty.protocol.GroupTopicPublish.Request"></a>

### GroupTopicPublish.Request
streamed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_id | [bytes](#bytes) |  |  |
| topic_id | [bytes](#bytes) |  |  |
| volatile_data | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupTopicSubscribe"></a>

### GroupTopicSubscribe

<a name="berty.protocol.GroupTopicSubscribe.Reply"></a>

### GroupTopicSubscribe.Reply
streamed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| volatile_data | [bytes](#bytes) |  |  |

<a name="berty.protocol.GroupTopicSubscribe.Request"></a>

### GroupTopicSubscribe.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_id | [bytes](#bytes) |  |  |
| topic_id | [bytes](#bytes) |  |  |

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

<a name="berty.protocol.Invitation"></a>

### Invitation

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| inviter_member_pub_key | [bytes](#bytes) |  |  |
| invitation_priv_key | [bytes](#bytes) |  |  |
| invitation_pub_key_signature | [bytes](#bytes) |  | Signed by inviter_member_priv_key |
| group_version | [uint32](#uint32) |  |  |
| group_id_pub_key | [bytes](#bytes) |  |  |
| shared_secret | [bytes](#bytes) |  |  |

<a name="berty.protocol.StreamManagerAccept"></a>

### StreamManagerAccept

<a name="berty.protocol.StreamManagerAccept.Reply"></a>

### StreamManagerAccept.Reply

<a name="berty.protocol.StreamManagerAccept.Request"></a>

### StreamManagerAccept.Request

<a name="berty.protocol.StreamManagerRequestToContact"></a>

### StreamManagerRequestToContact

<a name="berty.protocol.StreamManagerRequestToContact.Reply"></a>

### StreamManagerRequestToContact.Reply

<a name="berty.protocol.StreamManagerRequestToContact.Request"></a>

### StreamManagerRequestToContact.Request

 

<a name="berty.protocol.Contact.TrustLevel"></a>

### Contact.TrustLevel

| Name | Number | Description |
| ---- | ------ | ----------- |
| Unknown | 0 |  |
| Untrusted | 1 |  |
| Accepted | 2 |  |
| Trusted | 3 |  |
| UltimateTrust | 4 |  |

<a name="berty.protocol.EventSubscribe.Type"></a>

### EventSubscribe.Type

| Name | Number | Description |
| ---- | ------ | ----------- |
| EventUnknown | 0 |  |
| EventMessage | 1 |  |
| EventContactRequest | 2 |  |
| EventGroupInvitation | 3 |  |
| EventBroadcastAvailable | 4 |  |

<a name="berty.protocol.GroupInfo.GroupAudience"></a>

### GroupInfo.GroupAudience

| Name | Number | Description |
| ---- | ------ | ----------- |
| Undefined | 0 |  |
| OneToOne | 1 |  |
| Group | 2 |  |
| Self | 3 |  |

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
| AccountGetConfiguration | [AccountGetConfiguration.Request](#berty.protocol.AccountGetConfiguration.Request) | [AccountGetConfiguration.Reply](#berty.protocol.AccountGetConfiguration.Reply) | AccountGetConfiguration get current account global configuration (shared between all devices linked to current account) |
| AccountGetInformation | [AccountGetInformation.Request](#berty.protocol.AccountGetInformation.Request) | [AccountGetInformation.Reply](#berty.protocol.AccountGetInformation.Reply) | AccountGetInformation get current account global information (shared between all devices linked to current account) |
| AccountLinkNewDevice | [AccountLinkNewDevice.Request](#berty.protocol.AccountLinkNewDevice.Request) | [AccountLinkNewDevice.Reply](#berty.protocol.AccountLinkNewDevice.Reply) | AccountLinkNewDevice link a new device to this account |
| AccountDisableIncomingContactRequest | [AccountDisableIncomingContactRequest.Request](#berty.protocol.AccountDisableIncomingContactRequest.Request) | [AccountDisableIncomingContactRequest.Reply](#berty.protocol.AccountDisableIncomingContactRequest.Reply) | AccountDisableIncomingContactRequest disable incoming contact request, under the hood, this will make you undiscoverable for new contact |
| AccountEnableIncomingContactRequest | [AccountEnableIncomingContactRequest.Request](#berty.protocol.AccountEnableIncomingContactRequest.Request) | [AccountEnableIncomingContactRequest.Reply](#berty.protocol.AccountEnableIncomingContactRequest.Reply) | AccountEnableIncomingContactRequest enable incoming contact request |
| AccountResetIncomingContactRequestLink | [AccountResetIncomingContactRequestLink.Request](#berty.protocol.AccountResetIncomingContactRequestLink.Request) | [AccountResetIncomingContactRequestLink.Reply](#berty.protocol.AccountResetIncomingContactRequestLink.Reply) | AccountResetIncomingContactRequestLink invalidate the request link |
| EventSubscribe | [EventSubscribe.Request](#berty.protocol.EventSubscribe.Request) | [EventSubscribe.Reply](#berty.protocol.EventSubscribe.Reply) stream | EventSubscribe listen for real time protocol events |
| ContactRequestAccept | [ContactRequestAccept.Request](#berty.protocol.ContactRequestAccept.Request) | [ContactRequestAccept.Reply](#berty.protocol.ContactRequestAccept.Reply) | ContactRequestAccept accepts the given contact request, the requester signature is included so any of their device can accept the contact request |
| ContactRequestDiscard | [ContactRequestDiscard.Request](#berty.protocol.ContactRequestDiscard.Request) | [ContactRequestDiscard.Reply](#berty.protocol.ContactRequestDiscard.Reply) | ContactRequestDiscard discards the given contact request |
| ContactRequestListIncoming | [ContactRequestListIncoming.Request](#berty.protocol.ContactRequestListIncoming.Request) | [ContactRequestListIncoming.Reply](#berty.protocol.ContactRequestListIncoming.Reply) stream | ContactRequestListIncoming lists incoming contact request sent to your account |
| ContactRequestListOutgoing | [ContactRequestListOutgoing.Request](#berty.protocol.ContactRequestListOutgoing.Request) | [ContactRequestListOutgoing.Reply](#berty.protocol.ContactRequestListOutgoing.Reply) stream | ContactRequestListIncoming lists pending contact request sent by your account |
| ContactRequestSend | [ContactRequestSend.Request](#berty.protocol.ContactRequestSend.Request) | [ContactRequestSend.Reply](#berty.protocol.ContactRequestSend.Reply) | ContactRequestSend sends a contact request to the given contact |
| ContactGet | [ContactGet.Request](#berty.protocol.ContactGet.Request) | [ContactGet.Reply](#berty.protocol.ContactGet.Reply) | ContactGet gets contact&#39;s information |
| ContactList | [ContactList.Request](#berty.protocol.ContactList.Request) | [ContactList.Reply](#berty.protocol.ContactList.Reply) stream | ContactList lists contacts of this account |
| ContactRemove | [ContactRemove.Request](#berty.protocol.ContactRemove.Request) | [ContactRemove.Reply](#berty.protocol.ContactRemove.Reply) | ContactList removes the given contact |
| StreamManagerRequestToContact | [StreamManagerRequestToContact.Request](#berty.protocol.StreamManagerRequestToContact.Request) | [StreamManagerRequestToContact.Reply](#berty.protocol.StreamManagerRequestToContact.Reply) | StreamManagerRequestToContact requests a stream to a specific contact |
| StreamManagerAccept | [StreamManagerAccept.Request](#berty.protocol.StreamManagerAccept.Request) stream | [StreamManagerAccept.Reply](#berty.protocol.StreamManagerAccept.Reply) stream | StreamManagerAccept accepts a stream request, and create a stream with the contact that sent you this request |
| GroupCreate | [GroupCreate.Request](#berty.protocol.GroupCreate.Request) | [GroupCreate.Reply](#berty.protocol.GroupCreate.Reply) | GroupCreate initiate a group locally |
| GroupGenerateInviteLink | [GroupGenerateInviteLink.Request](#berty.protocol.GroupGenerateInviteLink.Request) | [GroupGenerateInviteLink.Reply](#berty.protocol.GroupGenerateInviteLink.Reply) | GroupGenerateInviteLink generates an invitation link used to send the invitation to the other group members |
| GroupLeave | [GroupLeave.Request](#berty.protocol.GroupLeave.Request) | [GroupLeave.Reply](#berty.protocol.GroupLeave.Reply) | GroupLeave leaves a group |
| GroupList | [GroupList.Request](#berty.protocol.GroupList.Request) | [GroupList.Reply](#berty.protocol.GroupList.Reply) stream | GroupList lists all group for this account |
| GroupMessageCreate | [GroupMessageCreate.Request](#berty.protocol.GroupMessageCreate.Request) | [GroupMessageCreate.Reply](#berty.protocol.GroupMessageCreate.Reply) | GroupMessageCreate creates a new message for the group, and send the invitation to the other group members. |
| GroupMessageList | [GroupMessageList.Request](#berty.protocol.GroupMessageList.Request) | [GroupMessageList.Reply](#berty.protocol.GroupMessageList.Reply) stream | GroupMessageList lists messages from this group |
| GroupTopicPublish | [GroupTopicPublish.Request](#berty.protocol.GroupTopicPublish.Request) stream | [GroupTopicPublish.Reply](#berty.protocol.GroupTopicPublish.Reply) | GroupTopicPublish return a stream used to publish volatile updates to other group members on a specific topic |
| GroupTopicSubscribe | [GroupTopicSubscribe.Request](#berty.protocol.GroupTopicSubscribe.Request) | [GroupTopicSubscribe.Reply](#berty.protocol.GroupTopicSubscribe.Reply) stream | GroupTopicSubscribe subscribes to a topic to receive volatile message from it |
| GroupInvitationAccept | [GroupInvitationAccept.Request](#berty.protocol.GroupInvitationAccept.Request) | [GroupInvitationAccept.Reply](#berty.protocol.GroupInvitationAccept.Reply) | GroupInvitationAccept accepts an invation to join a group |
| GroupInvitationCreate | [GroupInvitationCreate.Request](#berty.protocol.GroupInvitationCreate.Request) | [GroupInvitationCreate.Reply](#berty.protocol.GroupInvitationCreate.Reply) | GroupInvitationCreate creates an invitation, that can be sent to join this group |
| GroupInvitationDiscard | [GroupInvitationDiscard.Request](#berty.protocol.GroupInvitationDiscard.Request) | [GroupInvitationDiscard.Reply](#berty.protocol.GroupInvitationDiscard.Reply) | GroupInvitationDiscard discards an invtation sent to you to join a group |
| GroupInvitationList | [GroupInvitationList.Request](#berty.protocol.GroupInvitationList.Request) | [GroupInvitationList.Reply](#berty.protocol.GroupInvitationList.Reply) stream | GroupInvitationList lists pending invitation to this group |

 

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

