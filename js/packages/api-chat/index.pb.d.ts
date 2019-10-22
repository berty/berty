import * as $protobuf from "protobufjs";
/** Namespace berty. */
export namespace berty {

    /** Namespace chat. */
    namespace chat {

        /** Represents an Account */
        class Account extends $protobuf.rpc.Service {

            /**
             * Constructs a new Account service.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             */
            constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

            /**
             * Creates new Account service using the specified rpc implementation.
             * @param rpcImpl RPC implementation
             * @param [requestDelimited=false] Whether requests are length-delimited
             * @param [responseDelimited=false] Whether responses are length-delimited
             * @returns RPC service. Useful where requests and/or responses are streamed.
             */
            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): Account;

            /**
             * Calls EventSubscribe.
             * @param request EventSubscribeRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and EventSubscribeReply
             */
            public eventSubscribe(request: berty.chat.IEventSubscribeRequest, callback: berty.chat.Account.EventSubscribeCallback): void;

            /**
             * Calls EventSubscribe.
             * @param request EventSubscribeRequest message or plain object
             * @returns Promise
             */
            public eventSubscribe(request: berty.chat.IEventSubscribeRequest): Promise<berty.chat.EventSubscribeReply>;

            /**
             * Calls ConversationList.
             * @param request ConversationListRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationListReply
             */
            public conversationList(request: berty.chat.IConversationListRequest, callback: berty.chat.Account.ConversationListCallback): void;

            /**
             * Calls ConversationList.
             * @param request ConversationListRequest message or plain object
             * @returns Promise
             */
            public conversationList(request: berty.chat.IConversationListRequest): Promise<berty.chat.ConversationListReply>;

            /**
             * Calls ConversationGet.
             * @param request ConversationGetRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationGetReply
             */
            public conversationGet(request: berty.chat.IConversationGetRequest, callback: berty.chat.Account.ConversationGetCallback): void;

            /**
             * Calls ConversationGet.
             * @param request ConversationGetRequest message or plain object
             * @returns Promise
             */
            public conversationGet(request: berty.chat.IConversationGetRequest): Promise<berty.chat.ConversationGetReply>;

            /**
             * Calls ConversationCreate.
             * @param request ConversationCreateRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationCreateReply
             */
            public conversationCreate(request: berty.chat.IConversationCreateRequest, callback: berty.chat.Account.ConversationCreateCallback): void;

            /**
             * Calls ConversationCreate.
             * @param request ConversationCreateRequest message or plain object
             * @returns Promise
             */
            public conversationCreate(request: berty.chat.IConversationCreateRequest): Promise<berty.chat.ConversationCreateReply>;

            /**
             * Calls ConversationLeave.
             * @param request ConversationLeaveRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationLeaveReply
             */
            public conversationLeave(request: berty.chat.IConversationLeaveRequest, callback: berty.chat.Account.ConversationLeaveCallback): void;

            /**
             * Calls ConversationLeave.
             * @param request ConversationLeaveRequest message or plain object
             * @returns Promise
             */
            public conversationLeave(request: berty.chat.IConversationLeaveRequest): Promise<berty.chat.ConversationLeaveReply>;

            /**
             * Calls ConversationErase.
             * @param request ConversationEraseRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationEraseReply
             */
            public conversationErase(request: berty.chat.IConversationEraseRequest, callback: berty.chat.Account.ConversationEraseCallback): void;

            /**
             * Calls ConversationErase.
             * @param request ConversationEraseRequest message or plain object
             * @returns Promise
             */
            public conversationErase(request: berty.chat.IConversationEraseRequest): Promise<berty.chat.ConversationEraseReply>;

            /**
             * Calls ConversationSetSeenPosition.
             * @param request ConversationSetSeenPositionRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationSetSeenPositionReply
             */
            public conversationSetSeenPosition(request: berty.chat.IConversationSetSeenPositionRequest, callback: berty.chat.Account.ConversationSetSeenPositionCallback): void;

            /**
             * Calls ConversationSetSeenPosition.
             * @param request ConversationSetSeenPositionRequest message or plain object
             * @returns Promise
             */
            public conversationSetSeenPosition(request: berty.chat.IConversationSetSeenPositionRequest): Promise<berty.chat.ConversationSetSeenPositionReply>;

            /**
             * Calls ConversationMessageList.
             * @param request ConversationMessageListRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationMessageListReply
             */
            public conversationMessageList(request: berty.chat.IConversationMessageListRequest, callback: berty.chat.Account.ConversationMessageListCallback): void;

            /**
             * Calls ConversationMessageList.
             * @param request ConversationMessageListRequest message or plain object
             * @returns Promise
             */
            public conversationMessageList(request: berty.chat.IConversationMessageListRequest): Promise<berty.chat.ConversationMessageListReply>;

            /**
             * Calls ConversationMessageSend.
             * @param request ConversationMessageSendRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationMessageSendReply
             */
            public conversationMessageSend(request: berty.chat.IConversationMessageSendRequest, callback: berty.chat.Account.ConversationMessageSendCallback): void;

            /**
             * Calls ConversationMessageSend.
             * @param request ConversationMessageSendRequest message or plain object
             * @returns Promise
             */
            public conversationMessageSend(request: berty.chat.IConversationMessageSendRequest): Promise<berty.chat.ConversationMessageSendReply>;

            /**
             * Calls ConversationMessageEdit.
             * @param request ConversationMessageEditRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationMessageEditReply
             */
            public conversationMessageEdit(request: berty.chat.IConversationMessageEditRequest, callback: berty.chat.Account.ConversationMessageEditCallback): void;

            /**
             * Calls ConversationMessageEdit.
             * @param request ConversationMessageEditRequest message or plain object
             * @returns Promise
             */
            public conversationMessageEdit(request: berty.chat.IConversationMessageEditRequest): Promise<berty.chat.ConversationMessageEditReply>;

            /**
             * Calls ConversationMessageHide.
             * @param request ConversationMessageHideRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationMessageHideReply
             */
            public conversationMessageHide(request: berty.chat.IConversationMessageHideRequest, callback: berty.chat.Account.ConversationMessageHideCallback): void;

            /**
             * Calls ConversationMessageHide.
             * @param request ConversationMessageHideRequest message or plain object
             * @returns Promise
             */
            public conversationMessageHide(request: berty.chat.IConversationMessageHideRequest): Promise<berty.chat.ConversationMessageHideReply>;

            /**
             * Calls ConversationUpdateSettings.
             * @param request ConversationUpdateSettingsRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationUpdateSettingsReply
             */
            public conversationUpdateSettings(request: berty.chat.IConversationUpdateSettingsRequest, callback: berty.chat.Account.ConversationUpdateSettingsCallback): void;

            /**
             * Calls ConversationUpdateSettings.
             * @param request ConversationUpdateSettingsRequest message or plain object
             * @returns Promise
             */
            public conversationUpdateSettings(request: berty.chat.IConversationUpdateSettingsRequest): Promise<berty.chat.ConversationUpdateSettingsReply>;

            /**
             * Calls ConversationInvitationAccept.
             * @param request ConversationInvitationAcceptRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationInvitationAcceptReply
             */
            public conversationInvitationAccept(request: berty.chat.IConversationInvitationAcceptRequest, callback: berty.chat.Account.ConversationInvitationAcceptCallback): void;

            /**
             * Calls ConversationInvitationAccept.
             * @param request ConversationInvitationAcceptRequest message or plain object
             * @returns Promise
             */
            public conversationInvitationAccept(request: berty.chat.IConversationInvitationAcceptRequest): Promise<berty.chat.ConversationInvitationAcceptReply>;

            /**
             * Calls ConversationInvitationCreate.
             * @param request ConversationInvitationCreateRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationInvitationCreateReply
             */
            public conversationInvitationCreate(request: berty.chat.IConversationInvitationCreateRequest, callback: berty.chat.Account.ConversationInvitationCreateCallback): void;

            /**
             * Calls ConversationInvitationCreate.
             * @param request ConversationInvitationCreateRequest message or plain object
             * @returns Promise
             */
            public conversationInvitationCreate(request: berty.chat.IConversationInvitationCreateRequest): Promise<berty.chat.ConversationInvitationCreateReply>;

            /**
             * Calls ConversationInvitationDiscard.
             * @param request ConversationInvitationDiscardRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ConversationInvitationDiscardReply
             */
            public conversationInvitationDiscard(request: berty.chat.IConversationInvitationDiscardRequest, callback: berty.chat.Account.ConversationInvitationDiscardCallback): void;

            /**
             * Calls ConversationInvitationDiscard.
             * @param request ConversationInvitationDiscardRequest message or plain object
             * @returns Promise
             */
            public conversationInvitationDiscard(request: berty.chat.IConversationInvitationDiscardRequest): Promise<berty.chat.ConversationInvitationDiscardReply>;

            /**
             * Calls ContactList.
             * @param request ContactListRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ContactListReply
             */
            public contactList(request: berty.chat.IContactListRequest, callback: berty.chat.Account.ContactListCallback): void;

            /**
             * Calls ContactList.
             * @param request ContactListRequest message or plain object
             * @returns Promise
             */
            public contactList(request: berty.chat.IContactListRequest): Promise<berty.chat.ContactListReply>;

            /**
             * Calls ContactGet.
             * @param request ContactGetRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ContactGetReply
             */
            public contactGet(request: berty.chat.IContactGetRequest, callback: berty.chat.Account.ContactGetCallback): void;

            /**
             * Calls ContactGet.
             * @param request ContactGetRequest message or plain object
             * @returns Promise
             */
            public contactGet(request: berty.chat.IContactGetRequest): Promise<berty.chat.ContactGetReply>;

            /**
             * Calls ContactUpdate.
             * @param request ContactUpdateRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ContactUpdateReply
             */
            public contactUpdate(request: berty.chat.IContactUpdateRequest, callback: berty.chat.Account.ContactUpdateCallback): void;

            /**
             * Calls ContactUpdate.
             * @param request ContactUpdateRequest message or plain object
             * @returns Promise
             */
            public contactUpdate(request: berty.chat.IContactUpdateRequest): Promise<berty.chat.ContactUpdateReply>;

            /**
             * Calls ContactRemove.
             * @param request ContactRemoveRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ContactRemoveReply
             */
            public contactRemove(request: berty.chat.IContactRemoveRequest, callback: berty.chat.Account.ContactRemoveCallback): void;

            /**
             * Calls ContactRemove.
             * @param request ContactRemoveRequest message or plain object
             * @returns Promise
             */
            public contactRemove(request: berty.chat.IContactRemoveRequest): Promise<berty.chat.ContactRemoveReply>;

            /**
             * Calls ContactRequestCreate.
             * @param request ContactRequestCreateRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ContactRequestCreateReply
             */
            public contactRequestCreate(request: berty.chat.IContactRequestCreateRequest, callback: berty.chat.Account.ContactRequestCreateCallback): void;

            /**
             * Calls ContactRequestCreate.
             * @param request ContactRequestCreateRequest message or plain object
             * @returns Promise
             */
            public contactRequestCreate(request: berty.chat.IContactRequestCreateRequest): Promise<berty.chat.ContactRequestCreateReply>;

            /**
             * Calls ContactRequestAccept.
             * @param request ContactRequestAcceptRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ContactRequestAcceptReply
             */
            public contactRequestAccept(request: berty.chat.IContactRequestAcceptRequest, callback: berty.chat.Account.ContactRequestAcceptCallback): void;

            /**
             * Calls ContactRequestAccept.
             * @param request ContactRequestAcceptRequest message or plain object
             * @returns Promise
             */
            public contactRequestAccept(request: berty.chat.IContactRequestAcceptRequest): Promise<berty.chat.ContactRequestAcceptReply>;

            /**
             * Calls ContactRequestDiscard.
             * @param request ContactRequestDiscardRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and ContactRequestDiscardReply
             */
            public contactRequestDiscard(request: berty.chat.IContactRequestDiscardRequest, callback: berty.chat.Account.ContactRequestDiscardCallback): void;

            /**
             * Calls ContactRequestDiscard.
             * @param request ContactRequestDiscardRequest message or plain object
             * @returns Promise
             */
            public contactRequestDiscard(request: berty.chat.IContactRequestDiscardRequest): Promise<berty.chat.ContactRequestDiscardReply>;

            /**
             * Calls Search.
             * @param request SearchRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and SearchReply
             */
            public search(request: berty.chat.ISearchRequest, callback: berty.chat.Account.SearchCallback): void;

            /**
             * Calls Search.
             * @param request SearchRequest message or plain object
             * @returns Promise
             */
            public search(request: berty.chat.ISearchRequest): Promise<berty.chat.SearchReply>;

            /**
             * Calls AccountSettingsGet.
             * @param request AccountSettingsGetRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and AccountSettingsGetReply
             */
            public accountSettingsGet(request: berty.chat.IAccountSettingsGetRequest, callback: berty.chat.Account.AccountSettingsGetCallback): void;

            /**
             * Calls AccountSettingsGet.
             * @param request AccountSettingsGetRequest message or plain object
             * @returns Promise
             */
            public accountSettingsGet(request: berty.chat.IAccountSettingsGetRequest): Promise<berty.chat.AccountSettingsGetReply>;

            /**
             * Calls AccountSettingsUpdate.
             * @param request AccountSettingsUpdateRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and AccountSettingsUpdateReply
             */
            public accountSettingsUpdate(request: berty.chat.IAccountSettingsUpdateRequest, callback: berty.chat.Account.AccountSettingsUpdateCallback): void;

            /**
             * Calls AccountSettingsUpdate.
             * @param request AccountSettingsUpdateRequest message or plain object
             * @returns Promise
             */
            public accountSettingsUpdate(request: berty.chat.IAccountSettingsUpdateRequest): Promise<berty.chat.AccountSettingsUpdateReply>;

            /**
             * Calls AccountPairingInvitationCreate.
             * @param request AccountPairingInvitationCreateRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and AccountPairingInvitationCreateReply
             */
            public accountPairingInvitationCreate(request: berty.chat.IAccountPairingInvitationCreateRequest, callback: berty.chat.Account.AccountPairingInvitationCreateCallback): void;

            /**
             * Calls AccountPairingInvitationCreate.
             * @param request AccountPairingInvitationCreateRequest message or plain object
             * @returns Promise
             */
            public accountPairingInvitationCreate(request: berty.chat.IAccountPairingInvitationCreateRequest): Promise<berty.chat.AccountPairingInvitationCreateReply>;

            /**
             * Calls AccountRenewIncomingContactRequestLink.
             * @param request AccountRenewIncomingContactRequestLinkRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and AccountRenewIncomingContactRequestLinkReply
             */
            public accountRenewIncomingContactRequestLink(request: berty.chat.IAccountRenewIncomingContactRequestLinkRequest, callback: berty.chat.Account.AccountRenewIncomingContactRequestLinkCallback): void;

            /**
             * Calls AccountRenewIncomingContactRequestLink.
             * @param request AccountRenewIncomingContactRequestLinkRequest message or plain object
             * @returns Promise
             */
            public accountRenewIncomingContactRequestLink(request: berty.chat.IAccountRenewIncomingContactRequestLinkRequest): Promise<berty.chat.AccountRenewIncomingContactRequestLinkReply>;

            /**
             * Calls DevEventSubscribe.
             * @param request DevEventSubscribeRequest message or plain object
             * @param callback Node-style callback called with the error, if any, and DevEventSubscribeReply
             */
            public devEventSubscribe(request: berty.chat.IDevEventSubscribeRequest, callback: berty.chat.Account.DevEventSubscribeCallback): void;

            /**
             * Calls DevEventSubscribe.
             * @param request DevEventSubscribeRequest message or plain object
             * @returns Promise
             */
            public devEventSubscribe(request: berty.chat.IDevEventSubscribeRequest): Promise<berty.chat.DevEventSubscribeReply>;
        }

        namespace Account {

