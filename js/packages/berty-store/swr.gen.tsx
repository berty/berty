import * as _api from '@berty-tech/berty-api'
import React, { createContext, useContext } from 'react'
import * as pb from 'protobufjs'
import bridge from '@berty-tech/grpc-bridge'
import useSWR from 'swr/esm'
import { listHandler, streamHandler, getHandler } from './helpers'

export namespace berty {
	export namespace chat {
		export namespace ChatService {
			export const Context = createContext(
				_api.berty.chat.ChatService.create(bridge({ host: 'http://localhost:1337' })),
			)

			export const Provider: React.FC<{ rpcImpl: pb.RPCImpl; children: React.ReactNode }> = ({
				rpcImpl,
				children,
			}) => (
				<ChatService.Context.Provider value={_api.berty.chat.ChatService.create(rpcImpl)}>
					{children}
				</ChatService.Context.Provider>
			)

			export const search = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.Search.IRequest,
			): Promise<_api.berty.chat.Search.IReply> => streamHandler(api.search.bind(api), request)

			export const eventSubscribe = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.EventSubscribe.IRequest,
			): Promise<_api.berty.chat.EventSubscribe.IReply> =>
				streamHandler(api.eventSubscribe.bind(api), request)

			export const devEventSubscribe = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.DevEventSubscribe.IRequest,
			): Promise<_api.berty.chat.DevEventSubscribe.IReply> =>
				streamHandler(api.devEventSubscribe.bind(api), request)

			export const conversationList = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationList.IRequest,
			): Promise<Array<_api.berty.chat.ConversationList.IReply>> =>
				listHandler(api.conversationList.bind(api), request)

			export const conversationGet = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationGet.IRequest,
			): Promise<_api.berty.chat.ConversationGet.IReply> =>
				getHandler(api.conversationGet.bind(api), request)

			export const conversationCreate = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationCreate.IRequest,
			): Promise<_api.berty.chat.ConversationCreate.IReply> =>
				streamHandler(api.conversationCreate.bind(api), request)

			export const conversationUpdate = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationUpdate.IRequest,
			): Promise<_api.berty.chat.ConversationUpdate.IReply> =>
				streamHandler(api.conversationUpdate.bind(api), request)

			export const conversationMute = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationMute.IRequest,
			): Promise<_api.berty.chat.ConversationMute.IReply> =>
				streamHandler(api.conversationMute.bind(api), request)

			export const conversationLeave = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationLeave.IRequest,
			): Promise<_api.berty.chat.ConversationLeave.IReply> =>
				streamHandler(api.conversationLeave.bind(api), request)

			export const conversationErase = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationErase.IRequest,
			): Promise<_api.berty.chat.ConversationErase.IReply> =>
				streamHandler(api.conversationErase.bind(api), request)

			export const conversationInvitationSend = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationInvitationSend.IRequest,
			): Promise<_api.berty.chat.ConversationInvitationSend.IReply> =>
				streamHandler(api.conversationInvitationSend.bind(api), request)

			export const conversationInvitationAccept = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationInvitationAccept.IRequest,
			): Promise<_api.berty.chat.ConversationInvitationAccept.IReply> =>
				streamHandler(api.conversationInvitationAccept.bind(api), request)

			export const conversationInvitationDecline = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationInvitationDecline.IRequest,
			): Promise<_api.berty.chat.ConversationInvitationDecline.IReply> =>
				streamHandler(api.conversationInvitationDecline.bind(api), request)

			export const messageList = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.MessageList.IRequest,
			): Promise<Array<_api.berty.chat.MessageList.IReply>> =>
				listHandler(api.messageList.bind(api), request)

			export const messageGet = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.MessageGet.IRequest,
			): Promise<_api.berty.chat.MessageGet.IReply> => getHandler(api.messageGet.bind(api), request)

			export const messageSend = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.MessageSend.IRequest,
			): Promise<_api.berty.chat.MessageSend.IReply> =>
				streamHandler(api.messageSend.bind(api), request)

			export const messageEdit = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.MessageEdit.IRequest,
			): Promise<_api.berty.chat.MessageEdit.IReply> =>
				streamHandler(api.messageEdit.bind(api), request)

			export const messageHide = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.MessageHide.IRequest,
			): Promise<_api.berty.chat.MessageHide.IReply> =>
				streamHandler(api.messageHide.bind(api), request)

			export const messageReact = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.MessageReact.IRequest,
			): Promise<_api.berty.chat.MessageReact.IReply> =>
				streamHandler(api.messageReact.bind(api), request)

			export const messageRead = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.MessageRead.IRequest,
			): Promise<_api.berty.chat.MessageRead.IReply> =>
				streamHandler(api.messageRead.bind(api), request)

			export const memberList = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.MemberList.IRequest,
			): Promise<Array<_api.berty.chat.MemberList.IReply>> =>
				listHandler(api.memberList.bind(api), request)

			export const memberGet = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.MemberGet.IRequest,
			): Promise<_api.berty.chat.MemberGet.IReply> => getHandler(api.memberGet.bind(api), request)

			export const contactList = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ContactList.IRequest,
			): Promise<Array<_api.berty.chat.ContactList.IReply>> =>
				listHandler(api.contactList.bind(api), request)

			export const contactGet = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ContactGet.IRequest,
			): Promise<_api.berty.chat.ContactGet.IReply> => getHandler(api.contactGet.bind(api), request)

			export const contactBlock = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ContactBlock.IRequest,
			): Promise<_api.berty.chat.ContactBlock.IReply> =>
				streamHandler(api.contactBlock.bind(api), request)

			export const contactRemove = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ContactRemove.IRequest,
			): Promise<_api.berty.chat.ContactRemove.IReply> =>
				streamHandler(api.contactRemove.bind(api), request)

			export const contactRequestSend = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ContactRequestSend.IRequest,
			): Promise<_api.berty.chat.ContactRequestSend.IReply> =>
				streamHandler(api.contactRequestSend.bind(api), request)

			export const contactRequestAccept = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ContactRequestAccept.IRequest,
			): Promise<_api.berty.chat.ContactRequestAccept.IReply> =>
				streamHandler(api.contactRequestAccept.bind(api), request)

			export const contactRequestDecline = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ContactRequestDecline.IRequest,
			): Promise<_api.berty.chat.ContactRequestDecline.IReply> =>
				streamHandler(api.contactRequestDecline.bind(api), request)

			export const accountList = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountList.IRequest,
			): Promise<Array<_api.berty.chat.AccountList.IRequest>> =>
				listHandler(api.accountList.bind(api), request)

			export const accountGet = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountGet.IRequest,
			): Promise<_api.berty.chat.AccountGet.IReply> => getHandler(api.accountGet.bind(api), request)

			export const accountCreate = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountCreate.IRequest,
			): Promise<_api.berty.chat.AccountCreate.IReply> =>
				streamHandler(api.accountCreate.bind(api), request)

			export const accountUpdate = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountUpdate.IRequest,
			): Promise<_api.berty.chat.AccountUpdate.IReply> =>
				streamHandler(api.accountUpdate.bind(api), request)

			export const accountOpen = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountOpen.IRequest,
			): Promise<_api.berty.chat.AccountOpen.IReply> =>
				streamHandler(api.accountOpen.bind(api), request)

			export const accountClose = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountClose.IRequest,
			): Promise<_api.berty.chat.AccountClose.IReply> =>
				streamHandler(api.accountClose.bind(api), request)

			export const accountRemove = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountRemove.IRequest,
			): Promise<_api.berty.chat.AccountRemove.IReply> =>
				streamHandler(api.accountRemove.bind(api), request)

			export const accountPairingInvitationCreate = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountPairingInvitationCreate.IRequest,
			): Promise<_api.berty.chat.AccountPairingInvitationCreate.IReply> =>
				streamHandler(api.accountPairingInvitationCreate.bind(api), request)

			export const accountRenewIncomingContactRequestLink = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountRenewIncomingContactRequestLink.IRequest,
			): Promise<_api.berty.chat.AccountRenewIncomingContactRequestLink.IReply> =>
				streamHandler(api.accountRenewIncomingContactRequestLink.bind(api), request)

			// Containers
			type SearchProps = {
				request: _api.berty.chat.Search.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.Search.IReply) => React.ReactElement
			}
			export const Search: React.FC<SearchProps> = ({ request, fallback: Fallback, children }) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`Search:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.search(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type EventSubscribeProps = {
				request: _api.berty.chat.EventSubscribe.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.EventSubscribe.IReply) => React.ReactElement
			}
			export const EventSubscribe: React.FC<EventSubscribeProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`EventSubscribe:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.eventSubscribe(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type DevEventSubscribeProps = {
				request: _api.berty.chat.DevEventSubscribe.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.DevEventSubscribe.IReply) => React.ReactElement
			}
			export const DevEventSubscribe: React.FC<DevEventSubscribeProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`DevEventSubscribe:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.devEventSubscribe(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationListProps = {
				request: _api.berty.chat.ConversationList.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: Array<_api.berty.chat.ConversationList.IReply>) => React.ReactElement
			}
			export const ConversationList: React.FC<ConversationListProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ConversationList:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.conversationList(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationGetProps = {
				request: _api.berty.chat.ConversationGet.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ConversationGet.IReply) => React.ReactElement
			}
			export const ConversationGet: React.FC<ConversationGetProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ConversationGet:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.conversationGet(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationCreateProps = {
				request: _api.berty.chat.ConversationCreate.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ConversationCreate.IReply) => React.ReactElement
			}
			export const ConversationCreate: React.FC<ConversationCreateProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ConversationCreate:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.conversationCreate(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationUpdateProps = {
				request: _api.berty.chat.ConversationUpdate.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ConversationUpdate.IReply) => React.ReactElement
			}
			export const ConversationUpdate: React.FC<ConversationUpdateProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ConversationUpdate:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.conversationUpdate(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationMuteProps = {
				request: _api.berty.chat.ConversationMute.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ConversationMute.IReply) => React.ReactElement
			}
			export const ConversationMute: React.FC<ConversationMuteProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ConversationMute:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.conversationMute(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationLeaveProps = {
				request: _api.berty.chat.ConversationLeave.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ConversationLeave.IReply) => React.ReactElement
			}
			export const ConversationLeave: React.FC<ConversationLeaveProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ConversationLeave:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.conversationLeave(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationEraseProps = {
				request: _api.berty.chat.ConversationErase.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ConversationErase.IReply) => React.ReactElement
			}
			export const ConversationErase: React.FC<ConversationEraseProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ConversationErase:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.conversationErase(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationInvitationSendProps = {
				request: _api.berty.chat.ConversationInvitationSend.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.ConversationInvitationSend.IReply,
				) => React.ReactElement
			}
			export const ConversationInvitationSend: React.FC<ConversationInvitationSendProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					`ConversationInvitationSend:${JSON.stringify(request)}`,
					() => berty.chat.ChatService.conversationInvitationSend(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationInvitationAcceptProps = {
				request: _api.berty.chat.ConversationInvitationAccept.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.ConversationInvitationAccept.IReply,
				) => React.ReactElement
			}
			export const ConversationInvitationAccept: React.FC<ConversationInvitationAcceptProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					`ConversationInvitationAccept:${JSON.stringify(request)}`,
					() => berty.chat.ChatService.conversationInvitationAccept(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationInvitationDeclineProps = {
				request: _api.berty.chat.ConversationInvitationDecline.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.ConversationInvitationDecline.IReply,
				) => React.ReactElement
			}
			export const ConversationInvitationDecline: React.FC<ConversationInvitationDeclineProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					`ConversationInvitationDecline:${JSON.stringify(request)}`,
					() => berty.chat.ChatService.conversationInvitationDecline(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageListProps = {
				request: _api.berty.chat.MessageList.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: Array<_api.berty.chat.MessageList.IReply>) => React.ReactElement
			}
			export const MessageList: React.FC<MessageListProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`MessageList:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.messageList(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageGetProps = {
				request: _api.berty.chat.MessageGet.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MessageGet.IReply) => React.ReactElement
			}
			export const MessageGet: React.FC<MessageGetProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`MessageGet:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.messageGet(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageSendProps = {
				request: _api.berty.chat.MessageSend.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MessageSend.IReply) => React.ReactElement
			}
			export const MessageSend: React.FC<MessageSendProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`MessageSend:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.messageSend(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageEditProps = {
				request: _api.berty.chat.MessageEdit.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MessageEdit.IReply) => React.ReactElement
			}
			export const MessageEdit: React.FC<MessageEditProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`MessageEdit:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.messageEdit(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageHideProps = {
				request: _api.berty.chat.MessageHide.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MessageHide.IReply) => React.ReactElement
			}
			export const MessageHide: React.FC<MessageHideProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`MessageHide:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.messageHide(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageReactProps = {
				request: _api.berty.chat.MessageReact.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MessageReact.IReply) => React.ReactElement
			}
			export const MessageReact: React.FC<MessageReactProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`MessageReact:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.messageReact(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageReadProps = {
				request: _api.berty.chat.MessageRead.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MessageRead.IReply) => React.ReactElement
			}
			export const MessageRead: React.FC<MessageReadProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`MessageRead:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.messageRead(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MemberListProps = {
				request: _api.berty.chat.MemberList.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: Array<_api.berty.chat.MemberList.IReply>) => React.ReactElement
			}
			export const MemberList: React.FC<MemberListProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`MemberList:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.memberList(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MemberGetProps = {
				request: _api.berty.chat.MemberGet.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MemberGet.IReply) => React.ReactElement
			}
			export const MemberGet: React.FC<MemberGetProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`MemberGet:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.memberGet(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactListProps = {
				request: _api.berty.chat.ContactList.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: Array<_api.berty.chat.ContactList.IReply>) => React.ReactElement
			}
			export const ContactList: React.FC<ContactListProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ContactList:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.contactList(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactGetProps = {
				request: _api.berty.chat.ContactGet.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ContactGet.IReply) => React.ReactElement
			}
			export const ContactGet: React.FC<ContactGetProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ContactGet:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.contactGet(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactBlockProps = {
				request: _api.berty.chat.ContactBlock.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ContactBlock.IReply) => React.ReactElement
			}
			export const ContactBlock: React.FC<ContactBlockProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ContactBlock:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.contactBlock(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactRemoveProps = {
				request: _api.berty.chat.ContactRemove.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ContactRemove.IReply) => React.ReactElement
			}
			export const ContactRemove: React.FC<ContactRemoveProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ContactRemove:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.contactRemove(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactRequestSendProps = {
				request: _api.berty.chat.ContactRequestSend.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ContactRequestSend.IReply) => React.ReactElement
			}
			export const ContactRequestSend: React.FC<ContactRequestSendProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ContactRequestSend:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.contactRequestSend(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactRequestAcceptProps = {
				request: _api.berty.chat.ContactRequestAccept.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ContactRequestAccept.IReply) => React.ReactElement
			}
			export const ContactRequestAccept: React.FC<ContactRequestAcceptProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ContactRequestAccept:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.contactRequestAccept(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactRequestDeclineProps = {
				request: _api.berty.chat.ContactRequestDecline.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ContactRequestDecline.IReply) => React.ReactElement
			}
			export const ContactRequestDecline: React.FC<ContactRequestDeclineProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`ContactRequestDecline:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.contactRequestDecline(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountListProps = {
				request: _api.berty.chat.AccountList.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: Array<_api.berty.chat.AccountList.IRequest>) => React.ReactElement
			}
			export const AccountList: React.FC<AccountListProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`AccountList:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.accountList(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountGetProps = {
				request: _api.berty.chat.AccountGet.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.AccountGet.IReply) => React.ReactElement
			}
			export const AccountGet: React.FC<AccountGetProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`AccountGet:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.accountGet(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountCreateProps = {
				request: _api.berty.chat.AccountCreate.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.AccountCreate.IReply) => React.ReactElement
			}
			export const AccountCreate: React.FC<AccountCreateProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`AccountCreate:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.accountCreate(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountUpdateProps = {
				request: _api.berty.chat.AccountUpdate.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.AccountUpdate.IReply) => React.ReactElement
			}
			export const AccountUpdate: React.FC<AccountUpdateProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`AccountUpdate:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.accountUpdate(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountOpenProps = {
				request: _api.berty.chat.AccountOpen.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.AccountOpen.IReply) => React.ReactElement
			}
			export const AccountOpen: React.FC<AccountOpenProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`AccountOpen:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.accountOpen(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountCloseProps = {
				request: _api.berty.chat.AccountClose.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.AccountClose.IReply) => React.ReactElement
			}
			export const AccountClose: React.FC<AccountCloseProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`AccountClose:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.accountClose(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountRemoveProps = {
				request: _api.berty.chat.AccountRemove.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.AccountRemove.IReply) => React.ReactElement
			}
			export const AccountRemove: React.FC<AccountRemoveProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(`AccountRemove:${JSON.stringify(request)}`, () =>
					berty.chat.ChatService.accountRemove(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountPairingInvitationCreateProps = {
				request: _api.berty.chat.AccountPairingInvitationCreate.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.AccountPairingInvitationCreate.IReply,
				) => React.ReactElement
			}
			export const AccountPairingInvitationCreate: React.FC<AccountPairingInvitationCreateProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					`AccountPairingInvitationCreate:${JSON.stringify(request)}`,
					() => berty.chat.ChatService.accountPairingInvitationCreate(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountRenewIncomingContactRequestLinkProps = {
				request: _api.berty.chat.AccountRenewIncomingContactRequestLink.IRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.AccountRenewIncomingContactRequestLink.IReply,
				) => React.ReactElement
			}
			export const AccountRenewIncomingContactRequestLink: React.FC<AccountRenewIncomingContactRequestLinkProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					`AccountRenewIncomingContactRequestLink:${JSON.stringify(request)}`,
					() => berty.chat.ChatService.accountRenewIncomingContactRequestLink(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}
		}
	}
	export namespace chatmodel {}
}
export namespace google {
	export namespace api {}
	export namespace protobuf {}
}
export namespace gogoproto {}

export const BertyChatChatService = berty.chat.ChatService
