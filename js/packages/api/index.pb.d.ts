import * as $protobuf from "protobufjs";
export namespace berty {

    namespace chat {

        class ChatService extends $protobuf.rpc.Service {

            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): ChatService;
            public search(request: berty.chat.Search.IRequest, callback: berty.chat.ChatService.SearchCallback): void;
            public search(request: berty.chat.Search.IRequest): Promise<berty.chat.Search.Reply>;
            public eventSubscribe(request: berty.chat.EventSubscribe.IRequest, callback: berty.chat.ChatService.EventSubscribeCallback): void;
            public eventSubscribe(request: berty.chat.EventSubscribe.IRequest): Promise<berty.chat.EventSubscribe.Reply>;
            public devEventSubscribe(request: berty.chat.DevEventSubscribe.IRequest, callback: berty.chat.ChatService.DevEventSubscribeCallback): void;
            public devEventSubscribe(request: berty.chat.DevEventSubscribe.IRequest): Promise<berty.chat.DevEventSubscribe.Reply>;
            public conversationList(request: berty.chat.ConversationList.IRequest, callback: berty.chat.ChatService.ConversationListCallback): void;
            public conversationList(request: berty.chat.ConversationList.IRequest): Promise<berty.chat.ConversationList.Reply>;
            public conversationGet(request: berty.chat.ConversationGet.IRequest, callback: berty.chat.ChatService.ConversationGetCallback): void;
            public conversationGet(request: berty.chat.ConversationGet.IRequest): Promise<berty.chat.ConversationGet.Reply>;
            public conversationCreate(request: berty.chat.ConversationCreate.IRequest, callback: berty.chat.ChatService.ConversationCreateCallback): void;
            public conversationCreate(request: berty.chat.ConversationCreate.IRequest): Promise<berty.chat.ConversationCreate.Reply>;
            public conversationUpdate(request: berty.chat.ConversationUpdate.IRequest, callback: berty.chat.ChatService.ConversationUpdateCallback): void;
            public conversationUpdate(request: berty.chat.ConversationUpdate.IRequest): Promise<berty.chat.ConversationUpdate.Reply>;
            public conversationMute(request: berty.chat.ConversationMute.IRequest, callback: berty.chat.ChatService.ConversationMuteCallback): void;
            public conversationMute(request: berty.chat.ConversationMute.IRequest): Promise<berty.chat.ConversationMute.Reply>;
            public conversationLeave(request: berty.chat.ConversationLeave.IRequest, callback: berty.chat.ChatService.ConversationLeaveCallback): void;
            public conversationLeave(request: berty.chat.ConversationLeave.IRequest): Promise<berty.chat.ConversationLeave.Reply>;
            public conversationErase(request: berty.chat.ConversationErase.IRequest, callback: berty.chat.ChatService.ConversationEraseCallback): void;
            public conversationErase(request: berty.chat.ConversationErase.IRequest): Promise<berty.chat.ConversationErase.Reply>;
            public conversationInvitationSend(request: berty.chat.ConversationInvitationSend.IRequest, callback: berty.chat.ChatService.ConversationInvitationSendCallback): void;
            public conversationInvitationSend(request: berty.chat.ConversationInvitationSend.IRequest): Promise<berty.chat.ConversationInvitationSend.Reply>;
            public conversationInvitationAccept(request: berty.chat.ConversationInvitationAccept.IRequest, callback: berty.chat.ChatService.ConversationInvitationAcceptCallback): void;
            public conversationInvitationAccept(request: berty.chat.ConversationInvitationAccept.IRequest): Promise<berty.chat.ConversationInvitationAccept.Reply>;
            public conversationInvitationDecline(request: berty.chat.ConversationInvitationDecline.IRequest, callback: berty.chat.ChatService.ConversationInvitationDeclineCallback): void;
            public conversationInvitationDecline(request: berty.chat.ConversationInvitationDecline.IRequest): Promise<berty.chat.ConversationInvitationDecline.Reply>;
            public messageList(request: berty.chat.MessageList.IRequest, callback: berty.chat.ChatService.MessageListCallback): void;
            public messageList(request: berty.chat.MessageList.IRequest): Promise<berty.chat.MessageList.Reply>;
            public messageGet(request: berty.chat.MessageGet.IRequest, callback: berty.chat.ChatService.MessageGetCallback): void;
            public messageGet(request: berty.chat.MessageGet.IRequest): Promise<berty.chat.MessageGet.Reply>;
            public messageSend(request: berty.chat.MessageSend.IRequest, callback: berty.chat.ChatService.MessageSendCallback): void;
            public messageSend(request: berty.chat.MessageSend.IRequest): Promise<berty.chat.MessageSend.Reply>;
            public messageEdit(request: berty.chat.MessageEdit.IRequest, callback: berty.chat.ChatService.MessageEditCallback): void;
            public messageEdit(request: berty.chat.MessageEdit.IRequest): Promise<berty.chat.MessageEdit.Reply>;
            public messageHide(request: berty.chat.MessageHide.IRequest, callback: berty.chat.ChatService.MessageHideCallback): void;
            public messageHide(request: berty.chat.MessageHide.IRequest): Promise<berty.chat.MessageHide.Reply>;
            public messageReact(request: berty.chat.MessageReact.IRequest, callback: berty.chat.ChatService.MessageReactCallback): void;
            public messageReact(request: berty.chat.MessageReact.IRequest): Promise<berty.chat.MessageReact.Reply>;
            public messageRead(request: berty.chat.MessageRead.IRequest, callback: berty.chat.ChatService.MessageReadCallback): void;
            public messageRead(request: berty.chat.MessageRead.IRequest): Promise<berty.chat.MessageRead.Reply>;
            public memberList(request: berty.chat.MemberList.IRequest, callback: berty.chat.ChatService.MemberListCallback): void;
            public memberList(request: berty.chat.MemberList.IRequest): Promise<berty.chat.MemberList.Reply>;
            public memberGet(request: berty.chat.MemberGet.IRequest, callback: berty.chat.ChatService.MemberGetCallback): void;
            public memberGet(request: berty.chat.MemberGet.IRequest): Promise<berty.chat.MemberGet.Reply>;
            public contactList(request: berty.chat.ContactList.IRequest, callback: berty.chat.ChatService.ContactListCallback): void;
            public contactList(request: berty.chat.ContactList.IRequest): Promise<berty.chat.ContactList.Reply>;
            public contactGet(request: berty.chat.ContactGet.IRequest, callback: berty.chat.ChatService.ContactGetCallback): void;
            public contactGet(request: berty.chat.ContactGet.IRequest): Promise<berty.chat.ContactGet.Reply>;
            public contactBlock(request: berty.chat.ContactBlock.IRequest, callback: berty.chat.ChatService.ContactBlockCallback): void;
            public contactBlock(request: berty.chat.ContactBlock.IRequest): Promise<berty.chat.ContactBlock.Reply>;
            public contactRemove(request: berty.chat.ContactRemove.IRequest, callback: berty.chat.ChatService.ContactRemoveCallback): void;
            public contactRemove(request: berty.chat.ContactRemove.IRequest): Promise<berty.chat.ContactRemove.Reply>;
            public contactRequestSend(request: berty.chat.ContactRequestSend.IRequest, callback: berty.chat.ChatService.ContactRequestSendCallback): void;
            public contactRequestSend(request: berty.chat.ContactRequestSend.IRequest): Promise<berty.chat.ContactRequestSend.Reply>;
            public contactRequestAccept(request: berty.chat.ContactRequestAccept.IRequest, callback: berty.chat.ChatService.ContactRequestAcceptCallback): void;
            public contactRequestAccept(request: berty.chat.ContactRequestAccept.IRequest): Promise<berty.chat.ContactRequestAccept.Reply>;
            public contactRequestDecline(request: berty.chat.ContactRequestDecline.IRequest, callback: berty.chat.ChatService.ContactRequestDeclineCallback): void;
            public contactRequestDecline(request: berty.chat.ContactRequestDecline.IRequest): Promise<berty.chat.ContactRequestDecline.Reply>;
            public accountList(request: berty.chat.AccountList.IRequest, callback: berty.chat.ChatService.AccountListCallback): void;
            public accountList(request: berty.chat.AccountList.IRequest): Promise<berty.chat.AccountList.Reply>;
            public accountGet(request: berty.chat.AccountGet.IRequest, callback: berty.chat.ChatService.AccountGetCallback): void;
            public accountGet(request: berty.chat.AccountGet.IRequest): Promise<berty.chat.AccountGet.Reply>;
            public accountCreate(request: berty.chat.AccountCreate.IRequest, callback: berty.chat.ChatService.AccountCreateCallback): void;
            public accountCreate(request: berty.chat.AccountCreate.IRequest): Promise<berty.chat.AccountCreate.Reply>;
            public accountUpdate(request: berty.chat.AccountUpdate.IRequest, callback: berty.chat.ChatService.AccountUpdateCallback): void;
            public accountUpdate(request: berty.chat.AccountUpdate.IRequest): Promise<berty.chat.AccountUpdate.Reply>;
            public accountOpen(request: berty.chat.AccountOpen.IRequest, callback: berty.chat.ChatService.AccountOpenCallback): void;
            public accountOpen(request: berty.chat.AccountOpen.IRequest): Promise<berty.chat.AccountOpen.Reply>;
            public accountClose(request: berty.chat.AccountClose.IRequest, callback: berty.chat.ChatService.AccountCloseCallback): void;
            public accountClose(request: berty.chat.AccountClose.IRequest): Promise<berty.chat.AccountClose.Reply>;
            public accountRemove(request: berty.chat.AccountRemove.IRequest, callback: berty.chat.ChatService.AccountRemoveCallback): void;
            public accountRemove(request: berty.chat.AccountRemove.IRequest): Promise<berty.chat.AccountRemove.Reply>;
            public accountPairingInvitationCreate(request: berty.chat.AccountPairingInvitationCreate.IRequest, callback: berty.chat.ChatService.AccountPairingInvitationCreateCallback): void;
            public accountPairingInvitationCreate(request: berty.chat.AccountPairingInvitationCreate.IRequest): Promise<berty.chat.AccountPairingInvitationCreate.Reply>;
            public accountRenewIncomingContactRequestLink(request: berty.chat.AccountRenewIncomingContactRequestLink.IRequest, callback: berty.chat.ChatService.AccountRenewIncomingContactRequestLinkCallback): void;
            public accountRenewIncomingContactRequestLink(request: berty.chat.AccountRenewIncomingContactRequestLink.IRequest): Promise<berty.chat.AccountRenewIncomingContactRequestLink.Reply>;
        }

        namespace ChatService {

            type SearchCallback = (error: (Error|null), response?: berty.chat.Search.Reply) => void;

            type EventSubscribeCallback = (error: (Error|null), response?: berty.chat.EventSubscribe.Reply) => void;

            type DevEventSubscribeCallback = (error: (Error|null), response?: berty.chat.DevEventSubscribe.Reply) => void;

            type ConversationListCallback = (error: (Error|null), response?: berty.chat.ConversationList.Reply) => void;

            type ConversationGetCallback = (error: (Error|null), response?: berty.chat.ConversationGet.Reply) => void;

            type ConversationCreateCallback = (error: (Error|null), response?: berty.chat.ConversationCreate.Reply) => void;

            type ConversationUpdateCallback = (error: (Error|null), response?: berty.chat.ConversationUpdate.Reply) => void;

            type ConversationMuteCallback = (error: (Error|null), response?: berty.chat.ConversationMute.Reply) => void;

            type ConversationLeaveCallback = (error: (Error|null), response?: berty.chat.ConversationLeave.Reply) => void;

            type ConversationEraseCallback = (error: (Error|null), response?: berty.chat.ConversationErase.Reply) => void;

            type ConversationInvitationSendCallback = (error: (Error|null), response?: berty.chat.ConversationInvitationSend.Reply) => void;

            type ConversationInvitationAcceptCallback = (error: (Error|null), response?: berty.chat.ConversationInvitationAccept.Reply) => void;

            type ConversationInvitationDeclineCallback = (error: (Error|null), response?: berty.chat.ConversationInvitationDecline.Reply) => void;

            type MessageListCallback = (error: (Error|null), response?: berty.chat.MessageList.Reply) => void;

            type MessageGetCallback = (error: (Error|null), response?: berty.chat.MessageGet.Reply) => void;

            type MessageSendCallback = (error: (Error|null), response?: berty.chat.MessageSend.Reply) => void;

            type MessageEditCallback = (error: (Error|null), response?: berty.chat.MessageEdit.Reply) => void;

            type MessageHideCallback = (error: (Error|null), response?: berty.chat.MessageHide.Reply) => void;

            type MessageReactCallback = (error: (Error|null), response?: berty.chat.MessageReact.Reply) => void;

            type MessageReadCallback = (error: (Error|null), response?: berty.chat.MessageRead.Reply) => void;

            type MemberListCallback = (error: (Error|null), response?: berty.chat.MemberList.Reply) => void;

            type MemberGetCallback = (error: (Error|null), response?: berty.chat.MemberGet.Reply) => void;

            type ContactListCallback = (error: (Error|null), response?: berty.chat.ContactList.Reply) => void;

            type ContactGetCallback = (error: (Error|null), response?: berty.chat.ContactGet.Reply) => void;

            type ContactBlockCallback = (error: (Error|null), response?: berty.chat.ContactBlock.Reply) => void;

            type ContactRemoveCallback = (error: (Error|null), response?: berty.chat.ContactRemove.Reply) => void;

            type ContactRequestSendCallback = (error: (Error|null), response?: berty.chat.ContactRequestSend.Reply) => void;

            type ContactRequestAcceptCallback = (error: (Error|null), response?: berty.chat.ContactRequestAccept.Reply) => void;

            type ContactRequestDeclineCallback = (error: (Error|null), response?: berty.chat.ContactRequestDecline.Reply) => void;

            type AccountListCallback = (error: (Error|null), response?: berty.chat.AccountList.Reply) => void;

            type AccountGetCallback = (error: (Error|null), response?: berty.chat.AccountGet.Reply) => void;

            type AccountCreateCallback = (error: (Error|null), response?: berty.chat.AccountCreate.Reply) => void;

            type AccountUpdateCallback = (error: (Error|null), response?: berty.chat.AccountUpdate.Reply) => void;

            type AccountOpenCallback = (error: (Error|null), response?: berty.chat.AccountOpen.Reply) => void;

            type AccountCloseCallback = (error: (Error|null), response?: berty.chat.AccountClose.Reply) => void;

            type AccountRemoveCallback = (error: (Error|null), response?: berty.chat.AccountRemove.Reply) => void;

            type AccountPairingInvitationCreateCallback = (error: (Error|null), response?: berty.chat.AccountPairingInvitationCreate.Reply) => void;

            type AccountRenewIncomingContactRequestLinkCallback = (error: (Error|null), response?: berty.chat.AccountRenewIncomingContactRequestLink.Reply) => void;
        }

        interface ISearch {
        }

        class Search implements ISearch {

