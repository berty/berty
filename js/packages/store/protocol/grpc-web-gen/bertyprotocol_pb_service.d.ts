// package: berty.protocol.v1
// file: bertyprotocol.proto

import * as bertyprotocol_pb from "./bertyprotocol_pb";
import * as bertytypes_pb from "./bertytypes_pb";
import {grpc} from "@improbable-eng/grpc-web";

type ProtocolServiceInstanceExportData = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.InstanceExportData.Request;
  readonly responseType: typeof bertytypes_pb.InstanceExportData.Reply;
};

type ProtocolServiceInstanceGetConfiguration = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.InstanceGetConfiguration.Request;
  readonly responseType: typeof bertytypes_pb.InstanceGetConfiguration.Reply;
};

type ProtocolServiceContactRequestReference = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.ContactRequestReference.Request;
  readonly responseType: typeof bertytypes_pb.ContactRequestReference.Reply;
};

type ProtocolServiceContactRequestDisable = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.ContactRequestDisable.Request;
  readonly responseType: typeof bertytypes_pb.ContactRequestDisable.Reply;
};

type ProtocolServiceContactRequestEnable = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.ContactRequestEnable.Request;
  readonly responseType: typeof bertytypes_pb.ContactRequestEnable.Reply;
};

type ProtocolServiceContactRequestResetReference = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.ContactRequestResetReference.Request;
  readonly responseType: typeof bertytypes_pb.ContactRequestResetReference.Reply;
};

type ProtocolServiceContactRequestSend = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.ContactRequestSend.Request;
  readonly responseType: typeof bertytypes_pb.ContactRequestSend.Reply;
};

type ProtocolServiceContactRequestAccept = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.ContactRequestAccept.Request;
  readonly responseType: typeof bertytypes_pb.ContactRequestAccept.Reply;
};

type ProtocolServiceContactRequestDiscard = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.ContactRequestDiscard.Request;
  readonly responseType: typeof bertytypes_pb.ContactRequestDiscard.Reply;
};

type ProtocolServiceContactBlock = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.ContactBlock.Request;
  readonly responseType: typeof bertytypes_pb.ContactBlock.Reply;
};

type ProtocolServiceContactUnblock = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.ContactUnblock.Request;
  readonly responseType: typeof bertytypes_pb.ContactUnblock.Reply;
};

type ProtocolServiceContactAliasKeySend = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.ContactAliasKeySend.Request;
  readonly responseType: typeof bertytypes_pb.ContactAliasKeySend.Reply;
};

type ProtocolServiceMultiMemberGroupCreate = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.MultiMemberGroupCreate.Request;
  readonly responseType: typeof bertytypes_pb.MultiMemberGroupCreate.Reply;
};

type ProtocolServiceMultiMemberGroupJoin = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.MultiMemberGroupJoin.Request;
  readonly responseType: typeof bertytypes_pb.MultiMemberGroupJoin.Reply;
};

type ProtocolServiceMultiMemberGroupLeave = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.MultiMemberGroupLeave.Request;
  readonly responseType: typeof bertytypes_pb.MultiMemberGroupLeave.Reply;
};

type ProtocolServiceMultiMemberGroupAliasResolverDisclose = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.MultiMemberGroupAliasResolverDisclose.Request;
  readonly responseType: typeof bertytypes_pb.MultiMemberGroupAliasResolverDisclose.Reply;
};

type ProtocolServiceMultiMemberGroupAdminRoleGrant = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.MultiMemberGroupAdminRoleGrant.Request;
  readonly responseType: typeof bertytypes_pb.MultiMemberGroupAdminRoleGrant.Reply;
};

type ProtocolServiceMultiMemberGroupInvitationCreate = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.MultiMemberGroupInvitationCreate.Request;
  readonly responseType: typeof bertytypes_pb.MultiMemberGroupInvitationCreate.Reply;
};

type ProtocolServiceAppMetadataSend = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.AppMetadataSend.Request;
  readonly responseType: typeof bertytypes_pb.AppMetadataSend.Reply;
};

