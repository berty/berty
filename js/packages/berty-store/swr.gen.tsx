import * as _api from '@berty-tech/berty-api'
import React, { createContext, useContext } from 'react'
import * as pb from 'protobufjs'
import bridge from '@berty-tech/grpc-bridge'
import useSWR from 'swr'
import { listHandler, streamHandler, getHandler } from './helpers'

export namespace berty {
	export namespace chat {
		export namespace Account {
			export const Context = createContext(
				_api.berty.chat.Account.create(bridge({ host: 'http://localhost:1337' })),
			)

			export const Provider: React.FC<{ rpcImpl: pb.RPCImpl; children: React.ReactNode }> = ({
				rpcImpl,
				children,
			}) => (
				<Account.Context.Provider value={_api.berty.chat.Account.create(rpcImpl)}>
					{children}
				</Account.Context.Provider>
			)

			export const eventSubscribe = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IEventSubscribeRequest,
			): Promise<_api.berty.chat.IEventSubscribeReply> =>
				streamHandler(api.eventSubscribe.bind(api), request)

			export const conversationList = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationListRequest,
			): Promise<Array<_api.berty.chat.IConversationListReply>> =>
				listHandler(api.conversationList.bind(api), request)

			export const conversationGet = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationGetRequest,
			): Promise<_api.berty.chat.IConversationGetReply> =>
				getHandler(api.conversationGet.bind(api), request)

			export const conversationCreate = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationCreateRequest,
			): Promise<_api.berty.chat.IConversationCreateReply> =>
				streamHandler(api.conversationCreate.bind(api), request)

			export const conversationLeave = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationLeaveRequest,
			): Promise<_api.berty.chat.IConversationLeaveReply> =>
				streamHandler(api.conversationLeave.bind(api), request)

			export const conversationErase = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationEraseRequest,
			): Promise<_api.berty.chat.IConversationEraseReply> =>
				streamHandler(api.conversationErase.bind(api), request)

			export const conversationSetSeenPosition = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationSetSeenPositionRequest,
			): Promise<_api.berty.chat.IConversationSetSeenPositionReply> =>
				streamHandler(api.conversationSetSeenPosition.bind(api), request)

			export const conversationMessageList = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationMessageListRequest,
			): Promise<Array<_api.berty.chat.IConversationMessageListReply>> =>
				listHandler(api.conversationMessageList.bind(api), request)

			export const conversationMessageSend = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationMessageSendRequest,
			): Promise<_api.berty.chat.IConversationMessageSendReply> =>
				streamHandler(api.conversationMessageSend.bind(api), request)

			export const conversationMessageEdit = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationMessageEditRequest,
			): Promise<_api.berty.chat.IConversationMessageEditReply> =>
				streamHandler(api.conversationMessageEdit.bind(api), request)

			export const conversationMessageHide = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationMessageHideRequest,
			): Promise<_api.berty.chat.IConversationMessageHideReply> =>
				streamHandler(api.conversationMessageHide.bind(api), request)

			export const conversationUpdateSettings = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationUpdateSettingsRequest,
			): Promise<_api.berty.chat.IConversationUpdateSettingsReply> =>
				streamHandler(api.conversationUpdateSettings.bind(api), request)

			export const conversationInvitationAccept = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationInvitationAcceptRequest,
			): Promise<_api.berty.chat.IConversationInvitationAcceptReply> =>
				streamHandler(api.conversationInvitationAccept.bind(api), request)

			export const conversationInvitationCreate = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationInvitationCreateRequest,
			): Promise<_api.berty.chat.IConversationInvitationCreateReply> =>
				streamHandler(api.conversationInvitationCreate.bind(api), request)

			export const conversationInvitationDiscard = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IConversationInvitationDiscardRequest,
			): Promise<_api.berty.chat.IConversationInvitationDiscardReply> =>
				streamHandler(api.conversationInvitationDiscard.bind(api), request)

			export const contactList = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IContactListRequest,
			): Promise<Array<_api.berty.chat.IContactListReply>> =>
				listHandler(api.contactList.bind(api), request)

			export const contactGet = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IContactGetRequest,
			): Promise<_api.berty.chat.IContactGetReply> => getHandler(api.contactGet.bind(api), request)

			export const contactUpdate = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IContactUpdateRequest,
			): Promise<_api.berty.chat.IContactUpdateReply> =>
				streamHandler(api.contactUpdate.bind(api), request)

			export const contactRemove = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IContactRemoveRequest,
			): Promise<_api.berty.chat.IContactRemoveReply> =>
				streamHandler(api.contactRemove.bind(api), request)

			export const contactRequestCreate = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IContactRequestCreateRequest,
			): Promise<_api.berty.chat.IContactRequestCreateReply> =>
				streamHandler(api.contactRequestCreate.bind(api), request)

			export const contactRequestAccept = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IContactRequestAcceptRequest,
			): Promise<_api.berty.chat.IContactRequestAcceptReply> =>
				streamHandler(api.contactRequestAccept.bind(api), request)

			export const contactRequestDiscard = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IContactRequestDiscardRequest,
			): Promise<_api.berty.chat.IContactRequestDiscardReply> =>
				streamHandler(api.contactRequestDiscard.bind(api), request)

			export const search = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.ISearchRequest,
			): Promise<_api.berty.chat.ISearchReply> => streamHandler(api.search.bind(api), request)

			export const accountSettingsGet = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IAccountSettingsGetRequest,
			): Promise<_api.berty.chat.IAccountSettingsGetReply> =>
				getHandler(api.accountSettingsGet.bind(api), request)

			export const accountSettingsUpdate = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IAccountSettingsUpdateRequest,
			): Promise<_api.berty.chat.IAccountSettingsUpdateReply> =>
				streamHandler(api.accountSettingsUpdate.bind(api), request)

			export const accountPairingInvitationCreate = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IAccountPairingInvitationCreateRequest,
			): Promise<_api.berty.chat.IAccountPairingInvitationCreateReply> =>
				streamHandler(api.accountPairingInvitationCreate.bind(api), request)

			export const accountRenewIncomingContactRequestLink = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IAccountRenewIncomingContactRequestLinkRequest,
			): Promise<_api.berty.chat.IAccountRenewIncomingContactRequestLinkReply> =>
				streamHandler(api.accountRenewIncomingContactRequestLink.bind(api), request)

			export const devEventSubscribe = async (
				api: _api.berty.chat.Account,
				request: _api.berty.chat.IDevEventSubscribeRequest,
			): Promise<_api.berty.chat.IDevEventSubscribeReply> =>
				streamHandler(api.devEventSubscribe.bind(api), request)

			// Containers
			type EventSubscribeProps = {
				request: _api.berty.chat.IEventSubscribeRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IEventSubscribeReply) => React.ReactElement
			}
			export const EventSubscribe: React.FC<EventSubscribeProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`EventSubscribe:${JSON.stringify(request)}`, () =>
					berty.chat.Account.eventSubscribe(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationListProps = {
				request: _api.berty.chat.IConversationListRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: Array<_api.berty.chat.IConversationListReply>) => React.ReactElement
			}
			export const ConversationList: React.FC<ConversationListProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ConversationList:${JSON.stringify(request)}`, () =>
					berty.chat.Account.conversationList(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationGetProps = {
				request: _api.berty.chat.IConversationGetRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IConversationGetReply) => React.ReactElement
			}
			export const ConversationGet: React.FC<ConversationGetProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ConversationGet:${JSON.stringify(request)}`, () =>
					berty.chat.Account.conversationGet(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationCreateProps = {
				request: _api.berty.chat.IConversationCreateRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IConversationCreateReply) => React.ReactElement
			}
			export const ConversationCreate: React.FC<ConversationCreateProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ConversationCreate:${JSON.stringify(request)}`, () =>
					berty.chat.Account.conversationCreate(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationLeaveProps = {
				request: _api.berty.chat.IConversationLeaveRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IConversationLeaveReply) => React.ReactElement
			}
			export const ConversationLeave: React.FC<ConversationLeaveProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ConversationLeave:${JSON.stringify(request)}`, () =>
					berty.chat.Account.conversationLeave(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationEraseProps = {
				request: _api.berty.chat.IConversationEraseRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IConversationEraseReply) => React.ReactElement
			}
			export const ConversationErase: React.FC<ConversationEraseProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ConversationErase:${JSON.stringify(request)}`, () =>
					berty.chat.Account.conversationErase(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationSetSeenPositionProps = {
				request: _api.berty.chat.IConversationSetSeenPositionRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.IConversationSetSeenPositionReply,
				) => React.ReactElement
			}
			export const ConversationSetSeenPosition: React.FC<ConversationSetSeenPositionProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(
					`ConversationSetSeenPosition:${JSON.stringify(request)}`,
					() => berty.chat.Account.conversationSetSeenPosition(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationMessageListProps = {
				request: _api.berty.chat.IConversationMessageListRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: Array<_api.berty.chat.IConversationMessageListReply>,
				) => React.ReactElement
			}
			export const ConversationMessageList: React.FC<ConversationMessageListProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ConversationMessageList:${JSON.stringify(request)}`, () =>
					berty.chat.Account.conversationMessageList(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationMessageSendProps = {
				request: _api.berty.chat.IConversationMessageSendRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IConversationMessageSendReply) => React.ReactElement
			}
			export const ConversationMessageSend: React.FC<ConversationMessageSendProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ConversationMessageSend:${JSON.stringify(request)}`, () =>
					berty.chat.Account.conversationMessageSend(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationMessageEditProps = {
				request: _api.berty.chat.IConversationMessageEditRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IConversationMessageEditReply) => React.ReactElement
			}
			export const ConversationMessageEdit: React.FC<ConversationMessageEditProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ConversationMessageEdit:${JSON.stringify(request)}`, () =>
					berty.chat.Account.conversationMessageEdit(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationMessageHideProps = {
				request: _api.berty.chat.IConversationMessageHideRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IConversationMessageHideReply) => React.ReactElement
			}
			export const ConversationMessageHide: React.FC<ConversationMessageHideProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ConversationMessageHide:${JSON.stringify(request)}`, () =>
					berty.chat.Account.conversationMessageHide(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationUpdateSettingsProps = {
				request: _api.berty.chat.IConversationUpdateSettingsRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.IConversationUpdateSettingsReply,
				) => React.ReactElement
			}
			export const ConversationUpdateSettings: React.FC<ConversationUpdateSettingsProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(
					`ConversationUpdateSettings:${JSON.stringify(request)}`,
					() => berty.chat.Account.conversationUpdateSettings(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationInvitationAcceptProps = {
				request: _api.berty.chat.IConversationInvitationAcceptRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.IConversationInvitationAcceptReply,
				) => React.ReactElement
			}
			export const ConversationInvitationAccept: React.FC<ConversationInvitationAcceptProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(
					`ConversationInvitationAccept:${JSON.stringify(request)}`,
					() => berty.chat.Account.conversationInvitationAccept(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationInvitationCreateProps = {
				request: _api.berty.chat.IConversationInvitationCreateRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.IConversationInvitationCreateReply,
				) => React.ReactElement
			}
			export const ConversationInvitationCreate: React.FC<ConversationInvitationCreateProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(
					`ConversationInvitationCreate:${JSON.stringify(request)}`,
					() => berty.chat.Account.conversationInvitationCreate(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationInvitationDiscardProps = {
				request: _api.berty.chat.IConversationInvitationDiscardRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.IConversationInvitationDiscardReply,
				) => React.ReactElement
			}
			export const ConversationInvitationDiscard: React.FC<ConversationInvitationDiscardProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(
					`ConversationInvitationDiscard:${JSON.stringify(request)}`,
					() => berty.chat.Account.conversationInvitationDiscard(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactListProps = {
				request: _api.berty.chat.IContactListRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: Array<_api.berty.chat.IContactListReply>) => React.ReactElement
			}
			export const ContactList: React.FC<ContactListProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ContactList:${JSON.stringify(request)}`, () =>
					berty.chat.Account.contactList(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactGetProps = {
				request: _api.berty.chat.IContactGetRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IContactGetReply) => React.ReactElement
			}
			export const ContactGet: React.FC<ContactGetProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ContactGet:${JSON.stringify(request)}`, () =>
					berty.chat.Account.contactGet(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactUpdateProps = {
				request: _api.berty.chat.IContactUpdateRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IContactUpdateReply) => React.ReactElement
			}
			export const ContactUpdate: React.FC<ContactUpdateProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ContactUpdate:${JSON.stringify(request)}`, () =>
					berty.chat.Account.contactUpdate(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactRemoveProps = {
				request: _api.berty.chat.IContactRemoveRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IContactRemoveReply) => React.ReactElement
			}
			export const ContactRemove: React.FC<ContactRemoveProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ContactRemove:${JSON.stringify(request)}`, () =>
					berty.chat.Account.contactRemove(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactRequestCreateProps = {
				request: _api.berty.chat.IContactRequestCreateRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IContactRequestCreateReply) => React.ReactElement
			}
			export const ContactRequestCreate: React.FC<ContactRequestCreateProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ContactRequestCreate:${JSON.stringify(request)}`, () =>
					berty.chat.Account.contactRequestCreate(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactRequestAcceptProps = {
				request: _api.berty.chat.IContactRequestAcceptRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IContactRequestAcceptReply) => React.ReactElement
			}
			export const ContactRequestAccept: React.FC<ContactRequestAcceptProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ContactRequestAccept:${JSON.stringify(request)}`, () =>
					berty.chat.Account.contactRequestAccept(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactRequestDiscardProps = {
				request: _api.berty.chat.IContactRequestDiscardRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IContactRequestDiscardReply) => React.ReactElement
			}
			export const ContactRequestDiscard: React.FC<ContactRequestDiscardProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`ContactRequestDiscard:${JSON.stringify(request)}`, () =>
					berty.chat.Account.contactRequestDiscard(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type SearchProps = {
				request: _api.berty.chat.ISearchRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ISearchReply) => React.ReactElement
			}
			export const Search: React.FC<SearchProps> = ({ request, fallback: Fallback, children }) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`Search:${JSON.stringify(request)}`, () =>
					berty.chat.Account.search(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountSettingsGetProps = {
				request: _api.berty.chat.IAccountSettingsGetRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IAccountSettingsGetReply) => React.ReactElement
			}
			export const AccountSettingsGet: React.FC<AccountSettingsGetProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`AccountSettingsGet:${JSON.stringify(request)}`, () =>
					berty.chat.Account.accountSettingsGet(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountSettingsUpdateProps = {
				request: _api.berty.chat.IAccountSettingsUpdateRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IAccountSettingsUpdateReply) => React.ReactElement
			}
			export const AccountSettingsUpdate: React.FC<AccountSettingsUpdateProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`AccountSettingsUpdate:${JSON.stringify(request)}`, () =>
					berty.chat.Account.accountSettingsUpdate(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountPairingInvitationCreateProps = {
				request: _api.berty.chat.IAccountPairingInvitationCreateRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.IAccountPairingInvitationCreateReply,
				) => React.ReactElement
			}
			export const AccountPairingInvitationCreate: React.FC<
				AccountPairingInvitationCreateProps
			> = ({ request, fallback: Fallback, children }) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(
					`AccountPairingInvitationCreate:${JSON.stringify(request)}`,
					() => berty.chat.Account.accountPairingInvitationCreate(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountRenewIncomingContactRequestLinkProps = {
				request: _api.berty.chat.IAccountRenewIncomingContactRequestLinkRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.IAccountRenewIncomingContactRequestLinkReply,
				) => React.ReactElement
			}
			export const AccountRenewIncomingContactRequestLink: React.FC<
				AccountRenewIncomingContactRequestLinkProps
			> = ({ request, fallback: Fallback, children }) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(
					`AccountRenewIncomingContactRequestLink:${JSON.stringify(request)}`,
					() => berty.chat.Account.accountRenewIncomingContactRequestLink(ctx, request),
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type DevEventSubscribeProps = {
				request: _api.berty.chat.IDevEventSubscribeRequest
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.IDevEventSubscribeReply) => React.ReactElement
			}
			export const DevEventSubscribe: React.FC<DevEventSubscribeProps> = ({
				request,
				fallback: Fallback,
				children,
			}) => {
				const ctx = useContext(berty.chat.Account.Context)
				const { data, error } = useSWR(`DevEventSubscribe:${JSON.stringify(request)}`, () =>
					berty.chat.Account.devEventSubscribe(ctx, request),
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

export const BertyChatAccount = berty.chat.Account
