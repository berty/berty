import * as _api from '@berty-tech/api'
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
				api.conversationCreate.call(api, request)

			export const conversationUpdate = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationUpdate.IRequest,
			): Promise<_api.berty.chat.ConversationUpdate.IReply> =>
				api.conversationUpdate.call(api, request)

			export const conversationMute = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationMute.IRequest,
			): Promise<_api.berty.chat.ConversationMute.IReply> => api.conversationMute.call(api, request)

			export const conversationLeave = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationLeave.IRequest,
			): Promise<_api.berty.chat.ConversationLeave.IReply> =>
				api.conversationLeave.call(api, request)

			export const conversationErase = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationErase.IRequest,
			): Promise<_api.berty.chat.ConversationErase.IReply> =>
				api.conversationErase.call(api, request)

			export const conversationInvitationSend = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationInvitationSend.IRequest,
			): Promise<_api.berty.chat.ConversationInvitationSend.IReply> =>
				api.conversationInvitationSend.call(api, request)

			export const conversationInvitationAccept = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationInvitationAccept.IRequest,
			): Promise<_api.berty.chat.ConversationInvitationAccept.IReply> =>
				api.conversationInvitationAccept.call(api, request)

			export const conversationInvitationDecline = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ConversationInvitationDecline.IRequest,
			): Promise<_api.berty.chat.ConversationInvitationDecline.IReply> =>
				api.conversationInvitationDecline.call(api, request)

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
			): Promise<_api.berty.chat.MessageSend.IReply> => api.messageSend.call(api, request)

			export const messageEdit = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.MessageEdit.IRequest,
			): Promise<_api.berty.chat.MessageEdit.IReply> => api.messageEdit.call(api, request)

			export const messageHide = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.MessageHide.IRequest,
			): Promise<_api.berty.chat.MessageHide.IReply> => api.messageHide.call(api, request)

			export const messageReact = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.MessageReact.IRequest,
			): Promise<_api.berty.chat.MessageReact.IReply> => api.messageReact.call(api, request)

			export const messageRead = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.MessageRead.IRequest,
			): Promise<_api.berty.chat.MessageRead.IReply> => api.messageRead.call(api, request)

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
			): Promise<_api.berty.chat.ContactBlock.IReply> => api.contactBlock.call(api, request)

			export const contactRemove = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ContactRemove.IRequest,
			): Promise<_api.berty.chat.ContactRemove.IReply> => api.contactRemove.call(api, request)

			export const contactRequestSend = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ContactRequestSend.IRequest,
			): Promise<_api.berty.chat.ContactRequestSend.IReply> =>
				api.contactRequestSend.call(api, request)

			export const contactRequestAccept = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ContactRequestAccept.IRequest,
			): Promise<_api.berty.chat.ContactRequestAccept.IReply> =>
				api.contactRequestAccept.call(api, request)

			export const contactRequestDecline = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.ContactRequestDecline.IRequest,
			): Promise<_api.berty.chat.ContactRequestDecline.IReply> =>
				api.contactRequestDecline.call(api, request)

			export const accountList = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountList.IRequest,
			): Promise<Array<_api.berty.chat.AccountList.IReply>> =>
				listHandler(api.accountList.bind(api), request)

			export const accountGet = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountGet.IRequest,
			): Promise<_api.berty.chat.AccountGet.IReply> => getHandler(api.accountGet.bind(api), request)

			export const accountCreate = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountCreate.IRequest,
			): Promise<_api.berty.chat.AccountCreate.IReply> => api.accountCreate.call(api, request)

			export const accountUpdate = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountUpdate.IRequest,
			): Promise<_api.berty.chat.AccountUpdate.IReply> => api.accountUpdate.call(api, request)

			export const accountOpen = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountOpen.IRequest,
			): Promise<_api.berty.chat.AccountOpen.IReply> => api.accountOpen.call(api, request)

			export const accountClose = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountClose.IRequest,
			): Promise<_api.berty.chat.AccountClose.IReply> => api.accountClose.call(api, request)

			export const accountRemove = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountRemove.IRequest,
			): Promise<_api.berty.chat.AccountRemove.IReply> => api.accountRemove.call(api, request)

			export const accountPairingInvitationCreate = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountPairingInvitationCreate.IRequest,
			): Promise<_api.berty.chat.AccountPairingInvitationCreate.IReply> =>
				api.accountPairingInvitationCreate.call(api, request)

			export const accountRenewIncomingContactRequestLink = async (
				api: _api.berty.chat.ChatService,
				request: _api.berty.chat.AccountRenewIncomingContactRequestLink.IRequest,
			): Promise<_api.berty.chat.AccountRenewIncomingContactRequestLink.IReply> =>
				api.accountRenewIncomingContactRequestLink.call(api, request)

			export const useSearch = (request: _api.berty.chat.Search.IRequest, deps?: Array<any>) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useSearch: deps undefined (swr will not fetch the data)')
							}
						})
						return `Search:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.search(ctx, request),
				)
				return [data, error]
			}
			export const useEventSubscribe = (
				request: _api.berty.chat.EventSubscribe.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useEventSubscribe: deps undefined (swr will not fetch the data)')
							}
						})
						return `EventSubscribe:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.eventSubscribe(ctx, request),
				)
				return [data, error]
			}
			export const useDevEventSubscribe = (
				request: _api.berty.chat.DevEventSubscribe.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error(
									'useDevEventSubscribe: deps undefined (swr will not fetch the data)',
								)
							}
						})
						return `DevEventSubscribe:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.devEventSubscribe(ctx, request),
				)
				return [data, error]
			}
			export const useConversationList = (
				request: _api.berty.chat.ConversationList.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useConversationList: deps undefined (swr will not fetch the data)')
							}
						})
						return `ConversationList:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.conversationList(ctx, request),
				)
				return [data, error]
			}
			export const useConversationGet = (
				request: _api.berty.chat.ConversationGet.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useConversationGet: deps undefined (swr will not fetch the data)')
							}
						})
						return `ConversationGet:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.conversationGet(ctx, request),
				)
				return [data, error]
			}
			export const useConversationCreate = (
				request: _api.berty.chat.ConversationCreate.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error(
									'useConversationCreate: deps undefined (swr will not fetch the data)',
								)
							}
						})
						return `ConversationCreate:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.conversationCreate(ctx, request),
				)
				return [data, error]
			}
			export const useConversationUpdate = (
				request: _api.berty.chat.ConversationUpdate.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error(
									'useConversationUpdate: deps undefined (swr will not fetch the data)',
								)
							}
						})
						return `ConversationUpdate:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.conversationUpdate(ctx, request),
				)
				return [data, error]
			}
			export const useConversationMute = (
				request: _api.berty.chat.ConversationMute.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useConversationMute: deps undefined (swr will not fetch the data)')
							}
						})
						return `ConversationMute:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.conversationMute(ctx, request),
				)
				return [data, error]
			}
			export const useConversationLeave = (
				request: _api.berty.chat.ConversationLeave.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error(
									'useConversationLeave: deps undefined (swr will not fetch the data)',
								)
							}
						})
						return `ConversationLeave:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.conversationLeave(ctx, request),
				)
				return [data, error]
			}
			export const useConversationErase = (
				request: _api.berty.chat.ConversationErase.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error(
									'useConversationErase: deps undefined (swr will not fetch the data)',
								)
							}
						})
						return `ConversationErase:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.conversationErase(ctx, request),
				)
				return [data, error]
			}
			export const useConversationInvitationSend = (
				request: _api.berty.chat.ConversationInvitationSend.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error(
									'useConversationInvitationSend: deps undefined (swr will not fetch the data)',
								)
							}
						})
						return `ConversationInvitationSend:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.conversationInvitationSend(ctx, request),
				)
				return [data, error]
			}
			export const useConversationInvitationAccept = (
				request: _api.berty.chat.ConversationInvitationAccept.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error(
									'useConversationInvitationAccept: deps undefined (swr will not fetch the data)',
								)
							}
						})
						return `ConversationInvitationAccept:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.conversationInvitationAccept(ctx, request),
				)
				return [data, error]
			}
			export const useConversationInvitationDecline = (
				request: _api.berty.chat.ConversationInvitationDecline.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error(
									'useConversationInvitationDecline: deps undefined (swr will not fetch the data)',
								)
							}
						})
						return `ConversationInvitationDecline:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.conversationInvitationDecline(ctx, request),
				)
				return [data, error]
			}
			export const useMessageList = (
				request: _api.berty.chat.MessageList.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useMessageList: deps undefined (swr will not fetch the data)')
							}
						})
						return `MessageList:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.messageList(ctx, request),
				)
				return [data, error]
			}
			export const useMessageGet = (
				request: _api.berty.chat.MessageGet.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useMessageGet: deps undefined (swr will not fetch the data)')
							}
						})
						return `MessageGet:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.messageGet(ctx, request),
				)
				return [data, error]
			}
			export const useMessageSend = (
				request: _api.berty.chat.MessageSend.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useMessageSend: deps undefined (swr will not fetch the data)')
							}
						})
						return `MessageSend:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.messageSend(ctx, request),
				)
				return [data, error]
			}
			export const useMessageEdit = (
				request: _api.berty.chat.MessageEdit.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useMessageEdit: deps undefined (swr will not fetch the data)')
							}
						})
						return `MessageEdit:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.messageEdit(ctx, request),
				)
				return [data, error]
			}
			export const useMessageHide = (
				request: _api.berty.chat.MessageHide.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useMessageHide: deps undefined (swr will not fetch the data)')
							}
						})
						return `MessageHide:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.messageHide(ctx, request),
				)
				return [data, error]
			}
			export const useMessageReact = (
				request: _api.berty.chat.MessageReact.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useMessageReact: deps undefined (swr will not fetch the data)')
							}
						})
						return `MessageReact:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.messageReact(ctx, request),
				)
				return [data, error]
			}
			export const useMessageRead = (
				request: _api.berty.chat.MessageRead.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useMessageRead: deps undefined (swr will not fetch the data)')
							}
						})
						return `MessageRead:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.messageRead(ctx, request),
				)
				return [data, error]
			}
			export const useMemberList = (
				request: _api.berty.chat.MemberList.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useMemberList: deps undefined (swr will not fetch the data)')
							}
						})
						return `MemberList:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.memberList(ctx, request),
				)
				return [data, error]
			}
			export const useMemberGet = (
				request: _api.berty.chat.MemberGet.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useMemberGet: deps undefined (swr will not fetch the data)')
							}
						})
						return `MemberGet:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.memberGet(ctx, request),
				)
				return [data, error]
			}
			export const useContactList = (
				request: _api.berty.chat.ContactList.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useContactList: deps undefined (swr will not fetch the data)')
							}
						})
						return `ContactList:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.contactList(ctx, request),
				)
				return [data, error]
			}
			export const useContactGet = (
				request: _api.berty.chat.ContactGet.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useContactGet: deps undefined (swr will not fetch the data)')
							}
						})
						return `ContactGet:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.contactGet(ctx, request),
				)
				return [data, error]
			}
			export const useContactBlock = (
				request: _api.berty.chat.ContactBlock.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useContactBlock: deps undefined (swr will not fetch the data)')
							}
						})
						return `ContactBlock:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.contactBlock(ctx, request),
				)
				return [data, error]
			}
			export const useContactRemove = (
				request: _api.berty.chat.ContactRemove.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useContactRemove: deps undefined (swr will not fetch the data)')
							}
						})
						return `ContactRemove:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.contactRemove(ctx, request),
				)
				return [data, error]
			}
			export const useContactRequestSend = (
				request: _api.berty.chat.ContactRequestSend.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error(
									'useContactRequestSend: deps undefined (swr will not fetch the data)',
								)
							}
						})
						return `ContactRequestSend:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.contactRequestSend(ctx, request),
				)
				return [data, error]
			}
			export const useContactRequestAccept = (
				request: _api.berty.chat.ContactRequestAccept.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error(
									'useContactRequestAccept: deps undefined (swr will not fetch the data)',
								)
							}
						})
						return `ContactRequestAccept:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.contactRequestAccept(ctx, request),
				)
				return [data, error]
			}
			export const useContactRequestDecline = (
				request: _api.berty.chat.ContactRequestDecline.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error(
									'useContactRequestDecline: deps undefined (swr will not fetch the data)',
								)
							}
						})
						return `ContactRequestDecline:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.contactRequestDecline(ctx, request),
				)
				return [data, error]
			}
			export const useAccountList = (
				request: _api.berty.chat.AccountList.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useAccountList: deps undefined (swr will not fetch the data)')
							}
						})
						return `AccountList:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.accountList(ctx, request),
				)
				return [data, error]
			}
			export const useAccountGet = (
				request: _api.berty.chat.AccountGet.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useAccountGet: deps undefined (swr will not fetch the data)')
							}
						})
						return `AccountGet:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.accountGet(ctx, request),
				)
				return [data, error]
			}
			export const useAccountCreate = (
				request: _api.berty.chat.AccountCreate.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useAccountCreate: deps undefined (swr will not fetch the data)')
							}
						})
						return `AccountCreate:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.accountCreate(ctx, request),
				)
				return [data, error]
			}
			export const useAccountUpdate = (
				request: _api.berty.chat.AccountUpdate.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useAccountUpdate: deps undefined (swr will not fetch the data)')
							}
						})
						return `AccountUpdate:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.accountUpdate(ctx, request),
				)
				return [data, error]
			}
			export const useAccountOpen = (
				request: _api.berty.chat.AccountOpen.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useAccountOpen: deps undefined (swr will not fetch the data)')
							}
						})
						return `AccountOpen:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.accountOpen(ctx, request),
				)
				return [data, error]
			}
			export const useAccountClose = (
				request: _api.berty.chat.AccountClose.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useAccountClose: deps undefined (swr will not fetch the data)')
							}
						})
						return `AccountClose:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.accountClose(ctx, request),
				)
				return [data, error]
			}
			export const useAccountRemove = (
				request: _api.berty.chat.AccountRemove.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error('useAccountRemove: deps undefined (swr will not fetch the data)')
							}
						})
						return `AccountRemove:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.accountRemove(ctx, request),
				)
				return [data, error]
			}
			export const useAccountPairingInvitationCreate = (
				request: _api.berty.chat.AccountPairingInvitationCreate.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error(
									'useAccountPairingInvitationCreate: deps undefined (swr will not fetch the data)',
								)
							}
						})
						return `AccountPairingInvitationCreate:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.accountPairingInvitationCreate(ctx, request),
				)
				return [data, error]
			}
			export const useAccountRenewIncomingContactRequestLink = (
				request: _api.berty.chat.AccountRenewIncomingContactRequestLink.IRequest,
				deps?: Array<any>,
			) => {
				const ctx = useContext(berty.chat.ChatService.Context)
				const { data, error } = useSWR(
					() => {
						deps?.forEach((_) => {
							if (_ === null || _ === undefined) {
								throw new Error(
									'useAccountRenewIncomingContactRequestLink: deps undefined (swr will not fetch the data)',
								)
							}
						})
						return `AccountRenewIncomingContactRequestLink:${JSON.stringify(request)}`
					},
					() => berty.chat.ChatService.accountRenewIncomingContactRequestLink(ctx, request),
				)
				return [data, error]
			}

			// Containers
			type SearchProps = {
				request: _api.berty.chat.Search.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.Search.IReply) => React.ReactNode
			}
			export const Search: React.FC<SearchProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useSearch(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type EventSubscribeProps = {
				request: _api.berty.chat.EventSubscribe.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.EventSubscribe.IReply) => React.ReactNode
			}
			export const EventSubscribe: React.FC<EventSubscribeProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useEventSubscribe(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type DevEventSubscribeProps = {
				request: _api.berty.chat.DevEventSubscribe.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.DevEventSubscribe.IReply) => React.ReactNode
			}
			export const DevEventSubscribe: React.FC<DevEventSubscribeProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useDevEventSubscribe(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationListProps = {
				request: _api.berty.chat.ConversationList.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: Array<_api.berty.chat.ConversationList.IReply>) => React.ReactNode
			}
			export const ConversationList: React.FC<ConversationListProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useConversationList(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationGetProps = {
				request: _api.berty.chat.ConversationGet.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ConversationGet.IReply) => React.ReactNode
			}
			export const ConversationGet: React.FC<ConversationGetProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useConversationGet(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationCreateProps = {
				request: _api.berty.chat.ConversationCreate.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ConversationCreate.IReply) => React.ReactNode
			}
			export const ConversationCreate: React.FC<ConversationCreateProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useConversationCreate(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationUpdateProps = {
				request: _api.berty.chat.ConversationUpdate.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ConversationUpdate.IReply) => React.ReactNode
			}
			export const ConversationUpdate: React.FC<ConversationUpdateProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useConversationUpdate(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationMuteProps = {
				request: _api.berty.chat.ConversationMute.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ConversationMute.IReply) => React.ReactNode
			}
			export const ConversationMute: React.FC<ConversationMuteProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useConversationMute(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationLeaveProps = {
				request: _api.berty.chat.ConversationLeave.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ConversationLeave.IReply) => React.ReactNode
			}
			export const ConversationLeave: React.FC<ConversationLeaveProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useConversationLeave(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationEraseProps = {
				request: _api.berty.chat.ConversationErase.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ConversationErase.IReply) => React.ReactNode
			}
			export const ConversationErase: React.FC<ConversationEraseProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useConversationErase(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationInvitationSendProps = {
				request: _api.berty.chat.ConversationInvitationSend.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ConversationInvitationSend.IReply) => React.ReactNode
			}
			export const ConversationInvitationSend: React.FC<ConversationInvitationSendProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useConversationInvitationSend(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationInvitationAcceptProps = {
				request: _api.berty.chat.ConversationInvitationAccept.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.ConversationInvitationAccept.IReply,
				) => React.ReactNode
			}
			export const ConversationInvitationAccept: React.FC<ConversationInvitationAcceptProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useConversationInvitationAccept(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ConversationInvitationDeclineProps = {
				request: _api.berty.chat.ConversationInvitationDecline.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.ConversationInvitationDecline.IReply,
				) => React.ReactNode
			}
			export const ConversationInvitationDecline: React.FC<ConversationInvitationDeclineProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useConversationInvitationDecline(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageListProps = {
				request: _api.berty.chat.MessageList.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: Array<_api.berty.chat.MessageList.IReply>) => React.ReactNode
			}
			export const MessageList: React.FC<MessageListProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useMessageList(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageGetProps = {
				request: _api.berty.chat.MessageGet.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MessageGet.IReply) => React.ReactNode
			}
			export const MessageGet: React.FC<MessageGetProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useMessageGet(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageSendProps = {
				request: _api.berty.chat.MessageSend.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MessageSend.IReply) => React.ReactNode
			}
			export const MessageSend: React.FC<MessageSendProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useMessageSend(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageEditProps = {
				request: _api.berty.chat.MessageEdit.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MessageEdit.IReply) => React.ReactNode
			}
			export const MessageEdit: React.FC<MessageEditProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useMessageEdit(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageHideProps = {
				request: _api.berty.chat.MessageHide.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MessageHide.IReply) => React.ReactNode
			}
			export const MessageHide: React.FC<MessageHideProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useMessageHide(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageReactProps = {
				request: _api.berty.chat.MessageReact.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MessageReact.IReply) => React.ReactNode
			}
			export const MessageReact: React.FC<MessageReactProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useMessageReact(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MessageReadProps = {
				request: _api.berty.chat.MessageRead.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MessageRead.IReply) => React.ReactNode
			}
			export const MessageRead: React.FC<MessageReadProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useMessageRead(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MemberListProps = {
				request: _api.berty.chat.MemberList.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: Array<_api.berty.chat.MemberList.IReply>) => React.ReactNode
			}
			export const MemberList: React.FC<MemberListProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useMemberList(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type MemberGetProps = {
				request: _api.berty.chat.MemberGet.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.MemberGet.IReply) => React.ReactNode
			}
			export const MemberGet: React.FC<MemberGetProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useMemberGet(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactListProps = {
				request: _api.berty.chat.ContactList.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: Array<_api.berty.chat.ContactList.IReply>) => React.ReactNode
			}
			export const ContactList: React.FC<ContactListProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useContactList(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactGetProps = {
				request: _api.berty.chat.ContactGet.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ContactGet.IReply) => React.ReactNode
			}
			export const ContactGet: React.FC<ContactGetProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useContactGet(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactBlockProps = {
				request: _api.berty.chat.ContactBlock.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ContactBlock.IReply) => React.ReactNode
			}
			export const ContactBlock: React.FC<ContactBlockProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useContactBlock(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactRemoveProps = {
				request: _api.berty.chat.ContactRemove.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ContactRemove.IReply) => React.ReactNode
			}
			export const ContactRemove: React.FC<ContactRemoveProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useContactRemove(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactRequestSendProps = {
				request: _api.berty.chat.ContactRequestSend.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ContactRequestSend.IReply) => React.ReactNode
			}
			export const ContactRequestSend: React.FC<ContactRequestSendProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useContactRequestSend(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactRequestAcceptProps = {
				request: _api.berty.chat.ContactRequestAccept.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ContactRequestAccept.IReply) => React.ReactNode
			}
			export const ContactRequestAccept: React.FC<ContactRequestAcceptProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useContactRequestAccept(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type ContactRequestDeclineProps = {
				request: _api.berty.chat.ContactRequestDecline.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.ContactRequestDecline.IReply) => React.ReactNode
			}
			export const ContactRequestDecline: React.FC<ContactRequestDeclineProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useContactRequestDecline(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountListProps = {
				request: _api.berty.chat.AccountList.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: Array<_api.berty.chat.AccountList.IReply>) => React.ReactNode
			}
			export const AccountList: React.FC<AccountListProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useAccountList(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountGetProps = {
				request: _api.berty.chat.AccountGet.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.AccountGet.IReply) => React.ReactNode
			}
			export const AccountGet: React.FC<AccountGetProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useAccountGet(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountCreateProps = {
				request: _api.berty.chat.AccountCreate.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.AccountCreate.IReply) => React.ReactNode
			}
			export const AccountCreate: React.FC<AccountCreateProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useAccountCreate(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountUpdateProps = {
				request: _api.berty.chat.AccountUpdate.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.AccountUpdate.IReply) => React.ReactNode
			}
			export const AccountUpdate: React.FC<AccountUpdateProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useAccountUpdate(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountOpenProps = {
				request: _api.berty.chat.AccountOpen.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.AccountOpen.IReply) => React.ReactNode
			}
			export const AccountOpen: React.FC<AccountOpenProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useAccountOpen(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountCloseProps = {
				request: _api.berty.chat.AccountClose.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.AccountClose.IReply) => React.ReactNode
			}
			export const AccountClose: React.FC<AccountCloseProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useAccountClose(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountRemoveProps = {
				request: _api.berty.chat.AccountRemove.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (response: _api.berty.chat.AccountRemove.IReply) => React.ReactNode
			}
			export const AccountRemove: React.FC<AccountRemoveProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useAccountRemove(request, deps)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountPairingInvitationCreateProps = {
				request: _api.berty.chat.AccountPairingInvitationCreate.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.AccountPairingInvitationCreate.IReply,
				) => React.ReactNode
			}
			export const AccountPairingInvitationCreate: React.FC<AccountPairingInvitationCreateProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useAccountPairingInvitationCreate(
					request,
					deps,
				)
				if (error != null || data == null) {
					return Fallback ? <Fallback error={error} /> : null
				}
				return children ? children(data) : null
			}

			type AccountRenewIncomingContactRequestLinkProps = {
				request: _api.berty.chat.AccountRenewIncomingContactRequestLink.IRequest
				deps?: Array<any>
				fallback?: React.FC<{ error?: Error }>
				children?: (
					response: _api.berty.chat.AccountRenewIncomingContactRequestLink.IReply,
				) => React.ReactNode
			}
			export const AccountRenewIncomingContactRequestLink: React.FC<AccountRenewIncomingContactRequestLinkProps> = ({
				request,
				deps,
				fallback: Fallback,
				children,
			}) => {
				const [data, error] = berty.chat.ChatService.useAccountRenewIncomingContactRequestLink(
					request,
					deps,
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