type ProtocolServiceAppMessageSend = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.AppMessageSend.Request;
  readonly responseType: typeof bertytypes_pb.AppMessageSend.Reply;
};

type ProtocolServiceGroupMetadataSubscribe = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof bertytypes_pb.GroupMetadataSubscribe.Request;
  readonly responseType: typeof bertytypes_pb.GroupMetadataEvent;
};

type ProtocolServiceGroupMessageSubscribe = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof bertytypes_pb.GroupMessageSubscribe.Request;
  readonly responseType: typeof bertytypes_pb.GroupMessageEvent;
};

type ProtocolServiceGroupMetadataList = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof bertytypes_pb.GroupMetadataList.Request;
  readonly responseType: typeof bertytypes_pb.GroupMetadataEvent;
};

type ProtocolServiceGroupMessageList = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof bertytypes_pb.GroupMessageList.Request;
  readonly responseType: typeof bertytypes_pb.GroupMessageEvent;
};

type ProtocolServiceGroupInfo = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.GroupInfo.Request;
  readonly responseType: typeof bertytypes_pb.GroupInfo.Reply;
};

type ProtocolServiceActivateGroup = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.ActivateGroup.Request;
  readonly responseType: typeof bertytypes_pb.ActivateGroup.Reply;
};

type ProtocolServiceDeactivateGroup = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.DeactivateGroup.Request;
  readonly responseType: typeof bertytypes_pb.DeactivateGroup.Reply;
};

type ProtocolServiceDebugListGroups = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof bertytypes_pb.DebugListGroups.Request;
  readonly responseType: typeof bertytypes_pb.DebugListGroups.Reply;
};

type ProtocolServiceDebugInspectGroupStore = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: true;
  readonly requestType: typeof bertytypes_pb.DebugInspectGroupStore.Request;
  readonly responseType: typeof bertytypes_pb.DebugInspectGroupStore.Reply;
};

type ProtocolServiceDebugGroup = {
  readonly methodName: string;
  readonly service: typeof ProtocolService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertytypes_pb.DebugGroup.Request;
  readonly responseType: typeof bertytypes_pb.DebugGroup.Reply;
};

export class ProtocolService {
  static readonly serviceName: string;
  static readonly InstanceExportData: ProtocolServiceInstanceExportData;
  static readonly InstanceGetConfiguration: ProtocolServiceInstanceGetConfiguration;
  static readonly ContactRequestReference: ProtocolServiceContactRequestReference;
  static readonly ContactRequestDisable: ProtocolServiceContactRequestDisable;
  static readonly ContactRequestEnable: ProtocolServiceContactRequestEnable;
  static readonly ContactRequestResetReference: ProtocolServiceContactRequestResetReference;
  static readonly ContactRequestSend: ProtocolServiceContactRequestSend;
  static readonly ContactRequestAccept: ProtocolServiceContactRequestAccept;
  static readonly ContactRequestDiscard: ProtocolServiceContactRequestDiscard;
  static readonly ContactBlock: ProtocolServiceContactBlock;
  static readonly ContactUnblock: ProtocolServiceContactUnblock;
  static readonly ContactAliasKeySend: ProtocolServiceContactAliasKeySend;
  static readonly MultiMemberGroupCreate: ProtocolServiceMultiMemberGroupCreate;
  static readonly MultiMemberGroupJoin: ProtocolServiceMultiMemberGroupJoin;
  static readonly MultiMemberGroupLeave: ProtocolServiceMultiMemberGroupLeave;
  static readonly MultiMemberGroupAliasResolverDisclose: ProtocolServiceMultiMemberGroupAliasResolverDisclose;
  static readonly MultiMemberGroupAdminRoleGrant: ProtocolServiceMultiMemberGroupAdminRoleGrant;
  static readonly MultiMemberGroupInvitationCreate: ProtocolServiceMultiMemberGroupInvitationCreate;
  static readonly AppMetadataSend: ProtocolServiceAppMetadataSend;
  static readonly AppMessageSend: ProtocolServiceAppMessageSend;
  static readonly GroupMetadataSubscribe: ProtocolServiceGroupMetadataSubscribe;
  static readonly GroupMessageSubscribe: ProtocolServiceGroupMessageSubscribe;
  static readonly GroupMetadataList: ProtocolServiceGroupMetadataList;
  static readonly GroupMessageList: ProtocolServiceGroupMessageList;
  static readonly GroupInfo: ProtocolServiceGroupInfo;
  static readonly ActivateGroup: ProtocolServiceActivateGroup;
  static readonly DeactivateGroup: ProtocolServiceDeactivateGroup;
  static readonly DebugListGroups: ProtocolServiceDebugListGroups;
  static readonly DebugInspectGroupStore: ProtocolServiceDebugInspectGroupStore;
  static readonly DebugGroup: ProtocolServiceDebugGroup;
}