            /**
             * Callback as used by {@link berty.chat.Account#eventSubscribe}.
             * @param error Error, if any
             * @param [response] EventSubscribeReply
             */
            type EventSubscribeCallback = (error: (Error|null), response?: berty.chat.EventSubscribeReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationList}.
             * @param error Error, if any
             * @param [response] ConversationListReply
             */
            type ConversationListCallback = (error: (Error|null), response?: berty.chat.ConversationListReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationGet}.
             * @param error Error, if any
             * @param [response] ConversationGetReply
             */
            type ConversationGetCallback = (error: (Error|null), response?: berty.chat.ConversationGetReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationCreate}.
             * @param error Error, if any
             * @param [response] ConversationCreateReply
             */
            type ConversationCreateCallback = (error: (Error|null), response?: berty.chat.ConversationCreateReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationLeave}.
             * @param error Error, if any
             * @param [response] ConversationLeaveReply
             */
            type ConversationLeaveCallback = (error: (Error|null), response?: berty.chat.ConversationLeaveReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationErase}.
             * @param error Error, if any
             * @param [response] ConversationEraseReply
             */
            type ConversationEraseCallback = (error: (Error|null), response?: berty.chat.ConversationEraseReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationSetSeenPosition}.
             * @param error Error, if any
             * @param [response] ConversationSetSeenPositionReply
             */
            type ConversationSetSeenPositionCallback = (error: (Error|null), response?: berty.chat.ConversationSetSeenPositionReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationMessageList}.
             * @param error Error, if any
             * @param [response] ConversationMessageListReply
             */
            type ConversationMessageListCallback = (error: (Error|null), response?: berty.chat.ConversationMessageListReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationMessageSend}.
             * @param error Error, if any
             * @param [response] ConversationMessageSendReply
             */
            type ConversationMessageSendCallback = (error: (Error|null), response?: berty.chat.ConversationMessageSendReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationMessageEdit}.
             * @param error Error, if any
             * @param [response] ConversationMessageEditReply
             */
            type ConversationMessageEditCallback = (error: (Error|null), response?: berty.chat.ConversationMessageEditReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationMessageHide}.
             * @param error Error, if any
             * @param [response] ConversationMessageHideReply
             */
            type ConversationMessageHideCallback = (error: (Error|null), response?: berty.chat.ConversationMessageHideReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationUpdateSettings}.
             * @param error Error, if any
             * @param [response] ConversationUpdateSettingsReply
             */
            type ConversationUpdateSettingsCallback = (error: (Error|null), response?: berty.chat.ConversationUpdateSettingsReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationInvitationAccept}.
             * @param error Error, if any
             * @param [response] ConversationInvitationAcceptReply
             */
            type ConversationInvitationAcceptCallback = (error: (Error|null), response?: berty.chat.ConversationInvitationAcceptReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationInvitationCreate}.
             * @param error Error, if any
             * @param [response] ConversationInvitationCreateReply
             */
            type ConversationInvitationCreateCallback = (error: (Error|null), response?: berty.chat.ConversationInvitationCreateReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#conversationInvitationDiscard}.
             * @param error Error, if any
             * @param [response] ConversationInvitationDiscardReply
             */
            type ConversationInvitationDiscardCallback = (error: (Error|null), response?: berty.chat.ConversationInvitationDiscardReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#contactList}.
             * @param error Error, if any
             * @param [response] ContactListReply
             */
            type ContactListCallback = (error: (Error|null), response?: berty.chat.ContactListReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#contactGet}.
             * @param error Error, if any
             * @param [response] ContactGetReply
             */
            type ContactGetCallback = (error: (Error|null), response?: berty.chat.ContactGetReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#contactUpdate}.
             * @param error Error, if any
             * @param [response] ContactUpdateReply
             */
            type ContactUpdateCallback = (error: (Error|null), response?: berty.chat.ContactUpdateReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#contactRemove}.
             * @param error Error, if any
             * @param [response] ContactRemoveReply
             */
            type ContactRemoveCallback = (error: (Error|null), response?: berty.chat.ContactRemoveReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#contactRequestCreate}.
             * @param error Error, if any
             * @param [response] ContactRequestCreateReply
             */
            type ContactRequestCreateCallback = (error: (Error|null), response?: berty.chat.ContactRequestCreateReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#contactRequestAccept}.
             * @param error Error, if any
             * @param [response] ContactRequestAcceptReply
             */
            type ContactRequestAcceptCallback = (error: (Error|null), response?: berty.chat.ContactRequestAcceptReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#contactRequestDiscard}.
             * @param error Error, if any
             * @param [response] ContactRequestDiscardReply
             */
            type ContactRequestDiscardCallback = (error: (Error|null), response?: berty.chat.ContactRequestDiscardReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#search}.
             * @param error Error, if any
             * @param [response] SearchReply
             */
            type SearchCallback = (error: (Error|null), response?: berty.chat.SearchReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#accountSettingsGet}.
             * @param error Error, if any
             * @param [response] AccountSettingsGetReply
             */
            type AccountSettingsGetCallback = (error: (Error|null), response?: berty.chat.AccountSettingsGetReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#accountSettingsUpdate}.
             * @param error Error, if any
             * @param [response] AccountSettingsUpdateReply
             */
            type AccountSettingsUpdateCallback = (error: (Error|null), response?: berty.chat.AccountSettingsUpdateReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#accountPairingInvitationCreate}.
             * @param error Error, if any
             * @param [response] AccountPairingInvitationCreateReply
             */
            type AccountPairingInvitationCreateCallback = (error: (Error|null), response?: berty.chat.AccountPairingInvitationCreateReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#accountRenewIncomingContactRequestLink}.
             * @param error Error, if any
             * @param [response] AccountRenewIncomingContactRequestLinkReply
             */
            type AccountRenewIncomingContactRequestLinkCallback = (error: (Error|null), response?: berty.chat.AccountRenewIncomingContactRequestLinkReply) => void;

            /**
             * Callback as used by {@link berty.chat.Account#devEventSubscribe}.
             * @param error Error, if any
             * @param [response] DevEventSubscribeReply
             */
            type DevEventSubscribeCallback = (error: (Error|null), response?: berty.chat.DevEventSubscribeReply) => void;
        }

        /** Properties of an EventSubscribeRequest. */
        interface IEventSubscribeRequest {
        }

        /** Represents an EventSubscribeRequest. */
        class EventSubscribeRequest implements IEventSubscribeRequest {

            /**
             * Constructs a new EventSubscribeRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IEventSubscribeRequest);

            /**
             * Creates a new EventSubscribeRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EventSubscribeRequest instance
             */
            public static create(properties?: berty.chat.IEventSubscribeRequest): berty.chat.EventSubscribeRequest;

            /**
             * Encodes the specified EventSubscribeRequest message. Does not implicitly {@link berty.chat.EventSubscribeRequest.verify|verify} messages.
             * @param message EventSubscribeRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IEventSubscribeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EventSubscribeRequest message, length delimited. Does not implicitly {@link berty.chat.EventSubscribeRequest.verify|verify} messages.
             * @param message EventSubscribeRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IEventSubscribeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EventSubscribeRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EventSubscribeRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.EventSubscribeRequest;

            /**
             * Decodes an EventSubscribeRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EventSubscribeRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.EventSubscribeRequest;

            /**
             * Verifies an EventSubscribeRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EventSubscribeRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EventSubscribeRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.EventSubscribeRequest;

            /**
             * Creates a plain object from an EventSubscribeRequest message. Also converts values to other types if specified.
             * @param message EventSubscribeRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.EventSubscribeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EventSubscribeRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an EventSubscribeReply. */
        interface IEventSubscribeReply {
        }

        /** Represents an EventSubscribeReply. */
        class EventSubscribeReply implements IEventSubscribeReply {

            /**
             * Constructs a new EventSubscribeReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IEventSubscribeReply);

            /**
             * Creates a new EventSubscribeReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EventSubscribeReply instance
             */
            public static create(properties?: berty.chat.IEventSubscribeReply): berty.chat.EventSubscribeReply;

            /**
             * Encodes the specified EventSubscribeReply message. Does not implicitly {@link berty.chat.EventSubscribeReply.verify|verify} messages.
             * @param message EventSubscribeReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IEventSubscribeReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EventSubscribeReply message, length delimited. Does not implicitly {@link berty.chat.EventSubscribeReply.verify|verify} messages.
             * @param message EventSubscribeReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IEventSubscribeReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EventSubscribeReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EventSubscribeReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.EventSubscribeReply;

            /**
             * Decodes an EventSubscribeReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EventSubscribeReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.EventSubscribeReply;

            /**
             * Verifies an EventSubscribeReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EventSubscribeReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EventSubscribeReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.EventSubscribeReply;

            /**
             * Creates a plain object from an EventSubscribeReply message. Also converts values to other types if specified.
             * @param message EventSubscribeReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.EventSubscribeReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EventSubscribeReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationListRequest. */
        interface IConversationListRequest {
        }

        /** Represents a ConversationListRequest. */
        class ConversationListRequest implements IConversationListRequest {

            /**
             * Constructs a new ConversationListRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationListRequest);

            /**
             * Creates a new ConversationListRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationListRequest instance
             */
            public static create(properties?: berty.chat.IConversationListRequest): berty.chat.ConversationListRequest;

            /**
             * Encodes the specified ConversationListRequest message. Does not implicitly {@link berty.chat.ConversationListRequest.verify|verify} messages.
             * @param message ConversationListRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationListRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationListRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationListRequest.verify|verify} messages.
             * @param message ConversationListRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationListRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationListRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationListRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationListRequest;

            /**
             * Decodes a ConversationListRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationListRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationListRequest;

            /**
             * Verifies a ConversationListRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationListRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationListRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationListRequest;

            /**
             * Creates a plain object from a ConversationListRequest message. Also converts values to other types if specified.
             * @param message ConversationListRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationListRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationListRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationListReply. */
        interface IConversationListReply {

            /** ConversationListReply conversation */
            conversation?: (berty.chatmodel.IConversation|null);
        }

        /** Represents a ConversationListReply. */
        class ConversationListReply implements IConversationListReply {

            /**
             * Constructs a new ConversationListReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationListReply);

            /** ConversationListReply conversation. */
            public conversation?: (berty.chatmodel.IConversation|null);

            /**
             * Creates a new ConversationListReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationListReply instance
             */
            public static create(properties?: berty.chat.IConversationListReply): berty.chat.ConversationListReply;

            /**
             * Encodes the specified ConversationListReply message. Does not implicitly {@link berty.chat.ConversationListReply.verify|verify} messages.
             * @param message ConversationListReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationListReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationListReply message, length delimited. Does not implicitly {@link berty.chat.ConversationListReply.verify|verify} messages.
             * @param message ConversationListReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationListReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationListReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationListReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationListReply;

            /**
             * Decodes a ConversationListReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationListReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationListReply;

            /**
             * Verifies a ConversationListReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationListReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationListReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationListReply;

            /**
             * Creates a plain object from a ConversationListReply message. Also converts values to other types if specified.
             * @param message ConversationListReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationListReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationListReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationGetRequest. */
        interface IConversationGetRequest {

            /** ConversationGetRequest id */
            id?: (string|null);
        }

        /** Represents a ConversationGetRequest. */
        class ConversationGetRequest implements IConversationGetRequest {

            /**
             * Constructs a new ConversationGetRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationGetRequest);

            /** ConversationGetRequest id. */
            public id: string;

            /**
             * Creates a new ConversationGetRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationGetRequest instance
             */
            public static create(properties?: berty.chat.IConversationGetRequest): berty.chat.ConversationGetRequest;

            /**
             * Encodes the specified ConversationGetRequest message. Does not implicitly {@link berty.chat.ConversationGetRequest.verify|verify} messages.
             * @param message ConversationGetRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationGetRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationGetRequest.verify|verify} messages.
             * @param message ConversationGetRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationGetRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationGetRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationGetRequest;

            /**
             * Decodes a ConversationGetRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationGetRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationGetRequest;

            /**
             * Verifies a ConversationGetRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationGetRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationGetRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationGetRequest;

            /**
             * Creates a plain object from a ConversationGetRequest message. Also converts values to other types if specified.
             * @param message ConversationGetRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationGetRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationGetRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationGetReply. */
        interface IConversationGetReply {

            /** ConversationGetReply conversation */
            conversation?: (berty.chatmodel.IConversation|null);
        }

        /** Represents a ConversationGetReply. */
        class ConversationGetReply implements IConversationGetReply {

            /**
             * Constructs a new ConversationGetReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationGetReply);

            /** ConversationGetReply conversation. */
            public conversation?: (berty.chatmodel.IConversation|null);

            /**
             * Creates a new ConversationGetReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationGetReply instance
             */
            public static create(properties?: berty.chat.IConversationGetReply): berty.chat.ConversationGetReply;

            /**
             * Encodes the specified ConversationGetReply message. Does not implicitly {@link berty.chat.ConversationGetReply.verify|verify} messages.
             * @param message ConversationGetReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationGetReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationGetReply message, length delimited. Does not implicitly {@link berty.chat.ConversationGetReply.verify|verify} messages.
             * @param message ConversationGetReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationGetReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationGetReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationGetReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationGetReply;

            /**
             * Decodes a ConversationGetReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationGetReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationGetReply;

            /**
             * Verifies a ConversationGetReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationGetReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationGetReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationGetReply;

            /**
             * Creates a plain object from a ConversationGetReply message. Also converts values to other types if specified.
             * @param message ConversationGetReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationGetReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationGetReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationCreateRequest. */
        interface IConversationCreateRequest {
        }

        /** Represents a ConversationCreateRequest. */
        class ConversationCreateRequest implements IConversationCreateRequest {

            /**
             * Constructs a new ConversationCreateRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationCreateRequest);

            /**
             * Creates a new ConversationCreateRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationCreateRequest instance
             */
            public static create(properties?: berty.chat.IConversationCreateRequest): berty.chat.ConversationCreateRequest;

            /**
             * Encodes the specified ConversationCreateRequest message. Does not implicitly {@link berty.chat.ConversationCreateRequest.verify|verify} messages.
             * @param message ConversationCreateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationCreateRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationCreateRequest.verify|verify} messages.
             * @param message ConversationCreateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationCreateRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationCreateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationCreateRequest;

            /**
             * Decodes a ConversationCreateRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationCreateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationCreateRequest;

            /**
             * Verifies a ConversationCreateRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationCreateRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationCreateRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationCreateRequest;

            /**
             * Creates a plain object from a ConversationCreateRequest message. Also converts values to other types if specified.
             * @param message ConversationCreateRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationCreateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationCreateRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationCreateReply. */
        interface IConversationCreateReply {
        }

        /** Represents a ConversationCreateReply. */
        class ConversationCreateReply implements IConversationCreateReply {

            /**
             * Constructs a new ConversationCreateReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationCreateReply);

            /**
             * Creates a new ConversationCreateReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationCreateReply instance
             */
            public static create(properties?: berty.chat.IConversationCreateReply): berty.chat.ConversationCreateReply;

            /**
             * Encodes the specified ConversationCreateReply message. Does not implicitly {@link berty.chat.ConversationCreateReply.verify|verify} messages.
             * @param message ConversationCreateReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationCreateReply message, length delimited. Does not implicitly {@link berty.chat.ConversationCreateReply.verify|verify} messages.
             * @param message ConversationCreateReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationCreateReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationCreateReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationCreateReply;

            /**
             * Decodes a ConversationCreateReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationCreateReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationCreateReply;

            /**
             * Verifies a ConversationCreateReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationCreateReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationCreateReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationCreateReply;

            /**
             * Creates a plain object from a ConversationCreateReply message. Also converts values to other types if specified.
             * @param message ConversationCreateReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationCreateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationCreateReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationLeaveRequest. */
        interface IConversationLeaveRequest {
        }

        /** Represents a ConversationLeaveRequest. */
        class ConversationLeaveRequest implements IConversationLeaveRequest {

            /**
             * Constructs a new ConversationLeaveRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationLeaveRequest);

            /**
             * Creates a new ConversationLeaveRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationLeaveRequest instance
             */
            public static create(properties?: berty.chat.IConversationLeaveRequest): berty.chat.ConversationLeaveRequest;

            /**
             * Encodes the specified ConversationLeaveRequest message. Does not implicitly {@link berty.chat.ConversationLeaveRequest.verify|verify} messages.
             * @param message ConversationLeaveRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationLeaveRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationLeaveRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationLeaveRequest.verify|verify} messages.
             * @param message ConversationLeaveRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationLeaveRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationLeaveRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationLeaveRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationLeaveRequest;

            /**
             * Decodes a ConversationLeaveRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationLeaveRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationLeaveRequest;

            /**
             * Verifies a ConversationLeaveRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationLeaveRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationLeaveRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationLeaveRequest;

            /**
             * Creates a plain object from a ConversationLeaveRequest message. Also converts values to other types if specified.
             * @param message ConversationLeaveRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationLeaveRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationLeaveRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationLeaveReply. */
        interface IConversationLeaveReply {
        }

        /** Represents a ConversationLeaveReply. */
        class ConversationLeaveReply implements IConversationLeaveReply {

            /**
             * Constructs a new ConversationLeaveReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationLeaveReply);

            /**
             * Creates a new ConversationLeaveReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationLeaveReply instance
             */
            public static create(properties?: berty.chat.IConversationLeaveReply): berty.chat.ConversationLeaveReply;

            /**
             * Encodes the specified ConversationLeaveReply message. Does not implicitly {@link berty.chat.ConversationLeaveReply.verify|verify} messages.
             * @param message ConversationLeaveReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationLeaveReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationLeaveReply message, length delimited. Does not implicitly {@link berty.chat.ConversationLeaveReply.verify|verify} messages.
             * @param message ConversationLeaveReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationLeaveReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationLeaveReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationLeaveReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationLeaveReply;

            /**
             * Decodes a ConversationLeaveReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationLeaveReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationLeaveReply;

            /**
             * Verifies a ConversationLeaveReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationLeaveReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationLeaveReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationLeaveReply;

            /**
             * Creates a plain object from a ConversationLeaveReply message. Also converts values to other types if specified.
             * @param message ConversationLeaveReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationLeaveReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationLeaveReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationEraseRequest. */
        interface IConversationEraseRequest {
        }

        /** Represents a ConversationEraseRequest. */
        class ConversationEraseRequest implements IConversationEraseRequest {

            /**
             * Constructs a new ConversationEraseRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationEraseRequest);

            /**
             * Creates a new ConversationEraseRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationEraseRequest instance
             */
            public static create(properties?: berty.chat.IConversationEraseRequest): berty.chat.ConversationEraseRequest;

            /**
             * Encodes the specified ConversationEraseRequest message. Does not implicitly {@link berty.chat.ConversationEraseRequest.verify|verify} messages.
             * @param message ConversationEraseRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationEraseRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationEraseRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationEraseRequest.verify|verify} messages.
             * @param message ConversationEraseRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationEraseRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationEraseRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationEraseRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationEraseRequest;

            /**
             * Decodes a ConversationEraseRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationEraseRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationEraseRequest;

            /**
             * Verifies a ConversationEraseRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationEraseRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationEraseRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationEraseRequest;

            /**
             * Creates a plain object from a ConversationEraseRequest message. Also converts values to other types if specified.
             * @param message ConversationEraseRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationEraseRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationEraseRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationEraseReply. */
        interface IConversationEraseReply {
        }

        /** Represents a ConversationEraseReply. */
        class ConversationEraseReply implements IConversationEraseReply {

            /**
             * Constructs a new ConversationEraseReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationEraseReply);

            /**
             * Creates a new ConversationEraseReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationEraseReply instance
             */
            public static create(properties?: berty.chat.IConversationEraseReply): berty.chat.ConversationEraseReply;

            /**
             * Encodes the specified ConversationEraseReply message. Does not implicitly {@link berty.chat.ConversationEraseReply.verify|verify} messages.
             * @param message ConversationEraseReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationEraseReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationEraseReply message, length delimited. Does not implicitly {@link berty.chat.ConversationEraseReply.verify|verify} messages.
             * @param message ConversationEraseReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationEraseReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationEraseReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationEraseReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationEraseReply;

            /**
             * Decodes a ConversationEraseReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationEraseReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationEraseReply;

            /**
             * Verifies a ConversationEraseReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationEraseReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationEraseReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationEraseReply;

            /**
             * Creates a plain object from a ConversationEraseReply message. Also converts values to other types if specified.
             * @param message ConversationEraseReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationEraseReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationEraseReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationSetSeenPositionRequest. */
        interface IConversationSetSeenPositionRequest {
        }

        /** Represents a ConversationSetSeenPositionRequest. */
        class ConversationSetSeenPositionRequest implements IConversationSetSeenPositionRequest {

            /**
             * Constructs a new ConversationSetSeenPositionRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationSetSeenPositionRequest);

            /**
             * Creates a new ConversationSetSeenPositionRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationSetSeenPositionRequest instance
             */
            public static create(properties?: berty.chat.IConversationSetSeenPositionRequest): berty.chat.ConversationSetSeenPositionRequest;

            /**
             * Encodes the specified ConversationSetSeenPositionRequest message. Does not implicitly {@link berty.chat.ConversationSetSeenPositionRequest.verify|verify} messages.
             * @param message ConversationSetSeenPositionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationSetSeenPositionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationSetSeenPositionRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationSetSeenPositionRequest.verify|verify} messages.
             * @param message ConversationSetSeenPositionRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationSetSeenPositionRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationSetSeenPositionRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationSetSeenPositionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationSetSeenPositionRequest;

            /**
             * Decodes a ConversationSetSeenPositionRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationSetSeenPositionRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationSetSeenPositionRequest;

            /**
             * Verifies a ConversationSetSeenPositionRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationSetSeenPositionRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationSetSeenPositionRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationSetSeenPositionRequest;

            /**
             * Creates a plain object from a ConversationSetSeenPositionRequest message. Also converts values to other types if specified.
             * @param message ConversationSetSeenPositionRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationSetSeenPositionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationSetSeenPositionRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationSetSeenPositionReply. */
        interface IConversationSetSeenPositionReply {
        }

        /** Represents a ConversationSetSeenPositionReply. */
        class ConversationSetSeenPositionReply implements IConversationSetSeenPositionReply {

            /**
             * Constructs a new ConversationSetSeenPositionReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationSetSeenPositionReply);

            /**
             * Creates a new ConversationSetSeenPositionReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationSetSeenPositionReply instance
             */
            public static create(properties?: berty.chat.IConversationSetSeenPositionReply): berty.chat.ConversationSetSeenPositionReply;

            /**
             * Encodes the specified ConversationSetSeenPositionReply message. Does not implicitly {@link berty.chat.ConversationSetSeenPositionReply.verify|verify} messages.
             * @param message ConversationSetSeenPositionReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationSetSeenPositionReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationSetSeenPositionReply message, length delimited. Does not implicitly {@link berty.chat.ConversationSetSeenPositionReply.verify|verify} messages.
             * @param message ConversationSetSeenPositionReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationSetSeenPositionReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationSetSeenPositionReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationSetSeenPositionReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationSetSeenPositionReply;

            /**
             * Decodes a ConversationSetSeenPositionReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationSetSeenPositionReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationSetSeenPositionReply;

            /**
             * Verifies a ConversationSetSeenPositionReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationSetSeenPositionReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationSetSeenPositionReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationSetSeenPositionReply;

            /**
             * Creates a plain object from a ConversationSetSeenPositionReply message. Also converts values to other types if specified.
             * @param message ConversationSetSeenPositionReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationSetSeenPositionReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationSetSeenPositionReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationMessageListRequest. */
        interface IConversationMessageListRequest {
        }

        /** Represents a ConversationMessageListRequest. */
        class ConversationMessageListRequest implements IConversationMessageListRequest {

            /**
             * Constructs a new ConversationMessageListRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationMessageListRequest);

            /**
             * Creates a new ConversationMessageListRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationMessageListRequest instance
             */
            public static create(properties?: berty.chat.IConversationMessageListRequest): berty.chat.ConversationMessageListRequest;

            /**
             * Encodes the specified ConversationMessageListRequest message. Does not implicitly {@link berty.chat.ConversationMessageListRequest.verify|verify} messages.
             * @param message ConversationMessageListRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationMessageListRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationMessageListRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationMessageListRequest.verify|verify} messages.
             * @param message ConversationMessageListRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationMessageListRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationMessageListRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationMessageListRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageListRequest;

            /**
             * Decodes a ConversationMessageListRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationMessageListRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageListRequest;

            /**
             * Verifies a ConversationMessageListRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationMessageListRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationMessageListRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageListRequest;

            /**
             * Creates a plain object from a ConversationMessageListRequest message. Also converts values to other types if specified.
             * @param message ConversationMessageListRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationMessageListRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationMessageListRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationMessageListReply. */
        interface IConversationMessageListReply {
        }

        /** Represents a ConversationMessageListReply. */
        class ConversationMessageListReply implements IConversationMessageListReply {

            /**
             * Constructs a new ConversationMessageListReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationMessageListReply);

            /**
             * Creates a new ConversationMessageListReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationMessageListReply instance
             */
            public static create(properties?: berty.chat.IConversationMessageListReply): berty.chat.ConversationMessageListReply;

            /**
             * Encodes the specified ConversationMessageListReply message. Does not implicitly {@link berty.chat.ConversationMessageListReply.verify|verify} messages.
             * @param message ConversationMessageListReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationMessageListReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationMessageListReply message, length delimited. Does not implicitly {@link berty.chat.ConversationMessageListReply.verify|verify} messages.
             * @param message ConversationMessageListReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationMessageListReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationMessageListReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationMessageListReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageListReply;

            /**
             * Decodes a ConversationMessageListReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationMessageListReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageListReply;

            /**
             * Verifies a ConversationMessageListReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationMessageListReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationMessageListReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageListReply;

            /**
             * Creates a plain object from a ConversationMessageListReply message. Also converts values to other types if specified.
             * @param message ConversationMessageListReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationMessageListReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationMessageListReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationMessageSendRequest. */
        interface IConversationMessageSendRequest {
        }

        /** Represents a ConversationMessageSendRequest. */
        class ConversationMessageSendRequest implements IConversationMessageSendRequest {

            /**
             * Constructs a new ConversationMessageSendRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationMessageSendRequest);

            /**
             * Creates a new ConversationMessageSendRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationMessageSendRequest instance
             */
            public static create(properties?: berty.chat.IConversationMessageSendRequest): berty.chat.ConversationMessageSendRequest;

            /**
             * Encodes the specified ConversationMessageSendRequest message. Does not implicitly {@link berty.chat.ConversationMessageSendRequest.verify|verify} messages.
             * @param message ConversationMessageSendRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationMessageSendRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationMessageSendRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationMessageSendRequest.verify|verify} messages.
             * @param message ConversationMessageSendRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationMessageSendRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationMessageSendRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationMessageSendRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageSendRequest;

            /**
             * Decodes a ConversationMessageSendRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationMessageSendRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageSendRequest;

            /**
             * Verifies a ConversationMessageSendRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationMessageSendRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationMessageSendRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageSendRequest;

            /**
             * Creates a plain object from a ConversationMessageSendRequest message. Also converts values to other types if specified.
             * @param message ConversationMessageSendRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationMessageSendRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationMessageSendRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationMessageSendReply. */
        interface IConversationMessageSendReply {
        }

        /** Represents a ConversationMessageSendReply. */
        class ConversationMessageSendReply implements IConversationMessageSendReply {

            /**
             * Constructs a new ConversationMessageSendReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationMessageSendReply);

            /**
             * Creates a new ConversationMessageSendReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationMessageSendReply instance
             */
            public static create(properties?: berty.chat.IConversationMessageSendReply): berty.chat.ConversationMessageSendReply;

            /**
             * Encodes the specified ConversationMessageSendReply message. Does not implicitly {@link berty.chat.ConversationMessageSendReply.verify|verify} messages.
             * @param message ConversationMessageSendReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationMessageSendReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationMessageSendReply message, length delimited. Does not implicitly {@link berty.chat.ConversationMessageSendReply.verify|verify} messages.
             * @param message ConversationMessageSendReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationMessageSendReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationMessageSendReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationMessageSendReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageSendReply;

            /**
             * Decodes a ConversationMessageSendReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationMessageSendReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageSendReply;

            /**
             * Verifies a ConversationMessageSendReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationMessageSendReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationMessageSendReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageSendReply;

            /**
             * Creates a plain object from a ConversationMessageSendReply message. Also converts values to other types if specified.
             * @param message ConversationMessageSendReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationMessageSendReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationMessageSendReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationMessageEditRequest. */
        interface IConversationMessageEditRequest {
        }

        /** Represents a ConversationMessageEditRequest. */
        class ConversationMessageEditRequest implements IConversationMessageEditRequest {

            /**
             * Constructs a new ConversationMessageEditRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationMessageEditRequest);

            /**
             * Creates a new ConversationMessageEditRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationMessageEditRequest instance
             */
            public static create(properties?: berty.chat.IConversationMessageEditRequest): berty.chat.ConversationMessageEditRequest;

            /**
             * Encodes the specified ConversationMessageEditRequest message. Does not implicitly {@link berty.chat.ConversationMessageEditRequest.verify|verify} messages.
             * @param message ConversationMessageEditRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationMessageEditRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationMessageEditRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationMessageEditRequest.verify|verify} messages.
             * @param message ConversationMessageEditRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationMessageEditRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationMessageEditRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationMessageEditRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageEditRequest;

            /**
             * Decodes a ConversationMessageEditRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationMessageEditRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageEditRequest;

            /**
             * Verifies a ConversationMessageEditRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationMessageEditRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationMessageEditRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageEditRequest;

            /**
             * Creates a plain object from a ConversationMessageEditRequest message. Also converts values to other types if specified.
             * @param message ConversationMessageEditRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationMessageEditRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationMessageEditRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationMessageEditReply. */
        interface IConversationMessageEditReply {
        }

        /** Represents a ConversationMessageEditReply. */
        class ConversationMessageEditReply implements IConversationMessageEditReply {

            /**
             * Constructs a new ConversationMessageEditReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationMessageEditReply);

            /**
             * Creates a new ConversationMessageEditReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationMessageEditReply instance
             */
            public static create(properties?: berty.chat.IConversationMessageEditReply): berty.chat.ConversationMessageEditReply;

            /**
             * Encodes the specified ConversationMessageEditReply message. Does not implicitly {@link berty.chat.ConversationMessageEditReply.verify|verify} messages.
             * @param message ConversationMessageEditReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationMessageEditReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationMessageEditReply message, length delimited. Does not implicitly {@link berty.chat.ConversationMessageEditReply.verify|verify} messages.
             * @param message ConversationMessageEditReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationMessageEditReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationMessageEditReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationMessageEditReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageEditReply;

            /**
             * Decodes a ConversationMessageEditReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationMessageEditReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageEditReply;

            /**
             * Verifies a ConversationMessageEditReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationMessageEditReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationMessageEditReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageEditReply;

            /**
             * Creates a plain object from a ConversationMessageEditReply message. Also converts values to other types if specified.
             * @param message ConversationMessageEditReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationMessageEditReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationMessageEditReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationMessageHideRequest. */
        interface IConversationMessageHideRequest {
        }

        /** Represents a ConversationMessageHideRequest. */
        class ConversationMessageHideRequest implements IConversationMessageHideRequest {

            /**
             * Constructs a new ConversationMessageHideRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationMessageHideRequest);

            /**
             * Creates a new ConversationMessageHideRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationMessageHideRequest instance
             */
            public static create(properties?: berty.chat.IConversationMessageHideRequest): berty.chat.ConversationMessageHideRequest;

            /**
             * Encodes the specified ConversationMessageHideRequest message. Does not implicitly {@link berty.chat.ConversationMessageHideRequest.verify|verify} messages.
             * @param message ConversationMessageHideRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationMessageHideRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationMessageHideRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationMessageHideRequest.verify|verify} messages.
             * @param message ConversationMessageHideRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationMessageHideRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationMessageHideRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationMessageHideRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageHideRequest;

            /**
             * Decodes a ConversationMessageHideRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationMessageHideRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageHideRequest;

            /**
             * Verifies a ConversationMessageHideRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationMessageHideRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationMessageHideRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageHideRequest;

            /**
             * Creates a plain object from a ConversationMessageHideRequest message. Also converts values to other types if specified.
             * @param message ConversationMessageHideRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationMessageHideRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationMessageHideRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationMessageHideReply. */
        interface IConversationMessageHideReply {
        }

        /** Represents a ConversationMessageHideReply. */
        class ConversationMessageHideReply implements IConversationMessageHideReply {

            /**
             * Constructs a new ConversationMessageHideReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationMessageHideReply);

            /**
             * Creates a new ConversationMessageHideReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationMessageHideReply instance
             */
            public static create(properties?: berty.chat.IConversationMessageHideReply): berty.chat.ConversationMessageHideReply;

            /**
             * Encodes the specified ConversationMessageHideReply message. Does not implicitly {@link berty.chat.ConversationMessageHideReply.verify|verify} messages.
             * @param message ConversationMessageHideReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationMessageHideReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationMessageHideReply message, length delimited. Does not implicitly {@link berty.chat.ConversationMessageHideReply.verify|verify} messages.
             * @param message ConversationMessageHideReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationMessageHideReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationMessageHideReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationMessageHideReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageHideReply;

            /**
             * Decodes a ConversationMessageHideReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationMessageHideReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageHideReply;

            /**
             * Verifies a ConversationMessageHideReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationMessageHideReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationMessageHideReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageHideReply;

            /**
             * Creates a plain object from a ConversationMessageHideReply message. Also converts values to other types if specified.
             * @param message ConversationMessageHideReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationMessageHideReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationMessageHideReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationUpdateSettingsRequest. */
        interface IConversationUpdateSettingsRequest {
        }

        /** Represents a ConversationUpdateSettingsRequest. */
        class ConversationUpdateSettingsRequest implements IConversationUpdateSettingsRequest {

            /**
             * Constructs a new ConversationUpdateSettingsRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationUpdateSettingsRequest);

            /**
             * Creates a new ConversationUpdateSettingsRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationUpdateSettingsRequest instance
             */
            public static create(properties?: berty.chat.IConversationUpdateSettingsRequest): berty.chat.ConversationUpdateSettingsRequest;

            /**
             * Encodes the specified ConversationUpdateSettingsRequest message. Does not implicitly {@link berty.chat.ConversationUpdateSettingsRequest.verify|verify} messages.
             * @param message ConversationUpdateSettingsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationUpdateSettingsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationUpdateSettingsRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationUpdateSettingsRequest.verify|verify} messages.
             * @param message ConversationUpdateSettingsRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationUpdateSettingsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationUpdateSettingsRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationUpdateSettingsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationUpdateSettingsRequest;

            /**
             * Decodes a ConversationUpdateSettingsRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationUpdateSettingsRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationUpdateSettingsRequest;

            /**
             * Verifies a ConversationUpdateSettingsRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationUpdateSettingsRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationUpdateSettingsRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationUpdateSettingsRequest;

            /**
             * Creates a plain object from a ConversationUpdateSettingsRequest message. Also converts values to other types if specified.
             * @param message ConversationUpdateSettingsRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationUpdateSettingsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationUpdateSettingsRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationUpdateSettingsReply. */
        interface IConversationUpdateSettingsReply {
        }

        /** Represents a ConversationUpdateSettingsReply. */
        class ConversationUpdateSettingsReply implements IConversationUpdateSettingsReply {

            /**
             * Constructs a new ConversationUpdateSettingsReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationUpdateSettingsReply);

            /**
             * Creates a new ConversationUpdateSettingsReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationUpdateSettingsReply instance
             */
            public static create(properties?: berty.chat.IConversationUpdateSettingsReply): berty.chat.ConversationUpdateSettingsReply;

            /**
             * Encodes the specified ConversationUpdateSettingsReply message. Does not implicitly {@link berty.chat.ConversationUpdateSettingsReply.verify|verify} messages.
             * @param message ConversationUpdateSettingsReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationUpdateSettingsReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationUpdateSettingsReply message, length delimited. Does not implicitly {@link berty.chat.ConversationUpdateSettingsReply.verify|verify} messages.
             * @param message ConversationUpdateSettingsReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationUpdateSettingsReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationUpdateSettingsReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationUpdateSettingsReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationUpdateSettingsReply;

            /**
             * Decodes a ConversationUpdateSettingsReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationUpdateSettingsReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationUpdateSettingsReply;

            /**
             * Verifies a ConversationUpdateSettingsReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationUpdateSettingsReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationUpdateSettingsReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationUpdateSettingsReply;

            /**
             * Creates a plain object from a ConversationUpdateSettingsReply message. Also converts values to other types if specified.
             * @param message ConversationUpdateSettingsReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationUpdateSettingsReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationUpdateSettingsReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationInvitationAcceptRequest. */
        interface IConversationInvitationAcceptRequest {
        }

        /** Represents a ConversationInvitationAcceptRequest. */
        class ConversationInvitationAcceptRequest implements IConversationInvitationAcceptRequest {

            /**
             * Constructs a new ConversationInvitationAcceptRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationInvitationAcceptRequest);

            /**
             * Creates a new ConversationInvitationAcceptRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationInvitationAcceptRequest instance
             */
            public static create(properties?: berty.chat.IConversationInvitationAcceptRequest): berty.chat.ConversationInvitationAcceptRequest;

            /**
             * Encodes the specified ConversationInvitationAcceptRequest message. Does not implicitly {@link berty.chat.ConversationInvitationAcceptRequest.verify|verify} messages.
             * @param message ConversationInvitationAcceptRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationInvitationAcceptRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationInvitationAcceptRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationInvitationAcceptRequest.verify|verify} messages.
             * @param message ConversationInvitationAcceptRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationInvitationAcceptRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationInvitationAcceptRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationInvitationAcceptRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationAcceptRequest;

            /**
             * Decodes a ConversationInvitationAcceptRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationInvitationAcceptRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationAcceptRequest;

            /**
             * Verifies a ConversationInvitationAcceptRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationInvitationAcceptRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationInvitationAcceptRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationAcceptRequest;

            /**
             * Creates a plain object from a ConversationInvitationAcceptRequest message. Also converts values to other types if specified.
             * @param message ConversationInvitationAcceptRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationInvitationAcceptRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationInvitationAcceptRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationInvitationAcceptReply. */
        interface IConversationInvitationAcceptReply {
        }

        /** Represents a ConversationInvitationAcceptReply. */
        class ConversationInvitationAcceptReply implements IConversationInvitationAcceptReply {

            /**
             * Constructs a new ConversationInvitationAcceptReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationInvitationAcceptReply);

            /**
             * Creates a new ConversationInvitationAcceptReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationInvitationAcceptReply instance
             */
            public static create(properties?: berty.chat.IConversationInvitationAcceptReply): berty.chat.ConversationInvitationAcceptReply;

            /**
             * Encodes the specified ConversationInvitationAcceptReply message. Does not implicitly {@link berty.chat.ConversationInvitationAcceptReply.verify|verify} messages.
             * @param message ConversationInvitationAcceptReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationInvitationAcceptReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationInvitationAcceptReply message, length delimited. Does not implicitly {@link berty.chat.ConversationInvitationAcceptReply.verify|verify} messages.
             * @param message ConversationInvitationAcceptReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationInvitationAcceptReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationInvitationAcceptReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationInvitationAcceptReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationAcceptReply;

            /**
             * Decodes a ConversationInvitationAcceptReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationInvitationAcceptReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationAcceptReply;

            /**
             * Verifies a ConversationInvitationAcceptReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationInvitationAcceptReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationInvitationAcceptReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationAcceptReply;

            /**
             * Creates a plain object from a ConversationInvitationAcceptReply message. Also converts values to other types if specified.
             * @param message ConversationInvitationAcceptReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationInvitationAcceptReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationInvitationAcceptReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationInvitationCreateRequest. */
        interface IConversationInvitationCreateRequest {
        }

        /** Represents a ConversationInvitationCreateRequest. */
        class ConversationInvitationCreateRequest implements IConversationInvitationCreateRequest {

            /**
             * Constructs a new ConversationInvitationCreateRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationInvitationCreateRequest);

            /**
             * Creates a new ConversationInvitationCreateRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationInvitationCreateRequest instance
             */
            public static create(properties?: berty.chat.IConversationInvitationCreateRequest): berty.chat.ConversationInvitationCreateRequest;

            /**
             * Encodes the specified ConversationInvitationCreateRequest message. Does not implicitly {@link berty.chat.ConversationInvitationCreateRequest.verify|verify} messages.
             * @param message ConversationInvitationCreateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationInvitationCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationInvitationCreateRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationInvitationCreateRequest.verify|verify} messages.
             * @param message ConversationInvitationCreateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationInvitationCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationInvitationCreateRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationInvitationCreateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationCreateRequest;

            /**
             * Decodes a ConversationInvitationCreateRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationInvitationCreateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationCreateRequest;

            /**
             * Verifies a ConversationInvitationCreateRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationInvitationCreateRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationInvitationCreateRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationCreateRequest;

            /**
             * Creates a plain object from a ConversationInvitationCreateRequest message. Also converts values to other types if specified.
             * @param message ConversationInvitationCreateRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationInvitationCreateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationInvitationCreateRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationInvitationCreateReply. */
        interface IConversationInvitationCreateReply {
        }

        /** Represents a ConversationInvitationCreateReply. */
        class ConversationInvitationCreateReply implements IConversationInvitationCreateReply {

            /**
             * Constructs a new ConversationInvitationCreateReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationInvitationCreateReply);

            /**
             * Creates a new ConversationInvitationCreateReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationInvitationCreateReply instance
             */
            public static create(properties?: berty.chat.IConversationInvitationCreateReply): berty.chat.ConversationInvitationCreateReply;

            /**
             * Encodes the specified ConversationInvitationCreateReply message. Does not implicitly {@link berty.chat.ConversationInvitationCreateReply.verify|verify} messages.
             * @param message ConversationInvitationCreateReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationInvitationCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationInvitationCreateReply message, length delimited. Does not implicitly {@link berty.chat.ConversationInvitationCreateReply.verify|verify} messages.
             * @param message ConversationInvitationCreateReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationInvitationCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationInvitationCreateReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationInvitationCreateReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationCreateReply;

            /**
             * Decodes a ConversationInvitationCreateReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationInvitationCreateReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationCreateReply;

            /**
             * Verifies a ConversationInvitationCreateReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationInvitationCreateReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationInvitationCreateReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationCreateReply;

            /**
             * Creates a plain object from a ConversationInvitationCreateReply message. Also converts values to other types if specified.
             * @param message ConversationInvitationCreateReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationInvitationCreateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationInvitationCreateReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationInvitationDiscardRequest. */
        interface IConversationInvitationDiscardRequest {
        }

        /** Represents a ConversationInvitationDiscardRequest. */
        class ConversationInvitationDiscardRequest implements IConversationInvitationDiscardRequest {

            /**
             * Constructs a new ConversationInvitationDiscardRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationInvitationDiscardRequest);

            /**
             * Creates a new ConversationInvitationDiscardRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationInvitationDiscardRequest instance
             */
            public static create(properties?: berty.chat.IConversationInvitationDiscardRequest): berty.chat.ConversationInvitationDiscardRequest;

            /**
             * Encodes the specified ConversationInvitationDiscardRequest message. Does not implicitly {@link berty.chat.ConversationInvitationDiscardRequest.verify|verify} messages.
             * @param message ConversationInvitationDiscardRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationInvitationDiscardRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationInvitationDiscardRequest message, length delimited. Does not implicitly {@link berty.chat.ConversationInvitationDiscardRequest.verify|verify} messages.
             * @param message ConversationInvitationDiscardRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationInvitationDiscardRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationInvitationDiscardRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationInvitationDiscardRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationDiscardRequest;

            /**
             * Decodes a ConversationInvitationDiscardRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationInvitationDiscardRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationDiscardRequest;

            /**
             * Verifies a ConversationInvitationDiscardRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationInvitationDiscardRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationInvitationDiscardRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationDiscardRequest;

            /**
             * Creates a plain object from a ConversationInvitationDiscardRequest message. Also converts values to other types if specified.
             * @param message ConversationInvitationDiscardRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationInvitationDiscardRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationInvitationDiscardRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ConversationInvitationDiscardReply. */
        interface IConversationInvitationDiscardReply {
        }

        /** Represents a ConversationInvitationDiscardReply. */
        class ConversationInvitationDiscardReply implements IConversationInvitationDiscardReply {

            /**
             * Constructs a new ConversationInvitationDiscardReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IConversationInvitationDiscardReply);

            /**
             * Creates a new ConversationInvitationDiscardReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ConversationInvitationDiscardReply instance
             */
            public static create(properties?: berty.chat.IConversationInvitationDiscardReply): berty.chat.ConversationInvitationDiscardReply;

            /**
             * Encodes the specified ConversationInvitationDiscardReply message. Does not implicitly {@link berty.chat.ConversationInvitationDiscardReply.verify|verify} messages.
             * @param message ConversationInvitationDiscardReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IConversationInvitationDiscardReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ConversationInvitationDiscardReply message, length delimited. Does not implicitly {@link berty.chat.ConversationInvitationDiscardReply.verify|verify} messages.
             * @param message ConversationInvitationDiscardReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IConversationInvitationDiscardReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ConversationInvitationDiscardReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ConversationInvitationDiscardReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationDiscardReply;

            /**
             * Decodes a ConversationInvitationDiscardReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ConversationInvitationDiscardReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationDiscardReply;

            /**
             * Verifies a ConversationInvitationDiscardReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ConversationInvitationDiscardReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ConversationInvitationDiscardReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationDiscardReply;

            /**
             * Creates a plain object from a ConversationInvitationDiscardReply message. Also converts values to other types if specified.
             * @param message ConversationInvitationDiscardReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ConversationInvitationDiscardReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ConversationInvitationDiscardReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactListRequest. */
        interface IContactListRequest {
        }

        /** Represents a ContactListRequest. */
        class ContactListRequest implements IContactListRequest {

            /**
             * Constructs a new ContactListRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactListRequest);

            /**
             * Creates a new ContactListRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactListRequest instance
             */
            public static create(properties?: berty.chat.IContactListRequest): berty.chat.ContactListRequest;

            /**
             * Encodes the specified ContactListRequest message. Does not implicitly {@link berty.chat.ContactListRequest.verify|verify} messages.
             * @param message ContactListRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactListRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactListRequest message, length delimited. Does not implicitly {@link berty.chat.ContactListRequest.verify|verify} messages.
             * @param message ContactListRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactListRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactListRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactListRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactListRequest;

            /**
             * Decodes a ContactListRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactListRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactListRequest;

            /**
             * Verifies a ContactListRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactListRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactListRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactListRequest;

            /**
             * Creates a plain object from a ContactListRequest message. Also converts values to other types if specified.
             * @param message ContactListRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactListRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactListRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactListReply. */
        interface IContactListReply {
        }

        /** Represents a ContactListReply. */
        class ContactListReply implements IContactListReply {

            /**
             * Constructs a new ContactListReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactListReply);

            /**
             * Creates a new ContactListReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactListReply instance
             */
            public static create(properties?: berty.chat.IContactListReply): berty.chat.ContactListReply;

            /**
             * Encodes the specified ContactListReply message. Does not implicitly {@link berty.chat.ContactListReply.verify|verify} messages.
             * @param message ContactListReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactListReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactListReply message, length delimited. Does not implicitly {@link berty.chat.ContactListReply.verify|verify} messages.
             * @param message ContactListReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactListReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactListReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactListReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactListReply;

            /**
             * Decodes a ContactListReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactListReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactListReply;

            /**
             * Verifies a ContactListReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactListReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactListReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactListReply;

            /**
             * Creates a plain object from a ContactListReply message. Also converts values to other types if specified.
             * @param message ContactListReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactListReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactListReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactGetRequest. */
        interface IContactGetRequest {
        }

        /** Represents a ContactGetRequest. */
        class ContactGetRequest implements IContactGetRequest {

            /**
             * Constructs a new ContactGetRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactGetRequest);

            /**
             * Creates a new ContactGetRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactGetRequest instance
             */
            public static create(properties?: berty.chat.IContactGetRequest): berty.chat.ContactGetRequest;

            /**
             * Encodes the specified ContactGetRequest message. Does not implicitly {@link berty.chat.ContactGetRequest.verify|verify} messages.
             * @param message ContactGetRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactGetRequest message, length delimited. Does not implicitly {@link berty.chat.ContactGetRequest.verify|verify} messages.
             * @param message ContactGetRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactGetRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactGetRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactGetRequest;

            /**
             * Decodes a ContactGetRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactGetRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactGetRequest;

            /**
             * Verifies a ContactGetRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactGetRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactGetRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactGetRequest;

            /**
             * Creates a plain object from a ContactGetRequest message. Also converts values to other types if specified.
             * @param message ContactGetRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactGetRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactGetRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactGetReply. */
        interface IContactGetReply {
        }

        /** Represents a ContactGetReply. */
        class ContactGetReply implements IContactGetReply {

            /**
             * Constructs a new ContactGetReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactGetReply);

            /**
             * Creates a new ContactGetReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactGetReply instance
             */
            public static create(properties?: berty.chat.IContactGetReply): berty.chat.ContactGetReply;

            /**
             * Encodes the specified ContactGetReply message. Does not implicitly {@link berty.chat.ContactGetReply.verify|verify} messages.
             * @param message ContactGetReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactGetReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactGetReply message, length delimited. Does not implicitly {@link berty.chat.ContactGetReply.verify|verify} messages.
             * @param message ContactGetReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactGetReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactGetReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactGetReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactGetReply;

            /**
             * Decodes a ContactGetReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactGetReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactGetReply;

            /**
             * Verifies a ContactGetReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactGetReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactGetReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactGetReply;

            /**
             * Creates a plain object from a ContactGetReply message. Also converts values to other types if specified.
             * @param message ContactGetReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactGetReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactGetReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactUpdateRequest. */
        interface IContactUpdateRequest {
        }

        /** Represents a ContactUpdateRequest. */
        class ContactUpdateRequest implements IContactUpdateRequest {

            /**
             * Constructs a new ContactUpdateRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactUpdateRequest);

            /**
             * Creates a new ContactUpdateRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactUpdateRequest instance
             */
            public static create(properties?: berty.chat.IContactUpdateRequest): berty.chat.ContactUpdateRequest;

            /**
             * Encodes the specified ContactUpdateRequest message. Does not implicitly {@link berty.chat.ContactUpdateRequest.verify|verify} messages.
             * @param message ContactUpdateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactUpdateRequest message, length delimited. Does not implicitly {@link berty.chat.ContactUpdateRequest.verify|verify} messages.
             * @param message ContactUpdateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactUpdateRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactUpdateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactUpdateRequest;

            /**
             * Decodes a ContactUpdateRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactUpdateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactUpdateRequest;

            /**
             * Verifies a ContactUpdateRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactUpdateRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactUpdateRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactUpdateRequest;

            /**
             * Creates a plain object from a ContactUpdateRequest message. Also converts values to other types if specified.
             * @param message ContactUpdateRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactUpdateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactUpdateRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactUpdateReply. */
        interface IContactUpdateReply {
        }

        /** Represents a ContactUpdateReply. */
        class ContactUpdateReply implements IContactUpdateReply {

            /**
             * Constructs a new ContactUpdateReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactUpdateReply);

            /**
             * Creates a new ContactUpdateReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactUpdateReply instance
             */
            public static create(properties?: berty.chat.IContactUpdateReply): berty.chat.ContactUpdateReply;

            /**
             * Encodes the specified ContactUpdateReply message. Does not implicitly {@link berty.chat.ContactUpdateReply.verify|verify} messages.
             * @param message ContactUpdateReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactUpdateReply message, length delimited. Does not implicitly {@link berty.chat.ContactUpdateReply.verify|verify} messages.
             * @param message ContactUpdateReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactUpdateReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactUpdateReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactUpdateReply;

            /**
             * Decodes a ContactUpdateReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactUpdateReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactUpdateReply;

            /**
             * Verifies a ContactUpdateReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactUpdateReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactUpdateReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactUpdateReply;

            /**
             * Creates a plain object from a ContactUpdateReply message. Also converts values to other types if specified.
             * @param message ContactUpdateReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactUpdateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactUpdateReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactRemoveRequest. */
        interface IContactRemoveRequest {
        }

        /** Represents a ContactRemoveRequest. */
        class ContactRemoveRequest implements IContactRemoveRequest {

            /**
             * Constructs a new ContactRemoveRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactRemoveRequest);

            /**
             * Creates a new ContactRemoveRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactRemoveRequest instance
             */
            public static create(properties?: berty.chat.IContactRemoveRequest): berty.chat.ContactRemoveRequest;

            /**
             * Encodes the specified ContactRemoveRequest message. Does not implicitly {@link berty.chat.ContactRemoveRequest.verify|verify} messages.
             * @param message ContactRemoveRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactRemoveRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactRemoveRequest message, length delimited. Does not implicitly {@link berty.chat.ContactRemoveRequest.verify|verify} messages.
             * @param message ContactRemoveRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactRemoveRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactRemoveRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactRemoveRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRemoveRequest;

            /**
             * Decodes a ContactRemoveRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactRemoveRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRemoveRequest;

            /**
             * Verifies a ContactRemoveRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactRemoveRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactRemoveRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRemoveRequest;

            /**
             * Creates a plain object from a ContactRemoveRequest message. Also converts values to other types if specified.
             * @param message ContactRemoveRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactRemoveRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactRemoveRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactRemoveReply. */
        interface IContactRemoveReply {
        }

        /** Represents a ContactRemoveReply. */
        class ContactRemoveReply implements IContactRemoveReply {

            /**
             * Constructs a new ContactRemoveReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactRemoveReply);

            /**
             * Creates a new ContactRemoveReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactRemoveReply instance
             */
            public static create(properties?: berty.chat.IContactRemoveReply): berty.chat.ContactRemoveReply;

            /**
             * Encodes the specified ContactRemoveReply message. Does not implicitly {@link berty.chat.ContactRemoveReply.verify|verify} messages.
             * @param message ContactRemoveReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactRemoveReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactRemoveReply message, length delimited. Does not implicitly {@link berty.chat.ContactRemoveReply.verify|verify} messages.
             * @param message ContactRemoveReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactRemoveReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactRemoveReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactRemoveReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRemoveReply;

            /**
             * Decodes a ContactRemoveReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactRemoveReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRemoveReply;

            /**
             * Verifies a ContactRemoveReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactRemoveReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactRemoveReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRemoveReply;

            /**
             * Creates a plain object from a ContactRemoveReply message. Also converts values to other types if specified.
             * @param message ContactRemoveReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactRemoveReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactRemoveReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactRequestCreateRequest. */
        interface IContactRequestCreateRequest {
        }

        /** Represents a ContactRequestCreateRequest. */
        class ContactRequestCreateRequest implements IContactRequestCreateRequest {

            /**
             * Constructs a new ContactRequestCreateRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactRequestCreateRequest);

            /**
             * Creates a new ContactRequestCreateRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactRequestCreateRequest instance
             */
            public static create(properties?: berty.chat.IContactRequestCreateRequest): berty.chat.ContactRequestCreateRequest;

            /**
             * Encodes the specified ContactRequestCreateRequest message. Does not implicitly {@link berty.chat.ContactRequestCreateRequest.verify|verify} messages.
             * @param message ContactRequestCreateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactRequestCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactRequestCreateRequest message, length delimited. Does not implicitly {@link berty.chat.ContactRequestCreateRequest.verify|verify} messages.
             * @param message ContactRequestCreateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactRequestCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactRequestCreateRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactRequestCreateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestCreateRequest;

            /**
             * Decodes a ContactRequestCreateRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactRequestCreateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestCreateRequest;

            /**
             * Verifies a ContactRequestCreateRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactRequestCreateRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactRequestCreateRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestCreateRequest;

            /**
             * Creates a plain object from a ContactRequestCreateRequest message. Also converts values to other types if specified.
             * @param message ContactRequestCreateRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactRequestCreateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactRequestCreateRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactRequestCreateReply. */
        interface IContactRequestCreateReply {
        }

        /** Represents a ContactRequestCreateReply. */
        class ContactRequestCreateReply implements IContactRequestCreateReply {

            /**
             * Constructs a new ContactRequestCreateReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactRequestCreateReply);

            /**
             * Creates a new ContactRequestCreateReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactRequestCreateReply instance
             */
            public static create(properties?: berty.chat.IContactRequestCreateReply): berty.chat.ContactRequestCreateReply;

            /**
             * Encodes the specified ContactRequestCreateReply message. Does not implicitly {@link berty.chat.ContactRequestCreateReply.verify|verify} messages.
             * @param message ContactRequestCreateReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactRequestCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactRequestCreateReply message, length delimited. Does not implicitly {@link berty.chat.ContactRequestCreateReply.verify|verify} messages.
             * @param message ContactRequestCreateReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactRequestCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactRequestCreateReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactRequestCreateReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestCreateReply;

            /**
             * Decodes a ContactRequestCreateReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactRequestCreateReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestCreateReply;

            /**
             * Verifies a ContactRequestCreateReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactRequestCreateReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactRequestCreateReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestCreateReply;

            /**
             * Creates a plain object from a ContactRequestCreateReply message. Also converts values to other types if specified.
             * @param message ContactRequestCreateReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactRequestCreateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactRequestCreateReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactRequestAcceptRequest. */
        interface IContactRequestAcceptRequest {
        }

        /** Represents a ContactRequestAcceptRequest. */
        class ContactRequestAcceptRequest implements IContactRequestAcceptRequest {

            /**
             * Constructs a new ContactRequestAcceptRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactRequestAcceptRequest);

            /**
             * Creates a new ContactRequestAcceptRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactRequestAcceptRequest instance
             */
            public static create(properties?: berty.chat.IContactRequestAcceptRequest): berty.chat.ContactRequestAcceptRequest;

            /**
             * Encodes the specified ContactRequestAcceptRequest message. Does not implicitly {@link berty.chat.ContactRequestAcceptRequest.verify|verify} messages.
             * @param message ContactRequestAcceptRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactRequestAcceptRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactRequestAcceptRequest message, length delimited. Does not implicitly {@link berty.chat.ContactRequestAcceptRequest.verify|verify} messages.
             * @param message ContactRequestAcceptRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactRequestAcceptRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactRequestAcceptRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactRequestAcceptRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestAcceptRequest;

            /**
             * Decodes a ContactRequestAcceptRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactRequestAcceptRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestAcceptRequest;

            /**
             * Verifies a ContactRequestAcceptRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactRequestAcceptRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactRequestAcceptRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestAcceptRequest;

            /**
             * Creates a plain object from a ContactRequestAcceptRequest message. Also converts values to other types if specified.
             * @param message ContactRequestAcceptRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactRequestAcceptRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactRequestAcceptRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactRequestAcceptReply. */
        interface IContactRequestAcceptReply {
        }

        /** Represents a ContactRequestAcceptReply. */
        class ContactRequestAcceptReply implements IContactRequestAcceptReply {

            /**
             * Constructs a new ContactRequestAcceptReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactRequestAcceptReply);

            /**
             * Creates a new ContactRequestAcceptReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactRequestAcceptReply instance
             */
            public static create(properties?: berty.chat.IContactRequestAcceptReply): berty.chat.ContactRequestAcceptReply;

            /**
             * Encodes the specified ContactRequestAcceptReply message. Does not implicitly {@link berty.chat.ContactRequestAcceptReply.verify|verify} messages.
             * @param message ContactRequestAcceptReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactRequestAcceptReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactRequestAcceptReply message, length delimited. Does not implicitly {@link berty.chat.ContactRequestAcceptReply.verify|verify} messages.
             * @param message ContactRequestAcceptReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactRequestAcceptReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactRequestAcceptReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactRequestAcceptReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestAcceptReply;

            /**
             * Decodes a ContactRequestAcceptReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactRequestAcceptReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestAcceptReply;

            /**
             * Verifies a ContactRequestAcceptReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactRequestAcceptReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactRequestAcceptReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestAcceptReply;

            /**
             * Creates a plain object from a ContactRequestAcceptReply message. Also converts values to other types if specified.
             * @param message ContactRequestAcceptReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactRequestAcceptReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactRequestAcceptReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactRequestDiscardRequest. */
        interface IContactRequestDiscardRequest {
        }

        /** Represents a ContactRequestDiscardRequest. */
        class ContactRequestDiscardRequest implements IContactRequestDiscardRequest {

            /**
             * Constructs a new ContactRequestDiscardRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactRequestDiscardRequest);

            /**
             * Creates a new ContactRequestDiscardRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactRequestDiscardRequest instance
             */
            public static create(properties?: berty.chat.IContactRequestDiscardRequest): berty.chat.ContactRequestDiscardRequest;

            /**
             * Encodes the specified ContactRequestDiscardRequest message. Does not implicitly {@link berty.chat.ContactRequestDiscardRequest.verify|verify} messages.
             * @param message ContactRequestDiscardRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactRequestDiscardRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactRequestDiscardRequest message, length delimited. Does not implicitly {@link berty.chat.ContactRequestDiscardRequest.verify|verify} messages.
             * @param message ContactRequestDiscardRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactRequestDiscardRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactRequestDiscardRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactRequestDiscardRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestDiscardRequest;

            /**
             * Decodes a ContactRequestDiscardRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactRequestDiscardRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestDiscardRequest;

            /**
             * Verifies a ContactRequestDiscardRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactRequestDiscardRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactRequestDiscardRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestDiscardRequest;

            /**
             * Creates a plain object from a ContactRequestDiscardRequest message. Also converts values to other types if specified.
             * @param message ContactRequestDiscardRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactRequestDiscardRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactRequestDiscardRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ContactRequestDiscardReply. */
        interface IContactRequestDiscardReply {
        }

        /** Represents a ContactRequestDiscardReply. */
        class ContactRequestDiscardReply implements IContactRequestDiscardReply {

            /**
             * Constructs a new ContactRequestDiscardReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IContactRequestDiscardReply);

            /**
             * Creates a new ContactRequestDiscardReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ContactRequestDiscardReply instance
             */
            public static create(properties?: berty.chat.IContactRequestDiscardReply): berty.chat.ContactRequestDiscardReply;

            /**
             * Encodes the specified ContactRequestDiscardReply message. Does not implicitly {@link berty.chat.ContactRequestDiscardReply.verify|verify} messages.
             * @param message ContactRequestDiscardReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IContactRequestDiscardReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ContactRequestDiscardReply message, length delimited. Does not implicitly {@link berty.chat.ContactRequestDiscardReply.verify|verify} messages.
             * @param message ContactRequestDiscardReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IContactRequestDiscardReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ContactRequestDiscardReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ContactRequestDiscardReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestDiscardReply;

            /**
             * Decodes a ContactRequestDiscardReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ContactRequestDiscardReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestDiscardReply;

            /**
             * Verifies a ContactRequestDiscardReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ContactRequestDiscardReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ContactRequestDiscardReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestDiscardReply;

            /**
             * Creates a plain object from a ContactRequestDiscardReply message. Also converts values to other types if specified.
             * @param message ContactRequestDiscardReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.ContactRequestDiscardReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ContactRequestDiscardReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a SearchRequest. */
        interface ISearchRequest {
        }

        /** Represents a SearchRequest. */
        class SearchRequest implements ISearchRequest {

            /**
             * Constructs a new SearchRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.ISearchRequest);

            /**
             * Creates a new SearchRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SearchRequest instance
             */
            public static create(properties?: berty.chat.ISearchRequest): berty.chat.SearchRequest;

            /**
             * Encodes the specified SearchRequest message. Does not implicitly {@link berty.chat.SearchRequest.verify|verify} messages.
             * @param message SearchRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.ISearchRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SearchRequest message, length delimited. Does not implicitly {@link berty.chat.SearchRequest.verify|verify} messages.
             * @param message SearchRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.ISearchRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SearchRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SearchRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.SearchRequest;

            /**
             * Decodes a SearchRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SearchRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.SearchRequest;

            /**
             * Verifies a SearchRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SearchRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SearchRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.SearchRequest;

            /**
             * Creates a plain object from a SearchRequest message. Also converts values to other types if specified.
             * @param message SearchRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.SearchRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SearchRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a SearchReply. */
        interface ISearchReply {
        }

        /** Represents a SearchReply. */
        class SearchReply implements ISearchReply {

            /**
             * Constructs a new SearchReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.ISearchReply);

            /**
             * Creates a new SearchReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SearchReply instance
             */
            public static create(properties?: berty.chat.ISearchReply): berty.chat.SearchReply;

            /**
             * Encodes the specified SearchReply message. Does not implicitly {@link berty.chat.SearchReply.verify|verify} messages.
             * @param message SearchReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.ISearchReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SearchReply message, length delimited. Does not implicitly {@link berty.chat.SearchReply.verify|verify} messages.
             * @param message SearchReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.ISearchReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SearchReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SearchReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.SearchReply;

            /**
             * Decodes a SearchReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SearchReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.SearchReply;

            /**
             * Verifies a SearchReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SearchReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SearchReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.SearchReply;

            /**
             * Creates a plain object from a SearchReply message. Also converts values to other types if specified.
             * @param message SearchReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.SearchReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SearchReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an AccountSettingsGetRequest. */
        interface IAccountSettingsGetRequest {
        }

        /** Represents an AccountSettingsGetRequest. */
        class AccountSettingsGetRequest implements IAccountSettingsGetRequest {

            /**
             * Constructs a new AccountSettingsGetRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IAccountSettingsGetRequest);

            /**
             * Creates a new AccountSettingsGetRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AccountSettingsGetRequest instance
             */
            public static create(properties?: berty.chat.IAccountSettingsGetRequest): berty.chat.AccountSettingsGetRequest;

            /**
             * Encodes the specified AccountSettingsGetRequest message. Does not implicitly {@link berty.chat.AccountSettingsGetRequest.verify|verify} messages.
             * @param message AccountSettingsGetRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IAccountSettingsGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AccountSettingsGetRequest message, length delimited. Does not implicitly {@link berty.chat.AccountSettingsGetRequest.verify|verify} messages.
             * @param message AccountSettingsGetRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IAccountSettingsGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AccountSettingsGetRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AccountSettingsGetRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountSettingsGetRequest;

            /**
             * Decodes an AccountSettingsGetRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AccountSettingsGetRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountSettingsGetRequest;

            /**
             * Verifies an AccountSettingsGetRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AccountSettingsGetRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AccountSettingsGetRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountSettingsGetRequest;

            /**
             * Creates a plain object from an AccountSettingsGetRequest message. Also converts values to other types if specified.
             * @param message AccountSettingsGetRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.AccountSettingsGetRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AccountSettingsGetRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an AccountSettingsGetReply. */
        interface IAccountSettingsGetReply {
        }

        /** Represents an AccountSettingsGetReply. */
        class AccountSettingsGetReply implements IAccountSettingsGetReply {

            /**
             * Constructs a new AccountSettingsGetReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IAccountSettingsGetReply);

            /**
             * Creates a new AccountSettingsGetReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AccountSettingsGetReply instance
             */
            public static create(properties?: berty.chat.IAccountSettingsGetReply): berty.chat.AccountSettingsGetReply;

            /**
             * Encodes the specified AccountSettingsGetReply message. Does not implicitly {@link berty.chat.AccountSettingsGetReply.verify|verify} messages.
             * @param message AccountSettingsGetReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IAccountSettingsGetReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AccountSettingsGetReply message, length delimited. Does not implicitly {@link berty.chat.AccountSettingsGetReply.verify|verify} messages.
             * @param message AccountSettingsGetReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IAccountSettingsGetReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AccountSettingsGetReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AccountSettingsGetReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountSettingsGetReply;

            /**
             * Decodes an AccountSettingsGetReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AccountSettingsGetReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountSettingsGetReply;

            /**
             * Verifies an AccountSettingsGetReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AccountSettingsGetReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AccountSettingsGetReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountSettingsGetReply;

            /**
             * Creates a plain object from an AccountSettingsGetReply message. Also converts values to other types if specified.
             * @param message AccountSettingsGetReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.AccountSettingsGetReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AccountSettingsGetReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an AccountSettingsUpdateRequest. */
        interface IAccountSettingsUpdateRequest {
        }

        /** Represents an AccountSettingsUpdateRequest. */
        class AccountSettingsUpdateRequest implements IAccountSettingsUpdateRequest {

            /**
             * Constructs a new AccountSettingsUpdateRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IAccountSettingsUpdateRequest);

            /**
             * Creates a new AccountSettingsUpdateRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AccountSettingsUpdateRequest instance
             */
            public static create(properties?: berty.chat.IAccountSettingsUpdateRequest): berty.chat.AccountSettingsUpdateRequest;

            /**
             * Encodes the specified AccountSettingsUpdateRequest message. Does not implicitly {@link berty.chat.AccountSettingsUpdateRequest.verify|verify} messages.
             * @param message AccountSettingsUpdateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IAccountSettingsUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AccountSettingsUpdateRequest message, length delimited. Does not implicitly {@link berty.chat.AccountSettingsUpdateRequest.verify|verify} messages.
             * @param message AccountSettingsUpdateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IAccountSettingsUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AccountSettingsUpdateRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AccountSettingsUpdateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountSettingsUpdateRequest;

            /**
             * Decodes an AccountSettingsUpdateRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AccountSettingsUpdateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountSettingsUpdateRequest;

            /**
             * Verifies an AccountSettingsUpdateRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AccountSettingsUpdateRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AccountSettingsUpdateRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountSettingsUpdateRequest;

            /**
             * Creates a plain object from an AccountSettingsUpdateRequest message. Also converts values to other types if specified.
             * @param message AccountSettingsUpdateRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.AccountSettingsUpdateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AccountSettingsUpdateRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an AccountSettingsUpdateReply. */
        interface IAccountSettingsUpdateReply {
        }

        /** Represents an AccountSettingsUpdateReply. */
        class AccountSettingsUpdateReply implements IAccountSettingsUpdateReply {

            /**
             * Constructs a new AccountSettingsUpdateReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IAccountSettingsUpdateReply);

            /**
             * Creates a new AccountSettingsUpdateReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AccountSettingsUpdateReply instance
             */
            public static create(properties?: berty.chat.IAccountSettingsUpdateReply): berty.chat.AccountSettingsUpdateReply;

            /**
             * Encodes the specified AccountSettingsUpdateReply message. Does not implicitly {@link berty.chat.AccountSettingsUpdateReply.verify|verify} messages.
             * @param message AccountSettingsUpdateReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IAccountSettingsUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AccountSettingsUpdateReply message, length delimited. Does not implicitly {@link berty.chat.AccountSettingsUpdateReply.verify|verify} messages.
             * @param message AccountSettingsUpdateReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IAccountSettingsUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AccountSettingsUpdateReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AccountSettingsUpdateReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountSettingsUpdateReply;

            /**
             * Decodes an AccountSettingsUpdateReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AccountSettingsUpdateReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountSettingsUpdateReply;

            /**
             * Verifies an AccountSettingsUpdateReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AccountSettingsUpdateReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AccountSettingsUpdateReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountSettingsUpdateReply;

            /**
             * Creates a plain object from an AccountSettingsUpdateReply message. Also converts values to other types if specified.
             * @param message AccountSettingsUpdateReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.AccountSettingsUpdateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AccountSettingsUpdateReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an AccountPairingInvitationCreateRequest. */
        interface IAccountPairingInvitationCreateRequest {
        }

        /** Represents an AccountPairingInvitationCreateRequest. */
        class AccountPairingInvitationCreateRequest implements IAccountPairingInvitationCreateRequest {

            /**
             * Constructs a new AccountPairingInvitationCreateRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IAccountPairingInvitationCreateRequest);

            /**
             * Creates a new AccountPairingInvitationCreateRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AccountPairingInvitationCreateRequest instance
             */
            public static create(properties?: berty.chat.IAccountPairingInvitationCreateRequest): berty.chat.AccountPairingInvitationCreateRequest;

            /**
             * Encodes the specified AccountPairingInvitationCreateRequest message. Does not implicitly {@link berty.chat.AccountPairingInvitationCreateRequest.verify|verify} messages.
             * @param message AccountPairingInvitationCreateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IAccountPairingInvitationCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AccountPairingInvitationCreateRequest message, length delimited. Does not implicitly {@link berty.chat.AccountPairingInvitationCreateRequest.verify|verify} messages.
             * @param message AccountPairingInvitationCreateRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IAccountPairingInvitationCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AccountPairingInvitationCreateRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AccountPairingInvitationCreateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountPairingInvitationCreateRequest;

            /**
             * Decodes an AccountPairingInvitationCreateRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AccountPairingInvitationCreateRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountPairingInvitationCreateRequest;

            /**
             * Verifies an AccountPairingInvitationCreateRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AccountPairingInvitationCreateRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AccountPairingInvitationCreateRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountPairingInvitationCreateRequest;

            /**
             * Creates a plain object from an AccountPairingInvitationCreateRequest message. Also converts values to other types if specified.
             * @param message AccountPairingInvitationCreateRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.AccountPairingInvitationCreateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AccountPairingInvitationCreateRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an AccountPairingInvitationCreateReply. */
        interface IAccountPairingInvitationCreateReply {
        }

        /** Represents an AccountPairingInvitationCreateReply. */
        class AccountPairingInvitationCreateReply implements IAccountPairingInvitationCreateReply {

            /**
             * Constructs a new AccountPairingInvitationCreateReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IAccountPairingInvitationCreateReply);

            /**
             * Creates a new AccountPairingInvitationCreateReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AccountPairingInvitationCreateReply instance
             */
            public static create(properties?: berty.chat.IAccountPairingInvitationCreateReply): berty.chat.AccountPairingInvitationCreateReply;

            /**
             * Encodes the specified AccountPairingInvitationCreateReply message. Does not implicitly {@link berty.chat.AccountPairingInvitationCreateReply.verify|verify} messages.
             * @param message AccountPairingInvitationCreateReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IAccountPairingInvitationCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AccountPairingInvitationCreateReply message, length delimited. Does not implicitly {@link berty.chat.AccountPairingInvitationCreateReply.verify|verify} messages.
             * @param message AccountPairingInvitationCreateReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IAccountPairingInvitationCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AccountPairingInvitationCreateReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AccountPairingInvitationCreateReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountPairingInvitationCreateReply;

            /**
             * Decodes an AccountPairingInvitationCreateReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AccountPairingInvitationCreateReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountPairingInvitationCreateReply;

            /**
             * Verifies an AccountPairingInvitationCreateReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AccountPairingInvitationCreateReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AccountPairingInvitationCreateReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountPairingInvitationCreateReply;

            /**
             * Creates a plain object from an AccountPairingInvitationCreateReply message. Also converts values to other types if specified.
             * @param message AccountPairingInvitationCreateReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.AccountPairingInvitationCreateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AccountPairingInvitationCreateReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an AccountRenewIncomingContactRequestLinkRequest. */
        interface IAccountRenewIncomingContactRequestLinkRequest {
        }

        /** Represents an AccountRenewIncomingContactRequestLinkRequest. */
        class AccountRenewIncomingContactRequestLinkRequest implements IAccountRenewIncomingContactRequestLinkRequest {

            /**
             * Constructs a new AccountRenewIncomingContactRequestLinkRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IAccountRenewIncomingContactRequestLinkRequest);

            /**
             * Creates a new AccountRenewIncomingContactRequestLinkRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AccountRenewIncomingContactRequestLinkRequest instance
             */
            public static create(properties?: berty.chat.IAccountRenewIncomingContactRequestLinkRequest): berty.chat.AccountRenewIncomingContactRequestLinkRequest;

            /**
             * Encodes the specified AccountRenewIncomingContactRequestLinkRequest message. Does not implicitly {@link berty.chat.AccountRenewIncomingContactRequestLinkRequest.verify|verify} messages.
             * @param message AccountRenewIncomingContactRequestLinkRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IAccountRenewIncomingContactRequestLinkRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AccountRenewIncomingContactRequestLinkRequest message, length delimited. Does not implicitly {@link berty.chat.AccountRenewIncomingContactRequestLinkRequest.verify|verify} messages.
             * @param message AccountRenewIncomingContactRequestLinkRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IAccountRenewIncomingContactRequestLinkRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AccountRenewIncomingContactRequestLinkRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AccountRenewIncomingContactRequestLinkRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountRenewIncomingContactRequestLinkRequest;

            /**
             * Decodes an AccountRenewIncomingContactRequestLinkRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AccountRenewIncomingContactRequestLinkRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountRenewIncomingContactRequestLinkRequest;

            /**
             * Verifies an AccountRenewIncomingContactRequestLinkRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AccountRenewIncomingContactRequestLinkRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AccountRenewIncomingContactRequestLinkRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountRenewIncomingContactRequestLinkRequest;

            /**
             * Creates a plain object from an AccountRenewIncomingContactRequestLinkRequest message. Also converts values to other types if specified.
             * @param message AccountRenewIncomingContactRequestLinkRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.AccountRenewIncomingContactRequestLinkRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AccountRenewIncomingContactRequestLinkRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an AccountRenewIncomingContactRequestLinkReply. */
        interface IAccountRenewIncomingContactRequestLinkReply {
        }

        /** Represents an AccountRenewIncomingContactRequestLinkReply. */
        class AccountRenewIncomingContactRequestLinkReply implements IAccountRenewIncomingContactRequestLinkReply {

            /**
             * Constructs a new AccountRenewIncomingContactRequestLinkReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IAccountRenewIncomingContactRequestLinkReply);

            /**
             * Creates a new AccountRenewIncomingContactRequestLinkReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns AccountRenewIncomingContactRequestLinkReply instance
             */
            public static create(properties?: berty.chat.IAccountRenewIncomingContactRequestLinkReply): berty.chat.AccountRenewIncomingContactRequestLinkReply;

            /**
             * Encodes the specified AccountRenewIncomingContactRequestLinkReply message. Does not implicitly {@link berty.chat.AccountRenewIncomingContactRequestLinkReply.verify|verify} messages.
             * @param message AccountRenewIncomingContactRequestLinkReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IAccountRenewIncomingContactRequestLinkReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified AccountRenewIncomingContactRequestLinkReply message, length delimited. Does not implicitly {@link berty.chat.AccountRenewIncomingContactRequestLinkReply.verify|verify} messages.
             * @param message AccountRenewIncomingContactRequestLinkReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IAccountRenewIncomingContactRequestLinkReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an AccountRenewIncomingContactRequestLinkReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns AccountRenewIncomingContactRequestLinkReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountRenewIncomingContactRequestLinkReply;

            /**
             * Decodes an AccountRenewIncomingContactRequestLinkReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns AccountRenewIncomingContactRequestLinkReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountRenewIncomingContactRequestLinkReply;

            /**
             * Verifies an AccountRenewIncomingContactRequestLinkReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an AccountRenewIncomingContactRequestLinkReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns AccountRenewIncomingContactRequestLinkReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountRenewIncomingContactRequestLinkReply;

            /**
             * Creates a plain object from an AccountRenewIncomingContactRequestLinkReply message. Also converts values to other types if specified.
             * @param message AccountRenewIncomingContactRequestLinkReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.AccountRenewIncomingContactRequestLinkReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this AccountRenewIncomingContactRequestLinkReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a DevEventSubscribeRequest. */
        interface IDevEventSubscribeRequest {
        }

        /** Represents a DevEventSubscribeRequest. */
        class DevEventSubscribeRequest implements IDevEventSubscribeRequest {

            /**
             * Constructs a new DevEventSubscribeRequest.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IDevEventSubscribeRequest);

            /**
             * Creates a new DevEventSubscribeRequest instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DevEventSubscribeRequest instance
             */
            public static create(properties?: berty.chat.IDevEventSubscribeRequest): berty.chat.DevEventSubscribeRequest;

            /**
             * Encodes the specified DevEventSubscribeRequest message. Does not implicitly {@link berty.chat.DevEventSubscribeRequest.verify|verify} messages.
             * @param message DevEventSubscribeRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IDevEventSubscribeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DevEventSubscribeRequest message, length delimited. Does not implicitly {@link berty.chat.DevEventSubscribeRequest.verify|verify} messages.
             * @param message DevEventSubscribeRequest message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IDevEventSubscribeRequest, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DevEventSubscribeRequest message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DevEventSubscribeRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.DevEventSubscribeRequest;

            /**
             * Decodes a DevEventSubscribeRequest message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DevEventSubscribeRequest
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.DevEventSubscribeRequest;

            /**
             * Verifies a DevEventSubscribeRequest message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DevEventSubscribeRequest message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DevEventSubscribeRequest
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.DevEventSubscribeRequest;

            /**
             * Creates a plain object from a DevEventSubscribeRequest message. Also converts values to other types if specified.
             * @param message DevEventSubscribeRequest
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.DevEventSubscribeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DevEventSubscribeRequest to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a DevEventSubscribeReply. */
        interface IDevEventSubscribeReply {
        }

        /** Represents a DevEventSubscribeReply. */
        class DevEventSubscribeReply implements IDevEventSubscribeReply {

            /**
             * Constructs a new DevEventSubscribeReply.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chat.IDevEventSubscribeReply);

            /**
             * Creates a new DevEventSubscribeReply instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DevEventSubscribeReply instance
             */
            public static create(properties?: berty.chat.IDevEventSubscribeReply): berty.chat.DevEventSubscribeReply;

            /**
             * Encodes the specified DevEventSubscribeReply message. Does not implicitly {@link berty.chat.DevEventSubscribeReply.verify|verify} messages.
             * @param message DevEventSubscribeReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chat.IDevEventSubscribeReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DevEventSubscribeReply message, length delimited. Does not implicitly {@link berty.chat.DevEventSubscribeReply.verify|verify} messages.
             * @param message DevEventSubscribeReply message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chat.IDevEventSubscribeReply, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DevEventSubscribeReply message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DevEventSubscribeReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.DevEventSubscribeReply;

            /**
             * Decodes a DevEventSubscribeReply message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DevEventSubscribeReply
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.DevEventSubscribeReply;

            /**
             * Verifies a DevEventSubscribeReply message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DevEventSubscribeReply message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DevEventSubscribeReply
             */
            public static fromObject(object: { [k: string]: any }): berty.chat.DevEventSubscribeReply;

            /**
             * Creates a plain object from a DevEventSubscribeReply message. Also converts values to other types if specified.
             * @param message DevEventSubscribeReply
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chat.DevEventSubscribeReply, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DevEventSubscribeReply to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace chatmodel. */
    namespace chatmodel {

        /** Properties of an Account. */
        interface IAccount {

            /** Account id */
            id?: (number|Long|null);

            /** Account createdAt */
            createdAt?: (google.protobuf.ITimestamp|null);

            /** Account updatedAt */
            updatedAt?: (google.protobuf.ITimestamp|null);

            /** Account name */
            name?: (string|null);

            /** Account avatarUri */
            avatarUri?: (string|null);

            /** Account contactRequestsEnabled */
            contactRequestsEnabled?: (boolean|null);

            /** Account contactRequestsLink */
            contactRequestsLink?: (string|null);
        }

        /** Represents an Account. */
        class Account implements IAccount {

            /**
             * Constructs a new Account.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chatmodel.IAccount);

            /** Account id. */
            public id: (number|Long);

            /** Account createdAt. */
            public createdAt?: (google.protobuf.ITimestamp|null);

            /** Account updatedAt. */
            public updatedAt?: (google.protobuf.ITimestamp|null);

            /** Account name. */
            public name: string;

            /** Account avatarUri. */
            public avatarUri: string;

            /** Account contactRequestsEnabled. */
            public contactRequestsEnabled: boolean;

            /** Account contactRequestsLink. */
            public contactRequestsLink: string;

            /**
             * Creates a new Account instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Account instance
             */
            public static create(properties?: berty.chatmodel.IAccount): berty.chatmodel.Account;

            /**
             * Encodes the specified Account message. Does not implicitly {@link berty.chatmodel.Account.verify|verify} messages.
             * @param message Account message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chatmodel.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Account message, length delimited. Does not implicitly {@link berty.chatmodel.Account.verify|verify} messages.
             * @param message Account message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chatmodel.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Account message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Account
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Account;

            /**
             * Decodes an Account message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Account
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Account;

            /**
             * Verifies an Account message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Account message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Account
             */
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Account;

            /**
             * Creates a plain object from an Account message. Also converts values to other types if specified.
             * @param message Account
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chatmodel.Account, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Account to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Conversation. */
        interface IConversation {

            /** Conversation id */
            id?: (number|Long|null);

            /** Conversation protocolId */
            protocolId?: (string|null);

            /** Conversation createdAt */
            createdAt?: (google.protobuf.ITimestamp|null);

            /** Conversation updatedAt */
            updatedAt?: (google.protobuf.ITimestamp|null);

            /** Conversation title */
            title?: (string|null);

            /** Conversation topic */
            topic?: (string|null);

            /** Conversation avatarUri */
            avatarUri?: (string|null);

            /** Conversation kind */
            kind?: (berty.chatmodel.Conversation.Kind|null);

            /** Conversation badge */
            badge?: (number|null);

            /** Conversation mutePolicy */
            mutePolicy?: (berty.chatmodel.Conversation.MutePolicy|null);

            /** Conversation messages */
            messages?: (berty.chatmodel.IMessage[]|null);

            /** Conversation members */
            members?: (berty.chatmodel.IMember[]|null);

            /** Conversation lastMessageId */
            lastMessageId?: (number|Long|null);

            /** Conversation lastMessage */
            lastMessage?: (berty.chatmodel.IMessage|null);
        }

        /** Represents a Conversation. */
        class Conversation implements IConversation {

            /**
             * Constructs a new Conversation.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chatmodel.IConversation);

            /** Conversation id. */
            public id: (number|Long);

            /** Conversation protocolId. */
            public protocolId: string;

            /** Conversation createdAt. */
            public createdAt?: (google.protobuf.ITimestamp|null);

            /** Conversation updatedAt. */
            public updatedAt?: (google.protobuf.ITimestamp|null);

            /** Conversation title. */
            public title: string;

            /** Conversation topic. */
            public topic: string;

            /** Conversation avatarUri. */
            public avatarUri: string;

            /** Conversation kind. */
            public kind: berty.chatmodel.Conversation.Kind;

            /** Conversation badge. */
            public badge: number;

            /** Conversation mutePolicy. */
            public mutePolicy: berty.chatmodel.Conversation.MutePolicy;

            /** Conversation messages. */
            public messages: berty.chatmodel.IMessage[];

            /** Conversation members. */
            public members: berty.chatmodel.IMember[];

            /** Conversation lastMessageId. */
            public lastMessageId: (number|Long);

            /** Conversation lastMessage. */
            public lastMessage?: (berty.chatmodel.IMessage|null);

            /**
             * Creates a new Conversation instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Conversation instance
             */
            public static create(properties?: berty.chatmodel.IConversation): berty.chatmodel.Conversation;

            /**
             * Encodes the specified Conversation message. Does not implicitly {@link berty.chatmodel.Conversation.verify|verify} messages.
             * @param message Conversation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chatmodel.IConversation, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Conversation message, length delimited. Does not implicitly {@link berty.chatmodel.Conversation.verify|verify} messages.
             * @param message Conversation message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chatmodel.IConversation, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Conversation message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Conversation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Conversation;

            /**
             * Decodes a Conversation message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Conversation
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Conversation;

            /**
             * Verifies a Conversation message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Conversation message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Conversation
             */
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Conversation;

            /**
             * Creates a plain object from a Conversation message. Also converts values to other types if specified.
             * @param message Conversation
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chatmodel.Conversation, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Conversation to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace Conversation {

            /** Kind enum. */
            enum Kind {
                Unknown = 0,
                Self = 1,
                OneToOne = 2,
                PrivateGroup = 3
            }

            /** MutePolicy enum. */
            enum MutePolicy {
                Nothing = 0,
                All = 1,
                Notifications = 2
            }
        }

        /** Properties of a Member. */
        interface IMember {

            /** Member id */
            id?: (number|Long|null);

            /** Member protocolId */
            protocolId?: (string|null);

            /** Member createdAt */
            createdAt?: (google.protobuf.ITimestamp|null);

            /** Member updatedAt */
            updatedAt?: (google.protobuf.ITimestamp|null);

            /** Member readAt */
            readAt?: (google.protobuf.ITimestamp|null);

            /** Member name */
            name?: (string|null);

            /** Member avatarUri */
            avatarUri?: (string|null);

            /** Member role */
            role?: (berty.chatmodel.Member.Role|null);

            /** Member conversationId */
            conversationId?: (number|Long|null);

            /** Member conversation */
            conversation?: (berty.chatmodel.IConversation|null);

            /** Member contactId */
            contactId?: (number|Long|null);

            /** Member contact */
            contact?: (berty.chatmodel.IContact|null);
        }

        /** Represents a Member. */
        class Member implements IMember {

            /**
             * Constructs a new Member.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chatmodel.IMember);

            /** Member id. */
            public id: (number|Long);

            /** Member protocolId. */
            public protocolId: string;

            /** Member createdAt. */
            public createdAt?: (google.protobuf.ITimestamp|null);

            /** Member updatedAt. */
            public updatedAt?: (google.protobuf.ITimestamp|null);

            /** Member readAt. */
            public readAt?: (google.protobuf.ITimestamp|null);

            /** Member name. */
            public name: string;

            /** Member avatarUri. */
            public avatarUri: string;

            /** Member role. */
            public role: berty.chatmodel.Member.Role;

            /** Member conversationId. */
            public conversationId: (number|Long);

            /** Member conversation. */
            public conversation?: (berty.chatmodel.IConversation|null);

            /** Member contactId. */
            public contactId: (number|Long);

            /** Member contact. */
            public contact?: (berty.chatmodel.IContact|null);

            /**
             * Creates a new Member instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Member instance
             */
            public static create(properties?: berty.chatmodel.IMember): berty.chatmodel.Member;

            /**
             * Encodes the specified Member message. Does not implicitly {@link berty.chatmodel.Member.verify|verify} messages.
             * @param message Member message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chatmodel.IMember, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Member message, length delimited. Does not implicitly {@link berty.chatmodel.Member.verify|verify} messages.
             * @param message Member message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chatmodel.IMember, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Member message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Member
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Member;

            /**
             * Decodes a Member message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Member
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Member;

            /**
             * Verifies a Member message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Member message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Member
             */
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Member;

            /**
             * Creates a plain object from a Member message. Also converts values to other types if specified.
             * @param message Member
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chatmodel.Member, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Member to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace Member {

            /** Role enum. */
            enum Role {
                Unknown = 0,
                Regular = 2,
                Admin = 3,
                Owner = 4
            }
        }

        /** Properties of a Message. */
        interface IMessage {

            /** Message id */
            id?: (number|Long|null);

            /** Message protocolId */
            protocolId?: (string|null);

            /** Message createdAt */
            createdAt?: (google.protobuf.ITimestamp|null);

            /** Message updatedAt */
            updatedAt?: (google.protobuf.ITimestamp|null);

            /** Message sentAt */
            sentAt?: (google.protobuf.ITimestamp|null);

            /** Message kind */
            kind?: (berty.chatmodel.Message.Kind|null);

            /** Message body */
            body?: (berty.chatmodel.Message.IBody|null);

            /** Message conversationId */
            conversationId?: (number|Long|null);

            /** Message conversation */
            conversation?: (berty.chatmodel.IConversation|null);

            /** Message memberId */
            memberId?: (number|Long|null);

            /** Message member */
            member?: (berty.chatmodel.IMember|null);

            /** Message attachments */
            attachments?: (berty.chatmodel.IAttachment[]|null);

            /** Message reactions */
            reactions?: (berty.chatmodel.IReaction[]|null);
        }

        /** Represents a Message. */
        class Message implements IMessage {

            /**
             * Constructs a new Message.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chatmodel.IMessage);

            /** Message id. */
            public id: (number|Long);

            /** Message protocolId. */
            public protocolId: string;

            /** Message createdAt. */
            public createdAt?: (google.protobuf.ITimestamp|null);

            /** Message updatedAt. */
            public updatedAt?: (google.protobuf.ITimestamp|null);

            /** Message sentAt. */
            public sentAt?: (google.protobuf.ITimestamp|null);

            /** Message kind. */
            public kind: berty.chatmodel.Message.Kind;

            /** Message body. */
            public body?: (berty.chatmodel.Message.IBody|null);

            /** Message conversationId. */
            public conversationId: (number|Long);

            /** Message conversation. */
            public conversation?: (berty.chatmodel.IConversation|null);

            /** Message memberId. */
            public memberId: (number|Long);

            /** Message member. */
            public member?: (berty.chatmodel.IMember|null);

            /** Message attachments. */
            public attachments: berty.chatmodel.IAttachment[];

            /** Message reactions. */
            public reactions: berty.chatmodel.IReaction[];

            /**
             * Creates a new Message instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Message instance
             */
            public static create(properties?: berty.chatmodel.IMessage): berty.chatmodel.Message;

            /**
             * Encodes the specified Message message. Does not implicitly {@link berty.chatmodel.Message.verify|verify} messages.
             * @param message Message message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chatmodel.IMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Message message, length delimited. Does not implicitly {@link berty.chatmodel.Message.verify|verify} messages.
             * @param message Message message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chatmodel.IMessage, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Message message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Message
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Message;

            /**
             * Decodes a Message message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Message
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Message;

            /**
             * Verifies a Message message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Message message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Message
             */
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Message;

            /**
             * Creates a plain object from a Message message. Also converts values to other types if specified.
             * @param message Message
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chatmodel.Message, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Message to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace Message {

            /** Kind enum. */
            enum Kind {
                Unknown = 0,
                Text = 1,
                MemberJoined = 2,
                MemberLeave = 3,
                MemberSetTitleTo = 4
            }

            /** Properties of a Body. */
            interface IBody {

                /** Body text */
                text?: (string|null);

                /** Body memberJoined */
                memberJoined?: (number|Long|null);

                /** Body memberLeft */
                memberLeft?: (number|Long|null);

                /** Body memberSetTitleTo */
                memberSetTitleTo?: (string|null);
            }

            /** Represents a Body. */
            class Body implements IBody {

                /**
                 * Constructs a new Body.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: berty.chatmodel.Message.IBody);

                /** Body text. */
                public text: string;

                /** Body memberJoined. */
                public memberJoined: (number|Long);

                /** Body memberLeft. */
                public memberLeft: (number|Long);

                /** Body memberSetTitleTo. */
                public memberSetTitleTo: string;

                /**
                 * Creates a new Body instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Body instance
                 */
                public static create(properties?: berty.chatmodel.Message.IBody): berty.chatmodel.Message.Body;

                /**
                 * Encodes the specified Body message. Does not implicitly {@link berty.chatmodel.Message.Body.verify|verify} messages.
                 * @param message Body message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: berty.chatmodel.Message.IBody, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Body message, length delimited. Does not implicitly {@link berty.chatmodel.Message.Body.verify|verify} messages.
                 * @param message Body message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: berty.chatmodel.Message.IBody, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Body message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Body
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Message.Body;

                /**
                 * Decodes a Body message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Body
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Message.Body;

                /**
                 * Verifies a Body message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Body message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Body
                 */
                public static fromObject(object: { [k: string]: any }): berty.chatmodel.Message.Body;

                /**
                 * Creates a plain object from a Body message. Also converts values to other types if specified.
                 * @param message Body
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: berty.chatmodel.Message.Body, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Body to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of an Attachment. */
        interface IAttachment {

            /** Attachment id */
            id?: (number|Long|null);

            /** Attachment createdAt */
            createdAt?: (google.protobuf.ITimestamp|null);

            /** Attachment updatedAt */
            updatedAt?: (google.protobuf.ITimestamp|null);

            /** Attachment uri */
            uri?: (string|null);

            /** Attachment contentType */
            contentType?: (string|null);

            /** Attachment messageId */
            messageId?: (number|Long|null);

            /** Attachment message */
            message?: (berty.chatmodel.IMessage|null);
        }

        /** Represents an Attachment. */
        class Attachment implements IAttachment {

            /**
             * Constructs a new Attachment.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chatmodel.IAttachment);

            /** Attachment id. */
            public id: (number|Long);

            /** Attachment createdAt. */
            public createdAt?: (google.protobuf.ITimestamp|null);

            /** Attachment updatedAt. */
            public updatedAt?: (google.protobuf.ITimestamp|null);

            /** Attachment uri. */
            public uri: string;

            /** Attachment contentType. */
            public contentType: string;

            /** Attachment messageId. */
            public messageId: (number|Long);

            /** Attachment message. */
            public message?: (berty.chatmodel.IMessage|null);

            /**
             * Creates a new Attachment instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Attachment instance
             */
            public static create(properties?: berty.chatmodel.IAttachment): berty.chatmodel.Attachment;

            /**
             * Encodes the specified Attachment message. Does not implicitly {@link berty.chatmodel.Attachment.verify|verify} messages.
             * @param message Attachment message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chatmodel.IAttachment, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Attachment message, length delimited. Does not implicitly {@link berty.chatmodel.Attachment.verify|verify} messages.
             * @param message Attachment message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chatmodel.IAttachment, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an Attachment message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Attachment
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Attachment;

            /**
             * Decodes an Attachment message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Attachment
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Attachment;

            /**
             * Verifies an Attachment message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an Attachment message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Attachment
             */
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Attachment;

            /**
             * Creates a plain object from an Attachment message. Also converts values to other types if specified.
             * @param message Attachment
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chatmodel.Attachment, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Attachment to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Reaction. */
        interface IReaction {

            /** Reaction id */
            id?: (number|Long|null);

            /** Reaction createdAt */
            createdAt?: (google.protobuf.ITimestamp|null);

            /** Reaction updatedAt */
            updatedAt?: (google.protobuf.ITimestamp|null);

            /** Reaction emoji */
            emoji?: (Uint8Array|null);

            /** Reaction messageId */
            messageId?: (number|Long|null);

            /** Reaction message */
            message?: (berty.chatmodel.IMessage|null);

            /** Reaction memberId */
            memberId?: (number|Long|null);

            /** Reaction member */
            member?: (berty.chatmodel.IMember|null);
        }

        /** Represents a Reaction. */
        class Reaction implements IReaction {

            /**
             * Constructs a new Reaction.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chatmodel.IReaction);

            /** Reaction id. */
            public id: (number|Long);

            /** Reaction createdAt. */
            public createdAt?: (google.protobuf.ITimestamp|null);

            /** Reaction updatedAt. */
            public updatedAt?: (google.protobuf.ITimestamp|null);

            /** Reaction emoji. */
            public emoji: Uint8Array;

            /** Reaction messageId. */
            public messageId: (number|Long);

            /** Reaction message. */
            public message?: (berty.chatmodel.IMessage|null);

            /** Reaction memberId. */
            public memberId: (number|Long);

            /** Reaction member. */
            public member?: (berty.chatmodel.IMember|null);

            /**
             * Creates a new Reaction instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Reaction instance
             */
            public static create(properties?: berty.chatmodel.IReaction): berty.chatmodel.Reaction;

            /**
             * Encodes the specified Reaction message. Does not implicitly {@link berty.chatmodel.Reaction.verify|verify} messages.
             * @param message Reaction message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chatmodel.IReaction, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Reaction message, length delimited. Does not implicitly {@link berty.chatmodel.Reaction.verify|verify} messages.
             * @param message Reaction message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chatmodel.IReaction, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Reaction message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Reaction
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Reaction;

            /**
             * Decodes a Reaction message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Reaction
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Reaction;

            /**
             * Verifies a Reaction message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Reaction message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Reaction
             */
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Reaction;

            /**
             * Creates a plain object from a Reaction message. Also converts values to other types if specified.
             * @param message Reaction
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chatmodel.Reaction, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Reaction to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Contact. */
        interface IContact {

            /** Contact id */
            id?: (number|Long|null);

            /** Contact protocolId */
            protocolId?: (string|null);

            /** Contact createdAt */
            createdAt?: (google.protobuf.ITimestamp|null);

            /** Contact updatedAt */
            updatedAt?: (google.protobuf.ITimestamp|null);

            /** Contact seenAt */
            seenAt?: (google.protobuf.ITimestamp|null);

            /** Contact name */
            name?: (string|null);

            /** Contact avatarUri */
            avatarUri?: (string|null);

            /** Contact statusEmoji */
            statusEmoji?: (Uint8Array|null);

            /** Contact statusText */
            statusText?: (string|null);

            /** Contact kind */
            kind?: (berty.chatmodel.Contact.Kind|null);

            /** Contact blocked */
            blocked?: (boolean|null);

            /** Contact devices */
            devices?: (berty.chatmodel.IDevice[]|null);
        }

        /** Represents a Contact. */
        class Contact implements IContact {

            /**
             * Constructs a new Contact.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chatmodel.IContact);

            /** Contact id. */
            public id: (number|Long);

            /** Contact protocolId. */
            public protocolId: string;

            /** Contact createdAt. */
            public createdAt?: (google.protobuf.ITimestamp|null);

            /** Contact updatedAt. */
            public updatedAt?: (google.protobuf.ITimestamp|null);

            /** Contact seenAt. */
            public seenAt?: (google.protobuf.ITimestamp|null);

            /** Contact name. */
            public name: string;

            /** Contact avatarUri. */
            public avatarUri: string;

            /** Contact statusEmoji. */
            public statusEmoji: Uint8Array;

            /** Contact statusText. */
            public statusText: string;

            /** Contact kind. */
            public kind: berty.chatmodel.Contact.Kind;

            /** Contact blocked. */
            public blocked: boolean;

            /** Contact devices. */
            public devices: berty.chatmodel.IDevice[];

            /**
             * Creates a new Contact instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Contact instance
             */
            public static create(properties?: berty.chatmodel.IContact): berty.chatmodel.Contact;

            /**
             * Encodes the specified Contact message. Does not implicitly {@link berty.chatmodel.Contact.verify|verify} messages.
             * @param message Contact message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chatmodel.IContact, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Contact message, length delimited. Does not implicitly {@link berty.chatmodel.Contact.verify|verify} messages.
             * @param message Contact message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chatmodel.IContact, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Contact message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Contact
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Contact;

            /**
             * Decodes a Contact message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Contact
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Contact;

            /**
             * Verifies a Contact message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Contact message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Contact
             */
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Contact;

            /**
             * Creates a plain object from a Contact message. Also converts values to other types if specified.
             * @param message Contact
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chatmodel.Contact, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Contact to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace Contact {

            /** Kind enum. */
            enum Kind {
                Unknown = 0,
                PendingInc = 1,
                PendingOut = 2,
                Friend = 3,
                Trusted = 4,
                Myself = 42
            }
        }

        /** Properties of a Device. */
        interface IDevice {

            /** Device id */
            id?: (number|Long|null);

            /** Device protocolId */
            protocolId?: (string|null);

            /** Device createdAt */
            createdAt?: (google.protobuf.ITimestamp|null);

            /** Device updatedAt */
            updatedAt?: (google.protobuf.ITimestamp|null);

            /** Device lastSeenAt */
            lastSeenAt?: (google.protobuf.ITimestamp|null);

            /** Device kind */
            kind?: (berty.chatmodel.Device.Kind|null);

            /** Device canRelay */
            canRelay?: (boolean|null);

            /** Device canBle */
            canBle?: (boolean|null);

            /** Device contactId */
            contactId?: (number|Long|null);

            /** Device contact */
            contact?: (berty.chatmodel.IContact|null);
        }

        /** Represents a Device. */
        class Device implements IDevice {

            /**
             * Constructs a new Device.
             * @param [properties] Properties to set
             */
            constructor(properties?: berty.chatmodel.IDevice);

            /** Device id. */
            public id: (number|Long);

            /** Device protocolId. */
            public protocolId: string;

            /** Device createdAt. */
            public createdAt?: (google.protobuf.ITimestamp|null);

            /** Device updatedAt. */
            public updatedAt?: (google.protobuf.ITimestamp|null);

            /** Device lastSeenAt. */
            public lastSeenAt?: (google.protobuf.ITimestamp|null);

            /** Device kind. */
            public kind: berty.chatmodel.Device.Kind;

            /** Device canRelay. */
            public canRelay: boolean;

            /** Device canBle. */
            public canBle: boolean;

            /** Device contactId. */
            public contactId: (number|Long);

            /** Device contact. */
            public contact?: (berty.chatmodel.IContact|null);

            /**
             * Creates a new Device instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Device instance
             */
            public static create(properties?: berty.chatmodel.IDevice): berty.chatmodel.Device;

            /**
             * Encodes the specified Device message. Does not implicitly {@link berty.chatmodel.Device.verify|verify} messages.
             * @param message Device message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: berty.chatmodel.IDevice, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Device message, length delimited. Does not implicitly {@link berty.chatmodel.Device.verify|verify} messages.
             * @param message Device message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: berty.chatmodel.IDevice, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Device message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Device
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Device;

            /**
             * Decodes a Device message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Device
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Device;

            /**
             * Verifies a Device message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Device message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Device
             */
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Device;

            /**
             * Creates a plain object from a Device message. Also converts values to other types if specified.
             * @param message Device
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: berty.chatmodel.Device, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Device to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace Device {

            /** Kind enum. */
            enum Kind {
                Unknown = 0,
                Phone = 1,
                Desktop = 2,
                Laptop = 3
            }
        }
    }
}

/** Namespace google. */
export namespace google {

    /** Namespace api. */
    namespace api {

        /** Properties of a Http. */
        interface IHttp {

            /** Http rules */
            rules?: (google.api.IHttpRule[]|null);
        }

        /** Represents a Http. */
        class Http implements IHttp {

            /**
             * Constructs a new Http.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.api.IHttp);

            /** Http rules. */
            public rules: google.api.IHttpRule[];

            /**
             * Creates a new Http instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Http instance
             */
            public static create(properties?: google.api.IHttp): google.api.Http;

            /**
             * Encodes the specified Http message. Does not implicitly {@link google.api.Http.verify|verify} messages.
             * @param message Http message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.api.IHttp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Http message, length delimited. Does not implicitly {@link google.api.Http.verify|verify} messages.
             * @param message Http message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.api.IHttp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Http message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.Http;

            /**
             * Decodes a Http message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Http
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.Http;

            /**
             * Verifies a Http message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Http message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Http
             */
            public static fromObject(object: { [k: string]: any }): google.api.Http;

            /**
             * Creates a plain object from a Http message. Also converts values to other types if specified.
             * @param message Http
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.api.Http, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Http to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a HttpRule. */
        interface IHttpRule {

            /** HttpRule selector */
            selector?: (string|null);

            /** HttpRule get */
            get?: (string|null);

            /** HttpRule put */
            put?: (string|null);

            /** HttpRule post */
            post?: (string|null);

            /** HttpRule delete */
            "delete"?: (string|null);

            /** HttpRule patch */
            patch?: (string|null);

            /** HttpRule custom */
            custom?: (google.api.ICustomHttpPattern|null);

            /** HttpRule body */
            body?: (string|null);

            /** HttpRule additionalBindings */
            additionalBindings?: (google.api.IHttpRule[]|null);
        }

        /** Represents a HttpRule. */
        class HttpRule implements IHttpRule {

            /**
             * Constructs a new HttpRule.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.api.IHttpRule);

            /** HttpRule selector. */
            public selector: string;

            /** HttpRule get. */
            public get: string;

            /** HttpRule put. */
            public put: string;

            /** HttpRule post. */
            public post: string;

            /** HttpRule delete. */
            public delete: string;

            /** HttpRule patch. */
            public patch: string;

            /** HttpRule custom. */
            public custom?: (google.api.ICustomHttpPattern|null);

            /** HttpRule body. */
            public body: string;

            /** HttpRule additionalBindings. */
            public additionalBindings: google.api.IHttpRule[];

            /** HttpRule pattern. */
            public pattern?: ("get"|"put"|"post"|"delete"|"patch"|"custom");

            /**
             * Creates a new HttpRule instance using the specified properties.
             * @param [properties] Properties to set
             * @returns HttpRule instance
             */
            public static create(properties?: google.api.IHttpRule): google.api.HttpRule;

            /**
             * Encodes the specified HttpRule message. Does not implicitly {@link google.api.HttpRule.verify|verify} messages.
             * @param message HttpRule message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.api.IHttpRule, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified HttpRule message, length delimited. Does not implicitly {@link google.api.HttpRule.verify|verify} messages.
             * @param message HttpRule message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.api.IHttpRule, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a HttpRule message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns HttpRule
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.HttpRule;

            /**
             * Decodes a HttpRule message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns HttpRule
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.HttpRule;

            /**
             * Verifies a HttpRule message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a HttpRule message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns HttpRule
             */
            public static fromObject(object: { [k: string]: any }): google.api.HttpRule;

            /**
             * Creates a plain object from a HttpRule message. Also converts values to other types if specified.
             * @param message HttpRule
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.api.HttpRule, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this HttpRule to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a CustomHttpPattern. */
        interface ICustomHttpPattern {

            /** CustomHttpPattern kind */
            kind?: (string|null);

            /** CustomHttpPattern path */
            path?: (string|null);
        }

        /** Represents a CustomHttpPattern. */
        class CustomHttpPattern implements ICustomHttpPattern {

            /**
             * Constructs a new CustomHttpPattern.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.api.ICustomHttpPattern);

            /** CustomHttpPattern kind. */
            public kind: string;

            /** CustomHttpPattern path. */
            public path: string;

            /**
             * Creates a new CustomHttpPattern instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CustomHttpPattern instance
             */
            public static create(properties?: google.api.ICustomHttpPattern): google.api.CustomHttpPattern;

            /**
             * Encodes the specified CustomHttpPattern message. Does not implicitly {@link google.api.CustomHttpPattern.verify|verify} messages.
             * @param message CustomHttpPattern message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.api.ICustomHttpPattern, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CustomHttpPattern message, length delimited. Does not implicitly {@link google.api.CustomHttpPattern.verify|verify} messages.
             * @param message CustomHttpPattern message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.api.ICustomHttpPattern, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CustomHttpPattern message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CustomHttpPattern
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.CustomHttpPattern;

            /**
             * Decodes a CustomHttpPattern message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CustomHttpPattern
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.CustomHttpPattern;

            /**
             * Verifies a CustomHttpPattern message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a CustomHttpPattern message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns CustomHttpPattern
             */
            public static fromObject(object: { [k: string]: any }): google.api.CustomHttpPattern;

            /**
             * Creates a plain object from a CustomHttpPattern message. Also converts values to other types if specified.
             * @param message CustomHttpPattern
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.api.CustomHttpPattern, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this CustomHttpPattern to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a FileDescriptorSet. */
        interface IFileDescriptorSet {

            /** FileDescriptorSet file */
            file?: (google.protobuf.IFileDescriptorProto[]|null);
        }

        /** Represents a FileDescriptorSet. */
        class FileDescriptorSet implements IFileDescriptorSet {

            /**
             * Constructs a new FileDescriptorSet.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFileDescriptorSet);

            /** FileDescriptorSet file. */
            public file: google.protobuf.IFileDescriptorProto[];

            /**
             * Creates a new FileDescriptorSet instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FileDescriptorSet instance
             */
            public static create(properties?: google.protobuf.IFileDescriptorSet): google.protobuf.FileDescriptorSet;

            /**
             * Encodes the specified FileDescriptorSet message. Does not implicitly {@link google.protobuf.FileDescriptorSet.verify|verify} messages.
             * @param message FileDescriptorSet message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFileDescriptorSet, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FileDescriptorSet message, length delimited. Does not implicitly {@link google.protobuf.FileDescriptorSet.verify|verify} messages.
             * @param message FileDescriptorSet message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFileDescriptorSet, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FileDescriptorSet message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FileDescriptorSet
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileDescriptorSet;

            /**
             * Decodes a FileDescriptorSet message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FileDescriptorSet
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileDescriptorSet;

            /**
             * Verifies a FileDescriptorSet message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FileDescriptorSet message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FileDescriptorSet
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorSet;

            /**
             * Creates a plain object from a FileDescriptorSet message. Also converts values to other types if specified.
             * @param message FileDescriptorSet
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FileDescriptorSet, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FileDescriptorSet to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a FileDescriptorProto. */
        interface IFileDescriptorProto {

            /** FileDescriptorProto name */
            name?: (string|null);

            /** FileDescriptorProto package */
            "package"?: (string|null);

            /** FileDescriptorProto dependency */
            dependency?: (string[]|null);

            /** FileDescriptorProto publicDependency */
            publicDependency?: (number[]|null);

            /** FileDescriptorProto weakDependency */
            weakDependency?: (number[]|null);

            /** FileDescriptorProto messageType */
            messageType?: (google.protobuf.IDescriptorProto[]|null);

            /** FileDescriptorProto enumType */
            enumType?: (google.protobuf.IEnumDescriptorProto[]|null);

            /** FileDescriptorProto service */
            service?: (google.protobuf.IServiceDescriptorProto[]|null);

            /** FileDescriptorProto extension */
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);

            /** FileDescriptorProto options */
            options?: (google.protobuf.IFileOptions|null);

            /** FileDescriptorProto sourceCodeInfo */
            sourceCodeInfo?: (google.protobuf.ISourceCodeInfo|null);

            /** FileDescriptorProto syntax */
            syntax?: (string|null);
        }

        /** Represents a FileDescriptorProto. */
        class FileDescriptorProto implements IFileDescriptorProto {

            /**
             * Constructs a new FileDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFileDescriptorProto);

            /** FileDescriptorProto name. */
            public name: string;

            /** FileDescriptorProto package. */
            public package: string;

            /** FileDescriptorProto dependency. */
            public dependency: string[];

            /** FileDescriptorProto publicDependency. */
            public publicDependency: number[];

            /** FileDescriptorProto weakDependency. */
            public weakDependency: number[];

            /** FileDescriptorProto messageType. */
            public messageType: google.protobuf.IDescriptorProto[];

            /** FileDescriptorProto enumType. */
            public enumType: google.protobuf.IEnumDescriptorProto[];

            /** FileDescriptorProto service. */
            public service: google.protobuf.IServiceDescriptorProto[];

            /** FileDescriptorProto extension. */
            public extension: google.protobuf.IFieldDescriptorProto[];

            /** FileDescriptorProto options. */
            public options?: (google.protobuf.IFileOptions|null);

            /** FileDescriptorProto sourceCodeInfo. */
            public sourceCodeInfo?: (google.protobuf.ISourceCodeInfo|null);

            /** FileDescriptorProto syntax. */
            public syntax: string;

            /**
             * Creates a new FileDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FileDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IFileDescriptorProto): google.protobuf.FileDescriptorProto;

            /**
             * Encodes the specified FileDescriptorProto message. Does not implicitly {@link google.protobuf.FileDescriptorProto.verify|verify} messages.
             * @param message FileDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFileDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FileDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.FileDescriptorProto.verify|verify} messages.
             * @param message FileDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFileDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FileDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FileDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileDescriptorProto;

            /**
             * Decodes a FileDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FileDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileDescriptorProto;

            /**
             * Verifies a FileDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FileDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FileDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorProto;

            /**
             * Creates a plain object from a FileDescriptorProto message. Also converts values to other types if specified.
             * @param message FileDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FileDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FileDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a DescriptorProto. */
        interface IDescriptorProto {

            /** DescriptorProto name */
            name?: (string|null);

            /** DescriptorProto field */
            field?: (google.protobuf.IFieldDescriptorProto[]|null);

            /** DescriptorProto extension */
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);

            /** DescriptorProto nestedType */
            nestedType?: (google.protobuf.IDescriptorProto[]|null);

            /** DescriptorProto enumType */
            enumType?: (google.protobuf.IEnumDescriptorProto[]|null);

            /** DescriptorProto extensionRange */
            extensionRange?: (google.protobuf.DescriptorProto.IExtensionRange[]|null);

            /** DescriptorProto oneofDecl */
            oneofDecl?: (google.protobuf.IOneofDescriptorProto[]|null);

            /** DescriptorProto options */
            options?: (google.protobuf.IMessageOptions|null);

            /** DescriptorProto reservedRange */
            reservedRange?: (google.protobuf.DescriptorProto.IReservedRange[]|null);

            /** DescriptorProto reservedName */
            reservedName?: (string[]|null);
        }

        /** Represents a DescriptorProto. */
        class DescriptorProto implements IDescriptorProto {

            /**
             * Constructs a new DescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IDescriptorProto);

            /** DescriptorProto name. */
            public name: string;

            /** DescriptorProto field. */
            public field: google.protobuf.IFieldDescriptorProto[];

            /** DescriptorProto extension. */
            public extension: google.protobuf.IFieldDescriptorProto[];

            /** DescriptorProto nestedType. */
            public nestedType: google.protobuf.IDescriptorProto[];

            /** DescriptorProto enumType. */
            public enumType: google.protobuf.IEnumDescriptorProto[];

            /** DescriptorProto extensionRange. */
            public extensionRange: google.protobuf.DescriptorProto.IExtensionRange[];

            /** DescriptorProto oneofDecl. */
            public oneofDecl: google.protobuf.IOneofDescriptorProto[];

            /** DescriptorProto options. */
            public options?: (google.protobuf.IMessageOptions|null);

            /** DescriptorProto reservedRange. */
            public reservedRange: google.protobuf.DescriptorProto.IReservedRange[];

            /** DescriptorProto reservedName. */
            public reservedName: string[];

            /**
             * Creates a new DescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DescriptorProto instance
             */
            public static create(properties?: google.protobuf.IDescriptorProto): google.protobuf.DescriptorProto;

            /**
             * Encodes the specified DescriptorProto message. Does not implicitly {@link google.protobuf.DescriptorProto.verify|verify} messages.
             * @param message DescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.DescriptorProto.verify|verify} messages.
             * @param message DescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto;

            /**
             * Decodes a DescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto;

            /**
             * Verifies a DescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a DescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns DescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto;

            /**
             * Creates a plain object from a DescriptorProto message. Also converts values to other types if specified.
             * @param message DescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.DescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace DescriptorProto {

            /** Properties of an ExtensionRange. */
            interface IExtensionRange {

                /** ExtensionRange start */
                start?: (number|null);

                /** ExtensionRange end */
                end?: (number|null);

                /** ExtensionRange options */
                options?: (google.protobuf.IExtensionRangeOptions|null);
            }

            /** Represents an ExtensionRange. */
            class ExtensionRange implements IExtensionRange {

                /**
                 * Constructs a new ExtensionRange.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.DescriptorProto.IExtensionRange);

                /** ExtensionRange start. */
                public start: number;

                /** ExtensionRange end. */
                public end: number;

                /** ExtensionRange options. */
                public options?: (google.protobuf.IExtensionRangeOptions|null);

                /**
                 * Creates a new ExtensionRange instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ExtensionRange instance
                 */
                public static create(properties?: google.protobuf.DescriptorProto.IExtensionRange): google.protobuf.DescriptorProto.ExtensionRange;

                /**
                 * Encodes the specified ExtensionRange message. Does not implicitly {@link google.protobuf.DescriptorProto.ExtensionRange.verify|verify} messages.
                 * @param message ExtensionRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.DescriptorProto.IExtensionRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ExtensionRange message, length delimited. Does not implicitly {@link google.protobuf.DescriptorProto.ExtensionRange.verify|verify} messages.
                 * @param message ExtensionRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.DescriptorProto.IExtensionRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an ExtensionRange message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ExtensionRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto.ExtensionRange;

                /**
                 * Decodes an ExtensionRange message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ExtensionRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto.ExtensionRange;

                /**
                 * Verifies an ExtensionRange message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an ExtensionRange message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ExtensionRange
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ExtensionRange;

                /**
                 * Creates a plain object from an ExtensionRange message. Also converts values to other types if specified.
                 * @param message ExtensionRange
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.DescriptorProto.ExtensionRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ExtensionRange to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            /** Properties of a ReservedRange. */
            interface IReservedRange {

                /** ReservedRange start */
                start?: (number|null);

                /** ReservedRange end */
                end?: (number|null);
            }

            /** Represents a ReservedRange. */
            class ReservedRange implements IReservedRange {

                /**
                 * Constructs a new ReservedRange.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.DescriptorProto.IReservedRange);

                /** ReservedRange start. */
                public start: number;

                /** ReservedRange end. */
                public end: number;

                /**
                 * Creates a new ReservedRange instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns ReservedRange instance
                 */
                public static create(properties?: google.protobuf.DescriptorProto.IReservedRange): google.protobuf.DescriptorProto.ReservedRange;

                /**
                 * Encodes the specified ReservedRange message. Does not implicitly {@link google.protobuf.DescriptorProto.ReservedRange.verify|verify} messages.
                 * @param message ReservedRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.DescriptorProto.IReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified ReservedRange message, length delimited. Does not implicitly {@link google.protobuf.DescriptorProto.ReservedRange.verify|verify} messages.
                 * @param message ReservedRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.DescriptorProto.IReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a ReservedRange message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns ReservedRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto.ReservedRange;

                /**
                 * Decodes a ReservedRange message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns ReservedRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto.ReservedRange;

                /**
                 * Verifies a ReservedRange message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a ReservedRange message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns ReservedRange
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ReservedRange;

                /**
                 * Creates a plain object from a ReservedRange message. Also converts values to other types if specified.
                 * @param message ReservedRange
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.DescriptorProto.ReservedRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this ReservedRange to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of an ExtensionRangeOptions. */
        interface IExtensionRangeOptions {

            /** ExtensionRangeOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        /** Represents an ExtensionRangeOptions. */
        class ExtensionRangeOptions implements IExtensionRangeOptions {

            /**
             * Constructs a new ExtensionRangeOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IExtensionRangeOptions);

            /** ExtensionRangeOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new ExtensionRangeOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ExtensionRangeOptions instance
             */
            public static create(properties?: google.protobuf.IExtensionRangeOptions): google.protobuf.ExtensionRangeOptions;

            /**
             * Encodes the specified ExtensionRangeOptions message. Does not implicitly {@link google.protobuf.ExtensionRangeOptions.verify|verify} messages.
             * @param message ExtensionRangeOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IExtensionRangeOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ExtensionRangeOptions message, length delimited. Does not implicitly {@link google.protobuf.ExtensionRangeOptions.verify|verify} messages.
             * @param message ExtensionRangeOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IExtensionRangeOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ExtensionRangeOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ExtensionRangeOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ExtensionRangeOptions;

            /**
             * Decodes an ExtensionRangeOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ExtensionRangeOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ExtensionRangeOptions;

            /**
             * Verifies an ExtensionRangeOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an ExtensionRangeOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ExtensionRangeOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.ExtensionRangeOptions;

            /**
             * Creates a plain object from an ExtensionRangeOptions message. Also converts values to other types if specified.
             * @param message ExtensionRangeOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.ExtensionRangeOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ExtensionRangeOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a FieldDescriptorProto. */
        interface IFieldDescriptorProto {

            /** FieldDescriptorProto name */
            name?: (string|null);

            /** FieldDescriptorProto number */
            number?: (number|null);

            /** FieldDescriptorProto label */
            label?: (google.protobuf.FieldDescriptorProto.Label|null);

            /** FieldDescriptorProto type */
            type?: (google.protobuf.FieldDescriptorProto.Type|null);

            /** FieldDescriptorProto typeName */
            typeName?: (string|null);

            /** FieldDescriptorProto extendee */
            extendee?: (string|null);

            /** FieldDescriptorProto defaultValue */
            defaultValue?: (string|null);

            /** FieldDescriptorProto oneofIndex */
            oneofIndex?: (number|null);

            /** FieldDescriptorProto jsonName */
            jsonName?: (string|null);

            /** FieldDescriptorProto options */
            options?: (google.protobuf.IFieldOptions|null);
        }

        /** Represents a FieldDescriptorProto. */
        class FieldDescriptorProto implements IFieldDescriptorProto {

            /**
             * Constructs a new FieldDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFieldDescriptorProto);

            /** FieldDescriptorProto name. */
            public name: string;

            /** FieldDescriptorProto number. */
            public number: number;

            /** FieldDescriptorProto label. */
            public label: google.protobuf.FieldDescriptorProto.Label;

            /** FieldDescriptorProto type. */
            public type: google.protobuf.FieldDescriptorProto.Type;

            /** FieldDescriptorProto typeName. */
            public typeName: string;

            /** FieldDescriptorProto extendee. */
            public extendee: string;

            /** FieldDescriptorProto defaultValue. */
            public defaultValue: string;

            /** FieldDescriptorProto oneofIndex. */
            public oneofIndex: number;

            /** FieldDescriptorProto jsonName. */
            public jsonName: string;

            /** FieldDescriptorProto options. */
            public options?: (google.protobuf.IFieldOptions|null);

            /**
             * Creates a new FieldDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FieldDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IFieldDescriptorProto): google.protobuf.FieldDescriptorProto;

            /**
             * Encodes the specified FieldDescriptorProto message. Does not implicitly {@link google.protobuf.FieldDescriptorProto.verify|verify} messages.
             * @param message FieldDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFieldDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FieldDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.FieldDescriptorProto.verify|verify} messages.
             * @param message FieldDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFieldDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FieldDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FieldDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FieldDescriptorProto;

            /**
             * Decodes a FieldDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FieldDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FieldDescriptorProto;

            /**
             * Verifies a FieldDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FieldDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FieldDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FieldDescriptorProto;

            /**
             * Creates a plain object from a FieldDescriptorProto message. Also converts values to other types if specified.
             * @param message FieldDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FieldDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FieldDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace FieldDescriptorProto {

            /** Type enum. */
            enum Type {
                TYPE_DOUBLE = 1,
                TYPE_FLOAT = 2,
                TYPE_INT64 = 3,
                TYPE_UINT64 = 4,
                TYPE_INT32 = 5,
                TYPE_FIXED64 = 6,
                TYPE_FIXED32 = 7,
                TYPE_BOOL = 8,
                TYPE_STRING = 9,
                TYPE_GROUP = 10,
                TYPE_MESSAGE = 11,
                TYPE_BYTES = 12,
                TYPE_UINT32 = 13,
                TYPE_ENUM = 14,
                TYPE_SFIXED32 = 15,
                TYPE_SFIXED64 = 16,
                TYPE_SINT32 = 17,
                TYPE_SINT64 = 18
            }

            /** Label enum. */
            enum Label {
                LABEL_OPTIONAL = 1,
                LABEL_REQUIRED = 2,
                LABEL_REPEATED = 3
            }
        }

        /** Properties of an OneofDescriptorProto. */
        interface IOneofDescriptorProto {

            /** OneofDescriptorProto name */
            name?: (string|null);

            /** OneofDescriptorProto options */
            options?: (google.protobuf.IOneofOptions|null);
        }

        /** Represents an OneofDescriptorProto. */
        class OneofDescriptorProto implements IOneofDescriptorProto {

            /**
             * Constructs a new OneofDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IOneofDescriptorProto);

            /** OneofDescriptorProto name. */
            public name: string;

            /** OneofDescriptorProto options. */
            public options?: (google.protobuf.IOneofOptions|null);

            /**
             * Creates a new OneofDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns OneofDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IOneofDescriptorProto): google.protobuf.OneofDescriptorProto;

            /**
             * Encodes the specified OneofDescriptorProto message. Does not implicitly {@link google.protobuf.OneofDescriptorProto.verify|verify} messages.
             * @param message OneofDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IOneofDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OneofDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.OneofDescriptorProto.verify|verify} messages.
             * @param message OneofDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IOneofDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OneofDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns OneofDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.OneofDescriptorProto;

            /**
             * Decodes an OneofDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns OneofDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.OneofDescriptorProto;

            /**
             * Verifies an OneofDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OneofDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OneofDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.OneofDescriptorProto;

            /**
             * Creates a plain object from an OneofDescriptorProto message. Also converts values to other types if specified.
             * @param message OneofDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.OneofDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OneofDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an EnumDescriptorProto. */
        interface IEnumDescriptorProto {

            /** EnumDescriptorProto name */
            name?: (string|null);

            /** EnumDescriptorProto value */
            value?: (google.protobuf.IEnumValueDescriptorProto[]|null);

            /** EnumDescriptorProto options */
            options?: (google.protobuf.IEnumOptions|null);

            /** EnumDescriptorProto reservedRange */
            reservedRange?: (google.protobuf.EnumDescriptorProto.IEnumReservedRange[]|null);

            /** EnumDescriptorProto reservedName */
            reservedName?: (string[]|null);
        }

        /** Represents an EnumDescriptorProto. */
        class EnumDescriptorProto implements IEnumDescriptorProto {

            /**
             * Constructs a new EnumDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEnumDescriptorProto);

            /** EnumDescriptorProto name. */
            public name: string;

            /** EnumDescriptorProto value. */
            public value: google.protobuf.IEnumValueDescriptorProto[];

            /** EnumDescriptorProto options. */
            public options?: (google.protobuf.IEnumOptions|null);

            /** EnumDescriptorProto reservedRange. */
            public reservedRange: google.protobuf.EnumDescriptorProto.IEnumReservedRange[];

            /** EnumDescriptorProto reservedName. */
            public reservedName: string[];

            /**
             * Creates a new EnumDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EnumDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IEnumDescriptorProto): google.protobuf.EnumDescriptorProto;

            /**
             * Encodes the specified EnumDescriptorProto message. Does not implicitly {@link google.protobuf.EnumDescriptorProto.verify|verify} messages.
             * @param message EnumDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEnumDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnumDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.EnumDescriptorProto.verify|verify} messages.
             * @param message EnumDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEnumDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnumDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnumDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumDescriptorProto;

            /**
             * Decodes an EnumDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnumDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumDescriptorProto;

            /**
             * Verifies an EnumDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnumDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnumDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumDescriptorProto;

            /**
             * Creates a plain object from an EnumDescriptorProto message. Also converts values to other types if specified.
             * @param message EnumDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.EnumDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnumDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace EnumDescriptorProto {

            /** Properties of an EnumReservedRange. */
            interface IEnumReservedRange {

                /** EnumReservedRange start */
                start?: (number|null);

                /** EnumReservedRange end */
                end?: (number|null);
            }

            /** Represents an EnumReservedRange. */
            class EnumReservedRange implements IEnumReservedRange {

                /**
                 * Constructs a new EnumReservedRange.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.EnumDescriptorProto.IEnumReservedRange);

                /** EnumReservedRange start. */
                public start: number;

                /** EnumReservedRange end. */
                public end: number;

                /**
                 * Creates a new EnumReservedRange instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns EnumReservedRange instance
                 */
                public static create(properties?: google.protobuf.EnumDescriptorProto.IEnumReservedRange): google.protobuf.EnumDescriptorProto.EnumReservedRange;

                /**
                 * Encodes the specified EnumReservedRange message. Does not implicitly {@link google.protobuf.EnumDescriptorProto.EnumReservedRange.verify|verify} messages.
                 * @param message EnumReservedRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.EnumDescriptorProto.IEnumReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified EnumReservedRange message, length delimited. Does not implicitly {@link google.protobuf.EnumDescriptorProto.EnumReservedRange.verify|verify} messages.
                 * @param message EnumReservedRange message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.EnumDescriptorProto.IEnumReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an EnumReservedRange message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns EnumReservedRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumDescriptorProto.EnumReservedRange;

                /**
                 * Decodes an EnumReservedRange message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns EnumReservedRange
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumDescriptorProto.EnumReservedRange;

                /**
                 * Verifies an EnumReservedRange message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an EnumReservedRange message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns EnumReservedRange
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.EnumDescriptorProto.EnumReservedRange;

                /**
                 * Creates a plain object from an EnumReservedRange message. Also converts values to other types if specified.
                 * @param message EnumReservedRange
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.EnumDescriptorProto.EnumReservedRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this EnumReservedRange to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of an EnumValueDescriptorProto. */
        interface IEnumValueDescriptorProto {

            /** EnumValueDescriptorProto name */
            name?: (string|null);

            /** EnumValueDescriptorProto number */
            number?: (number|null);

            /** EnumValueDescriptorProto options */
            options?: (google.protobuf.IEnumValueOptions|null);
        }

        /** Represents an EnumValueDescriptorProto. */
        class EnumValueDescriptorProto implements IEnumValueDescriptorProto {

            /**
             * Constructs a new EnumValueDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEnumValueDescriptorProto);

            /** EnumValueDescriptorProto name. */
            public name: string;

            /** EnumValueDescriptorProto number. */
            public number: number;

            /** EnumValueDescriptorProto options. */
            public options?: (google.protobuf.IEnumValueOptions|null);

            /**
             * Creates a new EnumValueDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EnumValueDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IEnumValueDescriptorProto): google.protobuf.EnumValueDescriptorProto;

            /**
             * Encodes the specified EnumValueDescriptorProto message. Does not implicitly {@link google.protobuf.EnumValueDescriptorProto.verify|verify} messages.
             * @param message EnumValueDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEnumValueDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnumValueDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.EnumValueDescriptorProto.verify|verify} messages.
             * @param message EnumValueDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEnumValueDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnumValueDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnumValueDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumValueDescriptorProto;

            /**
             * Decodes an EnumValueDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnumValueDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumValueDescriptorProto;

            /**
             * Verifies an EnumValueDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnumValueDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnumValueDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueDescriptorProto;

            /**
             * Creates a plain object from an EnumValueDescriptorProto message. Also converts values to other types if specified.
             * @param message EnumValueDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.EnumValueDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnumValueDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ServiceDescriptorProto. */
        interface IServiceDescriptorProto {

            /** ServiceDescriptorProto name */
            name?: (string|null);

            /** ServiceDescriptorProto method */
            method?: (google.protobuf.IMethodDescriptorProto[]|null);

            /** ServiceDescriptorProto options */
            options?: (google.protobuf.IServiceOptions|null);
        }

        /** Represents a ServiceDescriptorProto. */
        class ServiceDescriptorProto implements IServiceDescriptorProto {

            /**
             * Constructs a new ServiceDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IServiceDescriptorProto);

            /** ServiceDescriptorProto name. */
            public name: string;

            /** ServiceDescriptorProto method. */
            public method: google.protobuf.IMethodDescriptorProto[];

            /** ServiceDescriptorProto options. */
            public options?: (google.protobuf.IServiceOptions|null);

            /**
             * Creates a new ServiceDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ServiceDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IServiceDescriptorProto): google.protobuf.ServiceDescriptorProto;

            /**
             * Encodes the specified ServiceDescriptorProto message. Does not implicitly {@link google.protobuf.ServiceDescriptorProto.verify|verify} messages.
             * @param message ServiceDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IServiceDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ServiceDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.ServiceDescriptorProto.verify|verify} messages.
             * @param message ServiceDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IServiceDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ServiceDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ServiceDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ServiceDescriptorProto;

            /**
             * Decodes a ServiceDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ServiceDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ServiceDescriptorProto;

            /**
             * Verifies a ServiceDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ServiceDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ServiceDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceDescriptorProto;

            /**
             * Creates a plain object from a ServiceDescriptorProto message. Also converts values to other types if specified.
             * @param message ServiceDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.ServiceDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ServiceDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a MethodDescriptorProto. */
        interface IMethodDescriptorProto {

            /** MethodDescriptorProto name */
            name?: (string|null);

            /** MethodDescriptorProto inputType */
            inputType?: (string|null);

            /** MethodDescriptorProto outputType */
            outputType?: (string|null);

            /** MethodDescriptorProto options */
            options?: (google.protobuf.IMethodOptions|null);

            /** MethodDescriptorProto clientStreaming */
            clientStreaming?: (boolean|null);

            /** MethodDescriptorProto serverStreaming */
            serverStreaming?: (boolean|null);
        }

        /** Represents a MethodDescriptorProto. */
        class MethodDescriptorProto implements IMethodDescriptorProto {

            /**
             * Constructs a new MethodDescriptorProto.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IMethodDescriptorProto);

            /** MethodDescriptorProto name. */
            public name: string;

            /** MethodDescriptorProto inputType. */
            public inputType: string;

            /** MethodDescriptorProto outputType. */
            public outputType: string;

            /** MethodDescriptorProto options. */
            public options?: (google.protobuf.IMethodOptions|null);

            /** MethodDescriptorProto clientStreaming. */
            public clientStreaming: boolean;

            /** MethodDescriptorProto serverStreaming. */
            public serverStreaming: boolean;

            /**
             * Creates a new MethodDescriptorProto instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MethodDescriptorProto instance
             */
            public static create(properties?: google.protobuf.IMethodDescriptorProto): google.protobuf.MethodDescriptorProto;

            /**
             * Encodes the specified MethodDescriptorProto message. Does not implicitly {@link google.protobuf.MethodDescriptorProto.verify|verify} messages.
             * @param message MethodDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IMethodDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MethodDescriptorProto message, length delimited. Does not implicitly {@link google.protobuf.MethodDescriptorProto.verify|verify} messages.
             * @param message MethodDescriptorProto message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IMethodDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MethodDescriptorProto message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MethodDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MethodDescriptorProto;

            /**
             * Decodes a MethodDescriptorProto message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MethodDescriptorProto
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MethodDescriptorProto;

            /**
             * Verifies a MethodDescriptorProto message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MethodDescriptorProto message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MethodDescriptorProto
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.MethodDescriptorProto;

            /**
             * Creates a plain object from a MethodDescriptorProto message. Also converts values to other types if specified.
             * @param message MethodDescriptorProto
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.MethodDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MethodDescriptorProto to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a FileOptions. */
        interface IFileOptions {

            /** FileOptions javaPackage */
            javaPackage?: (string|null);

            /** FileOptions javaOuterClassname */
            javaOuterClassname?: (string|null);

            /** FileOptions javaMultipleFiles */
            javaMultipleFiles?: (boolean|null);

            /** FileOptions javaGenerateEqualsAndHash */
            javaGenerateEqualsAndHash?: (boolean|null);

            /** FileOptions javaStringCheckUtf8 */
            javaStringCheckUtf8?: (boolean|null);

            /** FileOptions optimizeFor */
            optimizeFor?: (google.protobuf.FileOptions.OptimizeMode|null);

            /** FileOptions goPackage */
            goPackage?: (string|null);

            /** FileOptions ccGenericServices */
            ccGenericServices?: (boolean|null);

            /** FileOptions javaGenericServices */
            javaGenericServices?: (boolean|null);

            /** FileOptions pyGenericServices */
            pyGenericServices?: (boolean|null);

            /** FileOptions phpGenericServices */
            phpGenericServices?: (boolean|null);

            /** FileOptions deprecated */
            deprecated?: (boolean|null);

            /** FileOptions ccEnableArenas */
            ccEnableArenas?: (boolean|null);

            /** FileOptions objcClassPrefix */
            objcClassPrefix?: (string|null);

            /** FileOptions csharpNamespace */
            csharpNamespace?: (string|null);

            /** FileOptions swiftPrefix */
            swiftPrefix?: (string|null);

            /** FileOptions phpClassPrefix */
            phpClassPrefix?: (string|null);

            /** FileOptions phpNamespace */
            phpNamespace?: (string|null);

            /** FileOptions phpMetadataNamespace */
            phpMetadataNamespace?: (string|null);

            /** FileOptions rubyPackage */
            rubyPackage?: (string|null);

            /** FileOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);

            /** FileOptions .gogoproto.goprotoGettersAll */
            ".gogoproto.goprotoGettersAll"?: (boolean|null);

            /** FileOptions .gogoproto.goprotoEnumPrefixAll */
            ".gogoproto.goprotoEnumPrefixAll"?: (boolean|null);

            /** FileOptions .gogoproto.goprotoStringerAll */
            ".gogoproto.goprotoStringerAll"?: (boolean|null);

            /** FileOptions .gogoproto.verboseEqualAll */
            ".gogoproto.verboseEqualAll"?: (boolean|null);

            /** FileOptions .gogoproto.faceAll */
            ".gogoproto.faceAll"?: (boolean|null);

            /** FileOptions .gogoproto.gostringAll */
            ".gogoproto.gostringAll"?: (boolean|null);

            /** FileOptions .gogoproto.populateAll */
            ".gogoproto.populateAll"?: (boolean|null);

            /** FileOptions .gogoproto.stringerAll */
            ".gogoproto.stringerAll"?: (boolean|null);

            /** FileOptions .gogoproto.onlyoneAll */
            ".gogoproto.onlyoneAll"?: (boolean|null);

            /** FileOptions .gogoproto.equalAll */
            ".gogoproto.equalAll"?: (boolean|null);

            /** FileOptions .gogoproto.descriptionAll */
            ".gogoproto.descriptionAll"?: (boolean|null);

            /** FileOptions .gogoproto.testgenAll */
            ".gogoproto.testgenAll"?: (boolean|null);

            /** FileOptions .gogoproto.benchgenAll */
            ".gogoproto.benchgenAll"?: (boolean|null);

            /** FileOptions .gogoproto.marshalerAll */
            ".gogoproto.marshalerAll"?: (boolean|null);

            /** FileOptions .gogoproto.unmarshalerAll */
            ".gogoproto.unmarshalerAll"?: (boolean|null);

            /** FileOptions .gogoproto.stableMarshalerAll */
            ".gogoproto.stableMarshalerAll"?: (boolean|null);

            /** FileOptions .gogoproto.sizerAll */
            ".gogoproto.sizerAll"?: (boolean|null);

            /** FileOptions .gogoproto.goprotoEnumStringerAll */
            ".gogoproto.goprotoEnumStringerAll"?: (boolean|null);

            /** FileOptions .gogoproto.enumStringerAll */
            ".gogoproto.enumStringerAll"?: (boolean|null);

            /** FileOptions .gogoproto.unsafeMarshalerAll */
            ".gogoproto.unsafeMarshalerAll"?: (boolean|null);

            /** FileOptions .gogoproto.unsafeUnmarshalerAll */
            ".gogoproto.unsafeUnmarshalerAll"?: (boolean|null);

            /** FileOptions .gogoproto.goprotoExtensionsMapAll */
            ".gogoproto.goprotoExtensionsMapAll"?: (boolean|null);

            /** FileOptions .gogoproto.goprotoUnrecognizedAll */
            ".gogoproto.goprotoUnrecognizedAll"?: (boolean|null);

            /** FileOptions .gogoproto.gogoprotoImport */
            ".gogoproto.gogoprotoImport"?: (boolean|null);

            /** FileOptions .gogoproto.protosizerAll */
            ".gogoproto.protosizerAll"?: (boolean|null);

            /** FileOptions .gogoproto.compareAll */
            ".gogoproto.compareAll"?: (boolean|null);

            /** FileOptions .gogoproto.typedeclAll */
            ".gogoproto.typedeclAll"?: (boolean|null);

            /** FileOptions .gogoproto.enumdeclAll */
            ".gogoproto.enumdeclAll"?: (boolean|null);

            /** FileOptions .gogoproto.goprotoRegistration */
            ".gogoproto.goprotoRegistration"?: (boolean|null);

            /** FileOptions .gogoproto.messagenameAll */
            ".gogoproto.messagenameAll"?: (boolean|null);

            /** FileOptions .gogoproto.goprotoSizecacheAll */
            ".gogoproto.goprotoSizecacheAll"?: (boolean|null);

            /** FileOptions .gogoproto.goprotoUnkeyedAll */
            ".gogoproto.goprotoUnkeyedAll"?: (boolean|null);
        }

        /** Represents a FileOptions. */
        class FileOptions implements IFileOptions {

            /**
             * Constructs a new FileOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFileOptions);

            /** FileOptions javaPackage. */
            public javaPackage: string;

            /** FileOptions javaOuterClassname. */
            public javaOuterClassname: string;

            /** FileOptions javaMultipleFiles. */
            public javaMultipleFiles: boolean;

            /** FileOptions javaGenerateEqualsAndHash. */
            public javaGenerateEqualsAndHash: boolean;

            /** FileOptions javaStringCheckUtf8. */
            public javaStringCheckUtf8: boolean;

            /** FileOptions optimizeFor. */
            public optimizeFor: google.protobuf.FileOptions.OptimizeMode;

            /** FileOptions goPackage. */
            public goPackage: string;

            /** FileOptions ccGenericServices. */
            public ccGenericServices: boolean;

            /** FileOptions javaGenericServices. */
            public javaGenericServices: boolean;

            /** FileOptions pyGenericServices. */
            public pyGenericServices: boolean;

            /** FileOptions phpGenericServices. */
            public phpGenericServices: boolean;

            /** FileOptions deprecated. */
            public deprecated: boolean;

            /** FileOptions ccEnableArenas. */
            public ccEnableArenas: boolean;

            /** FileOptions objcClassPrefix. */
            public objcClassPrefix: string;

            /** FileOptions csharpNamespace. */
            public csharpNamespace: string;

            /** FileOptions swiftPrefix. */
            public swiftPrefix: string;

            /** FileOptions phpClassPrefix. */
            public phpClassPrefix: string;

            /** FileOptions phpNamespace. */
            public phpNamespace: string;

            /** FileOptions phpMetadataNamespace. */
            public phpMetadataNamespace: string;

            /** FileOptions rubyPackage. */
            public rubyPackage: string;

            /** FileOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new FileOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FileOptions instance
             */
            public static create(properties?: google.protobuf.IFileOptions): google.protobuf.FileOptions;

            /**
             * Encodes the specified FileOptions message. Does not implicitly {@link google.protobuf.FileOptions.verify|verify} messages.
             * @param message FileOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FileOptions message, length delimited. Does not implicitly {@link google.protobuf.FileOptions.verify|verify} messages.
             * @param message FileOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FileOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FileOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileOptions;

            /**
             * Decodes a FileOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FileOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileOptions;

            /**
             * Verifies a FileOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FileOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FileOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileOptions;

            /**
             * Creates a plain object from a FileOptions message. Also converts values to other types if specified.
             * @param message FileOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FileOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FileOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace FileOptions {

            /** OptimizeMode enum. */
            enum OptimizeMode {
                SPEED = 1,
                CODE_SIZE = 2,
                LITE_RUNTIME = 3
            }
        }

        /** Properties of a MessageOptions. */
        interface IMessageOptions {

            /** MessageOptions messageSetWireFormat */
            messageSetWireFormat?: (boolean|null);

            /** MessageOptions noStandardDescriptorAccessor */
            noStandardDescriptorAccessor?: (boolean|null);

            /** MessageOptions deprecated */
            deprecated?: (boolean|null);

            /** MessageOptions mapEntry */
            mapEntry?: (boolean|null);

            /** MessageOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);

            /** MessageOptions .gogoproto.goprotoGetters */
            ".gogoproto.goprotoGetters"?: (boolean|null);

            /** MessageOptions .gogoproto.goprotoStringer */
            ".gogoproto.goprotoStringer"?: (boolean|null);

            /** MessageOptions .gogoproto.verboseEqual */
            ".gogoproto.verboseEqual"?: (boolean|null);

            /** MessageOptions .gogoproto.face */
            ".gogoproto.face"?: (boolean|null);

            /** MessageOptions .gogoproto.gostring */
            ".gogoproto.gostring"?: (boolean|null);

            /** MessageOptions .gogoproto.populate */
            ".gogoproto.populate"?: (boolean|null);

            /** MessageOptions .gogoproto.stringer */
            ".gogoproto.stringer"?: (boolean|null);

            /** MessageOptions .gogoproto.onlyone */
            ".gogoproto.onlyone"?: (boolean|null);

            /** MessageOptions .gogoproto.equal */
            ".gogoproto.equal"?: (boolean|null);

            /** MessageOptions .gogoproto.description */
            ".gogoproto.description"?: (boolean|null);

            /** MessageOptions .gogoproto.testgen */
            ".gogoproto.testgen"?: (boolean|null);

            /** MessageOptions .gogoproto.benchgen */
            ".gogoproto.benchgen"?: (boolean|null);

            /** MessageOptions .gogoproto.marshaler */
            ".gogoproto.marshaler"?: (boolean|null);

            /** MessageOptions .gogoproto.unmarshaler */
            ".gogoproto.unmarshaler"?: (boolean|null);

            /** MessageOptions .gogoproto.stableMarshaler */
            ".gogoproto.stableMarshaler"?: (boolean|null);

            /** MessageOptions .gogoproto.sizer */
            ".gogoproto.sizer"?: (boolean|null);

            /** MessageOptions .gogoproto.unsafeMarshaler */
            ".gogoproto.unsafeMarshaler"?: (boolean|null);

            /** MessageOptions .gogoproto.unsafeUnmarshaler */
            ".gogoproto.unsafeUnmarshaler"?: (boolean|null);

            /** MessageOptions .gogoproto.goprotoExtensionsMap */
            ".gogoproto.goprotoExtensionsMap"?: (boolean|null);

            /** MessageOptions .gogoproto.goprotoUnrecognized */
            ".gogoproto.goprotoUnrecognized"?: (boolean|null);

            /** MessageOptions .gogoproto.protosizer */
            ".gogoproto.protosizer"?: (boolean|null);

            /** MessageOptions .gogoproto.compare */
            ".gogoproto.compare"?: (boolean|null);

            /** MessageOptions .gogoproto.typedecl */
            ".gogoproto.typedecl"?: (boolean|null);

            /** MessageOptions .gogoproto.messagename */
            ".gogoproto.messagename"?: (boolean|null);

            /** MessageOptions .gogoproto.goprotoSizecache */
            ".gogoproto.goprotoSizecache"?: (boolean|null);

            /** MessageOptions .gogoproto.goprotoUnkeyed */
            ".gogoproto.goprotoUnkeyed"?: (boolean|null);
        }

        /** Represents a MessageOptions. */
        class MessageOptions implements IMessageOptions {

            /**
             * Constructs a new MessageOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IMessageOptions);

            /** MessageOptions messageSetWireFormat. */
            public messageSetWireFormat: boolean;

            /** MessageOptions noStandardDescriptorAccessor. */
            public noStandardDescriptorAccessor: boolean;

            /** MessageOptions deprecated. */
            public deprecated: boolean;

            /** MessageOptions mapEntry. */
            public mapEntry: boolean;

            /** MessageOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new MessageOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MessageOptions instance
             */
            public static create(properties?: google.protobuf.IMessageOptions): google.protobuf.MessageOptions;

            /**
             * Encodes the specified MessageOptions message. Does not implicitly {@link google.protobuf.MessageOptions.verify|verify} messages.
             * @param message MessageOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IMessageOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MessageOptions message, length delimited. Does not implicitly {@link google.protobuf.MessageOptions.verify|verify} messages.
             * @param message MessageOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IMessageOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MessageOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MessageOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MessageOptions;

            /**
             * Decodes a MessageOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MessageOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MessageOptions;

            /**
             * Verifies a MessageOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MessageOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MessageOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.MessageOptions;

            /**
             * Creates a plain object from a MessageOptions message. Also converts values to other types if specified.
             * @param message MessageOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.MessageOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MessageOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a FieldOptions. */
        interface IFieldOptions {

            /** FieldOptions ctype */
            ctype?: (google.protobuf.FieldOptions.CType|null);

            /** FieldOptions packed */
            packed?: (boolean|null);

            /** FieldOptions jstype */
            jstype?: (google.protobuf.FieldOptions.JSType|null);

            /** FieldOptions lazy */
            lazy?: (boolean|null);

            /** FieldOptions deprecated */
            deprecated?: (boolean|null);

            /** FieldOptions weak */
            weak?: (boolean|null);

            /** FieldOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);

            /** FieldOptions .gogoproto.nullable */
            ".gogoproto.nullable"?: (boolean|null);

            /** FieldOptions .gogoproto.embed */
            ".gogoproto.embed"?: (boolean|null);

            /** FieldOptions .gogoproto.customtype */
            ".gogoproto.customtype"?: (string|null);

            /** FieldOptions .gogoproto.customname */
            ".gogoproto.customname"?: (string|null);

            /** FieldOptions .gogoproto.jsontag */
            ".gogoproto.jsontag"?: (string|null);

            /** FieldOptions .gogoproto.moretags */
            ".gogoproto.moretags"?: (string|null);

            /** FieldOptions .gogoproto.casttype */
            ".gogoproto.casttype"?: (string|null);

            /** FieldOptions .gogoproto.castkey */
            ".gogoproto.castkey"?: (string|null);

            /** FieldOptions .gogoproto.castvalue */
            ".gogoproto.castvalue"?: (string|null);

            /** FieldOptions .gogoproto.stdtime */
            ".gogoproto.stdtime"?: (boolean|null);

            /** FieldOptions .gogoproto.stdduration */
            ".gogoproto.stdduration"?: (boolean|null);

            /** FieldOptions .gogoproto.wktpointer */
            ".gogoproto.wktpointer"?: (boolean|null);
        }

        /** Represents a FieldOptions. */
        class FieldOptions implements IFieldOptions {

            /**
             * Constructs a new FieldOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IFieldOptions);

            /** FieldOptions ctype. */
            public ctype: google.protobuf.FieldOptions.CType;

            /** FieldOptions packed. */
            public packed: boolean;

            /** FieldOptions jstype. */
            public jstype: google.protobuf.FieldOptions.JSType;

            /** FieldOptions lazy. */
            public lazy: boolean;

            /** FieldOptions deprecated. */
            public deprecated: boolean;

            /** FieldOptions weak. */
            public weak: boolean;

            /** FieldOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new FieldOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FieldOptions instance
             */
            public static create(properties?: google.protobuf.IFieldOptions): google.protobuf.FieldOptions;

            /**
             * Encodes the specified FieldOptions message. Does not implicitly {@link google.protobuf.FieldOptions.verify|verify} messages.
             * @param message FieldOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FieldOptions message, length delimited. Does not implicitly {@link google.protobuf.FieldOptions.verify|verify} messages.
             * @param message FieldOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FieldOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FieldOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FieldOptions;

            /**
             * Decodes a FieldOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FieldOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FieldOptions;

            /**
             * Verifies a FieldOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FieldOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FieldOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.FieldOptions;

            /**
             * Creates a plain object from a FieldOptions message. Also converts values to other types if specified.
             * @param message FieldOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.FieldOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FieldOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace FieldOptions {

            /** CType enum. */
            enum CType {
                STRING = 0,
                CORD = 1,
                STRING_PIECE = 2
            }

            /** JSType enum. */
            enum JSType {
                JS_NORMAL = 0,
                JS_STRING = 1,
                JS_NUMBER = 2
            }
        }

        /** Properties of an OneofOptions. */
        interface IOneofOptions {

            /** OneofOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        /** Represents an OneofOptions. */
        class OneofOptions implements IOneofOptions {

            /**
             * Constructs a new OneofOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IOneofOptions);

            /** OneofOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new OneofOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns OneofOptions instance
             */
            public static create(properties?: google.protobuf.IOneofOptions): google.protobuf.OneofOptions;

            /**
             * Encodes the specified OneofOptions message. Does not implicitly {@link google.protobuf.OneofOptions.verify|verify} messages.
             * @param message OneofOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified OneofOptions message, length delimited. Does not implicitly {@link google.protobuf.OneofOptions.verify|verify} messages.
             * @param message OneofOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an OneofOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns OneofOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.OneofOptions;

            /**
             * Decodes an OneofOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns OneofOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.OneofOptions;

            /**
             * Verifies an OneofOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an OneofOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns OneofOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.OneofOptions;

            /**
             * Creates a plain object from an OneofOptions message. Also converts values to other types if specified.
             * @param message OneofOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.OneofOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this OneofOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an EnumOptions. */
        interface IEnumOptions {

            /** EnumOptions allowAlias */
            allowAlias?: (boolean|null);

            /** EnumOptions deprecated */
            deprecated?: (boolean|null);

            /** EnumOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);

            /** EnumOptions .gogoproto.goprotoEnumPrefix */
            ".gogoproto.goprotoEnumPrefix"?: (boolean|null);

            /** EnumOptions .gogoproto.goprotoEnumStringer */
            ".gogoproto.goprotoEnumStringer"?: (boolean|null);

            /** EnumOptions .gogoproto.enumStringer */
            ".gogoproto.enumStringer"?: (boolean|null);

            /** EnumOptions .gogoproto.enumCustomname */
            ".gogoproto.enumCustomname"?: (string|null);

            /** EnumOptions .gogoproto.enumdecl */
            ".gogoproto.enumdecl"?: (boolean|null);
        }

        /** Represents an EnumOptions. */
        class EnumOptions implements IEnumOptions {

            /**
             * Constructs a new EnumOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEnumOptions);

            /** EnumOptions allowAlias. */
            public allowAlias: boolean;

            /** EnumOptions deprecated. */
            public deprecated: boolean;

            /** EnumOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new EnumOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EnumOptions instance
             */
            public static create(properties?: google.protobuf.IEnumOptions): google.protobuf.EnumOptions;

            /**
             * Encodes the specified EnumOptions message. Does not implicitly {@link google.protobuf.EnumOptions.verify|verify} messages.
             * @param message EnumOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnumOptions message, length delimited. Does not implicitly {@link google.protobuf.EnumOptions.verify|verify} messages.
             * @param message EnumOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnumOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnumOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumOptions;

            /**
             * Decodes an EnumOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnumOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumOptions;

            /**
             * Verifies an EnumOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnumOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnumOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumOptions;

            /**
             * Creates a plain object from an EnumOptions message. Also converts values to other types if specified.
             * @param message EnumOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.EnumOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnumOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of an EnumValueOptions. */
        interface IEnumValueOptions {

            /** EnumValueOptions deprecated */
            deprecated?: (boolean|null);

            /** EnumValueOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);

            /** EnumValueOptions .gogoproto.enumvalueCustomname */
            ".gogoproto.enumvalueCustomname"?: (string|null);
        }

        /** Represents an EnumValueOptions. */
        class EnumValueOptions implements IEnumValueOptions {

            /**
             * Constructs a new EnumValueOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IEnumValueOptions);

            /** EnumValueOptions deprecated. */
            public deprecated: boolean;

            /** EnumValueOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new EnumValueOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EnumValueOptions instance
             */
            public static create(properties?: google.protobuf.IEnumValueOptions): google.protobuf.EnumValueOptions;

            /**
             * Encodes the specified EnumValueOptions message. Does not implicitly {@link google.protobuf.EnumValueOptions.verify|verify} messages.
             * @param message EnumValueOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IEnumValueOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnumValueOptions message, length delimited. Does not implicitly {@link google.protobuf.EnumValueOptions.verify|verify} messages.
             * @param message EnumValueOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IEnumValueOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnumValueOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnumValueOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumValueOptions;

            /**
             * Decodes an EnumValueOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnumValueOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumValueOptions;

            /**
             * Verifies an EnumValueOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an EnumValueOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns EnumValueOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueOptions;

            /**
             * Creates a plain object from an EnumValueOptions message. Also converts values to other types if specified.
             * @param message EnumValueOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.EnumValueOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this EnumValueOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ServiceOptions. */
        interface IServiceOptions {

            /** ServiceOptions deprecated */
            deprecated?: (boolean|null);

            /** ServiceOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        /** Represents a ServiceOptions. */
        class ServiceOptions implements IServiceOptions {

            /**
             * Constructs a new ServiceOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IServiceOptions);

            /** ServiceOptions deprecated. */
            public deprecated: boolean;

            /** ServiceOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new ServiceOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ServiceOptions instance
             */
            public static create(properties?: google.protobuf.IServiceOptions): google.protobuf.ServiceOptions;

            /**
             * Encodes the specified ServiceOptions message. Does not implicitly {@link google.protobuf.ServiceOptions.verify|verify} messages.
             * @param message ServiceOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ServiceOptions message, length delimited. Does not implicitly {@link google.protobuf.ServiceOptions.verify|verify} messages.
             * @param message ServiceOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ServiceOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ServiceOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ServiceOptions;

            /**
             * Decodes a ServiceOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ServiceOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ServiceOptions;

            /**
             * Verifies a ServiceOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ServiceOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ServiceOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceOptions;

            /**
             * Creates a plain object from a ServiceOptions message. Also converts values to other types if specified.
             * @param message ServiceOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.ServiceOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ServiceOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a MethodOptions. */
        interface IMethodOptions {

            /** MethodOptions deprecated */
            deprecated?: (boolean|null);

            /** MethodOptions idempotencyLevel */
            idempotencyLevel?: (google.protobuf.MethodOptions.IdempotencyLevel|null);

            /** MethodOptions uninterpretedOption */
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);

            /** MethodOptions .google.api.http */
            ".google.api.http"?: (google.api.IHttpRule|null);
        }

        /** Represents a MethodOptions. */
        class MethodOptions implements IMethodOptions {

            /**
             * Constructs a new MethodOptions.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IMethodOptions);

            /** MethodOptions deprecated. */
            public deprecated: boolean;

            /** MethodOptions idempotencyLevel. */
            public idempotencyLevel: google.protobuf.MethodOptions.IdempotencyLevel;

            /** MethodOptions uninterpretedOption. */
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];

            /**
             * Creates a new MethodOptions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns MethodOptions instance
             */
            public static create(properties?: google.protobuf.IMethodOptions): google.protobuf.MethodOptions;

            /**
             * Encodes the specified MethodOptions message. Does not implicitly {@link google.protobuf.MethodOptions.verify|verify} messages.
             * @param message MethodOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified MethodOptions message, length delimited. Does not implicitly {@link google.protobuf.MethodOptions.verify|verify} messages.
             * @param message MethodOptions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a MethodOptions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns MethodOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MethodOptions;

            /**
             * Decodes a MethodOptions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns MethodOptions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MethodOptions;

            /**
             * Verifies a MethodOptions message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a MethodOptions message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns MethodOptions
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.MethodOptions;

            /**
             * Creates a plain object from a MethodOptions message. Also converts values to other types if specified.
             * @param message MethodOptions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.MethodOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this MethodOptions to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace MethodOptions {

            /** IdempotencyLevel enum. */
            enum IdempotencyLevel {
                IDEMPOTENCY_UNKNOWN = 0,
                NO_SIDE_EFFECTS = 1,
                IDEMPOTENT = 2
            }
        }

        /** Properties of an UninterpretedOption. */
        interface IUninterpretedOption {

            /** UninterpretedOption name */
            name?: (google.protobuf.UninterpretedOption.INamePart[]|null);

            /** UninterpretedOption identifierValue */
            identifierValue?: (string|null);

            /** UninterpretedOption positiveIntValue */
            positiveIntValue?: (number|Long|null);

            /** UninterpretedOption negativeIntValue */
            negativeIntValue?: (number|Long|null);

            /** UninterpretedOption doubleValue */
            doubleValue?: (number|null);

            /** UninterpretedOption stringValue */
            stringValue?: (Uint8Array|null);

            /** UninterpretedOption aggregateValue */
            aggregateValue?: (string|null);
        }

        /** Represents an UninterpretedOption. */
        class UninterpretedOption implements IUninterpretedOption {

            /**
             * Constructs a new UninterpretedOption.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IUninterpretedOption);

            /** UninterpretedOption name. */
            public name: google.protobuf.UninterpretedOption.INamePart[];

            /** UninterpretedOption identifierValue. */
            public identifierValue: string;

            /** UninterpretedOption positiveIntValue. */
            public positiveIntValue: (number|Long);

            /** UninterpretedOption negativeIntValue. */
            public negativeIntValue: (number|Long);

            /** UninterpretedOption doubleValue. */
            public doubleValue: number;

            /** UninterpretedOption stringValue. */
            public stringValue: Uint8Array;

            /** UninterpretedOption aggregateValue. */
            public aggregateValue: string;

            /**
             * Creates a new UninterpretedOption instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UninterpretedOption instance
             */
            public static create(properties?: google.protobuf.IUninterpretedOption): google.protobuf.UninterpretedOption;

            /**
             * Encodes the specified UninterpretedOption message. Does not implicitly {@link google.protobuf.UninterpretedOption.verify|verify} messages.
             * @param message UninterpretedOption message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IUninterpretedOption, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UninterpretedOption message, length delimited. Does not implicitly {@link google.protobuf.UninterpretedOption.verify|verify} messages.
             * @param message UninterpretedOption message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IUninterpretedOption, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UninterpretedOption message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UninterpretedOption
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UninterpretedOption;

            /**
             * Decodes an UninterpretedOption message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UninterpretedOption
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UninterpretedOption;

            /**
             * Verifies an UninterpretedOption message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates an UninterpretedOption message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UninterpretedOption
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption;

            /**
             * Creates a plain object from an UninterpretedOption message. Also converts values to other types if specified.
             * @param message UninterpretedOption
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.UninterpretedOption, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UninterpretedOption to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace UninterpretedOption {

            /** Properties of a NamePart. */
            interface INamePart {

                /** NamePart namePart */
                namePart: string;

                /** NamePart isExtension */
                isExtension: boolean;
            }

            /** Represents a NamePart. */
            class NamePart implements INamePart {

                /**
                 * Constructs a new NamePart.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.UninterpretedOption.INamePart);

                /** NamePart namePart. */
                public namePart: string;

                /** NamePart isExtension. */
                public isExtension: boolean;

                /**
                 * Creates a new NamePart instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns NamePart instance
                 */
                public static create(properties?: google.protobuf.UninterpretedOption.INamePart): google.protobuf.UninterpretedOption.NamePart;

                /**
                 * Encodes the specified NamePart message. Does not implicitly {@link google.protobuf.UninterpretedOption.NamePart.verify|verify} messages.
                 * @param message NamePart message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.UninterpretedOption.INamePart, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified NamePart message, length delimited. Does not implicitly {@link google.protobuf.UninterpretedOption.NamePart.verify|verify} messages.
                 * @param message NamePart message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.UninterpretedOption.INamePart, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a NamePart message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns NamePart
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UninterpretedOption.NamePart;

                /**
                 * Decodes a NamePart message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns NamePart
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UninterpretedOption.NamePart;

                /**
                 * Verifies a NamePart message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a NamePart message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns NamePart
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption.NamePart;

                /**
                 * Creates a plain object from a NamePart message. Also converts values to other types if specified.
                 * @param message NamePart
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.UninterpretedOption.NamePart, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this NamePart to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of a SourceCodeInfo. */
        interface ISourceCodeInfo {

            /** SourceCodeInfo location */
            location?: (google.protobuf.SourceCodeInfo.ILocation[]|null);
        }

        /** Represents a SourceCodeInfo. */
        class SourceCodeInfo implements ISourceCodeInfo {

            /**
             * Constructs a new SourceCodeInfo.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.ISourceCodeInfo);

            /** SourceCodeInfo location. */
            public location: google.protobuf.SourceCodeInfo.ILocation[];

            /**
             * Creates a new SourceCodeInfo instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SourceCodeInfo instance
             */
            public static create(properties?: google.protobuf.ISourceCodeInfo): google.protobuf.SourceCodeInfo;

            /**
             * Encodes the specified SourceCodeInfo message. Does not implicitly {@link google.protobuf.SourceCodeInfo.verify|verify} messages.
             * @param message SourceCodeInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.ISourceCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SourceCodeInfo message, length delimited. Does not implicitly {@link google.protobuf.SourceCodeInfo.verify|verify} messages.
             * @param message SourceCodeInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.ISourceCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SourceCodeInfo message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SourceCodeInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.SourceCodeInfo;

            /**
             * Decodes a SourceCodeInfo message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SourceCodeInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.SourceCodeInfo;

            /**
             * Verifies a SourceCodeInfo message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SourceCodeInfo message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SourceCodeInfo
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo;

            /**
             * Creates a plain object from a SourceCodeInfo message. Also converts values to other types if specified.
             * @param message SourceCodeInfo
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.SourceCodeInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SourceCodeInfo to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace SourceCodeInfo {

            /** Properties of a Location. */
            interface ILocation {

                /** Location path */
                path?: (number[]|null);

                /** Location span */
                span?: (number[]|null);

                /** Location leadingComments */
                leadingComments?: (string|null);

                /** Location trailingComments */
                trailingComments?: (string|null);

                /** Location leadingDetachedComments */
                leadingDetachedComments?: (string[]|null);
            }

            /** Represents a Location. */
            class Location implements ILocation {

                /**
                 * Constructs a new Location.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.SourceCodeInfo.ILocation);

                /** Location path. */
                public path: number[];

                /** Location span. */
                public span: number[];

                /** Location leadingComments. */
                public leadingComments: string;

                /** Location trailingComments. */
                public trailingComments: string;

                /** Location leadingDetachedComments. */
                public leadingDetachedComments: string[];

                /**
                 * Creates a new Location instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Location instance
                 */
                public static create(properties?: google.protobuf.SourceCodeInfo.ILocation): google.protobuf.SourceCodeInfo.Location;

                /**
                 * Encodes the specified Location message. Does not implicitly {@link google.protobuf.SourceCodeInfo.Location.verify|verify} messages.
                 * @param message Location message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.SourceCodeInfo.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Location message, length delimited. Does not implicitly {@link google.protobuf.SourceCodeInfo.Location.verify|verify} messages.
                 * @param message Location message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.SourceCodeInfo.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Location message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Location
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.SourceCodeInfo.Location;

                /**
                 * Decodes a Location message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Location
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.SourceCodeInfo.Location;

                /**
                 * Verifies a Location message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Location message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Location
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo.Location;

                /**
                 * Creates a plain object from a Location message. Also converts values to other types if specified.
                 * @param message Location
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.SourceCodeInfo.Location, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Location to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of a GeneratedCodeInfo. */
        interface IGeneratedCodeInfo {

            /** GeneratedCodeInfo annotation */
            annotation?: (google.protobuf.GeneratedCodeInfo.IAnnotation[]|null);
        }

        /** Represents a GeneratedCodeInfo. */
        class GeneratedCodeInfo implements IGeneratedCodeInfo {

            /**
             * Constructs a new GeneratedCodeInfo.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IGeneratedCodeInfo);

            /** GeneratedCodeInfo annotation. */
            public annotation: google.protobuf.GeneratedCodeInfo.IAnnotation[];

            /**
             * Creates a new GeneratedCodeInfo instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GeneratedCodeInfo instance
             */
            public static create(properties?: google.protobuf.IGeneratedCodeInfo): google.protobuf.GeneratedCodeInfo;

            /**
             * Encodes the specified GeneratedCodeInfo message. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.verify|verify} messages.
             * @param message GeneratedCodeInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IGeneratedCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GeneratedCodeInfo message, length delimited. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.verify|verify} messages.
             * @param message GeneratedCodeInfo message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IGeneratedCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GeneratedCodeInfo message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GeneratedCodeInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.GeneratedCodeInfo;

            /**
             * Decodes a GeneratedCodeInfo message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GeneratedCodeInfo
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.GeneratedCodeInfo;

            /**
             * Verifies a GeneratedCodeInfo message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GeneratedCodeInfo message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GeneratedCodeInfo
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo;

            /**
             * Creates a plain object from a GeneratedCodeInfo message. Also converts values to other types if specified.
             * @param message GeneratedCodeInfo
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.GeneratedCodeInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GeneratedCodeInfo to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace GeneratedCodeInfo {

            /** Properties of an Annotation. */
            interface IAnnotation {

                /** Annotation path */
                path?: (number[]|null);

                /** Annotation sourceFile */
                sourceFile?: (string|null);

                /** Annotation begin */
                begin?: (number|null);

                /** Annotation end */
                end?: (number|null);
            }

            /** Represents an Annotation. */
            class Annotation implements IAnnotation {

                /**
                 * Constructs a new Annotation.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: google.protobuf.GeneratedCodeInfo.IAnnotation);

                /** Annotation path. */
                public path: number[];

                /** Annotation sourceFile. */
                public sourceFile: string;

                /** Annotation begin. */
                public begin: number;

                /** Annotation end. */
                public end: number;

                /**
                 * Creates a new Annotation instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Annotation instance
                 */
                public static create(properties?: google.protobuf.GeneratedCodeInfo.IAnnotation): google.protobuf.GeneratedCodeInfo.Annotation;

                /**
                 * Encodes the specified Annotation message. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.Annotation.verify|verify} messages.
                 * @param message Annotation message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: google.protobuf.GeneratedCodeInfo.IAnnotation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Annotation message, length delimited. Does not implicitly {@link google.protobuf.GeneratedCodeInfo.Annotation.verify|verify} messages.
                 * @param message Annotation message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: google.protobuf.GeneratedCodeInfo.IAnnotation, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an Annotation message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Annotation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.GeneratedCodeInfo.Annotation;

                /**
                 * Decodes an Annotation message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Annotation
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.GeneratedCodeInfo.Annotation;

                /**
                 * Verifies an Annotation message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates an Annotation message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Annotation
                 */
                public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo.Annotation;

                /**
                 * Creates a plain object from an Annotation message. Also converts values to other types if specified.
                 * @param message Annotation
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: google.protobuf.GeneratedCodeInfo.Annotation, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Annotation to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of a Timestamp. */
        interface ITimestamp {

            /** Timestamp seconds */
            seconds?: (number|Long|null);

            /** Timestamp nanos */
            nanos?: (number|null);
        }

        /** Represents a Timestamp. */
        class Timestamp implements ITimestamp {

            /**
             * Constructs a new Timestamp.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.ITimestamp);

            /** Timestamp seconds. */
            public seconds: (number|Long);

            /** Timestamp nanos. */
            public nanos: number;

            /**
             * Creates a new Timestamp instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Timestamp instance
             */
            public static create(properties?: google.protobuf.ITimestamp): google.protobuf.Timestamp;

            /**
             * Encodes the specified Timestamp message. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Timestamp message, length delimited. Does not implicitly {@link google.protobuf.Timestamp.verify|verify} messages.
             * @param message Timestamp message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Timestamp message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Timestamp;

            /**
             * Decodes a Timestamp message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Timestamp
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Timestamp;

            /**
             * Verifies a Timestamp message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Timestamp message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Timestamp
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Timestamp;

            /**
             * Creates a plain object from a Timestamp message. Also converts values to other types if specified.
             * @param message Timestamp
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Timestamp to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
