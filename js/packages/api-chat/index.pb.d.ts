import * as $protobuf from 'protobufjs'
export namespace berty {

    namespace chat {

        class Account extends $protobuf.rpc.Service {
            constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);
            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): Account;
            public eventSubscribe(request: berty.chat.IEventSubscribeRequest, callback: berty.chat.Account.EventSubscribeCallback): void;
            public eventSubscribe(request: berty.chat.IEventSubscribeRequest): Promise<berty.chat.EventSubscribeReply>;
            public conversationList(request: berty.chat.IConversationListRequest, callback: berty.chat.Account.ConversationListCallback): void;
            public conversationList(request: berty.chat.IConversationListRequest): Promise<berty.chat.ConversationListReply>;
            public conversationGet(request: berty.chat.IConversationGetRequest, callback: berty.chat.Account.ConversationGetCallback): void;
            public conversationGet(request: berty.chat.IConversationGetRequest): Promise<berty.chat.ConversationGetReply>;
            public conversationCreate(request: berty.chat.IConversationCreateRequest, callback: berty.chat.Account.ConversationCreateCallback): void;
            public conversationCreate(request: berty.chat.IConversationCreateRequest): Promise<berty.chat.ConversationCreateReply>;
            public conversationLeave(request: berty.chat.IConversationLeaveRequest, callback: berty.chat.Account.ConversationLeaveCallback): void;
            public conversationLeave(request: berty.chat.IConversationLeaveRequest): Promise<berty.chat.ConversationLeaveReply>;
            public conversationErase(request: berty.chat.IConversationEraseRequest, callback: berty.chat.Account.ConversationEraseCallback): void;
            public conversationErase(request: berty.chat.IConversationEraseRequest): Promise<berty.chat.ConversationEraseReply>;
            public conversationSetSeenPosition(request: berty.chat.IConversationSetSeenPositionRequest, callback: berty.chat.Account.ConversationSetSeenPositionCallback): void;
            public conversationSetSeenPosition(request: berty.chat.IConversationSetSeenPositionRequest): Promise<berty.chat.ConversationSetSeenPositionReply>;
            public conversationMessageList(request: berty.chat.IConversationMessageListRequest, callback: berty.chat.Account.ConversationMessageListCallback): void;
            public conversationMessageList(request: berty.chat.IConversationMessageListRequest): Promise<berty.chat.ConversationMessageListReply>;
            public conversationMessageSend(request: berty.chat.IConversationMessageSendRequest, callback: berty.chat.Account.ConversationMessageSendCallback): void;
            public conversationMessageSend(request: berty.chat.IConversationMessageSendRequest): Promise<berty.chat.ConversationMessageSendReply>;
            public conversationMessageEdit(request: berty.chat.IConversationMessageEditRequest, callback: berty.chat.Account.ConversationMessageEditCallback): void;
            public conversationMessageEdit(request: berty.chat.IConversationMessageEditRequest): Promise<berty.chat.ConversationMessageEditReply>;
            public conversationMessageHide(request: berty.chat.IConversationMessageHideRequest, callback: berty.chat.Account.ConversationMessageHideCallback): void;
            public conversationMessageHide(request: berty.chat.IConversationMessageHideRequest): Promise<berty.chat.ConversationMessageHideReply>;
            public conversationUpdateSettings(request: berty.chat.IConversationUpdateSettingsRequest, callback: berty.chat.Account.ConversationUpdateSettingsCallback): void;
            public conversationUpdateSettings(request: berty.chat.IConversationUpdateSettingsRequest): Promise<berty.chat.ConversationUpdateSettingsReply>;
            public conversationInvitationAccept(request: berty.chat.IConversationInvitationAcceptRequest, callback: berty.chat.Account.ConversationInvitationAcceptCallback): void;
            public conversationInvitationAccept(request: berty.chat.IConversationInvitationAcceptRequest): Promise<berty.chat.ConversationInvitationAcceptReply>;
            public conversationInvitationCreate(request: berty.chat.IConversationInvitationCreateRequest, callback: berty.chat.Account.ConversationInvitationCreateCallback): void;
            public conversationInvitationCreate(request: berty.chat.IConversationInvitationCreateRequest): Promise<berty.chat.ConversationInvitationCreateReply>;
            public conversationInvitationDiscard(request: berty.chat.IConversationInvitationDiscardRequest, callback: berty.chat.Account.ConversationInvitationDiscardCallback): void;
            public conversationInvitationDiscard(request: berty.chat.IConversationInvitationDiscardRequest): Promise<berty.chat.ConversationInvitationDiscardReply>;
            public contactList(request: berty.chat.IContactListRequest, callback: berty.chat.Account.ContactListCallback): void;
            public contactList(request: berty.chat.IContactListRequest): Promise<berty.chat.ContactListReply>;
            public contactGet(request: berty.chat.IContactGetRequest, callback: berty.chat.Account.ContactGetCallback): void;
            public contactGet(request: berty.chat.IContactGetRequest): Promise<berty.chat.ContactGetReply>;
            public contactUpdate(request: berty.chat.IContactUpdateRequest, callback: berty.chat.Account.ContactUpdateCallback): void;
            public contactUpdate(request: berty.chat.IContactUpdateRequest): Promise<berty.chat.ContactUpdateReply>;
            public contactRemove(request: berty.chat.IContactRemoveRequest, callback: berty.chat.Account.ContactRemoveCallback): void;
            public contactRemove(request: berty.chat.IContactRemoveRequest): Promise<berty.chat.ContactRemoveReply>;
            public contactRequestCreate(request: berty.chat.IContactRequestCreateRequest, callback: berty.chat.Account.ContactRequestCreateCallback): void;
            public contactRequestCreate(request: berty.chat.IContactRequestCreateRequest): Promise<berty.chat.ContactRequestCreateReply>;
            public contactRequestAccept(request: berty.chat.IContactRequestAcceptRequest, callback: berty.chat.Account.ContactRequestAcceptCallback): void;
            public contactRequestAccept(request: berty.chat.IContactRequestAcceptRequest): Promise<berty.chat.ContactRequestAcceptReply>;
            public contactRequestDiscard(request: berty.chat.IContactRequestDiscardRequest, callback: berty.chat.Account.ContactRequestDiscardCallback): void;
            public contactRequestDiscard(request: berty.chat.IContactRequestDiscardRequest): Promise<berty.chat.ContactRequestDiscardReply>;
            public search(request: berty.chat.ISearchRequest, callback: berty.chat.Account.SearchCallback): void;
            public search(request: berty.chat.ISearchRequest): Promise<berty.chat.SearchReply>;
            public accountSettingsGet(request: berty.chat.IAccountSettingsGetRequest, callback: berty.chat.Account.AccountSettingsGetCallback): void;
            public accountSettingsGet(request: berty.chat.IAccountSettingsGetRequest): Promise<berty.chat.AccountSettingsGetReply>;
            public accountSettingsUpdate(request: berty.chat.IAccountSettingsUpdateRequest, callback: berty.chat.Account.AccountSettingsUpdateCallback): void;
            public accountSettingsUpdate(request: berty.chat.IAccountSettingsUpdateRequest): Promise<berty.chat.AccountSettingsUpdateReply>;
            public accountPairingInvitationCreate(request: berty.chat.IAccountPairingInvitationCreateRequest, callback: berty.chat.Account.AccountPairingInvitationCreateCallback): void;
            public accountPairingInvitationCreate(request: berty.chat.IAccountPairingInvitationCreateRequest): Promise<berty.chat.AccountPairingInvitationCreateReply>;
            public accountRenewIncomingContactRequestLink(request: berty.chat.IAccountRenewIncomingContactRequestLinkRequest, callback: berty.chat.Account.AccountRenewIncomingContactRequestLinkCallback): void;
            public accountRenewIncomingContactRequestLink(request: berty.chat.IAccountRenewIncomingContactRequestLinkRequest): Promise<berty.chat.AccountRenewIncomingContactRequestLinkReply>;
            public devEventSubscribe(request: berty.chat.IDevEventSubscribeRequest, callback: berty.chat.Account.DevEventSubscribeCallback): void;
            public devEventSubscribe(request: berty.chat.IDevEventSubscribeRequest): Promise<berty.chat.DevEventSubscribeReply>;
        }

        namespace Account {

            type EventSubscribeCallback = (error: (Error|null), response?: berty.chat.EventSubscribeReply) => void;

            type ConversationListCallback = (error: (Error|null), response?: berty.chat.ConversationListReply) => void;

            type ConversationGetCallback = (error: (Error|null), response?: berty.chat.ConversationGetReply) => void;

            type ConversationCreateCallback = (error: (Error|null), response?: berty.chat.ConversationCreateReply) => void;

            type ConversationLeaveCallback = (error: (Error|null), response?: berty.chat.ConversationLeaveReply) => void;

            type ConversationEraseCallback = (error: (Error|null), response?: berty.chat.ConversationEraseReply) => void;

            type ConversationSetSeenPositionCallback = (error: (Error|null), response?: berty.chat.ConversationSetSeenPositionReply) => void;

            type ConversationMessageListCallback = (error: (Error|null), response?: berty.chat.ConversationMessageListReply) => void;

            type ConversationMessageSendCallback = (error: (Error|null), response?: berty.chat.ConversationMessageSendReply) => void;

            type ConversationMessageEditCallback = (error: (Error|null), response?: berty.chat.ConversationMessageEditReply) => void;

            type ConversationMessageHideCallback = (error: (Error|null), response?: berty.chat.ConversationMessageHideReply) => void;

            type ConversationUpdateSettingsCallback = (error: (Error|null), response?: berty.chat.ConversationUpdateSettingsReply) => void;

            type ConversationInvitationAcceptCallback = (error: (Error|null), response?: berty.chat.ConversationInvitationAcceptReply) => void;

            type ConversationInvitationCreateCallback = (error: (Error|null), response?: berty.chat.ConversationInvitationCreateReply) => void;

            type ConversationInvitationDiscardCallback = (error: (Error|null), response?: berty.chat.ConversationInvitationDiscardReply) => void;

            type ContactListCallback = (error: (Error|null), response?: berty.chat.ContactListReply) => void;

            type ContactGetCallback = (error: (Error|null), response?: berty.chat.ContactGetReply) => void;

            type ContactUpdateCallback = (error: (Error|null), response?: berty.chat.ContactUpdateReply) => void;

            type ContactRemoveCallback = (error: (Error|null), response?: berty.chat.ContactRemoveReply) => void;

            type ContactRequestCreateCallback = (error: (Error|null), response?: berty.chat.ContactRequestCreateReply) => void;

            type ContactRequestAcceptCallback = (error: (Error|null), response?: berty.chat.ContactRequestAcceptReply) => void;

            type ContactRequestDiscardCallback = (error: (Error|null), response?: berty.chat.ContactRequestDiscardReply) => void;

            type SearchCallback = (error: (Error|null), response?: berty.chat.SearchReply) => void;

            type AccountSettingsGetCallback = (error: (Error|null), response?: berty.chat.AccountSettingsGetReply) => void;

            type AccountSettingsUpdateCallback = (error: (Error|null), response?: berty.chat.AccountSettingsUpdateReply) => void;

            type AccountPairingInvitationCreateCallback = (error: (Error|null), response?: berty.chat.AccountPairingInvitationCreateReply) => void;

            type AccountRenewIncomingContactRequestLinkCallback = (error: (Error|null), response?: berty.chat.AccountRenewIncomingContactRequestLinkReply) => void;

            type DevEventSubscribeCallback = (error: (Error|null), response?: berty.chat.DevEventSubscribeReply) => void;
        }

        interface IEventSubscribeRequest {
        }

        class EventSubscribeRequest implements IEventSubscribeRequest {
            constructor(properties?: berty.chat.IEventSubscribeRequest);
            public static create(properties?: berty.chat.IEventSubscribeRequest): berty.chat.EventSubscribeRequest;
            public static encode(message: berty.chat.IEventSubscribeRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IEventSubscribeRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.EventSubscribeRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.EventSubscribeRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.EventSubscribeRequest;
            public static toObject(message: berty.chat.EventSubscribeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IEventSubscribeReply {
        }

        class EventSubscribeReply implements IEventSubscribeReply {
            constructor(properties?: berty.chat.IEventSubscribeReply);
            public static create(properties?: berty.chat.IEventSubscribeReply): berty.chat.EventSubscribeReply;
            public static encode(message: berty.chat.IEventSubscribeReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IEventSubscribeReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.EventSubscribeReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.EventSubscribeReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.EventSubscribeReply;
            public static toObject(message: berty.chat.EventSubscribeReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationListRequest {
        }

        class ConversationListRequest implements IConversationListRequest {
            constructor(properties?: berty.chat.IConversationListRequest);
            public static create(properties?: berty.chat.IConversationListRequest): berty.chat.ConversationListRequest;
            public static encode(message: berty.chat.IConversationListRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationListRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationListRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationListRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationListRequest;
            public static toObject(message: berty.chat.ConversationListRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationListReply {
            conversation?: (berty.chatmodel.IConversation|null);
        }

        class ConversationListReply implements IConversationListReply {
            constructor(properties?: berty.chat.IConversationListReply);
            public conversation?: (berty.chatmodel.IConversation|null);
            public static create(properties?: berty.chat.IConversationListReply): berty.chat.ConversationListReply;
            public static encode(message: berty.chat.IConversationListReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationListReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationListReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationListReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationListReply;
            public static toObject(message: berty.chat.ConversationListReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationGetRequest {
            id?: (string|null);
        }

        class ConversationGetRequest implements IConversationGetRequest {
            constructor(properties?: berty.chat.IConversationGetRequest);
            public id: string;
            public static create(properties?: berty.chat.IConversationGetRequest): berty.chat.ConversationGetRequest;
            public static encode(message: berty.chat.IConversationGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationGetRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationGetRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationGetRequest;
            public static toObject(message: berty.chat.ConversationGetRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationGetReply {
            conversation?: (berty.chatmodel.IConversation|null);
        }

        class ConversationGetReply implements IConversationGetReply {
            constructor(properties?: berty.chat.IConversationGetReply);
            public conversation?: (berty.chatmodel.IConversation|null);
            public static create(properties?: berty.chat.IConversationGetReply): berty.chat.ConversationGetReply;
            public static encode(message: berty.chat.IConversationGetReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationGetReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationGetReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationGetReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationGetReply;
            public static toObject(message: berty.chat.ConversationGetReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationCreateRequest {
        }

        class ConversationCreateRequest implements IConversationCreateRequest {
            constructor(properties?: berty.chat.IConversationCreateRequest);
            public static create(properties?: berty.chat.IConversationCreateRequest): berty.chat.ConversationCreateRequest;
            public static encode(message: berty.chat.IConversationCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationCreateRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationCreateRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationCreateRequest;
            public static toObject(message: berty.chat.ConversationCreateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationCreateReply {
        }

        class ConversationCreateReply implements IConversationCreateReply {
            constructor(properties?: berty.chat.IConversationCreateReply);
            public static create(properties?: berty.chat.IConversationCreateReply): berty.chat.ConversationCreateReply;
            public static encode(message: berty.chat.IConversationCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationCreateReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationCreateReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationCreateReply;
            public static toObject(message: berty.chat.ConversationCreateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationLeaveRequest {
        }

        class ConversationLeaveRequest implements IConversationLeaveRequest {
            constructor(properties?: berty.chat.IConversationLeaveRequest);
            public static create(properties?: berty.chat.IConversationLeaveRequest): berty.chat.ConversationLeaveRequest;
            public static encode(message: berty.chat.IConversationLeaveRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationLeaveRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationLeaveRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationLeaveRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationLeaveRequest;
            public static toObject(message: berty.chat.ConversationLeaveRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationLeaveReply {
        }

        class ConversationLeaveReply implements IConversationLeaveReply {
            constructor(properties?: berty.chat.IConversationLeaveReply);
            public static create(properties?: berty.chat.IConversationLeaveReply): berty.chat.ConversationLeaveReply;
            public static encode(message: berty.chat.IConversationLeaveReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationLeaveReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationLeaveReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationLeaveReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationLeaveReply;
            public static toObject(message: berty.chat.ConversationLeaveReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationEraseRequest {
        }

        class ConversationEraseRequest implements IConversationEraseRequest {
            constructor(properties?: berty.chat.IConversationEraseRequest);
            public static create(properties?: berty.chat.IConversationEraseRequest): berty.chat.ConversationEraseRequest;
            public static encode(message: berty.chat.IConversationEraseRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationEraseRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationEraseRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationEraseRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationEraseRequest;
            public static toObject(message: berty.chat.ConversationEraseRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationEraseReply {
        }

        class ConversationEraseReply implements IConversationEraseReply {
            constructor(properties?: berty.chat.IConversationEraseReply);
            public static create(properties?: berty.chat.IConversationEraseReply): berty.chat.ConversationEraseReply;
            public static encode(message: berty.chat.IConversationEraseReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationEraseReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationEraseReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationEraseReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationEraseReply;
            public static toObject(message: berty.chat.ConversationEraseReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationSetSeenPositionRequest {
        }

        class ConversationSetSeenPositionRequest implements IConversationSetSeenPositionRequest {
            constructor(properties?: berty.chat.IConversationSetSeenPositionRequest);
            public static create(properties?: berty.chat.IConversationSetSeenPositionRequest): berty.chat.ConversationSetSeenPositionRequest;
            public static encode(message: berty.chat.IConversationSetSeenPositionRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationSetSeenPositionRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationSetSeenPositionRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationSetSeenPositionRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationSetSeenPositionRequest;
            public static toObject(message: berty.chat.ConversationSetSeenPositionRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationSetSeenPositionReply {
        }

        class ConversationSetSeenPositionReply implements IConversationSetSeenPositionReply {
            constructor(properties?: berty.chat.IConversationSetSeenPositionReply);
            public static create(properties?: berty.chat.IConversationSetSeenPositionReply): berty.chat.ConversationSetSeenPositionReply;
            public static encode(message: berty.chat.IConversationSetSeenPositionReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationSetSeenPositionReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationSetSeenPositionReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationSetSeenPositionReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationSetSeenPositionReply;
            public static toObject(message: berty.chat.ConversationSetSeenPositionReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationMessageListRequest {
        }

        class ConversationMessageListRequest implements IConversationMessageListRequest {
            constructor(properties?: berty.chat.IConversationMessageListRequest);
            public static create(properties?: berty.chat.IConversationMessageListRequest): berty.chat.ConversationMessageListRequest;
            public static encode(message: berty.chat.IConversationMessageListRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationMessageListRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageListRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageListRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageListRequest;
            public static toObject(message: berty.chat.ConversationMessageListRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationMessageListReply {
        }

        class ConversationMessageListReply implements IConversationMessageListReply {
            constructor(properties?: berty.chat.IConversationMessageListReply);
            public static create(properties?: berty.chat.IConversationMessageListReply): berty.chat.ConversationMessageListReply;
            public static encode(message: berty.chat.IConversationMessageListReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationMessageListReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageListReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageListReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageListReply;
            public static toObject(message: berty.chat.ConversationMessageListReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationMessageSendRequest {
        }

        class ConversationMessageSendRequest implements IConversationMessageSendRequest {
            constructor(properties?: berty.chat.IConversationMessageSendRequest);
            public static create(properties?: berty.chat.IConversationMessageSendRequest): berty.chat.ConversationMessageSendRequest;
            public static encode(message: berty.chat.IConversationMessageSendRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationMessageSendRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageSendRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageSendRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageSendRequest;
            public static toObject(message: berty.chat.ConversationMessageSendRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationMessageSendReply {
        }

        class ConversationMessageSendReply implements IConversationMessageSendReply {
            constructor(properties?: berty.chat.IConversationMessageSendReply);
            public static create(properties?: berty.chat.IConversationMessageSendReply): berty.chat.ConversationMessageSendReply;
            public static encode(message: berty.chat.IConversationMessageSendReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationMessageSendReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageSendReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageSendReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageSendReply;
            public static toObject(message: berty.chat.ConversationMessageSendReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationMessageEditRequest {
        }

        class ConversationMessageEditRequest implements IConversationMessageEditRequest {
            constructor(properties?: berty.chat.IConversationMessageEditRequest);
            public static create(properties?: berty.chat.IConversationMessageEditRequest): berty.chat.ConversationMessageEditRequest;
            public static encode(message: berty.chat.IConversationMessageEditRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationMessageEditRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageEditRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageEditRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageEditRequest;
            public static toObject(message: berty.chat.ConversationMessageEditRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationMessageEditReply {
        }

        class ConversationMessageEditReply implements IConversationMessageEditReply {
            constructor(properties?: berty.chat.IConversationMessageEditReply);
            public static create(properties?: berty.chat.IConversationMessageEditReply): berty.chat.ConversationMessageEditReply;
            public static encode(message: berty.chat.IConversationMessageEditReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationMessageEditReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageEditReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageEditReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageEditReply;
            public static toObject(message: berty.chat.ConversationMessageEditReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationMessageHideRequest {
        }

        class ConversationMessageHideRequest implements IConversationMessageHideRequest {
            constructor(properties?: berty.chat.IConversationMessageHideRequest);
            public static create(properties?: berty.chat.IConversationMessageHideRequest): berty.chat.ConversationMessageHideRequest;
            public static encode(message: berty.chat.IConversationMessageHideRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationMessageHideRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageHideRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageHideRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageHideRequest;
            public static toObject(message: berty.chat.ConversationMessageHideRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationMessageHideReply {
        }

        class ConversationMessageHideReply implements IConversationMessageHideReply {
            constructor(properties?: berty.chat.IConversationMessageHideReply);
            public static create(properties?: berty.chat.IConversationMessageHideReply): berty.chat.ConversationMessageHideReply;
            public static encode(message: berty.chat.IConversationMessageHideReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationMessageHideReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMessageHideReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMessageHideReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMessageHideReply;
            public static toObject(message: berty.chat.ConversationMessageHideReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationUpdateSettingsRequest {
        }

        class ConversationUpdateSettingsRequest implements IConversationUpdateSettingsRequest {
            constructor(properties?: berty.chat.IConversationUpdateSettingsRequest);
            public static create(properties?: berty.chat.IConversationUpdateSettingsRequest): berty.chat.ConversationUpdateSettingsRequest;
            public static encode(message: berty.chat.IConversationUpdateSettingsRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationUpdateSettingsRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationUpdateSettingsRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationUpdateSettingsRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationUpdateSettingsRequest;
            public static toObject(message: berty.chat.ConversationUpdateSettingsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationUpdateSettingsReply {
        }

        class ConversationUpdateSettingsReply implements IConversationUpdateSettingsReply {
            constructor(properties?: berty.chat.IConversationUpdateSettingsReply);
            public static create(properties?: berty.chat.IConversationUpdateSettingsReply): berty.chat.ConversationUpdateSettingsReply;
            public static encode(message: berty.chat.IConversationUpdateSettingsReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationUpdateSettingsReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationUpdateSettingsReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationUpdateSettingsReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationUpdateSettingsReply;
            public static toObject(message: berty.chat.ConversationUpdateSettingsReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationInvitationAcceptRequest {
        }

        class ConversationInvitationAcceptRequest implements IConversationInvitationAcceptRequest {
            constructor(properties?: berty.chat.IConversationInvitationAcceptRequest);
            public static create(properties?: berty.chat.IConversationInvitationAcceptRequest): berty.chat.ConversationInvitationAcceptRequest;
            public static encode(message: berty.chat.IConversationInvitationAcceptRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationInvitationAcceptRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationAcceptRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationAcceptRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationAcceptRequest;
            public static toObject(message: berty.chat.ConversationInvitationAcceptRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationInvitationAcceptReply {
        }

        class ConversationInvitationAcceptReply implements IConversationInvitationAcceptReply {
            constructor(properties?: berty.chat.IConversationInvitationAcceptReply);
            public static create(properties?: berty.chat.IConversationInvitationAcceptReply): berty.chat.ConversationInvitationAcceptReply;
            public static encode(message: berty.chat.IConversationInvitationAcceptReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationInvitationAcceptReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationAcceptReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationAcceptReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationAcceptReply;
            public static toObject(message: berty.chat.ConversationInvitationAcceptReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationInvitationCreateRequest {
        }

        class ConversationInvitationCreateRequest implements IConversationInvitationCreateRequest {
            constructor(properties?: berty.chat.IConversationInvitationCreateRequest);
            public static create(properties?: berty.chat.IConversationInvitationCreateRequest): berty.chat.ConversationInvitationCreateRequest;
            public static encode(message: berty.chat.IConversationInvitationCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationInvitationCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationCreateRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationCreateRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationCreateRequest;
            public static toObject(message: berty.chat.ConversationInvitationCreateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationInvitationCreateReply {
        }

        class ConversationInvitationCreateReply implements IConversationInvitationCreateReply {
            constructor(properties?: berty.chat.IConversationInvitationCreateReply);
            public static create(properties?: berty.chat.IConversationInvitationCreateReply): berty.chat.ConversationInvitationCreateReply;
            public static encode(message: berty.chat.IConversationInvitationCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationInvitationCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationCreateReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationCreateReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationCreateReply;
            public static toObject(message: berty.chat.ConversationInvitationCreateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationInvitationDiscardRequest {
        }

        class ConversationInvitationDiscardRequest implements IConversationInvitationDiscardRequest {
            constructor(properties?: berty.chat.IConversationInvitationDiscardRequest);
            public static create(properties?: berty.chat.IConversationInvitationDiscardRequest): berty.chat.ConversationInvitationDiscardRequest;
            public static encode(message: berty.chat.IConversationInvitationDiscardRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationInvitationDiscardRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationDiscardRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationDiscardRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationDiscardRequest;
            public static toObject(message: berty.chat.ConversationInvitationDiscardRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationInvitationDiscardReply {
        }

        class ConversationInvitationDiscardReply implements IConversationInvitationDiscardReply {
            constructor(properties?: berty.chat.IConversationInvitationDiscardReply);
            public static create(properties?: berty.chat.IConversationInvitationDiscardReply): berty.chat.ConversationInvitationDiscardReply;
            public static encode(message: berty.chat.IConversationInvitationDiscardReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationInvitationDiscardReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationDiscardReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationDiscardReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationDiscardReply;
            public static toObject(message: berty.chat.ConversationInvitationDiscardReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactListRequest {
        }

        class ContactListRequest implements IContactListRequest {
            constructor(properties?: berty.chat.IContactListRequest);
            public static create(properties?: berty.chat.IContactListRequest): berty.chat.ContactListRequest;
            public static encode(message: berty.chat.IContactListRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactListRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactListRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactListRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactListRequest;
            public static toObject(message: berty.chat.ContactListRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactListReply {
        }

        class ContactListReply implements IContactListReply {
            constructor(properties?: berty.chat.IContactListReply);
            public static create(properties?: berty.chat.IContactListReply): berty.chat.ContactListReply;
            public static encode(message: berty.chat.IContactListReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactListReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactListReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactListReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactListReply;
            public static toObject(message: berty.chat.ContactListReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactGetRequest {
        }

        class ContactGetRequest implements IContactGetRequest {
            constructor(properties?: berty.chat.IContactGetRequest);
            public static create(properties?: berty.chat.IContactGetRequest): berty.chat.ContactGetRequest;
            public static encode(message: berty.chat.IContactGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactGetRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactGetRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactGetRequest;
            public static toObject(message: berty.chat.ContactGetRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactGetReply {
        }

        class ContactGetReply implements IContactGetReply {
            constructor(properties?: berty.chat.IContactGetReply);
            public static create(properties?: berty.chat.IContactGetReply): berty.chat.ContactGetReply;
            public static encode(message: berty.chat.IContactGetReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactGetReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactGetReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactGetReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactGetReply;
            public static toObject(message: berty.chat.ContactGetReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactUpdateRequest {
        }

        class ContactUpdateRequest implements IContactUpdateRequest {
            constructor(properties?: berty.chat.IContactUpdateRequest);
            public static create(properties?: berty.chat.IContactUpdateRequest): berty.chat.ContactUpdateRequest;
            public static encode(message: berty.chat.IContactUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactUpdateRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactUpdateRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactUpdateRequest;
            public static toObject(message: berty.chat.ContactUpdateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactUpdateReply {
        }

        class ContactUpdateReply implements IContactUpdateReply {
            constructor(properties?: berty.chat.IContactUpdateReply);
            public static create(properties?: berty.chat.IContactUpdateReply): berty.chat.ContactUpdateReply;
            public static encode(message: berty.chat.IContactUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactUpdateReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactUpdateReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactUpdateReply;
            public static toObject(message: berty.chat.ContactUpdateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactRemoveRequest {
        }

        class ContactRemoveRequest implements IContactRemoveRequest {
            constructor(properties?: berty.chat.IContactRemoveRequest);
            public static create(properties?: berty.chat.IContactRemoveRequest): berty.chat.ContactRemoveRequest;
            public static encode(message: berty.chat.IContactRemoveRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRemoveRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRemoveRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRemoveRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRemoveRequest;
            public static toObject(message: berty.chat.ContactRemoveRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactRemoveReply {
        }

        class ContactRemoveReply implements IContactRemoveReply {
            constructor(properties?: berty.chat.IContactRemoveReply);
            public static create(properties?: berty.chat.IContactRemoveReply): berty.chat.ContactRemoveReply;
            public static encode(message: berty.chat.IContactRemoveReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRemoveReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRemoveReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRemoveReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRemoveReply;
            public static toObject(message: berty.chat.ContactRemoveReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactRequestCreateRequest {
        }

        class ContactRequestCreateRequest implements IContactRequestCreateRequest {
            constructor(properties?: berty.chat.IContactRequestCreateRequest);
            public static create(properties?: berty.chat.IContactRequestCreateRequest): berty.chat.ContactRequestCreateRequest;
            public static encode(message: berty.chat.IContactRequestCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRequestCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestCreateRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestCreateRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestCreateRequest;
            public static toObject(message: berty.chat.ContactRequestCreateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactRequestCreateReply {
        }

        class ContactRequestCreateReply implements IContactRequestCreateReply {
            constructor(properties?: berty.chat.IContactRequestCreateReply);
            public static create(properties?: berty.chat.IContactRequestCreateReply): berty.chat.ContactRequestCreateReply;
            public static encode(message: berty.chat.IContactRequestCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRequestCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestCreateReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestCreateReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestCreateReply;
            public static toObject(message: berty.chat.ContactRequestCreateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactRequestAcceptRequest {
        }

        class ContactRequestAcceptRequest implements IContactRequestAcceptRequest {
            constructor(properties?: berty.chat.IContactRequestAcceptRequest);
            public static create(properties?: berty.chat.IContactRequestAcceptRequest): berty.chat.ContactRequestAcceptRequest;
            public static encode(message: berty.chat.IContactRequestAcceptRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRequestAcceptRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestAcceptRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestAcceptRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestAcceptRequest;
            public static toObject(message: berty.chat.ContactRequestAcceptRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactRequestAcceptReply {
        }

        class ContactRequestAcceptReply implements IContactRequestAcceptReply {
            constructor(properties?: berty.chat.IContactRequestAcceptReply);
            public static create(properties?: berty.chat.IContactRequestAcceptReply): berty.chat.ContactRequestAcceptReply;
            public static encode(message: berty.chat.IContactRequestAcceptReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRequestAcceptReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestAcceptReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestAcceptReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestAcceptReply;
            public static toObject(message: berty.chat.ContactRequestAcceptReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactRequestDiscardRequest {
        }

        class ContactRequestDiscardRequest implements IContactRequestDiscardRequest {
            constructor(properties?: berty.chat.IContactRequestDiscardRequest);
            public static create(properties?: berty.chat.IContactRequestDiscardRequest): berty.chat.ContactRequestDiscardRequest;
            public static encode(message: berty.chat.IContactRequestDiscardRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRequestDiscardRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestDiscardRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestDiscardRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestDiscardRequest;
            public static toObject(message: berty.chat.ContactRequestDiscardRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactRequestDiscardReply {
        }

        class ContactRequestDiscardReply implements IContactRequestDiscardReply {
            constructor(properties?: berty.chat.IContactRequestDiscardReply);
            public static create(properties?: berty.chat.IContactRequestDiscardReply): berty.chat.ContactRequestDiscardReply;
            public static encode(message: berty.chat.IContactRequestDiscardReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRequestDiscardReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestDiscardReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestDiscardReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestDiscardReply;
            public static toObject(message: berty.chat.ContactRequestDiscardReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface ISearchRequest {
        }

        class SearchRequest implements ISearchRequest {
            constructor(properties?: berty.chat.ISearchRequest);
            public static create(properties?: berty.chat.ISearchRequest): berty.chat.SearchRequest;
            public static encode(message: berty.chat.ISearchRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.ISearchRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.SearchRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.SearchRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.SearchRequest;
            public static toObject(message: berty.chat.SearchRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface ISearchReply {
        }

        class SearchReply implements ISearchReply {
            constructor(properties?: berty.chat.ISearchReply);
            public static create(properties?: berty.chat.ISearchReply): berty.chat.SearchReply;
            public static encode(message: berty.chat.ISearchReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.ISearchReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.SearchReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.SearchReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.SearchReply;
            public static toObject(message: berty.chat.SearchReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountSettingsGetRequest {
        }

        class AccountSettingsGetRequest implements IAccountSettingsGetRequest {
            constructor(properties?: berty.chat.IAccountSettingsGetRequest);
            public static create(properties?: berty.chat.IAccountSettingsGetRequest): berty.chat.AccountSettingsGetRequest;
            public static encode(message: berty.chat.IAccountSettingsGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountSettingsGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountSettingsGetRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountSettingsGetRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountSettingsGetRequest;
            public static toObject(message: berty.chat.AccountSettingsGetRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountSettingsGetReply {
        }

        class AccountSettingsGetReply implements IAccountSettingsGetReply {
            constructor(properties?: berty.chat.IAccountSettingsGetReply);
            public static create(properties?: berty.chat.IAccountSettingsGetReply): berty.chat.AccountSettingsGetReply;
            public static encode(message: berty.chat.IAccountSettingsGetReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountSettingsGetReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountSettingsGetReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountSettingsGetReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountSettingsGetReply;
            public static toObject(message: berty.chat.AccountSettingsGetReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountSettingsUpdateRequest {
        }

        class AccountSettingsUpdateRequest implements IAccountSettingsUpdateRequest {
            constructor(properties?: berty.chat.IAccountSettingsUpdateRequest);
            public static create(properties?: berty.chat.IAccountSettingsUpdateRequest): berty.chat.AccountSettingsUpdateRequest;
            public static encode(message: berty.chat.IAccountSettingsUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountSettingsUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountSettingsUpdateRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountSettingsUpdateRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountSettingsUpdateRequest;
            public static toObject(message: berty.chat.AccountSettingsUpdateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountSettingsUpdateReply {
        }

        class AccountSettingsUpdateReply implements IAccountSettingsUpdateReply {
            constructor(properties?: berty.chat.IAccountSettingsUpdateReply);
            public static create(properties?: berty.chat.IAccountSettingsUpdateReply): berty.chat.AccountSettingsUpdateReply;
            public static encode(message: berty.chat.IAccountSettingsUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountSettingsUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountSettingsUpdateReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountSettingsUpdateReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountSettingsUpdateReply;
            public static toObject(message: berty.chat.AccountSettingsUpdateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountPairingInvitationCreateRequest {
        }

        class AccountPairingInvitationCreateRequest implements IAccountPairingInvitationCreateRequest {
            constructor(properties?: berty.chat.IAccountPairingInvitationCreateRequest);
            public static create(properties?: berty.chat.IAccountPairingInvitationCreateRequest): berty.chat.AccountPairingInvitationCreateRequest;
            public static encode(message: berty.chat.IAccountPairingInvitationCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountPairingInvitationCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountPairingInvitationCreateRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountPairingInvitationCreateRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountPairingInvitationCreateRequest;
            public static toObject(message: berty.chat.AccountPairingInvitationCreateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountPairingInvitationCreateReply {
        }

        class AccountPairingInvitationCreateReply implements IAccountPairingInvitationCreateReply {
            constructor(properties?: berty.chat.IAccountPairingInvitationCreateReply);
            public static create(properties?: berty.chat.IAccountPairingInvitationCreateReply): berty.chat.AccountPairingInvitationCreateReply;
            public static encode(message: berty.chat.IAccountPairingInvitationCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountPairingInvitationCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountPairingInvitationCreateReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountPairingInvitationCreateReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountPairingInvitationCreateReply;
            public static toObject(message: berty.chat.AccountPairingInvitationCreateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountRenewIncomingContactRequestLinkRequest {
        }

        class AccountRenewIncomingContactRequestLinkRequest implements IAccountRenewIncomingContactRequestLinkRequest {
            constructor(properties?: berty.chat.IAccountRenewIncomingContactRequestLinkRequest);
            public static create(properties?: berty.chat.IAccountRenewIncomingContactRequestLinkRequest): berty.chat.AccountRenewIncomingContactRequestLinkRequest;
            public static encode(message: berty.chat.IAccountRenewIncomingContactRequestLinkRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountRenewIncomingContactRequestLinkRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountRenewIncomingContactRequestLinkRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountRenewIncomingContactRequestLinkRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountRenewIncomingContactRequestLinkRequest;
            public static toObject(message: berty.chat.AccountRenewIncomingContactRequestLinkRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountRenewIncomingContactRequestLinkReply {
        }

        class AccountRenewIncomingContactRequestLinkReply implements IAccountRenewIncomingContactRequestLinkReply {
            constructor(properties?: berty.chat.IAccountRenewIncomingContactRequestLinkReply);
            public static create(properties?: berty.chat.IAccountRenewIncomingContactRequestLinkReply): berty.chat.AccountRenewIncomingContactRequestLinkReply;
            public static encode(message: berty.chat.IAccountRenewIncomingContactRequestLinkReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountRenewIncomingContactRequestLinkReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountRenewIncomingContactRequestLinkReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountRenewIncomingContactRequestLinkReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountRenewIncomingContactRequestLinkReply;
            public static toObject(message: berty.chat.AccountRenewIncomingContactRequestLinkReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IDevEventSubscribeRequest {
        }

        class DevEventSubscribeRequest implements IDevEventSubscribeRequest {
            constructor(properties?: berty.chat.IDevEventSubscribeRequest);
            public static create(properties?: berty.chat.IDevEventSubscribeRequest): berty.chat.DevEventSubscribeRequest;
            public static encode(message: berty.chat.IDevEventSubscribeRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IDevEventSubscribeRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.DevEventSubscribeRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.DevEventSubscribeRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.DevEventSubscribeRequest;
            public static toObject(message: berty.chat.DevEventSubscribeRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IDevEventSubscribeReply {
        }

        class DevEventSubscribeReply implements IDevEventSubscribeReply {
            constructor(properties?: berty.chat.IDevEventSubscribeReply);
            public static create(properties?: berty.chat.IDevEventSubscribeReply): berty.chat.DevEventSubscribeReply;
            public static encode(message: berty.chat.IDevEventSubscribeReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IDevEventSubscribeReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.DevEventSubscribeReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.DevEventSubscribeReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.DevEventSubscribeReply;
            public static toObject(message: berty.chat.DevEventSubscribeReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }
    }

    namespace chatmodel {

        interface IAccount {
            id?: (number|Long|null);
            createdAt?: (google.protobuf.ITimestamp|null);
            updatedAt?: (google.protobuf.ITimestamp|null);
            name?: (string|null);
            avatarUri?: (string|null);
            contactRequestsEnabled?: (boolean|null);
            contactRequestsLink?: (string|null);
        }

        class Account implements IAccount {
            constructor(properties?: berty.chatmodel.IAccount);
            public id: (number|Long);
            public createdAt?: (google.protobuf.ITimestamp|null);
            public updatedAt?: (google.protobuf.ITimestamp|null);
            public name: string;
            public avatarUri: string;
            public contactRequestsEnabled: boolean;
            public contactRequestsLink: string;
            public static create(properties?: berty.chatmodel.IAccount): berty.chatmodel.Account;
            public static encode(message: berty.chatmodel.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chatmodel.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Account;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Account;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Account;
            public static toObject(message: berty.chatmodel.Account, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversation {
            id?: (number|Long|null);
            protocolId?: (string|null);
            createdAt?: (google.protobuf.ITimestamp|null);
            updatedAt?: (google.protobuf.ITimestamp|null);
            title?: (string|null);
            topic?: (string|null);
            avatarUri?: (string|null);
            kind?: (berty.chatmodel.Conversation.Kind|null);
            badge?: (number|null);
            mutePolicy?: (berty.chatmodel.Conversation.MutePolicy|null);
            messages?: (berty.chatmodel.IMessage[]|null);
            members?: (berty.chatmodel.IMember[]|null);
            lastMessageId?: (number|Long|null);
            lastMessage?: (berty.chatmodel.IMessage|null);
        }

        class Conversation implements IConversation {
            constructor(properties?: berty.chatmodel.IConversation);
            public id: (number|Long);
            public protocolId: string;
            public createdAt?: (google.protobuf.ITimestamp|null);
            public updatedAt?: (google.protobuf.ITimestamp|null);
            public title: string;
            public topic: string;
            public avatarUri: string;
            public kind: berty.chatmodel.Conversation.Kind;
            public badge: number;
            public mutePolicy: berty.chatmodel.Conversation.MutePolicy;
            public messages: berty.chatmodel.IMessage[];
            public members: berty.chatmodel.IMember[];
            public lastMessageId: (number|Long);
            public lastMessage?: (berty.chatmodel.IMessage|null);
            public static create(properties?: berty.chatmodel.IConversation): berty.chatmodel.Conversation;
            public static encode(message: berty.chatmodel.IConversation, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chatmodel.IConversation, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Conversation;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Conversation;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Conversation;
            public static toObject(message: berty.chatmodel.Conversation, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace Conversation {

            enum Kind {
                Unknown = 0,
                Self = 1,
                OneToOne = 2,
                PrivateGroup = 3
            }

            enum MutePolicy {
                Nothing = 0,
                All = 1,
                Notifications = 2
            }
        }

        interface IMember {
            id?: (number|Long|null);
            protocolId?: (string|null);
            createdAt?: (google.protobuf.ITimestamp|null);
            updatedAt?: (google.protobuf.ITimestamp|null);
            readAt?: (google.protobuf.ITimestamp|null);
            name?: (string|null);
            avatarUri?: (string|null);
            role?: (berty.chatmodel.Member.Role|null);
            conversationId?: (number|Long|null);
            conversation?: (berty.chatmodel.IConversation|null);
            contactId?: (number|Long|null);
            contact?: (berty.chatmodel.IContact|null);
        }

        class Member implements IMember {
            constructor(properties?: berty.chatmodel.IMember);
            public id: (number|Long);
            public protocolId: string;
            public createdAt?: (google.protobuf.ITimestamp|null);
            public updatedAt?: (google.protobuf.ITimestamp|null);
            public readAt?: (google.protobuf.ITimestamp|null);
            public name: string;
            public avatarUri: string;
            public role: berty.chatmodel.Member.Role;
            public conversationId: (number|Long);
            public conversation?: (berty.chatmodel.IConversation|null);
            public contactId: (number|Long);
            public contact?: (berty.chatmodel.IContact|null);
            public static create(properties?: berty.chatmodel.IMember): berty.chatmodel.Member;
            public static encode(message: berty.chatmodel.IMember, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chatmodel.IMember, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Member;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Member;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Member;
            public static toObject(message: berty.chatmodel.Member, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace Member {

            enum Role {
                Unknown = 0,
                Regular = 2,
                Admin = 3,
                Owner = 4
            }
        }

        interface IMessage {
            id?: (number|Long|null);
            protocolId?: (string|null);
            createdAt?: (google.protobuf.ITimestamp|null);
            updatedAt?: (google.protobuf.ITimestamp|null);
            sentAt?: (google.protobuf.ITimestamp|null);
            kind?: (berty.chatmodel.Message.Kind|null);
            body?: (berty.chatmodel.Message.IBody|null);

            /** Message attachments */
            attachments?: (berty.chatmodel.Message.IAttachment[]|null);

            /** Message reactions */
            reactions?: (berty.chatmodel.Message.IReaction[]|null);

            /** Message conversationId */
            conversationId?: (number|Long|null);
            conversation?: (berty.chatmodel.IConversation|null);
            memberId?: (number|Long|null);
            member?: (berty.chatmodel.IMember|null);
        }

        class Message implements IMessage {
            constructor(properties?: berty.chatmodel.IMessage);
            public id: (number|Long);
            public protocolId: string;
            public createdAt?: (google.protobuf.ITimestamp|null);
            public updatedAt?: (google.protobuf.ITimestamp|null);
            public sentAt?: (google.protobuf.ITimestamp|null);
            public kind: berty.chatmodel.Message.Kind;
            public body?: (berty.chatmodel.Message.IBody|null);

            /** Message attachments. */
            public attachments: berty.chatmodel.Message.IAttachment[];

            /** Message reactions. */
            public reactions: berty.chatmodel.Message.IReaction[];

            /** Message conversationId. */
            public conversationId: (number|Long);
            public conversation?: (berty.chatmodel.IConversation|null);
            public memberId: (number|Long);
            public member?: (berty.chatmodel.IMember|null);

            /**
             * Creates a new Message instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Message instance
             */
            public static create(properties?: berty.chatmodel.IMessage): berty.chatmodel.Message;
            public static encode(message: berty.chatmodel.IMessage, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chatmodel.IMessage, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Message;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Message;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Message;
            public static toObject(message: berty.chatmodel.Message, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace Message {

            enum Kind {
                Unknown = 0,
                Text = 1,
                MemberJoined = 2,
                MemberLeave = 3,
                MemberSetTitleTo = 4
            }

            interface IBody {
                text?: (string|null);
                memberJoined?: (number|Long|null);
                memberLeft?: (number|Long|null);
                memberSetTitleTo?: (string|null);
            }

            class Body implements IBody {
                constructor(properties?: berty.chatmodel.Message.IBody);
                public text: string;
                public memberJoined: (number|Long);
                public memberLeft: (number|Long);
                public memberSetTitleTo: string;
                public static create(properties?: berty.chatmodel.Message.IBody): berty.chatmodel.Message.Body;
                public static encode(message: berty.chatmodel.Message.IBody, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chatmodel.Message.IBody, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Message.Body;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Message.Body;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chatmodel.Message.Body;
                public static toObject(message: berty.chatmodel.Message.Body, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
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
                constructor(properties?: berty.chatmodel.Message.IAttachment);

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
                public static create(properties?: berty.chatmodel.Message.IAttachment): berty.chatmodel.Message.Attachment;

                /**
                 * Encodes the specified Attachment message. Does not implicitly {@link berty.chatmodel.Message.Attachment.verify|verify} messages.
                 * @param message Attachment message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: berty.chatmodel.Message.IAttachment, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Attachment message, length delimited. Does not implicitly {@link berty.chatmodel.Message.Attachment.verify|verify} messages.
                 * @param message Attachment message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: berty.chatmodel.Message.IAttachment, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes an Attachment message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Attachment
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Message.Attachment;

                /**
                 * Decodes an Attachment message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Attachment
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Message.Attachment;

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
                public static fromObject(object: { [k: string]: any }): berty.chatmodel.Message.Attachment;

                /**
                 * Creates a plain object from an Attachment message. Also converts values to other types if specified.
                 * @param message Attachment
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: berty.chatmodel.Message.Attachment, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
                constructor(properties?: berty.chatmodel.Message.IReaction);

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
                public static create(properties?: berty.chatmodel.Message.IReaction): berty.chatmodel.Message.Reaction;

                /**
                 * Encodes the specified Reaction message. Does not implicitly {@link berty.chatmodel.Message.Reaction.verify|verify} messages.
                 * @param message Reaction message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: berty.chatmodel.Message.IReaction, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Reaction message, length delimited. Does not implicitly {@link berty.chatmodel.Message.Reaction.verify|verify} messages.
                 * @param message Reaction message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: berty.chatmodel.Message.IReaction, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Reaction message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Reaction
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Message.Reaction;

                /**
                 * Decodes a Reaction message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Reaction
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Message.Reaction;

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
                public static fromObject(object: { [k: string]: any }): berty.chatmodel.Message.Reaction;

                /**
                 * Creates a plain object from a Reaction message. Also converts values to other types if specified.
                 * @param message Reaction
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: berty.chatmodel.Message.Reaction, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Reaction to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContact {
            id?: (number|Long|null);
            protocolId?: (string|null);
            createdAt?: (google.protobuf.ITimestamp|null);
            updatedAt?: (google.protobuf.ITimestamp|null);
            seenAt?: (google.protobuf.ITimestamp|null);
            name?: (string|null);
            avatarUri?: (string|null);
            statusEmoji?: (Uint8Array|null);
            statusText?: (string|null);
            kind?: (berty.chatmodel.Contact.Kind|null);
            blocked?: (boolean|null);
            devices?: (berty.chatmodel.IDevice[]|null);
        }

        class Contact implements IContact {
            constructor(properties?: berty.chatmodel.IContact);
            public id: (number|Long);
            public protocolId: string;
            public createdAt?: (google.protobuf.ITimestamp|null);
            public updatedAt?: (google.protobuf.ITimestamp|null);
            public seenAt?: (google.protobuf.ITimestamp|null);
            public name: string;
            public avatarUri: string;
            public statusEmoji: Uint8Array;
            public statusText: string;
            public kind: berty.chatmodel.Contact.Kind;
            public blocked: boolean;
            public devices: berty.chatmodel.IDevice[];
            public static create(properties?: berty.chatmodel.IContact): berty.chatmodel.Contact;
            public static encode(message: berty.chatmodel.IContact, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chatmodel.IContact, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Contact;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Contact;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Contact;
            public static toObject(message: berty.chatmodel.Contact, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace Contact {

            enum Kind {
                Unknown = 0,
                PendingInc = 1,
                PendingOut = 2,
                Friend = 3,
                Trusted = 4,
                Myself = 42
            }
        }

        interface IDevice {
            id?: (number|Long|null);
            protocolId?: (string|null);
            createdAt?: (google.protobuf.ITimestamp|null);
            updatedAt?: (google.protobuf.ITimestamp|null);
            lastSeenAt?: (google.protobuf.ITimestamp|null);
            kind?: (berty.chatmodel.Device.Kind|null);
            canRelay?: (boolean|null);
            canBle?: (boolean|null);
            contactId?: (number|Long|null);
            contact?: (berty.chatmodel.IContact|null);
        }

        class Device implements IDevice {
            constructor(properties?: berty.chatmodel.IDevice);
            public id: (number|Long);
            public protocolId: string;
            public createdAt?: (google.protobuf.ITimestamp|null);
            public updatedAt?: (google.protobuf.ITimestamp|null);
            public lastSeenAt?: (google.protobuf.ITimestamp|null);
            public kind: berty.chatmodel.Device.Kind;
            public canRelay: boolean;
            public canBle: boolean;
            public contactId: (number|Long);
            public contact?: (berty.chatmodel.IContact|null);
            public static create(properties?: berty.chatmodel.IDevice): berty.chatmodel.Device;
            public static encode(message: berty.chatmodel.IDevice, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chatmodel.IDevice, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Device;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Device;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Device;
            public static toObject(message: berty.chatmodel.Device, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace Device {

            enum Kind {
                Unknown = 0,
                Phone = 1,
                Desktop = 2,
                Laptop = 3
            }
        }
    }
}

export namespace google {
	namespace api {
		interface IHttp {
			rules?: google.api.IHttpRule[] | null
		}

		class Http implements IHttp {
			constructor(properties?: google.api.IHttp)
			public rules: google.api.IHttpRule[]
			public static create(properties?: google.api.IHttp): google.api.Http
			public static encode(message: google.api.IHttp, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(message: google.api.IHttp, writer?: $protobuf.Writer): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.api.Http
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.api.Http
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.api.Http
			public static toObject(message: google.api.Http, options?: $protobuf.IConversionOptions): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface IHttpRule {
			selector?: string | null
			get?: string | null
			put?: string | null
			post?: string | null
			delete?: string | null
			patch?: string | null
			custom?: google.api.ICustomHttpPattern | null
			body?: string | null
			additionalBindings?: google.api.IHttpRule[] | null
		}

		class HttpRule implements IHttpRule {
			constructor(properties?: google.api.IHttpRule)
			public selector: string
			public get: string
			public put: string
			public post: string
			public delete: string
			public patch: string
			public custom?: google.api.ICustomHttpPattern | null
			public body: string
			public additionalBindings: google.api.IHttpRule[]
			public pattern?: 'get' | 'put' | 'post' | 'delete' | 'patch' | 'custom'
			public static create(properties?: google.api.IHttpRule): google.api.HttpRule
			public static encode(message: google.api.IHttpRule, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(message: google.api.IHttpRule, writer?: $protobuf.Writer): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.api.HttpRule
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.api.HttpRule
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.api.HttpRule
			public static toObject(message: google.api.HttpRule, options?: $protobuf.IConversionOptions): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface ICustomHttpPattern {
			kind?: string | null
			path?: string | null
		}

		class CustomHttpPattern implements ICustomHttpPattern {
			constructor(properties?: google.api.ICustomHttpPattern)
			public kind: string
			public path: string
			public static create(properties?: google.api.ICustomHttpPattern): google.api.CustomHttpPattern
			public static encode(message: google.api.ICustomHttpPattern, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(message: google.api.ICustomHttpPattern, writer?: $protobuf.Writer): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.api.CustomHttpPattern
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.api.CustomHttpPattern
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.api.CustomHttpPattern
			public static toObject(
				message: google.api.CustomHttpPattern,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}
	}

	namespace protobuf {
		interface IFileDescriptorSet {
			file?: google.protobuf.IFileDescriptorProto[] | null
		}

		class FileDescriptorSet implements IFileDescriptorSet {
			constructor(properties?: google.protobuf.IFileDescriptorSet)
			public file: google.protobuf.IFileDescriptorProto[]
			public static create(properties?: google.protobuf.IFileDescriptorSet): google.protobuf.FileDescriptorSet
			public static encode(message: google.protobuf.IFileDescriptorSet, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IFileDescriptorSet,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.FileDescriptorSet
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.FileDescriptorSet
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorSet
			public static toObject(
				message: google.protobuf.FileDescriptorSet,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface IFileDescriptorProto {
			name?: string | null
			package?: string | null
			dependency?: string[] | null
			publicDependency?: number[] | null
			weakDependency?: number[] | null
			messageType?: google.protobuf.IDescriptorProto[] | null
			enumType?: google.protobuf.IEnumDescriptorProto[] | null
			service?: google.protobuf.IServiceDescriptorProto[] | null
			extension?: google.protobuf.IFieldDescriptorProto[] | null
			options?: google.protobuf.IFileOptions | null
			sourceCodeInfo?: google.protobuf.ISourceCodeInfo | null
			syntax?: string | null
		}

		class FileDescriptorProto implements IFileDescriptorProto {
			constructor(properties?: google.protobuf.IFileDescriptorProto)
			public name: string
			public package: string
			public dependency: string[]
			public publicDependency: number[]
			public weakDependency: number[]
			public messageType: google.protobuf.IDescriptorProto[]
			public enumType: google.protobuf.IEnumDescriptorProto[]
			public service: google.protobuf.IServiceDescriptorProto[]
			public extension: google.protobuf.IFieldDescriptorProto[]
			public options?: google.protobuf.IFileOptions | null
			public sourceCodeInfo?: google.protobuf.ISourceCodeInfo | null
			public syntax: string
			public static create(properties?: google.protobuf.IFileDescriptorProto): google.protobuf.FileDescriptorProto
			public static encode(message: google.protobuf.IFileDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IFileDescriptorProto,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.FileDescriptorProto
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.FileDescriptorProto
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorProto
			public static toObject(
				message: google.protobuf.FileDescriptorProto,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface IDescriptorProto {
			name?: string | null
			field?: google.protobuf.IFieldDescriptorProto[] | null
			extension?: google.protobuf.IFieldDescriptorProto[] | null
			nestedType?: google.protobuf.IDescriptorProto[] | null
			enumType?: google.protobuf.IEnumDescriptorProto[] | null
			extensionRange?: google.protobuf.DescriptorProto.IExtensionRange[] | null
			oneofDecl?: google.protobuf.IOneofDescriptorProto[] | null
			options?: google.protobuf.IMessageOptions | null
			reservedRange?: google.protobuf.DescriptorProto.IReservedRange[] | null
			reservedName?: string[] | null
		}

		class DescriptorProto implements IDescriptorProto {
			constructor(properties?: google.protobuf.IDescriptorProto)
			public name: string
			public field: google.protobuf.IFieldDescriptorProto[]
			public extension: google.protobuf.IFieldDescriptorProto[]
			public nestedType: google.protobuf.IDescriptorProto[]
			public enumType: google.protobuf.IEnumDescriptorProto[]
			public extensionRange: google.protobuf.DescriptorProto.IExtensionRange[]
			public oneofDecl: google.protobuf.IOneofDescriptorProto[]
			public options?: google.protobuf.IMessageOptions | null
			public reservedRange: google.protobuf.DescriptorProto.IReservedRange[]
			public reservedName: string[]
			public static create(properties?: google.protobuf.IDescriptorProto): google.protobuf.DescriptorProto
			public static encode(message: google.protobuf.IDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IDescriptorProto,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.DescriptorProto
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.DescriptorProto
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto
			public static toObject(
				message: google.protobuf.DescriptorProto,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		namespace DescriptorProto {
			interface IExtensionRange {
				start?: number | null
				end?: number | null
				options?: google.protobuf.IExtensionRangeOptions | null
			}

			class ExtensionRange implements IExtensionRange {
				constructor(properties?: google.protobuf.DescriptorProto.IExtensionRange)
				public start: number
				public end: number
				public options?: google.protobuf.IExtensionRangeOptions | null
				public static create(
					properties?: google.protobuf.DescriptorProto.IExtensionRange,
				): google.protobuf.DescriptorProto.ExtensionRange
				public static encode(
					message: google.protobuf.DescriptorProto.IExtensionRange,
					writer?: $protobuf.Writer,
				): $protobuf.Writer
				public static encodeDelimited(
					message: google.protobuf.DescriptorProto.IExtensionRange,
					writer?: $protobuf.Writer,
				): $protobuf.Writer
				public static decode(
					reader: $protobuf.Reader | Uint8Array,
					length?: number,
				): google.protobuf.DescriptorProto.ExtensionRange
				public static decodeDelimited(
					reader: $protobuf.Reader | Uint8Array,
				): google.protobuf.DescriptorProto.ExtensionRange
				public static verify(message: { [k: string]: any }): string | null
				public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ExtensionRange
				public static toObject(
					message: google.protobuf.DescriptorProto.ExtensionRange,
					options?: $protobuf.IConversionOptions,
				): { [k: string]: any }
				public toJSON(): { [k: string]: any }
			}

			interface IReservedRange {
				start?: number | null
				end?: number | null
			}

			class ReservedRange implements IReservedRange {
				constructor(properties?: google.protobuf.DescriptorProto.IReservedRange)
				public start: number
				public end: number
				public static create(
					properties?: google.protobuf.DescriptorProto.IReservedRange,
				): google.protobuf.DescriptorProto.ReservedRange
				public static encode(
					message: google.protobuf.DescriptorProto.IReservedRange,
					writer?: $protobuf.Writer,
				): $protobuf.Writer
				public static encodeDelimited(
					message: google.protobuf.DescriptorProto.IReservedRange,
					writer?: $protobuf.Writer,
				): $protobuf.Writer
				public static decode(
					reader: $protobuf.Reader | Uint8Array,
					length?: number,
				): google.protobuf.DescriptorProto.ReservedRange
				public static decodeDelimited(
					reader: $protobuf.Reader | Uint8Array,
				): google.protobuf.DescriptorProto.ReservedRange
				public static verify(message: { [k: string]: any }): string | null
				public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ReservedRange
				public static toObject(
					message: google.protobuf.DescriptorProto.ReservedRange,
					options?: $protobuf.IConversionOptions,
				): { [k: string]: any }
				public toJSON(): { [k: string]: any }
			}
		}

		interface IExtensionRangeOptions {
			uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null
		}

		class ExtensionRangeOptions implements IExtensionRangeOptions {
			constructor(properties?: google.protobuf.IExtensionRangeOptions)
			public uninterpretedOption: google.protobuf.IUninterpretedOption[]
			public static create(properties?: google.protobuf.IExtensionRangeOptions): google.protobuf.ExtensionRangeOptions
			public static encode(message: google.protobuf.IExtensionRangeOptions, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IExtensionRangeOptions,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(
				reader: $protobuf.Reader | Uint8Array,
				length?: number,
			): google.protobuf.ExtensionRangeOptions
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.ExtensionRangeOptions
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.ExtensionRangeOptions
			public static toObject(
				message: google.protobuf.ExtensionRangeOptions,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface IFieldDescriptorProto {
			name?: string | null
			number?: number | null
			label?: google.protobuf.FieldDescriptorProto.Label | null
			type?: google.protobuf.FieldDescriptorProto.Type | null
			typeName?: string | null
			extendee?: string | null
			defaultValue?: string | null
			oneofIndex?: number | null
			jsonName?: string | null
			options?: google.protobuf.IFieldOptions | null
		}

		class FieldDescriptorProto implements IFieldDescriptorProto {
			constructor(properties?: google.protobuf.IFieldDescriptorProto)
			public name: string
			public number: number
			public label: google.protobuf.FieldDescriptorProto.Label
			public type: google.protobuf.FieldDescriptorProto.Type
			public typeName: string
			public extendee: string
			public defaultValue: string
			public oneofIndex: number
			public jsonName: string
			public options?: google.protobuf.IFieldOptions | null
			public static create(properties?: google.protobuf.IFieldDescriptorProto): google.protobuf.FieldDescriptorProto
			public static encode(message: google.protobuf.IFieldDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IFieldDescriptorProto,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.FieldDescriptorProto
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.FieldDescriptorProto
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.FieldDescriptorProto
			public static toObject(
				message: google.protobuf.FieldDescriptorProto,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		namespace FieldDescriptorProto {
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
				TYPE_SINT64 = 18,
			}

			enum Label {
				LABEL_OPTIONAL = 1,
				LABEL_REQUIRED = 2,
				LABEL_REPEATED = 3,
			}
		}

		interface IOneofDescriptorProto {
			name?: string | null
			options?: google.protobuf.IOneofOptions | null
		}

		class OneofDescriptorProto implements IOneofDescriptorProto {
			constructor(properties?: google.protobuf.IOneofDescriptorProto)
			public name: string
			public options?: google.protobuf.IOneofOptions | null
			public static create(properties?: google.protobuf.IOneofDescriptorProto): google.protobuf.OneofDescriptorProto
			public static encode(message: google.protobuf.IOneofDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IOneofDescriptorProto,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.OneofDescriptorProto
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.OneofDescriptorProto
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.OneofDescriptorProto
			public static toObject(
				message: google.protobuf.OneofDescriptorProto,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface IEnumDescriptorProto {
			name?: string | null
			value?: google.protobuf.IEnumValueDescriptorProto[] | null
			options?: google.protobuf.IEnumOptions | null
			reservedRange?: google.protobuf.EnumDescriptorProto.IEnumReservedRange[] | null
			reservedName?: string[] | null
		}

		class EnumDescriptorProto implements IEnumDescriptorProto {
			constructor(properties?: google.protobuf.IEnumDescriptorProto)
			public name: string
			public value: google.protobuf.IEnumValueDescriptorProto[]
			public options?: google.protobuf.IEnumOptions | null
			public reservedRange: google.protobuf.EnumDescriptorProto.IEnumReservedRange[]
			public reservedName: string[]
			public static create(properties?: google.protobuf.IEnumDescriptorProto): google.protobuf.EnumDescriptorProto
			public static encode(message: google.protobuf.IEnumDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IEnumDescriptorProto,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.EnumDescriptorProto
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.EnumDescriptorProto
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.EnumDescriptorProto
			public static toObject(
				message: google.protobuf.EnumDescriptorProto,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		namespace EnumDescriptorProto {
			interface IEnumReservedRange {
				start?: number | null
				end?: number | null
			}

			class EnumReservedRange implements IEnumReservedRange {
				constructor(properties?: google.protobuf.EnumDescriptorProto.IEnumReservedRange)
				public start: number
				public end: number
				public static create(
					properties?: google.protobuf.EnumDescriptorProto.IEnumReservedRange,
				): google.protobuf.EnumDescriptorProto.EnumReservedRange
				public static encode(
					message: google.protobuf.EnumDescriptorProto.IEnumReservedRange,
					writer?: $protobuf.Writer,
				): $protobuf.Writer
				public static encodeDelimited(
					message: google.protobuf.EnumDescriptorProto.IEnumReservedRange,
					writer?: $protobuf.Writer,
				): $protobuf.Writer
				public static decode(
					reader: $protobuf.Reader | Uint8Array,
					length?: number,
				): google.protobuf.EnumDescriptorProto.EnumReservedRange
				public static decodeDelimited(
					reader: $protobuf.Reader | Uint8Array,
				): google.protobuf.EnumDescriptorProto.EnumReservedRange
				public static verify(message: { [k: string]: any }): string | null
				public static fromObject(object: { [k: string]: any }): google.protobuf.EnumDescriptorProto.EnumReservedRange
				public static toObject(
					message: google.protobuf.EnumDescriptorProto.EnumReservedRange,
					options?: $protobuf.IConversionOptions,
				): { [k: string]: any }
				public toJSON(): { [k: string]: any }
			}
		}

		interface IEnumValueDescriptorProto {
			name?: string | null
			number?: number | null
			options?: google.protobuf.IEnumValueOptions | null
		}

		class EnumValueDescriptorProto implements IEnumValueDescriptorProto {
			constructor(properties?: google.protobuf.IEnumValueDescriptorProto)
			public name: string
			public number: number
			public options?: google.protobuf.IEnumValueOptions | null
			public static create(
				properties?: google.protobuf.IEnumValueDescriptorProto,
			): google.protobuf.EnumValueDescriptorProto
			public static encode(
				message: google.protobuf.IEnumValueDescriptorProto,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IEnumValueDescriptorProto,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(
				reader: $protobuf.Reader | Uint8Array,
				length?: number,
			): google.protobuf.EnumValueDescriptorProto
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.EnumValueDescriptorProto
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueDescriptorProto
			public static toObject(
				message: google.protobuf.EnumValueDescriptorProto,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface IServiceDescriptorProto {
			name?: string | null
			method?: google.protobuf.IMethodDescriptorProto[] | null
			options?: google.protobuf.IServiceOptions | null
		}

		class ServiceDescriptorProto implements IServiceDescriptorProto {
			constructor(properties?: google.protobuf.IServiceDescriptorProto)
			public name: string
			public method: google.protobuf.IMethodDescriptorProto[]
			public options?: google.protobuf.IServiceOptions | null
			public static create(properties?: google.protobuf.IServiceDescriptorProto): google.protobuf.ServiceDescriptorProto
			public static encode(
				message: google.protobuf.IServiceDescriptorProto,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IServiceDescriptorProto,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(
				reader: $protobuf.Reader | Uint8Array,
				length?: number,
			): google.protobuf.ServiceDescriptorProto
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.ServiceDescriptorProto
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceDescriptorProto
			public static toObject(
				message: google.protobuf.ServiceDescriptorProto,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface IMethodDescriptorProto {
			name?: string | null
			inputType?: string | null
			outputType?: string | null
			options?: google.protobuf.IMethodOptions | null
			clientStreaming?: boolean | null
			serverStreaming?: boolean | null
		}

		class MethodDescriptorProto implements IMethodDescriptorProto {
			constructor(properties?: google.protobuf.IMethodDescriptorProto)
			public name: string
			public inputType: string
			public outputType: string
			public options?: google.protobuf.IMethodOptions | null
			public clientStreaming: boolean
			public serverStreaming: boolean
			public static create(properties?: google.protobuf.IMethodDescriptorProto): google.protobuf.MethodDescriptorProto
			public static encode(message: google.protobuf.IMethodDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IMethodDescriptorProto,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(
				reader: $protobuf.Reader | Uint8Array,
				length?: number,
			): google.protobuf.MethodDescriptorProto
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.MethodDescriptorProto
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.MethodDescriptorProto
			public static toObject(
				message: google.protobuf.MethodDescriptorProto,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface IFileOptions {
			javaPackage?: string | null
			javaOuterClassname?: string | null
			javaMultipleFiles?: boolean | null
			javaGenerateEqualsAndHash?: boolean | null
			javaStringCheckUtf8?: boolean | null
			optimizeFor?: google.protobuf.FileOptions.OptimizeMode | null
			goPackage?: string | null
			ccGenericServices?: boolean | null
			javaGenericServices?: boolean | null
			pyGenericServices?: boolean | null
			phpGenericServices?: boolean | null
			deprecated?: boolean | null
			ccEnableArenas?: boolean | null
			objcClassPrefix?: string | null
			csharpNamespace?: string | null
			swiftPrefix?: string | null
			phpClassPrefix?: string | null
			phpNamespace?: string | null
			phpMetadataNamespace?: string | null
			rubyPackage?: string | null
			uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null
			'.gogoproto.goprotoGettersAll'?: boolean | null
			'.gogoproto.goprotoEnumPrefixAll'?: boolean | null
			'.gogoproto.goprotoStringerAll'?: boolean | null
			'.gogoproto.verboseEqualAll'?: boolean | null
			'.gogoproto.faceAll'?: boolean | null
			'.gogoproto.gostringAll'?: boolean | null
			'.gogoproto.populateAll'?: boolean | null
			'.gogoproto.stringerAll'?: boolean | null
			'.gogoproto.onlyoneAll'?: boolean | null
			'.gogoproto.equalAll'?: boolean | null
			'.gogoproto.descriptionAll'?: boolean | null
			'.gogoproto.testgenAll'?: boolean | null
			'.gogoproto.benchgenAll'?: boolean | null
			'.gogoproto.marshalerAll'?: boolean | null
			'.gogoproto.unmarshalerAll'?: boolean | null
			'.gogoproto.stableMarshalerAll'?: boolean | null
			'.gogoproto.sizerAll'?: boolean | null
			'.gogoproto.goprotoEnumStringerAll'?: boolean | null
			'.gogoproto.enumStringerAll'?: boolean | null
			'.gogoproto.unsafeMarshalerAll'?: boolean | null
			'.gogoproto.unsafeUnmarshalerAll'?: boolean | null
			'.gogoproto.goprotoExtensionsMapAll'?: boolean | null
			'.gogoproto.goprotoUnrecognizedAll'?: boolean | null
			'.gogoproto.gogoprotoImport'?: boolean | null
			'.gogoproto.protosizerAll'?: boolean | null
			'.gogoproto.compareAll'?: boolean | null
			'.gogoproto.typedeclAll'?: boolean | null
			'.gogoproto.enumdeclAll'?: boolean | null
			'.gogoproto.goprotoRegistration'?: boolean | null
			'.gogoproto.messagenameAll'?: boolean | null
			'.gogoproto.goprotoSizecacheAll'?: boolean | null
			'.gogoproto.goprotoUnkeyedAll'?: boolean | null
		}

		class FileOptions implements IFileOptions {
			constructor(properties?: google.protobuf.IFileOptions)
			public javaPackage: string
			public javaOuterClassname: string
			public javaMultipleFiles: boolean
			public javaGenerateEqualsAndHash: boolean
			public javaStringCheckUtf8: boolean
			public optimizeFor: google.protobuf.FileOptions.OptimizeMode
			public goPackage: string
			public ccGenericServices: boolean
			public javaGenericServices: boolean
			public pyGenericServices: boolean
			public phpGenericServices: boolean
			public deprecated: boolean
			public ccEnableArenas: boolean
			public objcClassPrefix: string
			public csharpNamespace: string
			public swiftPrefix: string
			public phpClassPrefix: string
			public phpNamespace: string
			public phpMetadataNamespace: string
			public rubyPackage: string
			public uninterpretedOption: google.protobuf.IUninterpretedOption[]
			public static create(properties?: google.protobuf.IFileOptions): google.protobuf.FileOptions
			public static encode(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.FileOptions
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.FileOptions
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.FileOptions
			public static toObject(
				message: google.protobuf.FileOptions,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		namespace FileOptions {
			enum OptimizeMode {
				SPEED = 1,
				CODE_SIZE = 2,
				LITE_RUNTIME = 3,
			}
		}

		interface IMessageOptions {
			messageSetWireFormat?: boolean | null
			noStandardDescriptorAccessor?: boolean | null
			deprecated?: boolean | null
			mapEntry?: boolean | null
			uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null
			'.gogoproto.goprotoGetters'?: boolean | null
			'.gogoproto.goprotoStringer'?: boolean | null
			'.gogoproto.verboseEqual'?: boolean | null
			'.gogoproto.face'?: boolean | null
			'.gogoproto.gostring'?: boolean | null
			'.gogoproto.populate'?: boolean | null
			'.gogoproto.stringer'?: boolean | null
			'.gogoproto.onlyone'?: boolean | null
			'.gogoproto.equal'?: boolean | null
			'.gogoproto.description'?: boolean | null
			'.gogoproto.testgen'?: boolean | null
			'.gogoproto.benchgen'?: boolean | null
			'.gogoproto.marshaler'?: boolean | null
			'.gogoproto.unmarshaler'?: boolean | null
			'.gogoproto.stableMarshaler'?: boolean | null
			'.gogoproto.sizer'?: boolean | null
			'.gogoproto.unsafeMarshaler'?: boolean | null
			'.gogoproto.unsafeUnmarshaler'?: boolean | null
			'.gogoproto.goprotoExtensionsMap'?: boolean | null
			'.gogoproto.goprotoUnrecognized'?: boolean | null
			'.gogoproto.protosizer'?: boolean | null
			'.gogoproto.compare'?: boolean | null
			'.gogoproto.typedecl'?: boolean | null
			'.gogoproto.messagename'?: boolean | null
			'.gogoproto.goprotoSizecache'?: boolean | null
			'.gogoproto.goprotoUnkeyed'?: boolean | null
		}

		class MessageOptions implements IMessageOptions {
			constructor(properties?: google.protobuf.IMessageOptions)
			public messageSetWireFormat: boolean
			public noStandardDescriptorAccessor: boolean
			public deprecated: boolean
			public mapEntry: boolean
			public uninterpretedOption: google.protobuf.IUninterpretedOption[]
			public static create(properties?: google.protobuf.IMessageOptions): google.protobuf.MessageOptions
			public static encode(message: google.protobuf.IMessageOptions, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IMessageOptions,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.MessageOptions
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.MessageOptions
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.MessageOptions
			public static toObject(
				message: google.protobuf.MessageOptions,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface IFieldOptions {
			ctype?: google.protobuf.FieldOptions.CType | null
			packed?: boolean | null
			jstype?: google.protobuf.FieldOptions.JSType | null
			lazy?: boolean | null
			deprecated?: boolean | null
			weak?: boolean | null
			uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null
			'.gogoproto.nullable'?: boolean | null
			'.gogoproto.embed'?: boolean | null
			'.gogoproto.customtype'?: string | null
			'.gogoproto.customname'?: string | null
			'.gogoproto.jsontag'?: string | null
			'.gogoproto.moretags'?: string | null
			'.gogoproto.casttype'?: string | null
			'.gogoproto.castkey'?: string | null
			'.gogoproto.castvalue'?: string | null
			'.gogoproto.stdtime'?: boolean | null
			'.gogoproto.stdduration'?: boolean | null
			'.gogoproto.wktpointer'?: boolean | null
		}

		class FieldOptions implements IFieldOptions {
			constructor(properties?: google.protobuf.IFieldOptions)
			public ctype: google.protobuf.FieldOptions.CType
			public packed: boolean
			public jstype: google.protobuf.FieldOptions.JSType
			public lazy: boolean
			public deprecated: boolean
			public weak: boolean
			public uninterpretedOption: google.protobuf.IUninterpretedOption[]
			public static create(properties?: google.protobuf.IFieldOptions): google.protobuf.FieldOptions
			public static encode(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.FieldOptions
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.FieldOptions
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.FieldOptions
			public static toObject(
				message: google.protobuf.FieldOptions,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		namespace FieldOptions {
			enum CType {
				STRING = 0,
				CORD = 1,
				STRING_PIECE = 2,
			}

			enum JSType {
				JS_NORMAL = 0,
				JS_STRING = 1,
				JS_NUMBER = 2,
			}
		}

		interface IOneofOptions {
			uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null
		}

		class OneofOptions implements IOneofOptions {
			constructor(properties?: google.protobuf.IOneofOptions)
			public uninterpretedOption: google.protobuf.IUninterpretedOption[]
			public static create(properties?: google.protobuf.IOneofOptions): google.protobuf.OneofOptions
			public static encode(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.OneofOptions
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.OneofOptions
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.OneofOptions
			public static toObject(
				message: google.protobuf.OneofOptions,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface IEnumOptions {
			allowAlias?: boolean | null
			deprecated?: boolean | null
			uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null
			'.gogoproto.goprotoEnumPrefix'?: boolean | null
			'.gogoproto.goprotoEnumStringer'?: boolean | null
			'.gogoproto.enumStringer'?: boolean | null
			'.gogoproto.enumCustomname'?: string | null
			'.gogoproto.enumdecl'?: boolean | null
		}

		class EnumOptions implements IEnumOptions {
			constructor(properties?: google.protobuf.IEnumOptions)
			public allowAlias: boolean
			public deprecated: boolean
			public uninterpretedOption: google.protobuf.IUninterpretedOption[]
			public static create(properties?: google.protobuf.IEnumOptions): google.protobuf.EnumOptions
			public static encode(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.EnumOptions
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.EnumOptions
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.EnumOptions
			public static toObject(
				message: google.protobuf.EnumOptions,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface IEnumValueOptions {
			deprecated?: boolean | null
			uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null
			'.gogoproto.enumvalueCustomname'?: string | null
		}

		class EnumValueOptions implements IEnumValueOptions {
			constructor(properties?: google.protobuf.IEnumValueOptions)
			public deprecated: boolean
			public uninterpretedOption: google.protobuf.IUninterpretedOption[]
			public static create(properties?: google.protobuf.IEnumValueOptions): google.protobuf.EnumValueOptions
			public static encode(message: google.protobuf.IEnumValueOptions, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IEnumValueOptions,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.EnumValueOptions
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.EnumValueOptions
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueOptions
			public static toObject(
				message: google.protobuf.EnumValueOptions,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface IServiceOptions {
			deprecated?: boolean | null
			uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null
		}

		class ServiceOptions implements IServiceOptions {
			constructor(properties?: google.protobuf.IServiceOptions)
			public deprecated: boolean
			public uninterpretedOption: google.protobuf.IUninterpretedOption[]
			public static create(properties?: google.protobuf.IServiceOptions): google.protobuf.ServiceOptions
			public static encode(message: google.protobuf.IServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IServiceOptions,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.ServiceOptions
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.ServiceOptions
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceOptions
			public static toObject(
				message: google.protobuf.ServiceOptions,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		interface IMethodOptions {
			deprecated?: boolean | null
			idempotencyLevel?: google.protobuf.MethodOptions.IdempotencyLevel | null
			uninterpretedOption?: google.protobuf.IUninterpretedOption[] | null
			'.google.api.http'?: google.api.IHttpRule | null
		}

		class MethodOptions implements IMethodOptions {
			constructor(properties?: google.protobuf.IMethodOptions)
			public deprecated: boolean
			public idempotencyLevel: google.protobuf.MethodOptions.IdempotencyLevel
			public uninterpretedOption: google.protobuf.IUninterpretedOption[]
			public static create(properties?: google.protobuf.IMethodOptions): google.protobuf.MethodOptions
			public static encode(message: google.protobuf.IMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IMethodOptions,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.MethodOptions
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.MethodOptions
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.MethodOptions
			public static toObject(
				message: google.protobuf.MethodOptions,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		namespace MethodOptions {
			enum IdempotencyLevel {
				IDEMPOTENCY_UNKNOWN = 0,
				NO_SIDE_EFFECTS = 1,
				IDEMPOTENT = 2,
			}
		}

		interface IUninterpretedOption {
			name?: google.protobuf.UninterpretedOption.INamePart[] | null
			identifierValue?: string | null
			positiveIntValue?: number | Long | null
			negativeIntValue?: number | Long | null
			doubleValue?: number | null
			stringValue?: Uint8Array | null
			aggregateValue?: string | null
		}

		class UninterpretedOption implements IUninterpretedOption {
			constructor(properties?: google.protobuf.IUninterpretedOption)
			public name: google.protobuf.UninterpretedOption.INamePart[]
			public identifierValue: string
			public positiveIntValue: number | Long
			public negativeIntValue: number | Long
			public doubleValue: number
			public stringValue: Uint8Array
			public aggregateValue: string
			public static create(properties?: google.protobuf.IUninterpretedOption): google.protobuf.UninterpretedOption
			public static encode(message: google.protobuf.IUninterpretedOption, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IUninterpretedOption,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.UninterpretedOption
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.UninterpretedOption
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption
			public static toObject(
				message: google.protobuf.UninterpretedOption,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		namespace UninterpretedOption {
			interface INamePart {
				namePart: string
				isExtension: boolean
			}

			class NamePart implements INamePart {
				constructor(properties?: google.protobuf.UninterpretedOption.INamePart)
				public namePart: string
				public isExtension: boolean
				public static create(
					properties?: google.protobuf.UninterpretedOption.INamePart,
				): google.protobuf.UninterpretedOption.NamePart
				public static encode(
					message: google.protobuf.UninterpretedOption.INamePart,
					writer?: $protobuf.Writer,
				): $protobuf.Writer
				public static encodeDelimited(
					message: google.protobuf.UninterpretedOption.INamePart,
					writer?: $protobuf.Writer,
				): $protobuf.Writer
				public static decode(
					reader: $protobuf.Reader | Uint8Array,
					length?: number,
				): google.protobuf.UninterpretedOption.NamePart
				public static decodeDelimited(
					reader: $protobuf.Reader | Uint8Array,
				): google.protobuf.UninterpretedOption.NamePart
				public static verify(message: { [k: string]: any }): string | null
				public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption.NamePart
				public static toObject(
					message: google.protobuf.UninterpretedOption.NamePart,
					options?: $protobuf.IConversionOptions,
				): { [k: string]: any }
				public toJSON(): { [k: string]: any }
			}
		}

		interface ISourceCodeInfo {
			location?: google.protobuf.SourceCodeInfo.ILocation[] | null
		}

		class SourceCodeInfo implements ISourceCodeInfo {
			constructor(properties?: google.protobuf.ISourceCodeInfo)
			public location: google.protobuf.SourceCodeInfo.ILocation[]
			public static create(properties?: google.protobuf.ISourceCodeInfo): google.protobuf.SourceCodeInfo
			public static encode(message: google.protobuf.ISourceCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.ISourceCodeInfo,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.SourceCodeInfo
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.SourceCodeInfo
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo
			public static toObject(
				message: google.protobuf.SourceCodeInfo,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		namespace SourceCodeInfo {
			interface ILocation {
				path?: number[] | null
				span?: number[] | null
				leadingComments?: string | null
				trailingComments?: string | null
				leadingDetachedComments?: string[] | null
			}

			class Location implements ILocation {
				constructor(properties?: google.protobuf.SourceCodeInfo.ILocation)
				public path: number[]
				public span: number[]
				public leadingComments: string
				public trailingComments: string
				public leadingDetachedComments: string[]
				public static create(
					properties?: google.protobuf.SourceCodeInfo.ILocation,
				): google.protobuf.SourceCodeInfo.Location
				public static encode(
					message: google.protobuf.SourceCodeInfo.ILocation,
					writer?: $protobuf.Writer,
				): $protobuf.Writer
				public static encodeDelimited(
					message: google.protobuf.SourceCodeInfo.ILocation,
					writer?: $protobuf.Writer,
				): $protobuf.Writer
				public static decode(
					reader: $protobuf.Reader | Uint8Array,
					length?: number,
				): google.protobuf.SourceCodeInfo.Location
				public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.SourceCodeInfo.Location
				public static verify(message: { [k: string]: any }): string | null
				public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo.Location
				public static toObject(
					message: google.protobuf.SourceCodeInfo.Location,
					options?: $protobuf.IConversionOptions,
				): { [k: string]: any }
				public toJSON(): { [k: string]: any }
			}
		}

		interface IGeneratedCodeInfo {
			annotation?: google.protobuf.GeneratedCodeInfo.IAnnotation[] | null
		}

		class GeneratedCodeInfo implements IGeneratedCodeInfo {
			constructor(properties?: google.protobuf.IGeneratedCodeInfo)
			public annotation: google.protobuf.GeneratedCodeInfo.IAnnotation[]
			public static create(properties?: google.protobuf.IGeneratedCodeInfo): google.protobuf.GeneratedCodeInfo
			public static encode(message: google.protobuf.IGeneratedCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(
				message: google.protobuf.IGeneratedCodeInfo,
				writer?: $protobuf.Writer,
			): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.GeneratedCodeInfo
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.GeneratedCodeInfo
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo
			public static toObject(
				message: google.protobuf.GeneratedCodeInfo,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}

		namespace GeneratedCodeInfo {
			interface IAnnotation {
				path?: number[] | null
				sourceFile?: string | null
				begin?: number | null
				end?: number | null
			}

			class Annotation implements IAnnotation {
				constructor(properties?: google.protobuf.GeneratedCodeInfo.IAnnotation)
				public path: number[]
				public sourceFile: string
				public begin: number
				public end: number
				public static create(
					properties?: google.protobuf.GeneratedCodeInfo.IAnnotation,
				): google.protobuf.GeneratedCodeInfo.Annotation
				public static encode(
					message: google.protobuf.GeneratedCodeInfo.IAnnotation,
					writer?: $protobuf.Writer,
				): $protobuf.Writer
				public static encodeDelimited(
					message: google.protobuf.GeneratedCodeInfo.IAnnotation,
					writer?: $protobuf.Writer,
				): $protobuf.Writer
				public static decode(
					reader: $protobuf.Reader | Uint8Array,
					length?: number,
				): google.protobuf.GeneratedCodeInfo.Annotation
				public static decodeDelimited(
					reader: $protobuf.Reader | Uint8Array,
				): google.protobuf.GeneratedCodeInfo.Annotation
				public static verify(message: { [k: string]: any }): string | null
				public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo.Annotation
				public static toObject(
					message: google.protobuf.GeneratedCodeInfo.Annotation,
					options?: $protobuf.IConversionOptions,
				): { [k: string]: any }
				public toJSON(): { [k: string]: any }
			}
		}

		interface ITimestamp {
			seconds?: number | Long | null
			nanos?: number | null
		}

		class Timestamp implements ITimestamp {
			constructor(properties?: google.protobuf.ITimestamp)
			public seconds: number | Long
			public nanos: number
			public static create(properties?: google.protobuf.ITimestamp): google.protobuf.Timestamp
			public static encode(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer
			public static encodeDelimited(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer
			public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): google.protobuf.Timestamp
			public static decodeDelimited(reader: $protobuf.Reader | Uint8Array): google.protobuf.Timestamp
			public static verify(message: { [k: string]: any }): string | null
			public static fromObject(object: { [k: string]: any }): google.protobuf.Timestamp
			public static toObject(
				message: google.protobuf.Timestamp,
				options?: $protobuf.IConversionOptions,
			): { [k: string]: any }
			public toJSON(): { [k: string]: any }
		}
	}
}