export type ServiceError = { message: string, code: number; metadata: grpc.Metadata }
export type Status = { details: string, code: number; metadata: grpc.Metadata }

interface UnaryResponse {
  cancel(): void;
}
interface ResponseStream<T> {
  cancel(): void;
  on(type: 'data', handler: (message: T) => void): ResponseStream<T>;
  on(type: 'end', handler: (status?: Status) => void): ResponseStream<T>;
  on(type: 'status', handler: (status: Status) => void): ResponseStream<T>;
}
interface RequestStream<T> {
  write(message: T): RequestStream<T>;
  end(): void;
  cancel(): void;
  on(type: 'end', handler: (status?: Status) => void): RequestStream<T>;
  on(type: 'status', handler: (status: Status) => void): RequestStream<T>;
}
interface BidirectionalStream<ReqT, ResT> {
  write(message: ReqT): BidirectionalStream<ReqT, ResT>;
  end(): void;
  cancel(): void;
  on(type: 'data', handler: (message: ResT) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'end', handler: (status?: Status) => void): BidirectionalStream<ReqT, ResT>;
  on(type: 'status', handler: (status: Status) => void): BidirectionalStream<ReqT, ResT>;
}

export class ProtocolServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  instanceExportData(
    requestMessage: bertytypes_pb.InstanceExportData.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.InstanceExportData.Reply|null) => void
  ): UnaryResponse;
  instanceExportData(
    requestMessage: bertytypes_pb.InstanceExportData.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.InstanceExportData.Reply|null) => void
  ): UnaryResponse;
  instanceGetConfiguration(
    requestMessage: bertytypes_pb.InstanceGetConfiguration.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.InstanceGetConfiguration.Reply|null) => void
  ): UnaryResponse;
  instanceGetConfiguration(
    requestMessage: bertytypes_pb.InstanceGetConfiguration.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.InstanceGetConfiguration.Reply|null) => void
  ): UnaryResponse;
  contactRequestReference(
    requestMessage: bertytypes_pb.ContactRequestReference.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestReference.Reply|null) => void
  ): UnaryResponse;
  contactRequestReference(
    requestMessage: bertytypes_pb.ContactRequestReference.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestReference.Reply|null) => void
  ): UnaryResponse;
  contactRequestDisable(
    requestMessage: bertytypes_pb.ContactRequestDisable.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestDisable.Reply|null) => void
  ): UnaryResponse;
  contactRequestDisable(
    requestMessage: bertytypes_pb.ContactRequestDisable.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestDisable.Reply|null) => void
  ): UnaryResponse;
  contactRequestEnable(
    requestMessage: bertytypes_pb.ContactRequestEnable.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestEnable.Reply|null) => void
  ): UnaryResponse;
  contactRequestEnable(
    requestMessage: bertytypes_pb.ContactRequestEnable.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestEnable.Reply|null) => void
  ): UnaryResponse;
  contactRequestResetReference(
    requestMessage: bertytypes_pb.ContactRequestResetReference.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestResetReference.Reply|null) => void
  ): UnaryResponse;
  contactRequestResetReference(
    requestMessage: bertytypes_pb.ContactRequestResetReference.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestResetReference.Reply|null) => void
  ): UnaryResponse;
  contactRequestSend(
    requestMessage: bertytypes_pb.ContactRequestSend.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestSend.Reply|null) => void
  ): UnaryResponse;
  contactRequestSend(
    requestMessage: bertytypes_pb.ContactRequestSend.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestSend.Reply|null) => void
  ): UnaryResponse;
  contactRequestAccept(
    requestMessage: bertytypes_pb.ContactRequestAccept.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestAccept.Reply|null) => void
  ): UnaryResponse;
  contactRequestAccept(
    requestMessage: bertytypes_pb.ContactRequestAccept.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestAccept.Reply|null) => void
  ): UnaryResponse;
  contactRequestDiscard(
    requestMessage: bertytypes_pb.ContactRequestDiscard.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestDiscard.Reply|null) => void
  ): UnaryResponse;
  contactRequestDiscard(
    requestMessage: bertytypes_pb.ContactRequestDiscard.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactRequestDiscard.Reply|null) => void
  ): UnaryResponse;
  contactBlock(
    requestMessage: bertytypes_pb.ContactBlock.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactBlock.Reply|null) => void
  ): UnaryResponse;
  contactBlock(
    requestMessage: bertytypes_pb.ContactBlock.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactBlock.Reply|null) => void
  ): UnaryResponse;
  contactUnblock(
    requestMessage: bertytypes_pb.ContactUnblock.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactUnblock.Reply|null) => void
  ): UnaryResponse;
  contactUnblock(
    requestMessage: bertytypes_pb.ContactUnblock.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactUnblock.Reply|null) => void
  ): UnaryResponse;
  contactAliasKeySend(
    requestMessage: bertytypes_pb.ContactAliasKeySend.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactAliasKeySend.Reply|null) => void
  ): UnaryResponse;
  contactAliasKeySend(
    requestMessage: bertytypes_pb.ContactAliasKeySend.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ContactAliasKeySend.Reply|null) => void
  ): UnaryResponse;
  multiMemberGroupCreate(
    requestMessage: bertytypes_pb.MultiMemberGroupCreate.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.MultiMemberGroupCreate.Reply|null) => void
  ): UnaryResponse;
  multiMemberGroupCreate(
    requestMessage: bertytypes_pb.MultiMemberGroupCreate.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.MultiMemberGroupCreate.Reply|null) => void
  ): UnaryResponse;
  multiMemberGroupJoin(
    requestMessage: bertytypes_pb.MultiMemberGroupJoin.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.MultiMemberGroupJoin.Reply|null) => void
  ): UnaryResponse;
  multiMemberGroupJoin(
    requestMessage: bertytypes_pb.MultiMemberGroupJoin.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.MultiMemberGroupJoin.Reply|null) => void
  ): UnaryResponse;
  multiMemberGroupLeave(
    requestMessage: bertytypes_pb.MultiMemberGroupLeave.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.MultiMemberGroupLeave.Reply|null) => void
  ): UnaryResponse;
  multiMemberGroupLeave(
    requestMessage: bertytypes_pb.MultiMemberGroupLeave.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.MultiMemberGroupLeave.Reply|null) => void
  ): UnaryResponse;
  multiMemberGroupAliasResolverDisclose(
    requestMessage: bertytypes_pb.MultiMemberGroupAliasResolverDisclose.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.MultiMemberGroupAliasResolverDisclose.Reply|null) => void
  ): UnaryResponse;
  multiMemberGroupAliasResolverDisclose(
    requestMessage: bertytypes_pb.MultiMemberGroupAliasResolverDisclose.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.MultiMemberGroupAliasResolverDisclose.Reply|null) => void
  ): UnaryResponse;
  multiMemberGroupAdminRoleGrant(
    requestMessage: bertytypes_pb.MultiMemberGroupAdminRoleGrant.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.MultiMemberGroupAdminRoleGrant.Reply|null) => void
  ): UnaryResponse;
  multiMemberGroupAdminRoleGrant(
    requestMessage: bertytypes_pb.MultiMemberGroupAdminRoleGrant.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.MultiMemberGroupAdminRoleGrant.Reply|null) => void
  ): UnaryResponse;
  multiMemberGroupInvitationCreate(
    requestMessage: bertytypes_pb.MultiMemberGroupInvitationCreate.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.MultiMemberGroupInvitationCreate.Reply|null) => void
  ): UnaryResponse;
  multiMemberGroupInvitationCreate(
    requestMessage: bertytypes_pb.MultiMemberGroupInvitationCreate.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.MultiMemberGroupInvitationCreate.Reply|null) => void
  ): UnaryResponse;
  appMetadataSend(
    requestMessage: bertytypes_pb.AppMetadataSend.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.AppMetadataSend.Reply|null) => void
  ): UnaryResponse;
  appMetadataSend(
    requestMessage: bertytypes_pb.AppMetadataSend.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.AppMetadataSend.Reply|null) => void
  ): UnaryResponse;
  appMessageSend(
    requestMessage: bertytypes_pb.AppMessageSend.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.AppMessageSend.Reply|null) => void
  ): UnaryResponse;
  appMessageSend(
    requestMessage: bertytypes_pb.AppMessageSend.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.AppMessageSend.Reply|null) => void
  ): UnaryResponse;
  groupMetadataSubscribe(requestMessage: bertytypes_pb.GroupMetadataSubscribe.Request, metadata?: grpc.Metadata): ResponseStream<bertytypes_pb.GroupMetadataEvent>;
  groupMessageSubscribe(requestMessage: bertytypes_pb.GroupMessageSubscribe.Request, metadata?: grpc.Metadata): ResponseStream<bertytypes_pb.GroupMessageEvent>;
  groupMetadataList(requestMessage: bertytypes_pb.GroupMetadataList.Request, metadata?: grpc.Metadata): ResponseStream<bertytypes_pb.GroupMetadataEvent>;
  groupMessageList(requestMessage: bertytypes_pb.GroupMessageList.Request, metadata?: grpc.Metadata): ResponseStream<bertytypes_pb.GroupMessageEvent>;
  groupInfo(
    requestMessage: bertytypes_pb.GroupInfo.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.GroupInfo.Reply|null) => void
  ): UnaryResponse;
  groupInfo(
    requestMessage: bertytypes_pb.GroupInfo.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.GroupInfo.Reply|null) => void
  ): UnaryResponse;
  activateGroup(
    requestMessage: bertytypes_pb.ActivateGroup.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ActivateGroup.Reply|null) => void
  ): UnaryResponse;
  activateGroup(
    requestMessage: bertytypes_pb.ActivateGroup.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.ActivateGroup.Reply|null) => void
  ): UnaryResponse;
  deactivateGroup(
    requestMessage: bertytypes_pb.DeactivateGroup.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.DeactivateGroup.Reply|null) => void
  ): UnaryResponse;
  deactivateGroup(
    requestMessage: bertytypes_pb.DeactivateGroup.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.DeactivateGroup.Reply|null) => void
  ): UnaryResponse;
  debugListGroups(requestMessage: bertytypes_pb.DebugListGroups.Request, metadata?: grpc.Metadata): ResponseStream<bertytypes_pb.DebugListGroups.Reply>;
  debugInspectGroupStore(requestMessage: bertytypes_pb.DebugInspectGroupStore.Request, metadata?: grpc.Metadata): ResponseStream<bertytypes_pb.DebugInspectGroupStore.Reply>;
  debugGroup(
    requestMessage: bertytypes_pb.DebugGroup.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.DebugGroup.Reply|null) => void
  ): UnaryResponse;
  debugGroup(
    requestMessage: bertytypes_pb.DebugGroup.Request,
    callback: (error: ServiceError|null, responseMessage: bertytypes_pb.DebugGroup.Reply|null) => void
  ): UnaryResponse;
}

