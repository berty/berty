# Protocol Documentation
<a name="top"></a>

## Table of Contents

- [bertychat.proto](#bertychat.proto)
    - [AccountClose](#berty.chat.AccountClose)
    - [AccountClose.Reply](#berty.chat.AccountClose.Reply)
    - [AccountClose.Request](#berty.chat.AccountClose.Request)
    - [AccountCreate](#berty.chat.AccountCreate)
    - [AccountCreate.Reply](#berty.chat.AccountCreate.Reply)
    - [AccountCreate.Request](#berty.chat.AccountCreate.Request)
    - [AccountGet](#berty.chat.AccountGet)
    - [AccountGet.Reply](#berty.chat.AccountGet.Reply)
    - [AccountGet.Request](#berty.chat.AccountGet.Request)
    - [AccountList](#berty.chat.AccountList)
    - [AccountList.Reply](#berty.chat.AccountList.Reply)
    - [AccountList.Request](#berty.chat.AccountList.Request)
    - [AccountOpen](#berty.chat.AccountOpen)
    - [AccountOpen.Reply](#berty.chat.AccountOpen.Reply)
    - [AccountOpen.Request](#berty.chat.AccountOpen.Request)
    - [AccountPairingInvitationCreate](#berty.chat.AccountPairingInvitationCreate)
    - [AccountPairingInvitationCreate.Reply](#berty.chat.AccountPairingInvitationCreate.Reply)
    - [AccountPairingInvitationCreate.Request](#berty.chat.AccountPairingInvitationCreate.Request)
    - [AccountRemove](#berty.chat.AccountRemove)
    - [AccountRemove.Reply](#berty.chat.AccountRemove.Reply)
    - [AccountRemove.Request](#berty.chat.AccountRemove.Request)
    - [AccountRenewIncomingContactRequestLink](#berty.chat.AccountRenewIncomingContactRequestLink)
    - [AccountRenewIncomingContactRequestLink.Reply](#berty.chat.AccountRenewIncomingContactRequestLink.Reply)
    - [AccountRenewIncomingContactRequestLink.Request](#berty.chat.AccountRenewIncomingContactRequestLink.Request)
    - [AccountUpdate](#berty.chat.AccountUpdate)
    - [AccountUpdate.Reply](#berty.chat.AccountUpdate.Reply)
    - [AccountUpdate.Request](#berty.chat.AccountUpdate.Request)
    - [ContactBlock](#berty.chat.ContactBlock)
    - [ContactBlock.Reply](#berty.chat.ContactBlock.Reply)
    - [ContactBlock.Request](#berty.chat.ContactBlock.Request)
    - [ContactGet](#berty.chat.ContactGet)
    - [ContactGet.Reply](#berty.chat.ContactGet.Reply)
    - [ContactGet.Request](#berty.chat.ContactGet.Request)
    - [ContactList](#berty.chat.ContactList)
    - [ContactList.Reply](#berty.chat.ContactList.Reply)
    - [ContactList.Request](#berty.chat.ContactList.Request)
    - [ContactRemove](#berty.chat.ContactRemove)
    - [ContactRemove.Reply](#berty.chat.ContactRemove.Reply)
    - [ContactRemove.Request](#berty.chat.ContactRemove.Request)
    - [ContactRequestAccept](#berty.chat.ContactRequestAccept)
    - [ContactRequestAccept.Reply](#berty.chat.ContactRequestAccept.Reply)
    - [ContactRequestAccept.Request](#berty.chat.ContactRequestAccept.Request)
    - [ContactRequestDecline](#berty.chat.ContactRequestDecline)
    - [ContactRequestDecline.Reply](#berty.chat.ContactRequestDecline.Reply)
    - [ContactRequestDecline.Request](#berty.chat.ContactRequestDecline.Request)
    - [ContactRequestSend](#berty.chat.ContactRequestSend)
    - [ContactRequestSend.Reply](#berty.chat.ContactRequestSend.Reply)
    - [ContactRequestSend.Request](#berty.chat.ContactRequestSend.Request)
    - [ConversationCreate](#berty.chat.ConversationCreate)
    - [ConversationCreate.Reply](#berty.chat.ConversationCreate.Reply)
    - [ConversationCreate.Request](#berty.chat.ConversationCreate.Request)
    - [ConversationErase](#berty.chat.ConversationErase)
    - [ConversationErase.Reply](#berty.chat.ConversationErase.Reply)
    - [ConversationErase.Request](#berty.chat.ConversationErase.Request)
    - [ConversationGet](#berty.chat.ConversationGet)
    - [ConversationGet.Reply](#berty.chat.ConversationGet.Reply)
    - [ConversationGet.Request](#berty.chat.ConversationGet.Request)
    - [ConversationInvitationAccept](#berty.chat.ConversationInvitationAccept)
    - [ConversationInvitationAccept.Reply](#berty.chat.ConversationInvitationAccept.Reply)
    - [ConversationInvitationAccept.Request](#berty.chat.ConversationInvitationAccept.Request)
    - [ConversationInvitationDecline](#berty.chat.ConversationInvitationDecline)
    - [ConversationInvitationDecline.Reply](#berty.chat.ConversationInvitationDecline.Reply)
    - [ConversationInvitationDecline.Request](#berty.chat.ConversationInvitationDecline.Request)
    - [ConversationInvitationSend](#berty.chat.ConversationInvitationSend)
    - [ConversationInvitationSend.Reply](#berty.chat.ConversationInvitationSend.Reply)
    - [ConversationInvitationSend.Request](#berty.chat.ConversationInvitationSend.Request)
    - [ConversationLeave](#berty.chat.ConversationLeave)
    - [ConversationLeave.Reply](#berty.chat.ConversationLeave.Reply)
    - [ConversationLeave.Request](#berty.chat.ConversationLeave.Request)
    - [ConversationList](#berty.chat.ConversationList)
    - [ConversationList.Reply](#berty.chat.ConversationList.Reply)
    - [ConversationList.Request](#berty.chat.ConversationList.Request)
    - [ConversationMute](#berty.chat.ConversationMute)
    - [ConversationMute.Reply](#berty.chat.ConversationMute.Reply)
    - [ConversationMute.Request](#berty.chat.ConversationMute.Request)
    - [ConversationUpdate](#berty.chat.ConversationUpdate)
    - [ConversationUpdate.Reply](#berty.chat.ConversationUpdate.Reply)
    - [ConversationUpdate.Request](#berty.chat.ConversationUpdate.Request)
    - [DevEventSubscribe](#berty.chat.DevEventSubscribe)
    - [DevEventSubscribe.Reply](#berty.chat.DevEventSubscribe.Reply)
    - [DevEventSubscribe.Request](#berty.chat.DevEventSubscribe.Request)
    - [EventSubscribe](#berty.chat.EventSubscribe)
    - [EventSubscribe.Reply](#berty.chat.EventSubscribe.Reply)
    - [EventSubscribe.Request](#berty.chat.EventSubscribe.Request)
    - [MemberGet](#berty.chat.MemberGet)
    - [MemberGet.Reply](#berty.chat.MemberGet.Reply)
    - [MemberGet.Request](#berty.chat.MemberGet.Request)
    - [MemberList](#berty.chat.MemberList)
    - [MemberList.Reply](#berty.chat.MemberList.Reply)
    - [MemberList.Request](#berty.chat.MemberList.Request)
    - [MessageEdit](#berty.chat.MessageEdit)
    - [MessageEdit.Reply](#berty.chat.MessageEdit.Reply)
    - [MessageEdit.Request](#berty.chat.MessageEdit.Request)
    - [MessageGet](#berty.chat.MessageGet)
    - [MessageGet.Reply](#berty.chat.MessageGet.Reply)
    - [MessageGet.Request](#berty.chat.MessageGet.Request)
    - [MessageHide](#berty.chat.MessageHide)
    - [MessageHide.Reply](#berty.chat.MessageHide.Reply)
    - [MessageHide.Request](#berty.chat.MessageHide.Request)
    - [MessageList](#berty.chat.MessageList)
    - [MessageList.Reply](#berty.chat.MessageList.Reply)
    - [MessageList.Request](#berty.chat.MessageList.Request)
    - [MessageReact](#berty.chat.MessageReact)
    - [MessageReact.Reply](#berty.chat.MessageReact.Reply)
    - [MessageReact.Request](#berty.chat.MessageReact.Request)
    - [MessageRead](#berty.chat.MessageRead)
    - [MessageRead.Reply](#berty.chat.MessageRead.Reply)
    - [MessageRead.Request](#berty.chat.MessageRead.Request)
    - [MessageSend](#berty.chat.MessageSend)
    - [MessageSend.Reply](#berty.chat.MessageSend.Reply)
    - [MessageSend.Request](#berty.chat.MessageSend.Request)
    - [Search](#berty.chat.Search)
    - [Search.Reply](#berty.chat.Search.Reply)
    - [Search.Request](#berty.chat.Search.Request)
  
  
  
    - [ChatService](#berty.chat.ChatService)
  

- [chatmodel.proto](#chatmodel.proto)
    - [Account](#berty.chatmodel.Account)
    - [Attachment](#berty.chatmodel.Attachment)
    - [Contact](#berty.chatmodel.Contact)
    - [Conversation](#berty.chatmodel.Conversation)
    - [Device](#berty.chatmodel.Device)
    - [Member](#berty.chatmodel.Member)
    - [Message](#berty.chatmodel.Message)
    - [Message.Body](#berty.chatmodel.Message.Body)
    - [Reaction](#berty.chatmodel.Reaction)
  
    - [Contact.Kind](#berty.chatmodel.Contact.Kind)
    - [Conversation.Kind](#berty.chatmodel.Conversation.Kind)
    - [Device.Kind](#berty.chatmodel.Device.Kind)
    - [Member.MutePolicy](#berty.chatmodel.Member.MutePolicy)
    - [Member.Role](#berty.chatmodel.Member.Role)
    - [Message.Kind](#berty.chatmodel.Message.Kind)
    - [Message.State](#berty.chatmodel.Message.State)
  
  
  

- [Scalar Value Types](#scalar-value-types)

<a name="bertychat.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## bertychat.proto

<a name="berty.chat.AccountClose"></a>

### AccountClose

<a name="berty.chat.AccountClose.Reply"></a>

### AccountClose.Reply

<a name="berty.chat.AccountClose.Request"></a>

### AccountClose.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.AccountCreate"></a>

### AccountCreate

<a name="berty.chat.AccountCreate.Reply"></a>

### AccountCreate.Reply

<a name="berty.chat.AccountCreate.Request"></a>

### AccountCreate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| name | [string](#string) |  |  |

<a name="berty.chat.AccountGet"></a>

### AccountGet

<a name="berty.chat.AccountGet.Reply"></a>

### AccountGet.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| account | [berty.chatmodel.Account](#berty.chatmodel.Account) |  |  |

<a name="berty.chat.AccountGet.Request"></a>

### AccountGet.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.AccountList"></a>

### AccountList

<a name="berty.chat.AccountList.Reply"></a>

### AccountList.Reply
streamed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| account | [berty.chatmodel.Account](#berty.chatmodel.Account) |  |  |

<a name="berty.chat.AccountList.Request"></a>

### AccountList.Request

<a name="berty.chat.AccountOpen"></a>

### AccountOpen

<a name="berty.chat.AccountOpen.Reply"></a>

### AccountOpen.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| token | [bytes](#bytes) |  |  |

<a name="berty.chat.AccountOpen.Request"></a>

### AccountOpen.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |
| pin | [string](#string) |  |  |

<a name="berty.chat.AccountPairingInvitationCreate"></a>

### AccountPairingInvitationCreate

<a name="berty.chat.AccountPairingInvitationCreate.Reply"></a>

### AccountPairingInvitationCreate.Reply

<a name="berty.chat.AccountPairingInvitationCreate.Request"></a>

### AccountPairingInvitationCreate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.AccountRemove"></a>

### AccountRemove

<a name="berty.chat.AccountRemove.Reply"></a>

### AccountRemove.Reply

<a name="berty.chat.AccountRemove.Request"></a>

### AccountRemove.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.AccountRenewIncomingContactRequestLink"></a>

### AccountRenewIncomingContactRequestLink

<a name="berty.chat.AccountRenewIncomingContactRequestLink.Reply"></a>

### AccountRenewIncomingContactRequestLink.Reply

<a name="berty.chat.AccountRenewIncomingContactRequestLink.Request"></a>

### AccountRenewIncomingContactRequestLink.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.AccountUpdate"></a>

### AccountUpdate

<a name="berty.chat.AccountUpdate.Reply"></a>

### AccountUpdate.Reply

<a name="berty.chat.AccountUpdate.Request"></a>

### AccountUpdate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |
| name | [string](#string) |  |  |
| status_emoji | [string](#string) |  |  |
| status_text | [string](#string) |  |  |

<a name="berty.chat.ContactBlock"></a>

### ContactBlock

<a name="berty.chat.ContactBlock.Reply"></a>

### ContactBlock.Reply

<a name="berty.chat.ContactBlock.Request"></a>

### ContactBlock.Request

<a name="berty.chat.ContactGet"></a>

### ContactGet

<a name="berty.chat.ContactGet.Reply"></a>

### ContactGet.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact | [berty.chatmodel.Contact](#berty.chatmodel.Contact) |  |  |

<a name="berty.chat.ContactGet.Request"></a>

### ContactGet.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.ContactList"></a>

### ContactList

<a name="berty.chat.ContactList.Reply"></a>

### ContactList.Reply
streamed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| contact | [berty.chatmodel.Contact](#berty.chatmodel.Contact) |  |  |

<a name="berty.chat.ContactList.Request"></a>

### ContactList.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| filter | [berty.chatmodel.Contact](#berty.chatmodel.Contact) |  |  |

<a name="berty.chat.ContactRemove"></a>

### ContactRemove

<a name="berty.chat.ContactRemove.Reply"></a>

### ContactRemove.Reply

<a name="berty.chat.ContactRemove.Request"></a>

### ContactRemove.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.ContactRequestAccept"></a>

### ContactRequestAccept

<a name="berty.chat.ContactRequestAccept.Reply"></a>

### ContactRequestAccept.Reply

<a name="berty.chat.ContactRequestAccept.Request"></a>

### ContactRequestAccept.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.ContactRequestDecline"></a>

### ContactRequestDecline

<a name="berty.chat.ContactRequestDecline.Reply"></a>

### ContactRequestDecline.Reply

<a name="berty.chat.ContactRequestDecline.Request"></a>

### ContactRequestDecline.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.ContactRequestSend"></a>

### ContactRequestSend

<a name="berty.chat.ContactRequestSend.Reply"></a>

### ContactRequestSend.Reply

<a name="berty.chat.ContactRequestSend.Request"></a>

### ContactRequestSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.ConversationCreate"></a>

### ConversationCreate

<a name="berty.chat.ConversationCreate.Reply"></a>

### ConversationCreate.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| conversation | [berty.chatmodel.Conversation](#berty.chatmodel.Conversation) |  |  |

<a name="berty.chat.ConversationCreate.Request"></a>

### ConversationCreate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| title | [string](#string) |  |  |
| topic | [string](#string) |  |  |
| avatar_uri | [string](#string) |  |  |

<a name="berty.chat.ConversationErase"></a>

### ConversationErase

<a name="berty.chat.ConversationErase.Reply"></a>

### ConversationErase.Reply

<a name="berty.chat.ConversationErase.Request"></a>

### ConversationErase.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.ConversationGet"></a>

### ConversationGet

<a name="berty.chat.ConversationGet.Reply"></a>

### ConversationGet.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| conversation | [berty.chatmodel.Conversation](#berty.chatmodel.Conversation) |  |  |

<a name="berty.chat.ConversationGet.Request"></a>

### ConversationGet.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.ConversationInvitationAccept"></a>

### ConversationInvitationAccept

<a name="berty.chat.ConversationInvitationAccept.Reply"></a>

### ConversationInvitationAccept.Reply

<a name="berty.chat.ConversationInvitationAccept.Request"></a>

### ConversationInvitationAccept.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |
| contact_id | [uint64](#uint64) |  |  |

<a name="berty.chat.ConversationInvitationDecline"></a>

### ConversationInvitationDecline

<a name="berty.chat.ConversationInvitationDecline.Reply"></a>

### ConversationInvitationDecline.Reply

<a name="berty.chat.ConversationInvitationDecline.Request"></a>

### ConversationInvitationDecline.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| conversation_id | [uint64](#uint64) |  |  |

<a name="berty.chat.ConversationInvitationSend"></a>

### ConversationInvitationSend

<a name="berty.chat.ConversationInvitationSend.Reply"></a>

### ConversationInvitationSend.Reply

<a name="berty.chat.ConversationInvitationSend.Request"></a>

### ConversationInvitationSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |
| contact_id | [uint64](#uint64) |  |  |

<a name="berty.chat.ConversationLeave"></a>

### ConversationLeave

<a name="berty.chat.ConversationLeave.Reply"></a>

### ConversationLeave.Reply

<a name="berty.chat.ConversationLeave.Request"></a>

### ConversationLeave.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.ConversationList"></a>

### ConversationList

<a name="berty.chat.ConversationList.Reply"></a>

### ConversationList.Reply
streamed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| conversation | [berty.chatmodel.Conversation](#berty.chatmodel.Conversation) |  |  |

<a name="berty.chat.ConversationList.Request"></a>

### ConversationList.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| filter | [berty.chatmodel.Conversation](#berty.chatmodel.Conversation) |  |  |

<a name="berty.chat.ConversationMute"></a>

### ConversationMute

<a name="berty.chat.ConversationMute.Reply"></a>

### ConversationMute.Reply

<a name="berty.chat.ConversationMute.Request"></a>

### ConversationMute.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| policy | [berty.chatmodel.Member.MutePolicy](#berty.chatmodel.Member.MutePolicy) |  |  |

<a name="berty.chat.ConversationUpdate"></a>

### ConversationUpdate

<a name="berty.chat.ConversationUpdate.Reply"></a>

### ConversationUpdate.Reply

<a name="berty.chat.ConversationUpdate.Request"></a>

### ConversationUpdate.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |
| title | [string](#string) |  |  |
| topic | [string](#string) |  |  |
| avatar_uri | [string](#string) |  |  |

<a name="berty.chat.DevEventSubscribe"></a>

### DevEventSubscribe

<a name="berty.chat.DevEventSubscribe.Reply"></a>

### DevEventSubscribe.Reply

<a name="berty.chat.DevEventSubscribe.Request"></a>

### DevEventSubscribe.Request

<a name="berty.chat.EventSubscribe"></a>

### EventSubscribe

<a name="berty.chat.EventSubscribe.Reply"></a>

### EventSubscribe.Reply

<a name="berty.chat.EventSubscribe.Request"></a>

### EventSubscribe.Request

<a name="berty.chat.MemberGet"></a>

### MemberGet

<a name="berty.chat.MemberGet.Reply"></a>

### MemberGet.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| member | [berty.chatmodel.Member](#berty.chatmodel.Member) |  |  |

<a name="berty.chat.MemberGet.Request"></a>

### MemberGet.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.MemberList"></a>

### MemberList

<a name="berty.chat.MemberList.Reply"></a>

### MemberList.Reply
streamed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| member | [berty.chatmodel.Member](#berty.chatmodel.Member) |  |  |

<a name="berty.chat.MemberList.Request"></a>

### MemberList.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| filter | [berty.chatmodel.Member](#berty.chatmodel.Member) |  |  |

<a name="berty.chat.MessageEdit"></a>

### MessageEdit

<a name="berty.chat.MessageEdit.Reply"></a>

### MessageEdit.Reply

<a name="berty.chat.MessageEdit.Request"></a>

### MessageEdit.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |
| body | [berty.chatmodel.Message.Body](#berty.chatmodel.Message.Body) |  |  |

<a name="berty.chat.MessageGet"></a>

### MessageGet

<a name="berty.chat.MessageGet.Reply"></a>

### MessageGet.Reply

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| message | [berty.chatmodel.Message](#berty.chatmodel.Message) |  |  |

<a name="berty.chat.MessageGet.Request"></a>

### MessageGet.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.MessageHide"></a>

### MessageHide

<a name="berty.chat.MessageHide.Reply"></a>

### MessageHide.Reply

<a name="berty.chat.MessageHide.Request"></a>

### MessageHide.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.MessageList"></a>

### MessageList

<a name="berty.chat.MessageList.Reply"></a>

### MessageList.Reply
streamed

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| message | [berty.chatmodel.Message](#berty.chatmodel.Message) |  |  |

<a name="berty.chat.MessageList.Request"></a>

### MessageList.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| filter | [berty.chatmodel.Message](#berty.chatmodel.Message) |  |  |

<a name="berty.chat.MessageReact"></a>

### MessageReact

<a name="berty.chat.MessageReact.Reply"></a>

### MessageReact.Reply

<a name="berty.chat.MessageReact.Request"></a>

### MessageReact.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |
| emoji | [bytes](#bytes) |  |  |

<a name="berty.chat.MessageRead"></a>

### MessageRead

<a name="berty.chat.MessageRead.Reply"></a>

### MessageRead.Reply

<a name="berty.chat.MessageRead.Request"></a>

### MessageRead.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |

<a name="berty.chat.MessageSend"></a>

### MessageSend

<a name="berty.chat.MessageSend.Reply"></a>

### MessageSend.Reply

<a name="berty.chat.MessageSend.Request"></a>

### MessageSend.Request

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| conversation_id | [uint64](#uint64) |  |  |
| kind | [berty.chatmodel.Message.Kind](#berty.chatmodel.Message.Kind) |  |  |
| body | [berty.chatmodel.Message.Body](#berty.chatmodel.Message.Body) |  |  |
| attachments | [berty.chatmodel.Attachment](#berty.chatmodel.Attachment) | repeated |  |

<a name="berty.chat.Search"></a>

### Search

<a name="berty.chat.Search.Reply"></a>

### Search.Reply

<a name="berty.chat.Search.Request"></a>

### Search.Request

 

 

 

<a name="berty.chat.ChatService"></a>

### ChatService
Search

| Method Name | Request Type | Response Type | Description |
| ----------- | ------------ | ------------- | ------------|
| Search | [Search.Request](#berty.chat.Search.Request) | [Search.Reply](#berty.chat.Search.Reply) stream |  |
| EventSubscribe | [EventSubscribe.Request](#berty.chat.EventSubscribe.Request) | [EventSubscribe.Reply](#berty.chat.EventSubscribe.Reply) stream |  |
| DevEventSubscribe | [DevEventSubscribe.Request](#berty.chat.DevEventSubscribe.Request) | [DevEventSubscribe.Reply](#berty.chat.DevEventSubscribe.Reply) stream |  |
| ConversationList | [ConversationList.Request](#berty.chat.ConversationList.Request) | [ConversationList.Reply](#berty.chat.ConversationList.Reply) stream |  |
| ConversationGet | [ConversationGet.Request](#berty.chat.ConversationGet.Request) | [ConversationGet.Reply](#berty.chat.ConversationGet.Reply) |  |
| ConversationCreate | [ConversationCreate.Request](#berty.chat.ConversationCreate.Request) | [ConversationCreate.Reply](#berty.chat.ConversationCreate.Reply) |  |
| ConversationUpdate | [ConversationUpdate.Request](#berty.chat.ConversationUpdate.Request) | [ConversationUpdate.Reply](#berty.chat.ConversationUpdate.Reply) |  |
| ConversationMute | [ConversationMute.Request](#berty.chat.ConversationMute.Request) | [ConversationMute.Reply](#berty.chat.ConversationMute.Reply) |  |
| ConversationLeave | [ConversationLeave.Request](#berty.chat.ConversationLeave.Request) | [ConversationLeave.Reply](#berty.chat.ConversationLeave.Reply) |  |
| ConversationErase | [ConversationErase.Request](#berty.chat.ConversationErase.Request) | [ConversationErase.Reply](#berty.chat.ConversationErase.Reply) |  |
| ConversationInvitationSend | [ConversationInvitationSend.Request](#berty.chat.ConversationInvitationSend.Request) | [ConversationInvitationSend.Reply](#berty.chat.ConversationInvitationSend.Reply) |  |
| ConversationInvitationAccept | [ConversationInvitationAccept.Request](#berty.chat.ConversationInvitationAccept.Request) | [ConversationInvitationAccept.Reply](#berty.chat.ConversationInvitationAccept.Reply) |  |
| ConversationInvitationDecline | [ConversationInvitationDecline.Request](#berty.chat.ConversationInvitationDecline.Request) | [ConversationInvitationDecline.Reply](#berty.chat.ConversationInvitationDecline.Reply) |  |
| MessageList | [MessageList.Request](#berty.chat.MessageList.Request) | [MessageList.Reply](#berty.chat.MessageList.Reply) stream |  |
| MessageGet | [MessageGet.Request](#berty.chat.MessageGet.Request) | [MessageGet.Reply](#berty.chat.MessageGet.Reply) |  |
| MessageSend | [MessageSend.Request](#berty.chat.MessageSend.Request) | [MessageSend.Reply](#berty.chat.MessageSend.Reply) |  |
| MessageEdit | [MessageEdit.Request](#berty.chat.MessageEdit.Request) | [MessageEdit.Reply](#berty.chat.MessageEdit.Reply) |  |
| MessageHide | [MessageHide.Request](#berty.chat.MessageHide.Request) | [MessageHide.Reply](#berty.chat.MessageHide.Reply) |  |
| MessageReact | [MessageReact.Request](#berty.chat.MessageReact.Request) | [MessageReact.Reply](#berty.chat.MessageReact.Reply) |  |
| MessageRead | [MessageRead.Request](#berty.chat.MessageRead.Request) | [MessageRead.Reply](#berty.chat.MessageRead.Reply) |  |
| MemberList | [MemberList.Request](#berty.chat.MemberList.Request) | [MemberList.Reply](#berty.chat.MemberList.Reply) stream |  |
| MemberGet | [MemberGet.Request](#berty.chat.MemberGet.Request) | [MemberGet.Reply](#berty.chat.MemberGet.Reply) |  |
| ContactList | [ContactList.Request](#berty.chat.ContactList.Request) | [ContactList.Reply](#berty.chat.ContactList.Reply) stream |  |
| ContactGet | [ContactGet.Request](#berty.chat.ContactGet.Request) | [ContactGet.Reply](#berty.chat.ContactGet.Reply) |  |
| ContactBlock | [ContactBlock.Request](#berty.chat.ContactBlock.Request) | [ContactBlock.Reply](#berty.chat.ContactBlock.Reply) |  |
| ContactRemove | [ContactRemove.Request](#berty.chat.ContactRemove.Request) | [ContactRemove.Reply](#berty.chat.ContactRemove.Reply) |  |
| ContactRequestSend | [ContactRequestSend.Request](#berty.chat.ContactRequestSend.Request) | [ContactRequestSend.Reply](#berty.chat.ContactRequestSend.Reply) |  |
| ContactRequestAccept | [ContactRequestAccept.Request](#berty.chat.ContactRequestAccept.Request) | [ContactRequestAccept.Reply](#berty.chat.ContactRequestAccept.Reply) |  |
| ContactRequestDecline | [ContactRequestDecline.Request](#berty.chat.ContactRequestDecline.Request) | [ContactRequestDecline.Reply](#berty.chat.ContactRequestDecline.Reply) |  |
| AccountList | [AccountList.Request](#berty.chat.AccountList.Request) | [AccountList.Request](#berty.chat.AccountList.Request) stream |  |
| AccountGet | [AccountGet.Request](#berty.chat.AccountGet.Request) | [AccountGet.Reply](#berty.chat.AccountGet.Reply) |  |
| AccountCreate | [AccountCreate.Request](#berty.chat.AccountCreate.Request) | [AccountCreate.Reply](#berty.chat.AccountCreate.Reply) |  |
| AccountUpdate | [AccountUpdate.Request](#berty.chat.AccountUpdate.Request) | [AccountUpdate.Reply](#berty.chat.AccountUpdate.Reply) |  |
| AccountOpen | [AccountOpen.Request](#berty.chat.AccountOpen.Request) | [AccountOpen.Reply](#berty.chat.AccountOpen.Reply) |  |
| AccountClose | [AccountClose.Request](#berty.chat.AccountClose.Request) | [AccountClose.Reply](#berty.chat.AccountClose.Reply) |  |
| AccountRemove | [AccountRemove.Request](#berty.chat.AccountRemove.Request) | [AccountRemove.Reply](#berty.chat.AccountRemove.Reply) |  |
| AccountPairingInvitationCreate | [AccountPairingInvitationCreate.Request](#berty.chat.AccountPairingInvitationCreate.Request) | [AccountPairingInvitationCreate.Reply](#berty.chat.AccountPairingInvitationCreate.Reply) |  |
| AccountRenewIncomingContactRequestLink | [AccountRenewIncomingContactRequestLink.Request](#berty.chat.AccountRenewIncomingContactRequestLink.Request) | [AccountRenewIncomingContactRequestLink.Reply](#berty.chat.AccountRenewIncomingContactRequestLink.Reply) |  |

 

<a name="chatmodel.proto"></a>
<p align="right"><a href="#top">Top</a></p>

## chatmodel.proto

<a name="berty.chatmodel.Account"></a>

### Account

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |
| created_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| updated_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| contact_id | [uint64](#uint64) |  |  |
| myself | [Contact](#berty.chatmodel.Contact) |  |  |
| contact_requests_enabled | [bool](#bool) |  | settings |
| contact_requests_link | [string](#string) |  |  |
| hidden | [bool](#bool) |  |  |
| locked | [bool](#bool) |  |  |

<a name="berty.chatmodel.Attachment"></a>

### Attachment

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  | metadata |
| created_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| updated_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| uri | [string](#string) |  | fields |
| content_type | [string](#string) |  |  |
| message_id | [uint64](#uint64) |  | associations |
| message | [Message](#berty.chatmodel.Message) |  |  |

<a name="berty.chatmodel.Contact"></a>

### Contact

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |
| protocol_id | [string](#string) |  |  |
| created_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| updated_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| seen_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| name | [string](#string) |  | fields |
| avatar_uri | [string](#string) |  |  |
| status_emoji | [bytes](#bytes) |  |  |
| status_text | [string](#string) |  |  |
| kind | [Contact.Kind](#berty.chatmodel.Contact.Kind) |  |  |
| blocked | [bool](#bool) |  |  |
| devices | [Device](#berty.chatmodel.Device) | repeated | associations |

<a name="berty.chatmodel.Conversation"></a>

### Conversation

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |
| protocol_id | [string](#string) |  |  |
| created_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| updated_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| title | [string](#string) |  | fields |
| topic | [string](#string) |  |  |
| avatar_uri | [string](#string) |  |  |
| kind | [Conversation.Kind](#berty.chatmodel.Conversation.Kind) |  |  |
| badge | [uint32](#uint32) |  |  |
| messages | [Message](#berty.chatmodel.Message) | repeated | associations |
| members | [Member](#berty.chatmodel.Member) | repeated |  |
| last_message_id | [uint64](#uint64) |  |  |
| last_message | [Message](#berty.chatmodel.Message) |  |  |

<a name="berty.chatmodel.Device"></a>

### Device

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |
| protocol_id | [string](#string) |  |  |
| created_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| updated_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| last_seen_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| kind | [Device.Kind](#berty.chatmodel.Device.Kind) |  | fields |
| can_relay | [bool](#bool) |  |  |
| can_ble | [bool](#bool) |  |  |
| contact_id | [uint64](#uint64) |  | associations |
| contact | [Contact](#berty.chatmodel.Contact) |  |  |

<a name="berty.chatmodel.Member"></a>

### Member

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  |  |
| protocol_id | [string](#string) |  |  |
| created_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| updated_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| read_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| name | [string](#string) |  | fields |
| avatar_uri | [string](#string) |  |  |
| role | [Member.Role](#berty.chatmodel.Member.Role) |  |  |
| mute_policy | [Member.MutePolicy](#berty.chatmodel.Member.MutePolicy) |  |  |
| conversation_id | [uint64](#uint64) |  | associations |
| conversation | [Conversation](#berty.chatmodel.Conversation) |  |  |
| contact_id | [uint64](#uint64) |  | non-empty mean verified member |
| contact | [Contact](#berty.chatmodel.Contact) |  |  |

<a name="berty.chatmodel.Message"></a>

### Message

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  | metadata |
| protocol_id | [string](#string) |  |  |
| created_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| updated_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| sent_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| edited_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| kind | [Message.Kind](#berty.chatmodel.Message.Kind) |  | fields |
| body | [Message.Body](#berty.chatmodel.Message.Body) |  |  |
| hidden | [bool](#bool) |  |  |
| state | [Message.State](#berty.chatmodel.Message.State) |  |  |
| conversation_id | [uint64](#uint64) |  | associations |
| conversation | [Conversation](#berty.chatmodel.Conversation) |  |  |
| member_id | [uint64](#uint64) |  |  |
| member | [Member](#berty.chatmodel.Member) |  |  |
| attachments | [Attachment](#berty.chatmodel.Attachment) | repeated |  |
| reactions | [Reaction](#berty.chatmodel.Reaction) | repeated |  |

<a name="berty.chatmodel.Message.Body"></a>

### Message.Body

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| text | [string](#string) |  |  |
| member_joined | [uint64](#uint64) |  |  |
| member_left | [uint64](#uint64) |  |  |
| member_set_title_to | [string](#string) |  | ... |

<a name="berty.chatmodel.Reaction"></a>

### Reaction

| Field | Type | Label | Description |
| ----- | ---- | ----- | ----------- |
| id | [uint64](#uint64) |  | metadata |
| created_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| updated_at | [google.protobuf.Timestamp](#google.protobuf.Timestamp) |  |  |
| emoji | [bytes](#bytes) |  | fields |
| message_id | [uint64](#uint64) |  | associations |
| message | [Message](#berty.chatmodel.Message) |  |  |
| member_id | [uint64](#uint64) |  |  |
| member | [Member](#berty.chatmodel.Member) |  |  |

 

<a name="berty.chatmodel.Contact.Kind"></a>

### Contact.Kind

| Name | Number | Description |
| ---- | ------ | ----------- |
| Unknown | 0 |  |
| PendingInc | 1 |  |
| PendingOut | 2 |  |
| Friend | 3 |  |
| Trusted | 4 |  |
| Myself | 42 |  |

<a name="berty.chatmodel.Conversation.Kind"></a>

### Conversation.Kind

| Name | Number | Description |
| ---- | ------ | ----------- |
| Unknown | 0 |  |
| Self | 1 |  |
| OneToOne | 2 |  |
| PrivateGroup | 3 | PublicGroup = 4; ... |

<a name="berty.chatmodel.Device.Kind"></a>

### Device.Kind

| Name | Number | Description |
| ---- | ------ | ----------- |
| Unknown | 0 |  |
| Phone | 1 |  |
| Desktop | 2 |  |
| Laptop | 3 | ... |

<a name="berty.chatmodel.Member.MutePolicy"></a>

### Member.MutePolicy

| Name | Number | Description |
| ---- | ------ | ----------- |
| Nothing | 0 |  |
| All | 1 |  |
| Notifications | 2 |  |

<a name="berty.chatmodel.Member.Role"></a>

### Member.Role

| Name | Number | Description |
| ---- | ------ | ----------- |
| Unknown | 0 |  |
| Regular | 2 | Guest = 1; ... |
| Admin | 3 |  |
| Owner | 4 |  |

<a name="berty.chatmodel.Message.Kind"></a>

### Message.Kind

| Name | Number | Description |
| ---- | ------ | ----------- |
| Unknown | 0 |  |
| Text | 1 |  |
| MemberJoined | 2 |  |
| MemberLeave | 3 |  |
| MemberSetTitleTo | 4 | ... |

<a name="berty.chatmodel.Message.State"></a>

### Message.State

| Name | Number | Description |
| ---- | ------ | ----------- |
| UnSent | 0 |  |
| Sending | 1 |  |
| Failed | 2 |  |
| Retrying | 3 |  |
| Sent | 4 |  |

 

 

 

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

