// package: berty.messenger
// file: bertymessenger.proto

import * as bertymessenger_pb from "./bertymessenger_pb";
import {grpc} from "@improbable-eng/grpc-web";

type MessengerServiceInstanceShareableBertyID = {
  readonly methodName: string;
  readonly service: typeof MessengerService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertymessenger_pb.InstanceShareableBertyID.Request;
  readonly responseType: typeof bertymessenger_pb.InstanceShareableBertyID.Reply;
};

type MessengerServiceShareableBertyGroup = {
  readonly methodName: string;
  readonly service: typeof MessengerService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertymessenger_pb.ShareableBertyGroup.Request;
  readonly responseType: typeof bertymessenger_pb.ShareableBertyGroup.Reply;
};

type MessengerServiceDevShareInstanceBertyID = {
  readonly methodName: string;
  readonly service: typeof MessengerService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertymessenger_pb.DevShareInstanceBertyID.Request;
  readonly responseType: typeof bertymessenger_pb.DevShareInstanceBertyID.Reply;
};

type MessengerServiceParseDeepLink = {
  readonly methodName: string;
  readonly service: typeof MessengerService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertymessenger_pb.ParseDeepLink.Request;
  readonly responseType: typeof bertymessenger_pb.ParseDeepLink.Reply;
};

type MessengerServiceSendContactRequest = {
  readonly methodName: string;
  readonly service: typeof MessengerService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertymessenger_pb.SendContactRequest.Request;
  readonly responseType: typeof bertymessenger_pb.SendContactRequest.Reply;
};

type MessengerServiceSendMessage = {
  readonly methodName: string;
  readonly service: typeof MessengerService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertymessenger_pb.SendMessage.Request;
  readonly responseType: typeof bertymessenger_pb.SendMessage.Reply;
};

type MessengerServiceSendAck = {
  readonly methodName: string;
  readonly service: typeof MessengerService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertymessenger_pb.SendAck.Request;
  readonly responseType: typeof bertymessenger_pb.SendAck.Reply;
};

type MessengerServiceSystemInfo = {
  readonly methodName: string;
  readonly service: typeof MessengerService;
  readonly requestStream: false;
  readonly responseStream: false;
  readonly requestType: typeof bertymessenger_pb.SystemInfo.Request;
  readonly responseType: typeof bertymessenger_pb.SystemInfo.Reply;
};

export class MessengerService {
  static readonly serviceName: string;
  static readonly InstanceShareableBertyID: MessengerServiceInstanceShareableBertyID;
  static readonly ShareableBertyGroup: MessengerServiceShareableBertyGroup;
  static readonly DevShareInstanceBertyID: MessengerServiceDevShareInstanceBertyID;
  static readonly ParseDeepLink: MessengerServiceParseDeepLink;
  static readonly SendContactRequest: MessengerServiceSendContactRequest;
  static readonly SendMessage: MessengerServiceSendMessage;
  static readonly SendAck: MessengerServiceSendAck;
  static readonly SystemInfo: MessengerServiceSystemInfo;
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

export class MessengerServiceClient {
  readonly serviceHost: string;

  constructor(serviceHost: string, options?: grpc.RpcOptions);
  instanceShareableBertyID(
    requestMessage: bertymessenger_pb.InstanceShareableBertyID.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.InstanceShareableBertyID.Reply|null) => void
  ): UnaryResponse;
  instanceShareableBertyID(
    requestMessage: bertymessenger_pb.InstanceShareableBertyID.Request,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.InstanceShareableBertyID.Reply|null) => void
  ): UnaryResponse;
  shareableBertyGroup(
    requestMessage: bertymessenger_pb.ShareableBertyGroup.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.ShareableBertyGroup.Reply|null) => void
  ): UnaryResponse;
  shareableBertyGroup(
    requestMessage: bertymessenger_pb.ShareableBertyGroup.Request,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.ShareableBertyGroup.Reply|null) => void
  ): UnaryResponse;
  devShareInstanceBertyID(
    requestMessage: bertymessenger_pb.DevShareInstanceBertyID.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.DevShareInstanceBertyID.Reply|null) => void
  ): UnaryResponse;
  devShareInstanceBertyID(
    requestMessage: bertymessenger_pb.DevShareInstanceBertyID.Request,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.DevShareInstanceBertyID.Reply|null) => void
  ): UnaryResponse;
  parseDeepLink(
    requestMessage: bertymessenger_pb.ParseDeepLink.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.ParseDeepLink.Reply|null) => void
  ): UnaryResponse;
  parseDeepLink(
    requestMessage: bertymessenger_pb.ParseDeepLink.Request,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.ParseDeepLink.Reply|null) => void
  ): UnaryResponse;
  sendContactRequest(
    requestMessage: bertymessenger_pb.SendContactRequest.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.SendContactRequest.Reply|null) => void
  ): UnaryResponse;
  sendContactRequest(
    requestMessage: bertymessenger_pb.SendContactRequest.Request,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.SendContactRequest.Reply|null) => void
  ): UnaryResponse;
  sendMessage(
    requestMessage: bertymessenger_pb.SendMessage.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.SendMessage.Reply|null) => void
  ): UnaryResponse;
  sendMessage(
    requestMessage: bertymessenger_pb.SendMessage.Request,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.SendMessage.Reply|null) => void
  ): UnaryResponse;
  sendAck(
    requestMessage: bertymessenger_pb.SendAck.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.SendAck.Reply|null) => void
  ): UnaryResponse;
  sendAck(
    requestMessage: bertymessenger_pb.SendAck.Request,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.SendAck.Reply|null) => void
  ): UnaryResponse;
  systemInfo(
    requestMessage: bertymessenger_pb.SystemInfo.Request,
    metadata: grpc.Metadata,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.SystemInfo.Reply|null) => void
  ): UnaryResponse;
  systemInfo(
    requestMessage: bertymessenger_pb.SystemInfo.Request,
    callback: (error: ServiceError|null, responseMessage: bertymessenger_pb.SystemInfo.Reply|null) => void
  ): UnaryResponse;
}

