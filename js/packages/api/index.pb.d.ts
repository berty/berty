import * as $protobuf from "protobufjs";
export namespace berty {

    namespace bridge {

        namespace v1 {

            class BridgeService extends $protobuf.rpc.Service {

                public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): BridgeService;
                public clientInvokeUnary(request: berty.bridge.v1.ClientInvokeUnary.IRequest, callback: berty.bridge.v1.BridgeService.ClientInvokeUnaryCallback): void;
                public clientInvokeUnary(request: berty.bridge.v1.ClientInvokeUnary.IRequest): Promise<berty.bridge.v1.ClientInvokeUnary.Reply>;
                public createClientStream(request: berty.bridge.v1.ClientCreateStream.IRequest, callback: berty.bridge.v1.BridgeService.CreateClientStreamCallback): void;
                public createClientStream(request: berty.bridge.v1.ClientCreateStream.IRequest): Promise<berty.bridge.v1.ClientCreateStream.Reply>;
                public clientStreamSend(request: berty.bridge.v1.ClientStreamSend.IRequest, callback: berty.bridge.v1.BridgeService.ClientStreamSendCallback): void;
                public clientStreamSend(request: berty.bridge.v1.ClientStreamSend.IRequest): Promise<berty.bridge.v1.ClientStreamSend.Reply>;
                public clientStreamRecv(request: berty.bridge.v1.ClientStreamRecv.IRequest, callback: berty.bridge.v1.BridgeService.ClientStreamRecvCallback): void;
                public clientStreamRecv(request: berty.bridge.v1.ClientStreamRecv.IRequest): Promise<berty.bridge.v1.ClientStreamRecv.Reply>;
                public clientStreamClose(request: berty.bridge.v1.ClientStreamClose.IRequest, callback: berty.bridge.v1.BridgeService.ClientStreamCloseCallback): void;
                public clientStreamClose(request: berty.bridge.v1.ClientStreamClose.IRequest): Promise<berty.bridge.v1.ClientStreamClose.Reply>;
            }

            namespace BridgeService {

                type ClientInvokeUnaryCallback = (error: (Error|null), response?: berty.bridge.v1.ClientInvokeUnary.Reply) => void;

                type CreateClientStreamCallback = (error: (Error|null), response?: berty.bridge.v1.ClientCreateStream.Reply) => void;

                type ClientStreamSendCallback = (error: (Error|null), response?: berty.bridge.v1.ClientStreamSend.Reply) => void;

                type ClientStreamRecvCallback = (error: (Error|null), response?: berty.bridge.v1.ClientStreamRecv.Reply) => void;

                type ClientStreamCloseCallback = (error: (Error|null), response?: berty.bridge.v1.ClientStreamClose.Reply) => void;
            }

            interface IClientInvokeUnary {
            }

            class ClientInvokeUnary implements IClientInvokeUnary {

