import * as $protobuf from "protobufjs";
export namespace berty {

    namespace chat {

        class ChatService extends $protobuf.rpc.Service {

            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): ChatService;
            public search(request: berty.chat.ISearchRequest, callback: berty.chat.ChatService.SearchCallback): void;
            public search(request: berty.chat.ISearchRequest): Promise<berty.chat.SearchReply>;
            public eventSubscribe(request: berty.chat.IEventSubscribeRequest, callback: berty.chat.ChatService.EventSubscribeCallback): void;
            public eventSubscribe(request: berty.chat.IEventSubscribeRequest): Promise<berty.chat.EventSubscribeReply>;
            public devEventSubscribe(request: berty.chat.IDevEventSubscribeRequest, callback: berty.chat.ChatService.DevEventSubscribeCallback): void;
            public devEventSubscribe(request: berty.chat.IDevEventSubscribeRequest): Promise<berty.chat.DevEventSubscribeReply>;
            public conversationList(request: berty.chat.IConversationListRequest, callback: berty.chat.ChatService.ConversationListCallback): void;
            public conversationList(request: berty.chat.IConversationListRequest): Promise<berty.chat.ConversationListReply>;
            public conversationGet(request: berty.chat.IConversationGetRequest, callback: berty.chat.ChatService.ConversationGetCallback): void;
            public conversationGet(request: berty.chat.IConversationGetRequest): Promise<berty.chat.ConversationGetReply>;
            public conversationCreate(request: berty.chat.IConversationCreateRequest, callback: berty.chat.ChatService.ConversationCreateCallback): void;
            public conversationCreate(request: berty.chat.IConversationCreateRequest): Promise<berty.chat.ConversationCreateReply>;
            public conversationUpdate(request: berty.chat.IConversationUpdateRequest, callback: berty.chat.ChatService.ConversationUpdateCallback): void;
            public conversationUpdate(request: berty.chat.IConversationUpdateRequest): Promise<berty.chat.ConversationUpdateReply>;
            public conversationMute(request: berty.chat.IConversationMuteRequest, callback: berty.chat.ChatService.ConversationMuteCallback): void;
            public conversationMute(request: berty.chat.IConversationMuteRequest): Promise<berty.chat.ConversationMuteReply>;
            public conversationLeave(request: berty.chat.IConversationLeaveRequest, callback: berty.chat.ChatService.ConversationLeaveCallback): void;
            public conversationLeave(request: berty.chat.IConversationLeaveRequest): Promise<berty.chat.ConversationLeaveReply>;
            public conversationErase(request: berty.chat.IConversationEraseRequest, callback: berty.chat.ChatService.ConversationEraseCallback): void;
            public conversationErase(request: berty.chat.IConversationEraseRequest): Promise<berty.chat.ConversationEraseReply>;
            public conversationInvitationSend(request: berty.chat.IConversationInvitationSendRequest, callback: berty.chat.ChatService.ConversationInvitationSendCallback): void;
            public conversationInvitationSend(request: berty.chat.IConversationInvitationSendRequest): Promise<berty.chat.ConversationInvitationSendReply>;
            public conversationInvitationAccept(request: berty.chat.IConversationInvitationAcceptRequest, callback: berty.chat.ChatService.ConversationInvitationAcceptCallback): void;
            public conversationInvitationAccept(request: berty.chat.IConversationInvitationAcceptRequest): Promise<berty.chat.ConversationInvitationAcceptReply>;
            public conversationInvitationDecline(request: berty.chat.IConversationInvitationDeclineRequest, callback: berty.chat.ChatService.ConversationInvitationDeclineCallback): void;
            public conversationInvitationDecline(request: berty.chat.IConversationInvitationDeclineRequest): Promise<berty.chat.ConversationInvitationDeclineReply>;
            public messageList(request: berty.chat.IMessageListRequest, callback: berty.chat.ChatService.MessageListCallback): void;
            public messageList(request: berty.chat.IMessageListRequest): Promise<berty.chat.MessageListReply>;
            public messageGet(request: berty.chat.IMessageGetRequest, callback: berty.chat.ChatService.MessageGetCallback): void;
            public messageGet(request: berty.chat.IMessageGetRequest): Promise<berty.chat.MessageGetReply>;
            public messageSend(request: berty.chat.IMessageSendRequest, callback: berty.chat.ChatService.MessageSendCallback): void;
            public messageSend(request: berty.chat.IMessageSendRequest): Promise<berty.chat.MessageSendReply>;
            public messageEdit(request: berty.chat.IMessageEditRequest, callback: berty.chat.ChatService.MessageEditCallback): void;
            public messageEdit(request: berty.chat.IMessageEditRequest): Promise<berty.chat.MessageEditReply>;
            public messageHide(request: berty.chat.IMessageHideRequest, callback: berty.chat.ChatService.MessageHideCallback): void;
            public messageHide(request: berty.chat.IMessageHideRequest): Promise<berty.chat.MessageHideReply>;
            public messageReact(request: berty.chat.IMessageReactRequest, callback: berty.chat.ChatService.MessageReactCallback): void;
            public messageReact(request: berty.chat.IMessageReactRequest): Promise<berty.chat.MessageReactReply>;
            public messageRead(request: berty.chat.IMessageReadRequest, callback: berty.chat.ChatService.MessageReadCallback): void;
            public messageRead(request: berty.chat.IMessageReadRequest): Promise<berty.chat.MessageReadReply>;
            public memberList(request: berty.chat.IMemberListRequest, callback: berty.chat.ChatService.MemberListCallback): void;
            public memberList(request: berty.chat.IMemberListRequest): Promise<berty.chat.MemberListReply>;
            public memberGet(request: berty.chat.IMemberGetRequest, callback: berty.chat.ChatService.MemberGetCallback): void;
            public memberGet(request: berty.chat.IMemberGetRequest): Promise<berty.chat.MemberGetReply>;
            public contactList(request: berty.chat.IContactListRequest, callback: berty.chat.ChatService.ContactListCallback): void;
            public contactList(request: berty.chat.IContactListRequest): Promise<berty.chat.ContactListReply>;
            public contactGet(request: berty.chat.IContactGetRequest, callback: berty.chat.ChatService.ContactGetCallback): void;
            public contactGet(request: berty.chat.IContactGetRequest): Promise<berty.chat.ContactGetReply>;
            public contactBlock(request: berty.chat.IContactBlockRequest, callback: berty.chat.ChatService.ContactBlockCallback): void;
            public contactBlock(request: berty.chat.IContactBlockRequest): Promise<berty.chat.ContactBlockReply>;
            public contactRemove(request: berty.chat.IContactRemoveRequest, callback: berty.chat.ChatService.ContactRemoveCallback): void;
            public contactRemove(request: berty.chat.IContactRemoveRequest): Promise<berty.chat.ContactRemoveReply>;
            public contactRequestSend(request: berty.chat.IContactRequestSendRequest, callback: berty.chat.ChatService.ContactRequestSendCallback): void;
            public contactRequestSend(request: berty.chat.IContactRequestSendRequest): Promise<berty.chat.ContactRequestSendReply>;
            public contactRequestAccept(request: berty.chat.IContactRequestAcceptRequest, callback: berty.chat.ChatService.ContactRequestAcceptCallback): void;
            public contactRequestAccept(request: berty.chat.IContactRequestAcceptRequest): Promise<berty.chat.ContactRequestAcceptReply>;
            public contactRequestDecline(request: berty.chat.IContactRequestDeclineRequest, callback: berty.chat.ChatService.ContactRequestDeclineCallback): void;
            public contactRequestDecline(request: berty.chat.IContactRequestDeclineRequest): Promise<berty.chat.ContactRequestDeclineReply>;
            public accountList(request: berty.chat.IAccountListRequest, callback: berty.chat.ChatService.AccountListCallback): void;
            public accountList(request: berty.chat.IAccountListRequest): Promise<berty.chat.AccountListRequest>;
            public accountGet(request: berty.chat.IAccountGetRequest, callback: berty.chat.ChatService.AccountGetCallback): void;
            public accountGet(request: berty.chat.IAccountGetRequest): Promise<berty.chat.AccountGetReply>;
            public accountCreate(request: berty.chat.IAccountCreateRequest, callback: berty.chat.ChatService.AccountCreateCallback): void;
            public accountCreate(request: berty.chat.IAccountCreateRequest): Promise<berty.chat.AccountCreateReply>;
            public accountUpdate(request: berty.chat.IAccountUpdateRequest, callback: berty.chat.ChatService.AccountUpdateCallback): void;
            public accountUpdate(request: berty.chat.IAccountUpdateRequest): Promise<berty.chat.AccountUpdateReply>;
            public accountOpen(request: berty.chat.IAccountOpenRequest, callback: berty.chat.ChatService.AccountOpenCallback): void;
            public accountOpen(request: berty.chat.IAccountOpenRequest): Promise<berty.chat.AccountOpenReply>;
            public accountClose(request: berty.chat.IAccountCloseRequest, callback: berty.chat.ChatService.AccountCloseCallback): void;
            public accountClose(request: berty.chat.IAccountCloseRequest): Promise<berty.chat.AccountCloseReply>;
            public accountRemove(request: berty.chat.IAccountRemoveRequest, callback: berty.chat.ChatService.AccountRemoveCallback): void;
            public accountRemove(request: berty.chat.IAccountRemoveRequest): Promise<berty.chat.AccountRemoveReply>;
            public accountPairingInvitationCreate(request: berty.chat.IAccountPairingInvitationCreateRequest, callback: berty.chat.ChatService.AccountPairingInvitationCreateCallback): void;
            public accountPairingInvitationCreate(request: berty.chat.IAccountPairingInvitationCreateRequest): Promise<berty.chat.AccountPairingInvitationCreateReply>;
            public accountRenewIncomingContactRequestLink(request: berty.chat.IAccountRenewIncomingContactRequestLinkRequest, callback: berty.chat.ChatService.AccountRenewIncomingContactRequestLinkCallback): void;
            public accountRenewIncomingContactRequestLink(request: berty.chat.IAccountRenewIncomingContactRequestLinkRequest): Promise<berty.chat.AccountRenewIncomingContactRequestLinkReply>;
        }

