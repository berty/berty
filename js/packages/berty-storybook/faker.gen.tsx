import * as _api from '@berty-tech/api'
import _faker from 'faker'
import * as pb from 'protobufjs'
import { deepFilterEqual, deepEqual, timestamp, randomArray, randomValue } from './helpers'

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
						method && method.resolvedRequestType && method.resolvedRequestType.decode(requestData),
						callback,
					)
				}

				export const Search: (
					request: _api.berty.chat.Search.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.Search.Reply.encode({}).finish())
				}

				export const EventSubscribe: (
					request: _api.berty.chat.EventSubscribe.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.EventSubscribe.Reply.encode({}).finish())
				}

				export const DevEventSubscribe: (
					request: _api.berty.chat.DevEventSubscribe.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.DevEventSubscribe.Reply.encode({}).finish())
				}

				export const ConversationList: (
					request: _api.berty.chat.ConversationList.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					faker.berty.chatmodel.Conversation.filter(
						(_) =>
							(request.filter == null || deepFilterEqual(request.filter, _)) &&
							(request.not == null || !deepEqual(request.not, _)),
					).forEach((_, index) =>
						callback(
							null,
							_api.berty.chat.ConversationList.Reply.encode({
								conversation: faker.berty.chatmodel.Conversation[index],
							}).finish(),
						),
					)
				}

				export const ConversationGet: (
					request: _api.berty.chat.ConversationGet.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.chat.ConversationGet.Reply.encode({
							conversation: faker.berty.chatmodel.Conversation[request.id as number],
						}).finish(),
					)
				}

				export const ConversationCreate: (
					request: _api.berty.chat.ConversationCreate.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationCreate.Reply.encode({}).finish())
				}

				export const ConversationUpdate: (
					request: _api.berty.chat.ConversationUpdate.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationUpdate.Reply.encode({}).finish())
				}

				export const ConversationMute: (
					request: _api.berty.chat.ConversationMute.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationMute.Reply.encode({}).finish())
				}

				export const ConversationLeave: (
					request: _api.berty.chat.ConversationLeave.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationLeave.Reply.encode({}).finish())
				}

				export const ConversationErase: (
					request: _api.berty.chat.ConversationErase.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationErase.Reply.encode({}).finish())
				}

				export const ConversationInvitationSend: (
					request: _api.berty.chat.ConversationInvitationSend.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationInvitationSend.Reply.encode({}).finish())
				}

				export const ConversationInvitationAccept: (
					request: _api.berty.chat.ConversationInvitationAccept.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationInvitationAccept.Reply.encode({}).finish())
				}

				export const ConversationInvitationDecline: (
					request: _api.berty.chat.ConversationInvitationDecline.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ConversationInvitationDecline.Reply.encode({}).finish())
				}

				export const MessageList: (
					request: _api.berty.chat.MessageList.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					faker.berty.chatmodel.Message.filter(
						(_) =>
							(request.filter == null || deepFilterEqual(request.filter, _)) &&
							(request.not == null || !deepEqual(request.not, _)),
					).forEach((_, index) =>
						callback(
							null,
							_api.berty.chat.MessageList.Reply.encode({
								message: faker.berty.chatmodel.Message[index],
							}).finish(),
						),
					)
				}

				export const MessageGet: (
					request: _api.berty.chat.MessageGet.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.chat.MessageGet.Reply.encode({
							message: faker.berty.chatmodel.Message[request.id as number],
						}).finish(),
					)
				}

				export const MessageSend: (
					request: _api.berty.chat.MessageSend.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.MessageSend.Reply.encode({}).finish())
				}

				export const MessageEdit: (
					request: _api.berty.chat.MessageEdit.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.MessageEdit.Reply.encode({}).finish())
				}

				export const MessageHide: (
					request: _api.berty.chat.MessageHide.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.MessageHide.Reply.encode({}).finish())
				}

				export const MessageReact: (
					request: _api.berty.chat.MessageReact.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.MessageReact.Reply.encode({}).finish())
				}

				export const MessageRead: (
					request: _api.berty.chat.MessageRead.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.MessageRead.Reply.encode({}).finish())
				}

				export const MemberList: (
					request: _api.berty.chat.MemberList.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					faker.berty.chatmodel.Member.filter(
						(_) =>
							(request.filter == null || deepFilterEqual(request.filter, _)) &&
							(request.not == null || !deepEqual(request.not, _)),
					).forEach((_, index) =>
						callback(
							null,
							_api.berty.chat.MemberList.Reply.encode({
								member: faker.berty.chatmodel.Member[index],
							}).finish(),
						),
					)
				}

				export const MemberGet: (
					request: _api.berty.chat.MemberGet.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.chat.MemberGet.Reply.encode({
							member: faker.berty.chatmodel.Member[request.id as number],
						}).finish(),
					)
				}

				export const ContactList: (
					request: _api.berty.chat.ContactList.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					faker.berty.chatmodel.Contact.filter(
						(_) =>
							(request.filter == null || deepFilterEqual(request.filter, _)) &&
							(request.not == null || !deepEqual(request.not, _)),
					).forEach((_, index) =>
						callback(
							null,
							_api.berty.chat.ContactList.Reply.encode({
								contact: faker.berty.chatmodel.Contact[index],
							}).finish(),
						),
					)
				}

				export const ContactGet: (
					request: _api.berty.chat.ContactGet.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.chat.ContactGet.Reply.encode({
							contact: faker.berty.chatmodel.Contact[request.id as number],
						}).finish(),
					)
				}

				export const ContactBlock: (
					request: _api.berty.chat.ContactBlock.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ContactBlock.Reply.encode({}).finish())
				}

				export const ContactRemove: (
					request: _api.berty.chat.ContactRemove.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ContactRemove.Reply.encode({}).finish())
				}

				export const ContactRequestSend: (
					request: _api.berty.chat.ContactRequestSend.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ContactRequestSend.Reply.encode({}).finish())
				}

				export const ContactRequestAccept: (
					request: _api.berty.chat.ContactRequestAccept.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ContactRequestAccept.Reply.encode({}).finish())
				}

				export const ContactRequestDecline: (
					request: _api.berty.chat.ContactRequestDecline.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.ContactRequestDecline.Reply.encode({}).finish())
				}

				export const AccountList: (
					request: _api.berty.chat.AccountList.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					faker.berty.chatmodel.Account.filter(
						(_) =>
							(request.filter == null || deepFilterEqual(request.filter, _)) &&
							(request.not == null || !deepEqual(request.not, _)),
					).forEach((_, index) =>
						callback(
							null,
							_api.berty.chat.AccountList.Reply.encode({
								account: faker.berty.chatmodel.Account[index],
							}).finish(),
						),
					)
				}

				export const AccountGet: (
					request: _api.berty.chat.AccountGet.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.chat.AccountGet.Reply.encode({
							account: faker.berty.chatmodel.Account[request.id as number],
						}).finish(),
					)
				}

				export const AccountCreate: (
					request: _api.berty.chat.AccountCreate.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.AccountCreate.Reply.encode({}).finish())
				}

				export const AccountUpdate: (
					request: _api.berty.chat.AccountUpdate.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.AccountUpdate.Reply.encode({}).finish())
				}

				export const AccountOpen: (
					request: _api.berty.chat.AccountOpen.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.AccountOpen.Reply.encode({}).finish())
				}

				export const AccountClose: (
					request: _api.berty.chat.AccountClose.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.AccountClose.Reply.encode({}).finish())
				}

				export const AccountRemove: (
					request: _api.berty.chat.AccountRemove.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.AccountRemove.Reply.encode({}).finish())
				}

				export const AccountPairingInvitationCreate: (
					request: _api.berty.chat.AccountPairingInvitationCreate.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.chat.AccountPairingInvitationCreate.Reply.encode({}).finish())
				}

				export const AccountRenewIncomingContactRequestLink: (
					request: _api.berty.chat.AccountRenewIncomingContactRequestLink.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.chat.AccountRenewIncomingContactRequestLink.Reply.encode({}).finish(),
					)
				}
			}
		}
		export namespace chatmodel {
			export const Contact: Array<_api.berty.chatmodel.IContact> = randomArray(20)
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
			export const Device: Array<_api.berty.chatmodel.IDevice> = randomArray(20)
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
					contact: faker.berty.chatmodel.Contact[_.contactId],
				}))
			export const Conversation: Array<_api.berty.chatmodel.IConversation> = randomArray(20)
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
			export const Member: Array<_api.berty.chatmodel.IMember> = randomArray(20)
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
					conversation: faker.berty.chatmodel.Conversation[_.conversationId],
					contactId: _faker.random.number() % faker.berty.chatmodel.Contact.length,
					contact: faker.berty.chatmodel.Contact[_.contactId],
				}))
			export const Message: Array<_api.berty.chatmodel.IMessage> = randomArray(20)
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
					conversation: faker.berty.chatmodel.Conversation[_.conversationId],
					memberId: _faker.random.number() % faker.berty.chatmodel.Member.length,
					member: faker.berty.chatmodel.Member[_.memberId],
					attachments: [],
					reactions: [],
				}))
			export const Attachment: Array<_api.berty.chatmodel.IAttachment> = randomArray(20)
				.fill({})
				.map((_, index) => ({
					id: index,
					createdAt: timestamp(_faker.date.recent()),
					updatedAt: timestamp(_faker.date.recent()),
					uri: _faker.random.words(),
					contentType: _faker.random.words(),
					messageId: _faker.random.number() % faker.berty.chatmodel.Message.length,
					message: faker.berty.chatmodel.Message[_.messageId],
				}))
			export const Reaction: Array<_api.berty.chatmodel.IReaction> = randomArray(20)
				.fill({})
				.map((_, index) => ({
					id: index,
					createdAt: timestamp(_faker.date.recent()),
					updatedAt: timestamp(_faker.date.recent()),
					emoji: new Uint8Array(),
					messageId: _faker.random.number() % faker.berty.chatmodel.Message.length,
					message: faker.berty.chatmodel.Message[_.messageId],
					memberId: _faker.random.number() % faker.berty.chatmodel.Member.length,
					member: faker.berty.chatmodel.Member[_.memberId],
				}))
			export const Account: Array<_api.berty.chatmodel.IAccount> = randomArray(20)
				.fill({})
				.map((_, index) => ({
					id: index,
					createdAt: timestamp(_faker.date.recent()),
					updatedAt: timestamp(_faker.date.recent()),
					contactId: _faker.random.number() % faker.berty.chatmodel.Contact.length,
					contact: faker.berty.chatmodel.Contact[_.contactId],
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