                public static create(properties?: berty.bridge.v1.IClientInvokeUnary): berty.bridge.v1.ClientInvokeUnary;
                public static encode(message: berty.bridge.v1.IClientInvokeUnary, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.bridge.v1.IClientInvokeUnary, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientInvokeUnary;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientInvokeUnary;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientInvokeUnary;
                public static toObject(message: berty.bridge.v1.ClientInvokeUnary, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ClientInvokeUnary {

                interface IRequest {
                    methodDesc?: (berty.bridge.v1.IMethodDesc|null);
                    payload?: (Uint8Array|null);
                    header?: (berty.bridge.v1.IMetadata[]|null);
                }

                class Request implements IRequest {

                    public methodDesc?: (berty.bridge.v1.IMethodDesc|null);
                    public payload: Uint8Array;
                    public header: berty.bridge.v1.IMetadata[];
                    public static create(properties?: berty.bridge.v1.ClientInvokeUnary.IRequest): berty.bridge.v1.ClientInvokeUnary.Request;
                    public static encode(message: berty.bridge.v1.ClientInvokeUnary.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.bridge.v1.ClientInvokeUnary.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientInvokeUnary.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientInvokeUnary.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientInvokeUnary.Request;
                    public static toObject(message: berty.bridge.v1.ClientInvokeUnary.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    payload?: (Uint8Array|null);
                    trailer?: (berty.bridge.v1.IMetadata[]|null);
                    error?: (berty.bridge.v1.IError|null);
                }

                class Reply implements IReply {

                    public payload: Uint8Array;
                    public trailer: berty.bridge.v1.IMetadata[];
                    public error?: (berty.bridge.v1.IError|null);
                    public static create(properties?: berty.bridge.v1.ClientInvokeUnary.IReply): berty.bridge.v1.ClientInvokeUnary.Reply;
                    public static encode(message: berty.bridge.v1.ClientInvokeUnary.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.bridge.v1.ClientInvokeUnary.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientInvokeUnary.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientInvokeUnary.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientInvokeUnary.Reply;
                    public static toObject(message: berty.bridge.v1.ClientInvokeUnary.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IClientCreateStream {
            }

            class ClientCreateStream implements IClientCreateStream {

                public static create(properties?: berty.bridge.v1.IClientCreateStream): berty.bridge.v1.ClientCreateStream;
                public static encode(message: berty.bridge.v1.IClientCreateStream, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.bridge.v1.IClientCreateStream, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientCreateStream;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientCreateStream;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientCreateStream;
                public static toObject(message: berty.bridge.v1.ClientCreateStream, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ClientCreateStream {

                interface IRequest {
                    methodDesc?: (berty.bridge.v1.IMethodDesc|null);
                    payload?: (Uint8Array|null);
                    header?: (berty.bridge.v1.IMetadata[]|null);
                }

                class Request implements IRequest {

                    public methodDesc?: (berty.bridge.v1.IMethodDesc|null);
                    public payload: Uint8Array;
                    public header: berty.bridge.v1.IMetadata[];
                    public static create(properties?: berty.bridge.v1.ClientCreateStream.IRequest): berty.bridge.v1.ClientCreateStream.Request;
                    public static encode(message: berty.bridge.v1.ClientCreateStream.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.bridge.v1.ClientCreateStream.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientCreateStream.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientCreateStream.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientCreateStream.Request;
                    public static toObject(message: berty.bridge.v1.ClientCreateStream.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    streamId?: (string|null);
                    trailer?: (berty.bridge.v1.IMetadata[]|null);
                    error?: (berty.bridge.v1.IError|null);
                }

                class Reply implements IReply {

                    public streamId: string;
                    public trailer: berty.bridge.v1.IMetadata[];
                    public error?: (berty.bridge.v1.IError|null);
                    public static create(properties?: berty.bridge.v1.ClientCreateStream.IReply): berty.bridge.v1.ClientCreateStream.Reply;
                    public static encode(message: berty.bridge.v1.ClientCreateStream.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.bridge.v1.ClientCreateStream.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientCreateStream.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientCreateStream.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientCreateStream.Reply;
                    public static toObject(message: berty.bridge.v1.ClientCreateStream.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IClientStreamSend {
            }

            class ClientStreamSend implements IClientStreamSend {

                public static create(properties?: berty.bridge.v1.IClientStreamSend): berty.bridge.v1.ClientStreamSend;
                public static encode(message: berty.bridge.v1.IClientStreamSend, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.bridge.v1.IClientStreamSend, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientStreamSend;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientStreamSend;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientStreamSend;
                public static toObject(message: berty.bridge.v1.ClientStreamSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ClientStreamSend {

                interface IRequest {
                    streamId?: (string|null);
                    payload?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public streamId: string;
                    public payload: Uint8Array;
                    public static create(properties?: berty.bridge.v1.ClientStreamSend.IRequest): berty.bridge.v1.ClientStreamSend.Request;
                    public static encode(message: berty.bridge.v1.ClientStreamSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.bridge.v1.ClientStreamSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientStreamSend.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientStreamSend.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientStreamSend.Request;
                    public static toObject(message: berty.bridge.v1.ClientStreamSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    streamId?: (string|null);
                    trailer?: (berty.bridge.v1.IMetadata[]|null);
                    error?: (berty.bridge.v1.IError|null);
                }

                class Reply implements IReply {

                    public streamId: string;
                    public trailer: berty.bridge.v1.IMetadata[];
                    public error?: (berty.bridge.v1.IError|null);
                    public static create(properties?: berty.bridge.v1.ClientStreamSend.IReply): berty.bridge.v1.ClientStreamSend.Reply;
                    public static encode(message: berty.bridge.v1.ClientStreamSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.bridge.v1.ClientStreamSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientStreamSend.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientStreamSend.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientStreamSend.Reply;
                    public static toObject(message: berty.bridge.v1.ClientStreamSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IClientStreamRecv {
            }

            class ClientStreamRecv implements IClientStreamRecv {

                public static create(properties?: berty.bridge.v1.IClientStreamRecv): berty.bridge.v1.ClientStreamRecv;
                public static encode(message: berty.bridge.v1.IClientStreamRecv, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.bridge.v1.IClientStreamRecv, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientStreamRecv;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientStreamRecv;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientStreamRecv;
                public static toObject(message: berty.bridge.v1.ClientStreamRecv, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ClientStreamRecv {

                interface IRequest {
                    streamId?: (string|null);
                }

                class Request implements IRequest {

                    public streamId: string;
                    public static create(properties?: berty.bridge.v1.ClientStreamRecv.IRequest): berty.bridge.v1.ClientStreamRecv.Request;
                    public static encode(message: berty.bridge.v1.ClientStreamRecv.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.bridge.v1.ClientStreamRecv.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientStreamRecv.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientStreamRecv.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientStreamRecv.Request;
                    public static toObject(message: berty.bridge.v1.ClientStreamRecv.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    streamId?: (string|null);
                    payload?: (Uint8Array|null);
                    trailer?: (berty.bridge.v1.IMetadata[]|null);
                    error?: (berty.bridge.v1.IError|null);
                }

                class Reply implements IReply {

                    public streamId: string;
                    public payload: Uint8Array;
                    public trailer: berty.bridge.v1.IMetadata[];
                    public error?: (berty.bridge.v1.IError|null);
                    public static create(properties?: berty.bridge.v1.ClientStreamRecv.IReply): berty.bridge.v1.ClientStreamRecv.Reply;
                    public static encode(message: berty.bridge.v1.ClientStreamRecv.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.bridge.v1.ClientStreamRecv.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientStreamRecv.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientStreamRecv.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientStreamRecv.Reply;
                    public static toObject(message: berty.bridge.v1.ClientStreamRecv.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IClientStreamClose {
            }

            class ClientStreamClose implements IClientStreamClose {

                public static create(properties?: berty.bridge.v1.IClientStreamClose): berty.bridge.v1.ClientStreamClose;
                public static encode(message: berty.bridge.v1.IClientStreamClose, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.bridge.v1.IClientStreamClose, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientStreamClose;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientStreamClose;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientStreamClose;
                public static toObject(message: berty.bridge.v1.ClientStreamClose, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ClientStreamClose {

                interface IRequest {
                    streamId?: (string|null);
                }

                class Request implements IRequest {

                    public streamId: string;
                    public static create(properties?: berty.bridge.v1.ClientStreamClose.IRequest): berty.bridge.v1.ClientStreamClose.Request;
                    public static encode(message: berty.bridge.v1.ClientStreamClose.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.bridge.v1.ClientStreamClose.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientStreamClose.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientStreamClose.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientStreamClose.Request;
                    public static toObject(message: berty.bridge.v1.ClientStreamClose.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    streamId?: (string|null);
                    trailer?: (berty.bridge.v1.IMetadata[]|null);
                    error?: (berty.bridge.v1.IError|null);
                }

                class Reply implements IReply {

                    public streamId: string;
                    public trailer: berty.bridge.v1.IMetadata[];
                    public error?: (berty.bridge.v1.IError|null);
                    public static create(properties?: berty.bridge.v1.ClientStreamClose.IReply): berty.bridge.v1.ClientStreamClose.Reply;
                    public static encode(message: berty.bridge.v1.ClientStreamClose.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.bridge.v1.ClientStreamClose.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.ClientStreamClose.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.ClientStreamClose.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.bridge.v1.ClientStreamClose.Reply;
                    public static toObject(message: berty.bridge.v1.ClientStreamClose.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IMethodDesc {
                name?: (string|null);
                isClientStream?: (boolean|null);
                isServerStream?: (boolean|null);
            }

            class MethodDesc implements IMethodDesc {

                public name: string;
                public isClientStream: boolean;
                public isServerStream: boolean;
                public static create(properties?: berty.bridge.v1.IMethodDesc): berty.bridge.v1.MethodDesc;
                public static encode(message: berty.bridge.v1.IMethodDesc, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.bridge.v1.IMethodDesc, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.MethodDesc;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.MethodDesc;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.bridge.v1.MethodDesc;
                public static toObject(message: berty.bridge.v1.MethodDesc, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IMetadata {
                key?: (string|null);
                values?: (string[]|null);
            }

            class Metadata implements IMetadata {

                public key: string;
                public values: string[];
                public static create(properties?: berty.bridge.v1.IMetadata): berty.bridge.v1.Metadata;
                public static encode(message: berty.bridge.v1.IMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.bridge.v1.IMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.Metadata;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.Metadata;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.bridge.v1.Metadata;
                public static toObject(message: berty.bridge.v1.Metadata, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IError {
                grpcErrorCode?: (berty.bridge.v1.GRPCErrCode|null);
                errorCode?: (berty.errcode.ErrCode|null);
                message?: (string|null);
            }

            class Error implements IError {

                public grpcErrorCode: berty.bridge.v1.GRPCErrCode;
                public errorCode: berty.errcode.ErrCode;
                public message: string;
                public static create(properties?: berty.bridge.v1.IError): berty.bridge.v1.Error;
                public static encode(message: berty.bridge.v1.IError, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.bridge.v1.IError, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.bridge.v1.Error;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.bridge.v1.Error;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.bridge.v1.Error;
                public static toObject(message: berty.bridge.v1.Error, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            enum GRPCErrCode {
                OK = 0,
                CANCELED = 1,
                UNKNOWN = 2,
                INVALID_ARGUMENT = 3,
                DEADLINE_EXCEEDED = 4,
                NOT_FOUND = 5,
                ALREADY_EXISTS = 6,
                PERMISSION_DENIED = 7,
                RESOURCE_EXHAUSTED = 8,
                FAILED_PRECONDITION = 9,
                ABORTED = 10,
                OUT_OF_RANGE = 11,
                UNIMPLEMENTED = 12,
                INTERNAL = 13,
                UNAVAILABLE = 14,
                DATA_LOSS = 15,
                UNAUTHENTICATED = 16
            }
        }
    }

    namespace errcode {

        enum ErrCode {
            Undefined = 0,
            TODO = 666,
            ErrNotImplemented = 777,
            ErrInternal = 888,
            ErrInvalidInput = 100,
            ErrMissingInput = 101,
            ErrSerialization = 102,
            ErrDeserialization = 103,
            ErrStreamRead = 104,
            ErrStreamWrite = 105,
            ErrMissingMapKey = 106,
            ErrCryptoRandomGeneration = 200,
            ErrCryptoKeyGeneration = 201,
            ErrCryptoNonceGeneration = 202,
            ErrCryptoSignature = 203,
            ErrCryptoSignatureVerification = 204,
            ErrCryptoDecrypt = 205,
            ErrCryptoEncrypt = 206,
            ErrCryptoKeyConversion = 207,
            ErrOrbitDBInit = 1000,
            ErrOrbitDBOpen = 1001,
            ErrOrbitDBAppend = 1002,
            ErrOrbitDBDeserialization = 1003,
            ErrOrbitDBStoreCast = 1004,
            ErrHandshakeOwnEphemeralKeyGenSend = 1100,
            ErrHandshakePeerEphemeralKeyRecv = 1101,
            ErrHandshakeRequesterAuthenticateBoxKeyGen = 1102,
            ErrHandshakeResponderAcceptBoxKeyGen = 1103,
            ErrHandshakeRequesterHello = 1104,
            ErrHandshakeResponderHello = 1105,
            ErrHandshakeRequesterAuthenticate = 1106,
            ErrHandshakeResponderAccept = 1107,
            ErrHandshakeRequesterAcknowledge = 1108,
            ErrGroupMemberLogEventOpen = 1200,
            ErrGroupMemberLogEventSignature = 1201,
            ErrGroupMemberUnknownGroupID = 1202,
            ErrGroupSecretOtherDestMember = 1203,
            ErrGroupSecretAlreadySentToMember = 1204,
            ErrGroupInvalidType = 1205,
            ErrGroupMissing = 1206,
            ErrMessageKeyPersistencePut = 1300,
            ErrMessageKeyPersistenceGet = 1301,
            ErrBridgeInterrupted = 1400,
            ErrBridgeNotRunning = 1401,
            ErrMessengerInvalidDeepLink = 2001,
            ErrCLINoTermcaps = 3001
        }

        interface IErrDetails {
            codes?: (berty.errcode.ErrCode[]|null);
        }

        class ErrDetails implements IErrDetails {

            public codes: berty.errcode.ErrCode[];
            public static create(properties?: berty.errcode.IErrDetails): berty.errcode.ErrDetails;
            public static encode(message: berty.errcode.IErrDetails, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: berty.errcode.IErrDetails, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.errcode.ErrDetails;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.errcode.ErrDetails;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): berty.errcode.ErrDetails;
            public static toObject(message: berty.errcode.ErrDetails, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }
    }

    namespace protocol {

        namespace v1 {

            class ProtocolService extends $protobuf.rpc.Service {

                public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): ProtocolService;
                public instanceExportData(request: berty.types.v1.InstanceExportData.IRequest, callback: berty.protocol.v1.ProtocolService.InstanceExportDataCallback): void;
                public instanceExportData(request: berty.types.v1.InstanceExportData.IRequest): Promise<berty.types.v1.InstanceExportData.Reply>;
                public instanceGetConfiguration(request: berty.types.v1.InstanceGetConfiguration.IRequest, callback: berty.protocol.v1.ProtocolService.InstanceGetConfigurationCallback): void;
                public instanceGetConfiguration(request: berty.types.v1.InstanceGetConfiguration.IRequest): Promise<berty.types.v1.InstanceGetConfiguration.Reply>;
                public contactRequestReference(request: berty.types.v1.ContactRequestReference.IRequest, callback: berty.protocol.v1.ProtocolService.ContactRequestReferenceCallback): void;
                public contactRequestReference(request: berty.types.v1.ContactRequestReference.IRequest): Promise<berty.types.v1.ContactRequestReference.Reply>;
                public contactRequestDisable(request: berty.types.v1.ContactRequestDisable.IRequest, callback: berty.protocol.v1.ProtocolService.ContactRequestDisableCallback): void;
                public contactRequestDisable(request: berty.types.v1.ContactRequestDisable.IRequest): Promise<berty.types.v1.ContactRequestDisable.Reply>;
                public contactRequestEnable(request: berty.types.v1.ContactRequestEnable.IRequest, callback: berty.protocol.v1.ProtocolService.ContactRequestEnableCallback): void;
                public contactRequestEnable(request: berty.types.v1.ContactRequestEnable.IRequest): Promise<berty.types.v1.ContactRequestEnable.Reply>;
                public contactRequestResetReference(request: berty.types.v1.ContactRequestResetReference.IRequest, callback: berty.protocol.v1.ProtocolService.ContactRequestResetReferenceCallback): void;
                public contactRequestResetReference(request: berty.types.v1.ContactRequestResetReference.IRequest): Promise<berty.types.v1.ContactRequestResetReference.Reply>;
                public contactRequestSend(request: berty.types.v1.ContactRequestSend.IRequest, callback: berty.protocol.v1.ProtocolService.ContactRequestSendCallback): void;
                public contactRequestSend(request: berty.types.v1.ContactRequestSend.IRequest): Promise<berty.types.v1.ContactRequestSend.Reply>;
                public contactRequestAccept(request: berty.types.v1.ContactRequestAccept.IRequest, callback: berty.protocol.v1.ProtocolService.ContactRequestAcceptCallback): void;
                public contactRequestAccept(request: berty.types.v1.ContactRequestAccept.IRequest): Promise<berty.types.v1.ContactRequestAccept.Reply>;
                public contactRequestDiscard(request: berty.types.v1.ContactRequestDiscard.IRequest, callback: berty.protocol.v1.ProtocolService.ContactRequestDiscardCallback): void;
                public contactRequestDiscard(request: berty.types.v1.ContactRequestDiscard.IRequest): Promise<berty.types.v1.ContactRequestDiscard.Reply>;
                public contactBlock(request: berty.types.v1.ContactBlock.IRequest, callback: berty.protocol.v1.ProtocolService.ContactBlockCallback): void;
                public contactBlock(request: berty.types.v1.ContactBlock.IRequest): Promise<berty.types.v1.ContactBlock.Reply>;
                public contactUnblock(request: berty.types.v1.ContactUnblock.IRequest, callback: berty.protocol.v1.ProtocolService.ContactUnblockCallback): void;
                public contactUnblock(request: berty.types.v1.ContactUnblock.IRequest): Promise<berty.types.v1.ContactUnblock.Reply>;
                public contactAliasKeySend(request: berty.types.v1.ContactAliasKeySend.IRequest, callback: berty.protocol.v1.ProtocolService.ContactAliasKeySendCallback): void;
                public contactAliasKeySend(request: berty.types.v1.ContactAliasKeySend.IRequest): Promise<berty.types.v1.ContactAliasKeySend.Reply>;
                public multiMemberGroupCreate(request: berty.types.v1.MultiMemberGroupCreate.IRequest, callback: berty.protocol.v1.ProtocolService.MultiMemberGroupCreateCallback): void;
                public multiMemberGroupCreate(request: berty.types.v1.MultiMemberGroupCreate.IRequest): Promise<berty.types.v1.MultiMemberGroupCreate.Reply>;
                public multiMemberGroupJoin(request: berty.types.v1.MultiMemberGroupJoin.IRequest, callback: berty.protocol.v1.ProtocolService.MultiMemberGroupJoinCallback): void;
                public multiMemberGroupJoin(request: berty.types.v1.MultiMemberGroupJoin.IRequest): Promise<berty.types.v1.MultiMemberGroupJoin.Reply>;
                public multiMemberGroupLeave(request: berty.types.v1.MultiMemberGroupLeave.IRequest, callback: berty.protocol.v1.ProtocolService.MultiMemberGroupLeaveCallback): void;
                public multiMemberGroupLeave(request: berty.types.v1.MultiMemberGroupLeave.IRequest): Promise<berty.types.v1.MultiMemberGroupLeave.Reply>;
                public multiMemberGroupAliasResolverDisclose(request: berty.types.v1.MultiMemberGroupAliasResolverDisclose.IRequest, callback: berty.protocol.v1.ProtocolService.MultiMemberGroupAliasResolverDiscloseCallback): void;
                public multiMemberGroupAliasResolverDisclose(request: berty.types.v1.MultiMemberGroupAliasResolverDisclose.IRequest): Promise<berty.types.v1.MultiMemberGroupAliasResolverDisclose.Reply>;
                public multiMemberGroupAdminRoleGrant(request: berty.types.v1.MultiMemberGroupAdminRoleGrant.IRequest, callback: berty.protocol.v1.ProtocolService.MultiMemberGroupAdminRoleGrantCallback): void;
                public multiMemberGroupAdminRoleGrant(request: berty.types.v1.MultiMemberGroupAdminRoleGrant.IRequest): Promise<berty.types.v1.MultiMemberGroupAdminRoleGrant.Reply>;
                public multiMemberGroupInvitationCreate(request: berty.types.v1.MultiMemberGroupInvitationCreate.IRequest, callback: berty.protocol.v1.ProtocolService.MultiMemberGroupInvitationCreateCallback): void;
                public multiMemberGroupInvitationCreate(request: berty.types.v1.MultiMemberGroupInvitationCreate.IRequest): Promise<berty.types.v1.MultiMemberGroupInvitationCreate.Reply>;
                public appMetadataSend(request: berty.types.v1.AppMetadataSend.IRequest, callback: berty.protocol.v1.ProtocolService.AppMetadataSendCallback): void;
                public appMetadataSend(request: berty.types.v1.AppMetadataSend.IRequest): Promise<berty.types.v1.AppMetadataSend.Reply>;
                public appMessageSend(request: berty.types.v1.AppMessageSend.IRequest, callback: berty.protocol.v1.ProtocolService.AppMessageSendCallback): void;
                public appMessageSend(request: berty.types.v1.AppMessageSend.IRequest): Promise<berty.types.v1.AppMessageSend.Reply>;
                public groupMetadataSubscribe(request: berty.types.v1.GroupMetadataSubscribe.IRequest, callback: berty.protocol.v1.ProtocolService.GroupMetadataSubscribeCallback): void;
                public groupMetadataSubscribe(request: berty.types.v1.GroupMetadataSubscribe.IRequest): Promise<berty.types.v1.GroupMetadataEvent>;
                public groupMessageSubscribe(request: berty.types.v1.GroupMessageSubscribe.IRequest, callback: berty.protocol.v1.ProtocolService.GroupMessageSubscribeCallback): void;
                public groupMessageSubscribe(request: berty.types.v1.GroupMessageSubscribe.IRequest): Promise<berty.types.v1.GroupMessageEvent>;
                public groupMetadataList(request: berty.types.v1.GroupMetadataList.IRequest, callback: berty.protocol.v1.ProtocolService.GroupMetadataListCallback): void;
                public groupMetadataList(request: berty.types.v1.GroupMetadataList.IRequest): Promise<berty.types.v1.GroupMetadataEvent>;
                public groupMessageList(request: berty.types.v1.GroupMessageList.IRequest, callback: berty.protocol.v1.ProtocolService.GroupMessageListCallback): void;
                public groupMessageList(request: berty.types.v1.GroupMessageList.IRequest): Promise<berty.types.v1.GroupMessageEvent>;
                public groupInfo(request: berty.types.v1.GroupInfo.IRequest, callback: berty.protocol.v1.ProtocolService.GroupInfoCallback): void;
                public groupInfo(request: berty.types.v1.GroupInfo.IRequest): Promise<berty.types.v1.GroupInfo.Reply>;
                public activateGroup(request: berty.types.v1.ActivateGroup.IRequest, callback: berty.protocol.v1.ProtocolService.ActivateGroupCallback): void;
                public activateGroup(request: berty.types.v1.ActivateGroup.IRequest): Promise<berty.types.v1.ActivateGroup.Reply>;
                public deactivateGroup(request: berty.types.v1.DeactivateGroup.IRequest, callback: berty.protocol.v1.ProtocolService.DeactivateGroupCallback): void;
                public deactivateGroup(request: berty.types.v1.DeactivateGroup.IRequest): Promise<berty.types.v1.DeactivateGroup.Reply>;
                public debugListGroups(request: berty.types.v1.DebugListGroups.IRequest, callback: berty.protocol.v1.ProtocolService.DebugListGroupsCallback): void;
                public debugListGroups(request: berty.types.v1.DebugListGroups.IRequest): Promise<berty.types.v1.DebugListGroups.Reply>;
                public debugInspectGroupStore(request: berty.types.v1.DebugInspectGroupStore.IRequest, callback: berty.protocol.v1.ProtocolService.DebugInspectGroupStoreCallback): void;
                public debugInspectGroupStore(request: berty.types.v1.DebugInspectGroupStore.IRequest): Promise<berty.types.v1.DebugInspectGroupStore.Reply>;
                public debugGroup(request: berty.types.v1.DebugGroup.IRequest, callback: berty.protocol.v1.ProtocolService.DebugGroupCallback): void;
                public debugGroup(request: berty.types.v1.DebugGroup.IRequest): Promise<berty.types.v1.DebugGroup.Reply>;
            }

            namespace ProtocolService {

                type InstanceExportDataCallback = (error: (Error|null), response?: berty.types.v1.InstanceExportData.Reply) => void;

                type InstanceGetConfigurationCallback = (error: (Error|null), response?: berty.types.v1.InstanceGetConfiguration.Reply) => void;

                type ContactRequestReferenceCallback = (error: (Error|null), response?: berty.types.v1.ContactRequestReference.Reply) => void;

                type ContactRequestDisableCallback = (error: (Error|null), response?: berty.types.v1.ContactRequestDisable.Reply) => void;

                type ContactRequestEnableCallback = (error: (Error|null), response?: berty.types.v1.ContactRequestEnable.Reply) => void;

                type ContactRequestResetReferenceCallback = (error: (Error|null), response?: berty.types.v1.ContactRequestResetReference.Reply) => void;

                type ContactRequestSendCallback = (error: (Error|null), response?: berty.types.v1.ContactRequestSend.Reply) => void;

                type ContactRequestAcceptCallback = (error: (Error|null), response?: berty.types.v1.ContactRequestAccept.Reply) => void;

                type ContactRequestDiscardCallback = (error: (Error|null), response?: berty.types.v1.ContactRequestDiscard.Reply) => void;

                type ContactBlockCallback = (error: (Error|null), response?: berty.types.v1.ContactBlock.Reply) => void;

                type ContactUnblockCallback = (error: (Error|null), response?: berty.types.v1.ContactUnblock.Reply) => void;

                type ContactAliasKeySendCallback = (error: (Error|null), response?: berty.types.v1.ContactAliasKeySend.Reply) => void;

                type MultiMemberGroupCreateCallback = (error: (Error|null), response?: berty.types.v1.MultiMemberGroupCreate.Reply) => void;

                type MultiMemberGroupJoinCallback = (error: (Error|null), response?: berty.types.v1.MultiMemberGroupJoin.Reply) => void;

                type MultiMemberGroupLeaveCallback = (error: (Error|null), response?: berty.types.v1.MultiMemberGroupLeave.Reply) => void;

                type MultiMemberGroupAliasResolverDiscloseCallback = (error: (Error|null), response?: berty.types.v1.MultiMemberGroupAliasResolverDisclose.Reply) => void;

                type MultiMemberGroupAdminRoleGrantCallback = (error: (Error|null), response?: berty.types.v1.MultiMemberGroupAdminRoleGrant.Reply) => void;

                type MultiMemberGroupInvitationCreateCallback = (error: (Error|null), response?: berty.types.v1.MultiMemberGroupInvitationCreate.Reply) => void;

                type AppMetadataSendCallback = (error: (Error|null), response?: berty.types.v1.AppMetadataSend.Reply) => void;

                type AppMessageSendCallback = (error: (Error|null), response?: berty.types.v1.AppMessageSend.Reply) => void;

                type GroupMetadataSubscribeCallback = (error: (Error|null), response?: berty.types.v1.GroupMetadataEvent) => void;

                type GroupMessageSubscribeCallback = (error: (Error|null), response?: berty.types.v1.GroupMessageEvent) => void;

                type GroupMetadataListCallback = (error: (Error|null), response?: berty.types.v1.GroupMetadataEvent) => void;

                type GroupMessageListCallback = (error: (Error|null), response?: berty.types.v1.GroupMessageEvent) => void;

                type GroupInfoCallback = (error: (Error|null), response?: berty.types.v1.GroupInfo.Reply) => void;

                type ActivateGroupCallback = (error: (Error|null), response?: berty.types.v1.ActivateGroup.Reply) => void;

                type DeactivateGroupCallback = (error: (Error|null), response?: berty.types.v1.DeactivateGroup.Reply) => void;

                type DebugListGroupsCallback = (error: (Error|null), response?: berty.types.v1.DebugListGroups.Reply) => void;

                type DebugInspectGroupStoreCallback = (error: (Error|null), response?: berty.types.v1.DebugInspectGroupStore.Reply) => void;

                type DebugGroupCallback = (error: (Error|null), response?: berty.types.v1.DebugGroup.Reply) => void;
            }
        }
    }

    namespace types {

        namespace v1 {

            enum GroupType {
                GroupTypeUndefined = 0,
                GroupTypeAccount = 1,
                GroupTypeContact = 2,
                GroupTypeMultiMember = 3
            }

            enum EventType {
                EventTypeUndefined = 0,
                EventTypeGroupMemberDeviceAdded = 1,
                EventTypeGroupDeviceSecretAdded = 2,
                EventTypeAccountGroupJoined = 101,
                EventTypeAccountGroupLeft = 102,
                EventTypeAccountContactRequestDisabled = 103,
                EventTypeAccountContactRequestEnabled = 104,
                EventTypeAccountContactRequestReferenceReset = 105,
                EventTypeAccountContactRequestOutgoingEnqueued = 106,
                EventTypeAccountContactRequestOutgoingSent = 107,
                EventTypeAccountContactRequestIncomingReceived = 108,
                EventTypeAccountContactRequestIncomingDiscarded = 109,
                EventTypeAccountContactRequestIncomingAccepted = 110,
                EventTypeAccountContactBlocked = 111,
                EventTypeAccountContactUnblocked = 112,
                EventTypeContactAliasKeyAdded = 201,
                EventTypeMultiMemberGroupAliasResolverAdded = 301,
                EventTypeMultiMemberGroupInitialMemberAnnounced = 302,
                EventTypeMultiMemberGroupAdminRoleGranted = 303,
                EventTypeGroupMetadataPayloadSent = 1001
            }

            interface IAccount {
                group?: (berty.types.v1.IGroup|null);
                accountPrivateKey?: (Uint8Array|null);
                aliasPrivateKey?: (Uint8Array|null);
                publicRendezvousSeed?: (Uint8Array|null);
            }

            class Account implements IAccount {

                public group?: (berty.types.v1.IGroup|null);
                public accountPrivateKey: Uint8Array;
                public aliasPrivateKey: Uint8Array;
                public publicRendezvousSeed: Uint8Array;
                public static create(properties?: berty.types.v1.IAccount): berty.types.v1.Account;
                public static encode(message: berty.types.v1.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.Account;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.Account;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.Account;
                public static toObject(message: berty.types.v1.Account, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IGroup {
                publicKey?: (Uint8Array|null);
                secret?: (Uint8Array|null);
                secretSig?: (Uint8Array|null);
                groupType?: (berty.types.v1.GroupType|null);
            }

            class Group implements IGroup {

                public publicKey: Uint8Array;
                public secret: Uint8Array;
                public secretSig: Uint8Array;
                public groupType: berty.types.v1.GroupType;
                public static create(properties?: berty.types.v1.IGroup): berty.types.v1.Group;
                public static encode(message: berty.types.v1.IGroup, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroup, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.Group;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.Group;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.Group;
                public static toObject(message: berty.types.v1.Group, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IGroupMetadata {
                eventType?: (berty.types.v1.EventType|null);
                payload?: (Uint8Array|null);
                sig?: (Uint8Array|null);
            }

            class GroupMetadata implements IGroupMetadata {

                public eventType: berty.types.v1.EventType;
                public payload: Uint8Array;
                public sig: Uint8Array;
                public static create(properties?: berty.types.v1.IGroupMetadata): berty.types.v1.GroupMetadata;
                public static encode(message: berty.types.v1.IGroupMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroupMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupMetadata;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupMetadata;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupMetadata;
                public static toObject(message: berty.types.v1.GroupMetadata, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IGroupEnvelope {
                nonce?: (Uint8Array|null);
                event?: (Uint8Array|null);
            }

            class GroupEnvelope implements IGroupEnvelope {

                public nonce: Uint8Array;
                public event: Uint8Array;
                public static create(properties?: berty.types.v1.IGroupEnvelope): berty.types.v1.GroupEnvelope;
                public static encode(message: berty.types.v1.IGroupEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroupEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupEnvelope;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupEnvelope;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupEnvelope;
                public static toObject(message: berty.types.v1.GroupEnvelope, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IMessageHeaders {
                counter?: (number|Long|null);
                devicePk?: (Uint8Array|null);
                sig?: (Uint8Array|null);
                metadata?: ({ [k: string]: string }|null);
            }

            class MessageHeaders implements IMessageHeaders {

                public counter: (number|Long);
                public devicePk: Uint8Array;
                public sig: Uint8Array;
                public metadata: { [k: string]: string };
                public static create(properties?: berty.types.v1.IMessageHeaders): berty.types.v1.MessageHeaders;
                public static encode(message: berty.types.v1.IMessageHeaders, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IMessageHeaders, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MessageHeaders;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MessageHeaders;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.MessageHeaders;
                public static toObject(message: berty.types.v1.MessageHeaders, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IMessageEnvelope {
                messageHeaders?: (Uint8Array|null);
                message?: (Uint8Array|null);
                nonce?: (Uint8Array|null);
            }

            class MessageEnvelope implements IMessageEnvelope {

                public messageHeaders: Uint8Array;
                public message: Uint8Array;
                public nonce: Uint8Array;
                public static create(properties?: berty.types.v1.IMessageEnvelope): berty.types.v1.MessageEnvelope;
                public static encode(message: berty.types.v1.IMessageEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IMessageEnvelope, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MessageEnvelope;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MessageEnvelope;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.MessageEnvelope;
                public static toObject(message: berty.types.v1.MessageEnvelope, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IEventContext {
                id?: (Uint8Array|null);
                parentIds?: (Uint8Array[]|null);
                groupPk?: (Uint8Array|null);
            }

            class EventContext implements IEventContext {

                public id: Uint8Array;
                public parentIds: Uint8Array[];
                public groupPk: Uint8Array;
                public static create(properties?: berty.types.v1.IEventContext): berty.types.v1.EventContext;
                public static encode(message: berty.types.v1.IEventContext, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IEventContext, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.EventContext;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.EventContext;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.EventContext;
                public static toObject(message: berty.types.v1.EventContext, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAppMetadata {
                devicePk?: (Uint8Array|null);
                message?: (Uint8Array|null);
            }

            class AppMetadata implements IAppMetadata {

                public devicePk: Uint8Array;
                public message: Uint8Array;
                public static create(properties?: berty.types.v1.IAppMetadata): berty.types.v1.AppMetadata;
                public static encode(message: berty.types.v1.IAppMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAppMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AppMetadata;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AppMetadata;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AppMetadata;
                public static toObject(message: berty.types.v1.AppMetadata, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IContactAddAliasKey {
                devicePk?: (Uint8Array|null);
                aliasPk?: (Uint8Array|null);
            }

            class ContactAddAliasKey implements IContactAddAliasKey {

                public devicePk: Uint8Array;
                public aliasPk: Uint8Array;
                public static create(properties?: berty.types.v1.IContactAddAliasKey): berty.types.v1.ContactAddAliasKey;
                public static encode(message: berty.types.v1.IContactAddAliasKey, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IContactAddAliasKey, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactAddAliasKey;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactAddAliasKey;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactAddAliasKey;
                public static toObject(message: berty.types.v1.ContactAddAliasKey, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IGroupAddMemberDevice {
                memberPk?: (Uint8Array|null);
                devicePk?: (Uint8Array|null);
                memberSig?: (Uint8Array|null);
            }

            class GroupAddMemberDevice implements IGroupAddMemberDevice {

                public memberPk: Uint8Array;
                public devicePk: Uint8Array;
                public memberSig: Uint8Array;
                public static create(properties?: berty.types.v1.IGroupAddMemberDevice): berty.types.v1.GroupAddMemberDevice;
                public static encode(message: berty.types.v1.IGroupAddMemberDevice, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroupAddMemberDevice, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupAddMemberDevice;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupAddMemberDevice;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupAddMemberDevice;
                public static toObject(message: berty.types.v1.GroupAddMemberDevice, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IDeviceSecret {
                chainKey?: (Uint8Array|null);
                counter?: (number|Long|null);
            }

            class DeviceSecret implements IDeviceSecret {

                public chainKey: Uint8Array;
                public counter: (number|Long);
                public static create(properties?: berty.types.v1.IDeviceSecret): berty.types.v1.DeviceSecret;
                public static encode(message: berty.types.v1.IDeviceSecret, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IDeviceSecret, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.DeviceSecret;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.DeviceSecret;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.DeviceSecret;
                public static toObject(message: berty.types.v1.DeviceSecret, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IGroupAddDeviceSecret {
                devicePk?: (Uint8Array|null);
                destMemberPk?: (Uint8Array|null);
                payload?: (Uint8Array|null);
            }

            class GroupAddDeviceSecret implements IGroupAddDeviceSecret {

                public devicePk: Uint8Array;
                public destMemberPk: Uint8Array;
                public payload: Uint8Array;
                public static create(properties?: berty.types.v1.IGroupAddDeviceSecret): berty.types.v1.GroupAddDeviceSecret;
                public static encode(message: berty.types.v1.IGroupAddDeviceSecret, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroupAddDeviceSecret, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupAddDeviceSecret;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupAddDeviceSecret;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupAddDeviceSecret;
                public static toObject(message: berty.types.v1.GroupAddDeviceSecret, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IMultiMemberGroupAddAliasResolver {
                devicePk?: (Uint8Array|null);
                aliasResolver?: (Uint8Array|null);
                aliasProof?: (Uint8Array|null);
            }

            class MultiMemberGroupAddAliasResolver implements IMultiMemberGroupAddAliasResolver {

                public devicePk: Uint8Array;
                public aliasResolver: Uint8Array;
                public aliasProof: Uint8Array;
                public static create(properties?: berty.types.v1.IMultiMemberGroupAddAliasResolver): berty.types.v1.MultiMemberGroupAddAliasResolver;
                public static encode(message: berty.types.v1.IMultiMemberGroupAddAliasResolver, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IMultiMemberGroupAddAliasResolver, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupAddAliasResolver;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupAddAliasResolver;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupAddAliasResolver;
                public static toObject(message: berty.types.v1.MultiMemberGroupAddAliasResolver, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IMultiMemberGrantAdminRole {
                devicePk?: (Uint8Array|null);
                granteeMemberPk?: (Uint8Array|null);
            }

            class MultiMemberGrantAdminRole implements IMultiMemberGrantAdminRole {

                public devicePk: Uint8Array;
                public granteeMemberPk: Uint8Array;
                public static create(properties?: berty.types.v1.IMultiMemberGrantAdminRole): berty.types.v1.MultiMemberGrantAdminRole;
                public static encode(message: berty.types.v1.IMultiMemberGrantAdminRole, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IMultiMemberGrantAdminRole, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGrantAdminRole;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGrantAdminRole;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGrantAdminRole;
                public static toObject(message: berty.types.v1.MultiMemberGrantAdminRole, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IMultiMemberInitialMember {
                memberPk?: (Uint8Array|null);
            }

            class MultiMemberInitialMember implements IMultiMemberInitialMember {

                public memberPk: Uint8Array;
                public static create(properties?: berty.types.v1.IMultiMemberInitialMember): berty.types.v1.MultiMemberInitialMember;
                public static encode(message: berty.types.v1.IMultiMemberInitialMember, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IMultiMemberInitialMember, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberInitialMember;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberInitialMember;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberInitialMember;
                public static toObject(message: berty.types.v1.MultiMemberInitialMember, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IGroupAddAdditionalRendezvousSeed {
                devicePk?: (Uint8Array|null);
                seed?: (Uint8Array|null);
            }

            class GroupAddAdditionalRendezvousSeed implements IGroupAddAdditionalRendezvousSeed {

                public devicePk: Uint8Array;
                public seed: Uint8Array;
                public static create(properties?: berty.types.v1.IGroupAddAdditionalRendezvousSeed): berty.types.v1.GroupAddAdditionalRendezvousSeed;
                public static encode(message: berty.types.v1.IGroupAddAdditionalRendezvousSeed, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroupAddAdditionalRendezvousSeed, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupAddAdditionalRendezvousSeed;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupAddAdditionalRendezvousSeed;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupAddAdditionalRendezvousSeed;
                public static toObject(message: berty.types.v1.GroupAddAdditionalRendezvousSeed, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IGroupRemoveAdditionalRendezvousSeed {
                devicePk?: (Uint8Array|null);
                seed?: (Uint8Array|null);
            }

            class GroupRemoveAdditionalRendezvousSeed implements IGroupRemoveAdditionalRendezvousSeed {

                public devicePk: Uint8Array;
                public seed: Uint8Array;
                public static create(properties?: berty.types.v1.IGroupRemoveAdditionalRendezvousSeed): berty.types.v1.GroupRemoveAdditionalRendezvousSeed;
                public static encode(message: berty.types.v1.IGroupRemoveAdditionalRendezvousSeed, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroupRemoveAdditionalRendezvousSeed, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupRemoveAdditionalRendezvousSeed;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupRemoveAdditionalRendezvousSeed;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupRemoveAdditionalRendezvousSeed;
                public static toObject(message: berty.types.v1.GroupRemoveAdditionalRendezvousSeed, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAccountGroupJoined {
                devicePk?: (Uint8Array|null);
                group?: (berty.types.v1.IGroup|null);
            }

            class AccountGroupJoined implements IAccountGroupJoined {

                public devicePk: Uint8Array;
                public group?: (berty.types.v1.IGroup|null);
                public static create(properties?: berty.types.v1.IAccountGroupJoined): berty.types.v1.AccountGroupJoined;
                public static encode(message: berty.types.v1.IAccountGroupJoined, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAccountGroupJoined, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AccountGroupJoined;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AccountGroupJoined;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AccountGroupJoined;
                public static toObject(message: berty.types.v1.AccountGroupJoined, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAccountGroupLeft {
                devicePk?: (Uint8Array|null);
                groupPk?: (Uint8Array|null);
            }

            class AccountGroupLeft implements IAccountGroupLeft {

                public devicePk: Uint8Array;
                public groupPk: Uint8Array;
                public static create(properties?: berty.types.v1.IAccountGroupLeft): berty.types.v1.AccountGroupLeft;
                public static encode(message: berty.types.v1.IAccountGroupLeft, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAccountGroupLeft, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AccountGroupLeft;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AccountGroupLeft;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AccountGroupLeft;
                public static toObject(message: berty.types.v1.AccountGroupLeft, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAccountContactRequestDisabled {
                devicePk?: (Uint8Array|null);
            }

            class AccountContactRequestDisabled implements IAccountContactRequestDisabled {

                public devicePk: Uint8Array;
                public static create(properties?: berty.types.v1.IAccountContactRequestDisabled): berty.types.v1.AccountContactRequestDisabled;
                public static encode(message: berty.types.v1.IAccountContactRequestDisabled, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAccountContactRequestDisabled, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AccountContactRequestDisabled;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AccountContactRequestDisabled;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AccountContactRequestDisabled;
                public static toObject(message: berty.types.v1.AccountContactRequestDisabled, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAccountContactRequestEnabled {
                devicePk?: (Uint8Array|null);
            }

            class AccountContactRequestEnabled implements IAccountContactRequestEnabled {

                public devicePk: Uint8Array;
                public static create(properties?: berty.types.v1.IAccountContactRequestEnabled): berty.types.v1.AccountContactRequestEnabled;
                public static encode(message: berty.types.v1.IAccountContactRequestEnabled, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAccountContactRequestEnabled, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AccountContactRequestEnabled;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AccountContactRequestEnabled;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AccountContactRequestEnabled;
                public static toObject(message: berty.types.v1.AccountContactRequestEnabled, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAccountContactRequestReferenceReset {
                devicePk?: (Uint8Array|null);
                publicRendezvousSeed?: (Uint8Array|null);
            }

            class AccountContactRequestReferenceReset implements IAccountContactRequestReferenceReset {

                public devicePk: Uint8Array;
                public publicRendezvousSeed: Uint8Array;
                public static create(properties?: berty.types.v1.IAccountContactRequestReferenceReset): berty.types.v1.AccountContactRequestReferenceReset;
                public static encode(message: berty.types.v1.IAccountContactRequestReferenceReset, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAccountContactRequestReferenceReset, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AccountContactRequestReferenceReset;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AccountContactRequestReferenceReset;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AccountContactRequestReferenceReset;
                public static toObject(message: berty.types.v1.AccountContactRequestReferenceReset, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAccountContactRequestEnqueued {
                devicePk?: (Uint8Array|null);
                groupPk?: (Uint8Array|null);
                contact?: (berty.types.v1.IShareableContact|null);
                ownMetadata?: (Uint8Array|null);
            }

            class AccountContactRequestEnqueued implements IAccountContactRequestEnqueued {

                public devicePk: Uint8Array;
                public groupPk: Uint8Array;
                public contact?: (berty.types.v1.IShareableContact|null);
                public ownMetadata: Uint8Array;
                public static create(properties?: berty.types.v1.IAccountContactRequestEnqueued): berty.types.v1.AccountContactRequestEnqueued;
                public static encode(message: berty.types.v1.IAccountContactRequestEnqueued, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAccountContactRequestEnqueued, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AccountContactRequestEnqueued;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AccountContactRequestEnqueued;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AccountContactRequestEnqueued;
                public static toObject(message: berty.types.v1.AccountContactRequestEnqueued, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAccountContactRequestSent {
                devicePk?: (Uint8Array|null);
                contactPk?: (Uint8Array|null);
            }

            class AccountContactRequestSent implements IAccountContactRequestSent {

                public devicePk: Uint8Array;
                public contactPk: Uint8Array;
                public static create(properties?: berty.types.v1.IAccountContactRequestSent): berty.types.v1.AccountContactRequestSent;
                public static encode(message: berty.types.v1.IAccountContactRequestSent, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAccountContactRequestSent, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AccountContactRequestSent;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AccountContactRequestSent;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AccountContactRequestSent;
                public static toObject(message: berty.types.v1.AccountContactRequestSent, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAccountContactRequestReceived {
                devicePk?: (Uint8Array|null);
                contactPk?: (Uint8Array|null);
                contactRendezvousSeed?: (Uint8Array|null);
                contactMetadata?: (Uint8Array|null);
            }

            class AccountContactRequestReceived implements IAccountContactRequestReceived {

                public devicePk: Uint8Array;
                public contactPk: Uint8Array;
                public contactRendezvousSeed: Uint8Array;
                public contactMetadata: Uint8Array;
                public static create(properties?: berty.types.v1.IAccountContactRequestReceived): berty.types.v1.AccountContactRequestReceived;
                public static encode(message: berty.types.v1.IAccountContactRequestReceived, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAccountContactRequestReceived, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AccountContactRequestReceived;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AccountContactRequestReceived;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AccountContactRequestReceived;
                public static toObject(message: berty.types.v1.AccountContactRequestReceived, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAccountContactRequestDiscarded {
                devicePk?: (Uint8Array|null);
                contactPk?: (Uint8Array|null);
            }

            class AccountContactRequestDiscarded implements IAccountContactRequestDiscarded {

                public devicePk: Uint8Array;
                public contactPk: Uint8Array;
                public static create(properties?: berty.types.v1.IAccountContactRequestDiscarded): berty.types.v1.AccountContactRequestDiscarded;
                public static encode(message: berty.types.v1.IAccountContactRequestDiscarded, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAccountContactRequestDiscarded, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AccountContactRequestDiscarded;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AccountContactRequestDiscarded;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AccountContactRequestDiscarded;
                public static toObject(message: berty.types.v1.AccountContactRequestDiscarded, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAccountContactRequestAccepted {
                devicePk?: (Uint8Array|null);
                contactPk?: (Uint8Array|null);
                groupPk?: (Uint8Array|null);
            }

            class AccountContactRequestAccepted implements IAccountContactRequestAccepted {

                public devicePk: Uint8Array;
                public contactPk: Uint8Array;
                public groupPk: Uint8Array;
                public static create(properties?: berty.types.v1.IAccountContactRequestAccepted): berty.types.v1.AccountContactRequestAccepted;
                public static encode(message: berty.types.v1.IAccountContactRequestAccepted, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAccountContactRequestAccepted, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AccountContactRequestAccepted;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AccountContactRequestAccepted;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AccountContactRequestAccepted;
                public static toObject(message: berty.types.v1.AccountContactRequestAccepted, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAccountContactBlocked {
                devicePk?: (Uint8Array|null);
                contactPk?: (Uint8Array|null);
            }

            class AccountContactBlocked implements IAccountContactBlocked {

                public devicePk: Uint8Array;
                public contactPk: Uint8Array;
                public static create(properties?: berty.types.v1.IAccountContactBlocked): berty.types.v1.AccountContactBlocked;
                public static encode(message: berty.types.v1.IAccountContactBlocked, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAccountContactBlocked, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AccountContactBlocked;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AccountContactBlocked;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AccountContactBlocked;
                public static toObject(message: berty.types.v1.AccountContactBlocked, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAccountContactUnblocked {
                devicePk?: (Uint8Array|null);
                contactPk?: (Uint8Array|null);
            }

            class AccountContactUnblocked implements IAccountContactUnblocked {

                public devicePk: Uint8Array;
                public contactPk: Uint8Array;
                public static create(properties?: berty.types.v1.IAccountContactUnblocked): berty.types.v1.AccountContactUnblocked;
                public static encode(message: berty.types.v1.IAccountContactUnblocked, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAccountContactUnblocked, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AccountContactUnblocked;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AccountContactUnblocked;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AccountContactUnblocked;
                public static toObject(message: berty.types.v1.AccountContactUnblocked, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IInstanceExportData {
            }

            class InstanceExportData implements IInstanceExportData {

                public static create(properties?: berty.types.v1.IInstanceExportData): berty.types.v1.InstanceExportData;
                public static encode(message: berty.types.v1.IInstanceExportData, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IInstanceExportData, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.InstanceExportData;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.InstanceExportData;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.InstanceExportData;
                public static toObject(message: berty.types.v1.InstanceExportData, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace InstanceExportData {

                interface IRequest {
                }

                class Request implements IRequest {

                    public static create(properties?: berty.types.v1.InstanceExportData.IRequest): berty.types.v1.InstanceExportData.Request;
                    public static encode(message: berty.types.v1.InstanceExportData.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.InstanceExportData.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.InstanceExportData.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.InstanceExportData.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.InstanceExportData.Request;
                    public static toObject(message: berty.types.v1.InstanceExportData.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    exportedData?: (Uint8Array|null);
                }

                class Reply implements IReply {

                    public exportedData: Uint8Array;
                    public static create(properties?: berty.types.v1.InstanceExportData.IReply): berty.types.v1.InstanceExportData.Reply;
                    public static encode(message: berty.types.v1.InstanceExportData.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.InstanceExportData.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.InstanceExportData.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.InstanceExportData.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.InstanceExportData.Reply;
                    public static toObject(message: berty.types.v1.InstanceExportData.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IInstanceGetConfiguration {
            }

            class InstanceGetConfiguration implements IInstanceGetConfiguration {

                public static create(properties?: berty.types.v1.IInstanceGetConfiguration): berty.types.v1.InstanceGetConfiguration;
                public static encode(message: berty.types.v1.IInstanceGetConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IInstanceGetConfiguration, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.InstanceGetConfiguration;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.InstanceGetConfiguration;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.InstanceGetConfiguration;
                public static toObject(message: berty.types.v1.InstanceGetConfiguration, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace InstanceGetConfiguration {

                enum SettingState {
                    Unknown = 0,
                    Enabled = 1,
                    Disabled = 2,
                    Unavailable = 3
                }

                interface IRequest {
                }

                class Request implements IRequest {

                    public static create(properties?: berty.types.v1.InstanceGetConfiguration.IRequest): berty.types.v1.InstanceGetConfiguration.Request;
                    public static encode(message: berty.types.v1.InstanceGetConfiguration.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.InstanceGetConfiguration.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.InstanceGetConfiguration.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.InstanceGetConfiguration.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.InstanceGetConfiguration.Request;
                    public static toObject(message: berty.types.v1.InstanceGetConfiguration.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    accountPk?: (Uint8Array|null);
                    devicePk?: (Uint8Array|null);
                    accountGroupPk?: (Uint8Array|null);
                    peerId?: (string|null);
                    listeners?: (string[]|null);
                    bleEnabled?: (berty.types.v1.InstanceGetConfiguration.SettingState|null);
                    wifiP2pEnabled?: (berty.types.v1.InstanceGetConfiguration.SettingState|null);
                    mdnsEnabled?: (berty.types.v1.InstanceGetConfiguration.SettingState|null);
                    relayEnabled?: (berty.types.v1.InstanceGetConfiguration.SettingState|null);
                }

                class Reply implements IReply {

                    public accountPk: Uint8Array;
                    public devicePk: Uint8Array;
                    public accountGroupPk: Uint8Array;
                    public peerId: string;
                    public listeners: string[];
                    public bleEnabled: berty.types.v1.InstanceGetConfiguration.SettingState;
                    public wifiP2pEnabled: berty.types.v1.InstanceGetConfiguration.SettingState;
                    public mdnsEnabled: berty.types.v1.InstanceGetConfiguration.SettingState;
                    public relayEnabled: berty.types.v1.InstanceGetConfiguration.SettingState;
                    public static create(properties?: berty.types.v1.InstanceGetConfiguration.IReply): berty.types.v1.InstanceGetConfiguration.Reply;
                    public static encode(message: berty.types.v1.InstanceGetConfiguration.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.InstanceGetConfiguration.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.InstanceGetConfiguration.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.InstanceGetConfiguration.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.InstanceGetConfiguration.Reply;
                    public static toObject(message: berty.types.v1.InstanceGetConfiguration.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IContactRequestReference {
            }

            class ContactRequestReference implements IContactRequestReference {

                public static create(properties?: berty.types.v1.IContactRequestReference): berty.types.v1.ContactRequestReference;
                public static encode(message: berty.types.v1.IContactRequestReference, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IContactRequestReference, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestReference;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestReference;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestReference;
                public static toObject(message: berty.types.v1.ContactRequestReference, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ContactRequestReference {

                interface IRequest {
                }

                class Request implements IRequest {

                    public static create(properties?: berty.types.v1.ContactRequestReference.IRequest): berty.types.v1.ContactRequestReference.Request;
                    public static encode(message: berty.types.v1.ContactRequestReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestReference.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestReference.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestReference.Request;
                    public static toObject(message: berty.types.v1.ContactRequestReference.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    publicRendezvousSeed?: (Uint8Array|null);
                    enabled?: (boolean|null);
                }

                class Reply implements IReply {

                    public publicRendezvousSeed: Uint8Array;
                    public enabled: boolean;
                    public static create(properties?: berty.types.v1.ContactRequestReference.IReply): berty.types.v1.ContactRequestReference.Reply;
                    public static encode(message: berty.types.v1.ContactRequestReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestReference.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestReference.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestReference.Reply;
                    public static toObject(message: berty.types.v1.ContactRequestReference.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IContactRequestDisable {
            }

            class ContactRequestDisable implements IContactRequestDisable {

                public static create(properties?: berty.types.v1.IContactRequestDisable): berty.types.v1.ContactRequestDisable;
                public static encode(message: berty.types.v1.IContactRequestDisable, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IContactRequestDisable, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestDisable;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestDisable;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestDisable;
                public static toObject(message: berty.types.v1.ContactRequestDisable, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ContactRequestDisable {

                interface IRequest {
                }

                class Request implements IRequest {

                    public static create(properties?: berty.types.v1.ContactRequestDisable.IRequest): berty.types.v1.ContactRequestDisable.Request;
                    public static encode(message: berty.types.v1.ContactRequestDisable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestDisable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestDisable.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestDisable.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestDisable.Request;
                    public static toObject(message: berty.types.v1.ContactRequestDisable.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.ContactRequestDisable.IReply): berty.types.v1.ContactRequestDisable.Reply;
                    public static encode(message: berty.types.v1.ContactRequestDisable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestDisable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestDisable.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestDisable.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestDisable.Reply;
                    public static toObject(message: berty.types.v1.ContactRequestDisable.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IContactRequestEnable {
            }

            class ContactRequestEnable implements IContactRequestEnable {

                public static create(properties?: berty.types.v1.IContactRequestEnable): berty.types.v1.ContactRequestEnable;
                public static encode(message: berty.types.v1.IContactRequestEnable, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IContactRequestEnable, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestEnable;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestEnable;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestEnable;
                public static toObject(message: berty.types.v1.ContactRequestEnable, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ContactRequestEnable {

                interface IRequest {
                }

                class Request implements IRequest {

                    public static create(properties?: berty.types.v1.ContactRequestEnable.IRequest): berty.types.v1.ContactRequestEnable.Request;
                    public static encode(message: berty.types.v1.ContactRequestEnable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestEnable.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestEnable.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestEnable.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestEnable.Request;
                    public static toObject(message: berty.types.v1.ContactRequestEnable.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    publicRendezvousSeed?: (Uint8Array|null);
                }

                class Reply implements IReply {

                    public publicRendezvousSeed: Uint8Array;
                    public static create(properties?: berty.types.v1.ContactRequestEnable.IReply): berty.types.v1.ContactRequestEnable.Reply;
                    public static encode(message: berty.types.v1.ContactRequestEnable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestEnable.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestEnable.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestEnable.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestEnable.Reply;
                    public static toObject(message: berty.types.v1.ContactRequestEnable.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IContactRequestResetReference {
            }

            class ContactRequestResetReference implements IContactRequestResetReference {

                public static create(properties?: berty.types.v1.IContactRequestResetReference): berty.types.v1.ContactRequestResetReference;
                public static encode(message: berty.types.v1.IContactRequestResetReference, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IContactRequestResetReference, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestResetReference;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestResetReference;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestResetReference;
                public static toObject(message: berty.types.v1.ContactRequestResetReference, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ContactRequestResetReference {

                interface IRequest {
                }

                class Request implements IRequest {

                    public static create(properties?: berty.types.v1.ContactRequestResetReference.IRequest): berty.types.v1.ContactRequestResetReference.Request;
                    public static encode(message: berty.types.v1.ContactRequestResetReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestResetReference.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestResetReference.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestResetReference.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestResetReference.Request;
                    public static toObject(message: berty.types.v1.ContactRequestResetReference.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    publicRendezvousSeed?: (Uint8Array|null);
                }

                class Reply implements IReply {

                    public publicRendezvousSeed: Uint8Array;
                    public static create(properties?: berty.types.v1.ContactRequestResetReference.IReply): berty.types.v1.ContactRequestResetReference.Reply;
                    public static encode(message: berty.types.v1.ContactRequestResetReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestResetReference.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestResetReference.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestResetReference.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestResetReference.Reply;
                    public static toObject(message: berty.types.v1.ContactRequestResetReference.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IContactRequestSend {
            }

            class ContactRequestSend implements IContactRequestSend {

                public static create(properties?: berty.types.v1.IContactRequestSend): berty.types.v1.ContactRequestSend;
                public static encode(message: berty.types.v1.IContactRequestSend, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IContactRequestSend, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestSend;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestSend;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestSend;
                public static toObject(message: berty.types.v1.ContactRequestSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ContactRequestSend {

                interface IRequest {
                    contact?: (berty.types.v1.IShareableContact|null);
                    ownMetadata?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public contact?: (berty.types.v1.IShareableContact|null);
                    public ownMetadata: Uint8Array;
                    public static create(properties?: berty.types.v1.ContactRequestSend.IRequest): berty.types.v1.ContactRequestSend.Request;
                    public static encode(message: berty.types.v1.ContactRequestSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestSend.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestSend.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestSend.Request;
                    public static toObject(message: berty.types.v1.ContactRequestSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.ContactRequestSend.IReply): berty.types.v1.ContactRequestSend.Reply;
                    public static encode(message: berty.types.v1.ContactRequestSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestSend.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestSend.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestSend.Reply;
                    public static toObject(message: berty.types.v1.ContactRequestSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IContactRequestAccept {
            }

            class ContactRequestAccept implements IContactRequestAccept {

                public static create(properties?: berty.types.v1.IContactRequestAccept): berty.types.v1.ContactRequestAccept;
                public static encode(message: berty.types.v1.IContactRequestAccept, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IContactRequestAccept, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestAccept;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestAccept;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestAccept;
                public static toObject(message: berty.types.v1.ContactRequestAccept, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ContactRequestAccept {

                interface IRequest {
                    contactPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public contactPk: Uint8Array;
                    public static create(properties?: berty.types.v1.ContactRequestAccept.IRequest): berty.types.v1.ContactRequestAccept.Request;
                    public static encode(message: berty.types.v1.ContactRequestAccept.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestAccept.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestAccept.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestAccept.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestAccept.Request;
                    public static toObject(message: berty.types.v1.ContactRequestAccept.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.ContactRequestAccept.IReply): berty.types.v1.ContactRequestAccept.Reply;
                    public static encode(message: berty.types.v1.ContactRequestAccept.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestAccept.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestAccept.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestAccept.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestAccept.Reply;
                    public static toObject(message: berty.types.v1.ContactRequestAccept.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IContactRequestDiscard {
            }

            class ContactRequestDiscard implements IContactRequestDiscard {

                public static create(properties?: berty.types.v1.IContactRequestDiscard): berty.types.v1.ContactRequestDiscard;
                public static encode(message: berty.types.v1.IContactRequestDiscard, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IContactRequestDiscard, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestDiscard;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestDiscard;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestDiscard;
                public static toObject(message: berty.types.v1.ContactRequestDiscard, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ContactRequestDiscard {

                interface IRequest {
                    contactPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public contactPk: Uint8Array;
                    public static create(properties?: berty.types.v1.ContactRequestDiscard.IRequest): berty.types.v1.ContactRequestDiscard.Request;
                    public static encode(message: berty.types.v1.ContactRequestDiscard.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestDiscard.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestDiscard.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestDiscard.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestDiscard.Request;
                    public static toObject(message: berty.types.v1.ContactRequestDiscard.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.ContactRequestDiscard.IReply): berty.types.v1.ContactRequestDiscard.Reply;
                    public static encode(message: berty.types.v1.ContactRequestDiscard.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactRequestDiscard.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactRequestDiscard.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactRequestDiscard.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactRequestDiscard.Reply;
                    public static toObject(message: berty.types.v1.ContactRequestDiscard.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IContactBlock {
            }

            class ContactBlock implements IContactBlock {

                public static create(properties?: berty.types.v1.IContactBlock): berty.types.v1.ContactBlock;
                public static encode(message: berty.types.v1.IContactBlock, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IContactBlock, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactBlock;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactBlock;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactBlock;
                public static toObject(message: berty.types.v1.ContactBlock, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ContactBlock {

                interface IRequest {
                    contactPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public contactPk: Uint8Array;
                    public static create(properties?: berty.types.v1.ContactBlock.IRequest): berty.types.v1.ContactBlock.Request;
                    public static encode(message: berty.types.v1.ContactBlock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactBlock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactBlock.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactBlock.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactBlock.Request;
                    public static toObject(message: berty.types.v1.ContactBlock.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.ContactBlock.IReply): berty.types.v1.ContactBlock.Reply;
                    public static encode(message: berty.types.v1.ContactBlock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactBlock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactBlock.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactBlock.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactBlock.Reply;
                    public static toObject(message: berty.types.v1.ContactBlock.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IContactUnblock {
            }

            class ContactUnblock implements IContactUnblock {

                public static create(properties?: berty.types.v1.IContactUnblock): berty.types.v1.ContactUnblock;
                public static encode(message: berty.types.v1.IContactUnblock, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IContactUnblock, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactUnblock;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactUnblock;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactUnblock;
                public static toObject(message: berty.types.v1.ContactUnblock, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ContactUnblock {

                interface IRequest {
                    contactPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public contactPk: Uint8Array;
                    public static create(properties?: berty.types.v1.ContactUnblock.IRequest): berty.types.v1.ContactUnblock.Request;
                    public static encode(message: berty.types.v1.ContactUnblock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactUnblock.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactUnblock.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactUnblock.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactUnblock.Request;
                    public static toObject(message: berty.types.v1.ContactUnblock.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.ContactUnblock.IReply): berty.types.v1.ContactUnblock.Reply;
                    public static encode(message: berty.types.v1.ContactUnblock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactUnblock.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactUnblock.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactUnblock.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactUnblock.Reply;
                    public static toObject(message: berty.types.v1.ContactUnblock.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IContactAliasKeySend {
            }

            class ContactAliasKeySend implements IContactAliasKeySend {

                public static create(properties?: berty.types.v1.IContactAliasKeySend): berty.types.v1.ContactAliasKeySend;
                public static encode(message: berty.types.v1.IContactAliasKeySend, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IContactAliasKeySend, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactAliasKeySend;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactAliasKeySend;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactAliasKeySend;
                public static toObject(message: berty.types.v1.ContactAliasKeySend, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ContactAliasKeySend {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public static create(properties?: berty.types.v1.ContactAliasKeySend.IRequest): berty.types.v1.ContactAliasKeySend.Request;
                    public static encode(message: berty.types.v1.ContactAliasKeySend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactAliasKeySend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactAliasKeySend.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactAliasKeySend.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactAliasKeySend.Request;
                    public static toObject(message: berty.types.v1.ContactAliasKeySend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.ContactAliasKeySend.IReply): berty.types.v1.ContactAliasKeySend.Reply;
                    public static encode(message: berty.types.v1.ContactAliasKeySend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ContactAliasKeySend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ContactAliasKeySend.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ContactAliasKeySend.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ContactAliasKeySend.Reply;
                    public static toObject(message: berty.types.v1.ContactAliasKeySend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IMultiMemberGroupCreate {
            }

            class MultiMemberGroupCreate implements IMultiMemberGroupCreate {

                public static create(properties?: berty.types.v1.IMultiMemberGroupCreate): berty.types.v1.MultiMemberGroupCreate;
                public static encode(message: berty.types.v1.IMultiMemberGroupCreate, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IMultiMemberGroupCreate, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupCreate;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupCreate;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupCreate;
                public static toObject(message: berty.types.v1.MultiMemberGroupCreate, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace MultiMemberGroupCreate {

                interface IRequest {
                }

                class Request implements IRequest {

                    public static create(properties?: berty.types.v1.MultiMemberGroupCreate.IRequest): berty.types.v1.MultiMemberGroupCreate.Request;
                    public static encode(message: berty.types.v1.MultiMemberGroupCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.MultiMemberGroupCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupCreate.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupCreate.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupCreate.Request;
                    public static toObject(message: berty.types.v1.MultiMemberGroupCreate.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    groupPk?: (Uint8Array|null);
                }

                class Reply implements IReply {

                    public groupPk: Uint8Array;
                    public static create(properties?: berty.types.v1.MultiMemberGroupCreate.IReply): berty.types.v1.MultiMemberGroupCreate.Reply;
                    public static encode(message: berty.types.v1.MultiMemberGroupCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.MultiMemberGroupCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupCreate.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupCreate.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupCreate.Reply;
                    public static toObject(message: berty.types.v1.MultiMemberGroupCreate.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IMultiMemberGroupJoin {
            }

            class MultiMemberGroupJoin implements IMultiMemberGroupJoin {

                public static create(properties?: berty.types.v1.IMultiMemberGroupJoin): berty.types.v1.MultiMemberGroupJoin;
                public static encode(message: berty.types.v1.IMultiMemberGroupJoin, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IMultiMemberGroupJoin, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupJoin;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupJoin;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupJoin;
                public static toObject(message: berty.types.v1.MultiMemberGroupJoin, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace MultiMemberGroupJoin {

                interface IRequest {
                    group?: (berty.types.v1.IGroup|null);
                }

                class Request implements IRequest {

                    public group?: (berty.types.v1.IGroup|null);
                    public static create(properties?: berty.types.v1.MultiMemberGroupJoin.IRequest): berty.types.v1.MultiMemberGroupJoin.Request;
                    public static encode(message: berty.types.v1.MultiMemberGroupJoin.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.MultiMemberGroupJoin.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupJoin.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupJoin.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupJoin.Request;
                    public static toObject(message: berty.types.v1.MultiMemberGroupJoin.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.MultiMemberGroupJoin.IReply): berty.types.v1.MultiMemberGroupJoin.Reply;
                    public static encode(message: berty.types.v1.MultiMemberGroupJoin.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.MultiMemberGroupJoin.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupJoin.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupJoin.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupJoin.Reply;
                    public static toObject(message: berty.types.v1.MultiMemberGroupJoin.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IMultiMemberGroupLeave {
            }

            class MultiMemberGroupLeave implements IMultiMemberGroupLeave {

                public static create(properties?: berty.types.v1.IMultiMemberGroupLeave): berty.types.v1.MultiMemberGroupLeave;
                public static encode(message: berty.types.v1.IMultiMemberGroupLeave, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IMultiMemberGroupLeave, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupLeave;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupLeave;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupLeave;
                public static toObject(message: berty.types.v1.MultiMemberGroupLeave, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace MultiMemberGroupLeave {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public static create(properties?: berty.types.v1.MultiMemberGroupLeave.IRequest): berty.types.v1.MultiMemberGroupLeave.Request;
                    public static encode(message: berty.types.v1.MultiMemberGroupLeave.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.MultiMemberGroupLeave.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupLeave.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupLeave.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupLeave.Request;
                    public static toObject(message: berty.types.v1.MultiMemberGroupLeave.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.MultiMemberGroupLeave.IReply): berty.types.v1.MultiMemberGroupLeave.Reply;
                    public static encode(message: berty.types.v1.MultiMemberGroupLeave.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.MultiMemberGroupLeave.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupLeave.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupLeave.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupLeave.Reply;
                    public static toObject(message: berty.types.v1.MultiMemberGroupLeave.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IMultiMemberGroupAliasResolverDisclose {
            }

            class MultiMemberGroupAliasResolverDisclose implements IMultiMemberGroupAliasResolverDisclose {

                public static create(properties?: berty.types.v1.IMultiMemberGroupAliasResolverDisclose): berty.types.v1.MultiMemberGroupAliasResolverDisclose;
                public static encode(message: berty.types.v1.IMultiMemberGroupAliasResolverDisclose, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IMultiMemberGroupAliasResolverDisclose, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupAliasResolverDisclose;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupAliasResolverDisclose;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupAliasResolverDisclose;
                public static toObject(message: berty.types.v1.MultiMemberGroupAliasResolverDisclose, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace MultiMemberGroupAliasResolverDisclose {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public static create(properties?: berty.types.v1.MultiMemberGroupAliasResolverDisclose.IRequest): berty.types.v1.MultiMemberGroupAliasResolverDisclose.Request;
                    public static encode(message: berty.types.v1.MultiMemberGroupAliasResolverDisclose.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.MultiMemberGroupAliasResolverDisclose.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupAliasResolverDisclose.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupAliasResolverDisclose.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupAliasResolverDisclose.Request;
                    public static toObject(message: berty.types.v1.MultiMemberGroupAliasResolverDisclose.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.MultiMemberGroupAliasResolverDisclose.IReply): berty.types.v1.MultiMemberGroupAliasResolverDisclose.Reply;
                    public static encode(message: berty.types.v1.MultiMemberGroupAliasResolverDisclose.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.MultiMemberGroupAliasResolverDisclose.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupAliasResolverDisclose.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupAliasResolverDisclose.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupAliasResolverDisclose.Reply;
                    public static toObject(message: berty.types.v1.MultiMemberGroupAliasResolverDisclose.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IMultiMemberGroupAdminRoleGrant {
            }

            class MultiMemberGroupAdminRoleGrant implements IMultiMemberGroupAdminRoleGrant {

                public static create(properties?: berty.types.v1.IMultiMemberGroupAdminRoleGrant): berty.types.v1.MultiMemberGroupAdminRoleGrant;
                public static encode(message: berty.types.v1.IMultiMemberGroupAdminRoleGrant, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IMultiMemberGroupAdminRoleGrant, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupAdminRoleGrant;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupAdminRoleGrant;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupAdminRoleGrant;
                public static toObject(message: berty.types.v1.MultiMemberGroupAdminRoleGrant, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace MultiMemberGroupAdminRoleGrant {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                    memberPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public memberPk: Uint8Array;
                    public static create(properties?: berty.types.v1.MultiMemberGroupAdminRoleGrant.IRequest): berty.types.v1.MultiMemberGroupAdminRoleGrant.Request;
                    public static encode(message: berty.types.v1.MultiMemberGroupAdminRoleGrant.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.MultiMemberGroupAdminRoleGrant.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupAdminRoleGrant.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupAdminRoleGrant.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupAdminRoleGrant.Request;
                    public static toObject(message: berty.types.v1.MultiMemberGroupAdminRoleGrant.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.MultiMemberGroupAdminRoleGrant.IReply): berty.types.v1.MultiMemberGroupAdminRoleGrant.Reply;
                    public static encode(message: berty.types.v1.MultiMemberGroupAdminRoleGrant.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.MultiMemberGroupAdminRoleGrant.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupAdminRoleGrant.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupAdminRoleGrant.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupAdminRoleGrant.Reply;
                    public static toObject(message: berty.types.v1.MultiMemberGroupAdminRoleGrant.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IMultiMemberGroupInvitationCreate {
            }

            class MultiMemberGroupInvitationCreate implements IMultiMemberGroupInvitationCreate {

                public static create(properties?: berty.types.v1.IMultiMemberGroupInvitationCreate): berty.types.v1.MultiMemberGroupInvitationCreate;
                public static encode(message: berty.types.v1.IMultiMemberGroupInvitationCreate, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IMultiMemberGroupInvitationCreate, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupInvitationCreate;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupInvitationCreate;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupInvitationCreate;
                public static toObject(message: berty.types.v1.MultiMemberGroupInvitationCreate, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace MultiMemberGroupInvitationCreate {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public static create(properties?: berty.types.v1.MultiMemberGroupInvitationCreate.IRequest): berty.types.v1.MultiMemberGroupInvitationCreate.Request;
                    public static encode(message: berty.types.v1.MultiMemberGroupInvitationCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.MultiMemberGroupInvitationCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupInvitationCreate.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupInvitationCreate.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupInvitationCreate.Request;
                    public static toObject(message: berty.types.v1.MultiMemberGroupInvitationCreate.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    group?: (berty.types.v1.IGroup|null);
                }

                class Reply implements IReply {

                    public group?: (berty.types.v1.IGroup|null);
                    public static create(properties?: berty.types.v1.MultiMemberGroupInvitationCreate.IReply): berty.types.v1.MultiMemberGroupInvitationCreate.Reply;
                    public static encode(message: berty.types.v1.MultiMemberGroupInvitationCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.MultiMemberGroupInvitationCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.MultiMemberGroupInvitationCreate.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.MultiMemberGroupInvitationCreate.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.MultiMemberGroupInvitationCreate.Reply;
                    public static toObject(message: berty.types.v1.MultiMemberGroupInvitationCreate.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IAppMetadataSend {
            }

            class AppMetadataSend implements IAppMetadataSend {

                public static create(properties?: berty.types.v1.IAppMetadataSend): berty.types.v1.AppMetadataSend;
                public static encode(message: berty.types.v1.IAppMetadataSend, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAppMetadataSend, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AppMetadataSend;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AppMetadataSend;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AppMetadataSend;
                public static toObject(message: berty.types.v1.AppMetadataSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace AppMetadataSend {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                    payload?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public payload: Uint8Array;
                    public static create(properties?: berty.types.v1.AppMetadataSend.IRequest): berty.types.v1.AppMetadataSend.Request;
                    public static encode(message: berty.types.v1.AppMetadataSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.AppMetadataSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AppMetadataSend.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AppMetadataSend.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.AppMetadataSend.Request;
                    public static toObject(message: berty.types.v1.AppMetadataSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.AppMetadataSend.IReply): berty.types.v1.AppMetadataSend.Reply;
                    public static encode(message: berty.types.v1.AppMetadataSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.AppMetadataSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AppMetadataSend.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AppMetadataSend.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.AppMetadataSend.Reply;
                    public static toObject(message: berty.types.v1.AppMetadataSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IAppMessageSend {
            }

            class AppMessageSend implements IAppMessageSend {

                public static create(properties?: berty.types.v1.IAppMessageSend): berty.types.v1.AppMessageSend;
                public static encode(message: berty.types.v1.IAppMessageSend, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IAppMessageSend, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AppMessageSend;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AppMessageSend;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.AppMessageSend;
                public static toObject(message: berty.types.v1.AppMessageSend, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace AppMessageSend {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                    payload?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public payload: Uint8Array;
                    public static create(properties?: berty.types.v1.AppMessageSend.IRequest): berty.types.v1.AppMessageSend.Request;
                    public static encode(message: berty.types.v1.AppMessageSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.AppMessageSend.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AppMessageSend.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AppMessageSend.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.AppMessageSend.Request;
                    public static toObject(message: berty.types.v1.AppMessageSend.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.AppMessageSend.IReply): berty.types.v1.AppMessageSend.Reply;
                    public static encode(message: berty.types.v1.AppMessageSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.AppMessageSend.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.AppMessageSend.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.AppMessageSend.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.AppMessageSend.Reply;
                    public static toObject(message: berty.types.v1.AppMessageSend.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IGroupMetadataEvent {
                eventContext?: (berty.types.v1.IEventContext|null);
                metadata?: (berty.types.v1.IGroupMetadata|null);
                event?: (Uint8Array|null);
            }

            class GroupMetadataEvent implements IGroupMetadataEvent {

                public eventContext?: (berty.types.v1.IEventContext|null);
                public metadata?: (berty.types.v1.IGroupMetadata|null);
                public event: Uint8Array;
                public static create(properties?: berty.types.v1.IGroupMetadataEvent): berty.types.v1.GroupMetadataEvent;
                public static encode(message: berty.types.v1.IGroupMetadataEvent, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroupMetadataEvent, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupMetadataEvent;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupMetadataEvent;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupMetadataEvent;
                public static toObject(message: berty.types.v1.GroupMetadataEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IGroupMessageEvent {
                eventContext?: (berty.types.v1.IEventContext|null);
                headers?: (berty.types.v1.IMessageHeaders|null);
                message?: (Uint8Array|null);
            }

            class GroupMessageEvent implements IGroupMessageEvent {

                public eventContext?: (berty.types.v1.IEventContext|null);
                public headers?: (berty.types.v1.IMessageHeaders|null);
                public message: Uint8Array;
                public static create(properties?: berty.types.v1.IGroupMessageEvent): berty.types.v1.GroupMessageEvent;
                public static encode(message: berty.types.v1.IGroupMessageEvent, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroupMessageEvent, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupMessageEvent;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupMessageEvent;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupMessageEvent;
                public static toObject(message: berty.types.v1.GroupMessageEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IGroupMetadataSubscribe {
            }

            class GroupMetadataSubscribe implements IGroupMetadataSubscribe {

                public static create(properties?: berty.types.v1.IGroupMetadataSubscribe): berty.types.v1.GroupMetadataSubscribe;
                public static encode(message: berty.types.v1.IGroupMetadataSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroupMetadataSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupMetadataSubscribe;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupMetadataSubscribe;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupMetadataSubscribe;
                public static toObject(message: berty.types.v1.GroupMetadataSubscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace GroupMetadataSubscribe {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                    since?: (Uint8Array|null);
                    until?: (Uint8Array|null);
                    goBackwards?: (boolean|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public since: Uint8Array;
                    public until: Uint8Array;
                    public goBackwards: boolean;
                    public static create(properties?: berty.types.v1.GroupMetadataSubscribe.IRequest): berty.types.v1.GroupMetadataSubscribe.Request;
                    public static encode(message: berty.types.v1.GroupMetadataSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.GroupMetadataSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupMetadataSubscribe.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupMetadataSubscribe.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupMetadataSubscribe.Request;
                    public static toObject(message: berty.types.v1.GroupMetadataSubscribe.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IGroupMetadataList {
            }

            class GroupMetadataList implements IGroupMetadataList {

                public static create(properties?: berty.types.v1.IGroupMetadataList): berty.types.v1.GroupMetadataList;
                public static encode(message: berty.types.v1.IGroupMetadataList, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroupMetadataList, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupMetadataList;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupMetadataList;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupMetadataList;
                public static toObject(message: berty.types.v1.GroupMetadataList, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace GroupMetadataList {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public static create(properties?: berty.types.v1.GroupMetadataList.IRequest): berty.types.v1.GroupMetadataList.Request;
                    public static encode(message: berty.types.v1.GroupMetadataList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.GroupMetadataList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupMetadataList.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupMetadataList.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupMetadataList.Request;
                    public static toObject(message: berty.types.v1.GroupMetadataList.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IGroupMessageSubscribe {
            }

            class GroupMessageSubscribe implements IGroupMessageSubscribe {

                public static create(properties?: berty.types.v1.IGroupMessageSubscribe): berty.types.v1.GroupMessageSubscribe;
                public static encode(message: berty.types.v1.IGroupMessageSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroupMessageSubscribe, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupMessageSubscribe;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupMessageSubscribe;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupMessageSubscribe;
                public static toObject(message: berty.types.v1.GroupMessageSubscribe, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace GroupMessageSubscribe {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                    since?: (Uint8Array|null);
                    until?: (Uint8Array|null);
                    goBackwards?: (boolean|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public since: Uint8Array;
                    public until: Uint8Array;
                    public goBackwards: boolean;
                    public static create(properties?: berty.types.v1.GroupMessageSubscribe.IRequest): berty.types.v1.GroupMessageSubscribe.Request;
                    public static encode(message: berty.types.v1.GroupMessageSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.GroupMessageSubscribe.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupMessageSubscribe.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupMessageSubscribe.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupMessageSubscribe.Request;
                    public static toObject(message: berty.types.v1.GroupMessageSubscribe.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IGroupMessageList {
            }

            class GroupMessageList implements IGroupMessageList {

                public static create(properties?: berty.types.v1.IGroupMessageList): berty.types.v1.GroupMessageList;
                public static encode(message: berty.types.v1.IGroupMessageList, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroupMessageList, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupMessageList;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupMessageList;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupMessageList;
                public static toObject(message: berty.types.v1.GroupMessageList, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace GroupMessageList {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public static create(properties?: berty.types.v1.GroupMessageList.IRequest): berty.types.v1.GroupMessageList.Request;
                    public static encode(message: berty.types.v1.GroupMessageList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.GroupMessageList.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupMessageList.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupMessageList.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupMessageList.Request;
                    public static toObject(message: berty.types.v1.GroupMessageList.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IGroupInfo {
            }

            class GroupInfo implements IGroupInfo {

                public static create(properties?: berty.types.v1.IGroupInfo): berty.types.v1.GroupInfo;
                public static encode(message: berty.types.v1.IGroupInfo, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IGroupInfo, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupInfo;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupInfo;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupInfo;
                public static toObject(message: berty.types.v1.GroupInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace GroupInfo {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                    contactPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public contactPk: Uint8Array;
                    public static create(properties?: berty.types.v1.GroupInfo.IRequest): berty.types.v1.GroupInfo.Request;
                    public static encode(message: berty.types.v1.GroupInfo.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.GroupInfo.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupInfo.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupInfo.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupInfo.Request;
                    public static toObject(message: berty.types.v1.GroupInfo.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    group?: (berty.types.v1.IGroup|null);
                    memberPk?: (Uint8Array|null);
                    devicePk?: (Uint8Array|null);
                }

                class Reply implements IReply {

                    public group?: (berty.types.v1.IGroup|null);
                    public memberPk: Uint8Array;
                    public devicePk: Uint8Array;
                    public static create(properties?: berty.types.v1.GroupInfo.IReply): berty.types.v1.GroupInfo.Reply;
                    public static encode(message: berty.types.v1.GroupInfo.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.GroupInfo.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.GroupInfo.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.GroupInfo.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.GroupInfo.Reply;
                    public static toObject(message: berty.types.v1.GroupInfo.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IActivateGroup {
            }

            class ActivateGroup implements IActivateGroup {

                public static create(properties?: berty.types.v1.IActivateGroup): berty.types.v1.ActivateGroup;
                public static encode(message: berty.types.v1.IActivateGroup, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IActivateGroup, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ActivateGroup;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ActivateGroup;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.ActivateGroup;
                public static toObject(message: berty.types.v1.ActivateGroup, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ActivateGroup {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public static create(properties?: berty.types.v1.ActivateGroup.IRequest): berty.types.v1.ActivateGroup.Request;
                    public static encode(message: berty.types.v1.ActivateGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ActivateGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ActivateGroup.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ActivateGroup.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ActivateGroup.Request;
                    public static toObject(message: berty.types.v1.ActivateGroup.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.ActivateGroup.IReply): berty.types.v1.ActivateGroup.Reply;
                    public static encode(message: berty.types.v1.ActivateGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.ActivateGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ActivateGroup.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ActivateGroup.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.ActivateGroup.Reply;
                    public static toObject(message: berty.types.v1.ActivateGroup.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IDeactivateGroup {
            }

            class DeactivateGroup implements IDeactivateGroup {

                public static create(properties?: berty.types.v1.IDeactivateGroup): berty.types.v1.DeactivateGroup;
                public static encode(message: berty.types.v1.IDeactivateGroup, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IDeactivateGroup, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.DeactivateGroup;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.DeactivateGroup;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.DeactivateGroup;
                public static toObject(message: berty.types.v1.DeactivateGroup, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace DeactivateGroup {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public static create(properties?: berty.types.v1.DeactivateGroup.IRequest): berty.types.v1.DeactivateGroup.Request;
                    public static encode(message: berty.types.v1.DeactivateGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.DeactivateGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.DeactivateGroup.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.DeactivateGroup.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.DeactivateGroup.Request;
                    public static toObject(message: berty.types.v1.DeactivateGroup.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.types.v1.DeactivateGroup.IReply): berty.types.v1.DeactivateGroup.Reply;
                    public static encode(message: berty.types.v1.DeactivateGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.DeactivateGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.DeactivateGroup.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.DeactivateGroup.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.DeactivateGroup.Reply;
                    public static toObject(message: berty.types.v1.DeactivateGroup.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IDebugListGroups {
            }

            class DebugListGroups implements IDebugListGroups {

                public static create(properties?: berty.types.v1.IDebugListGroups): berty.types.v1.DebugListGroups;
                public static encode(message: berty.types.v1.IDebugListGroups, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IDebugListGroups, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.DebugListGroups;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.DebugListGroups;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.DebugListGroups;
                public static toObject(message: berty.types.v1.DebugListGroups, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace DebugListGroups {

                interface IRequest {
                }

                class Request implements IRequest {

                    public static create(properties?: berty.types.v1.DebugListGroups.IRequest): berty.types.v1.DebugListGroups.Request;
                    public static encode(message: berty.types.v1.DebugListGroups.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.DebugListGroups.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.DebugListGroups.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.DebugListGroups.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.DebugListGroups.Request;
                    public static toObject(message: berty.types.v1.DebugListGroups.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    groupPk?: (Uint8Array|null);
                    groupType?: (berty.types.v1.GroupType|null);
                    contactPk?: (Uint8Array|null);
                }

                class Reply implements IReply {

                    public groupPk: Uint8Array;
                    public groupType: berty.types.v1.GroupType;
                    public contactPk: Uint8Array;
                    public static create(properties?: berty.types.v1.DebugListGroups.IReply): berty.types.v1.DebugListGroups.Reply;
                    public static encode(message: berty.types.v1.DebugListGroups.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.DebugListGroups.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.DebugListGroups.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.DebugListGroups.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.DebugListGroups.Reply;
                    public static toObject(message: berty.types.v1.DebugListGroups.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IDebugInspectGroupStore {
            }

            class DebugInspectGroupStore implements IDebugInspectGroupStore {

                public static create(properties?: berty.types.v1.IDebugInspectGroupStore): berty.types.v1.DebugInspectGroupStore;
                public static encode(message: berty.types.v1.IDebugInspectGroupStore, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IDebugInspectGroupStore, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.DebugInspectGroupStore;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.DebugInspectGroupStore;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.DebugInspectGroupStore;
                public static toObject(message: berty.types.v1.DebugInspectGroupStore, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace DebugInspectGroupStore {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                    logType?: (berty.types.v1.DebugInspectGroupLogType|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public logType: berty.types.v1.DebugInspectGroupLogType;
                    public static create(properties?: berty.types.v1.DebugInspectGroupStore.IRequest): berty.types.v1.DebugInspectGroupStore.Request;
                    public static encode(message: berty.types.v1.DebugInspectGroupStore.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.DebugInspectGroupStore.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.DebugInspectGroupStore.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.DebugInspectGroupStore.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.DebugInspectGroupStore.Request;
                    public static toObject(message: berty.types.v1.DebugInspectGroupStore.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    cid?: (Uint8Array|null);
                    parentCids?: (Uint8Array[]|null);
                    metadataEventType?: (berty.types.v1.EventType|null);
                    devicePk?: (Uint8Array|null);
                    payload?: (Uint8Array|null);
                }

                class Reply implements IReply {

                    public cid: Uint8Array;
                    public parentCids: Uint8Array[];
                    public metadataEventType: berty.types.v1.EventType;
                    public devicePk: Uint8Array;
                    public payload: Uint8Array;
                    public static create(properties?: berty.types.v1.DebugInspectGroupStore.IReply): berty.types.v1.DebugInspectGroupStore.Reply;
                    public static encode(message: berty.types.v1.DebugInspectGroupStore.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.DebugInspectGroupStore.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.DebugInspectGroupStore.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.DebugInspectGroupStore.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.DebugInspectGroupStore.Reply;
                    public static toObject(message: berty.types.v1.DebugInspectGroupStore.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IDebugGroup {
            }

            class DebugGroup implements IDebugGroup {

                public static create(properties?: berty.types.v1.IDebugGroup): berty.types.v1.DebugGroup;
                public static encode(message: berty.types.v1.IDebugGroup, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IDebugGroup, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.DebugGroup;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.DebugGroup;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.DebugGroup;
                public static toObject(message: berty.types.v1.DebugGroup, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace DebugGroup {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public static create(properties?: berty.types.v1.DebugGroup.IRequest): berty.types.v1.DebugGroup.Request;
                    public static encode(message: berty.types.v1.DebugGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.DebugGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.DebugGroup.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.DebugGroup.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.DebugGroup.Request;
                    public static toObject(message: berty.types.v1.DebugGroup.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    peerIds?: (string[]|null);
                }

                class Reply implements IReply {

                    public peerIds: string[];
                    public static create(properties?: berty.types.v1.DebugGroup.IReply): berty.types.v1.DebugGroup.Reply;
                    public static encode(message: berty.types.v1.DebugGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.types.v1.DebugGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.DebugGroup.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.DebugGroup.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.types.v1.DebugGroup.Reply;
                    public static toObject(message: berty.types.v1.DebugGroup.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            enum DebugInspectGroupLogType {
                DebugInspectGroupLogTypeUndefined = 0,
                DebugInspectGroupLogTypeMessage = 1,
                DebugInspectGroupLogTypeMetadata = 2
            }

            enum ContactState {
                ContactStateUndefined = 0,
                ContactStateToRequest = 1,
                ContactStateReceived = 2,
                ContactStateAdded = 3,
                ContactStateRemoved = 4,
                ContactStateDiscarded = 5,
                ContactStateBlocked = 6
            }

            interface IShareableContact {
                pk?: (Uint8Array|null);
                publicRendezvousSeed?: (Uint8Array|null);
                metadata?: (Uint8Array|null);
            }

            class ShareableContact implements IShareableContact {

                public pk: Uint8Array;
                public publicRendezvousSeed: Uint8Array;
                public metadata: Uint8Array;
                public static create(properties?: berty.types.v1.IShareableContact): berty.types.v1.ShareableContact;
                public static encode(message: berty.types.v1.IShareableContact, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.types.v1.IShareableContact, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.types.v1.ShareableContact;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.types.v1.ShareableContact;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.types.v1.ShareableContact;
                public static toObject(message: berty.types.v1.ShareableContact, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }
    }

    namespace messenger {

        namespace v1 {

            class MessengerService extends $protobuf.rpc.Service {

                public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): MessengerService;
                public instanceShareableBertyID(request: berty.messenger.v1.InstanceShareableBertyID.IRequest, callback: berty.messenger.v1.MessengerService.InstanceShareableBertyIDCallback): void;
                public instanceShareableBertyID(request: berty.messenger.v1.InstanceShareableBertyID.IRequest): Promise<berty.messenger.v1.InstanceShareableBertyID.Reply>;
                public shareableBertyGroup(request: berty.messenger.v1.ShareableBertyGroup.IRequest, callback: berty.messenger.v1.MessengerService.ShareableBertyGroupCallback): void;
                public shareableBertyGroup(request: berty.messenger.v1.ShareableBertyGroup.IRequest): Promise<berty.messenger.v1.ShareableBertyGroup.Reply>;
                public devShareInstanceBertyID(request: berty.messenger.v1.DevShareInstanceBertyID.IRequest, callback: berty.messenger.v1.MessengerService.DevShareInstanceBertyIDCallback): void;
                public devShareInstanceBertyID(request: berty.messenger.v1.DevShareInstanceBertyID.IRequest): Promise<berty.messenger.v1.DevShareInstanceBertyID.Reply>;
                public parseDeepLink(request: berty.messenger.v1.ParseDeepLink.IRequest, callback: berty.messenger.v1.MessengerService.ParseDeepLinkCallback): void;
                public parseDeepLink(request: berty.messenger.v1.ParseDeepLink.IRequest): Promise<berty.messenger.v1.ParseDeepLink.Reply>;
                public sendContactRequest(request: berty.messenger.v1.SendContactRequest.IRequest, callback: berty.messenger.v1.MessengerService.SendContactRequestCallback): void;
                public sendContactRequest(request: berty.messenger.v1.SendContactRequest.IRequest): Promise<berty.messenger.v1.SendContactRequest.Reply>;
                public sendMessage(request: berty.messenger.v1.SendMessage.IRequest, callback: berty.messenger.v1.MessengerService.SendMessageCallback): void;
                public sendMessage(request: berty.messenger.v1.SendMessage.IRequest): Promise<berty.messenger.v1.SendMessage.Reply>;
                public sendAck(request: berty.messenger.v1.SendAck.IRequest, callback: berty.messenger.v1.MessengerService.SendAckCallback): void;
                public sendAck(request: berty.messenger.v1.SendAck.IRequest): Promise<berty.messenger.v1.SendAck.Reply>;
                public systemInfo(request: berty.messenger.v1.SystemInfo.IRequest, callback: berty.messenger.v1.MessengerService.SystemInfoCallback): void;
                public systemInfo(request: berty.messenger.v1.SystemInfo.IRequest): Promise<berty.messenger.v1.SystemInfo.Reply>;
                public conversationStream(request: berty.messenger.v1.ConversationStream.IRequest, callback: berty.messenger.v1.MessengerService.ConversationStreamCallback): void;
                public conversationStream(request: berty.messenger.v1.ConversationStream.IRequest): Promise<berty.messenger.v1.ConversationStream.Reply>;
                public eventStream(request: berty.messenger.v1.EventStream.IRequest, callback: berty.messenger.v1.MessengerService.EventStreamCallback): void;
                public eventStream(request: berty.messenger.v1.EventStream.IRequest): Promise<berty.messenger.v1.EventStream.Reply>;
                public conversationCreate(request: berty.messenger.v1.ConversationCreate.IRequest, callback: berty.messenger.v1.MessengerService.ConversationCreateCallback): void;
                public conversationCreate(request: berty.messenger.v1.ConversationCreate.IRequest): Promise<berty.messenger.v1.ConversationCreate.Reply>;
                public accountGet(request: berty.messenger.v1.AccountGet.IRequest, callback: berty.messenger.v1.MessengerService.AccountGetCallback): void;
                public accountGet(request: berty.messenger.v1.AccountGet.IRequest): Promise<berty.messenger.v1.AccountGet.Reply>;
            }

            namespace MessengerService {

                type InstanceShareableBertyIDCallback = (error: (Error|null), response?: berty.messenger.v1.InstanceShareableBertyID.Reply) => void;

                type ShareableBertyGroupCallback = (error: (Error|null), response?: berty.messenger.v1.ShareableBertyGroup.Reply) => void;

                type DevShareInstanceBertyIDCallback = (error: (Error|null), response?: berty.messenger.v1.DevShareInstanceBertyID.Reply) => void;

                type ParseDeepLinkCallback = (error: (Error|null), response?: berty.messenger.v1.ParseDeepLink.Reply) => void;

                type SendContactRequestCallback = (error: (Error|null), response?: berty.messenger.v1.SendContactRequest.Reply) => void;

                type SendMessageCallback = (error: (Error|null), response?: berty.messenger.v1.SendMessage.Reply) => void;

                type SendAckCallback = (error: (Error|null), response?: berty.messenger.v1.SendAck.Reply) => void;

                type SystemInfoCallback = (error: (Error|null), response?: berty.messenger.v1.SystemInfo.Reply) => void;

                type ConversationStreamCallback = (error: (Error|null), response?: berty.messenger.v1.ConversationStream.Reply) => void;

                type EventStreamCallback = (error: (Error|null), response?: berty.messenger.v1.EventStream.Reply) => void;

                type ConversationCreateCallback = (error: (Error|null), response?: berty.messenger.v1.ConversationCreate.Reply) => void;

                type AccountGetCallback = (error: (Error|null), response?: berty.messenger.v1.AccountGet.Reply) => void;
            }

            interface IInstanceShareableBertyID {
            }

            class InstanceShareableBertyID implements IInstanceShareableBertyID {

                public static create(properties?: berty.messenger.v1.IInstanceShareableBertyID): berty.messenger.v1.InstanceShareableBertyID;
                public static encode(message: berty.messenger.v1.IInstanceShareableBertyID, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IInstanceShareableBertyID, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.InstanceShareableBertyID;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.InstanceShareableBertyID;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.InstanceShareableBertyID;
                public static toObject(message: berty.messenger.v1.InstanceShareableBertyID, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace InstanceShareableBertyID {

                interface IRequest {
                    reset?: (boolean|null);
                    displayName?: (string|null);
                }

                class Request implements IRequest {

                    public reset: boolean;
                    public displayName: string;
                    public static create(properties?: berty.messenger.v1.InstanceShareableBertyID.IRequest): berty.messenger.v1.InstanceShareableBertyID.Request;
                    public static encode(message: berty.messenger.v1.InstanceShareableBertyID.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.InstanceShareableBertyID.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.InstanceShareableBertyID.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.InstanceShareableBertyID.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.InstanceShareableBertyID.Request;
                    public static toObject(message: berty.messenger.v1.InstanceShareableBertyID.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    bertyId?: (berty.messenger.v1.IBertyID|null);
                    bertyIdPayload?: (string|null);
                    deepLink?: (string|null);
                    htmlUrl?: (string|null);
                }

                class Reply implements IReply {

                    public bertyId?: (berty.messenger.v1.IBertyID|null);
                    public bertyIdPayload: string;
                    public deepLink: string;
                    public htmlUrl: string;
                    public static create(properties?: berty.messenger.v1.InstanceShareableBertyID.IReply): berty.messenger.v1.InstanceShareableBertyID.Reply;
                    public static encode(message: berty.messenger.v1.InstanceShareableBertyID.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.InstanceShareableBertyID.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.InstanceShareableBertyID.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.InstanceShareableBertyID.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.InstanceShareableBertyID.Reply;
                    public static toObject(message: berty.messenger.v1.InstanceShareableBertyID.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IShareableBertyGroup {
            }

            class ShareableBertyGroup implements IShareableBertyGroup {

                public static create(properties?: berty.messenger.v1.IShareableBertyGroup): berty.messenger.v1.ShareableBertyGroup;
                public static encode(message: berty.messenger.v1.IShareableBertyGroup, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IShareableBertyGroup, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.ShareableBertyGroup;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.ShareableBertyGroup;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.ShareableBertyGroup;
                public static toObject(message: berty.messenger.v1.ShareableBertyGroup, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ShareableBertyGroup {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                    groupName?: (string|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public groupName: string;
                    public static create(properties?: berty.messenger.v1.ShareableBertyGroup.IRequest): berty.messenger.v1.ShareableBertyGroup.Request;
                    public static encode(message: berty.messenger.v1.ShareableBertyGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.ShareableBertyGroup.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.ShareableBertyGroup.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.ShareableBertyGroup.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.ShareableBertyGroup.Request;
                    public static toObject(message: berty.messenger.v1.ShareableBertyGroup.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    bertyGroup?: (berty.messenger.v1.IBertyGroup|null);
                    bertyGroupPayload?: (string|null);
                    deepLink?: (string|null);
                    htmlUrl?: (string|null);
                }

                class Reply implements IReply {

                    public bertyGroup?: (berty.messenger.v1.IBertyGroup|null);
                    public bertyGroupPayload: string;
                    public deepLink: string;
                    public htmlUrl: string;
                    public static create(properties?: berty.messenger.v1.ShareableBertyGroup.IReply): berty.messenger.v1.ShareableBertyGroup.Reply;
                    public static encode(message: berty.messenger.v1.ShareableBertyGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.ShareableBertyGroup.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.ShareableBertyGroup.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.ShareableBertyGroup.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.ShareableBertyGroup.Reply;
                    public static toObject(message: berty.messenger.v1.ShareableBertyGroup.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IDevShareInstanceBertyID {
            }

            class DevShareInstanceBertyID implements IDevShareInstanceBertyID {

                public static create(properties?: berty.messenger.v1.IDevShareInstanceBertyID): berty.messenger.v1.DevShareInstanceBertyID;
                public static encode(message: berty.messenger.v1.IDevShareInstanceBertyID, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IDevShareInstanceBertyID, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.DevShareInstanceBertyID;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.DevShareInstanceBertyID;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.DevShareInstanceBertyID;
                public static toObject(message: berty.messenger.v1.DevShareInstanceBertyID, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace DevShareInstanceBertyID {

                interface IRequest {
                    reset?: (boolean|null);
                    displayName?: (string|null);
                }

                class Request implements IRequest {

                    public reset: boolean;
                    public displayName: string;
                    public static create(properties?: berty.messenger.v1.DevShareInstanceBertyID.IRequest): berty.messenger.v1.DevShareInstanceBertyID.Request;
                    public static encode(message: berty.messenger.v1.DevShareInstanceBertyID.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.DevShareInstanceBertyID.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.DevShareInstanceBertyID.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.DevShareInstanceBertyID.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.DevShareInstanceBertyID.Request;
                    public static toObject(message: berty.messenger.v1.DevShareInstanceBertyID.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.messenger.v1.DevShareInstanceBertyID.IReply): berty.messenger.v1.DevShareInstanceBertyID.Reply;
                    public static encode(message: berty.messenger.v1.DevShareInstanceBertyID.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.DevShareInstanceBertyID.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.DevShareInstanceBertyID.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.DevShareInstanceBertyID.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.DevShareInstanceBertyID.Reply;
                    public static toObject(message: berty.messenger.v1.DevShareInstanceBertyID.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IParseDeepLink {
            }

            class ParseDeepLink implements IParseDeepLink {

                public static create(properties?: berty.messenger.v1.IParseDeepLink): berty.messenger.v1.ParseDeepLink;
                public static encode(message: berty.messenger.v1.IParseDeepLink, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IParseDeepLink, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.ParseDeepLink;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.ParseDeepLink;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.ParseDeepLink;
                public static toObject(message: berty.messenger.v1.ParseDeepLink, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ParseDeepLink {

                interface IRequest {
                    link?: (string|null);
                }

                class Request implements IRequest {

                    public link: string;
                    public static create(properties?: berty.messenger.v1.ParseDeepLink.IRequest): berty.messenger.v1.ParseDeepLink.Request;
                    public static encode(message: berty.messenger.v1.ParseDeepLink.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.ParseDeepLink.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.ParseDeepLink.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.ParseDeepLink.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.ParseDeepLink.Request;
                    public static toObject(message: berty.messenger.v1.ParseDeepLink.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    kind?: (berty.messenger.v1.ParseDeepLink.Kind|null);
                    bertyId?: (berty.messenger.v1.IBertyID|null);
                    bertyGroup?: (berty.messenger.v1.IBertyGroup|null);
                }

                class Reply implements IReply {

                    public kind: berty.messenger.v1.ParseDeepLink.Kind;
                    public bertyId?: (berty.messenger.v1.IBertyID|null);
                    public bertyGroup?: (berty.messenger.v1.IBertyGroup|null);
                    public static create(properties?: berty.messenger.v1.ParseDeepLink.IReply): berty.messenger.v1.ParseDeepLink.Reply;
                    public static encode(message: berty.messenger.v1.ParseDeepLink.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.ParseDeepLink.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.ParseDeepLink.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.ParseDeepLink.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.ParseDeepLink.Reply;
                    public static toObject(message: berty.messenger.v1.ParseDeepLink.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                enum Kind {
                    UnknownKind = 0,
                    BertyID = 1,
                    BertyGroup = 2
                }
            }

            interface ISendContactRequest {
            }

            class SendContactRequest implements ISendContactRequest {

                public static create(properties?: berty.messenger.v1.ISendContactRequest): berty.messenger.v1.SendContactRequest;
                public static encode(message: berty.messenger.v1.ISendContactRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.ISendContactRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.SendContactRequest;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.SendContactRequest;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.SendContactRequest;
                public static toObject(message: berty.messenger.v1.SendContactRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace SendContactRequest {

                interface IRequest {
                    bertyId?: (berty.messenger.v1.IBertyID|null);
                    metadata?: (Uint8Array|null);
                    ownMetadata?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public bertyId?: (berty.messenger.v1.IBertyID|null);
                    public metadata: Uint8Array;
                    public ownMetadata: Uint8Array;
                    public static create(properties?: berty.messenger.v1.SendContactRequest.IRequest): berty.messenger.v1.SendContactRequest.Request;
                    public static encode(message: berty.messenger.v1.SendContactRequest.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.SendContactRequest.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.SendContactRequest.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.SendContactRequest.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.SendContactRequest.Request;
                    public static toObject(message: berty.messenger.v1.SendContactRequest.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.messenger.v1.SendContactRequest.IReply): berty.messenger.v1.SendContactRequest.Reply;
                    public static encode(message: berty.messenger.v1.SendContactRequest.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.SendContactRequest.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.SendContactRequest.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.SendContactRequest.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.SendContactRequest.Reply;
                    public static toObject(message: berty.messenger.v1.SendContactRequest.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface ISendAck {
            }

            class SendAck implements ISendAck {

                public static create(properties?: berty.messenger.v1.ISendAck): berty.messenger.v1.SendAck;
                public static encode(message: berty.messenger.v1.ISendAck, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.ISendAck, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.SendAck;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.SendAck;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.SendAck;
                public static toObject(message: berty.messenger.v1.SendAck, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace SendAck {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                    messageId?: (Uint8Array|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public messageId: Uint8Array;
                    public static create(properties?: berty.messenger.v1.SendAck.IRequest): berty.messenger.v1.SendAck.Request;
                    public static encode(message: berty.messenger.v1.SendAck.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.SendAck.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.SendAck.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.SendAck.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.SendAck.Request;
                    public static toObject(message: berty.messenger.v1.SendAck.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.messenger.v1.SendAck.IReply): berty.messenger.v1.SendAck.Reply;
                    public static encode(message: berty.messenger.v1.SendAck.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.SendAck.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.SendAck.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.SendAck.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.SendAck.Reply;
                    public static toObject(message: berty.messenger.v1.SendAck.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface ISendMessage {
            }

            class SendMessage implements ISendMessage {

                public static create(properties?: berty.messenger.v1.ISendMessage): berty.messenger.v1.SendMessage;
                public static encode(message: berty.messenger.v1.ISendMessage, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.ISendMessage, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.SendMessage;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.SendMessage;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.SendMessage;
                public static toObject(message: berty.messenger.v1.SendMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace SendMessage {

                interface IRequest {
                    groupPk?: (Uint8Array|null);
                    message?: (string|null);
                }

                class Request implements IRequest {

                    public groupPk: Uint8Array;
                    public message: string;
                    public static create(properties?: berty.messenger.v1.SendMessage.IRequest): berty.messenger.v1.SendMessage.Request;
                    public static encode(message: berty.messenger.v1.SendMessage.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.SendMessage.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.SendMessage.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.SendMessage.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.SendMessage.Request;
                    public static toObject(message: berty.messenger.v1.SendMessage.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                }

                class Reply implements IReply {

                    public static create(properties?: berty.messenger.v1.SendMessage.IReply): berty.messenger.v1.SendMessage.Reply;
                    public static encode(message: berty.messenger.v1.SendMessage.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.SendMessage.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.SendMessage.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.SendMessage.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.SendMessage.Reply;
                    public static toObject(message: berty.messenger.v1.SendMessage.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IBertyID {
                publicRendezvousSeed?: (Uint8Array|null);
                accountPk?: (Uint8Array|null);
                displayName?: (string|null);
            }

            class BertyID implements IBertyID {

                public publicRendezvousSeed: Uint8Array;
                public accountPk: Uint8Array;
                public displayName: string;
                public static create(properties?: berty.messenger.v1.IBertyID): berty.messenger.v1.BertyID;
                public static encode(message: berty.messenger.v1.IBertyID, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IBertyID, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.BertyID;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.BertyID;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.BertyID;
                public static toObject(message: berty.messenger.v1.BertyID, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IBertyGroup {
                group?: (berty.types.v1.IGroup|null);
                displayName?: (string|null);
            }

            class BertyGroup implements IBertyGroup {

                public group?: (berty.types.v1.IGroup|null);
                public displayName: string;
                public static create(properties?: berty.messenger.v1.IBertyGroup): berty.messenger.v1.BertyGroup;
                public static encode(message: berty.messenger.v1.IBertyGroup, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IBertyGroup, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.BertyGroup;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.BertyGroup;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.BertyGroup;
                public static toObject(message: berty.messenger.v1.BertyGroup, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IUserMessageAttachment {
                uri?: (string|null);
            }

            class UserMessageAttachment implements IUserMessageAttachment {

                public uri: string;
                public static create(properties?: berty.messenger.v1.IUserMessageAttachment): berty.messenger.v1.UserMessageAttachment;
                public static encode(message: berty.messenger.v1.IUserMessageAttachment, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IUserMessageAttachment, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.UserMessageAttachment;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.UserMessageAttachment;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.UserMessageAttachment;
                public static toObject(message: berty.messenger.v1.UserMessageAttachment, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IAppMessage {
                type?: (berty.messenger.v1.AppMessage.Type|null);
                payload?: (Uint8Array|null);
            }

            class AppMessage implements IAppMessage {

                public type: berty.messenger.v1.AppMessage.Type;
                public payload: Uint8Array;
                public static create(properties?: berty.messenger.v1.IAppMessage): berty.messenger.v1.AppMessage;
                public static encode(message: berty.messenger.v1.IAppMessage, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IAppMessage, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.AppMessage;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.AppMessage;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.AppMessage;
                public static toObject(message: berty.messenger.v1.AppMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace AppMessage {

                enum Type {
                    TypeUndefined = 0,
                    TypeUserMessage = 1,
                    TypeUserReaction = 2,
                    TypeGroupInvitation = 3,
                    TypeSetGroupName = 4,
                    TypeSetUserName = 5,
                    TypeAcknowledge = 6
                }

                interface IUserMessage {
                    body?: (string|null);
                    attachments?: (berty.messenger.v1.IUserMessageAttachment[]|null);
                    sentDate?: (number|Long|null);
                }

                class UserMessage implements IUserMessage {

                    public body: string;
                    public attachments: berty.messenger.v1.IUserMessageAttachment[];
                    public sentDate: (number|Long);
                    public static create(properties?: berty.messenger.v1.AppMessage.IUserMessage): berty.messenger.v1.AppMessage.UserMessage;
                    public static encode(message: berty.messenger.v1.AppMessage.IUserMessage, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.AppMessage.IUserMessage, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.AppMessage.UserMessage;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.AppMessage.UserMessage;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.AppMessage.UserMessage;
                    public static toObject(message: berty.messenger.v1.AppMessage.UserMessage, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IUserReaction {
                    emoji?: (string|null);
                }

                class UserReaction implements IUserReaction {

                    public emoji: string;
                    public static create(properties?: berty.messenger.v1.AppMessage.IUserReaction): berty.messenger.v1.AppMessage.UserReaction;
                    public static encode(message: berty.messenger.v1.AppMessage.IUserReaction, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.AppMessage.IUserReaction, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.AppMessage.UserReaction;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.AppMessage.UserReaction;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.AppMessage.UserReaction;
                    public static toObject(message: berty.messenger.v1.AppMessage.UserReaction, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IGroupInvitation {
                    groupPk?: (string|null);
                }

                class GroupInvitation implements IGroupInvitation {

                    public groupPk: string;
                    public static create(properties?: berty.messenger.v1.AppMessage.IGroupInvitation): berty.messenger.v1.AppMessage.GroupInvitation;
                    public static encode(message: berty.messenger.v1.AppMessage.IGroupInvitation, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.AppMessage.IGroupInvitation, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.AppMessage.GroupInvitation;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.AppMessage.GroupInvitation;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.AppMessage.GroupInvitation;
                    public static toObject(message: berty.messenger.v1.AppMessage.GroupInvitation, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface ISetGroupName {
                    name?: (string|null);
                }

                class SetGroupName implements ISetGroupName {

                    public name: string;
                    public static create(properties?: berty.messenger.v1.AppMessage.ISetGroupName): berty.messenger.v1.AppMessage.SetGroupName;
                    public static encode(message: berty.messenger.v1.AppMessage.ISetGroupName, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.AppMessage.ISetGroupName, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.AppMessage.SetGroupName;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.AppMessage.SetGroupName;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.AppMessage.SetGroupName;
                    public static toObject(message: berty.messenger.v1.AppMessage.SetGroupName, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface ISetUserName {
                    name?: (string|null);
                }

                class SetUserName implements ISetUserName {

                    public name: string;
                    public static create(properties?: berty.messenger.v1.AppMessage.ISetUserName): berty.messenger.v1.AppMessage.SetUserName;
                    public static encode(message: berty.messenger.v1.AppMessage.ISetUserName, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.AppMessage.ISetUserName, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.AppMessage.SetUserName;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.AppMessage.SetUserName;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.AppMessage.SetUserName;
                    public static toObject(message: berty.messenger.v1.AppMessage.SetUserName, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IAcknowledge {
                    target?: (string|null);
                }

                class Acknowledge implements IAcknowledge {

                    public target: string;
                    public static create(properties?: berty.messenger.v1.AppMessage.IAcknowledge): berty.messenger.v1.AppMessage.Acknowledge;
                    public static encode(message: berty.messenger.v1.AppMessage.IAcknowledge, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.AppMessage.IAcknowledge, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.AppMessage.Acknowledge;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.AppMessage.Acknowledge;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.AppMessage.Acknowledge;
                    public static toObject(message: berty.messenger.v1.AppMessage.Acknowledge, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface ISystemInfo {
            }

            class SystemInfo implements ISystemInfo {

                public static create(properties?: berty.messenger.v1.ISystemInfo): berty.messenger.v1.SystemInfo;
                public static encode(message: berty.messenger.v1.ISystemInfo, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.ISystemInfo, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.SystemInfo;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.SystemInfo;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.SystemInfo;
                public static toObject(message: berty.messenger.v1.SystemInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace SystemInfo {

                interface IRequest {
                }

                class Request implements IRequest {

                    public static create(properties?: berty.messenger.v1.SystemInfo.IRequest): berty.messenger.v1.SystemInfo.Request;
                    public static encode(message: berty.messenger.v1.SystemInfo.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.SystemInfo.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.SystemInfo.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.SystemInfo.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.SystemInfo.Request;
                    public static toObject(message: berty.messenger.v1.SystemInfo.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    rlimitCur?: (number|Long|null);
                    numGoroutine?: (number|Long|null);
                    connectedPeers?: (number|Long|null);
                    nofile?: (number|Long|null);
                    tooManyOpenFiles?: (boolean|null);
                    startedAt?: (number|Long|null);
                    numCpu?: (number|Long|null);
                    goVersion?: (string|null);
                    operatingSystem?: (string|null);
                    hostName?: (string|null);
                    arch?: (string|null);
                    version?: (string|null);
                    vcsRef?: (string|null);
                    buildTime?: (number|Long|null);
                    selfRusage?: (string|null);
                    childrenRusage?: (string|null);
                    rlimitMax?: (number|Long|null);
                }

                class Reply implements IReply {

                    public rlimitCur: (number|Long);
                    public numGoroutine: (number|Long);
                    public connectedPeers: (number|Long);
                    public nofile: (number|Long);
                    public tooManyOpenFiles: boolean;
                    public startedAt: (number|Long);
                    public numCpu: (number|Long);
                    public goVersion: string;
                    public operatingSystem: string;
                    public hostName: string;
                    public arch: string;
                    public version: string;
                    public vcsRef: string;
                    public buildTime: (number|Long);
                    public selfRusage: string;
                    public childrenRusage: string;
                    public rlimitMax: (number|Long);
                    public static create(properties?: berty.messenger.v1.SystemInfo.IReply): berty.messenger.v1.SystemInfo.Reply;
                    public static encode(message: berty.messenger.v1.SystemInfo.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.SystemInfo.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.SystemInfo.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.SystemInfo.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.SystemInfo.Reply;
                    public static toObject(message: berty.messenger.v1.SystemInfo.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IAccount {
                publicKey?: (string|null);
                displayName?: (string|null);
                state?: (berty.messenger.v1.Account.State|null);
            }

            class Account implements IAccount {

                public publicKey: string;
                public displayName: string;
                public state: berty.messenger.v1.Account.State;
                public static create(properties?: berty.messenger.v1.IAccount): berty.messenger.v1.Account;
                public static encode(message: berty.messenger.v1.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IAccount, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.Account;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.Account;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.Account;
                public static toObject(message: berty.messenger.v1.Account, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace Account {

                enum State {
                    Undefined = 0,
                    NotReady = 1,
                    Ready = 2
                }
            }

            interface IContact {
                publicKey?: (string|null);
                displayName?: (string|null);
                state?: (berty.messenger.v1.Contact.State|null);
            }

            class Contact implements IContact {

                public publicKey: string;
                public displayName: string;
                public state: berty.messenger.v1.Contact.State;
                public static create(properties?: berty.messenger.v1.IContact): berty.messenger.v1.Contact;
                public static encode(message: berty.messenger.v1.IContact, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IContact, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.Contact;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.Contact;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.Contact;
                public static toObject(message: berty.messenger.v1.Contact, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace Contact {

                enum State {
                    Undefined = 0,
                    IncomingRequest = 1,
                    OutgoingRequestEnqueued = 2,
                    OutgoingRequestSent = 3,
                    Established = 4
                }
            }

            interface IConversation {
                publicKey?: (string|null);
                displayName?: (string|null);
            }

            class Conversation implements IConversation {

                public publicKey: string;
                public displayName: string;
                public static create(properties?: berty.messenger.v1.IConversation): berty.messenger.v1.Conversation;
                public static encode(message: berty.messenger.v1.IConversation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IConversation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.Conversation;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.Conversation;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.Conversation;
                public static toObject(message: berty.messenger.v1.Conversation, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IMember {
                publicKey?: (string|null);
                displayName?: (string|null);
                givenName?: (string|null);
            }

            class Member implements IMember {

                public publicKey: string;
                public displayName: string;
                public givenName: string;
                public static create(properties?: berty.messenger.v1.IMember): berty.messenger.v1.Member;
                public static encode(message: berty.messenger.v1.IMember, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IMember, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.Member;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.Member;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.Member;
                public static toObject(message: berty.messenger.v1.Member, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IDevice {
                publicKey?: (string|null);
            }

            class Device implements IDevice {

                public publicKey: string;
                public static create(properties?: berty.messenger.v1.IDevice): berty.messenger.v1.Device;
                public static encode(message: berty.messenger.v1.IDevice, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IDevice, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.Device;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.Device;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.Device;
                public static toObject(message: berty.messenger.v1.Device, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IStreamEvent {
                type?: (berty.messenger.v1.StreamEvent.Type|null);
                payload?: (Uint8Array|null);
            }

            class StreamEvent implements IStreamEvent {

                public type: berty.messenger.v1.StreamEvent.Type;
                public payload: Uint8Array;
                public static create(properties?: berty.messenger.v1.IStreamEvent): berty.messenger.v1.StreamEvent;
                public static encode(message: berty.messenger.v1.IStreamEvent, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IStreamEvent, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.StreamEvent;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.StreamEvent;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.StreamEvent;
                public static toObject(message: berty.messenger.v1.StreamEvent, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace StreamEvent {

                enum Type {
                    TypeConversationUpdated = 0,
                    TypeConversationDeleted = 1,
                    TypeInteractionUpdated = 2,
                    TypeContactUpdated = 3
                }

                interface IConversationUpdated {
                    conversation?: (berty.messenger.v1.IConversation|null);
                }

                class ConversationUpdated implements IConversationUpdated {

                    public conversation?: (berty.messenger.v1.IConversation|null);
                    public static create(properties?: berty.messenger.v1.StreamEvent.IConversationUpdated): berty.messenger.v1.StreamEvent.ConversationUpdated;
                    public static encode(message: berty.messenger.v1.StreamEvent.IConversationUpdated, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.StreamEvent.IConversationUpdated, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.StreamEvent.ConversationUpdated;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.StreamEvent.ConversationUpdated;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.StreamEvent.ConversationUpdated;
                    public static toObject(message: berty.messenger.v1.StreamEvent.ConversationUpdated, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IConversationDeleted {
                    publicKey?: (string|null);
                }

                class ConversationDeleted implements IConversationDeleted {

                    public publicKey: string;
                    public static create(properties?: berty.messenger.v1.StreamEvent.IConversationDeleted): berty.messenger.v1.StreamEvent.ConversationDeleted;
                    public static encode(message: berty.messenger.v1.StreamEvent.IConversationDeleted, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.StreamEvent.IConversationDeleted, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.StreamEvent.ConversationDeleted;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.StreamEvent.ConversationDeleted;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.StreamEvent.ConversationDeleted;
                    public static toObject(message: berty.messenger.v1.StreamEvent.ConversationDeleted, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IInteractionUpdated {
                }

                class InteractionUpdated implements IInteractionUpdated {

                    public static create(properties?: berty.messenger.v1.StreamEvent.IInteractionUpdated): berty.messenger.v1.StreamEvent.InteractionUpdated;
                    public static encode(message: berty.messenger.v1.StreamEvent.IInteractionUpdated, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.StreamEvent.IInteractionUpdated, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.StreamEvent.InteractionUpdated;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.StreamEvent.InteractionUpdated;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.StreamEvent.InteractionUpdated;
                    public static toObject(message: berty.messenger.v1.StreamEvent.InteractionUpdated, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IContactUpdated {
                    contact?: (berty.messenger.v1.IContact|null);
                }

                class ContactUpdated implements IContactUpdated {

                    public contact?: (berty.messenger.v1.IContact|null);
                    public static create(properties?: berty.messenger.v1.StreamEvent.IContactUpdated): berty.messenger.v1.StreamEvent.ContactUpdated;
                    public static encode(message: berty.messenger.v1.StreamEvent.IContactUpdated, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.StreamEvent.IContactUpdated, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.StreamEvent.ContactUpdated;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.StreamEvent.ContactUpdated;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.StreamEvent.ContactUpdated;
                    public static toObject(message: berty.messenger.v1.StreamEvent.ContactUpdated, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IConversationStream {
            }

            class ConversationStream implements IConversationStream {

                public static create(properties?: berty.messenger.v1.IConversationStream): berty.messenger.v1.ConversationStream;
                public static encode(message: berty.messenger.v1.IConversationStream, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IConversationStream, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.ConversationStream;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.ConversationStream;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.ConversationStream;
                public static toObject(message: berty.messenger.v1.ConversationStream, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ConversationStream {

                interface IRequest {
                    count?: (number|Long|null);
                    page?: (number|Long|null);
                }

                class Request implements IRequest {

                    public count: (number|Long);
                    public page: (number|Long);
                    public static create(properties?: berty.messenger.v1.ConversationStream.IRequest): berty.messenger.v1.ConversationStream.Request;
                    public static encode(message: berty.messenger.v1.ConversationStream.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.ConversationStream.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.ConversationStream.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.ConversationStream.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.ConversationStream.Request;
                    public static toObject(message: berty.messenger.v1.ConversationStream.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    conversation?: (berty.messenger.v1.IConversation|null);
                }

                class Reply implements IReply {

                    public conversation?: (berty.messenger.v1.IConversation|null);
                    public static create(properties?: berty.messenger.v1.ConversationStream.IReply): berty.messenger.v1.ConversationStream.Reply;
                    public static encode(message: berty.messenger.v1.ConversationStream.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.ConversationStream.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.ConversationStream.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.ConversationStream.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.ConversationStream.Reply;
                    public static toObject(message: berty.messenger.v1.ConversationStream.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IConversationCreate {
            }

            class ConversationCreate implements IConversationCreate {

                public static create(properties?: berty.messenger.v1.IConversationCreate): berty.messenger.v1.ConversationCreate;
                public static encode(message: berty.messenger.v1.IConversationCreate, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IConversationCreate, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.ConversationCreate;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.ConversationCreate;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.ConversationCreate;
                public static toObject(message: berty.messenger.v1.ConversationCreate, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace ConversationCreate {

                interface IRequest {
                    displayName?: (string|null);
                }

                class Request implements IRequest {

                    public displayName: string;
                    public static create(properties?: berty.messenger.v1.ConversationCreate.IRequest): berty.messenger.v1.ConversationCreate.Request;
                    public static encode(message: berty.messenger.v1.ConversationCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.ConversationCreate.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.ConversationCreate.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.ConversationCreate.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.ConversationCreate.Request;
                    public static toObject(message: berty.messenger.v1.ConversationCreate.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    publicKey?: (string|null);
                }

                class Reply implements IReply {

                    public publicKey: string;
                    public static create(properties?: berty.messenger.v1.ConversationCreate.IReply): berty.messenger.v1.ConversationCreate.Reply;
                    public static encode(message: berty.messenger.v1.ConversationCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.ConversationCreate.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.ConversationCreate.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.ConversationCreate.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.ConversationCreate.Reply;
                    public static toObject(message: berty.messenger.v1.ConversationCreate.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IAccountGet {
            }

            class AccountGet implements IAccountGet {

                public static create(properties?: berty.messenger.v1.IAccountGet): berty.messenger.v1.AccountGet;
                public static encode(message: berty.messenger.v1.IAccountGet, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IAccountGet, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.AccountGet;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.AccountGet;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.AccountGet;
                public static toObject(message: berty.messenger.v1.AccountGet, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace AccountGet {

                interface IRequest {
                }

                class Request implements IRequest {

                    public static create(properties?: berty.messenger.v1.AccountGet.IRequest): berty.messenger.v1.AccountGet.Request;
                    public static encode(message: berty.messenger.v1.AccountGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.AccountGet.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.AccountGet.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.AccountGet.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.AccountGet.Request;
                    public static toObject(message: berty.messenger.v1.AccountGet.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    account?: (berty.messenger.v1.IAccount|null);
                }

                class Reply implements IReply {

                    public account?: (berty.messenger.v1.IAccount|null);
                    public static create(properties?: berty.messenger.v1.AccountGet.IReply): berty.messenger.v1.AccountGet.Reply;
                    public static encode(message: berty.messenger.v1.AccountGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.AccountGet.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.AccountGet.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.AccountGet.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.AccountGet.Reply;
                    public static toObject(message: berty.messenger.v1.AccountGet.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IEventStream {
            }

            class EventStream implements IEventStream {

                public static create(properties?: berty.messenger.v1.IEventStream): berty.messenger.v1.EventStream;
                public static encode(message: berty.messenger.v1.IEventStream, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IEventStream, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.EventStream;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.EventStream;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.EventStream;
                public static toObject(message: berty.messenger.v1.EventStream, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            namespace EventStream {

                interface IRequest {
                    count?: (number|Long|null);
                    page?: (number|Long|null);
                }

                class Request implements IRequest {

                    public count: (number|Long);
                    public page: (number|Long);
                    public static create(properties?: berty.messenger.v1.EventStream.IRequest): berty.messenger.v1.EventStream.Request;
                    public static encode(message: berty.messenger.v1.EventStream.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.EventStream.IRequest, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.EventStream.Request;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.EventStream.Request;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.EventStream.Request;
                    public static toObject(message: berty.messenger.v1.EventStream.Request, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }

                interface IReply {
                    event?: (berty.messenger.v1.IStreamEvent|null);
                }

                class Reply implements IReply {

                    public event?: (berty.messenger.v1.IStreamEvent|null);
                    public static create(properties?: berty.messenger.v1.EventStream.IReply): berty.messenger.v1.EventStream.Reply;
                    public static encode(message: berty.messenger.v1.EventStream.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static encodeDelimited(message: berty.messenger.v1.EventStream.IReply, writer?: $protobuf.Writer): $protobuf.Writer;
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.EventStream.Reply;
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.EventStream.Reply;
                    public static verify(message: { [k: string]: any }): (string|null);
                    public static fromObject(object: { [k: string]: any }): berty.messenger.v1.EventStream.Reply;
                    public static toObject(message: berty.messenger.v1.EventStream.Reply, options?: $protobuf.IConversionOptions): { [k: string]: any };
                    public toJSON(): { [k: string]: any };
                }
            }

            interface IContactMetadata {
                displayName?: (string|null);
            }

            class ContactMetadata implements IContactMetadata {

                public displayName: string;
                public static create(properties?: berty.messenger.v1.IContactMetadata): berty.messenger.v1.ContactMetadata;
                public static encode(message: berty.messenger.v1.IContactMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: berty.messenger.v1.IContactMetadata, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): berty.messenger.v1.ContactMetadata;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): berty.messenger.v1.ContactMetadata;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): berty.messenger.v1.ContactMetadata;
                public static toObject(message: berty.messenger.v1.ContactMetadata, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }
    }
}

export namespace google {

    namespace protobuf {

        interface IFileDescriptorSet {
            file?: (google.protobuf.IFileDescriptorProto[]|null);
        }

        class FileDescriptorSet implements IFileDescriptorSet {

            public file: google.protobuf.IFileDescriptorProto[];
            public static create(properties?: google.protobuf.IFileDescriptorSet): google.protobuf.FileDescriptorSet;
            public static encode(message: google.protobuf.IFileDescriptorSet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFileDescriptorSet, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileDescriptorSet;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileDescriptorSet;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorSet;
            public static toObject(message: google.protobuf.FileDescriptorSet, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IFileDescriptorProto {
            name?: (string|null);
            "package"?: (string|null);
            dependency?: (string[]|null);
            publicDependency?: (number[]|null);
            weakDependency?: (number[]|null);
            messageType?: (google.protobuf.IDescriptorProto[]|null);
            enumType?: (google.protobuf.IEnumDescriptorProto[]|null);
            service?: (google.protobuf.IServiceDescriptorProto[]|null);
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);
            options?: (google.protobuf.IFileOptions|null);
            sourceCodeInfo?: (google.protobuf.ISourceCodeInfo|null);
            syntax?: (string|null);
        }

        class FileDescriptorProto implements IFileDescriptorProto {

            public name: string;
            public package: string;
            public dependency: string[];
            public publicDependency: number[];
            public weakDependency: number[];
            public messageType: google.protobuf.IDescriptorProto[];
            public enumType: google.protobuf.IEnumDescriptorProto[];
            public service: google.protobuf.IServiceDescriptorProto[];
            public extension: google.protobuf.IFieldDescriptorProto[];
            public options?: (google.protobuf.IFileOptions|null);
            public sourceCodeInfo?: (google.protobuf.ISourceCodeInfo|null);
            public syntax: string;
            public static create(properties?: google.protobuf.IFileDescriptorProto): google.protobuf.FileDescriptorProto;
            public static encode(message: google.protobuf.IFileDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFileDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileDescriptorProto;
            public static toObject(message: google.protobuf.FileDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IDescriptorProto {
            name?: (string|null);
            field?: (google.protobuf.IFieldDescriptorProto[]|null);
            extension?: (google.protobuf.IFieldDescriptorProto[]|null);
            nestedType?: (google.protobuf.IDescriptorProto[]|null);
            enumType?: (google.protobuf.IEnumDescriptorProto[]|null);
            extensionRange?: (google.protobuf.DescriptorProto.IExtensionRange[]|null);
            oneofDecl?: (google.protobuf.IOneofDescriptorProto[]|null);
            options?: (google.protobuf.IMessageOptions|null);
            reservedRange?: (google.protobuf.DescriptorProto.IReservedRange[]|null);
            reservedName?: (string[]|null);
        }

        class DescriptorProto implements IDescriptorProto {

            public name: string;
            public field: google.protobuf.IFieldDescriptorProto[];
            public extension: google.protobuf.IFieldDescriptorProto[];
            public nestedType: google.protobuf.IDescriptorProto[];
            public enumType: google.protobuf.IEnumDescriptorProto[];
            public extensionRange: google.protobuf.DescriptorProto.IExtensionRange[];
            public oneofDecl: google.protobuf.IOneofDescriptorProto[];
            public options?: (google.protobuf.IMessageOptions|null);
            public reservedRange: google.protobuf.DescriptorProto.IReservedRange[];
            public reservedName: string[];
            public static create(properties?: google.protobuf.IDescriptorProto): google.protobuf.DescriptorProto;
            public static encode(message: google.protobuf.IDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto;
            public static toObject(message: google.protobuf.DescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace DescriptorProto {

            interface IExtensionRange {
                start?: (number|null);
                end?: (number|null);
                options?: (google.protobuf.IExtensionRangeOptions|null);
            }

            class ExtensionRange implements IExtensionRange {

                public start: number;
                public end: number;
                public options?: (google.protobuf.IExtensionRangeOptions|null);
                public static create(properties?: google.protobuf.DescriptorProto.IExtensionRange): google.protobuf.DescriptorProto.ExtensionRange;
                public static encode(message: google.protobuf.DescriptorProto.IExtensionRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.DescriptorProto.IExtensionRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto.ExtensionRange;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto.ExtensionRange;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ExtensionRange;
                public static toObject(message: google.protobuf.DescriptorProto.ExtensionRange, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }

            interface IReservedRange {
                start?: (number|null);
                end?: (number|null);
            }

            class ReservedRange implements IReservedRange {

                public start: number;
                public end: number;
                public static create(properties?: google.protobuf.DescriptorProto.IReservedRange): google.protobuf.DescriptorProto.ReservedRange;
                public static encode(message: google.protobuf.DescriptorProto.IReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.DescriptorProto.IReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.DescriptorProto.ReservedRange;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.DescriptorProto.ReservedRange;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.DescriptorProto.ReservedRange;
                public static toObject(message: google.protobuf.DescriptorProto.ReservedRange, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IExtensionRangeOptions {
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        class ExtensionRangeOptions implements IExtensionRangeOptions {

            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IExtensionRangeOptions): google.protobuf.ExtensionRangeOptions;
            public static encode(message: google.protobuf.IExtensionRangeOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IExtensionRangeOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ExtensionRangeOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ExtensionRangeOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.ExtensionRangeOptions;
            public static toObject(message: google.protobuf.ExtensionRangeOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IFieldDescriptorProto {
            name?: (string|null);
            number?: (number|null);
            label?: (google.protobuf.FieldDescriptorProto.Label|null);
            type?: (google.protobuf.FieldDescriptorProto.Type|null);
            typeName?: (string|null);
            extendee?: (string|null);
            defaultValue?: (string|null);
            oneofIndex?: (number|null);
            jsonName?: (string|null);
            options?: (google.protobuf.IFieldOptions|null);
        }

        class FieldDescriptorProto implements IFieldDescriptorProto {

            public name: string;
            public number: number;
            public label: google.protobuf.FieldDescriptorProto.Label;
            public type: google.protobuf.FieldDescriptorProto.Type;
            public typeName: string;
            public extendee: string;
            public defaultValue: string;
            public oneofIndex: number;
            public jsonName: string;
            public options?: (google.protobuf.IFieldOptions|null);
            public static create(properties?: google.protobuf.IFieldDescriptorProto): google.protobuf.FieldDescriptorProto;
            public static encode(message: google.protobuf.IFieldDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFieldDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FieldDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FieldDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FieldDescriptorProto;
            public static toObject(message: google.protobuf.FieldDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace FieldDescriptorProto {

            enum Type {
                TYPE_DOUBLE = 1,
                TYPE_FLOAT = 2,
                TYPE_INT64 = 3,
                TYPE_UINT64 = 4,
                TYPE_INT32 = 5,
                TYPE_FIXED64 = 6,
                TYPE_FIXED32 = 7,
                TYPE_BOOL = 8,
                TYPE_STRING = 9,
                TYPE_GROUP = 10,
                TYPE_MESSAGE = 11,
                TYPE_BYTES = 12,
                TYPE_UINT32 = 13,
                TYPE_ENUM = 14,
                TYPE_SFIXED32 = 15,
                TYPE_SFIXED64 = 16,
                TYPE_SINT32 = 17,
                TYPE_SINT64 = 18
            }

            enum Label {
                LABEL_OPTIONAL = 1,
                LABEL_REQUIRED = 2,
                LABEL_REPEATED = 3
            }
        }

        interface IOneofDescriptorProto {
            name?: (string|null);
            options?: (google.protobuf.IOneofOptions|null);
        }

        class OneofDescriptorProto implements IOneofDescriptorProto {

            public name: string;
            public options?: (google.protobuf.IOneofOptions|null);
            public static create(properties?: google.protobuf.IOneofDescriptorProto): google.protobuf.OneofDescriptorProto;
            public static encode(message: google.protobuf.IOneofDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IOneofDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.OneofDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.OneofDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.OneofDescriptorProto;
            public static toObject(message: google.protobuf.OneofDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IEnumDescriptorProto {
            name?: (string|null);
            value?: (google.protobuf.IEnumValueDescriptorProto[]|null);
            options?: (google.protobuf.IEnumOptions|null);
            reservedRange?: (google.protobuf.EnumDescriptorProto.IEnumReservedRange[]|null);
            reservedName?: (string[]|null);
        }

        class EnumDescriptorProto implements IEnumDescriptorProto {

            public name: string;
            public value: google.protobuf.IEnumValueDescriptorProto[];
            public options?: (google.protobuf.IEnumOptions|null);
            public reservedRange: google.protobuf.EnumDescriptorProto.IEnumReservedRange[];
            public reservedName: string[];
            public static create(properties?: google.protobuf.IEnumDescriptorProto): google.protobuf.EnumDescriptorProto;
            public static encode(message: google.protobuf.IEnumDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IEnumDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumDescriptorProto;
            public static toObject(message: google.protobuf.EnumDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace EnumDescriptorProto {

            interface IEnumReservedRange {
                start?: (number|null);
                end?: (number|null);
            }

            class EnumReservedRange implements IEnumReservedRange {

                public start: number;
                public end: number;
                public static create(properties?: google.protobuf.EnumDescriptorProto.IEnumReservedRange): google.protobuf.EnumDescriptorProto.EnumReservedRange;
                public static encode(message: google.protobuf.EnumDescriptorProto.IEnumReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.EnumDescriptorProto.IEnumReservedRange, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumDescriptorProto.EnumReservedRange;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumDescriptorProto.EnumReservedRange;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.EnumDescriptorProto.EnumReservedRange;
                public static toObject(message: google.protobuf.EnumDescriptorProto.EnumReservedRange, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IEnumValueDescriptorProto {
            name?: (string|null);
            number?: (number|null);
            options?: (google.protobuf.IEnumValueOptions|null);
        }

        class EnumValueDescriptorProto implements IEnumValueDescriptorProto {

            public name: string;
            public number: number;
            public options?: (google.protobuf.IEnumValueOptions|null);
            public static create(properties?: google.protobuf.IEnumValueDescriptorProto): google.protobuf.EnumValueDescriptorProto;
            public static encode(message: google.protobuf.IEnumValueDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IEnumValueDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumValueDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumValueDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueDescriptorProto;
            public static toObject(message: google.protobuf.EnumValueDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IServiceDescriptorProto {
            name?: (string|null);
            method?: (google.protobuf.IMethodDescriptorProto[]|null);
            options?: (google.protobuf.IServiceOptions|null);
        }

        class ServiceDescriptorProto implements IServiceDescriptorProto {

            public name: string;
            public method: google.protobuf.IMethodDescriptorProto[];
            public options?: (google.protobuf.IServiceOptions|null);
            public static create(properties?: google.protobuf.IServiceDescriptorProto): google.protobuf.ServiceDescriptorProto;
            public static encode(message: google.protobuf.IServiceDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IServiceDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ServiceDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ServiceDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceDescriptorProto;
            public static toObject(message: google.protobuf.ServiceDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMethodDescriptorProto {
            name?: (string|null);
            inputType?: (string|null);
            outputType?: (string|null);
            options?: (google.protobuf.IMethodOptions|null);
            clientStreaming?: (boolean|null);
            serverStreaming?: (boolean|null);
        }

        class MethodDescriptorProto implements IMethodDescriptorProto {

            public name: string;
            public inputType: string;
            public outputType: string;
            public options?: (google.protobuf.IMethodOptions|null);
            public clientStreaming: boolean;
            public serverStreaming: boolean;
            public static create(properties?: google.protobuf.IMethodDescriptorProto): google.protobuf.MethodDescriptorProto;
            public static encode(message: google.protobuf.IMethodDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IMethodDescriptorProto, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MethodDescriptorProto;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MethodDescriptorProto;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.MethodDescriptorProto;
            public static toObject(message: google.protobuf.MethodDescriptorProto, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IFileOptions {
            javaPackage?: (string|null);
            javaOuterClassname?: (string|null);
            javaMultipleFiles?: (boolean|null);
            javaGenerateEqualsAndHash?: (boolean|null);
            javaStringCheckUtf8?: (boolean|null);
            optimizeFor?: (google.protobuf.FileOptions.OptimizeMode|null);
            goPackage?: (string|null);
            ccGenericServices?: (boolean|null);
            javaGenericServices?: (boolean|null);
            pyGenericServices?: (boolean|null);
            phpGenericServices?: (boolean|null);
            deprecated?: (boolean|null);
            ccEnableArenas?: (boolean|null);
            objcClassPrefix?: (string|null);
            csharpNamespace?: (string|null);
            swiftPrefix?: (string|null);
            phpClassPrefix?: (string|null);
            phpNamespace?: (string|null);
            phpMetadataNamespace?: (string|null);
            rubyPackage?: (string|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.goprotoGettersAll"?: (boolean|null);
            ".gogoproto.goprotoEnumPrefixAll"?: (boolean|null);
            ".gogoproto.goprotoStringerAll"?: (boolean|null);
            ".gogoproto.verboseEqualAll"?: (boolean|null);
            ".gogoproto.faceAll"?: (boolean|null);
            ".gogoproto.gostringAll"?: (boolean|null);
            ".gogoproto.populateAll"?: (boolean|null);
            ".gogoproto.stringerAll"?: (boolean|null);
            ".gogoproto.onlyoneAll"?: (boolean|null);
            ".gogoproto.equalAll"?: (boolean|null);
            ".gogoproto.descriptionAll"?: (boolean|null);
            ".gogoproto.testgenAll"?: (boolean|null);
            ".gogoproto.benchgenAll"?: (boolean|null);
            ".gogoproto.marshalerAll"?: (boolean|null);
            ".gogoproto.unmarshalerAll"?: (boolean|null);
            ".gogoproto.stableMarshalerAll"?: (boolean|null);
            ".gogoproto.sizerAll"?: (boolean|null);
            ".gogoproto.goprotoEnumStringerAll"?: (boolean|null);
            ".gogoproto.enumStringerAll"?: (boolean|null);
            ".gogoproto.unsafeMarshalerAll"?: (boolean|null);
            ".gogoproto.unsafeUnmarshalerAll"?: (boolean|null);
            ".gogoproto.goprotoExtensionsMapAll"?: (boolean|null);
            ".gogoproto.goprotoUnrecognizedAll"?: (boolean|null);
            ".gogoproto.gogoprotoImport"?: (boolean|null);
            ".gogoproto.protosizerAll"?: (boolean|null);
            ".gogoproto.compareAll"?: (boolean|null);
            ".gogoproto.typedeclAll"?: (boolean|null);
            ".gogoproto.enumdeclAll"?: (boolean|null);
            ".gogoproto.goprotoRegistration"?: (boolean|null);
            ".gogoproto.messagenameAll"?: (boolean|null);
            ".gogoproto.goprotoSizecacheAll"?: (boolean|null);
            ".gogoproto.goprotoUnkeyedAll"?: (boolean|null);
        }

        class FileOptions implements IFileOptions {

            public javaPackage: string;
            public javaOuterClassname: string;
            public javaMultipleFiles: boolean;
            public javaGenerateEqualsAndHash: boolean;
            public javaStringCheckUtf8: boolean;
            public optimizeFor: google.protobuf.FileOptions.OptimizeMode;
            public goPackage: string;
            public ccGenericServices: boolean;
            public javaGenericServices: boolean;
            public pyGenericServices: boolean;
            public phpGenericServices: boolean;
            public deprecated: boolean;
            public ccEnableArenas: boolean;
            public objcClassPrefix: string;
            public csharpNamespace: string;
            public swiftPrefix: string;
            public phpClassPrefix: string;
            public phpNamespace: string;
            public phpMetadataNamespace: string;
            public rubyPackage: string;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IFileOptions): google.protobuf.FileOptions;
            public static encode(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFileOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FileOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FileOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FileOptions;
            public static toObject(message: google.protobuf.FileOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace FileOptions {

            enum OptimizeMode {
                SPEED = 1,
                CODE_SIZE = 2,
                LITE_RUNTIME = 3
            }
        }

        interface IMessageOptions {
            messageSetWireFormat?: (boolean|null);
            noStandardDescriptorAccessor?: (boolean|null);
            deprecated?: (boolean|null);
            mapEntry?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.goprotoGetters"?: (boolean|null);
            ".gogoproto.goprotoStringer"?: (boolean|null);
            ".gogoproto.verboseEqual"?: (boolean|null);
            ".gogoproto.face"?: (boolean|null);
            ".gogoproto.gostring"?: (boolean|null);
            ".gogoproto.populate"?: (boolean|null);
            ".gogoproto.stringer"?: (boolean|null);
            ".gogoproto.onlyone"?: (boolean|null);
            ".gogoproto.equal"?: (boolean|null);
            ".gogoproto.description"?: (boolean|null);
            ".gogoproto.testgen"?: (boolean|null);
            ".gogoproto.benchgen"?: (boolean|null);
            ".gogoproto.marshaler"?: (boolean|null);
            ".gogoproto.unmarshaler"?: (boolean|null);
            ".gogoproto.stableMarshaler"?: (boolean|null);
            ".gogoproto.sizer"?: (boolean|null);
            ".gogoproto.unsafeMarshaler"?: (boolean|null);
            ".gogoproto.unsafeUnmarshaler"?: (boolean|null);
            ".gogoproto.goprotoExtensionsMap"?: (boolean|null);
            ".gogoproto.goprotoUnrecognized"?: (boolean|null);
            ".gogoproto.protosizer"?: (boolean|null);
            ".gogoproto.compare"?: (boolean|null);
            ".gogoproto.typedecl"?: (boolean|null);
            ".gogoproto.messagename"?: (boolean|null);
            ".gogoproto.goprotoSizecache"?: (boolean|null);
            ".gogoproto.goprotoUnkeyed"?: (boolean|null);
        }

        class MessageOptions implements IMessageOptions {

            public messageSetWireFormat: boolean;
            public noStandardDescriptorAccessor: boolean;
            public deprecated: boolean;
            public mapEntry: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IMessageOptions): google.protobuf.MessageOptions;
            public static encode(message: google.protobuf.IMessageOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IMessageOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MessageOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MessageOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.MessageOptions;
            public static toObject(message: google.protobuf.MessageOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IFieldOptions {
            ctype?: (google.protobuf.FieldOptions.CType|null);
            packed?: (boolean|null);
            jstype?: (google.protobuf.FieldOptions.JSType|null);
            lazy?: (boolean|null);
            deprecated?: (boolean|null);
            weak?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.nullable"?: (boolean|null);
            ".gogoproto.embed"?: (boolean|null);
            ".gogoproto.customtype"?: (string|null);
            ".gogoproto.customname"?: (string|null);
            ".gogoproto.jsontag"?: (string|null);
            ".gogoproto.moretags"?: (string|null);
            ".gogoproto.casttype"?: (string|null);
            ".gogoproto.castkey"?: (string|null);
            ".gogoproto.castvalue"?: (string|null);
            ".gogoproto.stdtime"?: (boolean|null);
            ".gogoproto.stdduration"?: (boolean|null);
            ".gogoproto.wktpointer"?: (boolean|null);
        }

        class FieldOptions implements IFieldOptions {

            public ctype: google.protobuf.FieldOptions.CType;
            public packed: boolean;
            public jstype: google.protobuf.FieldOptions.JSType;
            public lazy: boolean;
            public deprecated: boolean;
            public weak: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IFieldOptions): google.protobuf.FieldOptions;
            public static encode(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IFieldOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.FieldOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.FieldOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.FieldOptions;
            public static toObject(message: google.protobuf.FieldOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace FieldOptions {

            enum CType {
                STRING = 0,
                CORD = 1,
                STRING_PIECE = 2
            }

            enum JSType {
                JS_NORMAL = 0,
                JS_STRING = 1,
                JS_NUMBER = 2
            }
        }

        interface IOneofOptions {
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        class OneofOptions implements IOneofOptions {

            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IOneofOptions): google.protobuf.OneofOptions;
            public static encode(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IOneofOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.OneofOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.OneofOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.OneofOptions;
            public static toObject(message: google.protobuf.OneofOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IEnumOptions {
            allowAlias?: (boolean|null);
            deprecated?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.goprotoEnumPrefix"?: (boolean|null);
            ".gogoproto.goprotoEnumStringer"?: (boolean|null);
            ".gogoproto.enumStringer"?: (boolean|null);
            ".gogoproto.enumCustomname"?: (string|null);
            ".gogoproto.enumdecl"?: (boolean|null);
        }

        class EnumOptions implements IEnumOptions {

            public allowAlias: boolean;
            public deprecated: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IEnumOptions): google.protobuf.EnumOptions;
            public static encode(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IEnumOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumOptions;
            public static toObject(message: google.protobuf.EnumOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IEnumValueOptions {
            deprecated?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
            ".gogoproto.enumvalueCustomname"?: (string|null);
        }

        class EnumValueOptions implements IEnumValueOptions {

            public deprecated: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IEnumValueOptions): google.protobuf.EnumValueOptions;
            public static encode(message: google.protobuf.IEnumValueOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IEnumValueOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.EnumValueOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.EnumValueOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.EnumValueOptions;
            public static toObject(message: google.protobuf.EnumValueOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IServiceOptions {
            deprecated?: (boolean|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        class ServiceOptions implements IServiceOptions {

            public deprecated: boolean;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IServiceOptions): google.protobuf.ServiceOptions;
            public static encode(message: google.protobuf.IServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IServiceOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.ServiceOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.ServiceOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.ServiceOptions;
            public static toObject(message: google.protobuf.ServiceOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        interface IMethodOptions {
            deprecated?: (boolean|null);
            idempotencyLevel?: (google.protobuf.MethodOptions.IdempotencyLevel|null);
            uninterpretedOption?: (google.protobuf.IUninterpretedOption[]|null);
        }

        class MethodOptions implements IMethodOptions {

            public deprecated: boolean;
            public idempotencyLevel: google.protobuf.MethodOptions.IdempotencyLevel;
            public uninterpretedOption: google.protobuf.IUninterpretedOption[];
            public static create(properties?: google.protobuf.IMethodOptions): google.protobuf.MethodOptions;
            public static encode(message: google.protobuf.IMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IMethodOptions, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.MethodOptions;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.MethodOptions;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.MethodOptions;
            public static toObject(message: google.protobuf.MethodOptions, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace MethodOptions {

            enum IdempotencyLevel {
                IDEMPOTENCY_UNKNOWN = 0,
                NO_SIDE_EFFECTS = 1,
                IDEMPOTENT = 2
            }
        }

        interface IUninterpretedOption {
            name?: (google.protobuf.UninterpretedOption.INamePart[]|null);
            identifierValue?: (string|null);
            positiveIntValue?: (number|Long|null);
            negativeIntValue?: (number|Long|null);
            doubleValue?: (number|null);
            stringValue?: (Uint8Array|null);
            aggregateValue?: (string|null);
        }

        class UninterpretedOption implements IUninterpretedOption {

            public name: google.protobuf.UninterpretedOption.INamePart[];
            public identifierValue: string;
            public positiveIntValue: (number|Long);
            public negativeIntValue: (number|Long);
            public doubleValue: number;
            public stringValue: Uint8Array;
            public aggregateValue: string;
            public static create(properties?: google.protobuf.IUninterpretedOption): google.protobuf.UninterpretedOption;
            public static encode(message: google.protobuf.IUninterpretedOption, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IUninterpretedOption, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UninterpretedOption;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UninterpretedOption;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption;
            public static toObject(message: google.protobuf.UninterpretedOption, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace UninterpretedOption {

            interface INamePart {
                namePart: string;
                isExtension: boolean;
            }

            class NamePart implements INamePart {

                public namePart: string;
                public isExtension: boolean;
                public static create(properties?: google.protobuf.UninterpretedOption.INamePart): google.protobuf.UninterpretedOption.NamePart;
                public static encode(message: google.protobuf.UninterpretedOption.INamePart, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.UninterpretedOption.INamePart, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.UninterpretedOption.NamePart;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.UninterpretedOption.NamePart;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.UninterpretedOption.NamePart;
                public static toObject(message: google.protobuf.UninterpretedOption.NamePart, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface ISourceCodeInfo {
            location?: (google.protobuf.SourceCodeInfo.ILocation[]|null);
        }

        class SourceCodeInfo implements ISourceCodeInfo {

            public location: google.protobuf.SourceCodeInfo.ILocation[];
            public static create(properties?: google.protobuf.ISourceCodeInfo): google.protobuf.SourceCodeInfo;
            public static encode(message: google.protobuf.ISourceCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.ISourceCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.SourceCodeInfo;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.SourceCodeInfo;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo;
            public static toObject(message: google.protobuf.SourceCodeInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace SourceCodeInfo {

            interface ILocation {
                path?: (number[]|null);
                span?: (number[]|null);
                leadingComments?: (string|null);
                trailingComments?: (string|null);
                leadingDetachedComments?: (string[]|null);
            }

            class Location implements ILocation {

                public path: number[];
                public span: number[];
                public leadingComments: string;
                public trailingComments: string;
                public leadingDetachedComments: string[];
                public static create(properties?: google.protobuf.SourceCodeInfo.ILocation): google.protobuf.SourceCodeInfo.Location;
                public static encode(message: google.protobuf.SourceCodeInfo.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.SourceCodeInfo.ILocation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.SourceCodeInfo.Location;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.SourceCodeInfo.Location;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.SourceCodeInfo.Location;
                public static toObject(message: google.protobuf.SourceCodeInfo.Location, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }

        interface IGeneratedCodeInfo {
            annotation?: (google.protobuf.GeneratedCodeInfo.IAnnotation[]|null);
        }

        class GeneratedCodeInfo implements IGeneratedCodeInfo {

            public annotation: google.protobuf.GeneratedCodeInfo.IAnnotation[];
            public static create(properties?: google.protobuf.IGeneratedCodeInfo): google.protobuf.GeneratedCodeInfo;
            public static encode(message: google.protobuf.IGeneratedCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static encodeDelimited(message: google.protobuf.IGeneratedCodeInfo, writer?: $protobuf.Writer): $protobuf.Writer;
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.GeneratedCodeInfo;
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.GeneratedCodeInfo;
            public static verify(message: { [k: string]: any }): (string|null);
            public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo;
            public static toObject(message: google.protobuf.GeneratedCodeInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };
            public toJSON(): { [k: string]: any };
        }

        namespace GeneratedCodeInfo {

            interface IAnnotation {
                path?: (number[]|null);
                sourceFile?: (string|null);
                begin?: (number|null);
                end?: (number|null);
            }

            class Annotation implements IAnnotation {

                public path: number[];
                public sourceFile: string;
                public begin: number;
                public end: number;
                public static create(properties?: google.protobuf.GeneratedCodeInfo.IAnnotation): google.protobuf.GeneratedCodeInfo.Annotation;
                public static encode(message: google.protobuf.GeneratedCodeInfo.IAnnotation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static encodeDelimited(message: google.protobuf.GeneratedCodeInfo.IAnnotation, writer?: $protobuf.Writer): $protobuf.Writer;
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.GeneratedCodeInfo.Annotation;
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.GeneratedCodeInfo.Annotation;
                public static verify(message: { [k: string]: any }): (string|null);
                public static fromObject(object: { [k: string]: any }): google.protobuf.GeneratedCodeInfo.Annotation;
                public static toObject(message: google.protobuf.GeneratedCodeInfo.Annotation, options?: $protobuf.IConversionOptions): { [k: string]: any };
                public toJSON(): { [k: string]: any };
            }
        }
    }
}
