import * as _api from '@berty-tech/api'
import _faker from 'faker'
import * as pb from 'protobufjs'
import { deepFilterEqual, deepEqual, timestamp, randomArray, randomValue } from './helpers'

export namespace faker {
	export namespace berty {
		export namespace protocol {
			export namespace ProtocolService {
				export const rpcImpl: pb.RPCImpl = (method, requestData, callback) => {
					// map pbjs method descriptor to grpc method descriptor
					if (!(method instanceof pb.Method)) {
						console.error("bridge doesn't support protobuf.rpc.ServiceMethod")
						return
					}
					const _ = faker.berty.protocol.ProtocolService as { [key: string]: any }
					_[method.name](
						method && method.resolvedRequestType && method.resolvedRequestType.decode(requestData),
						callback,
					)
				}

				export const InstanceExportData: (
					request: _api.berty.types.InstanceExportData.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.InstanceExportData.Reply.encode({}).finish())
				}

				export const InstanceGetConfiguration: (
					request: _api.berty.types.InstanceGetConfiguration.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.InstanceGetConfiguration.Reply.encode({}).finish())
				}

				export const ContactRequestReference: (
					request: _api.berty.types.ContactRequestReference.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.ContactRequestReference.Reply.encode({}).finish())
				}

				export const ContactRequestDisable: (
					request: _api.berty.types.ContactRequestDisable.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.ContactRequestDisable.Reply.encode({}).finish())
				}

				export const ContactRequestEnable: (
					request: _api.berty.types.ContactRequestEnable.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.ContactRequestEnable.Reply.encode({}).finish())
				}

				export const ContactRequestResetReference: (
					request: _api.berty.types.ContactRequestResetReference.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.ContactRequestResetReference.Reply.encode({}).finish())
				}

				export const ContactRequestSend: (
					request: _api.berty.types.ContactRequestSend.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.ContactRequestSend.Reply.encode({}).finish())
				}

				export const ContactRequestAccept: (
					request: _api.berty.types.ContactRequestAccept.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.ContactRequestAccept.Reply.encode({}).finish())
				}

				export const ContactRequestDiscard: (
					request: _api.berty.types.ContactRequestDiscard.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.ContactRequestDiscard.Reply.encode({}).finish())
				}

				export const ContactBlock: (
					request: _api.berty.types.ContactBlock.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.ContactBlock.Reply.encode({}).finish())
				}

				export const ContactUnblock: (
					request: _api.berty.types.ContactUnblock.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.ContactUnblock.Reply.encode({}).finish())
				}

				export const ContactAliasKeySend: (
					request: _api.berty.types.ContactAliasKeySend.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.ContactAliasKeySend.Reply.encode({}).finish())
				}

				export const MultiMemberGroupCreate: (
					request: _api.berty.types.MultiMemberGroupCreate.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.MultiMemberGroupCreate.Reply.encode({}).finish())
				}

				export const MultiMemberGroupJoin: (
					request: _api.berty.types.MultiMemberGroupJoin.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.MultiMemberGroupJoin.Reply.encode({}).finish())
				}

				export const MultiMemberGroupLeave: (
					request: _api.berty.types.MultiMemberGroupLeave.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.MultiMemberGroupLeave.Reply.encode({}).finish())
				}

				export const MultiMemberGroupAliasResolverDisclose: (
					request: _api.berty.types.MultiMemberGroupAliasResolverDisclose.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.types.MultiMemberGroupAliasResolverDisclose.Reply.encode({}).finish(),
					)
				}

				export const MultiMemberGroupAdminRoleGrant: (
					request: _api.berty.types.MultiMemberGroupAdminRoleGrant.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.MultiMemberGroupAdminRoleGrant.Reply.encode({}).finish())
				}

				export const MultiMemberGroupInvitationCreate: (
					request: _api.berty.types.MultiMemberGroupInvitationCreate.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(
						null,
						_api.berty.types.MultiMemberGroupInvitationCreate.Reply.encode({}).finish(),
					)
				}

				export const AppMetadataSend: (
					request: _api.berty.types.AppMetadataSend.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.AppMetadataSend.Reply.encode({}).finish())
				}

				export const AppMessageSend: (
					request: _api.berty.types.AppMessageSend.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.AppMessageSend.Reply.encode({}).finish())
				}

				export const GroupMetadataSubscribe: (
					request: _api.berty.types.GroupMetadataSubscribe.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.GroupMetadataEvent.encode({}).finish())
				}

				export const GroupMessageSubscribe: (
					request: _api.berty.types.GroupMessageSubscribe.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.GroupMessageEvent.encode({}).finish())
				}

				export const GroupMetadataList: (
					request: _api.berty.types.GroupMetadataList.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					faker.berty.types.EventContext.filter(
						(_) =>
							(request.filter == null || deepFilterEqual(request.filter, _)) &&
							(request.not == null || !deepEqual(request.not, _)),
					).forEach((_, index) =>
						callback(
							null,
							_api.berty.types.GroupMetadataEvent.encode({
								eventContext: faker.berty.types.EventContext[index],
							}).finish(),
						),
					)
				}

				export const GroupMessageList: (
					request: _api.berty.types.GroupMessageList.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					faker.berty.types.EventContext.filter(
						(_) =>
							(request.filter == null || deepFilterEqual(request.filter, _)) &&
							(request.not == null || !deepEqual(request.not, _)),
					).forEach((_, index) =>
						callback(
							null,
							_api.berty.types.GroupMessageEvent.encode({
								eventContext: faker.berty.types.EventContext[index],
							}).finish(),
						),
					)
				}

				export const GroupInfo: (
					request: _api.berty.types.GroupInfo.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.GroupInfo.Reply.encode({}).finish())
				}

				export const ActivateGroup: (
					request: _api.berty.types.ActivateGroup.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.ActivateGroup.Reply.encode({}).finish())
				}

				export const DeactivateGroup: (
					request: _api.berty.types.DeactivateGroup.IRequest,
					callback: pb.RPCImplCallback,
				) => void = (request, callback) => {
					callback(null, _api.berty.types.DeactivateGroup.Reply.encode({}).finish())
				}
			}
		}
		export namespace types {}
	}
	export namespace gogoproto {}
	export namespace google {
		export namespace protobuf {}
	}
}
