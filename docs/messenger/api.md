# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [bertymessenger.proto](#bertymessenger.proto)
    - [Account](#berty.messenger.v1.Account)
    - [AccountGet](#berty.messenger.v1.AccountGet)
    - [AccountGet.Reply](#berty.messenger.v1.AccountGet.Reply)
    - [AccountGet.Request](#berty.messenger.v1.AccountGet.Request)
    - [AccountUpdate](#berty.messenger.v1.AccountUpdate)
    - [AccountUpdate.Reply](#berty.messenger.v1.AccountUpdate.Reply)
    - [AccountUpdate.Request](#berty.messenger.v1.AccountUpdate.Request)
    - [AppMessage](#berty.messenger.v1.AppMessage)
    - [AppMessage.Acknowledge](#berty.messenger.v1.AppMessage.Acknowledge)
    - [AppMessage.GroupInvitation](#berty.messenger.v1.AppMessage.GroupInvitation)
    - [AppMessage.MonitorMetadata](#berty.messenger.v1.AppMessage.MonitorMetadata)
    - [AppMessage.ReplyOptions](#berty.messenger.v1.AppMessage.ReplyOptions)
    - [AppMessage.SetGroupInfo](#berty.messenger.v1.AppMessage.SetGroupInfo)
    - [AppMessage.SetUserInfo](#berty.messenger.v1.AppMessage.SetUserInfo)
    - [AppMessage.UserMessage](#berty.messenger.v1.AppMessage.UserMessage)
    - [AppMessage.UserReaction](#berty.messenger.v1.AppMessage.UserReaction)
    - [BannerQuote](#berty.messenger.v1.BannerQuote)
    - [BannerQuote.Reply](#berty.messenger.v1.BannerQuote.Reply)
    - [BannerQuote.Request](#berty.messenger.v1.BannerQuote.Request)
    - [BertyGroup](#berty.messenger.v1.BertyGroup)
    - [BertyID](#berty.messenger.v1.BertyID)
    - [BertyLink](#berty.messenger.v1.BertyLink)
    - [Contact](#berty.messenger.v1.Contact)
    - [ContactAccept](#berty.messenger.v1.ContactAccept)
    - [ContactAccept.Reply](#berty.messenger.v1.ContactAccept.Reply)
    - [ContactAccept.Request](#berty.messenger.v1.ContactAccept.Request)
    - [ContactMetadata](#berty.messenger.v1.ContactMetadata)
    - [ContactRequest](#berty.messenger.v1.ContactRequest)
    - [ContactRequest.Reply](#berty.messenger.v1.ContactRequest.Reply)
    - [ContactRequest.Request](#berty.messenger.v1.ContactRequest.Request)
    - [Conversation](#berty.messenger.v1.Conversation)
    - [ConversationClose](#berty.messenger.v1.ConversationClose)
    - [ConversationClose.Reply](#berty.messenger.v1.ConversationClose.Reply)
    - [ConversationClose.Request](#berty.messenger.v1.ConversationClose.Request)
    - [ConversationCreate](#berty.messenger.v1.ConversationCreate)
    - [ConversationCreate.Reply](#berty.messenger.v1.ConversationCreate.Reply)
    - [ConversationCreate.Request](#berty.messenger.v1.ConversationCreate.Request)
    - [ConversationJoin](#berty.messenger.v1.ConversationJoin)
    - [ConversationJoin.Reply](#berty.messenger.v1.ConversationJoin.Reply)
    - [ConversationJoin.Request](#berty.messenger.v1.ConversationJoin.Request)
    - [ConversationOpen](#berty.messenger.v1.ConversationOpen)
    - [ConversationOpen.Reply](#berty.messenger.v1.ConversationOpen.Reply)
    - [ConversationOpen.Request](#berty.messenger.v1.ConversationOpen.Request)
    - [ConversationReplicationInfo](#berty.messenger.v1.ConversationReplicationInfo)
    - [ConversationStream](#berty.messenger.v1.ConversationStream)
    - [ConversationStream.Reply](#berty.messenger.v1.ConversationStream.Reply)
    - [ConversationStream.Request](#berty.messenger.v1.ConversationStream.Request)
    - [DevShareInstanceBertyID](#berty.messenger.v1.DevShareInstanceBertyID)
    - [DevShareInstanceBertyID.Reply](#berty.messenger.v1.DevShareInstanceBertyID.Reply)
    - [DevShareInstanceBertyID.Request](#berty.messenger.v1.DevShareInstanceBertyID.Request)
    - [Device](#berty.messenger.v1.Device)
    - [EchoTest](#berty.messenger.v1.EchoTest)
    - [EchoTest.Reply](#berty.messenger.v1.EchoTest.Reply)
    - [EchoTest.Request](#berty.messenger.v1.EchoTest.Request)
    - [EventStream](#berty.messenger.v1.EventStream)
    - [EventStream.Reply](#berty.messenger.v1.EventStream.Reply)
    - [EventStream.Request](#berty.messenger.v1.EventStream.Request)
    - [GetUsername](#berty.messenger.v1.GetUsername)
    - [GetUsername.Reply](#berty.messenger.v1.GetUsername.Reply)
    - [GetUsername.Request](#berty.messenger.v1.GetUsername.Request)
    - [InstanceExportData](#berty.messenger.v1.InstanceExportData)
    - [InstanceExportData.Reply](#berty.messenger.v1.InstanceExportData.Reply)
    - [InstanceExportData.Request](#berty.messenger.v1.InstanceExportData.Request)
    - [InstanceShareableBertyID](#berty.messenger.v1.InstanceShareableBertyID)
    - [InstanceShareableBertyID.Reply](#berty.messenger.v1.InstanceShareableBertyID.Reply)
    - [InstanceShareableBertyID.Request](#berty.messenger.v1.InstanceShareableBertyID.Request)
    - [Interact](#berty.messenger.v1.Interact)
    - [Interact.Reply](#berty.messenger.v1.Interact.Reply)
    - [Interact.Request](#berty.messenger.v1.Interact.Request)
    - [Interaction](#berty.messenger.v1.Interaction)
    - [LocalConversationState](#berty.messenger.v1.LocalConversationState)
    - [LocalDatabaseState](#berty.messenger.v1.LocalDatabaseState)
    - [Member](#berty.messenger.v1.Member)
    - [ParseDeepLink](#berty.messenger.v1.ParseDeepLink)
    - [ParseDeepLink.Reply](#berty.messenger.v1.ParseDeepLink.Reply)
    - [ParseDeepLink.Request](#berty.messenger.v1.ParseDeepLink.Request)
    - [ReplicationServiceRegisterGroup](#berty.messenger.v1.ReplicationServiceRegisterGroup)
    - [ReplicationServiceRegisterGroup.Reply](#berty.messenger.v1.ReplicationServiceRegisterGroup.Reply)
    - [ReplicationServiceRegisterGroup.Request](#berty.messenger.v1.ReplicationServiceRegisterGroup.Request)
    - [ReplicationSetAutoEnable](#berty.messenger.v1.ReplicationSetAutoEnable)
    - [ReplicationSetAutoEnable.Reply](#berty.messenger.v1.ReplicationSetAutoEnable.Reply)
    - [ReplicationSetAutoEnable.Request](#berty.messenger.v1.ReplicationSetAutoEnable.Request)
    - [ReplyOption](#berty.messenger.v1.ReplyOption)
    - [SendAck](#berty.messenger.v1.SendAck)
    - [SendAck.Reply](#berty.messenger.v1.SendAck.Reply)
    - [SendAck.Request](#berty.messenger.v1.SendAck.Request)
    - [SendContactRequest](#berty.messenger.v1.SendContactRequest)
    - [SendContactRequest.Reply](#berty.messenger.v1.SendContactRequest.Reply)
    - [SendContactRequest.Request](#berty.messenger.v1.SendContactRequest.Request)
    - [SendMessage](#berty.messenger.v1.SendMessage)
    - [SendMessage.Reply](#berty.messenger.v1.SendMessage.Reply)
    - [SendMessage.Request](#berty.messenger.v1.SendMessage.Request)
    - [SendReplyOptions](#berty.messenger.v1.SendReplyOptions)
    - [SendReplyOptions.Reply](#berty.messenger.v1.SendReplyOptions.Reply)
    - [SendReplyOptions.Request](#berty.messenger.v1.SendReplyOptions.Request)
    - [ServiceToken](#berty.messenger.v1.ServiceToken)
    - [ShareableBertyGroup](#berty.messenger.v1.ShareableBertyGroup)
    - [ShareableBertyGroup.Reply](#berty.messenger.v1.ShareableBertyGroup.Reply)
    - [ShareableBertyGroup.Request](#berty.messenger.v1.ShareableBertyGroup.Request)
    - [StreamEvent](#berty.messenger.v1.StreamEvent)
    - [StreamEvent.AccountUpdated](#berty.messenger.v1.StreamEvent.AccountUpdated)
    - [StreamEvent.ContactUpdated](#berty.messenger.v1.StreamEvent.ContactUpdated)
    - [StreamEvent.ConversationDeleted](#berty.messenger.v1.StreamEvent.ConversationDeleted)
    - [StreamEvent.ConversationUpdated](#berty.messenger.v1.StreamEvent.ConversationUpdated)
    - [StreamEvent.DeviceUpdated](#berty.messenger.v1.StreamEvent.DeviceUpdated)
    - [StreamEvent.InteractionDeleted](#berty.messenger.v1.StreamEvent.InteractionDeleted)
    - [StreamEvent.InteractionUpdated](#berty.messenger.v1.StreamEvent.InteractionUpdated)
    - [StreamEvent.ListEnded](#berty.messenger.v1.StreamEvent.ListEnded)
    - [StreamEvent.MemberUpdated](#berty.messenger.v1.StreamEvent.MemberUpdated)
    - [StreamEvent.Notified](#berty.messenger.v1.StreamEvent.Notified)
    - [StreamEvent.Notified.Basic](#berty.messenger.v1.StreamEvent.Notified.Basic)
    - [StreamEvent.Notified.ContactRequestReceived](#berty.messenger.v1.StreamEvent.Notified.ContactRequestReceived)
    - [StreamEvent.Notified.ContactRequestSent](#berty.messenger.v1.StreamEvent.Notified.ContactRequestSent)
    - [StreamEvent.Notified.MessageReceived](#berty.messenger.v1.StreamEvent.Notified.MessageReceived)
    - [SystemInfo](#berty.messenger.v1.SystemInfo)
    - [SystemInfo.DB](#berty.messenger.v1.SystemInfo.DB)
    - [SystemInfo.Messenger](#berty.messenger.v1.SystemInfo.Messenger)
    - [SystemInfo.Reply](#berty.messenger.v1.SystemInfo.Reply)
    - [SystemInfo.Request](#berty.messenger.v1.SystemInfo.Request)
  
    - [AppMessage.Type](#berty.messenger.v1.AppMessage.Type)
    - [BertyLink.Kind](#berty.messenger.v1.BertyLink.Kind)
    - [Contact.State](#berty.messenger.v1.Contact.State)
    - [Conversation.Type](#berty.messenger.v1.Conversation.Type)
    - [StreamEvent.Notified.Type](#berty.messenger.v1.StreamEvent.Notified.Type)
    - [StreamEvent.Type](#berty.messenger.v1.StreamEvent.Type)
  
    - [MessengerService](#berty.messenger.v1.MessengerService)
  
- [Scalar Value Types](#scalar-value-types)

<a name="bertymessenger.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## bertymessenger.proto

<a name="berty.messenger.v1.Account"></a>

### Account

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [string](#string) |  |  |
| display_name | [string](#string) |  |  |
| avatar_cid | [string](#string) |  |  |
| link | [string](#string) |  |  |
| service_tokens | [ServiceToken](#berty.messenger.v1.ServiceToken) | repeated |  |
| replicate_new_groups_automatically | [bool](#bool) |  |  |

<a name="berty.messenger.v1.AccountGet"></a>

### AccountGet

<a name="berty.messenger.v1.AccountGet.Reply"></a>

### AccountGet.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| account | [Account](#berty.messenger.v1.Account) |  |  |

<a name="berty.messenger.v1.AccountGet.Request"></a>

### AccountGet.Request

<a name="berty.messenger.v1.AccountUpdate"></a>

### AccountUpdate

<a name="berty.messenger.v1.AccountUpdate.Reply"></a>

### AccountUpdate.Reply

<a name="berty.messenger.v1.AccountUpdate.Request"></a>

### AccountUpdate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| display_name | [string](#string) |  |  |
| avatar_cid | [string](#string) |  |  |

<a name="berty.messenger.v1.AppMessage"></a>

### AppMessage

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| type | [AppMessage.Type](#berty.messenger.v1.AppMessage.Type) |  |  |
| payload | [bytes](#bytes) |  |  |
| sent_date | [int64](#int64) |  |  |

<a name="berty.messenger.v1.AppMessage.Acknowledge"></a>

### AppMessage.Acknowledge

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| target | [string](#string) |  | TODO: optimize message size |

<a name="berty.messenger.v1.AppMessage.GroupInvitation"></a>

### AppMessage.GroupInvitation

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| link | [string](#string) |  | TODO: optimize message size |

<a name="berty.messenger.v1.AppMessage.MonitorMetadata"></a>

### AppMessage.MonitorMetadata

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event | [berty.types.v1.MonitorGroup.EventMonitor](#berty.types.v1.MonitorGroup.EventMonitor) |  |  |

<a name="berty.messenger.v1.AppMessage.ReplyOptions"></a>

### AppMessage.ReplyOptions

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| options | [ReplyOption](#berty.messenger.v1.ReplyOption) | repeated |  |

<a name="berty.messenger.v1.AppMessage.SetGroupInfo"></a>

### AppMessage.SetGroupInfo

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| display_name | [string](#string) |  |  |
| avatar_cid | [string](#string) |  | TODO: optimize message size |

<a name="berty.messenger.v1.AppMessage.SetUserInfo"></a>

### AppMessage.SetUserInfo

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| display_name | [string](#string) |  |  |
| avatar_cid | [string](#string) |  | TODO: optimize message size |

<a name="berty.messenger.v1.AppMessage.UserMessage"></a>

### AppMessage.UserMessage

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| body | [string](#string) |  |  |

<a name="berty.messenger.v1.AppMessage.UserReaction"></a>

### AppMessage.UserReaction

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| target | [string](#string) |  | TODO: optimize message size |
| emoji | [string](#string) |  |  |

<a name="berty.messenger.v1.BannerQuote"></a>

### BannerQuote

<a name="berty.messenger.v1.BannerQuote.Reply"></a>

### BannerQuote.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| quote | [string](#string) |  |  |
| author | [string](#string) |  |  |

<a name="berty.messenger.v1.BannerQuote.Request"></a>

### BannerQuote.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| random | [bool](#bool) |  |  |

<a name="berty.messenger.v1.BertyGroup"></a>

### BertyGroup

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group | [berty.types.v1.Group](#berty.types.v1.Group) |  |  |
| display_name | [string](#string) |  |  |

<a name="berty.messenger.v1.BertyID"></a>

### BertyID

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_rendezvous_seed | [bytes](#bytes) |  |  |
| account_pk | [bytes](#bytes) |  |  |
| display_name | [string](#string) |  |  |

<a name="berty.messenger.v1.BertyLink"></a>

### BertyLink

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| kind | [BertyLink.Kind](#berty.messenger.v1.BertyLink.Kind) |  |  |
| berty_id | [BertyID](#berty.messenger.v1.BertyID) |  |  |
| berty_group | [BertyGroup](#berty.messenger.v1.BertyGroup) |  | bool enc = 4; |

<a name="berty.messenger.v1.Contact"></a>

### Contact

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [string](#string) |  |  |
| conversation_public_key | [string](#string) |  |  |
| conversation | [Conversation](#berty.messenger.v1.Conversation) |  |  |
| state | [Contact.State](#berty.messenger.v1.Contact.State) |  |  |
| display_name | [string](#string) |  |  |
| avatar_cid | [string](#string) |  |  |
| created_date | [int64](#int64) |  |  |
| sent_date | [int64](#int64) |  | specific to outgoing requests |
| devices | [Device](#berty.messenger.v1.Device) | repeated |  |
| info_date | [int64](#int64) |  |  |

<a name="berty.messenger.v1.ContactAccept"></a>

### ContactAccept

<a name="berty.messenger.v1.ContactAccept.Reply"></a>

### ContactAccept.Reply

<a name="berty.messenger.v1.ContactAccept.Request"></a>

### ContactAccept.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [string](#string) |  |  |

<a name="berty.messenger.v1.ContactMetadata"></a>

### ContactMetadata

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| display_name | [string](#string) |  |  |

<a name="berty.messenger.v1.ContactRequest"></a>

### ContactRequest

<a name="berty.messenger.v1.ContactRequest.Reply"></a>

### ContactRequest.Reply

<a name="berty.messenger.v1.ContactRequest.Request"></a>

### ContactRequest.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| link | [string](#string) |  |  |

<a name="berty.messenger.v1.Conversation"></a>

### Conversation

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [string](#string) |  |  |
| type | [Conversation.Type](#berty.messenger.v1.Conversation.Type) |  |  |
| is_open | [bool](#bool) |  |  |
| display_name | [string](#string) |  |  |
| avatar_cid | [string](#string) |  |  |
| link | [string](#string) |  |  |
| unread_count | [int32](#int32) |  |  |
| last_update | [int64](#int64) |  | last_update is used to sort conversations, it should be updated for each &#34;visible&#34; event |
| contact_public_key | [string](#string) |  | specific to ContactType conversations |
| contact | [Contact](#berty.messenger.v1.Contact) |  | specific to ContactType conversations |
| members | [Member](#berty.messenger.v1.Member) | repeated | specific to MultiMemberType conversations |
| account_member_public_key | [string](#string) |  |  |
| local_device_public_key | [string](#string) |  |  |
| created_date | [int64](#int64) |  |  |
| reply_options_cid | [string](#string) |  |  |
| reply_options | [Interaction](#berty.messenger.v1.Interaction) |  |  |
| replication_info | [ConversationReplicationInfo](#berty.messenger.v1.ConversationReplicationInfo) | repeated |  |

<a name="berty.messenger.v1.ConversationClose"></a>

### ConversationClose

<a name="berty.messenger.v1.ConversationClose.Reply"></a>

### ConversationClose.Reply

<a name="berty.messenger.v1.ConversationClose.Request"></a>

### ConversationClose.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [string](#string) |  |  |

<a name="berty.messenger.v1.ConversationCreate"></a>

### ConversationCreate

<a name="berty.messenger.v1.ConversationCreate.Reply"></a>

### ConversationCreate.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [string](#string) |  |  |

<a name="berty.messenger.v1.ConversationCreate.Request"></a>

### ConversationCreate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| display_name | [string](#string) |  |  |
| contacts_to_invite | [string](#string) | repeated | public keys |

<a name="berty.messenger.v1.ConversationJoin"></a>

### ConversationJoin

<a name="berty.messenger.v1.ConversationJoin.Reply"></a>

### ConversationJoin.Reply

<a name="berty.messenger.v1.ConversationJoin.Request"></a>

### ConversationJoin.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| link | [string](#string) |  |  |

<a name="berty.messenger.v1.ConversationOpen"></a>

### ConversationOpen

<a name="berty.messenger.v1.ConversationOpen.Reply"></a>

### ConversationOpen.Reply

<a name="berty.messenger.v1.ConversationOpen.Request"></a>

### ConversationOpen.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [string](#string) |  |  |

<a name="berty.messenger.v1.ConversationReplicationInfo"></a>

### ConversationReplicationInfo

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| cid | [string](#string) |  |  |
| conversation_public_key | [string](#string) |  |  |
| member_public_key | [string](#string) |  |  |
| authentication_url | [string](#string) |  |  |
| replication_server | [string](#string) |  |  |

<a name="berty.messenger.v1.ConversationStream"></a>

### ConversationStream

<a name="berty.messenger.v1.ConversationStream.Reply"></a>

### ConversationStream.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| conversation | [Conversation](#berty.messenger.v1.Conversation) |  |  |

<a name="berty.messenger.v1.ConversationStream.Request"></a>

### ConversationStream.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| count | [uint64](#uint64) |  |  |
| page | [uint64](#uint64) |  |  |

<a name="berty.messenger.v1.DevShareInstanceBertyID"></a>

### DevShareInstanceBertyID

<a name="berty.messenger.v1.DevShareInstanceBertyID.Reply"></a>

### DevShareInstanceBertyID.Reply

<a name="berty.messenger.v1.DevShareInstanceBertyID.Request"></a>

### DevShareInstanceBertyID.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| reset | [bool](#bool) |  | reset will regenerate a new link |
| display_name | [string](#string) |  |  |

<a name="berty.messenger.v1.Device"></a>

### Device

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [string](#string) |  |  |
| member_public_key | [string](#string) |  |  |

<a name="berty.messenger.v1.EchoTest"></a>

### EchoTest

<a name="berty.messenger.v1.EchoTest.Reply"></a>

### EchoTest.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| echo | [string](#string) |  |  |

<a name="berty.messenger.v1.EchoTest.Request"></a>

### EchoTest.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| delay | [uint64](#uint64) |  | in ms |
| echo | [string](#string) |  |  |

<a name="berty.messenger.v1.EventStream"></a>

### EventStream

<a name="berty.messenger.v1.EventStream.Reply"></a>

### EventStream.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| event | [StreamEvent](#berty.messenger.v1.StreamEvent) |  |  |

<a name="berty.messenger.v1.EventStream.Request"></a>

### EventStream.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| count | [uint64](#uint64) |  |  |
| page | [uint64](#uint64) |  |  |

<a name="berty.messenger.v1.GetUsername"></a>

### GetUsername

<a name="berty.messenger.v1.GetUsername.Reply"></a>

### GetUsername.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| username | [string](#string) |  |  |

<a name="berty.messenger.v1.GetUsername.Request"></a>

### GetUsername.Request

<a name="berty.messenger.v1.InstanceExportData"></a>

### InstanceExportData

<a name="berty.messenger.v1.InstanceExportData.Reply"></a>

### InstanceExportData.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| exported_data | [bytes](#bytes) |  |  |

<a name="berty.messenger.v1.InstanceExportData.Request"></a>

### InstanceExportData.Request

<a name="berty.messenger.v1.InstanceShareableBertyID"></a>

### InstanceShareableBertyID

<a name="berty.messenger.v1.InstanceShareableBertyID.Reply"></a>

### InstanceShareableBertyID.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| link | [BertyLink](#berty.messenger.v1.BertyLink) |  |  |
| internal_url | [string](#string) |  |  |
| web_url | [string](#string) |  |  |

<a name="berty.messenger.v1.InstanceShareableBertyID.Request"></a>

### InstanceShareableBertyID.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| reset | [bool](#bool) |  | reset will regenerate a new link |
| display_name | [string](#string) |  |  |

<a name="berty.messenger.v1.Interact"></a>

### Interact

<a name="berty.messenger.v1.Interact.Reply"></a>

### Interact.Reply
TODO: return cid

<a name="berty.messenger.v1.Interact.Request"></a>

### Interact.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| type | [AppMessage.Type](#berty.messenger.v1.AppMessage.Type) |  |  |
| payload | [bytes](#bytes) |  |  |
| conversation_public_key | [string](#string) |  |  |

<a name="berty.messenger.v1.Interaction"></a>

### Interaction

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| cid | [string](#string) |  |  |
| type | [AppMessage.Type](#berty.messenger.v1.AppMessage.Type) |  |  |
| member_public_key | [string](#string) |  |  |
| device_public_key | [string](#string) |  |  |
| member | [Member](#berty.messenger.v1.Member) |  |  |
| conversation_public_key | [string](#string) |  |  |
| conversation | [Conversation](#berty.messenger.v1.Conversation) |  |  |
| payload | [bytes](#bytes) |  |  |
| is_me | [bool](#bool) |  |  |
| sent_date | [int64](#int64) |  |  |
| acknowledged | [bool](#bool) |  |  |
| target_cid | [string](#string) |  |  |

<a name="berty.messenger.v1.LocalConversationState"></a>

### LocalConversationState

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [string](#string) |  |  |
| unread_count | [int32](#int32) |  |  |
| is_open | [bool](#bool) |  |  |
| type | [Conversation.Type](#berty.messenger.v1.Conversation.Type) |  |  |

<a name="berty.messenger.v1.LocalDatabaseState"></a>

### LocalDatabaseState

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [string](#string) |  |  |
| display_name | [string](#string) |  |  |
| replicate_flag | [bool](#bool) |  |  |
| local_conversations_state | [LocalConversationState](#berty.messenger.v1.LocalConversationState) | repeated |  |
| account_link | [string](#string) |  |  |

<a name="berty.messenger.v1.Member"></a>

### Member
Composite primary key

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [string](#string) |  |  |
| display_name | [string](#string) |  |  |
| avatar_cid | [string](#string) |  |  |
| conversation_public_key | [string](#string) |  |  |
| info_date | [int64](#int64) |  |  |
| conversation | [Conversation](#berty.messenger.v1.Conversation) |  |  |
| devices | [Device](#berty.messenger.v1.Device) | repeated |  |

<a name="berty.messenger.v1.ParseDeepLink"></a>

### ParseDeepLink

<a name="berty.messenger.v1.ParseDeepLink.Reply"></a>

### ParseDeepLink.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| link | [BertyLink](#berty.messenger.v1.BertyLink) |  |  |

<a name="berty.messenger.v1.ParseDeepLink.Request"></a>

### ParseDeepLink.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| link | [string](#string) |  |  |

<a name="berty.messenger.v1.ReplicationServiceRegisterGroup"></a>

### ReplicationServiceRegisterGroup

<a name="berty.messenger.v1.ReplicationServiceRegisterGroup.Reply"></a>

### ReplicationServiceRegisterGroup.Reply

<a name="berty.messenger.v1.ReplicationServiceRegisterGroup.Request"></a>

### ReplicationServiceRegisterGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| token_id | [string](#string) |  |  |
| conversation_public_key | [string](#string) |  |  |

<a name="berty.messenger.v1.ReplicationSetAutoEnable"></a>

### ReplicationSetAutoEnable

<a name="berty.messenger.v1.ReplicationSetAutoEnable.Reply"></a>

### ReplicationSetAutoEnable.Reply

<a name="berty.messenger.v1.ReplicationSetAutoEnable.Request"></a>

### ReplicationSetAutoEnable.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| enabled | [bool](#bool) |  |  |

<a name="berty.messenger.v1.ReplyOption"></a>

### ReplyOption

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| display | [string](#string) |  |  |
| payload | [string](#string) |  |  |

<a name="berty.messenger.v1.SendAck"></a>

### SendAck

<a name="berty.messenger.v1.SendAck.Reply"></a>

### SendAck.Reply

<a name="berty.messenger.v1.SendAck.Request"></a>

### SendAck.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  |  |
| message_id | [bytes](#bytes) |  |  |

<a name="berty.messenger.v1.SendContactRequest"></a>

### SendContactRequest

<a name="berty.messenger.v1.SendContactRequest.Reply"></a>

### SendContactRequest.Reply

<a name="berty.messenger.v1.SendContactRequest.Request"></a>

### SendContactRequest.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| berty_id | [BertyID](#berty.messenger.v1.BertyID) |  |  |
| metadata | [bytes](#bytes) |  |  |
| own_metadata | [bytes](#bytes) |  |  |

<a name="berty.messenger.v1.SendMessage"></a>

### SendMessage

<a name="berty.messenger.v1.SendMessage.Reply"></a>

### SendMessage.Reply

<a name="berty.messenger.v1.SendMessage.Request"></a>

### SendMessage.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  |  |
| message | [string](#string) |  |  |

<a name="berty.messenger.v1.SendReplyOptions"></a>

### SendReplyOptions

<a name="berty.messenger.v1.SendReplyOptions.Reply"></a>

### SendReplyOptions.Reply

<a name="berty.messenger.v1.SendReplyOptions.Request"></a>

### SendReplyOptions.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  |  |
| options | [AppMessage.ReplyOptions](#berty.messenger.v1.AppMessage.ReplyOptions) |  |  |

<a name="berty.messenger.v1.ServiceToken"></a>

### ServiceToken

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| account_pk | [string](#string) |  |  |
| token_id | [string](#string) |  |  |
| service_type | [string](#string) |  |  |
| authentication_url | [string](#string) |  |  |
| expiration | [int64](#int64) |  |  |

<a name="berty.messenger.v1.ShareableBertyGroup"></a>

### ShareableBertyGroup

<a name="berty.messenger.v1.ShareableBertyGroup.Reply"></a>

### ShareableBertyGroup.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| link | [BertyLink](#berty.messenger.v1.BertyLink) |  |  |
| internal_url | [string](#string) |  |  |
| web_url | [string](#string) |  |  |

<a name="berty.messenger.v1.ShareableBertyGroup.Request"></a>

### ShareableBertyGroup.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| group_pk | [bytes](#bytes) |  |  |
| group_name | [string](#string) |  |  |

<a name="berty.messenger.v1.StreamEvent"></a>

### StreamEvent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| type | [StreamEvent.Type](#berty.messenger.v1.StreamEvent.Type) |  |  |
| payload | [bytes](#bytes) |  |  |
| is_new | [bool](#bool) |  | specific to &#34;*Updated&#34; events |

<a name="berty.messenger.v1.StreamEvent.AccountUpdated"></a>

### StreamEvent.AccountUpdated

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| account | [Account](#berty.messenger.v1.Account) |  |  |

<a name="berty.messenger.v1.StreamEvent.ContactUpdated"></a>

### StreamEvent.ContactUpdated

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact | [Contact](#berty.messenger.v1.Contact) |  |  |

<a name="berty.messenger.v1.StreamEvent.ConversationDeleted"></a>

### StreamEvent.ConversationDeleted

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| public_key | [string](#string) |  |  |

<a name="berty.messenger.v1.StreamEvent.ConversationUpdated"></a>

### StreamEvent.ConversationUpdated

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| conversation | [Conversation](#berty.messenger.v1.Conversation) |  |  |

<a name="berty.messenger.v1.StreamEvent.DeviceUpdated"></a>

### StreamEvent.DeviceUpdated

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| device | [Device](#berty.messenger.v1.Device) |  |  |

<a name="berty.messenger.v1.StreamEvent.InteractionDeleted"></a>

### StreamEvent.InteractionDeleted

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| cid | [string](#string) |  |  |

<a name="berty.messenger.v1.StreamEvent.InteractionUpdated"></a>

### StreamEvent.InteractionUpdated

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| interaction | [Interaction](#berty.messenger.v1.Interaction) |  |  |

<a name="berty.messenger.v1.StreamEvent.ListEnded"></a>

### StreamEvent.ListEnded

<a name="berty.messenger.v1.StreamEvent.MemberUpdated"></a>

### StreamEvent.MemberUpdated

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| member | [Member](#berty.messenger.v1.Member) |  |  |

<a name="berty.messenger.v1.StreamEvent.Notified"></a>

### StreamEvent.Notified

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| type | [StreamEvent.Notified.Type](#berty.messenger.v1.StreamEvent.Notified.Type) |  |  |
| title | [string](#string) |  |  |
| body | [string](#string) |  |  |
| payload | [bytes](#bytes) |  |  |

<a name="berty.messenger.v1.StreamEvent.Notified.Basic"></a>

### StreamEvent.Notified.Basic

<a name="berty.messenger.v1.StreamEvent.Notified.ContactRequestReceived"></a>

### StreamEvent.Notified.ContactRequestReceived

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact | [Contact](#berty.messenger.v1.Contact) |  |  |

<a name="berty.messenger.v1.StreamEvent.Notified.ContactRequestSent"></a>

### StreamEvent.Notified.ContactRequestSent

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact | [Contact](#berty.messenger.v1.Contact) |  |  |

<a name="berty.messenger.v1.StreamEvent.Notified.MessageReceived"></a>

### StreamEvent.Notified.MessageReceived

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| interaction | [Interaction](#berty.messenger.v1.Interaction) |  |  |
| conversation | [Conversation](#berty.messenger.v1.Conversation) |  |  |
| contact | [Contact](#berty.messenger.v1.Contact) |  |  |

<a name="berty.messenger.v1.SystemInfo"></a>

### SystemInfo

<a name="berty.messenger.v1.SystemInfo.DB"></a>

### SystemInfo.DB

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| accounts | [int64](#int64) |  |  |
| contacts | [int64](#int64) |  |  |
| conversations | [int64](#int64) |  |  |
| interactions | [int64](#int64) |  |  |
| members | [int64](#int64) |  |  |
| devices | [int64](#int64) |  |  |
| service_tokens | [int64](#int64) |  |  |
| conversation_replication_info | [int64](#int64) |  | older, more recent |

<a name="berty.messenger.v1.SystemInfo.Messenger"></a>

### SystemInfo.Messenger

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| process | [berty.types.v1.SystemInfo.Process](#berty.types.v1.SystemInfo.Process) |  |  |
| warns | [string](#string) | repeated |  |
| protocol_in_same_process | [bool](#bool) |  |  |
| db | [SystemInfo.DB](#berty.messenger.v1.SystemInfo.DB) |  |  |

<a name="berty.messenger.v1.SystemInfo.Reply"></a>

### SystemInfo.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| protocol | [berty.types.v1.SystemInfo.Reply](#berty.types.v1.SystemInfo.Reply) |  |  |
| messenger | [SystemInfo.Messenger](#berty.messenger.v1.SystemInfo.Messenger) |  |  |

<a name="berty.messenger.v1.SystemInfo.Request"></a>

### SystemInfo.Request

 

<a name="berty.messenger.v1.AppMessage.Type"></a>

### AppMessage.Type

| Name | Number | Description |
| ---- | ------ | ----------- |
| Undefined | 0 |  |
| TypeUserMessage | 1 |  |
| TypeUserReaction | 2 |  |
| TypeGroupInvitation | 3 |  |
| TypeSetGroupInfo | 4 |  |
| TypeSetUserInfo | 5 |  |
| TypeAcknowledge | 6 |  |
| TypeReplyOptions | 7 |  |
| TypeMonitorMetadata | 8 |  |

<a name="berty.messenger.v1.BertyLink.Kind"></a>

### BertyLink.Kind

| Name | Number | Description |
| ---- | ------ | ----------- |
| UnknownKind | 0 |  |
| ContactInviteV1Kind | 1 |  |
| GroupV1Kind | 2 |  |

<a name="berty.messenger.v1.Contact.State"></a>

### Contact.State

| Name | Number | Description |
| ---- | ------ | ----------- |
| Undefined | 0 |  |
| IncomingRequest | 1 |  |
| OutgoingRequestEnqueued | 2 |  |
| OutgoingRequestSent | 3 |  |
| Accepted | 4 |  |

<a name="berty.messenger.v1.Conversation.Type"></a>

### Conversation.Type

| Name | Number | Description |
| ---- | ------ | ----------- |
| Undefined | 0 |  |
| AccountType | 1 |  |
| ContactType | 2 |  |
| MultiMemberType | 3 |  |

<a name="berty.messenger.v1.StreamEvent.Notified.Type"></a>

### StreamEvent.Notified.Type

| Name | Number | Description |
| ---- | ------ | ----------- |
| Unknown | 0 |  |
| TypeBasic | 1 |  |
| TypeMessageReceived | 2 |  |
| TypeContactRequestSent | 3 |  |
| TypeContactRequestReceived | 4 |  |

<a name="berty.messenger.v1.StreamEvent.Type"></a>

### StreamEvent.Type

| Name | Number | Description |
| ---- | ------ | ----------- |
| Undefined | 0 |  |
| TypeListEnded | 1 |  |
| TypeConversationUpdated | 2 |  |
| TypeConversationDeleted | 3 |  |
| TypeInteractionUpdated | 4 |  |
| TypeInteractionDeleted | 5 |  |
| TypeContactUpdated | 6 |  |
| TypeAccountUpdated | 7 |  |
| TypeMemberUpdated | 8 |  |
| TypeDeviceUpdated | 9 |  |
| TypeNotified | 10 |  |

 

 

<a name="berty.messenger.v1.MessengerService"></a>

### MessengerService
MessengerService is the top-level API that uses the Berty Protocol to implement the Berty Messenger specific logic.
Today, most of the Berty Messenger logic is implemented directly in the application (see the /js folder of this repo).

| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| InstanceShareableBertyID | [InstanceShareableBertyID.Request](#berty.messenger.v1.InstanceShareableBertyID.Request) | [InstanceShareableBertyID.Reply](#berty.messenger.v1.InstanceShareableBertyID.Reply) | InstanceShareableBertyID returns a Berty ID that can be shared as a string, QR code or deep link. |
| ShareableBertyGroup | [ShareableBertyGroup.Request](#berty.messenger.v1.ShareableBertyGroup.Request) | [ShareableBertyGroup.Reply](#berty.messenger.v1.ShareableBertyGroup.Reply) | ShareableBertyGroup returns a Berty Group that can be shared as a string, QR code or deep link. |
| DevShareInstanceBertyID | [DevShareInstanceBertyID.Request](#berty.messenger.v1.DevShareInstanceBertyID.Request) | [DevShareInstanceBertyID.Reply](#berty.messenger.v1.DevShareInstanceBertyID.Reply) | DevShareInstanceBertyID shares your Berty ID on a dev channel. TODO: remove for public. |
| ParseDeepLink | [ParseDeepLink.Request](#berty.messenger.v1.ParseDeepLink.Request) | [ParseDeepLink.Reply](#berty.messenger.v1.ParseDeepLink.Reply) | ParseDeepLink parses a link in the form of berty://xxx or https://berty.tech/id# and returns a structure that can be used to display information. This action is read-only. |
| SendContactRequest | [SendContactRequest.Request](#berty.messenger.v1.SendContactRequest.Request) | [SendContactRequest.Reply](#berty.messenger.v1.SendContactRequest.Reply) | SendContactRequest takes the payload received from ParseDeepLink and send a contact request using the Berty Protocol. |
| SendMessage | [SendMessage.Request](#berty.messenger.v1.SendMessage.Request) | [SendMessage.Reply](#berty.messenger.v1.SendMessage.Reply) | SendMessage sends a message to a group. |
| SendReplyOptions | [SendReplyOptions.Request](#berty.messenger.v1.SendReplyOptions.Request) | [SendReplyOptions.Reply](#berty.messenger.v1.SendReplyOptions.Reply) | SendReplyOptions sends a list of prefilled response options to a group. |
| SendAck | [SendAck.Request](#berty.messenger.v1.SendAck.Request) | [SendAck.Reply](#berty.messenger.v1.SendAck.Reply) | SendAck sends an acknowledge payload for given message id. |
| SystemInfo | [SystemInfo.Request](#berty.messenger.v1.SystemInfo.Request) | [SystemInfo.Reply](#berty.messenger.v1.SystemInfo.Reply) | SystemInfo returns runtime information. |
| EchoTest | [EchoTest.Request](#berty.messenger.v1.EchoTest.Request) | [EchoTest.Reply](#berty.messenger.v1.EchoTest.Reply) stream | Use to test stream. |
| ConversationStream | [ConversationStream.Request](#berty.messenger.v1.ConversationStream.Request) | [ConversationStream.Reply](#berty.messenger.v1.ConversationStream.Reply) stream |  |
| EventStream | [EventStream.Request](#berty.messenger.v1.EventStream.Request) | [EventStream.Reply](#berty.messenger.v1.EventStream.Reply) stream |  |
| ConversationCreate | [ConversationCreate.Request](#berty.messenger.v1.ConversationCreate.Request) | [ConversationCreate.Reply](#berty.messenger.v1.ConversationCreate.Reply) |  |
| ConversationJoin | [ConversationJoin.Request](#berty.messenger.v1.ConversationJoin.Request) | [ConversationJoin.Reply](#berty.messenger.v1.ConversationJoin.Reply) |  |
| AccountGet | [AccountGet.Request](#berty.messenger.v1.AccountGet.Request) | [AccountGet.Reply](#berty.messenger.v1.AccountGet.Reply) |  |
| AccountUpdate | [AccountUpdate.Request](#berty.messenger.v1.AccountUpdate.Request) | [AccountUpdate.Reply](#berty.messenger.v1.AccountUpdate.Reply) |  |
| ContactRequest | [ContactRequest.Request](#berty.messenger.v1.ContactRequest.Request) | [ContactRequest.Reply](#berty.messenger.v1.ContactRequest.Reply) |  |
| ContactAccept | [ContactAccept.Request](#berty.messenger.v1.ContactAccept.Request) | [ContactAccept.Reply](#berty.messenger.v1.ContactAccept.Reply) |  |
| Interact | [Interact.Request](#berty.messenger.v1.Interact.Request) | [Interact.Reply](#berty.messenger.v1.Interact.Reply) |  |
| ConversationOpen | [ConversationOpen.Request](#berty.messenger.v1.ConversationOpen.Request) | [ConversationOpen.Reply](#berty.messenger.v1.ConversationOpen.Reply) |  |
| ConversationClose | [ConversationClose.Request](#berty.messenger.v1.ConversationClose.Request) | [ConversationClose.Reply](#berty.messenger.v1.ConversationClose.Reply) |  |
| ServicesTokenList | [.berty.types.v1.ServicesTokenList.Request](#berty.types.v1.ServicesTokenList.Request) | [.berty.types.v1.ServicesTokenList.Reply](#berty.types.v1.ServicesTokenList.Reply) stream | ServicesTokenList Retrieves the list of service server tokens |
| ReplicationServiceRegisterGroup | [ReplicationServiceRegisterGroup.Request](#berty.messenger.v1.ReplicationServiceRegisterGroup.Request) | [ReplicationServiceRegisterGroup.Reply](#berty.messenger.v1.ReplicationServiceRegisterGroup.Reply) | ReplicationServiceRegisterGroup Asks a replication service to distribute a group contents |
| ReplicationSetAutoEnable | [ReplicationSetAutoEnable.Request](#berty.messenger.v1.ReplicationSetAutoEnable.Request) | [ReplicationSetAutoEnable.Reply](#berty.messenger.v1.ReplicationSetAutoEnable.Reply) | ReplicationSetAutoEnable Sets whether new groups should be replicated automatically or not |
| BannerQuote | [BannerQuote.Request](#berty.messenger.v1.BannerQuote.Request) | [BannerQuote.Reply](#berty.messenger.v1.BannerQuote.Reply) | BannerQuote returns the quote of the day. |
| GetUsername | [GetUsername.Request](#berty.messenger.v1.GetUsername.Request) | [GetUsername.Reply](#berty.messenger.v1.GetUsername.Reply) | GetUsername returns the name of the device/user using Android/iOS/universal API |
| InstanceExportData | [InstanceExportData.Request](#berty.messenger.v1.InstanceExportData.Request) | [InstanceExportData.Reply](#berty.messenger.v1.InstanceExportData.Reply) stream | InstanceExportData exports instance data |

 

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