        namespace ChatService {

            type SearchCallback = (error: (Error|null), response?: berty.chat.SearchReply) => void;

            type EventSubscribeCallback = (error: (Error|null), response?: berty.chat.EventSubscribeReply) => void;

            type DevEventSubscribeCallback = (error: (Error|null), response?: berty.chat.DevEventSubscribeReply) => void;

            type ConversationListCallback = (error: (Error|null), response?: berty.chat.ConversationListReply) => void;

            type ConversationGetCallback = (error: (Error|null), response?: berty.chat.ConversationGetReply) => void;

            type ConversationCreateCallback = (error: (Error|null), response?: berty.chat.ConversationCreateReply) => void;

            type ConversationUpdateCallback = (error: (Error|null), response?: berty.chat.ConversationUpdateReply) => void;

            type ConversationMuteCallback = (error: (Error|null), response?: berty.chat.ConversationMuteReply) => void;

            type ConversationLeaveCallback = (error: (Error|null), response?: berty.chat.ConversationLeaveReply) => void;

            type ConversationEraseCallback = (error: (Error|null), response?: berty.chat.ConversationEraseReply) => void;

            type ConversationInvitationSendCallback = (error: (Error|null), response?: berty.chat.ConversationInvitationSendReply) => void;

            type ConversationInvitationAcceptCallback = (error: (Error|null), response?: berty.chat.ConversationInvitationAcceptReply) => void;

            type ConversationInvitationDeclineCallback = (error: (Error|null), response?: berty.chat.ConversationInvitationDeclineReply) => void;

            type MessageListCallback = (error: (Error|null), response?: berty.chat.MessageListReply) => void;

            type MessageGetCallback = (error: (Error|null), response?: berty.chat.MessageGetReply) => void;

            type MessageSendCallback = (error: (Error|null), response?: berty.chat.MessageSendReply) => void;

            type MessageEditCallback = (error: (Error|null), response?: berty.chat.MessageEditReply) => void;

            type MessageHideCallback = (error: (Error|null), response?: berty.chat.MessageHideReply) => void;

            type MessageReactCallback = (error: (Error|null), response?: berty.chat.MessageReactReply) => void;

            type MessageReadCallback = (error: (Error|null), response?: berty.chat.MessageReadReply) => void;

            type MemberListCallback = (error: (Error|null), response?: berty.chat.MemberListReply) => void;

            type MemberGetCallback = (error: (Error|null), response?: berty.chat.MemberGetReply) => void;

            type ContactListCallback = (error: (Error|null), response?: berty.chat.ContactListReply) => void;

            type ContactGetCallback = (error: (Error|null), response?: berty.chat.ContactGetReply) => void;

            type ContactBlockCallback = (error: (Error|null), response?: berty.chat.ContactBlockReply) => void;

            type ContactRemoveCallback = (error: (Error|null), response?: berty.chat.ContactRemoveReply) => void;

            type ContactRequestSendCallback = (error: (Error|null), response?: berty.chat.ContactRequestSendReply) => void;

            type ContactRequestAcceptCallback = (error: (Error|null), response?: berty.chat.ContactRequestAcceptReply) => void;

            type ContactRequestDeclineCallback = (error: (Error|null), response?: berty.chat.ContactRequestDeclineReply) => void;

            type AccountListCallback = (error: (Error|null), response?: berty.chat.AccountListRequest) => void;

            type AccountGetCallback = (error: (Error|null), response?: berty.chat.AccountGetReply) => void;

            type AccountCreateCallback = (error: (Error|null), response?: berty.chat.AccountCreateReply) => void;

            type AccountUpdateCallback = (error: (Error|null), response?: berty.chat.AccountUpdateReply) => void;

            type AccountOpenCallback = (error: (Error|null), response?: berty.chat.AccountOpenReply) => void;

            type AccountCloseCallback = (error: (Error|null), response?: berty.chat.AccountCloseReply) => void;

            type AccountRemoveCallback = (error: (Error|null), response?: berty.chat.AccountRemoveReply) => void;

            type AccountPairingInvitationCreateCallback = (error: (Error|null), response?: berty.chat.AccountPairingInvitationCreateReply) => void;

            type AccountRenewIncomingContactRequestLinkCallback = (error: (Error|null), response?: berty.chat.AccountRenewIncomingContactRequestLinkReply) => void;
        }

        interface ISearchRequest {
        }

        class SearchRequest implements ISearchRequest {

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

        interface IEventSubscribeRequest {
        }

        class EventSubscribeRequest implements IEventSubscribeRequest {

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

        interface IDevEventSubscribeRequest {
        }

        class DevEventSubscribeRequest implements IDevEventSubscribeRequest {

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

        interface IConversationListRequest {
            filter?: (berty.chatmodel.IConversation|null);
        }

        class ConversationListRequest implements IConversationListRequest {

            public filter?: (berty.chatmodel.IConversation|null);
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
            id: (number|Long);
        }

        class ConversationGetRequest implements IConversationGetRequest {

            public id: (number|Long);
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

        interface IConversationCreateRequest {
            id: (number|Long);
            title: (string);
            topic: (string);
            avatarUri: (string);
        }

        class ConversationCreateRequest implements IConversationCreateRequest {

            public id: (number|Long);
            public title: string;
            public topic: string;
            public avatarUri: string;
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

        interface IConversationGetReply {
            conversation?: (berty.chatmodel.IConversation|null);
        }

        class ConversationGetReply implements IConversationGetReply {

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

        interface IConversationUpdateRequest {
            id: (number|Long);
            title: (string);
            topic: (string);
            avatarUri: (string);
        }

        class ConversationUpdateRequest implements IConversationUpdateRequest {