            public static create(properties?: berty.chat.ISearch): berty.chat.Search;
            public static encode(message: berty.chat.ISearch, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.ISearch, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.Search;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.Search;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.Search;
            public static toObject(message: berty.chat.Search, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace Search {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.chat.Search.IRequest): berty.chat.Search.Request;
                public static encode(message: berty.chat.Search.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.Search.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.Search.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.Search.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.Search.Request;
                public static toObject(message: berty.chat.Search.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.Search.IReply): berty.chat.Search.Reply;
                public static encode(message: berty.chat.Search.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.Search.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.Search.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.Search.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.Search.Reply;
                public static toObject(message: berty.chat.Search.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IEventSubscribe {
        }

        class EventSubscribe implements IEventSubscribe {

            public static create(properties?: berty.chat.IEventSubscribe): berty.chat.EventSubscribe;
            public static encode(message: berty.chat.IEventSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IEventSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.EventSubscribe;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.EventSubscribe;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.EventSubscribe;
            public static toObject(message: berty.chat.EventSubscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace EventSubscribe {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.chat.EventSubscribe.IRequest): berty.chat.EventSubscribe.Request;
                public static encode(message: berty.chat.EventSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.EventSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.EventSubscribe.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.EventSubscribe.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.EventSubscribe.Request;
                public static toObject(message: berty.chat.EventSubscribe.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.EventSubscribe.IReply): berty.chat.EventSubscribe.Reply;
                public static encode(message: berty.chat.EventSubscribe.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.EventSubscribe.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.EventSubscribe.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.EventSubscribe.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.EventSubscribe.Reply;
                public static toObject(message: berty.chat.EventSubscribe.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IDevEventSubscribe {
        }

        class DevEventSubscribe implements IDevEventSubscribe {

            public static create(properties?: berty.chat.IDevEventSubscribe): berty.chat.DevEventSubscribe;
            public static encode(message: berty.chat.IDevEventSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IDevEventSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.DevEventSubscribe;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.DevEventSubscribe;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.DevEventSubscribe;
            public static toObject(message: berty.chat.DevEventSubscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace DevEventSubscribe {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.chat.DevEventSubscribe.IRequest): berty.chat.DevEventSubscribe.Request;
                public static encode(message: berty.chat.DevEventSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.DevEventSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.DevEventSubscribe.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.DevEventSubscribe.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.DevEventSubscribe.Request;
                public static toObject(message: berty.chat.DevEventSubscribe.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.DevEventSubscribe.IReply): berty.chat.DevEventSubscribe.Reply;
                public static encode(message: berty.chat.DevEventSubscribe.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.DevEventSubscribe.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.DevEventSubscribe.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.DevEventSubscribe.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.DevEventSubscribe.Reply;
                public static toObject(message: berty.chat.DevEventSubscribe.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IConversationList {
        }

        class ConversationList implements IConversationList {

            public static create(properties?: berty.chat.IConversationList): berty.chat.ConversationList;
            public static encode(message: berty.chat.IConversationList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationList;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationList;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationList;
            public static toObject(message: berty.chat.ConversationList, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ConversationList {

            interface IRequest {
                filter?: (berty.chatmodel.IConversation|null);
                not?: (berty.chatmodel.IConversation|null);
            }

            class Request implements IRequest {

                public filter?: (berty.chatmodel.IConversation|null);
                public not?: (berty.chatmodel.IConversation|null);
                public static create(properties?: berty.chat.ConversationList.IRequest): berty.chat.ConversationList.Request;
                public static encode(message: berty.chat.ConversationList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationList.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationList.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationList.Request;
                public static toObject(message: berty.chat.ConversationList.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                conversation?: (berty.chatmodel.IConversation|null);
            }

            class Reply implements IReply {

                public conversation?: (berty.chatmodel.IConversation|null);
                public static create(properties?: berty.chat.ConversationList.IReply): berty.chat.ConversationList.Reply;
                public static encode(message: berty.chat.ConversationList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationList.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationList.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationList.Reply;
                public static toObject(message: berty.chat.ConversationList.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IConversationGet {
        }

        class ConversationGet implements IConversationGet {

            public static create(properties?: berty.chat.IConversationGet): berty.chat.ConversationGet;
            public static encode(message: berty.chat.IConversationGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationGet;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationGet;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationGet;
            public static toObject(message: berty.chat.ConversationGet, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ConversationGet {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.ConversationGet.IRequest): berty.chat.ConversationGet.Request;
                public static encode(message: berty.chat.ConversationGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationGet.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationGet.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationGet.Request;
                public static toObject(message: berty.chat.ConversationGet.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                conversation?: (berty.chatmodel.IConversation|null);
            }

            class Reply implements IReply {

                public conversation?: (berty.chatmodel.IConversation|null);
                public static create(properties?: berty.chat.ConversationGet.IReply): berty.chat.ConversationGet.Reply;
                public static encode(message: berty.chat.ConversationGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationGet.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationGet.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationGet.Reply;
                public static toObject(message: berty.chat.ConversationGet.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IConversationCreate {
        }

        class ConversationCreate implements IConversationCreate {

            public static create(properties?: berty.chat.IConversationCreate): berty.chat.ConversationCreate;
            public static encode(message: berty.chat.IConversationCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationCreate;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationCreate;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationCreate;
            public static toObject(message: berty.chat.ConversationCreate, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ConversationCreate {

            interface IRequest {
                title?: (string|null);
                topic?: (string|null);
                avatarUri?: (string|null);
            }

            class Request implements IRequest {

                public title: string;
                public topic: string;
                public avatarUri: string;
                public static create(properties?: berty.chat.ConversationCreate.IRequest): berty.chat.ConversationCreate.Request;
                public static encode(message: berty.chat.ConversationCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationCreate.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationCreate.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationCreate.Request;
                public static toObject(message: berty.chat.ConversationCreate.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                conversation?: (berty.chatmodel.IConversation|null);
            }

            class Reply implements IReply {

                public conversation?: (berty.chatmodel.IConversation|null);
                public static create(properties?: berty.chat.ConversationCreate.IReply): berty.chat.ConversationCreate.Reply;
                public static encode(message: berty.chat.ConversationCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationCreate.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationCreate.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationCreate.Reply;
                public static toObject(message: berty.chat.ConversationCreate.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IConversationUpdate {
        }

        class ConversationUpdate implements IConversationUpdate {

            public static create(properties?: berty.chat.IConversationUpdate): berty.chat.ConversationUpdate;
            public static encode(message: berty.chat.IConversationUpdate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationUpdate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationUpdate;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationUpdate;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationUpdate;
            public static toObject(message: berty.chat.ConversationUpdate, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ConversationUpdate {

            interface IRequest {
                id?: (number|Long|null);
                title?: (string|null);
                topic?: (string|null);
                avatarUri?: (string|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public title: string;
                public topic: string;
                public avatarUri: string;
                public static create(properties?: berty.chat.ConversationUpdate.IRequest): berty.chat.ConversationUpdate.Request;
                public static encode(message: berty.chat.ConversationUpdate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationUpdate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationUpdate.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationUpdate.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationUpdate.Request;
                public static toObject(message: berty.chat.ConversationUpdate.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.ConversationUpdate.IReply): berty.chat.ConversationUpdate.Reply;
                public static encode(message: berty.chat.ConversationUpdate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationUpdate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationUpdate.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationUpdate.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationUpdate.Reply;
                public static toObject(message: berty.chat.ConversationUpdate.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IConversationMute {
        }

        class ConversationMute implements IConversationMute {

            public static create(properties?: berty.chat.IConversationMute): berty.chat.ConversationMute;
            public static encode(message: berty.chat.IConversationMute, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationMute, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMute;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMute;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMute;
            public static toObject(message: berty.chat.ConversationMute, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ConversationMute {

            interface IRequest {
                policy?: (berty.chatmodel.Member.MutePolicy|null);
            }

            class Request implements IRequest {

                public policy: berty.chatmodel.Member.MutePolicy;
                public static create(properties?: berty.chat.ConversationMute.IRequest): berty.chat.ConversationMute.Request;
                public static encode(message: berty.chat.ConversationMute.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationMute.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMute.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMute.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMute.Request;
                public static toObject(message: berty.chat.ConversationMute.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.ConversationMute.IReply): berty.chat.ConversationMute.Reply;
                public static encode(message: berty.chat.ConversationMute.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationMute.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationMute.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationMute.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationMute.Reply;
                public static toObject(message: berty.chat.ConversationMute.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IConversationLeave {
        }

        class ConversationLeave implements IConversationLeave {

            public static create(properties?: berty.chat.IConversationLeave): berty.chat.ConversationLeave;
            public static encode(message: berty.chat.IConversationLeave, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationLeave, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationLeave;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationLeave;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationLeave;
            public static toObject(message: berty.chat.ConversationLeave, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ConversationLeave {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.ConversationLeave.IRequest): berty.chat.ConversationLeave.Request;
                public static encode(message: berty.chat.ConversationLeave.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationLeave.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationLeave.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationLeave.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationLeave.Request;
                public static toObject(message: berty.chat.ConversationLeave.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.ConversationLeave.IReply): berty.chat.ConversationLeave.Reply;
                public static encode(message: berty.chat.ConversationLeave.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationLeave.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationLeave.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationLeave.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationLeave.Reply;
                public static toObject(message: berty.chat.ConversationLeave.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IConversationErase {
        }

        class ConversationErase implements IConversationErase {

            public static create(properties?: berty.chat.IConversationErase): berty.chat.ConversationErase;
            public static encode(message: berty.chat.IConversationErase, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationErase, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationErase;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationErase;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationErase;
            public static toObject(message: berty.chat.ConversationErase, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ConversationErase {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.ConversationErase.IRequest): berty.chat.ConversationErase.Request;
                public static encode(message: berty.chat.ConversationErase.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationErase.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationErase.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationErase.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationErase.Request;
                public static toObject(message: berty.chat.ConversationErase.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.ConversationErase.IReply): berty.chat.ConversationErase.Reply;
                public static encode(message: berty.chat.ConversationErase.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationErase.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationErase.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationErase.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationErase.Reply;
                public static toObject(message: berty.chat.ConversationErase.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IConversationInvitationSend {
        }

        class ConversationInvitationSend implements IConversationInvitationSend {

            public static create(properties?: berty.chat.IConversationInvitationSend): berty.chat.ConversationInvitationSend;
            public static encode(message: berty.chat.IConversationInvitationSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationInvitationSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationSend;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationSend;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationSend;
            public static toObject(message: berty.chat.ConversationInvitationSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ConversationInvitationSend {

            interface IRequest {
                id?: (number|Long|null);
                contactId?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public contactId: (number|Long);
                public static create(properties?: berty.chat.ConversationInvitationSend.IRequest): berty.chat.ConversationInvitationSend.Request;
                public static encode(message: berty.chat.ConversationInvitationSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationInvitationSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationSend.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationSend.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationSend.Request;
                public static toObject(message: berty.chat.ConversationInvitationSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.ConversationInvitationSend.IReply): berty.chat.ConversationInvitationSend.Reply;
                public static encode(message: berty.chat.ConversationInvitationSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationInvitationSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationSend.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationSend.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationSend.Reply;
                public static toObject(message: berty.chat.ConversationInvitationSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IConversationInvitationAccept {
        }

        class ConversationInvitationAccept implements IConversationInvitationAccept {

            public static create(properties?: berty.chat.IConversationInvitationAccept): berty.chat.ConversationInvitationAccept;
            public static encode(message: berty.chat.IConversationInvitationAccept, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationInvitationAccept, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationAccept;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationAccept;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationAccept;
            public static toObject(message: berty.chat.ConversationInvitationAccept, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ConversationInvitationAccept {

            interface IRequest {
                id?: (number|Long|null);
                contactId?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public contactId: (number|Long);
                public static create(properties?: berty.chat.ConversationInvitationAccept.IRequest): berty.chat.ConversationInvitationAccept.Request;
                public static encode(message: berty.chat.ConversationInvitationAccept.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationInvitationAccept.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationAccept.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationAccept.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationAccept.Request;
                public static toObject(message: berty.chat.ConversationInvitationAccept.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.ConversationInvitationAccept.IReply): berty.chat.ConversationInvitationAccept.Reply;
                public static encode(message: berty.chat.ConversationInvitationAccept.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationInvitationAccept.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationAccept.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationAccept.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationAccept.Reply;
                public static toObject(message: berty.chat.ConversationInvitationAccept.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IConversationInvitationDecline {
        }

        class ConversationInvitationDecline implements IConversationInvitationDecline {

            public static create(properties?: berty.chat.IConversationInvitationDecline): berty.chat.ConversationInvitationDecline;
            public static encode(message: berty.chat.IConversationInvitationDecline, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IConversationInvitationDecline, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationDecline;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationDecline;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationDecline;
            public static toObject(message: berty.chat.ConversationInvitationDecline, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ConversationInvitationDecline {

            interface IRequest {
                conversationId?: (number|Long|null);
            }

            class Request implements IRequest {

                public conversationId: (number|Long);
                public static create(properties?: berty.chat.ConversationInvitationDecline.IRequest): berty.chat.ConversationInvitationDecline.Request;
                public static encode(message: berty.chat.ConversationInvitationDecline.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationInvitationDecline.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationDecline.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationDecline.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationDecline.Request;
                public static toObject(message: berty.chat.ConversationInvitationDecline.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.ConversationInvitationDecline.IReply): berty.chat.ConversationInvitationDecline.Reply;
                public static encode(message: berty.chat.ConversationInvitationDecline.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ConversationInvitationDecline.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ConversationInvitationDecline.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ConversationInvitationDecline.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ConversationInvitationDecline.Reply;
                public static toObject(message: berty.chat.ConversationInvitationDecline.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMessageList {
        }

        class MessageList implements IMessageList {

            public static create(properties?: berty.chat.IMessageList): berty.chat.MessageList;
            public static encode(message: berty.chat.IMessageList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageList;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageList;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageList;
            public static toObject(message: berty.chat.MessageList, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MessageList {

            interface IRequest {
                filter?: (berty.chatmodel.IMessage|null);
                not?: (berty.chatmodel.IMessage|null);
            }

            class Request implements IRequest {

                public filter?: (berty.chatmodel.IMessage|null);
                public not?: (berty.chatmodel.IMessage|null);
                public static create(properties?: berty.chat.MessageList.IRequest): berty.chat.MessageList.Request;
                public static encode(message: berty.chat.MessageList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageList.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageList.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageList.Request;
                public static toObject(message: berty.chat.MessageList.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                message?: (berty.chatmodel.IMessage|null);
            }

            class Reply implements IReply {

                public message?: (berty.chatmodel.IMessage|null);
                public static create(properties?: berty.chat.MessageList.IReply): berty.chat.MessageList.Reply;
                public static encode(message: berty.chat.MessageList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageList.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageList.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageList.Reply;
                public static toObject(message: berty.chat.MessageList.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMessageGet {
        }

        class MessageGet implements IMessageGet {

            public static create(properties?: berty.chat.IMessageGet): berty.chat.MessageGet;
            public static encode(message: berty.chat.IMessageGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageGet;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageGet;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageGet;
            public static toObject(message: berty.chat.MessageGet, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MessageGet {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.MessageGet.IRequest): berty.chat.MessageGet.Request;
                public static encode(message: berty.chat.MessageGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageGet.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageGet.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageGet.Request;
                public static toObject(message: berty.chat.MessageGet.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                message?: (berty.chatmodel.IMessage|null);
            }

            class Reply implements IReply {

                public message?: (berty.chatmodel.IMessage|null);
                public static create(properties?: berty.chat.MessageGet.IReply): berty.chat.MessageGet.Reply;
                public static encode(message: berty.chat.MessageGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageGet.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageGet.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageGet.Reply;
                public static toObject(message: berty.chat.MessageGet.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMessageSend {
        }

        class MessageSend implements IMessageSend {

            public static create(properties?: berty.chat.IMessageSend): berty.chat.MessageSend;
            public static encode(message: berty.chat.IMessageSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageSend;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageSend;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageSend;
            public static toObject(message: berty.chat.MessageSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MessageSend {

            interface IRequest {
                conversationId?: (number|Long|null);
                kind?: (berty.chatmodel.Message.Kind|null);
                body?: (berty.chatmodel.Message.IBody|null);
                attachments?: (berty.chatmodel.IAttachment[]|null);
            }

            class Request implements IRequest {

                public conversationId: (number|Long);
                public kind: berty.chatmodel.Message.Kind;
                public body?: (berty.chatmodel.Message.IBody|null);
                public attachments: berty.chatmodel.IAttachment[];
                public static create(properties?: berty.chat.MessageSend.IRequest): berty.chat.MessageSend.Request;
                public static encode(message: berty.chat.MessageSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageSend.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageSend.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageSend.Request;
                public static toObject(message: berty.chat.MessageSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.MessageSend.IReply): berty.chat.MessageSend.Reply;
                public static encode(message: berty.chat.MessageSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageSend.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageSend.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageSend.Reply;
                public static toObject(message: berty.chat.MessageSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMessageEdit {
        }

        class MessageEdit implements IMessageEdit {

            public static create(properties?: berty.chat.IMessageEdit): berty.chat.MessageEdit;
            public static encode(message: berty.chat.IMessageEdit, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageEdit, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageEdit;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageEdit;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageEdit;
            public static toObject(message: berty.chat.MessageEdit, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MessageEdit {

            interface IRequest {
                id?: (number|Long|null);
                body?: (berty.chatmodel.Message.IBody|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public body?: (berty.chatmodel.Message.IBody|null);
                public static create(properties?: berty.chat.MessageEdit.IRequest): berty.chat.MessageEdit.Request;
                public static encode(message: berty.chat.MessageEdit.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageEdit.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageEdit.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageEdit.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageEdit.Request;
                public static toObject(message: berty.chat.MessageEdit.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.MessageEdit.IReply): berty.chat.MessageEdit.Reply;
                public static encode(message: berty.chat.MessageEdit.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageEdit.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageEdit.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageEdit.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageEdit.Reply;
                public static toObject(message: berty.chat.MessageEdit.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMessageHide {
        }

        class MessageHide implements IMessageHide {

            public static create(properties?: berty.chat.IMessageHide): berty.chat.MessageHide;
            public static encode(message: berty.chat.IMessageHide, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageHide, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageHide;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageHide;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageHide;
            public static toObject(message: berty.chat.MessageHide, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MessageHide {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.MessageHide.IRequest): berty.chat.MessageHide.Request;
                public static encode(message: berty.chat.MessageHide.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageHide.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageHide.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageHide.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageHide.Request;
                public static toObject(message: berty.chat.MessageHide.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.MessageHide.IReply): berty.chat.MessageHide.Reply;
                public static encode(message: berty.chat.MessageHide.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageHide.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageHide.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageHide.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageHide.Reply;
                public static toObject(message: berty.chat.MessageHide.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMessageReact {
        }

        class MessageReact implements IMessageReact {

            public static create(properties?: berty.chat.IMessageReact): berty.chat.MessageReact;
            public static encode(message: berty.chat.IMessageReact, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageReact, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageReact;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageReact;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageReact;
            public static toObject(message: berty.chat.MessageReact, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MessageReact {

            interface IRequest {
                id?: (number|Long|null);
                emoji?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public emoji: Uint8Array;
                public static create(properties?: berty.chat.MessageReact.IRequest): berty.chat.MessageReact.Request;
                public static encode(message: berty.chat.MessageReact.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageReact.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageReact.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageReact.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageReact.Request;
                public static toObject(message: berty.chat.MessageReact.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.MessageReact.IReply): berty.chat.MessageReact.Reply;
                public static encode(message: berty.chat.MessageReact.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageReact.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageReact.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageReact.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageReact.Reply;
                public static toObject(message: berty.chat.MessageReact.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMessageRead {
        }

        class MessageRead implements IMessageRead {

            public static create(properties?: berty.chat.IMessageRead): berty.chat.MessageRead;
            public static encode(message: berty.chat.IMessageRead, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMessageRead, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageRead;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageRead;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MessageRead;
            public static toObject(message: berty.chat.MessageRead, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MessageRead {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.MessageRead.IRequest): berty.chat.MessageRead.Request;
                public static encode(message: berty.chat.MessageRead.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageRead.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageRead.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageRead.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageRead.Request;
                public static toObject(message: berty.chat.MessageRead.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.MessageRead.IReply): berty.chat.MessageRead.Reply;
                public static encode(message: berty.chat.MessageRead.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MessageRead.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MessageRead.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MessageRead.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MessageRead.Reply;
                public static toObject(message: berty.chat.MessageRead.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMemberList {
        }

        class MemberList implements IMemberList {

            public static create(properties?: berty.chat.IMemberList): berty.chat.MemberList;
            public static encode(message: berty.chat.IMemberList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMemberList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MemberList;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MemberList;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MemberList;
            public static toObject(message: berty.chat.MemberList, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MemberList {

            interface IRequest {
                filter?: (berty.chatmodel.IMember|null);
                not?: (berty.chatmodel.IMember|null);
            }

            class Request implements IRequest {

                public filter?: (berty.chatmodel.IMember|null);
                public not?: (berty.chatmodel.IMember|null);
                public static create(properties?: berty.chat.MemberList.IRequest): berty.chat.MemberList.Request;
                public static encode(message: berty.chat.MemberList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MemberList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MemberList.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MemberList.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MemberList.Request;
                public static toObject(message: berty.chat.MemberList.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                member?: (berty.chatmodel.IMember|null);
            }

            class Reply implements IReply {

                public member?: (berty.chatmodel.IMember|null);
                public static create(properties?: berty.chat.MemberList.IReply): berty.chat.MemberList.Reply;
                public static encode(message: berty.chat.MemberList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MemberList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MemberList.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MemberList.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MemberList.Reply;
                public static toObject(message: berty.chat.MemberList.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMemberGet {
        }

        class MemberGet implements IMemberGet {

            public static create(properties?: berty.chat.IMemberGet): berty.chat.MemberGet;
            public static encode(message: berty.chat.IMemberGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IMemberGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MemberGet;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MemberGet;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.MemberGet;
            public static toObject(message: berty.chat.MemberGet, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MemberGet {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.MemberGet.IRequest): berty.chat.MemberGet.Request;
                public static encode(message: berty.chat.MemberGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MemberGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MemberGet.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MemberGet.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MemberGet.Request;
                public static toObject(message: berty.chat.MemberGet.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                member?: (berty.chatmodel.IMember|null);
            }

            class Reply implements IReply {

                public member?: (berty.chatmodel.IMember|null);
                public static create(properties?: berty.chat.MemberGet.IReply): berty.chat.MemberGet.Reply;
                public static encode(message: berty.chat.MemberGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.MemberGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.MemberGet.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.MemberGet.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.MemberGet.Reply;
                public static toObject(message: berty.chat.MemberGet.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactList {
        }

        class ContactList implements IContactList {

            public static create(properties?: berty.chat.IContactList): berty.chat.ContactList;
            public static encode(message: berty.chat.IContactList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactList;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactList;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactList;
            public static toObject(message: berty.chat.ContactList, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactList {

            interface IRequest {
                filter?: (berty.chatmodel.IContact|null);
                not?: (berty.chatmodel.IContact|null);
            }

            class Request implements IRequest {

                public filter?: (berty.chatmodel.IContact|null);
                public not?: (berty.chatmodel.IContact|null);
                public static create(properties?: berty.chat.ContactList.IRequest): berty.chat.ContactList.Request;
                public static encode(message: berty.chat.ContactList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactList.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactList.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactList.Request;
                public static toObject(message: berty.chat.ContactList.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                contact?: (berty.chatmodel.IContact|null);
            }

            class Reply implements IReply {

                public contact?: (berty.chatmodel.IContact|null);
                public static create(properties?: berty.chat.ContactList.IReply): berty.chat.ContactList.Reply;
                public static encode(message: berty.chat.ContactList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactList.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactList.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactList.Reply;
                public static toObject(message: berty.chat.ContactList.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactGet {
        }

        class ContactGet implements IContactGet {

            public static create(properties?: berty.chat.IContactGet): berty.chat.ContactGet;
            public static encode(message: berty.chat.IContactGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactGet;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactGet;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactGet;
            public static toObject(message: berty.chat.ContactGet, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactGet {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.ContactGet.IRequest): berty.chat.ContactGet.Request;
                public static encode(message: berty.chat.ContactGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactGet.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactGet.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactGet.Request;
                public static toObject(message: berty.chat.ContactGet.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                contact?: (berty.chatmodel.IContact|null);
            }

            class Reply implements IReply {

                public contact?: (berty.chatmodel.IContact|null);
                public static create(properties?: berty.chat.ContactGet.IReply): berty.chat.ContactGet.Reply;
                public static encode(message: berty.chat.ContactGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactGet.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactGet.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactGet.Reply;
                public static toObject(message: berty.chat.ContactGet.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactBlock {
        }

        class ContactBlock implements IContactBlock {

            public static create(properties?: berty.chat.IContactBlock): berty.chat.ContactBlock;
            public static encode(message: berty.chat.IContactBlock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactBlock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactBlock;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactBlock;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactBlock;
            public static toObject(message: berty.chat.ContactBlock, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactBlock {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.chat.ContactBlock.IRequest): berty.chat.ContactBlock.Request;
                public static encode(message: berty.chat.ContactBlock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactBlock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactBlock.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactBlock.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactBlock.Request;
                public static toObject(message: berty.chat.ContactBlock.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.ContactBlock.IReply): berty.chat.ContactBlock.Reply;
                public static encode(message: berty.chat.ContactBlock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactBlock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactBlock.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactBlock.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactBlock.Reply;
                public static toObject(message: berty.chat.ContactBlock.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRemove {
        }

        class ContactRemove implements IContactRemove {

            public static create(properties?: berty.chat.IContactRemove): berty.chat.ContactRemove;
            public static encode(message: berty.chat.IContactRemove, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRemove, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRemove;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRemove;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRemove;
            public static toObject(message: berty.chat.ContactRemove, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRemove {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.ContactRemove.IRequest): berty.chat.ContactRemove.Request;
                public static encode(message: berty.chat.ContactRemove.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactRemove.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRemove.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRemove.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactRemove.Request;
                public static toObject(message: berty.chat.ContactRemove.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.ContactRemove.IReply): berty.chat.ContactRemove.Reply;
                public static encode(message: berty.chat.ContactRemove.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactRemove.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRemove.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRemove.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactRemove.Reply;
                public static toObject(message: berty.chat.ContactRemove.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestSend {
        }

        class ContactRequestSend implements IContactRequestSend {

            public static create(properties?: berty.chat.IContactRequestSend): berty.chat.ContactRequestSend;
            public static encode(message: berty.chat.IContactRequestSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRequestSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestSend;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestSend;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestSend;
            public static toObject(message: berty.chat.ContactRequestSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestSend {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.ContactRequestSend.IRequest): berty.chat.ContactRequestSend.Request;
                public static encode(message: berty.chat.ContactRequestSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactRequestSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestSend.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestSend.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestSend.Request;
                public static toObject(message: berty.chat.ContactRequestSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.ContactRequestSend.IReply): berty.chat.ContactRequestSend.Reply;
                public static encode(message: berty.chat.ContactRequestSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactRequestSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestSend.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestSend.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestSend.Reply;
                public static toObject(message: berty.chat.ContactRequestSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestAccept {
        }

        class ContactRequestAccept implements IContactRequestAccept {

            public static create(properties?: berty.chat.IContactRequestAccept): berty.chat.ContactRequestAccept;
            public static encode(message: berty.chat.IContactRequestAccept, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRequestAccept, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestAccept;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestAccept;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestAccept;
            public static toObject(message: berty.chat.ContactRequestAccept, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestAccept {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.ContactRequestAccept.IRequest): berty.chat.ContactRequestAccept.Request;
                public static encode(message: berty.chat.ContactRequestAccept.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactRequestAccept.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestAccept.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestAccept.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestAccept.Request;
                public static toObject(message: berty.chat.ContactRequestAccept.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.ContactRequestAccept.IReply): berty.chat.ContactRequestAccept.Reply;
                public static encode(message: berty.chat.ContactRequestAccept.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactRequestAccept.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestAccept.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestAccept.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestAccept.Reply;
                public static toObject(message: berty.chat.ContactRequestAccept.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestDecline {
        }

        class ContactRequestDecline implements IContactRequestDecline {

            public static create(properties?: berty.chat.IContactRequestDecline): berty.chat.ContactRequestDecline;
            public static encode(message: berty.chat.IContactRequestDecline, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IContactRequestDecline, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestDecline;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestDecline;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestDecline;
            public static toObject(message: berty.chat.ContactRequestDecline, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestDecline {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.ContactRequestDecline.IRequest): berty.chat.ContactRequestDecline.Request;
                public static encode(message: berty.chat.ContactRequestDecline.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactRequestDecline.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestDecline.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestDecline.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestDecline.Request;
                public static toObject(message: berty.chat.ContactRequestDecline.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.ContactRequestDecline.IReply): berty.chat.ContactRequestDecline.Reply;
                public static encode(message: berty.chat.ContactRequestDecline.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.ContactRequestDecline.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.ContactRequestDecline.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.ContactRequestDecline.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.ContactRequestDecline.Reply;
                public static toObject(message: berty.chat.ContactRequestDecline.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAccountList {
        }

        class AccountList implements IAccountList {

            public static create(properties?: berty.chat.IAccountList): berty.chat.AccountList;
            public static encode(message: berty.chat.IAccountList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountList;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountList;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountList;
            public static toObject(message: berty.chat.AccountList, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AccountList {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.chat.AccountList.IRequest): berty.chat.AccountList.Request;
                public static encode(message: berty.chat.AccountList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountList.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountList.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountList.Request;
                public static toObject(message: berty.chat.AccountList.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                account?: (berty.chatmodel.IAccount|null);
            }

            class Reply implements IReply {

                public account?: (berty.chatmodel.IAccount|null);
                public static create(properties?: berty.chat.AccountList.IReply): berty.chat.AccountList.Reply;
                public static encode(message: berty.chat.AccountList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountList.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountList.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountList.Reply;
                public static toObject(message: berty.chat.AccountList.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAccountGet {
        }

        class AccountGet implements IAccountGet {

            public static create(properties?: berty.chat.IAccountGet): berty.chat.AccountGet;
            public static encode(message: berty.chat.IAccountGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountGet;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountGet;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountGet;
            public static toObject(message: berty.chat.AccountGet, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AccountGet {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.AccountGet.IRequest): berty.chat.AccountGet.Request;
                public static encode(message: berty.chat.AccountGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountGet.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountGet.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountGet.Request;
                public static toObject(message: berty.chat.AccountGet.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                account?: (berty.chatmodel.IAccount|null);
            }

            class Reply implements IReply {

                public account?: (berty.chatmodel.IAccount|null);
                public static create(properties?: berty.chat.AccountGet.IReply): berty.chat.AccountGet.Reply;
                public static encode(message: berty.chat.AccountGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountGet.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountGet.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountGet.Reply;
                public static toObject(message: berty.chat.AccountGet.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAccountCreate {
        }

        class AccountCreate implements IAccountCreate {

            public static create(properties?: berty.chat.IAccountCreate): berty.chat.AccountCreate;
            public static encode(message: berty.chat.IAccountCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountCreate;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountCreate;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountCreate;
            public static toObject(message: berty.chat.AccountCreate, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AccountCreate {

            interface IRequest {
                name?: (string|null);
            }

            class Request implements IRequest {

                public name: string;
                public static create(properties?: berty.chat.AccountCreate.IRequest): berty.chat.AccountCreate.Request;
                public static encode(message: berty.chat.AccountCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountCreate.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountCreate.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountCreate.Request;
                public static toObject(message: berty.chat.AccountCreate.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.AccountCreate.IReply): berty.chat.AccountCreate.Reply;
                public static encode(message: berty.chat.AccountCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountCreate.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountCreate.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountCreate.Reply;
                public static toObject(message: berty.chat.AccountCreate.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAccountUpdate {
        }

        class AccountUpdate implements IAccountUpdate {

            public static create(properties?: berty.chat.IAccountUpdate): berty.chat.AccountUpdate;
            public static encode(message: berty.chat.IAccountUpdate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountUpdate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountUpdate;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountUpdate;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountUpdate;
            public static toObject(message: berty.chat.AccountUpdate, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AccountUpdate {

            interface IRequest {
                id?: (number|Long|null);
                name?: (string|null);
                statusEmoji?: (string|null);
                statusText?: (string|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public name: string;
                public statusEmoji: string;
                public statusText: string;
                public static create(properties?: berty.chat.AccountUpdate.IRequest): berty.chat.AccountUpdate.Request;
                public static encode(message: berty.chat.AccountUpdate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountUpdate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountUpdate.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountUpdate.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountUpdate.Request;
                public static toObject(message: berty.chat.AccountUpdate.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.AccountUpdate.IReply): berty.chat.AccountUpdate.Reply;
                public static encode(message: berty.chat.AccountUpdate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountUpdate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountUpdate.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountUpdate.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountUpdate.Reply;
                public static toObject(message: berty.chat.AccountUpdate.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAccountOpen {
        }

        class AccountOpen implements IAccountOpen {

            public static create(properties?: berty.chat.IAccountOpen): berty.chat.AccountOpen;
            public static encode(message: berty.chat.IAccountOpen, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountOpen, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountOpen;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountOpen;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountOpen;
            public static toObject(message: berty.chat.AccountOpen, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AccountOpen {

            interface IRequest {
                id?: (number|Long|null);
                pin?: (string|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public pin: string;
                public static create(properties?: berty.chat.AccountOpen.IRequest): berty.chat.AccountOpen.Request;
                public static encode(message: berty.chat.AccountOpen.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountOpen.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountOpen.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountOpen.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountOpen.Request;
                public static toObject(message: berty.chat.AccountOpen.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                token?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public token: Uint8Array;
                public static create(properties?: berty.chat.AccountOpen.IReply): berty.chat.AccountOpen.Reply;
                public static encode(message: berty.chat.AccountOpen.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountOpen.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountOpen.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountOpen.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountOpen.Reply;
                public static toObject(message: berty.chat.AccountOpen.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAccountClose {
        }

        class AccountClose implements IAccountClose {

            public static create(properties?: berty.chat.IAccountClose): berty.chat.AccountClose;
            public static encode(message: berty.chat.IAccountClose, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountClose, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountClose;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountClose;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountClose;
            public static toObject(message: berty.chat.AccountClose, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AccountClose {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.AccountClose.IRequest): berty.chat.AccountClose.Request;
                public static encode(message: berty.chat.AccountClose.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountClose.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountClose.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountClose.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountClose.Request;
                public static toObject(message: berty.chat.AccountClose.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.AccountClose.IReply): berty.chat.AccountClose.Reply;
                public static encode(message: berty.chat.AccountClose.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountClose.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountClose.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountClose.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountClose.Reply;
                public static toObject(message: berty.chat.AccountClose.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAccountRemove {
        }

        class AccountRemove implements IAccountRemove {

            public static create(properties?: berty.chat.IAccountRemove): berty.chat.AccountRemove;
            public static encode(message: berty.chat.IAccountRemove, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountRemove, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountRemove;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountRemove;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountRemove;
            public static toObject(message: berty.chat.AccountRemove, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AccountRemove {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.AccountRemove.IRequest): berty.chat.AccountRemove.Request;
                public static encode(message: berty.chat.AccountRemove.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountRemove.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountRemove.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountRemove.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountRemove.Request;
                public static toObject(message: berty.chat.AccountRemove.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.AccountRemove.IReply): berty.chat.AccountRemove.Reply;
                public static encode(message: berty.chat.AccountRemove.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountRemove.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountRemove.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountRemove.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountRemove.Reply;
                public static toObject(message: berty.chat.AccountRemove.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAccountPairingInvitationCreate {
        }

        class AccountPairingInvitationCreate implements IAccountPairingInvitationCreate {

            public static create(properties?: berty.chat.IAccountPairingInvitationCreate): berty.chat.AccountPairingInvitationCreate;
            public static encode(message: berty.chat.IAccountPairingInvitationCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountPairingInvitationCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountPairingInvitationCreate;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountPairingInvitationCreate;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountPairingInvitationCreate;
            public static toObject(message: berty.chat.AccountPairingInvitationCreate, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AccountPairingInvitationCreate {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.AccountPairingInvitationCreate.IRequest): berty.chat.AccountPairingInvitationCreate.Request;
                public static encode(message: berty.chat.AccountPairingInvitationCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountPairingInvitationCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountPairingInvitationCreate.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountPairingInvitationCreate.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountPairingInvitationCreate.Request;
                public static toObject(message: berty.chat.AccountPairingInvitationCreate.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.AccountPairingInvitationCreate.IReply): berty.chat.AccountPairingInvitationCreate.Reply;
                public static encode(message: berty.chat.AccountPairingInvitationCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountPairingInvitationCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountPairingInvitationCreate.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountPairingInvitationCreate.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountPairingInvitationCreate.Reply;
                public static toObject(message: berty.chat.AccountPairingInvitationCreate.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAccountRenewIncomingContactRequestLink {
        }

        class AccountRenewIncomingContactRequestLink implements IAccountRenewIncomingContactRequestLink {

            public static create(properties?: berty.chat.IAccountRenewIncomingContactRequestLink): berty.chat.AccountRenewIncomingContactRequestLink;
            public static encode(message: berty.chat.IAccountRenewIncomingContactRequestLink, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.chat.IAccountRenewIncomingContactRequestLink, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountRenewIncomingContactRequestLink;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountRenewIncomingContactRequestLink;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.chat.AccountRenewIncomingContactRequestLink;
            public static toObject(message: berty.chat.AccountRenewIncomingContactRequestLink, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AccountRenewIncomingContactRequestLink {

            interface IRequest {
                id?: (number|Long|null);
            }

            class Request implements IRequest {

                public id: (number|Long);
                public static create(properties?: berty.chat.AccountRenewIncomingContactRequestLink.IRequest): berty.chat.AccountRenewIncomingContactRequestLink.Request;
                public static encode(message: berty.chat.AccountRenewIncomingContactRequestLink.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountRenewIncomingContactRequestLink.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountRenewIncomingContactRequestLink.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountRenewIncomingContactRequestLink.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountRenewIncomingContactRequestLink.Request;
                public static toObject(message: berty.chat.AccountRenewIncomingContactRequestLink.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.chat.AccountRenewIncomingContactRequestLink.IReply): berty.chat.AccountRenewIncomingContactRequestLink.Reply;
                public static encode(message: berty.chat.AccountRenewIncomingContactRequestLink.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.chat.AccountRenewIncomingContactRequestLink.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.chat.AccountRenewIncomingContactRequestLink.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.chat.AccountRenewIncomingContactRequestLink.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.chat.AccountRenewIncomingContactRequestLink.Reply;
                public static toObject(message: berty.chat.AccountRenewIncomingContactRequestLink.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }
    }

    namespace chatmodel {

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
            messages?: (berty.chatmodel.IMessage[]|null);
            members?: (berty.chatmodel.IMember[]|null);
            lastMessageId?: (number|Long|null);
            lastMessage?: (berty.chatmodel.IMessage|null);
        }

        class Conversation implements IConversation {

            public id: (number|Long);
            public protocolId: string;
            public createdAt?: (google.protobuf.ITimestamp|null);
            public updatedAt?: (google.protobuf.ITimestamp|null);
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
            id?: (number|Long|null);
            protocolId?: (string|null);
            createdAt?: (google.protobuf.ITimestamp|null);
            updatedAt?: (google.protobuf.ITimestamp|null);
            readAt?: (google.protobuf.ITimestamp|null);
            name?: (string|null);
            avatarUri?: (string|null);
            role?: (berty.chatmodel.Member.Role|null);
            mutePolicy?: (berty.chatmodel.Member.MutePolicy|null);
            conversationId?: (number|Long|null);
            conversation?: (berty.chatmodel.IConversation|null);
            contactId?: (number|Long|null);
            contact?: (berty.chatmodel.IContact|null);
        }

        class Member implements IMember {

            public id: (number|Long);
            public protocolId: string;
            public createdAt?: (google.protobuf.ITimestamp|null);
            public updatedAt?: (google.protobuf.ITimestamp|null);
            public readAt?: (google.protobuf.ITimestamp|null);
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
                Invited = 1,
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
            id?: (number|Long|null);
            protocolId?: (string|null);
            createdAt?: (google.protobuf.ITimestamp|null);
            updatedAt?: (google.protobuf.ITimestamp|null);
            sentAt?: (google.protobuf.ITimestamp|null);
            editedAt?: (google.protobuf.ITimestamp|null);
            kind?: (berty.chatmodel.Message.Kind|null);
            body?: (berty.chatmodel.Message.IBody|null);
            hidden?: (boolean|null);
            state?: (berty.chatmodel.Message.State|null);
            conversationId?: (number|Long|null);
            conversation?: (berty.chatmodel.IConversation|null);
            memberId?: (number|Long|null);
            member?: (berty.chatmodel.IMember|null);
            attachments?: (berty.chatmodel.IAttachment[]|null);
            reactions?: (berty.chatmodel.IReaction[]|null);
        }

        class Message implements IMessage {

            public id: (number|Long);
            public protocolId: string;
            public createdAt?: (google.protobuf.ITimestamp|null);
            public updatedAt?: (google.protobuf.ITimestamp|null);
            public sentAt?: (google.protobuf.ITimestamp|null);
            public editedAt?: (google.protobuf.ITimestamp|null);
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
                text?: (string|null);
                memberJoined?: (number|Long|null);
                memberLeft?: (number|Long|null);
                memberSetTitleTo?: (string|null);
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
                Unsent = 0,
                Sending = 1,
                Failed = 2,
                Retrying = 3,
                Sent = 4
            }
        }

        interface IAttachment {
            id?: (number|Long|null);
            createdAt?: (google.protobuf.ITimestamp|null);
            updatedAt?: (google.protobuf.ITimestamp|null);
            uri?: (string|null);
            contentType?: (string|null);
            messageId?: (number|Long|null);
            message?: (berty.chatmodel.IMessage|null);
        }

        class Attachment implements IAttachment {

            public id: (number|Long);
            public createdAt?: (google.protobuf.ITimestamp|null);
            public updatedAt?: (google.protobuf.ITimestamp|null);
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
            id?: (number|Long|null);
            createdAt?: (google.protobuf.ITimestamp|null);
            updatedAt?: (google.protobuf.ITimestamp|null);
            emoji?: (Uint8Array|null);
            messageId?: (number|Long|null);
            message?: (berty.chatmodel.IMessage|null);
            memberId?: (number|Long|null);
            member?: (berty.chatmodel.IMember|null);
        }

        class Reaction implements IReaction {

            public id: (number|Long);
            public createdAt?: (google.protobuf.ITimestamp|null);
            public updatedAt?: (google.protobuf.ITimestamp|null);
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

        interface IAccount {
            id?: (number|Long|null);
            createdAt?: (google.protobuf.ITimestamp|null);
            updatedAt?: (google.protobuf.ITimestamp|null);
            contactId?: (number|Long|null);
            contact?: (berty.chatmodel.IContact|null);
            contactRequestsEnabled?: (boolean|null);
            contactRequestsLink?: (string|null);
            hidden?: (boolean|null);
            locked?: (boolean|null);
        }

        class Account implements IAccount {

            public id: (number|Long);
            public createdAt?: (google.protobuf.ITimestamp|null);
            public updatedAt?: (google.protobuf.ITimestamp|null);
            public contactId: (number|Long);
            public contact?: (berty.chatmodel.IContact|null);
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
    }

    namespace protocol {

        class DemoService extends $protobuf.rpc.Service {

            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): DemoService;
            public logToken(request: berty.protocol.LogToken.IRequest, callback: berty.protocol.DemoService.LogTokenCallback): void;
            public logToken(request: berty.protocol.LogToken.IRequest): Promise<berty.protocol.LogToken.Reply>;
            public logAdd(request: berty.protocol.LogAdd.IRequest, callback: berty.protocol.DemoService.LogAddCallback): void;
            public logAdd(request: berty.protocol.LogAdd.IRequest): Promise<berty.protocol.LogAdd.Reply>;
            public logGet(request: berty.protocol.LogGet.IRequest, callback: berty.protocol.DemoService.LogGetCallback): void;
            public logGet(request: berty.protocol.LogGet.IRequest): Promise<berty.protocol.LogGet.Reply>;
            public logList(request: berty.protocol.LogList.IRequest, callback: berty.protocol.DemoService.LogListCallback): void;
            public logList(request: berty.protocol.LogList.IRequest): Promise<berty.protocol.LogList.Reply>;
            public logStream(request: berty.protocol.LogStream.IRequest, callback: berty.protocol.DemoService.LogStreamCallback): void;
            public logStream(request: berty.protocol.LogStream.IRequest): Promise<berty.protocol.LogOperation>;
        }

        namespace DemoService {

            type LogTokenCallback = (error: (Error|null), response?: berty.protocol.LogToken.Reply) => void;

            type LogAddCallback = (error: (Error|null), response?: berty.protocol.LogAdd.Reply) => void;

            type LogGetCallback = (error: (Error|null), response?: berty.protocol.LogGet.Reply) => void;

            type LogListCallback = (error: (Error|null), response?: berty.protocol.LogList.Reply) => void;

            type LogStreamCallback = (error: (Error|null), response?: berty.protocol.LogOperation) => void;
        }

        interface ILogOperation {
            name?: (string|null);
            value?: (Uint8Array|null);
            cid?: (string|null);
        }

        class LogOperation implements ILogOperation {

            public name: string;
            public value: Uint8Array;
            public cid: string;
            public static create(properties?: berty.protocol.ILogOperation): berty.protocol.LogOperation;
            public static encode(message: berty.protocol.ILogOperation, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.ILogOperation, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogOperation;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogOperation;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.LogOperation;
            public static toObject(message: berty.protocol.LogOperation, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface ILogStreamOptions {
            GT?: (string|null);
            GTE?: (string|null);
            LT?: (string|null);
            LTE?: (string|null);
            amount?: (number|null);
        }

        class LogStreamOptions implements ILogStreamOptions {

            public GT: string;
            public GTE: string;
            public LT: string;
            public LTE: string;
            public amount: number;
            public static create(properties?: berty.protocol.ILogStreamOptions): berty.protocol.LogStreamOptions;
            public static encode(message: berty.protocol.ILogStreamOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.ILogStreamOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogStreamOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogStreamOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.LogStreamOptions;
            public static toObject(message: berty.protocol.LogStreamOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface ILogToken {
        }

        class LogToken implements ILogToken {

            public static create(properties?: berty.protocol.ILogToken): berty.protocol.LogToken;
            public static encode(message: berty.protocol.ILogToken, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.ILogToken, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogToken;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogToken;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.LogToken;
            public static toObject(message: berty.protocol.LogToken, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace LogToken {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.protocol.LogToken.IRequest): berty.protocol.LogToken.Request;
                public static encode(message: berty.protocol.LogToken.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogToken.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogToken.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogToken.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogToken.Request;
                public static toObject(message: berty.protocol.LogToken.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                logToken?: (string|null);
            }

            class Reply implements IReply {

                public logToken: string;
                public static create(properties?: berty.protocol.LogToken.IReply): berty.protocol.LogToken.Reply;
                public static encode(message: berty.protocol.LogToken.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogToken.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogToken.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogToken.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogToken.Reply;
                public static toObject(message: berty.protocol.LogToken.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface ILogAdd {
        }

        class LogAdd implements ILogAdd {

            public static create(properties?: berty.protocol.ILogAdd): berty.protocol.LogAdd;
            public static encode(message: berty.protocol.ILogAdd, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.ILogAdd, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogAdd;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogAdd;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.LogAdd;
            public static toObject(message: berty.protocol.LogAdd, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace LogAdd {

            interface IRequest {
                logToken?: (string|null);
                data?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public logToken: string;
                public data: Uint8Array;
                public static create(properties?: berty.protocol.LogAdd.IRequest): berty.protocol.LogAdd.Request;
                public static encode(message: berty.protocol.LogAdd.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogAdd.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogAdd.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogAdd.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogAdd.Request;
                public static toObject(message: berty.protocol.LogAdd.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                cid?: (string|null);
            }

            class Reply implements IReply {

                public cid: string;
                public static create(properties?: berty.protocol.LogAdd.IReply): berty.protocol.LogAdd.Reply;
                public static encode(message: berty.protocol.LogAdd.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogAdd.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogAdd.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogAdd.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogAdd.Reply;
                public static toObject(message: berty.protocol.LogAdd.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface ILogGet {
        }

        class LogGet implements ILogGet {

            public static create(properties?: berty.protocol.ILogGet): berty.protocol.LogGet;
            public static encode(message: berty.protocol.ILogGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.ILogGet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogGet;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogGet;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.LogGet;
            public static toObject(message: berty.protocol.LogGet, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace LogGet {

            interface IRequest {
                logToken?: (string|null);
                cid?: (string|null);
            }

            class Request implements IRequest {

                public logToken: string;
                public cid: string;
                public static create(properties?: berty.protocol.LogGet.IRequest): berty.protocol.LogGet.Request;
                public static encode(message: berty.protocol.LogGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogGet.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogGet.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogGet.Request;
                public static toObject(message: berty.protocol.LogGet.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                operation?: (berty.protocol.ILogOperation|null);
            }

            class Reply implements IReply {

                public operation?: (berty.protocol.ILogOperation|null);
                public static create(properties?: berty.protocol.LogGet.IReply): berty.protocol.LogGet.Reply;
                public static encode(message: berty.protocol.LogGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogGet.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogGet.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogGet.Reply;
                public static toObject(message: berty.protocol.LogGet.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface ILogList {
        }

        class LogList implements ILogList {

            public static create(properties?: berty.protocol.ILogList): berty.protocol.LogList;
            public static encode(message: berty.protocol.ILogList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.ILogList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogList;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogList;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.LogList;
            public static toObject(message: berty.protocol.LogList, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace LogList {

            interface IRequest {
                logToken?: (string|null);
                options?: (berty.protocol.ILogStreamOptions|null);
            }

            class Request implements IRequest {

                public logToken: string;
                public options?: (berty.protocol.ILogStreamOptions|null);
                public static create(properties?: berty.protocol.LogList.IRequest): berty.protocol.LogList.Request;
                public static encode(message: berty.protocol.LogList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogList.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogList.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogList.Request;
                public static toObject(message: berty.protocol.LogList.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                operations?: (berty.protocol.ILogOperation[]|null);
            }

            class Reply implements IReply {

                public operations: berty.protocol.ILogOperation[];
                public static create(properties?: berty.protocol.LogList.IReply): berty.protocol.LogList.Reply;
                public static encode(message: berty.protocol.LogList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogList.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogList.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogList.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogList.Reply;
                public static toObject(message: berty.protocol.LogList.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface ILogStream {
        }

        class LogStream implements ILogStream {

            public static create(properties?: berty.protocol.ILogStream): berty.protocol.LogStream;
            public static encode(message: berty.protocol.ILogStream, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.protocol.ILogStream, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogStream;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogStream;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.protocol.LogStream;
            public static toObject(message: berty.protocol.LogStream, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace LogStream {

            interface IRequest {
                logToken?: (string|null);
                options?: (berty.protocol.ILogStreamOptions|null);
            }

            class Request implements IRequest {

                public logToken: string;
                public options?: (berty.protocol.ILogStreamOptions|null);
                public static create(properties?: berty.protocol.LogStream.IRequest): berty.protocol.LogStream.Request;
                public static encode(message: berty.protocol.LogStream.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.protocol.LogStream.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.protocol.LogStream.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.protocol.LogStream.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.protocol.LogStream.Request;
                public static toObject(message: berty.protocol.LogStream.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        class ProtocolService extends $protobuf.rpc.Service {

            public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): ProtocolService;
            public instanceExportData(request: berty.types.InstanceExportData.IRequest, callback: berty.protocol.ProtocolService.InstanceExportDataCallback): void;
            public instanceExportData(request: berty.types.InstanceExportData.IRequest): Promise<berty.types.InstanceExportData.Reply>;
            public instanceGetConfiguration(request: berty.types.InstanceGetConfiguration.IRequest, callback: berty.protocol.ProtocolService.InstanceGetConfigurationCallback): void;
            public instanceGetConfiguration(request: berty.types.InstanceGetConfiguration.IRequest): Promise<berty.types.InstanceGetConfiguration.Reply>;
            public contactRequestReference(request: berty.types.ContactRequestReference.IRequest, callback: berty.protocol.ProtocolService.ContactRequestReferenceCallback): void;
            public contactRequestReference(request: berty.types.ContactRequestReference.IRequest): Promise<berty.types.ContactRequestReference.Reply>;
            public contactRequestDisable(request: berty.types.ContactRequestDisable.IRequest, callback: berty.protocol.ProtocolService.ContactRequestDisableCallback): void;
            public contactRequestDisable(request: berty.types.ContactRequestDisable.IRequest): Promise<berty.types.ContactRequestDisable.Reply>;
            public contactRequestEnable(request: berty.types.ContactRequestEnable.IRequest, callback: berty.protocol.ProtocolService.ContactRequestEnableCallback): void;
            public contactRequestEnable(request: berty.types.ContactRequestEnable.IRequest): Promise<berty.types.ContactRequestEnable.Reply>;
            public contactRequestResetReference(request: berty.types.ContactRequestResetReference.IRequest, callback: berty.protocol.ProtocolService.ContactRequestResetReferenceCallback): void;
            public contactRequestResetReference(request: berty.types.ContactRequestResetReference.IRequest): Promise<berty.types.ContactRequestResetReference.Reply>;
            public contactRequestSend(request: berty.types.ContactRequestSend.IRequest, callback: berty.protocol.ProtocolService.ContactRequestSendCallback): void;
            public contactRequestSend(request: berty.types.ContactRequestSend.IRequest): Promise<berty.types.ContactRequestSend.Reply>;
            public contactRequestAccept(request: berty.types.ContactRequestAccept.IRequest, callback: berty.protocol.ProtocolService.ContactRequestAcceptCallback): void;
            public contactRequestAccept(request: berty.types.ContactRequestAccept.IRequest): Promise<berty.types.ContactRequestAccept.Reply>;
            public contactRequestDiscard(request: berty.types.ContactRequestDiscard.IRequest, callback: berty.protocol.ProtocolService.ContactRequestDiscardCallback): void;
            public contactRequestDiscard(request: berty.types.ContactRequestDiscard.IRequest): Promise<berty.types.ContactRequestDiscard.Reply>;
            public contactBlock(request: berty.types.ContactBlock.IRequest, callback: berty.protocol.ProtocolService.ContactBlockCallback): void;
            public contactBlock(request: berty.types.ContactBlock.IRequest): Promise<berty.types.ContactBlock.Reply>;
            public contactUnblock(request: berty.types.ContactUnblock.IRequest, callback: berty.protocol.ProtocolService.ContactUnblockCallback): void;
            public contactUnblock(request: berty.types.ContactUnblock.IRequest): Promise<berty.types.ContactUnblock.Reply>;
            public contactAliasKeySend(request: berty.types.ContactAliasKeySend.IRequest, callback: berty.protocol.ProtocolService.ContactAliasKeySendCallback): void;
            public contactAliasKeySend(request: berty.types.ContactAliasKeySend.IRequest): Promise<berty.types.ContactAliasKeySend.Reply>;
            public multiMemberGroupCreate(request: berty.types.MultiMemberGroupCreate.IRequest, callback: berty.protocol.ProtocolService.MultiMemberGroupCreateCallback): void;
            public multiMemberGroupCreate(request: berty.types.MultiMemberGroupCreate.IRequest): Promise<berty.types.MultiMemberGroupCreate.Reply>;
            public multiMemberGroupJoin(request: berty.types.MultiMemberGroupJoin.IRequest, callback: berty.protocol.ProtocolService.MultiMemberGroupJoinCallback): void;
            public multiMemberGroupJoin(request: berty.types.MultiMemberGroupJoin.IRequest): Promise<berty.types.MultiMemberGroupJoin.Reply>;
            public multiMemberGroupLeave(request: berty.types.MultiMemberGroupLeave.IRequest, callback: berty.protocol.ProtocolService.MultiMemberGroupLeaveCallback): void;
            public multiMemberGroupLeave(request: berty.types.MultiMemberGroupLeave.IRequest): Promise<berty.types.MultiMemberGroupLeave.Reply>;
            public multiMemberGroupAliasResolverDisclose(request: berty.types.MultiMemberGroupAliasResolverDisclose.IRequest, callback: berty.protocol.ProtocolService.MultiMemberGroupAliasResolverDiscloseCallback): void;
            public multiMemberGroupAliasResolverDisclose(request: berty.types.MultiMemberGroupAliasResolverDisclose.IRequest): Promise<berty.types.MultiMemberGroupAliasResolverDisclose.Reply>;
            public multiMemberGroupAdminRoleGrant(request: berty.types.MultiMemberGroupAdminRoleGrant.IRequest, callback: berty.protocol.ProtocolService.MultiMemberGroupAdminRoleGrantCallback): void;
            public multiMemberGroupAdminRoleGrant(request: berty.types.MultiMemberGroupAdminRoleGrant.IRequest): Promise<berty.types.MultiMemberGroupAdminRoleGrant.Reply>;
            public multiMemberGroupInvitationCreate(request: berty.types.MultiMemberGroupInvitationCreate.IRequest, callback: berty.protocol.ProtocolService.MultiMemberGroupInvitationCreateCallback): void;
            public multiMemberGroupInvitationCreate(request: berty.types.MultiMemberGroupInvitationCreate.IRequest): Promise<berty.types.MultiMemberGroupInvitationCreate.Reply>;
            public appMetadataSend(request: berty.types.AppMetadataSend.IRequest, callback: berty.protocol.ProtocolService.AppMetadataSendCallback): void;
            public appMetadataSend(request: berty.types.AppMetadataSend.IRequest): Promise<berty.types.AppMetadataSend.Reply>;
            public appMessageSend(request: berty.types.AppMessageSend.IRequest, callback: berty.protocol.ProtocolService.AppMessageSendCallback): void;
            public appMessageSend(request: berty.types.AppMessageSend.IRequest): Promise<berty.types.AppMessageSend.Reply>;
            public groupMetadataSubscribe(request: berty.types.GroupMetadataSubscribe.IRequest, callback: berty.protocol.ProtocolService.GroupMetadataSubscribeCallback): void;
            public groupMetadataSubscribe(request: berty.types.GroupMetadataSubscribe.IRequest): Promise<berty.types.GroupMetadataEvent>;
            public groupMessageSubscribe(request: berty.types.GroupMessageSubscribe.IRequest, callback: berty.protocol.ProtocolService.GroupMessageSubscribeCallback): void;
            public groupMessageSubscribe(request: berty.types.GroupMessageSubscribe.IRequest): Promise<berty.types.GroupMessageEvent>;
            public groupMetadataList(request: berty.types.GroupMetadataList.IRequest, callback: berty.protocol.ProtocolService.GroupMetadataListCallback): void;
            public groupMetadataList(request: berty.types.GroupMetadataList.IRequest): Promise<berty.types.GroupMetadataEvent>;
            public groupMessageList(request: berty.types.GroupMessageList.IRequest, callback: berty.protocol.ProtocolService.GroupMessageListCallback): void;
            public groupMessageList(request: berty.types.GroupMessageList.IRequest): Promise<berty.types.GroupMessageEvent>;
            public groupInfo(request: berty.types.GroupInfo.IRequest, callback: berty.protocol.ProtocolService.GroupInfoCallback): void;
            public groupInfo(request: berty.types.GroupInfo.IRequest): Promise<berty.types.GroupInfo.Reply>;
            public activateGroup(request: berty.types.ActivateGroup.IRequest, callback: berty.protocol.ProtocolService.ActivateGroupCallback): void;
            public activateGroup(request: berty.types.ActivateGroup.IRequest): Promise<berty.types.ActivateGroup.Reply>;
            public deactivateGroup(request: berty.types.DeactivateGroup.IRequest, callback: berty.protocol.ProtocolService.DeactivateGroupCallback): void;
            public deactivateGroup(request: berty.types.DeactivateGroup.IRequest): Promise<berty.types.DeactivateGroup.Reply>;
        }

        namespace ProtocolService {

            type InstanceExportDataCallback = (error: (Error|null), response?: berty.types.InstanceExportData.Reply) => void;

            type InstanceGetConfigurationCallback = (error: (Error|null), response?: berty.types.InstanceGetConfiguration.Reply) => void;

            type ContactRequestReferenceCallback = (error: (Error|null), response?: berty.types.ContactRequestReference.Reply) => void;

            type ContactRequestDisableCallback = (error: (Error|null), response?: berty.types.ContactRequestDisable.Reply) => void;

            type ContactRequestEnableCallback = (error: (Error|null), response?: berty.types.ContactRequestEnable.Reply) => void;

            type ContactRequestResetReferenceCallback = (error: (Error|null), response?: berty.types.ContactRequestResetReference.Reply) => void;

            type ContactRequestSendCallback = (error: (Error|null), response?: berty.types.ContactRequestSend.Reply) => void;

            type ContactRequestAcceptCallback = (error: (Error|null), response?: berty.types.ContactRequestAccept.Reply) => void;

            type ContactRequestDiscardCallback = (error: (Error|null), response?: berty.types.ContactRequestDiscard.Reply) => void;

            type ContactBlockCallback = (error: (Error|null), response?: berty.types.ContactBlock.Reply) => void;

            type ContactUnblockCallback = (error: (Error|null), response?: berty.types.ContactUnblock.Reply) => void;

            type ContactAliasKeySendCallback = (error: (Error|null), response?: berty.types.ContactAliasKeySend.Reply) => void;

            type MultiMemberGroupCreateCallback = (error: (Error|null), response?: berty.types.MultiMemberGroupCreate.Reply) => void;

            type MultiMemberGroupJoinCallback = (error: (Error|null), response?: berty.types.MultiMemberGroupJoin.Reply) => void;

            type MultiMemberGroupLeaveCallback = (error: (Error|null), response?: berty.types.MultiMemberGroupLeave.Reply) => void;

            type MultiMemberGroupAliasResolverDiscloseCallback = (error: (Error|null), response?: berty.types.MultiMemberGroupAliasResolverDisclose.Reply) => void;

            type MultiMemberGroupAdminRoleGrantCallback = (error: (Error|null), response?: berty.types.MultiMemberGroupAdminRoleGrant.Reply) => void;

            type MultiMemberGroupInvitationCreateCallback = (error: (Error|null), response?: berty.types.MultiMemberGroupInvitationCreate.Reply) => void;

            type AppMetadataSendCallback = (error: (Error|null), response?: berty.types.AppMetadataSend.Reply) => void;

            type AppMessageSendCallback = (error: (Error|null), response?: berty.types.AppMessageSend.Reply) => void;

            type GroupMetadataSubscribeCallback = (error: (Error|null), response?: berty.types.GroupMetadataEvent) => void;

            type GroupMessageSubscribeCallback = (error: (Error|null), response?: berty.types.GroupMessageEvent) => void;

            type GroupMetadataListCallback = (error: (Error|null), response?: berty.types.GroupMetadataEvent) => void;

            type GroupMessageListCallback = (error: (Error|null), response?: berty.types.GroupMessageEvent) => void;

            type GroupInfoCallback = (error: (Error|null), response?: berty.types.GroupInfo.Reply) => void;

            type ActivateGroupCallback = (error: (Error|null), response?: berty.types.ActivateGroup.Reply) => void;

            type DeactivateGroupCallback = (error: (Error|null), response?: berty.types.DeactivateGroup.Reply) => void;
        }
    }

    namespace types {

        enum GroupType {
            GroupTypeUndefined = 0,
            GroupTypeAccount = 1,
            GroupTypeContact = 2,
            GroupTypeMultiMember = 3
        }

        enum EventType {
            EventTypeUndefined = 0,
            EventTypeGroupMemberDeviceAdded = 1,
            EventTypeGroupDeviceSecretAdded = 2,
            EventTypeAccountGroupJoined = 101,
            EventTypeAccountGroupLeft = 102,
            EventTypeAccountContactRequestDisabled = 103,
            EventTypeAccountContactRequestEnabled = 104,
            EventTypeAccountContactRequestReferenceReset = 105,
            EventTypeAccountContactRequestOutgoingEnqueued = 106,
            EventTypeAccountContactRequestOutgoingSent = 107,
            EventTypeAccountContactRequestIncomingReceived = 108,
            EventTypeAccountContactRequestIncomingDiscarded = 109,
            EventTypeAccountContactRequestIncomingAccepted = 110,
            EventTypeAccountContactBlocked = 111,
            EventTypeAccountContactUnblocked = 112,
            EventTypeContactAliasKeyAdded = 201,
            EventTypeMultiMemberGroupAliasResolverAdded = 301,
            EventTypeMultiMemberGroupInitialMemberAnnounced = 302,
            EventTypeMultiMemberGroupAdminRoleGranted = 303,
            EventTypeGroupMetadataPayloadSent = 1001
        }

        interface IAccount {
            group?: (berty.types.IGroup|null);
            accountPrivateKey?: (Uint8Array|null);
            aliasPrivateKey?: (Uint8Array|null);
            publicRendezvousSeed?: (Uint8Array|null);
        }

        class Account implements IAccount {

            public group?: (berty.types.IGroup|null);
            public accountPrivateKey: Uint8Array;
            public aliasPrivateKey: Uint8Array;
            public publicRendezvousSeed: Uint8Array;
            public static create(properties?: berty.types.IAccount): berty.types.Account;
            public static encode(message: berty.types.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.Account;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.Account;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.Account;
            public static toObject(message: berty.types.Account, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroup {
            publicKey?: (Uint8Array|null);
            secret?: (Uint8Array|null);
            secretSig?: (Uint8Array|null);
            groupType?: (berty.types.GroupType|null);
        }

        class Group implements IGroup {

            public publicKey: Uint8Array;
            public secret: Uint8Array;
            public secretSig: Uint8Array;
            public groupType: berty.types.GroupType;
            public static create(properties?: berty.types.IGroup): berty.types.Group;
            public static encode(message: berty.types.IGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.Group;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.Group;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.Group;
            public static toObject(message: berty.types.Group, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupMetadata {
            eventType?: (berty.types.EventType|null);
            payload?: (Uint8Array|null);
            sig?: (Uint8Array|null);
        }

        class GroupMetadata implements IGroupMetadata {

            public eventType: berty.types.EventType;
            public payload: Uint8Array;
            public sig: Uint8Array;
            public static create(properties?: berty.types.IGroupMetadata): berty.types.GroupMetadata;
            public static encode(message: berty.types.IGroupMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMetadata;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMetadata;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMetadata;
            public static toObject(message: berty.types.GroupMetadata, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupEnvelope {
            nonce?: (Uint8Array|null);
            event?: (Uint8Array|null);
        }

        class GroupEnvelope implements IGroupEnvelope {

            public nonce: Uint8Array;
            public event: Uint8Array;
            public static create(properties?: berty.types.IGroupEnvelope): berty.types.GroupEnvelope;
            public static encode(message: berty.types.IGroupEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupEnvelope;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupEnvelope;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupEnvelope;
            public static toObject(message: berty.types.GroupEnvelope, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageHeaders {
            counter?: (number|Long|null);
            devicePk?: (Uint8Array|null);
            sig?: (Uint8Array|null);
        }

        class MessageHeaders implements IMessageHeaders {

            public counter: (number|Long);
            public devicePk: Uint8Array;
            public sig: Uint8Array;
            public static create(properties?: berty.types.IMessageHeaders): berty.types.MessageHeaders;
            public static encode(message: berty.types.IMessageHeaders, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMessageHeaders, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MessageHeaders;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MessageHeaders;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MessageHeaders;
            public static toObject(message: berty.types.MessageHeaders, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMessageEnvelope {
            messageHeaders?: (Uint8Array|null);
            message?: (Uint8Array|null);
            nonce?: (Uint8Array|null);
        }

        class MessageEnvelope implements IMessageEnvelope {

            public messageHeaders: Uint8Array;
            public message: Uint8Array;
            public nonce: Uint8Array;
            public static create(properties?: berty.types.IMessageEnvelope): berty.types.MessageEnvelope;
            public static encode(message: berty.types.IMessageEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMessageEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MessageEnvelope;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MessageEnvelope;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MessageEnvelope;
            public static toObject(message: berty.types.MessageEnvelope, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IEventContext {
            id?: (Uint8Array|null);
            parentIds?: (Uint8Array[]|null);
            groupPk?: (Uint8Array|null);
        }

        class EventContext implements IEventContext {

            public id: Uint8Array;
            public parentIds: Uint8Array[];
            public groupPk: Uint8Array;
            public static create(properties?: berty.types.IEventContext): berty.types.EventContext;
            public static encode(message: berty.types.IEventContext, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IEventContext, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.EventContext;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.EventContext;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.EventContext;
            public static toObject(message: berty.types.EventContext, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAppMetadata {
            devicePk?: (Uint8Array|null);
            message?: (Uint8Array|null);
        }

        class AppMetadata implements IAppMetadata {

            public devicePk: Uint8Array;
            public message: Uint8Array;
            public static create(properties?: berty.types.IAppMetadata): berty.types.AppMetadata;
            public static encode(message: berty.types.IAppMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAppMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMetadata;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMetadata;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AppMetadata;
            public static toObject(message: berty.types.AppMetadata, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IContactAddAliasKey {
            devicePk?: (Uint8Array|null);
            aliasPk?: (Uint8Array|null);
        }

        class ContactAddAliasKey implements IContactAddAliasKey {

            public devicePk: Uint8Array;
            public aliasPk: Uint8Array;
            public static create(properties?: berty.types.IContactAddAliasKey): berty.types.ContactAddAliasKey;
            public static encode(message: berty.types.IContactAddAliasKey, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactAddAliasKey, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactAddAliasKey;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactAddAliasKey;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactAddAliasKey;
            public static toObject(message: berty.types.ContactAddAliasKey, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupAddMemberDevice {
            memberPk?: (Uint8Array|null);
            devicePk?: (Uint8Array|null);
            memberSig?: (Uint8Array|null);
        }

        class GroupAddMemberDevice implements IGroupAddMemberDevice {

            public memberPk: Uint8Array;
            public devicePk: Uint8Array;
            public memberSig: Uint8Array;
            public static create(properties?: berty.types.IGroupAddMemberDevice): berty.types.GroupAddMemberDevice;
            public static encode(message: berty.types.IGroupAddMemberDevice, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupAddMemberDevice, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupAddMemberDevice;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupAddMemberDevice;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupAddMemberDevice;
            public static toObject(message: berty.types.GroupAddMemberDevice, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IDeviceSecret {
            chainKey?: (Uint8Array|null);
            counter?: (number|Long|null);
        }

        class DeviceSecret implements IDeviceSecret {

            public chainKey: Uint8Array;
            public counter: (number|Long);
            public static create(properties?: berty.types.IDeviceSecret): berty.types.DeviceSecret;
            public static encode(message: berty.types.IDeviceSecret, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IDeviceSecret, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DeviceSecret;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DeviceSecret;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.DeviceSecret;
            public static toObject(message: berty.types.DeviceSecret, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupAddDeviceSecret {
            devicePk?: (Uint8Array|null);
            destMemberPk?: (Uint8Array|null);
            payload?: (Uint8Array|null);
        }

        class GroupAddDeviceSecret implements IGroupAddDeviceSecret {

            public devicePk: Uint8Array;
            public destMemberPk: Uint8Array;
            public payload: Uint8Array;
            public static create(properties?: berty.types.IGroupAddDeviceSecret): berty.types.GroupAddDeviceSecret;
            public static encode(message: berty.types.IGroupAddDeviceSecret, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupAddDeviceSecret, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupAddDeviceSecret;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupAddDeviceSecret;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupAddDeviceSecret;
            public static toObject(message: berty.types.GroupAddDeviceSecret, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMultiMemberGroupAddAliasResolver {
            devicePk?: (Uint8Array|null);
            aliasResolver?: (Uint8Array|null);
            aliasProof?: (Uint8Array|null);
        }

        class MultiMemberGroupAddAliasResolver implements IMultiMemberGroupAddAliasResolver {

            public devicePk: Uint8Array;
            public aliasResolver: Uint8Array;
            public aliasProof: Uint8Array;
            public static create(properties?: berty.types.IMultiMemberGroupAddAliasResolver): berty.types.MultiMemberGroupAddAliasResolver;
            public static encode(message: berty.types.IMultiMemberGroupAddAliasResolver, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupAddAliasResolver, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAddAliasResolver;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAddAliasResolver;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAddAliasResolver;
            public static toObject(message: berty.types.MultiMemberGroupAddAliasResolver, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMultiMemberGrantAdminRole {
            devicePk?: (Uint8Array|null);
            granteeMemberPk?: (Uint8Array|null);
        }

        class MultiMemberGrantAdminRole implements IMultiMemberGrantAdminRole {

            public devicePk: Uint8Array;
            public granteeMemberPk: Uint8Array;
            public static create(properties?: berty.types.IMultiMemberGrantAdminRole): berty.types.MultiMemberGrantAdminRole;
            public static encode(message: berty.types.IMultiMemberGrantAdminRole, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGrantAdminRole, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGrantAdminRole;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGrantAdminRole;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGrantAdminRole;
            public static toObject(message: berty.types.MultiMemberGrantAdminRole, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMultiMemberInitialMember {
            memberPk?: (Uint8Array|null);
        }

        class MultiMemberInitialMember implements IMultiMemberInitialMember {

            public memberPk: Uint8Array;
            public static create(properties?: berty.types.IMultiMemberInitialMember): berty.types.MultiMemberInitialMember;
            public static encode(message: berty.types.IMultiMemberInitialMember, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberInitialMember, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberInitialMember;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberInitialMember;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberInitialMember;
            public static toObject(message: berty.types.MultiMemberInitialMember, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupAddAdditionalRendezvousSeed {
            devicePk?: (Uint8Array|null);
            seed?: (Uint8Array|null);
        }

        class GroupAddAdditionalRendezvousSeed implements IGroupAddAdditionalRendezvousSeed {

            public devicePk: Uint8Array;
            public seed: Uint8Array;
            public static create(properties?: berty.types.IGroupAddAdditionalRendezvousSeed): berty.types.GroupAddAdditionalRendezvousSeed;
            public static encode(message: berty.types.IGroupAddAdditionalRendezvousSeed, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupAddAdditionalRendezvousSeed, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupAddAdditionalRendezvousSeed;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupAddAdditionalRendezvousSeed;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupAddAdditionalRendezvousSeed;
            public static toObject(message: berty.types.GroupAddAdditionalRendezvousSeed, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupRemoveAdditionalRendezvousSeed {
            devicePk?: (Uint8Array|null);
            seed?: (Uint8Array|null);
        }

        class GroupRemoveAdditionalRendezvousSeed implements IGroupRemoveAdditionalRendezvousSeed {

            public devicePk: Uint8Array;
            public seed: Uint8Array;
            public static create(properties?: berty.types.IGroupRemoveAdditionalRendezvousSeed): berty.types.GroupRemoveAdditionalRendezvousSeed;
            public static encode(message: berty.types.IGroupRemoveAdditionalRendezvousSeed, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupRemoveAdditionalRendezvousSeed, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupRemoveAdditionalRendezvousSeed;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupRemoveAdditionalRendezvousSeed;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupRemoveAdditionalRendezvousSeed;
            public static toObject(message: berty.types.GroupRemoveAdditionalRendezvousSeed, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountGroupJoined {
            devicePk?: (Uint8Array|null);
            group?: (berty.types.IGroup|null);
        }

        class AccountGroupJoined implements IAccountGroupJoined {

            public devicePk: Uint8Array;
            public group?: (berty.types.IGroup|null);
            public static create(properties?: berty.types.IAccountGroupJoined): berty.types.AccountGroupJoined;
            public static encode(message: berty.types.IAccountGroupJoined, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountGroupJoined, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountGroupJoined;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountGroupJoined;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountGroupJoined;
            public static toObject(message: berty.types.AccountGroupJoined, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountGroupLeft {
            devicePk?: (Uint8Array|null);
            groupPk?: (Uint8Array|null);
        }

        class AccountGroupLeft implements IAccountGroupLeft {

            public devicePk: Uint8Array;
            public groupPk: Uint8Array;
            public static create(properties?: berty.types.IAccountGroupLeft): berty.types.AccountGroupLeft;
            public static encode(message: berty.types.IAccountGroupLeft, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountGroupLeft, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountGroupLeft;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountGroupLeft;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountGroupLeft;
            public static toObject(message: berty.types.AccountGroupLeft, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestDisabled {
            devicePk?: (Uint8Array|null);
        }

        class AccountContactRequestDisabled implements IAccountContactRequestDisabled {

            public devicePk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestDisabled): berty.types.AccountContactRequestDisabled;
            public static encode(message: berty.types.IAccountContactRequestDisabled, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestDisabled, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestDisabled;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestDisabled;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestDisabled;
            public static toObject(message: berty.types.AccountContactRequestDisabled, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestEnabled {
            devicePk?: (Uint8Array|null);
        }

        class AccountContactRequestEnabled implements IAccountContactRequestEnabled {

            public devicePk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestEnabled): berty.types.AccountContactRequestEnabled;
            public static encode(message: berty.types.IAccountContactRequestEnabled, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestEnabled, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestEnabled;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestEnabled;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestEnabled;
            public static toObject(message: berty.types.AccountContactRequestEnabled, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestReferenceReset {
            devicePk?: (Uint8Array|null);
            publicRendezvousSeed?: (Uint8Array|null);
        }

        class AccountContactRequestReferenceReset implements IAccountContactRequestReferenceReset {

            public devicePk: Uint8Array;
            public publicRendezvousSeed: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestReferenceReset): berty.types.AccountContactRequestReferenceReset;
            public static encode(message: berty.types.IAccountContactRequestReferenceReset, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestReferenceReset, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestReferenceReset;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestReferenceReset;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestReferenceReset;
            public static toObject(message: berty.types.AccountContactRequestReferenceReset, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestEnqueued {
            devicePk?: (Uint8Array|null);
            groupPk?: (Uint8Array|null);
            contact?: (berty.types.IShareableContact|null);
        }

        class AccountContactRequestEnqueued implements IAccountContactRequestEnqueued {

            public devicePk: Uint8Array;
            public groupPk: Uint8Array;
            public contact?: (berty.types.IShareableContact|null);
            public static create(properties?: berty.types.IAccountContactRequestEnqueued): berty.types.AccountContactRequestEnqueued;
            public static encode(message: berty.types.IAccountContactRequestEnqueued, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestEnqueued, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestEnqueued;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestEnqueued;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestEnqueued;
            public static toObject(message: berty.types.AccountContactRequestEnqueued, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestSent {
            devicePk?: (Uint8Array|null);
            contactPk?: (Uint8Array|null);
        }

        class AccountContactRequestSent implements IAccountContactRequestSent {

            public devicePk: Uint8Array;
            public contactPk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestSent): berty.types.AccountContactRequestSent;
            public static encode(message: berty.types.IAccountContactRequestSent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestSent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestSent;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestSent;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestSent;
            public static toObject(message: berty.types.AccountContactRequestSent, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestReceived {
            devicePk?: (Uint8Array|null);
            contactPk?: (Uint8Array|null);
            contactRendezvousSeed?: (Uint8Array|null);
            contactMetadata?: (Uint8Array|null);
        }

        class AccountContactRequestReceived implements IAccountContactRequestReceived {

            public devicePk: Uint8Array;
            public contactPk: Uint8Array;
            public contactRendezvousSeed: Uint8Array;
            public contactMetadata: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestReceived): berty.types.AccountContactRequestReceived;
            public static encode(message: berty.types.IAccountContactRequestReceived, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestReceived, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestReceived;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestReceived;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestReceived;
            public static toObject(message: berty.types.AccountContactRequestReceived, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestDiscarded {
            devicePk?: (Uint8Array|null);
            contactPk?: (Uint8Array|null);
        }

        class AccountContactRequestDiscarded implements IAccountContactRequestDiscarded {

            public devicePk: Uint8Array;
            public contactPk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestDiscarded): berty.types.AccountContactRequestDiscarded;
            public static encode(message: berty.types.IAccountContactRequestDiscarded, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestDiscarded, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestDiscarded;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestDiscarded;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestDiscarded;
            public static toObject(message: berty.types.AccountContactRequestDiscarded, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactRequestAccepted {
            devicePk?: (Uint8Array|null);
            contactPk?: (Uint8Array|null);
            groupPk?: (Uint8Array|null);
        }

        class AccountContactRequestAccepted implements IAccountContactRequestAccepted {

            public devicePk: Uint8Array;
            public contactPk: Uint8Array;
            public groupPk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactRequestAccepted): berty.types.AccountContactRequestAccepted;
            public static encode(message: berty.types.IAccountContactRequestAccepted, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactRequestAccepted, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactRequestAccepted;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactRequestAccepted;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactRequestAccepted;
            public static toObject(message: berty.types.AccountContactRequestAccepted, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactBlocked {
            devicePk?: (Uint8Array|null);
            contactPk?: (Uint8Array|null);
        }

        class AccountContactBlocked implements IAccountContactBlocked {

            public devicePk: Uint8Array;
            public contactPk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactBlocked): berty.types.AccountContactBlocked;
            public static encode(message: berty.types.IAccountContactBlocked, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactBlocked, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactBlocked;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactBlocked;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactBlocked;
            public static toObject(message: berty.types.AccountContactBlocked, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IAccountContactUnblocked {
            devicePk?: (Uint8Array|null);
            contactPk?: (Uint8Array|null);
        }

        class AccountContactUnblocked implements IAccountContactUnblocked {

            public devicePk: Uint8Array;
            public contactPk: Uint8Array;
            public static create(properties?: berty.types.IAccountContactUnblocked): berty.types.AccountContactUnblocked;
            public static encode(message: berty.types.IAccountContactUnblocked, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAccountContactUnblocked, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AccountContactUnblocked;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AccountContactUnblocked;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AccountContactUnblocked;
            public static toObject(message: berty.types.AccountContactUnblocked, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IInstanceExportData {
        }

        class InstanceExportData implements IInstanceExportData {

            public static create(properties?: berty.types.IInstanceExportData): berty.types.InstanceExportData;
            public static encode(message: berty.types.IInstanceExportData, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IInstanceExportData, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.InstanceExportData;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.InstanceExportData;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.InstanceExportData;
            public static toObject(message: berty.types.InstanceExportData, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace InstanceExportData {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.InstanceExportData.IRequest): berty.types.InstanceExportData.Request;
                public static encode(message: berty.types.InstanceExportData.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.InstanceExportData.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.InstanceExportData.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.InstanceExportData.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.InstanceExportData.Request;
                public static toObject(message: berty.types.InstanceExportData.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                exportedData?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public exportedData: Uint8Array;
                public static create(properties?: berty.types.InstanceExportData.IReply): berty.types.InstanceExportData.Reply;
                public static encode(message: berty.types.InstanceExportData.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.InstanceExportData.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.InstanceExportData.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.InstanceExportData.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.InstanceExportData.Reply;
                public static toObject(message: berty.types.InstanceExportData.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IInstanceGetConfiguration {
        }

        class InstanceGetConfiguration implements IInstanceGetConfiguration {

            public static create(properties?: berty.types.IInstanceGetConfiguration): berty.types.InstanceGetConfiguration;
            public static encode(message: berty.types.IInstanceGetConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IInstanceGetConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.InstanceGetConfiguration;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.InstanceGetConfiguration;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.InstanceGetConfiguration;
            public static toObject(message: berty.types.InstanceGetConfiguration, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace InstanceGetConfiguration {

            enum SettingState {
                Unknown = 0,
                Enabled = 1,
                Disabled = 2,
                Unavailable = 3
            }

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.InstanceGetConfiguration.IRequest): berty.types.InstanceGetConfiguration.Request;
                public static encode(message: berty.types.InstanceGetConfiguration.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.InstanceGetConfiguration.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.InstanceGetConfiguration.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.InstanceGetConfiguration.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.InstanceGetConfiguration.Request;
                public static toObject(message: berty.types.InstanceGetConfiguration.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                accountPk?: (Uint8Array|null);
                devicePk?: (Uint8Array|null);
                accountGroupPk?: (Uint8Array|null);
                peerId?: (string|null);
                listeners?: (string[]|null);
                bleEnabled?: (berty.types.InstanceGetConfiguration.SettingState|null);
                wifiP2pEnabled?: (berty.types.InstanceGetConfiguration.SettingState|null);
                mdnsEnabled?: (berty.types.InstanceGetConfiguration.SettingState|null);
                relayEnabled?: (berty.types.InstanceGetConfiguration.SettingState|null);
            }

            class Reply implements IReply {

                public accountPk: Uint8Array;
                public devicePk: Uint8Array;
                public accountGroupPk: Uint8Array;
                public peerId: string;
                public listeners: string[];
                public bleEnabled: berty.types.InstanceGetConfiguration.SettingState;
                public wifiP2pEnabled: berty.types.InstanceGetConfiguration.SettingState;
                public mdnsEnabled: berty.types.InstanceGetConfiguration.SettingState;
                public relayEnabled: berty.types.InstanceGetConfiguration.SettingState;
                public static create(properties?: berty.types.InstanceGetConfiguration.IReply): berty.types.InstanceGetConfiguration.Reply;
                public static encode(message: berty.types.InstanceGetConfiguration.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.InstanceGetConfiguration.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.InstanceGetConfiguration.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.InstanceGetConfiguration.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.InstanceGetConfiguration.Reply;
                public static toObject(message: berty.types.InstanceGetConfiguration.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestReference {
        }

        class ContactRequestReference implements IContactRequestReference {

            public static create(properties?: berty.types.IContactRequestReference): berty.types.ContactRequestReference;
            public static encode(message: berty.types.IContactRequestReference, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestReference, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestReference;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestReference;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestReference;
            public static toObject(message: berty.types.ContactRequestReference, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestReference {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.ContactRequestReference.IRequest): berty.types.ContactRequestReference.Request;
                public static encode(message: berty.types.ContactRequestReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestReference.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestReference.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestReference.Request;
                public static toObject(message: berty.types.ContactRequestReference.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                publicRendezvousSeed?: (Uint8Array|null);
                enabled?: (boolean|null);
            }

            class Reply implements IReply {

                public publicRendezvousSeed: Uint8Array;
                public enabled: boolean;
                public static create(properties?: berty.types.ContactRequestReference.IReply): berty.types.ContactRequestReference.Reply;
                public static encode(message: berty.types.ContactRequestReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestReference.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestReference.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestReference.Reply;
                public static toObject(message: berty.types.ContactRequestReference.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestDisable {
        }

        class ContactRequestDisable implements IContactRequestDisable {

            public static create(properties?: berty.types.IContactRequestDisable): berty.types.ContactRequestDisable;
            public static encode(message: berty.types.IContactRequestDisable, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestDisable, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestDisable;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestDisable;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestDisable;
            public static toObject(message: berty.types.ContactRequestDisable, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestDisable {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.ContactRequestDisable.IRequest): berty.types.ContactRequestDisable.Request;
                public static encode(message: berty.types.ContactRequestDisable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestDisable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestDisable.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestDisable.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestDisable.Request;
                public static toObject(message: berty.types.ContactRequestDisable.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactRequestDisable.IReply): berty.types.ContactRequestDisable.Reply;
                public static encode(message: berty.types.ContactRequestDisable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestDisable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestDisable.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestDisable.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestDisable.Reply;
                public static toObject(message: berty.types.ContactRequestDisable.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestEnable {
        }

        class ContactRequestEnable implements IContactRequestEnable {

            public static create(properties?: berty.types.IContactRequestEnable): berty.types.ContactRequestEnable;
            public static encode(message: berty.types.IContactRequestEnable, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestEnable, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestEnable;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestEnable;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestEnable;
            public static toObject(message: berty.types.ContactRequestEnable, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestEnable {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.ContactRequestEnable.IRequest): berty.types.ContactRequestEnable.Request;
                public static encode(message: berty.types.ContactRequestEnable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestEnable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestEnable.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestEnable.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestEnable.Request;
                public static toObject(message: berty.types.ContactRequestEnable.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                publicRendezvousSeed?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public publicRendezvousSeed: Uint8Array;
                public static create(properties?: berty.types.ContactRequestEnable.IReply): berty.types.ContactRequestEnable.Reply;
                public static encode(message: berty.types.ContactRequestEnable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestEnable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestEnable.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestEnable.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestEnable.Reply;
                public static toObject(message: berty.types.ContactRequestEnable.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestResetReference {
        }

        class ContactRequestResetReference implements IContactRequestResetReference {

            public static create(properties?: berty.types.IContactRequestResetReference): berty.types.ContactRequestResetReference;
            public static encode(message: berty.types.IContactRequestResetReference, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestResetReference, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestResetReference;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestResetReference;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestResetReference;
            public static toObject(message: berty.types.ContactRequestResetReference, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestResetReference {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.ContactRequestResetReference.IRequest): berty.types.ContactRequestResetReference.Request;
                public static encode(message: berty.types.ContactRequestResetReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestResetReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestResetReference.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestResetReference.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestResetReference.Request;
                public static toObject(message: berty.types.ContactRequestResetReference.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                publicRendezvousSeed?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public publicRendezvousSeed: Uint8Array;
                public static create(properties?: berty.types.ContactRequestResetReference.IReply): berty.types.ContactRequestResetReference.Reply;
                public static encode(message: berty.types.ContactRequestResetReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestResetReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestResetReference.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestResetReference.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestResetReference.Reply;
                public static toObject(message: berty.types.ContactRequestResetReference.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestSend {
        }

        class ContactRequestSend implements IContactRequestSend {

            public static create(properties?: berty.types.IContactRequestSend): berty.types.ContactRequestSend;
            public static encode(message: berty.types.IContactRequestSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestSend;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestSend;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestSend;
            public static toObject(message: berty.types.ContactRequestSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestSend {

            interface IRequest {
                contact?: (berty.types.IShareableContact|null);
            }

            class Request implements IRequest {

                public contact?: (berty.types.IShareableContact|null);
                public static create(properties?: berty.types.ContactRequestSend.IRequest): berty.types.ContactRequestSend.Request;
                public static encode(message: berty.types.ContactRequestSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestSend.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestSend.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestSend.Request;
                public static toObject(message: berty.types.ContactRequestSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactRequestSend.IReply): berty.types.ContactRequestSend.Reply;
                public static encode(message: berty.types.ContactRequestSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestSend.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestSend.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestSend.Reply;
                public static toObject(message: berty.types.ContactRequestSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestAccept {
        }

        class ContactRequestAccept implements IContactRequestAccept {

            public static create(properties?: berty.types.IContactRequestAccept): berty.types.ContactRequestAccept;
            public static encode(message: berty.types.IContactRequestAccept, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestAccept, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestAccept;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestAccept;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestAccept;
            public static toObject(message: berty.types.ContactRequestAccept, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestAccept {

            interface IRequest {
                contactPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public contactPk: Uint8Array;
                public static create(properties?: berty.types.ContactRequestAccept.IRequest): berty.types.ContactRequestAccept.Request;
                public static encode(message: berty.types.ContactRequestAccept.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestAccept.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestAccept.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestAccept.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestAccept.Request;
                public static toObject(message: berty.types.ContactRequestAccept.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactRequestAccept.IReply): berty.types.ContactRequestAccept.Reply;
                public static encode(message: berty.types.ContactRequestAccept.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestAccept.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestAccept.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestAccept.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestAccept.Reply;
                public static toObject(message: berty.types.ContactRequestAccept.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactRequestDiscard {
        }

        class ContactRequestDiscard implements IContactRequestDiscard {

            public static create(properties?: berty.types.IContactRequestDiscard): berty.types.ContactRequestDiscard;
            public static encode(message: berty.types.IContactRequestDiscard, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactRequestDiscard, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestDiscard;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestDiscard;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestDiscard;
            public static toObject(message: berty.types.ContactRequestDiscard, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactRequestDiscard {

            interface IRequest {
                contactPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public contactPk: Uint8Array;
                public static create(properties?: berty.types.ContactRequestDiscard.IRequest): berty.types.ContactRequestDiscard.Request;
                public static encode(message: berty.types.ContactRequestDiscard.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestDiscard.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestDiscard.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestDiscard.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestDiscard.Request;
                public static toObject(message: berty.types.ContactRequestDiscard.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactRequestDiscard.IReply): berty.types.ContactRequestDiscard.Reply;
                public static encode(message: berty.types.ContactRequestDiscard.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactRequestDiscard.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactRequestDiscard.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactRequestDiscard.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactRequestDiscard.Reply;
                public static toObject(message: berty.types.ContactRequestDiscard.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactBlock {
        }

        class ContactBlock implements IContactBlock {

            public static create(properties?: berty.types.IContactBlock): berty.types.ContactBlock;
            public static encode(message: berty.types.IContactBlock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactBlock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactBlock;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactBlock;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactBlock;
            public static toObject(message: berty.types.ContactBlock, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactBlock {

            interface IRequest {
                contactPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public contactPk: Uint8Array;
                public static create(properties?: berty.types.ContactBlock.IRequest): berty.types.ContactBlock.Request;
                public static encode(message: berty.types.ContactBlock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactBlock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactBlock.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactBlock.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactBlock.Request;
                public static toObject(message: berty.types.ContactBlock.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactBlock.IReply): berty.types.ContactBlock.Reply;
                public static encode(message: berty.types.ContactBlock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactBlock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactBlock.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactBlock.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactBlock.Reply;
                public static toObject(message: berty.types.ContactBlock.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactUnblock {
        }

        class ContactUnblock implements IContactUnblock {

            public static create(properties?: berty.types.IContactUnblock): berty.types.ContactUnblock;
            public static encode(message: berty.types.IContactUnblock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactUnblock, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactUnblock;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactUnblock;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactUnblock;
            public static toObject(message: berty.types.ContactUnblock, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactUnblock {

            interface IRequest {
                contactPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public contactPk: Uint8Array;
                public static create(properties?: berty.types.ContactUnblock.IRequest): berty.types.ContactUnblock.Request;
                public static encode(message: berty.types.ContactUnblock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactUnblock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactUnblock.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactUnblock.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactUnblock.Request;
                public static toObject(message: berty.types.ContactUnblock.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactUnblock.IReply): berty.types.ContactUnblock.Reply;
                public static encode(message: berty.types.ContactUnblock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactUnblock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactUnblock.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactUnblock.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactUnblock.Reply;
                public static toObject(message: berty.types.ContactUnblock.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IContactAliasKeySend {
        }

        class ContactAliasKeySend implements IContactAliasKeySend {

            public static create(properties?: berty.types.IContactAliasKeySend): berty.types.ContactAliasKeySend;
            public static encode(message: berty.types.IContactAliasKeySend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IContactAliasKeySend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactAliasKeySend;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactAliasKeySend;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ContactAliasKeySend;
            public static toObject(message: berty.types.ContactAliasKeySend, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ContactAliasKeySend {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.ContactAliasKeySend.IRequest): berty.types.ContactAliasKeySend.Request;
                public static encode(message: berty.types.ContactAliasKeySend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactAliasKeySend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactAliasKeySend.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactAliasKeySend.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactAliasKeySend.Request;
                public static toObject(message: berty.types.ContactAliasKeySend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ContactAliasKeySend.IReply): berty.types.ContactAliasKeySend.Reply;
                public static encode(message: berty.types.ContactAliasKeySend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ContactAliasKeySend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ContactAliasKeySend.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ContactAliasKeySend.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ContactAliasKeySend.Reply;
                public static toObject(message: berty.types.ContactAliasKeySend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMultiMemberGroupCreate {
        }

        class MultiMemberGroupCreate implements IMultiMemberGroupCreate {

            public static create(properties?: berty.types.IMultiMemberGroupCreate): berty.types.MultiMemberGroupCreate;
            public static encode(message: berty.types.IMultiMemberGroupCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupCreate;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupCreate;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupCreate;
            public static toObject(message: berty.types.MultiMemberGroupCreate, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MultiMemberGroupCreate {

            interface IRequest {
            }

            class Request implements IRequest {

                public static create(properties?: berty.types.MultiMemberGroupCreate.IRequest): berty.types.MultiMemberGroupCreate.Request;
                public static encode(message: berty.types.MultiMemberGroupCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupCreate.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupCreate.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupCreate.Request;
                public static toObject(message: berty.types.MultiMemberGroupCreate.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                groupPk?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.MultiMemberGroupCreate.IReply): berty.types.MultiMemberGroupCreate.Reply;
                public static encode(message: berty.types.MultiMemberGroupCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupCreate.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupCreate.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupCreate.Reply;
                public static toObject(message: berty.types.MultiMemberGroupCreate.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMultiMemberGroupJoin {
        }

        class MultiMemberGroupJoin implements IMultiMemberGroupJoin {

            public static create(properties?: berty.types.IMultiMemberGroupJoin): berty.types.MultiMemberGroupJoin;
            public static encode(message: berty.types.IMultiMemberGroupJoin, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupJoin, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupJoin;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupJoin;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupJoin;
            public static toObject(message: berty.types.MultiMemberGroupJoin, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MultiMemberGroupJoin {

            interface IRequest {
                group?: (berty.types.IGroup|null);
            }

            class Request implements IRequest {

                public group?: (berty.types.IGroup|null);
                public static create(properties?: berty.types.MultiMemberGroupJoin.IRequest): berty.types.MultiMemberGroupJoin.Request;
                public static encode(message: berty.types.MultiMemberGroupJoin.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupJoin.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupJoin.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupJoin.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupJoin.Request;
                public static toObject(message: berty.types.MultiMemberGroupJoin.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.MultiMemberGroupJoin.IReply): berty.types.MultiMemberGroupJoin.Reply;
                public static encode(message: berty.types.MultiMemberGroupJoin.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupJoin.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupJoin.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupJoin.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupJoin.Reply;
                public static toObject(message: berty.types.MultiMemberGroupJoin.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMultiMemberGroupLeave {
        }

        class MultiMemberGroupLeave implements IMultiMemberGroupLeave {

            public static create(properties?: berty.types.IMultiMemberGroupLeave): berty.types.MultiMemberGroupLeave;
            public static encode(message: berty.types.IMultiMemberGroupLeave, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupLeave, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupLeave;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupLeave;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupLeave;
            public static toObject(message: berty.types.MultiMemberGroupLeave, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MultiMemberGroupLeave {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.MultiMemberGroupLeave.IRequest): berty.types.MultiMemberGroupLeave.Request;
                public static encode(message: berty.types.MultiMemberGroupLeave.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupLeave.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupLeave.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupLeave.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupLeave.Request;
                public static toObject(message: berty.types.MultiMemberGroupLeave.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.MultiMemberGroupLeave.IReply): berty.types.MultiMemberGroupLeave.Reply;
                public static encode(message: berty.types.MultiMemberGroupLeave.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupLeave.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupLeave.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupLeave.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupLeave.Reply;
                public static toObject(message: berty.types.MultiMemberGroupLeave.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMultiMemberGroupAliasResolverDisclose {
        }

        class MultiMemberGroupAliasResolverDisclose implements IMultiMemberGroupAliasResolverDisclose {

            public static create(properties?: berty.types.IMultiMemberGroupAliasResolverDisclose): berty.types.MultiMemberGroupAliasResolverDisclose;
            public static encode(message: berty.types.IMultiMemberGroupAliasResolverDisclose, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupAliasResolverDisclose, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAliasResolverDisclose;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAliasResolverDisclose;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAliasResolverDisclose;
            public static toObject(message: berty.types.MultiMemberGroupAliasResolverDisclose, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MultiMemberGroupAliasResolverDisclose {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.MultiMemberGroupAliasResolverDisclose.IRequest): berty.types.MultiMemberGroupAliasResolverDisclose.Request;
                public static encode(message: berty.types.MultiMemberGroupAliasResolverDisclose.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupAliasResolverDisclose.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAliasResolverDisclose.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAliasResolverDisclose.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAliasResolverDisclose.Request;
                public static toObject(message: berty.types.MultiMemberGroupAliasResolverDisclose.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.MultiMemberGroupAliasResolverDisclose.IReply): berty.types.MultiMemberGroupAliasResolverDisclose.Reply;
                public static encode(message: berty.types.MultiMemberGroupAliasResolverDisclose.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupAliasResolverDisclose.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAliasResolverDisclose.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAliasResolverDisclose.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAliasResolverDisclose.Reply;
                public static toObject(message: berty.types.MultiMemberGroupAliasResolverDisclose.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMultiMemberGroupAdminRoleGrant {
        }

        class MultiMemberGroupAdminRoleGrant implements IMultiMemberGroupAdminRoleGrant {

            public static create(properties?: berty.types.IMultiMemberGroupAdminRoleGrant): berty.types.MultiMemberGroupAdminRoleGrant;
            public static encode(message: berty.types.IMultiMemberGroupAdminRoleGrant, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupAdminRoleGrant, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAdminRoleGrant;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAdminRoleGrant;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAdminRoleGrant;
            public static toObject(message: berty.types.MultiMemberGroupAdminRoleGrant, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MultiMemberGroupAdminRoleGrant {

            interface IRequest {
                groupPk?: (Uint8Array|null);
                memberPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public memberPk: Uint8Array;
                public static create(properties?: berty.types.MultiMemberGroupAdminRoleGrant.IRequest): berty.types.MultiMemberGroupAdminRoleGrant.Request;
                public static encode(message: berty.types.MultiMemberGroupAdminRoleGrant.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupAdminRoleGrant.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAdminRoleGrant.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAdminRoleGrant.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAdminRoleGrant.Request;
                public static toObject(message: berty.types.MultiMemberGroupAdminRoleGrant.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.MultiMemberGroupAdminRoleGrant.IReply): berty.types.MultiMemberGroupAdminRoleGrant.Reply;
                public static encode(message: berty.types.MultiMemberGroupAdminRoleGrant.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupAdminRoleGrant.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupAdminRoleGrant.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupAdminRoleGrant.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupAdminRoleGrant.Reply;
                public static toObject(message: berty.types.MultiMemberGroupAdminRoleGrant.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IMultiMemberGroupInvitationCreate {
        }

        class MultiMemberGroupInvitationCreate implements IMultiMemberGroupInvitationCreate {

            public static create(properties?: berty.types.IMultiMemberGroupInvitationCreate): berty.types.MultiMemberGroupInvitationCreate;
            public static encode(message: berty.types.IMultiMemberGroupInvitationCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IMultiMemberGroupInvitationCreate, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupInvitationCreate;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupInvitationCreate;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupInvitationCreate;
            public static toObject(message: berty.types.MultiMemberGroupInvitationCreate, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MultiMemberGroupInvitationCreate {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.MultiMemberGroupInvitationCreate.IRequest): berty.types.MultiMemberGroupInvitationCreate.Request;
                public static encode(message: berty.types.MultiMemberGroupInvitationCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupInvitationCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupInvitationCreate.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupInvitationCreate.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupInvitationCreate.Request;
                public static toObject(message: berty.types.MultiMemberGroupInvitationCreate.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                group?: (berty.types.IGroup|null);
            }

            class Reply implements IReply {

                public group?: (berty.types.IGroup|null);
                public static create(properties?: berty.types.MultiMemberGroupInvitationCreate.IReply): berty.types.MultiMemberGroupInvitationCreate.Reply;
                public static encode(message: berty.types.MultiMemberGroupInvitationCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.MultiMemberGroupInvitationCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.MultiMemberGroupInvitationCreate.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.MultiMemberGroupInvitationCreate.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.MultiMemberGroupInvitationCreate.Reply;
                public static toObject(message: berty.types.MultiMemberGroupInvitationCreate.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAppMetadataSend {
        }

        class AppMetadataSend implements IAppMetadataSend {

            public static create(properties?: berty.types.IAppMetadataSend): berty.types.AppMetadataSend;
            public static encode(message: berty.types.IAppMetadataSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAppMetadataSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMetadataSend;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMetadataSend;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AppMetadataSend;
            public static toObject(message: berty.types.AppMetadataSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AppMetadataSend {

            interface IRequest {
                groupPk?: (Uint8Array|null);
                payload?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public payload: Uint8Array;
                public static create(properties?: berty.types.AppMetadataSend.IRequest): berty.types.AppMetadataSend.Request;
                public static encode(message: berty.types.AppMetadataSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.AppMetadataSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMetadataSend.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMetadataSend.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.AppMetadataSend.Request;
                public static toObject(message: berty.types.AppMetadataSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.AppMetadataSend.IReply): berty.types.AppMetadataSend.Reply;
                public static encode(message: berty.types.AppMetadataSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.AppMetadataSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMetadataSend.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMetadataSend.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.AppMetadataSend.Reply;
                public static toObject(message: berty.types.AppMetadataSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IAppMessageSend {
        }

        class AppMessageSend implements IAppMessageSend {

            public static create(properties?: berty.types.IAppMessageSend): berty.types.AppMessageSend;
            public static encode(message: berty.types.IAppMessageSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IAppMessageSend, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMessageSend;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMessageSend;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.AppMessageSend;
            public static toObject(message: berty.types.AppMessageSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace AppMessageSend {

            interface IRequest {
                groupPk?: (Uint8Array|null);
                payload?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public payload: Uint8Array;
                public static create(properties?: berty.types.AppMessageSend.IRequest): berty.types.AppMessageSend.Request;
                public static encode(message: berty.types.AppMessageSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.AppMessageSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMessageSend.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMessageSend.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.AppMessageSend.Request;
                public static toObject(message: berty.types.AppMessageSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.AppMessageSend.IReply): berty.types.AppMessageSend.Reply;
                public static encode(message: berty.types.AppMessageSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.AppMessageSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.AppMessageSend.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.AppMessageSend.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.AppMessageSend.Reply;
                public static toObject(message: berty.types.AppMessageSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupMetadataEvent {
            eventContext?: (berty.types.IEventContext|null);
            metadata?: (berty.types.IGroupMetadata|null);
            event?: (Uint8Array|null);
        }

        class GroupMetadataEvent implements IGroupMetadataEvent {

            public eventContext?: (berty.types.IEventContext|null);
            public metadata?: (berty.types.IGroupMetadata|null);
            public event: Uint8Array;
            public static create(properties?: berty.types.IGroupMetadataEvent): berty.types.GroupMetadataEvent;
            public static encode(message: berty.types.IGroupMetadataEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMetadataEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMetadataEvent;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMetadataEvent;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMetadataEvent;
            public static toObject(message: berty.types.GroupMetadataEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupMessageEvent {
            eventContext?: (berty.types.IEventContext|null);
            headers?: (berty.types.IMessageHeaders|null);
            message?: (Uint8Array|null);
        }

        class GroupMessageEvent implements IGroupMessageEvent {

            public eventContext?: (berty.types.IEventContext|null);
            public headers?: (berty.types.IMessageHeaders|null);
            public message: Uint8Array;
            public static create(properties?: berty.types.IGroupMessageEvent): berty.types.GroupMessageEvent;
            public static encode(message: berty.types.IGroupMessageEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMessageEvent, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMessageEvent;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMessageEvent;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMessageEvent;
            public static toObject(message: berty.types.GroupMessageEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IGroupMetadataSubscribe {
        }

        class GroupMetadataSubscribe implements IGroupMetadataSubscribe {

            public static create(properties?: berty.types.IGroupMetadataSubscribe): berty.types.GroupMetadataSubscribe;
            public static encode(message: berty.types.IGroupMetadataSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMetadataSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMetadataSubscribe;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMetadataSubscribe;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMetadataSubscribe;
            public static toObject(message: berty.types.GroupMetadataSubscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupMetadataSubscribe {

            interface IRequest {
                groupPk?: (Uint8Array|null);
                since?: (Uint8Array|null);
                until?: (Uint8Array|null);
                goBackwards?: (boolean|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public since: Uint8Array;
                public until: Uint8Array;
                public goBackwards: boolean;
                public static create(properties?: berty.types.GroupMetadataSubscribe.IRequest): berty.types.GroupMetadataSubscribe.Request;
                public static encode(message: berty.types.GroupMetadataSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.GroupMetadataSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMetadataSubscribe.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMetadataSubscribe.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.GroupMetadataSubscribe.Request;
                public static toObject(message: berty.types.GroupMetadataSubscribe.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupMetadataList {
        }

        class GroupMetadataList implements IGroupMetadataList {

            public static create(properties?: berty.types.IGroupMetadataList): berty.types.GroupMetadataList;
            public static encode(message: berty.types.IGroupMetadataList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMetadataList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMetadataList;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMetadataList;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMetadataList;
            public static toObject(message: berty.types.GroupMetadataList, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupMetadataList {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.GroupMetadataList.IRequest): berty.types.GroupMetadataList.Request;
                public static encode(message: berty.types.GroupMetadataList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.GroupMetadataList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMetadataList.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMetadataList.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.GroupMetadataList.Request;
                public static toObject(message: berty.types.GroupMetadataList.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupMessageSubscribe {
        }

        class GroupMessageSubscribe implements IGroupMessageSubscribe {

            public static create(properties?: berty.types.IGroupMessageSubscribe): berty.types.GroupMessageSubscribe;
            public static encode(message: berty.types.IGroupMessageSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMessageSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMessageSubscribe;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMessageSubscribe;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMessageSubscribe;
            public static toObject(message: berty.types.GroupMessageSubscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupMessageSubscribe {

            interface IRequest {
                groupPk?: (Uint8Array|null);
                since?: (Uint8Array|null);
                until?: (Uint8Array|null);
                goBackwards?: (boolean|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public since: Uint8Array;
                public until: Uint8Array;
                public goBackwards: boolean;
                public static create(properties?: berty.types.GroupMessageSubscribe.IRequest): berty.types.GroupMessageSubscribe.Request;
                public static encode(message: berty.types.GroupMessageSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.GroupMessageSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMessageSubscribe.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMessageSubscribe.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.GroupMessageSubscribe.Request;
                public static toObject(message: berty.types.GroupMessageSubscribe.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupMessageList {
        }

        class GroupMessageList implements IGroupMessageList {

            public static create(properties?: berty.types.IGroupMessageList): berty.types.GroupMessageList;
            public static encode(message: berty.types.IGroupMessageList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupMessageList, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMessageList;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMessageList;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupMessageList;
            public static toObject(message: berty.types.GroupMessageList, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupMessageList {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.GroupMessageList.IRequest): berty.types.GroupMessageList.Request;
                public static encode(message: berty.types.GroupMessageList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.GroupMessageList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupMessageList.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupMessageList.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.GroupMessageList.Request;
                public static toObject(message: berty.types.GroupMessageList.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGroupInfo {
        }

        class GroupInfo implements IGroupInfo {

            public static create(properties?: berty.types.IGroupInfo): berty.types.GroupInfo;
            public static encode(message: berty.types.IGroupInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IGroupInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupInfo;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupInfo;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.GroupInfo;
            public static toObject(message: berty.types.GroupInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GroupInfo {

            interface IRequest {
                groupPk?: (Uint8Array|null);
                contactPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public contactPk: Uint8Array;
                public static create(properties?: berty.types.GroupInfo.IRequest): berty.types.GroupInfo.Request;
                public static encode(message: berty.types.GroupInfo.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.GroupInfo.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupInfo.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupInfo.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.GroupInfo.Request;
                public static toObject(message: berty.types.GroupInfo.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
                group?: (berty.types.IGroup|null);
                memberPk?: (Uint8Array|null);
                devicePk?: (Uint8Array|null);
            }

            class Reply implements IReply {

                public group?: (berty.types.IGroup|null);
                public memberPk: Uint8Array;
                public devicePk: Uint8Array;
                public static create(properties?: berty.types.GroupInfo.IReply): berty.types.GroupInfo.Reply;
                public static encode(message: berty.types.GroupInfo.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.GroupInfo.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.GroupInfo.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.GroupInfo.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.GroupInfo.Reply;
                public static toObject(message: berty.types.GroupInfo.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IActivateGroup {
        }

        class ActivateGroup implements IActivateGroup {

            public static create(properties?: berty.types.IActivateGroup): berty.types.ActivateGroup;
            public static encode(message: berty.types.IActivateGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IActivateGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ActivateGroup;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ActivateGroup;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ActivateGroup;
            public static toObject(message: berty.types.ActivateGroup, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace ActivateGroup {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.ActivateGroup.IRequest): berty.types.ActivateGroup.Request;
                public static encode(message: berty.types.ActivateGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ActivateGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ActivateGroup.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ActivateGroup.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ActivateGroup.Request;
                public static toObject(message: berty.types.ActivateGroup.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.ActivateGroup.IReply): berty.types.ActivateGroup.Reply;
                public static encode(message: berty.types.ActivateGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.ActivateGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ActivateGroup.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ActivateGroup.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.ActivateGroup.Reply;
                public static toObject(message: berty.types.ActivateGroup.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IDeactivateGroup {
        }

        class DeactivateGroup implements IDeactivateGroup {

            public static create(properties?: berty.types.IDeactivateGroup): berty.types.DeactivateGroup;
            public static encode(message: berty.types.IDeactivateGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IDeactivateGroup, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DeactivateGroup;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DeactivateGroup;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.DeactivateGroup;
            public static toObject(message: berty.types.DeactivateGroup, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace DeactivateGroup {

            interface IRequest {
                groupPk?: (Uint8Array|null);
            }

            class Request implements IRequest {

                public groupPk: Uint8Array;
                public static create(properties?: berty.types.DeactivateGroup.IRequest): berty.types.DeactivateGroup.Request;
                public static encode(message: berty.types.DeactivateGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.DeactivateGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DeactivateGroup.Request;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DeactivateGroup.Request;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.DeactivateGroup.Request;
                public static toObject(message: berty.types.DeactivateGroup.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReply {
            }

            class Reply implements IReply {

                public static create(properties?: berty.types.DeactivateGroup.IReply): berty.types.DeactivateGroup.Reply;
                public static encode(message: berty.types.DeactivateGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.DeactivateGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.DeactivateGroup.Reply;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.DeactivateGroup.Reply;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.DeactivateGroup.Reply;
                public static toObject(message: berty.types.DeactivateGroup.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        enum ContactState {
            ContactStateUndefined = 0,
            ContactStateToRequest = 1,
            ContactStateReceived = 2,
            ContactStateAdded = 3,
            ContactStateRemoved = 4,
            ContactStateDiscarded = 5,
            ContactStateBlocked = 6
        }

        interface IShareableContact {
            pk?: (Uint8Array|null);
            publicRendezvousSeed?: (Uint8Array|null);
            metadata?: (Uint8Array|null);
        }

        class ShareableContact implements IShareableContact {

            public pk: Uint8Array;
            public publicRendezvousSeed: Uint8Array;
            public metadata: Uint8Array;
            public static create(properties?: berty.types.IShareableContact): berty.types.ShareableContact;
            public static encode(message: berty.types.IShareableContact, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.types.IShareableContact, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.ShareableContact;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.ShareableContact;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.types.ShareableContact;
            public static toObject(message: berty.types.ShareableContact, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
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
            selector?: (string|null);
            get?: (string|null);
            put?: (string|null);
            post?: (string|null);
            "delete"?: (string|null);
            patch?: (string|null);
            custom?: (google.api.ICustomHttpPattern|null);
            body?: (string|null);
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
            kind?: (string|null);
            path?: (string|null);
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
            name?: (string|null);
            "package"?: (string|null);
            dependency?: (string[]|null);
            publicDependency?: (number[]|null);
            weakDependency?: (number[]|null);
            messageType?: (google.protobuf.IDescriptorProto[]|null);
            enumType?: (google.protobuf.IEnumDescriptorProto[]|null);
            service?: (google.protobuf.IServiceDescriptorProto[]|null);
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);
            options?: (google.protobuf.IFileOptions|null);
            sourceCodeInfo?: (google.protobuf.ISourceCodeInfo|null);
            syntax?: (string|null);
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
            name?: (string|null);
            field?: (google.protobuf.IFieldDescriptorProto[]|null);
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);
            nestedType?: (google.protobuf.IDescriptorProto[]|null);
            enumType?: (google.protobuf.IEnumDescriptorProto[]|null);
            extensionRange?: (google.protobuf.DescriptorProto.IExtensionRange[]|null);
            oneofDecl?: (google.protobuf.IOneofDescriptorProto[]|null);
            options?: (google.protobuf.IMessageOptions|null);
            reservedRange?: (google.protobuf.DescriptorProto.IReservedRange[]|null);
            reservedName?: (string[]|null);
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
                start?: (number|null);
                end?: (number|null);
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
                start?: (number|null);
                end?: (number|null);
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
            name?: (string|null);
            number?: (number|null);
            label?: (google.protobuf.FieldDescriptorProto.Label|null);
            type?: (google.protobuf.FieldDescriptorProto.Type|null);
            typeName?: (string|null);
            extendee?: (string|null);
            defaultValue?: (string|null);
            oneofIndex?: (number|null);
            jsonName?: (string|null);
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
            name?: (string|null);
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
            name?: (string|null);
            value?: (google.protobuf.IEnumValueDescriptorProto[]|null);
            options?: (google.protobuf.IEnumOptions|null);
            reservedRange?: (google.protobuf.EnumDescriptorProto.IEnumReservedRange[]|null);
            reservedName?: (string[]|null);
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
                start?: (number|null);
                end?: (number|null);
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
            name?: (string|null);
            number?: (number|null);
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
            name?: (string|null);
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
            name?: (string|null);
            inputType?: (string|null);
            outputType?: (string|null);
            options?: (google.protobuf.IMethodOptions|null);
            clientStreaming?: (boolean|null);
            serverStreaming?: (boolean|null);
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
            javaPackage?: (string|null);
            javaOuterClassname?: (string|null);
            javaMultipleFiles?: (boolean|null);
            javaGenerateEqualsAndHash?: (boolean|null);
            javaStringCheckUtf8?: (boolean|null);
            optimizeFor?: (google.protobuf.FileOptions.OptimizeMode|null);
            goPackage?: (string|null);
            ccGenericServices?: (boolean|null);
            javaGenericServices?: (boolean|null);
            pyGenericServices?: (boolean|null);
            phpGenericServices?: (boolean|null);
            deprecated?: (boolean|null);
            ccEnableArenas?: (boolean|null);
            objcClassPrefix?: (string|null);
            csharpNamespace?: (string|null);
            swiftPrefix?: (string|null);
            phpClassPrefix?: (string|null);
            phpNamespace?: (string|null);
            phpMetadataNamespace?: (string|null);
            rubyPackage?: (string|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.goprotoGettersAll"?: (boolean|null);
            ".gogoproto.goprotoEnumPrefixAll"?: (boolean|null);
            ".gogoproto.goprotoStringerAll"?: (boolean|null);
            ".gogoproto.verboseEqualAll"?: (boolean|null);
            ".gogoproto.faceAll"?: (boolean|null);
            ".gogoproto.gostringAll"?: (boolean|null);
            ".gogoproto.populateAll"?: (boolean|null);
            ".gogoproto.stringerAll"?: (boolean|null);
            ".gogoproto.onlyoneAll"?: (boolean|null);
            ".gogoproto.equalAll"?: (boolean|null);
            ".gogoproto.descriptionAll"?: (boolean|null);
            ".gogoproto.testgenAll"?: (boolean|null);
            ".gogoproto.benchgenAll"?: (boolean|null);
            ".gogoproto.marshalerAll"?: (boolean|null);
            ".gogoproto.unmarshalerAll"?: (boolean|null);
            ".gogoproto.stableMarshalerAll"?: (boolean|null);
            ".gogoproto.sizerAll"?: (boolean|null);
            ".gogoproto.goprotoEnumStringerAll"?: (boolean|null);
            ".gogoproto.enumStringerAll"?: (boolean|null);
            ".gogoproto.unsafeMarshalerAll"?: (boolean|null);
            ".gogoproto.unsafeUnmarshalerAll"?: (boolean|null);
            ".gogoproto.goprotoExtensionsMapAll"?: (boolean|null);
            ".gogoproto.goprotoUnrecognizedAll"?: (boolean|null);
            ".gogoproto.gogoprotoImport"?: (boolean|null);
            ".gogoproto.protosizerAll"?: (boolean|null);
            ".gogoproto.compareAll"?: (boolean|null);
            ".gogoproto.typedeclAll"?: (boolean|null);
            ".gogoproto.enumdeclAll"?: (boolean|null);
            ".gogoproto.goprotoRegistration"?: (boolean|null);
            ".gogoproto.messagenameAll"?: (boolean|null);
            ".gogoproto.goprotoSizecacheAll"?: (boolean|null);
            ".gogoproto.goprotoUnkeyedAll"?: (boolean|null);
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
            messageSetWireFormat?: (boolean|null);
            noStandardDescriptorAccessor?: (boolean|null);
            deprecated?: (boolean|null);
            mapEntry?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.goprotoGetters"?: (boolean|null);
            ".gogoproto.goprotoStringer"?: (boolean|null);
            ".gogoproto.verboseEqual"?: (boolean|null);
            ".gogoproto.face"?: (boolean|null);
            ".gogoproto.gostring"?: (boolean|null);
            ".gogoproto.populate"?: (boolean|null);
            ".gogoproto.stringer"?: (boolean|null);
            ".gogoproto.onlyone"?: (boolean|null);
            ".gogoproto.equal"?: (boolean|null);
            ".gogoproto.description"?: (boolean|null);
            ".gogoproto.testgen"?: (boolean|null);
            ".gogoproto.benchgen"?: (boolean|null);
            ".gogoproto.marshaler"?: (boolean|null);
            ".gogoproto.unmarshaler"?: (boolean|null);
            ".gogoproto.stableMarshaler"?: (boolean|null);
            ".gogoproto.sizer"?: (boolean|null);
            ".gogoproto.unsafeMarshaler"?: (boolean|null);
            ".gogoproto.unsafeUnmarshaler"?: (boolean|null);
            ".gogoproto.goprotoExtensionsMap"?: (boolean|null);
            ".gogoproto.goprotoUnrecognized"?: (boolean|null);
            ".gogoproto.protosizer"?: (boolean|null);
            ".gogoproto.compare"?: (boolean|null);
            ".gogoproto.typedecl"?: (boolean|null);
            ".gogoproto.messagename"?: (boolean|null);
            ".gogoproto.goprotoSizecache"?: (boolean|null);
            ".gogoproto.goprotoUnkeyed"?: (boolean|null);
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
            ctype?: (google.protobuf.FieldOptions.CType|null);
            packed?: (boolean|null);
            jstype?: (google.protobuf.FieldOptions.JSType|null);
            lazy?: (boolean|null);
            deprecated?: (boolean|null);
            weak?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.nullable"?: (boolean|null);
            ".gogoproto.embed"?: (boolean|null);
            ".gogoproto.customtype"?: (string|null);
            ".gogoproto.customname"?: (string|null);
            ".gogoproto.jsontag"?: (string|null);
            ".gogoproto.moretags"?: (string|null);
            ".gogoproto.casttype"?: (string|null);
            ".gogoproto.castkey"?: (string|null);
            ".gogoproto.castvalue"?: (string|null);
            ".gogoproto.stdtime"?: (boolean|null);
            ".gogoproto.stdduration"?: (boolean|null);
            ".gogoproto.wktpointer"?: (boolean|null);
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
            allowAlias?: (boolean|null);
            deprecated?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.goprotoEnumPrefix"?: (boolean|null);
            ".gogoproto.goprotoEnumStringer"?: (boolean|null);
            ".gogoproto.enumStringer"?: (boolean|null);
            ".gogoproto.enumCustomname"?: (string|null);
            ".gogoproto.enumdecl"?: (boolean|null);
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
            deprecated?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.enumvalueCustomname"?: (string|null);
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
            deprecated?: (boolean|null);
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
            deprecated?: (boolean|null);
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
            identifierValue?: (string|null);
            positiveIntValue?: (number|Long|null);
            negativeIntValue?: (number|Long|null);
            doubleValue?: (number|null);
            stringValue?: (Uint8Array|null);
            aggregateValue?: (string|null);
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
                path?: (number[]|null);
                span?: (number[]|null);
                leadingComments?: (string|null);
                trailingComments?: (string|null);
                leadingDetachedComments?: (string[]|null);
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
                path?: (number[]|null);
                sourceFile?: (string|null);
                begin?: (number|null);
                end?: (number|null);
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
            seconds?: (number|Long|null);
            nanos?: (number|null);
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
