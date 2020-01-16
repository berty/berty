import * as _api from '@berty-tech/api'
import _faker from 'faker'
import randomEmoji from 'random-emoji'
import * as pb from 'protobufjs'

const randomItem = <T extends unknown>(arr: Array<T>): T =>
	arr[Math.floor(Math.random() * 1000) % arr.length]

const randomValue = <T extends { [name: string]: any }>(obj: T): any =>
	obj[randomItem(Object.keys(obj))]

const randomLength = (mod = 20): number => Math.floor(Math.random() * 1000) % mod
const randomArray = <T extends unknown>(mod: number): Array<T> =>
	new Array(randomLength(mod)).fill({})

const timestamp = (date: Date): _api.google.protobuf.ITimestamp => ({
	seconds: Math.floor(date.getTime() / 1000),
	nanos: (date.getTime() % 1000) * 1000,
})

export namespace berty {
	export namespace chatmodel {
		export const Account: Array<_api.berty.chatmodel.IAccount> = randomArray(100)
			.fill({})
			.map((_, index) => ({
				id: index,
				createdAt: timestamp(_faker.date.recent()),
				updatedAt: timestamp(_faker.date.recent()),
				name: _faker.name.findName(),
				avatarUri: _faker.internet.avatar(),
				contactRequestsEnabled: _faker.random.boolean(),
				contactRequestsLink: _faker.image.imageUrl(),
			}))
		export const Conversation: Array<_api.berty.chatmodel.IConversation> = randomArray(100)
			.fill({})
			.map((_, index) => ({
				id: index,
				protocolId: '',
				createdAt: timestamp(_faker.date.recent()),
				updatedAt: timestamp(_faker.date.recent()),
				title: randomItem([_faker.name.findName, _faker.name.title])(),
				topic: randomItem([_faker.name.findName, _faker.name.title])(),
				avatarUri: _faker.internet.avatar(),
				kind: randomValue(_api.berty.chatmodel.Conversation.Kind),
				badge: randomItem([0, _faker.random.number(10)]),
				mutePolicy: randomValue(_api.berty.chatmodel.Conversation.MutePolicy),
				messages: [],
				members: [],
				lastMessageId: 0,
				lastMessage: null,
			}))
		export const Member: Array<_api.berty.chatmodel.IMember> = randomArray(100)
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
				conversationId: 0,
				conversation: null,
				contactId: 0,
				contact: null,
			}))
		export const Message: Array<_api.berty.chatmodel.IMessage> = randomArray(100)
			.fill({})
			.map((_, index) => ({
				id: index,
				protocolId: '',
				createdAt: timestamp(_faker.date.recent()),
				updatedAt: timestamp(_faker.date.recent()),
				sentAt: timestamp(_faker.date.recent()),
				kind: randomValue(_api.berty.chatmodel.Message.Kind),
				body: null,
				conversationId: 0,
				conversation: null,
				memberId: 0,
				member: null,
				attachments: [],
				reactions: [],
			}))
		export const Attachment: Array<_api.berty.chatmodel.IAttachment> = randomArray(100)
			.fill({})
			.map((_, index) => ({
				id: index,
				createdAt: timestamp(_faker.date.recent()),
				updatedAt: timestamp(_faker.date.recent()),
				uri: _faker.image.imageUrl(),
				contentType: '',
				messageId: 0,
				message: null,
			}))
		export const Reaction: Array<_api.berty.chatmodel.IReaction> = randomArray(100)
			.fill({})
			.map((_, index) => ({
				id: index,
				createdAt: timestamp(_faker.date.recent()),
				updatedAt: timestamp(_faker.date.recent()),
				emoji: randomEmoji.random({ count: 1 })[0],
				messageId: 0,
				message: null,
				memberId: 0,
				member: null,
			}))
		export const Contact: Array<_api.berty.chatmodel.IContact> = randomArray(100)
			.fill({})
			.map((_, index) => ({
				id: index,
				protocolId: '',
				createdAt: timestamp(_faker.date.recent()),
				updatedAt: timestamp(_faker.date.recent()),
				seenAt: timestamp(_faker.date.recent()),
				name: _faker.name.findName(),
				avatarUri: _faker.internet.avatar(),
				statusEmoji: randomEmoji.random({ count: 1 })[0],
				statusText: _faker.random.words(),
				kind: randomValue(_api.berty.chatmodel.Contact.Kind),
				blocked: _faker.random.boolean(),
				devices: [],
			}))
		export const Device: Array<_api.berty.chatmodel.IDevice> = randomArray(100)
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
				contactId: 0,
				contact: null,
			}))
	}
	export namespace chat {
		export namespace Account {
			export const rpcImpl: pb.RPCImpl = (method, requestData, callback) => {
				// map pbjs method descriptor to grpc method descriptor
				if (!(method instanceof pb.Method)) {
					console.error("bridge doesn't support protobuf.rpc.ServiceMethod")
					return
				}
				const rpc = berty.chat.Account as { [key: string]: any }
				rpc[method.name](
					method && method.resolvedResponseType && method.resolvedResponseType.decode(requestData),
					callback,
				)
			}
			export const EventSubscribe = (
				_: _api.berty.chat.IEventSubscribeRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.EventSubscribeReply.encode({}).finish())
			}

			export const ConversationList = (
				_: _api.berty.chat.IConversationListRequest,
				callback: pb.RPCImplCallback,
			): void => {
				berty.chatmodel.Conversation.forEach((_, index) =>
					callback(null, _api.berty.chat.ConversationListReply.encode({}).finish()),
				)
			}

			export const ConversationGet = (
				_: _api.berty.chat.IConversationGetRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ConversationGetReply.encode({}).finish())
			}

			export const ConversationCreate = (
				_: _api.berty.chat.IConversationCreateRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ConversationCreateReply.encode({}).finish())
			}

			export const ConversationLeave = (
				_: _api.berty.chat.IConversationLeaveRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ConversationLeaveReply.encode({}).finish())
			}

			export const ConversationErase = (
				_: _api.berty.chat.IConversationEraseRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ConversationEraseReply.encode({}).finish())
			}

			export const ConversationSetSeenPosition = (
				_: _api.berty.chat.IConversationSetSeenPositionRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ConversationSetSeenPositionReply.encode({}).finish())
			}

			export const ConversationMessageList = (
				_: _api.berty.chat.IConversationMessageListRequest,
				callback: pb.RPCImplCallback,
			): void => {}

			export const ConversationMessageSend = (
				_: _api.berty.chat.IConversationMessageSendRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ConversationMessageSendReply.encode({}).finish())
			}

			export const ConversationMessageEdit = (
				_: _api.berty.chat.IConversationMessageEditRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ConversationMessageEditReply.encode({}).finish())
			}

			export const ConversationMessageHide = (
				_: _api.berty.chat.IConversationMessageHideRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ConversationMessageHideReply.encode({}).finish())
			}

			export const ConversationUpdateSettings = (
				_: _api.berty.chat.IConversationUpdateSettingsRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ConversationUpdateSettingsReply.encode({}).finish())
			}

			export const ConversationInvitationAccept = (
				_: _api.berty.chat.IConversationInvitationAcceptRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ConversationInvitationAcceptReply.encode({}).finish())
			}

			export const ConversationInvitationCreate = (
				_: _api.berty.chat.IConversationInvitationCreateRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ConversationInvitationCreateReply.encode({}).finish())
			}

			export const ConversationInvitationDiscard = (
				_: _api.berty.chat.IConversationInvitationDiscardRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ConversationInvitationDiscardReply.encode({}).finish())
			}

			export const ContactList = (
				_: _api.berty.chat.IContactListRequest,
				callback: pb.RPCImplCallback,
			): void => {}

			export const ContactGet = (
				_: _api.berty.chat.IContactGetRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ContactGetReply.encode({}).finish())
			}

			export const ContactUpdate = (
				_: _api.berty.chat.IContactUpdateRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ContactUpdateReply.encode({}).finish())
			}

			export const ContactRemove = (
				_: _api.berty.chat.IContactRemoveRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ContactRemoveReply.encode({}).finish())
			}

			export const ContactRequestCreate = (
				_: _api.berty.chat.IContactRequestCreateRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ContactRequestCreateReply.encode({}).finish())
			}

			export const ContactRequestAccept = (
				_: _api.berty.chat.IContactRequestAcceptRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ContactRequestAcceptReply.encode({}).finish())
			}

			export const ContactRequestDiscard = (
				_: _api.berty.chat.IContactRequestDiscardRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.ContactRequestDiscardReply.encode({}).finish())
			}

			export const Search = (
				_: _api.berty.chat.ISearchRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.SearchReply.encode({}).finish())
			}

			export const AccountSettingsGet = (
				_: _api.berty.chat.IAccountSettingsGetRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.AccountSettingsGetReply.encode({}).finish())
			}

			export const AccountSettingsUpdate = (
				_: _api.berty.chat.IAccountSettingsUpdateRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.AccountSettingsUpdateReply.encode({}).finish())
			}

			export const AccountPairingInvitationCreate = (
				_: _api.berty.chat.IAccountPairingInvitationCreateRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.AccountPairingInvitationCreateReply.encode({}).finish())
			}

			export const AccountRenewIncomingContactRequestLink = (
				_: _api.berty.chat.IAccountRenewIncomingContactRequestLinkRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(
					null,
					_api.berty.chat.AccountRenewIncomingContactRequestLinkReply.encode({}).finish(),
				)
			}

			export const DevEventSubscribe = (
				_: _api.berty.chat.IDevEventSubscribeRequest,
				callback: pb.RPCImplCallback,
			): void => {
				callback(null, _api.berty.chat.DevEventSubscribeReply.encode({}).finish())
			}
		}
		export const ConversationGetRequest: Array<_api.berty.chat.IConversationGetRequest> = new Array(
			Math.floor(Math.random() * 100),
		)
			.fill({})
			.map((_, index) => ({
				id: index,
			}))
	}
}
export namespace google {
	export namespace api {}
	export namespace protobuf {}
}
export namespace gogoproto {}
