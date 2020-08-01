import * as _api from '@berty-tech/api'
import _faker from 'faker'
import * as pb from 'protobufjs'
import { deepFilterEqual, deepEqual, timestamp, randomArray, randomValue } from './helpers'

export namespace faker {
	export namespace berty {
		export namespace protocol {
			export namespace v1 {
				export namespace ProtocolService {
					export const rpcImpl: pb.RPCImpl = (method, requestData, callback) => {
						// map pbjs method descriptor to grpc method descriptor
						if (!(method instanceof pb.Method)) {
							console.error("bridge doesn't support protobuf.rpc.ServiceMethod")
							return
						}
						const _ = faker.berty.protocol.v1.ProtocolService as { [key: string]: any }
						_[method.name](
							method &&
								method.resolvedRequestType &&
								method.resolvedRequestType.decode(requestData),
							callback,
						)
					}

					export const InstanceExportData: (
						request: _api.berty.types.v1.InstanceExportData.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.InstanceExportData.Reply.encode({}).finish())
					}

					export const InstanceGetConfiguration: (
						request: _api.berty.types.v1.InstanceGetConfiguration.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.InstanceGetConfiguration.Reply.encode({}).finish())
					}

					export const ContactRequestReference: (
						request: _api.berty.types.v1.ContactRequestReference.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.ContactRequestReference.Reply.encode({}).finish())
					}

					export const ContactRequestDisable: (
						request: _api.berty.types.v1.ContactRequestDisable.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.ContactRequestDisable.Reply.encode({}).finish())
					}

