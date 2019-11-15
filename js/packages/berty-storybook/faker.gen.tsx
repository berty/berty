import * as _api from '@berty-tech/berty-api'
import _faker from 'faker'
import * as pb from 'protobufjs'
import { deepFilterEqual, timestamp, randomArray, randomValue } from './helpers'

export namespace faker {
	export namespace berty {
		export namespace chat {
			export namespace ChatService {
				export const rpcImpl: pb.RPCImpl = (method, requestData, callback) => {
					// map pbjs method descriptor to grpc method descriptor
					if (!(method instanceof pb.Method)) {
						console.error("bridge doesn't support protobuf.rpc.ServiceMethod")
						return
					}
					const _ = faker.berty.chat.ChatService as { [key: string]: any }
					_[method.name](
						method &&
							method.resolvedResponseType &&
							method.resolvedResponseType.decode(requestData),
						callback,
					)
				}

				export const Search: (
					request: _api.berty.chat.ISearchRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.SearchReply.encode({}).finish())
				}

				export const EventSubscribe: (
					request: _api.berty.chat.IEventSubscribeRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.EventSubscribeReply.encode({}).finish())
				}

				export const DevEventSubscribe: (
					request: _api.berty.chat.IDevEventSubscribeRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.DevEventSubscribeReply.encode({}).finish())
				}

				export const ConversationList: (
					request: _api.berty.chat.IConversationListRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					faker.berty.chatmodel.Conversation.filter((_) =>
						deepFilterEqual(request.filter, _),
					).forEach((_, index) =>
						callback(
							null,
							_api.berty.chat.ConversationListReply.encode({
								conversation: faker.berty.chatmodel.Conversation[index],
							}).finish(),
						),
					)
				}