            public id: (number|Long);
            public title: string;
            public topic: string;
            public avatarUri: string;
            public static create(properties?: berty.chat.IConversationUpdateRequest): berty.chat.ConversationUpdateRequest;
            public static encode(message: berty.chat.IConversationUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationUpdateRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationUpdateRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationUpdateRequest;
            public static toObject(message: berty.chat.ConversationUpdateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationUpdateReply {
        }

        class ConversationUpdateReply implements IConversationUpdateReply {

            public static create(properties?: berty.chat.IConversationUpdateReply): berty.chat.ConversationUpdateReply;
            public static encode(message: berty.chat.IConversationUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationUpdateReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationUpdateReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationUpdateReply;
            public static toObject(message: berty.chat.ConversationUpdateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationMuteRequest {
            policy: (berty.chatmodel.Member.MutePolicy);
        }

        class ConversationMuteRequest implements IConversationMuteRequest {

            public policy: berty.chatmodel.Member.MutePolicy;
            public static create(properties?: berty.chat.IConversationMuteRequest): berty.chat.ConversationMuteRequest;
            public static encode(message: berty.chat.IConversationMuteRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationMuteRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMuteRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMuteRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMuteRequest;
            public static toObject(message: berty.chat.ConversationMuteRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationMuteReply {
        }

        class ConversationMuteReply implements IConversationMuteReply {

            public static create(properties?: berty.chat.IConversationMuteReply): berty.chat.ConversationMuteReply;
            public static encode(message: berty.chat.IConversationMuteReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationMuteReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMuteReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMuteReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMuteReply;
            public static toObject(message: berty.chat.ConversationMuteReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationLeaveRequest {
            id: (number|Long);
        }

        class ConversationLeaveRequest implements IConversationLeaveRequest {

            public id: (number|Long);
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
            id: (number|Long);
        }

        class ConversationEraseRequest implements IConversationEraseRequest {

            public id: (number|Long);
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

        interface IConversationInvitationSendRequest {
            id: (number|Long);
            contactId: (number|Long);
        }

        class ConversationInvitationSendRequest implements IConversationInvitationSendRequest {

            public id: (number|Long);
            public contactId: (number|Long);
            public static create(properties?: berty.chat.IConversationInvitationSendRequest): berty.chat.ConversationInvitationSendRequest;
            public static encode(message: berty.chat.IConversationInvitationSendRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationInvitationSendRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationSendRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationSendRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationSendRequest;
            public static toObject(message: berty.chat.ConversationInvitationSendRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationInvitationSendReply {
        }

        class ConversationInvitationSendReply implements IConversationInvitationSendReply {

            public static create(properties?: berty.chat.IConversationInvitationSendReply): berty.chat.ConversationInvitationSendReply;
            public static encode(message: berty.chat.IConversationInvitationSendReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationInvitationSendReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationSendReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationSendReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationSendReply;
            public static toObject(message: berty.chat.ConversationInvitationSendReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationInvitationAcceptRequest {
            id: (number|Long);
            contactId: (number|Long);
        }

        class ConversationInvitationAcceptRequest implements IConversationInvitationAcceptRequest {

            public id: (number|Long);
            public contactId: (number|Long);
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

        interface IConversationInvitationDeclineRequest {
            conversationId: (number|Long);
        }

        class ConversationInvitationDeclineRequest implements IConversationInvitationDeclineRequest {

            public conversationId: (number|Long);
            public static create(properties?: berty.chat.IConversationInvitationDeclineRequest): berty.chat.ConversationInvitationDeclineRequest;
            public static encode(message: berty.chat.IConversationInvitationDeclineRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationInvitationDeclineRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationDeclineRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationDeclineRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationDeclineRequest;
            public static toObject(message: berty.chat.ConversationInvitationDeclineRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IConversationInvitationDeclineReply {
        }

        class ConversationInvitationDeclineReply implements IConversationInvitationDeclineReply {

            public static create(properties?: berty.chat.IConversationInvitationDeclineReply): berty.chat.ConversationInvitationDeclineReply;
            public static encode(message: berty.chat.IConversationInvitationDeclineReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationInvitationDeclineReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationDeclineReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationDeclineReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationDeclineReply;
            public static toObject(message: berty.chat.ConversationInvitationDeclineReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageListRequest {
            filter?: (berty.chatmodel.IMessage|null);
        }

        class MessageListRequest implements IMessageListRequest {

            public filter?: (berty.chatmodel.IMessage|null);
            public static create(properties?: berty.chat.IMessageListRequest): berty.chat.MessageListRequest;
            public static encode(message: berty.chat.IMessageListRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageListRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageListRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageListRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageListRequest;
            public static toObject(message: berty.chat.MessageListRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageListReply {
            message?: (berty.chatmodel.IMessage|null);
        }

        class MessageListReply implements IMessageListReply {

            public message?: (berty.chatmodel.IMessage|null);
            public static create(properties?: berty.chat.IMessageListReply): berty.chat.MessageListReply;
            public static encode(message: berty.chat.IMessageListReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageListReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageListReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageListReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageListReply;
            public static toObject(message: berty.chat.MessageListReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageGetRequest {
            id: (number|Long);
        }

        class MessageGetRequest implements IMessageGetRequest {

            public id: (number|Long);
            public static create(properties?: berty.chat.IMessageGetRequest): berty.chat.MessageGetRequest;
            public static encode(message: berty.chat.IMessageGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageGetRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageGetRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageGetRequest;
            public static toObject(message: berty.chat.MessageGetRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageGetReply {
            message?: (berty.chatmodel.IMessage|null);
        }

        class MessageGetReply implements IMessageGetReply {

            public message?: (berty.chatmodel.IMessage|null);
            public static create(properties?: berty.chat.IMessageGetReply): berty.chat.MessageGetReply;
            public static encode(message: berty.chat.IMessageGetReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageGetReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageGetReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageGetReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageGetReply;
            public static toObject(message: berty.chat.MessageGetReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageSendRequest {
            conversationId: (number|Long);
            kind: (berty.chatmodel.Message.Kind);
            body?: (berty.chatmodel.Message.IBody|null);
            attachments?: (berty.chatmodel.IAttachment[]|null);
        }

        class MessageSendRequest implements IMessageSendRequest {

            public conversationId: (number|Long);
            public kind: berty.chatmodel.Message.Kind;
            public body?: (berty.chatmodel.Message.IBody|null);
            public attachments: berty.chatmodel.IAttachment[];
            public static create(properties?: berty.chat.IMessageSendRequest): berty.chat.MessageSendRequest;
            public static encode(message: berty.chat.IMessageSendRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageSendRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageSendRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageSendRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageSendRequest;
            public static toObject(message: berty.chat.MessageSendRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageSendReply {
        }

        class MessageSendReply implements IMessageSendReply {

            public static create(properties?: berty.chat.IMessageSendReply): berty.chat.MessageSendReply;
            public static encode(message: berty.chat.IMessageSendReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageSendReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageSendReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageSendReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageSendReply;
            public static toObject(message: berty.chat.MessageSendReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageEditRequest {
            id: (number|Long);
            body?: (berty.chatmodel.Message.IBody|null);
        }

        class MessageEditRequest implements IMessageEditRequest {

            public id: (number|Long);
            public body?: (berty.chatmodel.Message.IBody|null);
            public static create(properties?: berty.chat.IMessageEditRequest): berty.chat.MessageEditRequest;
            public static encode(message: berty.chat.IMessageEditRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageEditRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageEditRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageEditRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageEditRequest;
            public static toObject(message: berty.chat.MessageEditRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageEditReply {
        }

        class MessageEditReply implements IMessageEditReply {

            public static create(properties?: berty.chat.IMessageEditReply): berty.chat.MessageEditReply;
            public static encode(message: berty.chat.IMessageEditReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageEditReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageEditReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageEditReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageEditReply;
            public static toObject(message: berty.chat.MessageEditReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageHideRequest {
            id: (number|Long);
        }

        class MessageHideRequest implements IMessageHideRequest {

            public id: (number|Long);
            public static create(properties?: berty.chat.IMessageHideRequest): berty.chat.MessageHideRequest;
            public static encode(message: berty.chat.IMessageHideRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageHideRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageHideRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageHideRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageHideRequest;
            public static toObject(message: berty.chat.MessageHideRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageHideReply {
        }

        class MessageHideReply implements IMessageHideReply {

            public static create(properties?: berty.chat.IMessageHideReply): berty.chat.MessageHideReply;
            public static encode(message: berty.chat.IMessageHideReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageHideReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageHideReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageHideReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageHideReply;
            public static toObject(message: berty.chat.MessageHideReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageReactRequest {
            id: (number|Long);
            emoji: (Uint8Array);
        }

        class MessageReactRequest implements IMessageReactRequest {

            public id: (number|Long);
            public emoji: Uint8Array;
            public static create(properties?: berty.chat.IMessageReactRequest): berty.chat.MessageReactRequest;
            public static encode(message: berty.chat.IMessageReactRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageReactRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageReactRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageReactRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageReactRequest;
            public static toObject(message: berty.chat.MessageReactRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageReactReply {
        }

        class MessageReactReply implements IMessageReactReply {

            public static create(properties?: berty.chat.IMessageReactReply): berty.chat.MessageReactReply;
            public static encode(message: berty.chat.IMessageReactReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageReactReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageReactReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageReactReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageReactReply;
            public static toObject(message: berty.chat.MessageReactReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageReadRequest {
            id: (number|Long);
        }

        class MessageReadRequest implements IMessageReadRequest {

            public id: (number|Long);
            public static create(properties?: berty.chat.IMessageReadRequest): berty.chat.MessageReadRequest;
            public static encode(message: berty.chat.IMessageReadRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageReadRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageReadRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageReadRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageReadRequest;
            public static toObject(message: berty.chat.MessageReadRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageReadReply {
        }

        class MessageReadReply implements IMessageReadReply {

            public static create(properties?: berty.chat.IMessageReadReply): berty.chat.MessageReadReply;
            public static encode(message: berty.chat.IMessageReadReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageReadReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageReadReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageReadReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageReadReply;
            public static toObject(message: berty.chat.MessageReadReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMemberListRequest {
            filter?: (berty.chatmodel.IMember|null);
        }

        class MemberListRequest implements IMemberListRequest {

            public filter?: (berty.chatmodel.IMember|null);
            public static create(properties?: berty.chat.IMemberListRequest): berty.chat.MemberListRequest;
            public static encode(message: berty.chat.IMemberListRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMemberListRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MemberListRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MemberListRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MemberListRequest;
            public static toObject(message: berty.chat.MemberListRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMemberListReply {
            member?: (berty.chatmodel.IMember|null);
        }

        class MemberListReply implements IMemberListReply {

            public member?: (berty.chatmodel.IMember|null);
            public static create(properties?: berty.chat.IMemberListReply): berty.chat.MemberListReply;
            public static encode(message: berty.chat.IMemberListReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMemberListReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MemberListReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MemberListReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MemberListReply;
            public static toObject(message: berty.chat.MemberListReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMemberGetRequest {
            id: (number|Long);
        }

        class MemberGetRequest implements IMemberGetRequest {

            public id: (number|Long);
            public static create(properties?: berty.chat.IMemberGetRequest): berty.chat.MemberGetRequest;
            public static encode(message: berty.chat.IMemberGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMemberGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MemberGetRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MemberGetRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MemberGetRequest;
            public static toObject(message: berty.chat.MemberGetRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMemberGetReply {
            member?: (berty.chatmodel.IMember|null);
        }

        class MemberGetReply implements IMemberGetReply {

            public member?: (berty.chatmodel.IMember|null);
            public static create(properties?: berty.chat.IMemberGetReply): berty.chat.MemberGetReply;
            public static encode(message: berty.chat.IMemberGetReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMemberGetReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MemberGetReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MemberGetReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MemberGetReply;
            public static toObject(message: berty.chat.MemberGetReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMemberUpdateRequest {
            id: (number|Long);
            name: (string);
            role: (berty.chatmodel.Member.Role);
        }

        class MemberUpdateRequest implements IMemberUpdateRequest {

            public id: (number|Long);
            public name: string;
            public role: berty.chatmodel.Member.Role;
            public static create(properties?: berty.chat.IMemberUpdateRequest): berty.chat.MemberUpdateRequest;
            public static encode(message: berty.chat.IMemberUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMemberUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MemberUpdateRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MemberUpdateRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MemberUpdateRequest;
            public static toObject(message: berty.chat.MemberUpdateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMemberUpdateReply {
        }

        class MemberUpdateReply implements IMemberUpdateReply {

            public static create(properties?: berty.chat.IMemberUpdateReply): berty.chat.MemberUpdateReply;
            public static encode(message: berty.chat.IMemberUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMemberUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MemberUpdateReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MemberUpdateReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MemberUpdateReply;
            public static toObject(message: berty.chat.MemberUpdateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactListRequest {
            filter?: (berty.chatmodel.IContact|null);
        }

        class ContactListRequest implements IContactListRequest {

            public filter?: (berty.chatmodel.IContact|null);
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
            contact?: (berty.chatmodel.IContact|null);
        }

        class ContactListReply implements IContactListReply {

            public contact?: (berty.chatmodel.IContact|null);
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
            id: (number|Long);
        }

        class ContactGetRequest implements IContactGetRequest {

            public id: (number|Long);
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
            contact?: (berty.chatmodel.IContact|null);
        }

        class ContactGetReply implements IContactGetReply {

            public contact?: (berty.chatmodel.IContact|null);
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

        interface IContactBlockRequest {
        }

        class ContactBlockRequest implements IContactBlockRequest {

            public static create(properties?: berty.chat.IContactBlockRequest): berty.chat.ContactBlockRequest;
            public static encode(message: berty.chat.IContactBlockRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactBlockRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactBlockRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactBlockRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactBlockRequest;
            public static toObject(message: berty.chat.ContactBlockRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactBlockReply {
        }

        class ContactBlockReply implements IContactBlockReply {

            public static create(properties?: berty.chat.IContactBlockReply): berty.chat.ContactBlockReply;
            public static encode(message: berty.chat.IContactBlockReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactBlockReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactBlockReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactBlockReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactBlockReply;
            public static toObject(message: berty.chat.ContactBlockReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactRemoveRequest {
            id: (number|Long);
        }

        class ContactRemoveRequest implements IContactRemoveRequest {

            public id: (number|Long);
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

        interface IContactRequestSendRequest {
            id: (number|Long);
        }

        class ContactRequestSendRequest implements IContactRequestSendRequest {

            public id: (number|Long);
            public static create(properties?: berty.chat.IContactRequestSendRequest): berty.chat.ContactRequestSendRequest;
            public static encode(message: berty.chat.IContactRequestSendRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRequestSendRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestSendRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestSendRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestSendRequest;
            public static toObject(message: berty.chat.ContactRequestSendRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactRequestSendReply {
        }

        class ContactRequestSendReply implements IContactRequestSendReply {

            public static create(properties?: berty.chat.IContactRequestSendReply): berty.chat.ContactRequestSendReply;
            public static encode(message: berty.chat.IContactRequestSendReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRequestSendReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestSendReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestSendReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestSendReply;
            public static toObject(message: berty.chat.ContactRequestSendReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactRequestAcceptRequest {
            id: (number|Long);
        }

        class ContactRequestAcceptRequest implements IContactRequestAcceptRequest {

            public id: (number|Long);
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

        interface IContactRequestDeclineRequest {
            id: (number|Long);
        }

        class ContactRequestDeclineRequest implements IContactRequestDeclineRequest {

            public id: (number|Long);
            public static create(properties?: berty.chat.IContactRequestDeclineRequest): berty.chat.ContactRequestDeclineRequest;
            public static encode(message: berty.chat.IContactRequestDeclineRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRequestDeclineRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestDeclineRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestDeclineRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestDeclineRequest;
            public static toObject(message: berty.chat.ContactRequestDeclineRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactRequestDeclineReply {
        }

        class ContactRequestDeclineReply implements IContactRequestDeclineReply {

            public static create(properties?: berty.chat.IContactRequestDeclineReply): berty.chat.ContactRequestDeclineReply;
            public static encode(message: berty.chat.IContactRequestDeclineReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRequestDeclineReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestDeclineReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestDeclineReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestDeclineReply;
            public static toObject(message: berty.chat.ContactRequestDeclineReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountListRequest {
        }

        class AccountListRequest implements IAccountListRequest {

            public static create(properties?: berty.chat.IAccountListRequest): berty.chat.AccountListRequest;
            public static encode(message: berty.chat.IAccountListRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountListRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountListRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountListRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountListRequest;
            public static toObject(message: berty.chat.AccountListRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountListReply {
            account?: (berty.chatmodel.IAccount|null);
        }

        class AccountListReply implements IAccountListReply {

            public account?: (berty.chatmodel.IAccount|null);
            public static create(properties?: berty.chat.IAccountListReply): berty.chat.AccountListReply;
            public static encode(message: berty.chat.IAccountListReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountListReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountListReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountListReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountListReply;
            public static toObject(message: berty.chat.AccountListReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountGetRequest {
            id: (number|Long);
        }

        class AccountGetRequest implements IAccountGetRequest {

            public id: (number|Long);
            public static create(properties?: berty.chat.IAccountGetRequest): berty.chat.AccountGetRequest;
            public static encode(message: berty.chat.IAccountGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountGetRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountGetRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountGetRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountGetRequest;
            public static toObject(message: berty.chat.AccountGetRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountGetReply {
            account?: (berty.chatmodel.IAccount|null);
        }

        class AccountGetReply implements IAccountGetReply {

            public account?: (berty.chatmodel.IAccount|null);
            public static create(properties?: berty.chat.IAccountGetReply): berty.chat.AccountGetReply;
            public static encode(message: berty.chat.IAccountGetReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountGetReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountGetReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountGetReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountGetReply;
            public static toObject(message: berty.chat.AccountGetReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountCreateRequest {
            name: (string);
        }

        class AccountCreateRequest implements IAccountCreateRequest {

            public name: string;
            public static create(properties?: berty.chat.IAccountCreateRequest): berty.chat.AccountCreateRequest;
            public static encode(message: berty.chat.IAccountCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountCreateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountCreateRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountCreateRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountCreateRequest;
            public static toObject(message: berty.chat.AccountCreateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountCreateReply {
        }

        class AccountCreateReply implements IAccountCreateReply {

            public static create(properties?: berty.chat.IAccountCreateReply): berty.chat.AccountCreateReply;
            public static encode(message: berty.chat.IAccountCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountCreateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountCreateReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountCreateReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountCreateReply;
            public static toObject(message: berty.chat.AccountCreateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountUpdateRequest {
            id: (number|Long);
            name: (string);
            statusEmoji: (string);
            statusText: (string);
        }

        class AccountUpdateRequest implements IAccountUpdateRequest {

            public id: (number|Long);
            public name: string;
            public statusEmoji: string;
            public statusText: string;
            public static create(properties?: berty.chat.IAccountUpdateRequest): berty.chat.AccountUpdateRequest;
            public static encode(message: berty.chat.IAccountUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountUpdateRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountUpdateRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountUpdateRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountUpdateRequest;
            public static toObject(message: berty.chat.AccountUpdateRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountUpdateReply {
        }

        class AccountUpdateReply implements IAccountUpdateReply {

            public static create(properties?: berty.chat.IAccountUpdateReply): berty.chat.AccountUpdateReply;
            public static encode(message: berty.chat.IAccountUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountUpdateReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountUpdateReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountUpdateReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountUpdateReply;
            public static toObject(message: berty.chat.AccountUpdateReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountOpenRequest {
            id: (number|Long);
            pin: (string);
        }

        class AccountOpenRequest implements IAccountOpenRequest {

            public id: (number|Long);
            public pin: string;
            public static create(properties?: berty.chat.IAccountOpenRequest): berty.chat.AccountOpenRequest;
            public static encode(message: berty.chat.IAccountOpenRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountOpenRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountOpenRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountOpenRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountOpenRequest;
            public static toObject(message: berty.chat.AccountOpenRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountOpenReply {
            token: (Uint8Array);
        }

        class AccountOpenReply implements IAccountOpenReply {

            public token: Uint8Array;
            public static create(properties?: berty.chat.IAccountOpenReply): berty.chat.AccountOpenReply;
            public static encode(message: berty.chat.IAccountOpenReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountOpenReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountOpenReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountOpenReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountOpenReply;
            public static toObject(message: berty.chat.AccountOpenReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountCloseRequest {
            id: (number|Long);
        }

        class AccountCloseRequest implements IAccountCloseRequest {

            public id: (number|Long);
            public static create(properties?: berty.chat.IAccountCloseRequest): berty.chat.AccountCloseRequest;
            public static encode(message: berty.chat.IAccountCloseRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountCloseRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountCloseRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountCloseRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountCloseRequest;
            public static toObject(message: berty.chat.AccountCloseRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountCloseReply {
        }

        class AccountCloseReply implements IAccountCloseReply {

            public static create(properties?: berty.chat.IAccountCloseReply): berty.chat.AccountCloseReply;
            public static encode(message: berty.chat.IAccountCloseReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountCloseReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountCloseReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountCloseReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountCloseReply;
            public static toObject(message: berty.chat.AccountCloseReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountRemoveRequest {
            id: (number|Long);
        }

        class AccountRemoveRequest implements IAccountRemoveRequest {

            public id: (number|Long);
            public static create(properties?: berty.chat.IAccountRemoveRequest): berty.chat.AccountRemoveRequest;
            public static encode(message: berty.chat.IAccountRemoveRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountRemoveRequest, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountRemoveRequest;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountRemoveRequest;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountRemoveRequest;
            public static toObject(message: berty.chat.AccountRemoveRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountRemoveReply {
        }

        class AccountRemoveReply implements IAccountRemoveReply {

            public static create(properties?: berty.chat.IAccountRemoveReply): berty.chat.AccountRemoveReply;
            public static encode(message: berty.chat.IAccountRemoveReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountRemoveReply, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountRemoveReply;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountRemoveReply;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountRemoveReply;
            public static toObject(message: berty.chat.AccountRemoveReply, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountPairingInvitationCreateRequest {
            id: (number|Long);
        }

        class AccountPairingInvitationCreateRequest implements IAccountPairingInvitationCreateRequest {

            public id: (number|Long);
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
            id: (number|Long);
        }

        class AccountRenewIncomingContactRequestLinkRequest implements IAccountRenewIncomingContactRequestLinkRequest {

            public id: (number|Long);
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
    }

    namespace chatmodel {

        interface IAccount {
            id: (number|Long);
            createdAt: (google.protobuf.ITimestamp);
            updatedAt: (google.protobuf.ITimestamp);
            contactId: (number|Long);
            myself?: (berty.chatmodel.IContact|null);
            contactRequestsEnabled: (boolean);
            contactRequestsLink: (string);
            hidden: (boolean);
            locked: (boolean);
        }

        class Account implements IAccount {

            public id: (number|Long);
            public createdAt: (google.protobuf.ITimestamp);
            public updatedAt: (google.protobuf.ITimestamp);
            public contactId: (number|Long);
            public myself?: (berty.chatmodel.IContact|null);
            public contactRequestsEnabled: boolean;
            public contactRequestsLink: string;
            public hidden: boolean;
            public locked: boolean;
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
            id: (number|Long);
            protocolId: (string);
            createdAt: (google.protobuf.ITimestamp);
            updatedAt: (google.protobuf.ITimestamp);
            title: (string);
            topic: (string);
            avatarUri: (string);
            kind: (berty.chatmodel.Conversation.Kind);
            badge: (number);
            messages?: (berty.chatmodel.IMessage[]|null);
            members?: (berty.chatmodel.IMember[]|null);
            lastMessageId: (number|Long);
            lastMessage?: (berty.chatmodel.IMessage|null);
        }

        class Conversation implements IConversation {

            public id: (number|Long);
            public protocolId: string;
            public createdAt: (google.protobuf.ITimestamp);
            public updatedAt: (google.protobuf.ITimestamp);
            public title: string;
            public topic: string;
            public avatarUri: string;
            public kind: berty.chatmodel.Conversation.Kind;
            public badge: number;
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
        }

        interface IMember {
            id: (number|Long);
            protocolId: (string);
            createdAt: (google.protobuf.ITimestamp);
            updatedAt: (google.protobuf.ITimestamp);
            readAt: (google.protobuf.ITimestamp);
            name: (string);
            avatarUri: (string);
            role: (berty.chatmodel.Member.Role);
            mutePolicy: (berty.chatmodel.Member.MutePolicy);
            conversationId: (number|Long);
            conversation?: (berty.chatmodel.IConversation|null);
            contactId: (number|Long);
            contact?: (berty.chatmodel.IContact|null);
        }

        class Member implements IMember {

            public id: (number|Long);
            public protocolId: string;
            public createdAt: (google.protobuf.ITimestamp);
            public updatedAt: (google.protobuf.ITimestamp);
            public readAt: (google.protobuf.ITimestamp);
            public name: string;
            public avatarUri: string;
            public role: berty.chatmodel.Member.Role;
            public mutePolicy: berty.chatmodel.Member.MutePolicy;
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

            enum MutePolicy {
                Nothing = 0,
                All = 1,
                Notifications = 2
            }
        }

        interface IMessage {
            id: (number|Long);
            protocolId: (string);
            createdAt: (google.protobuf.ITimestamp);
            updatedAt: (google.protobuf.ITimestamp);
            sentAt: (google.protobuf.ITimestamp);
            editedAt: (google.protobuf.ITimestamp);
            kind: (berty.chatmodel.Message.Kind);
            body?: (berty.chatmodel.Message.IBody|null);
            hidden: (boolean);
            state: (berty.chatmodel.Message.State);
            conversationId: (number|Long);
            conversation?: (berty.chatmodel.IConversation|null);
            memberId: (number|Long);
            member?: (berty.chatmodel.IMember|null);
            attachments?: (berty.chatmodel.IAttachment[]|null);
            reactions?: (berty.chatmodel.IReaction[]|null);
        }

        class Message implements IMessage {

            public id: (number|Long);
            public protocolId: string;
            public createdAt: (google.protobuf.ITimestamp);
            public updatedAt: (google.protobuf.ITimestamp);
            public sentAt: (google.protobuf.ITimestamp);
            public editedAt: (google.protobuf.ITimestamp);
            public kind: berty.chatmodel.Message.Kind;
            public body?: (berty.chatmodel.Message.IBody|null);
            public hidden: boolean;
            public state: berty.chatmodel.Message.State;
            public conversationId: (number|Long);
            public conversation?: (berty.chatmodel.IConversation|null);
            public memberId: (number|Long);
            public member?: (berty.chatmodel.IMember|null);
            public attachments: berty.chatmodel.IAttachment[];
            public reactions: berty.chatmodel.IReaction[];
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
                text: (string);
                memberJoined: (number|Long);
                memberLeft: (number|Long);
                memberSetTitleTo: (string);
            }

            class Body implements IBody {

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

            enum State {
                UnSent = 0,
                Sending = 1,
                Failed = 2,
                Retrying = 3,
                Sent = 4
            }
        }

        interface IAttachment {
            id: (number|Long);
            createdAt: (google.protobuf.ITimestamp);
            updatedAt: (google.protobuf.ITimestamp);
            uri: (string);
            contentType: (string);
            messageId: (number|Long);
            message?: (berty.chatmodel.IMessage|null);
        }

        class Attachment implements IAttachment {

            public id: (number|Long);
            public createdAt: (google.protobuf.ITimestamp);
            public updatedAt: (google.protobuf.ITimestamp);
            public uri: string;
            public contentType: string;
            public messageId: (number|Long);
            public message?: (berty.chatmodel.IMessage|null);
            public static create(properties?: berty.chatmodel.IAttachment): berty.chatmodel.Attachment;
            public static encode(message: berty.chatmodel.IAttachment, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chatmodel.IAttachment, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Attachment;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Attachment;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Attachment;
            public static toObject(message: berty.chatmodel.Attachment, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IReaction {
            id: (number|Long);
            createdAt: (google.protobuf.ITimestamp);
            updatedAt: (google.protobuf.ITimestamp);
            emoji: (Uint8Array);
            messageId: (number|Long);
            message?: (berty.chatmodel.IMessage|null);
            memberId: (number|Long);
            member?: (berty.chatmodel.IMember|null);
        }

        class Reaction implements IReaction {

            public id: (number|Long);
            public createdAt: (google.protobuf.ITimestamp);
            public updatedAt: (google.protobuf.ITimestamp);
            public emoji: Uint8Array;
            public messageId: (number|Long);
            public message?: (berty.chatmodel.IMessage|null);
            public memberId: (number|Long);
            public member?: (berty.chatmodel.IMember|null);
            public static create(properties?: berty.chatmodel.IReaction): berty.chatmodel.Reaction;
            public static encode(message: berty.chatmodel.IReaction, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chatmodel.IReaction, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chatmodel.Reaction;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chatmodel.Reaction;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chatmodel.Reaction;
            public static toObject(message: berty.chatmodel.Reaction, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContact {
            id: (number|Long);
            protocolId: (string);
            createdAt: (google.protobuf.ITimestamp);
            updatedAt: (google.protobuf.ITimestamp);
            seenAt: (google.protobuf.ITimestamp);
            name: (string);
            avatarUri: (string);
            statusEmoji: (Uint8Array);
            statusText: (string);
            kind: (berty.chatmodel.Contact.Kind);
            blocked: (boolean);
            devices?: (berty.chatmodel.IDevice[]|null);
        }

        class Contact implements IContact {

            public id: (number|Long);
            public protocolId: string;
            public createdAt: (google.protobuf.ITimestamp);
            public updatedAt: (google.protobuf.ITimestamp);
            public seenAt: (google.protobuf.ITimestamp);
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
            id: (number|Long);
            protocolId: (string);
            createdAt: (google.protobuf.ITimestamp);
            updatedAt: (google.protobuf.ITimestamp);
            lastSeenAt: (google.protobuf.ITimestamp);
            kind: (berty.chatmodel.Device.Kind);
            canRelay: (boolean);
            canBle: (boolean);
            contactId: (number|Long);
            contact?: (berty.chatmodel.IContact|null);
        }

        class Device implements IDevice {

            public id: (number|Long);
            public protocolId: string;
            public createdAt: (google.protobuf.ITimestamp);
            public updatedAt: (google.protobuf.ITimestamp);
            public lastSeenAt: (google.protobuf.ITimestamp);
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
            rules?: (google.api.IHttpRule[]|null);
        }

        class Http implements IHttp {

            public rules: google.api.IHttpRule[];
            public static create(properties?: google.api.IHttp): google.api.Http;
            public static encode(message: google.api.IHttp, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.api.IHttp, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.Http;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.Http;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.api.Http;
            public static toObject(message: google.api.Http, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IHttpRule {
            selector: (string);
            get: (string);
            put: (string);
            post: (string);
            "delete": (string);
            patch: (string);
            custom?: (google.api.ICustomHttpPattern|null);
            body: (string);
            additionalBindings?: (google.api.IHttpRule[]|null);
        }

        class HttpRule implements IHttpRule {

            public selector: string;
            public get: string;
            public put: string;
            public post: string;
            public delete: string;
            public patch: string;
            public custom?: (google.api.ICustomHttpPattern|null);
            public body: string;
            public additionalBindings: google.api.IHttpRule[];
            public pattern?: ("get"|"put"|"post"|"delete"|"patch"|"custom");
            public static create(properties?: google.api.IHttpRule): google.api.HttpRule;
            public static encode(message: google.api.IHttpRule, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.api.IHttpRule, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.HttpRule;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.HttpRule;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.api.HttpRule;
            public static toObject(message: google.api.HttpRule, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface ICustomHttpPattern {
            kind: (string);
            path: (string);
        }

        class CustomHttpPattern implements ICustomHttpPattern {

            public kind: string;
            public path: string;
            public static create(properties?: google.api.ICustomHttpPattern): google.api.CustomHttpPattern;
            public static encode(message: google.api.ICustomHttpPattern, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.api.ICustomHttpPattern, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.api.CustomHttpPattern;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.api.CustomHttpPattern;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.api.CustomHttpPattern;
            public static toObject(message: google.api.CustomHttpPattern, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }
    }

    namespace protobuf {

        interface IFileDescriptorSet {
            file?: (google.protobuf.IFileDescriptorProto[]|null);
        }

        class FileDescriptorSet implements IFileDescriptorSet {

            public file: google.protobuf.IFileDescriptorProto[];
            public static create(properties?: google.protobuf.IFileDescriptorSet): google.protobuf.FileDescriptorSet;
            public static encode(message: google.protobuf.IFileDescriptorSet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFileDescriptorSet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileDescriptorSet;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileDescriptorSet;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorSet;
            public static toObject(message: google.protobuf.FileDescriptorSet, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IFileDescriptorProto {
            name: (string);
            "package": (string);
            dependency: (string[]);
            publicDependency: (number[]);
            weakDependency: (number[]);
            messageType?: (google.protobuf.IDescriptorProto[]|null);
            enumType?: (google.protobuf.IEnumDescriptorProto[]|null);
            service?: (google.protobuf.IServiceDescriptorProto[]|null);
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);
            options?: (google.protobuf.IFileOptions|null);
            sourceCodeInfo?: (google.protobuf.ISourceCodeInfo|null);
            syntax: (string);
        }

        class FileDescriptorProto implements IFileDescriptorProto {

            public name: string;
            public package: string;
            public dependency: string[];
            public publicDependency: number[];
            public weakDependency: number[];
            public messageType: google.protobuf.IDescriptorProto[];
            public enumType: google.protobuf.IEnumDescriptorProto[];
            public service: google.protobuf.IServiceDescriptorProto[];
            public extension: google.protobuf.IFieldDescriptorProto[];
            public options?: (google.protobuf.IFileOptions|null);
            public sourceCodeInfo?: (google.protobuf.ISourceCodeInfo|null);
            public syntax: string;
            public static create(properties?: google.protobuf.IFileDescriptorProto): google.protobuf.FileDescriptorProto;
            public static encode(message: google.protobuf.IFileDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFileDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorProto;
            public static toObject(message: google.protobuf.FileDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IDescriptorProto {
            name: (string);
            field?: (google.protobuf.IFieldDescriptorProto[]|null);
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);
            nestedType?: (google.protobuf.IDescriptorProto[]|null);
            enumType?: (google.protobuf.IEnumDescriptorProto[]|null);
            extensionRange?: (google.protobuf.DescriptorProto.IExtensionRange[]|null);
            oneofDecl?: (google.protobuf.IOneofDescriptorProto[]|null);
            options?: (google.protobuf.IMessageOptions|null);
            reservedRange?: (google.protobuf.DescriptorProto.IReservedRange[]|null);
            reservedName: (string[]);
        }

        class DescriptorProto implements IDescriptorProto {

            public name: string;
            public field: google.protobuf.IFieldDescriptorProto[];
            public extension: google.protobuf.IFieldDescriptorProto[];
            public nestedType: google.protobuf.IDescriptorProto[];
            public enumType: google.protobuf.IEnumDescriptorProto[];
            public extensionRange: google.protobuf.DescriptorProto.IExtensionRange[];
            public oneofDecl: google.protobuf.IOneofDescriptorProto[];
            public options?: (google.protobuf.IMessageOptions|null);
            public reservedRange: google.protobuf.DescriptorProto.IReservedRange[];
            public reservedName: string[];
            public static create(properties?: google.protobuf.IDescriptorProto): google.protobuf.DescriptorProto;
            public static encode(message: google.protobuf.IDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto;
            public static toObject(message: google.protobuf.DescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace DescriptorProto {

            interface IExtensionRange {
                start: (number);
                end: (number);
                options?: (google.protobuf.IExtensionRangeOptions|null);
            }

            class ExtensionRange implements IExtensionRange {

                public start: number;
                public end: number;
                public options?: (google.protobuf.IExtensionRangeOptions|null);
                public static create(properties?: google.protobuf.DescriptorProto.IExtensionRange): google.protobuf.DescriptorProto.ExtensionRange;
                public static encode(message: google.protobuf.DescriptorProto.IExtensionRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.DescriptorProto.IExtensionRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto.ExtensionRange;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto.ExtensionRange;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ExtensionRange;
                public static toObject(message: google.protobuf.DescriptorProto.ExtensionRange, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReservedRange {
                start: (number);
                end: (number);
            }

            class ReservedRange implements IReservedRange {

                public start: number;
                public end: number;
                public static create(properties?: google.protobuf.DescriptorProto.IReservedRange): google.protobuf.DescriptorProto.ReservedRange;
                public static encode(message: google.protobuf.DescriptorProto.IReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.DescriptorProto.IReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto.ReservedRange;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto.ReservedRange;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ReservedRange;
                public static toObject(message: google.protobuf.DescriptorProto.ReservedRange, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IExtensionRangeOptions {
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        class ExtensionRangeOptions implements IExtensionRangeOptions {

            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IExtensionRangeOptions): google.protobuf.ExtensionRangeOptions;
            public static encode(message: google.protobuf.IExtensionRangeOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IExtensionRangeOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ExtensionRangeOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ExtensionRangeOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.ExtensionRangeOptions;
            public static toObject(message: google.protobuf.ExtensionRangeOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IFieldDescriptorProto {
            name: (string);
            number: (number);
            label: (google.protobuf.FieldDescriptorProto.Label);
            type: (google.protobuf.FieldDescriptorProto.Type);
            typeName: (string);
            extendee: (string);
            defaultValue: (string);
            oneofIndex: (number);
            jsonName: (string);
            options?: (google.protobuf.IFieldOptions|null);
        }

        class FieldDescriptorProto implements IFieldDescriptorProto {

            public name: string;
            public number: number;
            public label: google.protobuf.FieldDescriptorProto.Label;
            public type: google.protobuf.FieldDescriptorProto.Type;
            public typeName: string;
            public extendee: string;
            public defaultValue: string;
            public oneofIndex: number;
            public jsonName: string;
            public options?: (google.protobuf.IFieldOptions|null);
            public static create(properties?: google.protobuf.IFieldDescriptorProto): google.protobuf.FieldDescriptorProto;
            public static encode(message: google.protobuf.IFieldDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFieldDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FieldDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FieldDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FieldDescriptorProto;
            public static toObject(message: google.protobuf.FieldDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
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
                TYPE_SINT64 = 18
            }

            enum Label {
                LABEL_OPTIONAL = 1,
                LABEL_REQUIRED = 2,
                LABEL_REPEATED = 3
            }
        }

        interface IOneofDescriptorProto {
            name: (string);
            options?: (google.protobuf.IOneofOptions|null);
        }

        class OneofDescriptorProto implements IOneofDescriptorProto {

            public name: string;
            public options?: (google.protobuf.IOneofOptions|null);
            public static create(properties?: google.protobuf.IOneofDescriptorProto): google.protobuf.OneofDescriptorProto;
            public static encode(message: google.protobuf.IOneofDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IOneofDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.OneofDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.OneofDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.OneofDescriptorProto;
            public static toObject(message: google.protobuf.OneofDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IEnumDescriptorProto {
            name: (string);
            value?: (google.protobuf.IEnumValueDescriptorProto[]|null);
            options?: (google.protobuf.IEnumOptions|null);
            reservedRange?: (google.protobuf.EnumDescriptorProto.IEnumReservedRange[]|null);
            reservedName: (string[]);
        }

        class EnumDescriptorProto implements IEnumDescriptorProto {

            public name: string;
            public value: google.protobuf.IEnumValueDescriptorProto[];
            public options?: (google.protobuf.IEnumOptions|null);
            public reservedRange: google.protobuf.EnumDescriptorProto.IEnumReservedRange[];
            public reservedName: string[];
            public static create(properties?: google.protobuf.IEnumDescriptorProto): google.protobuf.EnumDescriptorProto;
            public static encode(message: google.protobuf.IEnumDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IEnumDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumDescriptorProto;
            public static toObject(message: google.protobuf.EnumDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace EnumDescriptorProto {

            interface IEnumReservedRange {
                start: (number);
                end: (number);
            }

            class EnumReservedRange implements IEnumReservedRange {

                public start: number;
                public end: number;
                public static create(properties?: google.protobuf.EnumDescriptorProto.IEnumReservedRange): google.protobuf.EnumDescriptorProto.EnumReservedRange;
                public static encode(message: google.protobuf.EnumDescriptorProto.IEnumReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.EnumDescriptorProto.IEnumReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumDescriptorProto.EnumReservedRange;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumDescriptorProto.EnumReservedRange;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.EnumDescriptorProto.EnumReservedRange;
                public static toObject(message: google.protobuf.EnumDescriptorProto.EnumReservedRange, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IEnumValueDescriptorProto {
            name: (string);
            number: (number);
            options?: (google.protobuf.IEnumValueOptions|null);
        }

        class EnumValueDescriptorProto implements IEnumValueDescriptorProto {

            public name: string;
            public number: number;
            public options?: (google.protobuf.IEnumValueOptions|null);
            public static create(properties?: google.protobuf.IEnumValueDescriptorProto): google.protobuf.EnumValueDescriptorProto;
            public static encode(message: google.protobuf.IEnumValueDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IEnumValueDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumValueDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumValueDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueDescriptorProto;
            public static toObject(message: google.protobuf.EnumValueDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IServiceDescriptorProto {
            name: (string);
            method?: (google.protobuf.IMethodDescriptorProto[]|null);
            options?: (google.protobuf.IServiceOptions|null);
        }

        class ServiceDescriptorProto implements IServiceDescriptorProto {

            public name: string;
            public method: google.protobuf.IMethodDescriptorProto[];
            public options?: (google.protobuf.IServiceOptions|null);
            public static create(properties?: google.protobuf.IServiceDescriptorProto): google.protobuf.ServiceDescriptorProto;
            public static encode(message: google.protobuf.IServiceDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IServiceDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ServiceDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ServiceDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceDescriptorProto;
            public static toObject(message: google.protobuf.ServiceDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMethodDescriptorProto {
            name: (string);
            inputType: (string);
            outputType: (string);
            options?: (google.protobuf.IMethodOptions|null);
            clientStreaming: (boolean);
            serverStreaming: (boolean);
        }

        class MethodDescriptorProto implements IMethodDescriptorProto {

            public name: string;
            public inputType: string;
            public outputType: string;
            public options?: (google.protobuf.IMethodOptions|null);
            public clientStreaming: boolean;
            public serverStreaming: boolean;
            public static create(properties?: google.protobuf.IMethodDescriptorProto): google.protobuf.MethodDescriptorProto;
            public static encode(message: google.protobuf.IMethodDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IMethodDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MethodDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MethodDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.MethodDescriptorProto;
            public static toObject(message: google.protobuf.MethodDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IFileOptions {
            javaPackage: (string);
            javaOuterClassname: (string);
            javaMultipleFiles: (boolean);
            javaGenerateEqualsAndHash: (boolean);
            javaStringCheckUtf8: (boolean);
            optimizeFor: (google.protobuf.FileOptions.OptimizeMode);
            goPackage: (string);
            ccGenericServices: (boolean);
            javaGenericServices: (boolean);
            pyGenericServices: (boolean);
            phpGenericServices: (boolean);
            deprecated: (boolean);
            ccEnableArenas: (boolean);
            objcClassPrefix: (string);
            csharpNamespace: (string);
            swiftPrefix: (string);
            phpClassPrefix: (string);
            phpNamespace: (string);
            phpMetadataNamespace: (string);
            rubyPackage: (string);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.goprotoGettersAll": (boolean);
            ".gogoproto.goprotoEnumPrefixAll": (boolean);
            ".gogoproto.goprotoStringerAll": (boolean);
            ".gogoproto.verboseEqualAll": (boolean);
            ".gogoproto.faceAll": (boolean);
            ".gogoproto.gostringAll": (boolean);
            ".gogoproto.populateAll": (boolean);
            ".gogoproto.stringerAll": (boolean);
            ".gogoproto.onlyoneAll": (boolean);
            ".gogoproto.equalAll": (boolean);
            ".gogoproto.descriptionAll": (boolean);
            ".gogoproto.testgenAll": (boolean);
            ".gogoproto.benchgenAll": (boolean);
            ".gogoproto.marshalerAll": (boolean);
            ".gogoproto.unmarshalerAll": (boolean);
            ".gogoproto.stableMarshalerAll": (boolean);
            ".gogoproto.sizerAll": (boolean);
            ".gogoproto.goprotoEnumStringerAll": (boolean);
            ".gogoproto.enumStringerAll": (boolean);
            ".gogoproto.unsafeMarshalerAll": (boolean);
            ".gogoproto.unsafeUnmarshalerAll": (boolean);
            ".gogoproto.goprotoExtensionsMapAll": (boolean);
            ".gogoproto.goprotoUnrecognizedAll": (boolean);
            ".gogoproto.gogoprotoImport": (boolean);
            ".gogoproto.protosizerAll": (boolean);
            ".gogoproto.compareAll": (boolean);
            ".gogoproto.typedeclAll": (boolean);
            ".gogoproto.enumdeclAll": (boolean);
            ".gogoproto.goprotoRegistration": (boolean);
            ".gogoproto.messagenameAll": (boolean);
            ".gogoproto.goprotoSizecacheAll": (boolean);
            ".gogoproto.goprotoUnkeyedAll": (boolean);
        }

        class FileOptions implements IFileOptions {

            public javaPackage: string;
            public javaOuterClassname: string;
            public javaMultipleFiles: boolean;
            public javaGenerateEqualsAndHash: boolean;
            public javaStringCheckUtf8: boolean;
            public optimizeFor: google.protobuf.FileOptions.OptimizeMode;
            public goPackage: string;
            public ccGenericServices: boolean;
            public javaGenericServices: boolean;
            public pyGenericServices: boolean;
            public phpGenericServices: boolean;
            public deprecated: boolean;
            public ccEnableArenas: boolean;
            public objcClassPrefix: string;
            public csharpNamespace: string;
            public swiftPrefix: string;
            public phpClassPrefix: string;
            public phpNamespace: string;
            public phpMetadataNamespace: string;
            public rubyPackage: string;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IFileOptions): google.protobuf.FileOptions;
            public static encode(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileOptions;
            public static toObject(message: google.protobuf.FileOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace FileOptions {

            enum OptimizeMode {
                SPEED = 1,
                CODE_SIZE = 2,
                LITE_RUNTIME = 3
            }
        }

        interface IMessageOptions {
            messageSetWireFormat: (boolean);
            noStandardDescriptorAccessor: (boolean);
            deprecated: (boolean);
            mapEntry: (boolean);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.goprotoGetters": (boolean);
            ".gogoproto.goprotoStringer": (boolean);
            ".gogoproto.verboseEqual": (boolean);
            ".gogoproto.face": (boolean);
            ".gogoproto.gostring": (boolean);
            ".gogoproto.populate": (boolean);
            ".gogoproto.stringer": (boolean);
            ".gogoproto.onlyone": (boolean);
            ".gogoproto.equal": (boolean);
            ".gogoproto.description": (boolean);
            ".gogoproto.testgen": (boolean);
            ".gogoproto.benchgen": (boolean);
            ".gogoproto.marshaler": (boolean);
            ".gogoproto.unmarshaler": (boolean);
            ".gogoproto.stableMarshaler": (boolean);
            ".gogoproto.sizer": (boolean);
            ".gogoproto.unsafeMarshaler": (boolean);
            ".gogoproto.unsafeUnmarshaler": (boolean);
            ".gogoproto.goprotoExtensionsMap": (boolean);
            ".gogoproto.goprotoUnrecognized": (boolean);
            ".gogoproto.protosizer": (boolean);
            ".gogoproto.compare": (boolean);
            ".gogoproto.typedecl": (boolean);
            ".gogoproto.messagename": (boolean);
            ".gogoproto.goprotoSizecache": (boolean);
            ".gogoproto.goprotoUnkeyed": (boolean);
        }

        class MessageOptions implements IMessageOptions {

            public messageSetWireFormat: boolean;
            public noStandardDescriptorAccessor: boolean;
            public deprecated: boolean;
            public mapEntry: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IMessageOptions): google.protobuf.MessageOptions;
            public static encode(message: google.protobuf.IMessageOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IMessageOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MessageOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MessageOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.MessageOptions;
            public static toObject(message: google.protobuf.MessageOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IFieldOptions {
            ctype: (google.protobuf.FieldOptions.CType);
            packed: (boolean);
            jstype: (google.protobuf.FieldOptions.JSType);
            lazy: (boolean);
            deprecated: (boolean);
            weak: (boolean);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.nullable": (boolean);
            ".gogoproto.embed": (boolean);
            ".gogoproto.customtype": (string);
            ".gogoproto.customname": (string);
            ".gogoproto.jsontag": (string);
            ".gogoproto.moretags": (string);
            ".gogoproto.casttype": (string);
            ".gogoproto.castkey": (string);
            ".gogoproto.castvalue": (string);
            ".gogoproto.stdtime": (boolean);
            ".gogoproto.stdduration": (boolean);
            ".gogoproto.wktpointer": (boolean);
        }

        class FieldOptions implements IFieldOptions {

            public ctype: google.protobuf.FieldOptions.CType;
            public packed: boolean;
            public jstype: google.protobuf.FieldOptions.JSType;
            public lazy: boolean;
            public deprecated: boolean;
            public weak: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IFieldOptions): google.protobuf.FieldOptions;
            public static encode(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FieldOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FieldOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FieldOptions;
            public static toObject(message: google.protobuf.FieldOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace FieldOptions {

            enum CType {
                STRING = 0,
                CORD = 1,
                STRING_PIECE = 2
            }

            enum JSType {
                JS_NORMAL = 0,
                JS_STRING = 1,
                JS_NUMBER = 2
            }
        }

        interface IOneofOptions {
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        class OneofOptions implements IOneofOptions {

            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IOneofOptions): google.protobuf.OneofOptions;
            public static encode(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.OneofOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.OneofOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.OneofOptions;
            public static toObject(message: google.protobuf.OneofOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IEnumOptions {
            allowAlias: (boolean);
            deprecated: (boolean);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.goprotoEnumPrefix": (boolean);
            ".gogoproto.goprotoEnumStringer": (boolean);
            ".gogoproto.enumStringer": (boolean);
            ".gogoproto.enumCustomname": (string);
            ".gogoproto.enumdecl": (boolean);
        }

        class EnumOptions implements IEnumOptions {

            public allowAlias: boolean;
            public deprecated: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IEnumOptions): google.protobuf.EnumOptions;
            public static encode(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumOptions;
            public static toObject(message: google.protobuf.EnumOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IEnumValueOptions {
            deprecated: (boolean);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.enumvalueCustomname": (string);
        }

        class EnumValueOptions implements IEnumValueOptions {

            public deprecated: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IEnumValueOptions): google.protobuf.EnumValueOptions;
            public static encode(message: google.protobuf.IEnumValueOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IEnumValueOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumValueOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumValueOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueOptions;
            public static toObject(message: google.protobuf.EnumValueOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IServiceOptions {
            deprecated: (boolean);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        class ServiceOptions implements IServiceOptions {

            public deprecated: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IServiceOptions): google.protobuf.ServiceOptions;
            public static encode(message: google.protobuf.IServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ServiceOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ServiceOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceOptions;
            public static toObject(message: google.protobuf.ServiceOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMethodOptions {
            deprecated: (boolean);
            idempotencyLevel?: (google.protobuf.MethodOptions.IdempotencyLevel|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".google.api.http"?: (google.api.IHttpRule|null);
        }

        class MethodOptions implements IMethodOptions {

            public deprecated: boolean;
            public idempotencyLevel: google.protobuf.MethodOptions.IdempotencyLevel;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IMethodOptions): google.protobuf.MethodOptions;
            public static encode(message: google.protobuf.IMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MethodOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MethodOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.MethodOptions;
            public static toObject(message: google.protobuf.MethodOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MethodOptions {

            enum IdempotencyLevel {
                IDEMPOTENCY_UNKNOWN = 0,
                NO_SIDE_EFFECTS = 1,
                IDEMPOTENT = 2
            }
        }

        interface IUninterpretedOption {
            name?: (google.protobuf.UninterpretedOption.INamePart[]|null);
            identifierValue: (string);
            positiveIntValue: (number|Long);
            negativeIntValue: (number|Long);
            doubleValue: (number);
            stringValue: (Uint8Array);
            aggregateValue: (string);
        }

        class UninterpretedOption implements IUninterpretedOption {

            public name: google.protobuf.UninterpretedOption.INamePart[];
            public identifierValue: string;
            public positiveIntValue: (number|Long);
            public negativeIntValue: (number|Long);
            public doubleValue: number;
            public stringValue: Uint8Array;
            public aggregateValue: string;
            public static create(properties?: google.protobuf.IUninterpretedOption): google.protobuf.UninterpretedOption;
            public static encode(message: google.protobuf.IUninterpretedOption, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IUninterpretedOption, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UninterpretedOption;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UninterpretedOption;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption;
            public static toObject(message: google.protobuf.UninterpretedOption, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace UninterpretedOption {

            interface INamePart {
                namePart: string;
                isExtension: boolean;
            }

            class NamePart implements INamePart {

                public namePart: string;
                public isExtension: boolean;
                public static create(properties?: google.protobuf.UninterpretedOption.INamePart): google.protobuf.UninterpretedOption.NamePart;
                public static encode(message: google.protobuf.UninterpretedOption.INamePart, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.UninterpretedOption.INamePart, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UninterpretedOption.NamePart;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UninterpretedOption.NamePart;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption.NamePart;
                public static toObject(message: google.protobuf.UninterpretedOption.NamePart, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface ISourceCodeInfo {
            location?: (google.protobuf.SourceCodeInfo.ILocation[]|null);
        }

        class SourceCodeInfo implements ISourceCodeInfo {

            public location: google.protobuf.SourceCodeInfo.ILocation[];
            public static create(properties?: google.protobuf.ISourceCodeInfo): google.protobuf.SourceCodeInfo;
            public static encode(message: google.protobuf.ISourceCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.ISourceCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.SourceCodeInfo;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.SourceCodeInfo;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo;
            public static toObject(message: google.protobuf.SourceCodeInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace SourceCodeInfo {

            interface ILocation {
                path: (number[]);
                span: (number[]);
                leadingComments: (string);
                trailingComments: (string);
                leadingDetachedComments: (string[]);
            }

            class Location implements ILocation {

                public path: number[];
                public span: number[];
                public leadingComments: string;
                public trailingComments: string;
                public leadingDetachedComments: string[];
                public static create(properties?: google.protobuf.SourceCodeInfo.ILocation): google.protobuf.SourceCodeInfo.Location;
                public static encode(message: google.protobuf.SourceCodeInfo.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.SourceCodeInfo.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.SourceCodeInfo.Location;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.SourceCodeInfo.Location;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo.Location;
                public static toObject(message: google.protobuf.SourceCodeInfo.Location, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGeneratedCodeInfo {
            annotation?: (google.protobuf.GeneratedCodeInfo.IAnnotation[]|null);
        }

        class GeneratedCodeInfo implements IGeneratedCodeInfo {

            public annotation: google.protobuf.GeneratedCodeInfo.IAnnotation[];
            public static create(properties?: google.protobuf.IGeneratedCodeInfo): google.protobuf.GeneratedCodeInfo;
            public static encode(message: google.protobuf.IGeneratedCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IGeneratedCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.GeneratedCodeInfo;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.GeneratedCodeInfo;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo;
            public static toObject(message: google.protobuf.GeneratedCodeInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GeneratedCodeInfo {

            interface IAnnotation {
                path: (number[]);
                sourceFile: (string);
                begin: (number);
                end: (number);
            }

            class Annotation implements IAnnotation {

                public path: number[];
                public sourceFile: string;
                public begin: number;
                public end: number;
                public static create(properties?: google.protobuf.GeneratedCodeInfo.IAnnotation): google.protobuf.GeneratedCodeInfo.Annotation;
                public static encode(message: google.protobuf.GeneratedCodeInfo.IAnnotation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.GeneratedCodeInfo.IAnnotation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.GeneratedCodeInfo.Annotation;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.GeneratedCodeInfo.Annotation;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo.Annotation;
                public static toObject(message: google.protobuf.GeneratedCodeInfo.Annotation, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface ITimestamp {
            seconds: (number|Long);
            nanos: (number);
        }

        class Timestamp implements ITimestamp {

            public seconds: (number|Long);
            public nanos: number;
            public static create(properties?: google.protobuf.ITimestamp): google.protobuf.Timestamp;
            public static encode(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.ITimestamp, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Timestamp;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Timestamp;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.Timestamp;
            public static toObject(message: google.protobuf.Timestamp, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }
    }
}