					export const ContactRequestEnable: (
						request: _api.berty.types.v1.ContactRequestEnable.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.ContactRequestEnable.Reply.encode({}).finish())
					}

					export const ContactRequestResetReference: (
						request: _api.berty.types.v1.ContactRequestResetReference.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(
							null,
							_api.berty.types.v1.ContactRequestResetReference.Reply.encode({}).finish(),
						)
					}

					export const ContactRequestSend: (
						request: _api.berty.types.v1.ContactRequestSend.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.ContactRequestSend.Reply.encode({}).finish())
					}

					export const ContactRequestAccept: (
						request: _api.berty.types.v1.ContactRequestAccept.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.ContactRequestAccept.Reply.encode({}).finish())
					}

					export const ContactRequestDiscard: (
						request: _api.berty.types.v1.ContactRequestDiscard.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.ContactRequestDiscard.Reply.encode({}).finish())
					}

					export const ContactBlock: (
						request: _api.berty.types.v1.ContactBlock.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.ContactBlock.Reply.encode({}).finish())
					}

					export const ContactUnblock: (
						request: _api.berty.types.v1.ContactUnblock.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.ContactUnblock.Reply.encode({}).finish())
					}

					export const ContactAliasKeySend: (
						request: _api.berty.types.v1.ContactAliasKeySend.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.ContactAliasKeySend.Reply.encode({}).finish())
					}

					export const MultiMemberGroupCreate: (
						request: _api.berty.types.v1.MultiMemberGroupCreate.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.MultiMemberGroupCreate.Reply.encode({}).finish())
					}

					export const MultiMemberGroupJoin: (
						request: _api.berty.types.v1.MultiMemberGroupJoin.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.MultiMemberGroupJoin.Reply.encode({}).finish())
					}

					export const MultiMemberGroupLeave: (
						request: _api.berty.types.v1.MultiMemberGroupLeave.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.MultiMemberGroupLeave.Reply.encode({}).finish())
					}

					export const MultiMemberGroupAliasResolverDisclose: (
						request: _api.berty.types.v1.MultiMemberGroupAliasResolverDisclose.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(
							null,
							_api.berty.types.v1.MultiMemberGroupAliasResolverDisclose.Reply.encode({}).finish(),
						)
					}

					export const MultiMemberGroupAdminRoleGrant: (
						request: _api.berty.types.v1.MultiMemberGroupAdminRoleGrant.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(
							null,
							_api.berty.types.v1.MultiMemberGroupAdminRoleGrant.Reply.encode({}).finish(),
						)
					}

					export const MultiMemberGroupInvitationCreate: (
						request: _api.berty.types.v1.MultiMemberGroupInvitationCreate.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(
							null,
							_api.berty.types.v1.MultiMemberGroupInvitationCreate.Reply.encode({}).finish(),
						)
					}

					export const AppMetadataSend: (
						request: _api.berty.types.v1.AppMetadataSend.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.AppMetadataSend.Reply.encode({}).finish())
					}

					export const AppMessageSend: (
						request: _api.berty.types.v1.AppMessageSend.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.AppMessageSend.Reply.encode({}).finish())
					}

					export const GroupMetadataSubscribe: (
						request: _api.berty.types.v1.GroupMetadataSubscribe.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.GroupMetadataEvent.encode({}).finish())
					}

					export const GroupMessageSubscribe: (
						request: _api.berty.types.v1.GroupMessageSubscribe.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.GroupMessageEvent.encode({}).finish())
					}

					export const GroupMetadataList: (
						request: _api.berty.types.v1.GroupMetadataList.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						faker.berty.types.v1.EventContext.filter(
							(_) =>
								(request.filter == null || deepFilterEqual(request.filter, _)) &&
								(request.not == null || !deepEqual(request.not, _)),
						).forEach((_, index) =>
							callback(
								null,
								_api.berty.types.v1.GroupMetadataEvent.encode({
									eventContext: faker.berty.types.v1.EventContext[index],
								}).finish(),
							),
						)
					}

					export const GroupMessageList: (
						request: _api.berty.types.v1.GroupMessageList.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						faker.berty.types.v1.EventContext.filter(
							(_) =>
								(request.filter == null || deepFilterEqual(request.filter, _)) &&
								(request.not == null || !deepEqual(request.not, _)),
						).forEach((_, index) =>
							callback(
								null,
								_api.berty.types.v1.GroupMessageEvent.encode({
									eventContext: faker.berty.types.v1.EventContext[index],
								}).finish(),
							),
						)
					}

					export const GroupInfo: (
						request: _api.berty.types.v1.GroupInfo.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.GroupInfo.Reply.encode({}).finish())
					}

					export const ActivateGroup: (
						request: _api.berty.types.v1.ActivateGroup.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.ActivateGroup.Reply.encode({}).finish())
					}

					export const DeactivateGroup: (
						request: _api.berty.types.v1.DeactivateGroup.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.DeactivateGroup.Reply.encode({}).finish())
					}

					export const DebugListGroups: (
						request: _api.berty.types.v1.DebugListGroups.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.DebugListGroups.Reply.encode({}).finish())
					}

					export const DebugInspectGroupStore: (
						request: _api.berty.types.v1.DebugInspectGroupStore.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.DebugInspectGroupStore.Reply.encode({}).finish())
					}

					export const DebugGroup: (
						request: _api.berty.types.v1.DebugGroup.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.types.v1.DebugGroup.Reply.encode({}).finish())
					}
				}
			}
		}
		export namespace types {
			export namespace v1 {}
		}
		export namespace messenger {
			export namespace v1 {
				export namespace MessengerService {
					export const rpcImpl: pb.RPCImpl = (method, requestData, callback) => {
						// map pbjs method descriptor to grpc method descriptor
						if (!(method instanceof pb.Method)) {
							console.error("bridge doesn't support protobuf.rpc.ServiceMethod")
							return
						}
						const _ = faker.berty.messenger.v1.MessengerService as { [key: string]: any }
						_[method.name](
							method &&
								method.resolvedRequestType &&
								method.resolvedRequestType.decode(requestData),
							callback,
						)
					}

					export const InstanceShareableBertyID: (
						request: _api.berty.messenger.v1.InstanceShareableBertyID.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(
							null,
							_api.berty.messenger.v1.InstanceShareableBertyID.Reply.encode({}).finish(),
						)
					}

					export const ShareableBertyGroup: (
						request: _api.berty.messenger.v1.ShareableBertyGroup.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.messenger.v1.ShareableBertyGroup.Reply.encode({}).finish())
					}

					export const DevShareInstanceBertyID: (
						request: _api.berty.messenger.v1.DevShareInstanceBertyID.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(
							null,
							_api.berty.messenger.v1.DevShareInstanceBertyID.Reply.encode({}).finish(),
						)
					}

					export const ParseDeepLink: (
						request: _api.berty.messenger.v1.ParseDeepLink.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.messenger.v1.ParseDeepLink.Reply.encode({}).finish())
					}

					export const SendContactRequest: (
						request: _api.berty.messenger.v1.SendContactRequest.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.messenger.v1.SendContactRequest.Reply.encode({}).finish())
					}

					export const SendMessage: (
						request: _api.berty.messenger.v1.SendMessage.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.messenger.v1.SendMessage.Reply.encode({}).finish())
					}

					export const SendAck: (
						request: _api.berty.messenger.v1.SendAck.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.messenger.v1.SendAck.Reply.encode({}).finish())
					}

					export const SystemInfo: (
						request: _api.berty.messenger.v1.SystemInfo.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.messenger.v1.SystemInfo.Reply.encode({}).finish())
					}

					export const EchoTest: (
						request: _api.berty.messenger.v1.EchoTest.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.messenger.v1.EchoTest.Reply.encode({}).finish())
					}

					export const ConversationStream: (
						request: _api.berty.messenger.v1.ConversationStream.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.messenger.v1.ConversationStream.Reply.encode({}).finish())
					}

					export const EventStream: (
						request: _api.berty.messenger.v1.EventStream.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.messenger.v1.EventStream.Reply.encode({}).finish())
					}

					export const ConversationCreate: (
						request: _api.berty.messenger.v1.ConversationCreate.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {
						callback(null, _api.berty.messenger.v1.ConversationCreate.Reply.encode({}).finish())
					}

					export const AccountGet: (
						request: _api.berty.messenger.v1.AccountGet.IRequest,
						callback: pb.RPCImplCallback,
					) => void = (request, callback) => {}
				}
			}
		}
	}
	export namespace gogoproto {}
	export namespace google {
		export namespace protobuf {}
	}
}