				export const ConversationGet: (
					request: _api.berty.chat.IConversationGetRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.chat.ConversationGetReply.encode({
							conversation: faker.berty.chatmodel.Conversation[request.id as number],
						}).finish(),
					)
				}

				export const ConversationCreate: (
					request: _api.berty.chat.IConversationCreateRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationCreateReply.encode({}).finish())
				}

				export const ConversationUpdate: (
					request: _api.berty.chat.IConversationUpdateRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationUpdateReply.encode({}).finish())
				}

				export const ConversationMute: (
					request: _api.berty.chat.IConversationMuteRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationMuteReply.encode({}).finish())
				}

				export const ConversationLeave: (
					request: _api.berty.chat.IConversationLeaveRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationLeaveReply.encode({}).finish())
				}

				export const ConversationErase: (
					request: _api.berty.chat.IConversationEraseRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationEraseReply.encode({}).finish())
				}

				export const ConversationInvitationSend: (
					request: _api.berty.chat.IConversationInvitationSendRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationInvitationSendReply.encode({}).finish())
				}

				export const ConversationInvitationAccept: (
					request: _api.berty.chat.IConversationInvitationAcceptRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationInvitationAcceptReply.encode({}).finish())
				}

				export const ConversationInvitationDecline: (
					request: _api.berty.chat.IConversationInvitationDeclineRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationInvitationDeclineReply.encode({}).finish())
				}

				export const MessageList: (
					request: _api.berty.chat.IMessageListRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					faker.berty.chatmodel.Message.filter((_) => deepFilterEqual(request.filter, _)).forEach(
						(_, index) =>
							callback(
								null,
								_api.berty.chat.MessageListReply.encode({
									message: faker.berty.chatmodel.Message[index],
								}).finish(),
							),
					)
				}

				export const MessageGet: (
					request: _api.berty.chat.IMessageGetRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.chat.MessageGetReply.encode({
							message: faker.berty.chatmodel.Message[request.id as number],
						}).finish(),
					)
				}

				export const MessageSend: (
					request: _api.berty.chat.IMessageSendRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.MessageSendReply.encode({}).finish())
				}

				export const MessageEdit: (
					request: _api.berty.chat.IMessageEditRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.MessageEditReply.encode({}).finish())
				}

				export const MessageHide: (
					request: _api.berty.chat.IMessageHideRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.MessageHideReply.encode({}).finish())
				}

				export const MessageReact: (
					request: _api.berty.chat.IMessageReactRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.MessageReactReply.encode({}).finish())
				}

				export const MessageRead: (
					request: _api.berty.chat.IMessageReadRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.MessageReadReply.encode({}).finish())
				}

				export const MemberList: (
					request: _api.berty.chat.IMemberListRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					faker.berty.chatmodel.Member.filter((_) => deepFilterEqual(request.filter, _)).forEach(
						(_, index) =>
							callback(
								null,
								_api.berty.chat.MemberListReply.encode({
									member: faker.berty.chatmodel.Member[index],
								}).finish(),
							),
					)
				}

				export const MemberGet: (
					request: _api.berty.chat.IMemberGetRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.chat.MemberGetReply.encode({
							member: faker.berty.chatmodel.Member[request.id as number],
						}).finish(),
					)
				}

				export const ContactList: (
					request: _api.berty.chat.IContactListRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					faker.berty.chatmodel.Contact.filter((_) => deepFilterEqual(request.filter, _)).forEach(
						(_, index) =>
							callback(
								null,
								_api.berty.chat.ContactListReply.encode({
									contact: faker.berty.chatmodel.Contact[index],
								}).finish(),
							),
					)
				}

				export const ContactGet: (
					request: _api.berty.chat.IContactGetRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.chat.ContactGetReply.encode({
							contact: faker.berty.chatmodel.Contact[request.id as number],
						}).finish(),
					)
				}

				export const ContactBlock: (
					request: _api.berty.chat.IContactBlockRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ContactBlockReply.encode({}).finish())
				}

				export const ContactRemove: (
					request: _api.berty.chat.IContactRemoveRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ContactRemoveReply.encode({}).finish())
				}

				export const ContactRequestSend: (
					request: _api.berty.chat.IContactRequestSendRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ContactRequestSendReply.encode({}).finish())
				}

				export const ContactRequestAccept: (
					request: _api.berty.chat.IContactRequestAcceptRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ContactRequestAcceptReply.encode({}).finish())
				}

				export const ContactRequestDecline: (
					request: _api.berty.chat.IContactRequestDeclineRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ContactRequestDeclineReply.encode({}).finish())
				}

				export const AccountList: (
					request: _api.berty.chat.IAccountListRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {}

				export const AccountGet: (
					request: _api.berty.chat.IAccountGetRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.chat.AccountGetReply.encode({
							account: faker.berty.chatmodel.Account[request.id as number],
						}).finish(),
					)
				}

				export const AccountCreate: (
					request: _api.berty.chat.IAccountCreateRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.AccountCreateReply.encode({}).finish())
				}

				export const AccountUpdate: (
					request: _api.berty.chat.IAccountUpdateRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.AccountUpdateReply.encode({}).finish())
				}

				export const AccountOpen: (
					request: _api.berty.chat.IAccountOpenRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.AccountOpenReply.encode({}).finish())
				}

				export const AccountClose: (
					request: _api.berty.chat.IAccountCloseRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.AccountCloseReply.encode({}).finish())
				}

				export const AccountRemove: (
					request: _api.berty.chat.IAccountRemoveRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.AccountRemoveReply.encode({}).finish())
				}

				export const AccountPairingInvitationCreate: (
					request: _api.berty.chat.IAccountPairingInvitationCreateRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.AccountPairingInvitationCreateReply.encode({}).finish())
				}

				export const AccountRenewIncomingContactRequestLink: (
					request: _api.berty.chat.IAccountRenewIncomingContactRequestLinkRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.chat.AccountRenewIncomingContactRequestLinkReply.encode({}).finish(),
					)
				}
			}
		}
		export namespace chatmodel {
			export const Contact: Array<_api.berty.chatmodel.IContact> = randomArray(50)
				.fill({})
				.map((_, index) => ({
					id: index,
					protocolId: '',
					createdAt: timestamp(_faker.date.recent()),
					updatedAt: timestamp(_faker.date.recent()),
					seenAt: timestamp(_faker.date.recent()),
					name: _faker.name.findName(),
					avatarUri: _faker.internet.avatar(),
					statusEmoji: new Uint8Array(),
					statusText: _faker.random.words(),
					kind: randomValue(_api.berty.chatmodel.Contact.Kind),
					blocked: _faker.random.boolean(),
					devices: [],
				}))
			export const Device: Array<_api.berty.chatmodel.IDevice> = randomArray(50)
				.fill({})
				.map((_, index) => ({
					id: index,
					protocolId: '',
					createdAt: timestamp(_faker.date.recent()),
					updatedAt: timestamp(_faker.date.recent()),
					lastSeenAt: timestamp(_faker.date.recent()),
					kind: randomValue(_api.berty.chatmodel.Device.Kind),
					canRelay: _faker.random.boolean(),
					canBle: _faker.random.boolean(),
					contactId: _faker.random.number() % faker.berty.chatmodel.Contact.length,
					contact: null,
				}))
			export const Conversation: Array<_api.berty.chatmodel.IConversation> = randomArray(50)
				.fill({})
				.map((_, index) => ({
					id: index,
					protocolId: '',
					createdAt: timestamp(_faker.date.recent()),
					updatedAt: timestamp(_faker.date.recent()),
					title: _faker.name.findName(),
					topic: _faker.random.words(),
					avatarUri: _faker.internet.avatar(),
					kind: randomValue(_api.berty.chatmodel.Conversation.Kind),
					badge: _faker.random.number() % 20,
					messages: [],
					members: [],
					lastMessageId: _faker.random.number() % 50,
					lastMessage: null,
				}))
			export const Member: Array<_api.berty.chatmodel.IMember> = randomArray(50)
				.fill({})
				.map((_, index) => ({
					id: index,
					protocolId: '',
					createdAt: timestamp(_faker.date.recent()),
					updatedAt: timestamp(_faker.date.recent()),
					readAt: timestamp(_faker.date.recent()),
					name: _faker.name.findName(),
					avatarUri: _faker.internet.avatar(),
					role: randomValue(_api.berty.chatmodel.Member.Role),
					mutePolicy: randomValue(_api.berty.chatmodel.Member.MutePolicy),
					conversationId: _faker.random.number() % faker.berty.chatmodel.Conversation.length,
					conversation: null,
					contactId: _faker.random.number() % faker.berty.chatmodel.Contact.length,
					contact: null,
				}))
			export const Message: Array<_api.berty.chatmodel.IMessage> = randomArray(50)
				.fill({})
				.map((_, index) => ({
					id: index,
					protocolId: '',
					createdAt: timestamp(_faker.date.recent()),
					updatedAt: timestamp(_faker.date.recent()),
					sentAt: timestamp(_faker.date.recent()),
					editedAt: timestamp(_faker.date.recent()),
					kind: randomValue(_api.berty.chatmodel.Message.Kind),
					body: null,
					hidden: _faker.random.boolean(),
					state: randomValue(_api.berty.chatmodel.Message.State),
					conversationId: _faker.random.number() % faker.berty.chatmodel.Conversation.length,
					conversation: null,
					memberId: _faker.random.number() % faker.berty.chatmodel.Member.length,
					member: null,
					attachments: [],
					reactions: [],
				}))
			export const Attachment: Array<_api.berty.chatmodel.IAttachment> = randomArray(50)
				.fill({})
				.map((_, index) => ({
					id: index,
					createdAt: timestamp(_faker.date.recent()),
					updatedAt: timestamp(_faker.date.recent()),
					uri: _faker.random.words(),
					contentType: _faker.random.words(),
					messageId: _faker.random.number() % faker.berty.chatmodel.Message.length,
					message: null,
				}))
			export const Reaction: Array<_api.berty.chatmodel.IReaction> = randomArray(50)
				.fill({})
				.map((_, index) => ({
					id: index,
					createdAt: timestamp(_faker.date.recent()),
					updatedAt: timestamp(_faker.date.recent()),
					emoji: new Uint8Array(),
					messageId: _faker.random.number() % faker.berty.chatmodel.Message.length,
					message: null,
					memberId: _faker.random.number() % faker.berty.chatmodel.Member.length,
					member: null,
				}))
			export const Account: Array<_api.berty.chatmodel.IAccount> = randomArray(50)
				.fill({})
				.map((_, index) => ({
					id: index,
					createdAt: timestamp(_faker.date.recent()),
					updatedAt: timestamp(_faker.date.recent()),
					contactId: _faker.random.number() % faker.berty.chatmodel.Contact.length,
					myself: null,
					contactRequestsEnabled: _faker.random.boolean(),
					contactRequestsLink: _faker.random.words(),
					hidden: _faker.random.boolean(),
					locked: _faker.random.boolean(),
				}))
		}
	}
	export namespace google {
		export namespace api {}
		export namespace protobuf {}
	}
	export namespace gogoproto {}
}
